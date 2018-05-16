/*
Copyright 2017-2018 OCAD University
Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.
You may obtain a copy of the ECL 2.0 License and BSD License at
https://raw.githubusercontent.com/fluid-project/sjrk-story-telling-server/master/LICENSE.txt
*/

fluid.defaults("sjrk.storyTelling.server.changeMenuLink", {
    distributeOptions: {
        target: "{that menu}.options.menuConfig.templateValues.menu_browseLinkUrl",
        record: "/storyBrowse.html"
    }
});

fluid.defaults("sjrk.storyTelling.server.changeTemplateConfigResourcePrefix", {
    distributeOptions: {
        target: "{that templateManager}.options.templateConfig.resourcePrefix",
        record: "/node_modules/sjrk-story-telling"
    }
});

fluid.defaults("sjrk.storyTelling.server.changeUIOTermsMessagePrefix", {
    distributeOptions: {
        target: "{that uio}.options.terms.messagePrefix",
        record: "/node_modules/sjrk-story-telling/src/messages/uio"
    }
});

fluid.defaults("sjrk.storyTelling.server.changeResourceLoadingPaths", {
    gradeNames: ["sjrk.storyTelling.server.changeMenuLink", "sjrk.storyTelling.server.changeTemplateConfigResourcePrefix", "sjrk.storyTelling.server.changeUIOTermsMessagePrefix"]
});

fluid.defaults("sjrk.storyTelling.server.karisma.karismaWelcome", {
    gradeNames: ["sjrk.storyTelling.karisma.karismaWelcome", "sjrk.storyTelling.server.changeResourceLoadingPaths"]
});

fluid.defaults("sjrk.storyTelling.server.base.storyEdit", {
    gradeNames: ["sjrk.storyTelling.server.changeResourceLoadingPaths"],
    components: {
        storyPreviewer: {
            options: {
                events: {
                    onShareRequested: null
                },
                components: {
                },
                selectors: {
                    storyShare: ".sjrkc-storyTelling-storyShare"
                },
                listeners: {
                    "onReadyToBind.bindShareControl": {
                        "this": "{that}.dom.storyShare",
                        "method": "click",
                        "args": ["{that}.events.onShareRequested.fire"]
                    },
                    "onShareRequested.submitStory": {
                        funcName: "sjrk.storyTelling.server.base.submitStory",
                        args: ["{storyEditor}"]
                    }
                }
            }
        }
    }
});

fluid.defaults("sjrk.storyTelling.server.karisma.storyEdit", {
    gradeNames: ["sjrk.storyTelling.server.base.storyEdit", "sjrk.storyTelling.karisma.storyEdit"],
});

sjrk.storyTelling.server.base.submitStory = function (that) {
    console.log("submitStory called");

    // TODO: add proper selector for form
    var form = that.container.find("form");

    form.attr("action", "/stories/");
    form.attr("method", "post");
    form.attr("enctype", "multipart/form-data");

    // This is the easiest way to be able to submit form
    // content in the background via ajax
    var formData = new FormData(form[0]);

    // Stores the entire model as a JSON string in one
    // field of the multipart form
    var modelAsJSON = JSON.stringify(that.story.model);
    formData.append("model", modelAsJSON);

    // In the real implementation, this should have
    // proper handling of feedback on success / failure,
    // but currently it just logs to console
    $.ajax({
        url         : form.attr("action"),
        data        : formData ? formData : form.serialize(),
        cache       : false,
        contentType : false,
        processData : false,
        type        : 'POST',
        success     : function(data, textStatus, jqXHR){
            var successResponse = JSON.parse(data);

            var storyUrl = "/storyView.html?id=" + successResponse.id;
            window.location.assign(storyUrl);
        },
        error       : function (jqXHR, textStatus, errorThrown) {
            console.log("Something went wrong");
            console.log(jqXHR, textStatus, errorThrown);
        }
    });
};

fluid.defaults("sjrk.storyTelling.server.learningReflections.storyView", {
    gradeNames: ["sjrk.storyTelling.learningReflections.storyView", "sjrk.storyTelling.server.learningReflections.changeMenuLink"],
    distributeOptions: {
        target: "{that templateManager}.options.templateConfig.resourcePrefix",
        record: "/node_modules/sjrk-story-telling"
    },
    components: {
        storyViewer: {
            options: {
                components: {
                    story: {
                        options: {
                            model: null
                        }
                    }
                }
            }
        }
    }
});

// classic query string parser via
// https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript

sjrk.storyTelling.server.getParameterByName = function (name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
};

sjrk.storyTelling.server.learningReflections.storyView.loadStoryFromParameter = function () {
    var storyId = sjrk.storyTelling.server.getParameterByName("id");
    if (storyId) {
        var storyUrl = "/stories/" + storyId;

            $.get(storyUrl, function (data) {
                var retrievedStory = JSON.parse(data);

                sjrk.storyTelling.server.learningReflections.storyView({
                    distributeOptions: {
                        "target": "{that story}.options.model",
                        "record": retrievedStory
                    }
                });
            });
    }
};

fluid.defaults("sjrk.storyTelling.server.learningReflections.storyBrowse", {
    gradeNames: ["sjrk.storyTelling.learningReflections.storyBrowse", "sjrk.storyTelling.server.learningReflections.changeMenuLink"],
    distributeOptions: {
        target: "{that templateManager}.options.templateConfig.resourcePrefix",
        record: "/node_modules/sjrk-story-telling"
    },
    components: {
        storyBrowser: {
            options: {
                model: {
                    stories: null
                }
            }
        }
    }
});

sjrk.storyTelling.server.learningReflections.storyBrowse.loadBrowse = function () {
    var browseUrl = "/stories";
    $.get(browseUrl, function (data) {
        var browseResponse = JSON.parse(data);

        sjrk.storyTelling.server.learningReflections.storyBrowse({
            distributeOptions: {
                "target": "{that storyBrowser}.options.model",
                "record": browseResponse
            }
        });
    });
};
