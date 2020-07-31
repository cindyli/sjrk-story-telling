/*
For copyright information, see the AUTHORS.md file in the docs directory of this distribution and at
https://github.com/fluid-project/sjrk-story-telling/blob/master/docs/AUTHORS.md

Licensed under the New BSD license. You may not use this file except in compliance with this licence.
You may obtain a copy of the BSD License at
https://raw.githubusercontent.com/fluid-project/sjrk-story-telling/master/LICENSE.txt
*/

/* global fluid, sjrk */

"use strict";

(function ($, fluid) {

    // the grade for any blockUi that has time-based media
    fluid.defaults("sjrk.storyTelling.blockUi.timeBased", {
        gradeNames: ["sjrk.storyTelling.blockUi"],
        selectors: {
            mediaPlayer: ".sjrkc-st-block-media-preview"
        },
        events: {
            onTemplateReady: "{that}.templateManager.events.onTemplateRendered",
            onMediaPlayerStop: null,
            onMediaReady: null,
            onMediaDurationChange: null,
            onMediaPlay: null,
            onMediaEnded: null
        },
        invokers: {
            updateMediaPlayer: {
                "funcName": "sjrk.storyTelling.blockUi.timeBased.updateMediaPlayer",
                "args": ["{that}.dom.mediaPlayer", "{arguments}.0"]
            },
            stopMediaPlayer: {
                func: "{that}.events.onMediaPlayerStop.fire",
                args: ["{that}"]
            },
            playMediaPlayer: {
                "funcName": "sjrk.storyTelling.blockUi.timeBased.playMediaPlayer",
                "args": ["{that}.dom.mediaPlayer"]
            }
        },
        listeners: {
            "onTemplateReady.updateMediaPlayerUrl": {
                func: "{that}.updateMediaPlayer",
                args: ["{that}.block.model.mediaUrl"]
            },
            "onTemplateReady.bindOnMediaReady": {
                "this": "{that}.dom.mediaPlayer.0",
                method: "addEventListener",
                args: ["canplay", "{that}.events.onMediaReady.fire"]
            },
            "onTemplateReady.bindOnMediaDurationChange": {
                "this": "{that}.dom.mediaPlayer.0",
                method: "addEventListener",
                args: ["durationchange", "{that}.events.onMediaDurationChange.fire"]
            },
            "onTemplateReady.bindOnMediaEnded": {
                "this": "{that}.dom.mediaPlayer.0",
                method: "addEventListener",
                args: ["ended", "{that}.events.onMediaEnded.fire"]
            },
            "onTemplateReady.bindOnMediaPlay": {
                "this": "{that}.dom.mediaPlayer.0",
                method: "addEventListener",
                args: ["play", "{that}.events.onMediaPlay.fire"]
            },
            "onMediaPlayerStop.pauseMediaPlayer": {
                "this": "{that}.dom.mediaPlayer.0",
                method: "pause"
            },
            "onMediaPlayerStop.resetMediaPlayerTime": {
                funcName: "sjrk.storyTelling.blockUi.timeBased.resetMediaPlayerTime",
                args: ["{that}.dom.mediaPlayer.0"],
                priority: "after:pauseMediaPlayer"
            }
        },
        block: {
            type: "sjrk.storyTelling.block.timeBased"
        }
    });

    /**
     * Updates the HTML preview of a media player associated with a given block.
     * If a media player was playing, it will be stopped before loading.
     *
     * @param {jQuery} mediaPlayer - the jQueryable containing the HTML video or audio element
     * @param {String} mediaUrl - the URL of the media source file
     */
    sjrk.storyTelling.blockUi.timeBased.updateMediaPlayer = function (mediaPlayer, mediaUrl) {
        mediaPlayer.prop("controls", !!mediaUrl);
        mediaPlayer.attr("src", mediaUrl);
        mediaPlayer[0].load();
    };

    /**
     * Rewinds a given media player to the beginning
     *
     * @param {jQuery} mediaPlayer - the jQueryable containing the HTML video or audio element
     */
    sjrk.storyTelling.blockUi.timeBased.resetMediaPlayerTime = function (mediaPlayer) {
        mediaPlayer.currentTime = 0;
    };

    /**
     * Plays a given media player, though it must first mute the player to satisfy
     * autoplay restrictions in several browsers. In the case of Chrome, please
     * refer to {@link https://developers.google.com/web/updates/2017/09/autoplay-policy-changes|this article}
     *
     * @param {jQuery} mediaPlayer - the jQueryable containing the HTML video or audio element
     */
    sjrk.storyTelling.blockUi.timeBased.playMediaPlayer = function (mediaPlayer) {
        mediaPlayer.prop("muted", true);

        var promise = mediaPlayer[0].play();
        if (promise) {
            promise.then(function () {
                fluid.log("Media player playback triggered");
            }, function (error) {
                fluid.log(fluid.logLevel.WARN, "Error:", error, "message:", error.message);
            });
        }
    };

})(jQuery, fluid);
