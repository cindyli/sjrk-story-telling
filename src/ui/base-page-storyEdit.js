/*
Copyright 2018-2019 OCAD University
Licensed under the New BSD license. You may not use this file except in compliance with this licence.
You may obtain a copy of the BSD License at
https://raw.githubusercontent.com/fluid-project/sjrk-story-telling/master/LICENSE.txt
*/

/* global fluid, sjrk */

"use strict";

(function ($, fluid) {

    fluid.defaults("sjrk.storyTelling.base.page.storyEdit", {
        gradeNames: ["sjrk.storyTelling.base.page"],
        pageSetup: {
            hiddenEditorClass: "hidden"
        },
        model: {
            // the initial state is only the editor ui showing.
            // in much the same way as within the editor, the visibility
            // of the editor and previewer are mutually exclusive and
            // represented by a single model value, for the time being
            // the individual steps of the editor (editStoryStep and metadataStep)
            // are controlled within the editor model via editStoryStepVisible
            // in this way, the hiding and showing of the three steps of
            // the Edit page can be achieved
            editorVisible: true
        },
        modelListeners: {
            "editorVisible": [{
                this: "{storyEditor}.container",
                method: "toggle",
                args: ["{change}.value"],
                namespace: "manageEditorVisibility"
            },
            {
                this: "{storyPreviewer}.container",
                method: "toggle",
                args: ["@expand:sjrk.storyTelling.ui.storyEditor.not({change}.value)"],
                namespace: "managePreviewerVisibility",
                excludeSource: "init"
            },
            {
                func: "{that}.events.onContextChangeRequested.fire",
                args: ["{change}.value"],
                priority: "last",
                namespace: "contextChangeOnEditorVisibilityChange"
            }],
            "{storyEditor}.model.editStoryStepVisible": {
                func: "{that}.events.onContextChangeRequested.fire",
                args: ["{change}.value"],
                priority: "last",
                namespace: "contextChangeOnEditStoryStepVisibilityChange"
            }
        },
        selectors: {
            mainContainer: ".sjrkc-main-container",
            pageContainer: ".sjrk-edit-page-container"
        },
        events: {
            onAllUiComponentsReady: {
                events: {
                    onEditorReady: "{storyEditor}.events.onControlsBound",
                    onPreviewerReady: "{storyPreviewer}.events.onControlsBound"
                }
            },
            onStoryShareRequested: "{storyPreviewer}.events.onShareRequested",
            onStoryShareComplete: "{storyPreviewer}.events.onShareComplete"
        },
        listeners: {
            "onContextChangeRequested.updateStoryFromBlocks": {
                func: "{storyEditor}.events.onUpdateStoryFromBlocksRequested.fire",
                priority: "first"
            },
            "{storyEditor}.events.onStorySubmitRequested": [{
                func: "{storyPreviewer}.templateManager.renderTemplate",
                namespace: "previewerRenderTemplate"
            },
            {
                func: "{that}.showEditorHidePreviewer",
                args: [false],
                namespace: "hideEditorShowPreviewer"
            }],
            "{storyPreviewer}.events.onStoryViewerPreviousRequested": {
                func: "{that}.showEditorHidePreviewer",
                args: [true],
                namespace: "showEditorHidePreviewer"
            },
            "onStoryShareRequested.submitStory": {
                funcName: "sjrk.storyTelling.base.page.storyEdit.submitStory",
                args: ["{storyEditor}.dom.storyEditorForm", "{storyPreviewer}.story.model", "{that}.events.onStoryShareComplete"]
            },
            "onCreate.setEditorDisplay": {
                func: "{that}.setEditorDisplay"
            }
        },
        invokers: {
            setEditorDisplay: {
                funcName: "sjrk.storyTelling.base.page.storyEdit.setEditorDisplay",
                args: ["{that}.options.selectors.mainContainer", "{that}.options.selectors.pageContainer", "{that}.options.pageSetup.authoringEnabled", "{that}.options.pageSetup.hiddenEditorClass"]
            },
            showEditorHidePreviewer: {
                func: "{that}.applier.change",
                args: ["editorVisible", "{arguments}.0"]
            }
        },
        /*
         * For a block of a given type, a block is considered empty unless any
         * one of the values listed in the corresponding array is truthy
         */
        blockContentValues: {
            "text": ["heading", "text"],
            "image": ["imageUrl"],
            "audio": ["mediaUrl"],
            "video": ["mediaUrl"]
        },
        components: {
            // manaages browser history for in-page forward-back support
            historian: {
                type: "gpii.locationBar",
                options: {
                    model: {
                        editorVisible: "{storyEdit}.model.editorVisible",
                        editStoryStepVisible: "{storyEditor}.model.editStoryStepVisible"
                    },
                    modelToQuery: false,
                    queryToModel: false
                }
            },
            // the story editing context
            storyEditor: {
                type: "sjrk.storyTelling.ui.storyEditor",
                container: ".sjrkc-st-story-editor"
            },
            // the story safety and etiquette notice
            storyEtiquette: {
                type: "sjrk.storyTelling.ui",
                container: ".sjrkc-st-etiquette-container",
                options: {
                    components: {
                        templateManager: {
                            options: {
                                templateConfig: {
                                    templatePath: "%resourcePrefix/templates/etiquette.handlebars"
                                }
                            }
                        }
                    }
                }
            },
            // the story preview context
            storyPreviewer: {
                type: "sjrk.storyTelling.ui.storyPreviewer",
                container: ".sjrkc-st-story-previewer",
                options: {
                    components: {
                        story: {
                            options: {
                                model: "{storyEditor}.story.model",
                                modelRelay: {
                                    contentEmptyBlockFilter: {
                                        target: "content",
                                        singleTransform: {
                                            type: "fluid.transforms.free",
                                            func: "sjrk.storyTelling.base.page.storyEdit.removeEmptyBlocks",
                                            args: ["{storyPreviewer}.story.model.content", "{storyEdit}.options.blockContentValues"]
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    /* Removes all empty blocks from a given collection of story blocks
     * - "blocks": a collection of story blocks (sjrk.storyTelling.block)
     * - "blockContentValues": a hash map of block types which outlines the values
     *      that, if at least one is truthy, means a particular block is not empty
     */
    sjrk.storyTelling.base.page.storyEdit.removeEmptyBlocks = function (blocks, blockContentValues) {
        var filteredBlocks = [];

        fluid.each(blocks, function (block) {
            if (!sjrk.storyTelling.base.page.storyEdit.isEmptyBlock(block, blockContentValues[block.blockType])) {
                filteredBlocks.push(block);
            }
        });

        return filteredBlocks;
    };

    /* Returns true if a block is determined to be empty, based on the values
     * listed in blockContentValuesForType. If at least one of those values is
     * truthy, the block is not empty. If the values are empty or otherwise can't
     * be iterated over, then the block is also empty regardless of its contents.
     * - "block": a single story block (sjrk.storyTelling.block)
     * - "blockContentValuesForType": an array of values for the block's type
     *      that, if at least one is truthy, mean the block is not empty
     */
    sjrk.storyTelling.base.page.storyEdit.isEmptyBlock = function (block, blockContentValuesForType) {
        return !fluid.find_if(blockContentValuesForType, function (blockContentValue) {
            return !!block[blockContentValue];
        });
    };

    sjrk.storyTelling.base.page.storyEdit.setEditorDisplay = function (mainContainer, pageContainer, authoringEnabled, hiddenEditorClass) {
        $(mainContainer).prop("hidden", !authoringEnabled);
        $(pageContainer).toggleClass(hiddenEditorClass, !authoringEnabled);
    };

    sjrk.storyTelling.base.page.storyEdit.submitStory = function (storyEditorForm, storyModel, errorEvent) {
        storyEditorForm.attr({
            action: "/stories/",
            method: "post",
            enctype: "multipart/form-data"
        });

        // This is the easiest way to be able to submit form
        // content in the background via ajax
        var formData = new FormData(storyEditorForm[0]);

        // Stores the entire model as a JSON string in one
        // field of the multipart form
        var modelAsJSON = JSON.stringify(storyModel);
        formData.append("model", modelAsJSON);

        // In the real implementation, this should have
        // proper handling of feedback on success / failure,
        // but currently it just logs to console
        $.ajax({
            url         : storyEditorForm.attr("action"),
            data        : formData || storyEditorForm.serialize(),
            cache       : false,
            contentType : false,
            processData : false,
            type        : "POST",
            success     : function (data, textStatus, jqXHR) {
                fluid.log(jqXHR, textStatus);
                var successResponse = JSON.parse(data);
                var storyUrl = "/storyView.html?id=" + successResponse.id;
                window.location.assign(storyUrl);
            },
            error       : function (jqXHR, textStatus, errorThrown) {
                fluid.log("Something went wrong");
                fluid.log(jqXHR, textStatus, errorThrown);

                errorEvent.fire(fluid.get(jqXHR, ["responseJSON", "message"]) || "Internal server error");
            }
        });
    };

})(jQuery, fluid);
