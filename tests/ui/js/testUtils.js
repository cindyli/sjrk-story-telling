/*
For copyright information, see the AUTHORS.md file in the docs directory of this distribution and at
https://github.com/fluid-project/sjrk-story-telling/blob/master/docs/AUTHORS.md

Licensed under the New BSD license. You may not use this file except in compliance with this licence.
You may obtain a copy of the BSD License at
https://raw.githubusercontent.com/fluid-project/sjrk-story-telling/master/LICENSE.txt
*/

/* global fluid, sjrk, jqUnit, sinon */

"use strict";

(function ($, fluid) {

    fluid.registerNamespace("sjrk.storyTelling.testUtils");

    /**
     * Changes the content of a specified HTML element to the given value.
     * This is abstracted to a utility function in order to use it with gpii-binder
     * when setting up tests. It triggers the change event in order to ensure
     * the form value is relayed to the model, as val on its own does not.
     *
     * @param {Component} component - an instance of fluid.viewComponent
     * @param {String} selector - the infusion selector of the element
     * @param {String} value - the value to which the element will be set using jQuery val()
     */
    sjrk.storyTelling.testUtils.changeFormElement = function (component, selector, value) {
        component.locate(selector).val(value).change();
    };

    /**
     * Verifies that specified UI steps are visible or hidden in the DOM.
     * The steps are DOM elements, but could be entire UI grades or internal to them.
     * Visible is taken to mean "display: block" and hidden is "display: none".
     *
     * @param {jQuery[]} expectedHidden - a collection of elements which should be hidden
     * @param {jQuery[]} expectedVisible - a collection of elements which should be visible
     */
    sjrk.storyTelling.testUtils.verifyStepVisibility = function (expectedHidden, expectedVisible) {
        fluid.each(expectedHidden, function (el) {
            sjrk.storyTelling.testUtils.assertElementVisibility(el, "none");
        });

        fluid.each(expectedVisible, function (el) {
            sjrk.storyTelling.testUtils.assertElementVisibility(el, "block");
        });
    };

    /**
     * Asserts that an individual DOM element has a given visibility state
     * according to its css "display" value. Uses jqUnit for the assertion.
     *
     * @param {jQuery} element - the DOM element to be tested
     * @param {String} expectedVisibility - the display state which is expected
     */
    sjrk.storyTelling.testUtils.assertElementVisibility = function (element, expectedVisibility) {
        jqUnit.assertEquals("The element " + sjrk.storyTelling.testUtils.getElementName(element) + " has expected visibility", expectedVisibility, element.css("display"));
    };

    /**
     * Asserts that an individual DOM element has a given value for a given propery
     * according to the jQuery prop() function. Uses jqUnit for the assertion.
     *
     * @param {jQuery} element - the DOM element to be tested
     * @param {String} propertyName - the property to be checked
     * @param {String} expectedVisibility - the expected value of the property
     */
    sjrk.storyTelling.testUtils.assertElementPropertyValue = function (element, propertyName, expectedVisibility) {
        jqUnit.assertEquals("The element " + sjrk.storyTelling.testUtils.getElementName(element) + " has expected visibility", expectedVisibility, element.prop(propertyName));
    };

    /**
     * Asserts that an individual DOM element has a given text value
     * according to the jQuery text() function. Uses jqUnit for the assertion.
     *
     * @param {jQuery} element - the DOM element to be tested
     * @param {String} expectedText - the expected text value of the element
     */
    sjrk.storyTelling.testUtils.assertElementText = function (element, expectedText) {
        jqUnit.assertEquals("The element " + sjrk.storyTelling.testUtils.getElementName(element) + " has expected text", expectedText, element.text());
    };

    /**
     * Asserts that an individual DOM element has a given value
     * according to the jQuery val() function. Uses jqUnit for the assertion.
     * @param {jQuery} element - the DOM element to be tested
     * @param {String} expectedValue - the expected value of the element
     */
    sjrk.storyTelling.testUtils.assertElementValue = function (element, expectedValue) {
        jqUnit.assertEquals("The element " + sjrk.storyTelling.testUtils.getElementName(element) + " has expected value", expectedValue, element.val());
    };

    /**
     * Asserts that an individual DOM element has a given CSS class applied,
     * according to the jQuery hasClass() function. Uses jqUnit for the assertion.
     *
     * @param {jQuery} element - the DOM element to be tested
     * @param {String} className - the name of the class for which to check
     * @param {Boolean} isExpectedToHaveClass - true if the element is expected to have the class
     */
    sjrk.storyTelling.testUtils.assertElementHasClass = function (element, className, isExpectedToHaveClass) {
        jqUnit.assertEquals("The element " + sjrk.storyTelling.testUtils.getElementName(element) + " has expected class", isExpectedToHaveClass, element.hasClass(className));
    };

    /**
     * Runs a given assertion function for an element for which we only have
     * a CSS selector. The assertion function is assumed to take an element
     * as its first argument.
     *
     * @param {String} selector - the CSS selector
     * @param {String} assertFunctionName - the name of the assertion function to call
     * @param {Object} assertionArguments - arguments for the assertionFunction, except "el"
     */
    sjrk.storyTelling.testUtils.assertFromSelector = function (selector, assertFunctionName, assertionArguments) {
        var el = $(selector);

        assertionArguments.unshift(el); //make "el" the first argument

        var assertFunction = fluid.getGlobalValue(assertFunctionName);

        if (typeof assertFunction === "function") {
            assertFunction.apply(null, assertionArguments);
        }
    };

    /**
     * Returns a "friendly" name for the given element, when available
     *
     * @param {jQuery} element - the DOM element for which the friendly name is to be returned
     *
     * @return {String} - the friendly name for the element
     */
    sjrk.storyTelling.testUtils.getElementName = function (element) {
        return element.selectorName || element.selector || element.toString();
    };

    /**
     * Checks the "select block" checkboxes for blockUi's in a given blockManager.
     * It will select either all of the blocks or only the first one.
     *
     * @param {Component} blockManager - an instance of sjrk.dynamicViewComponentManager
     * @param {Boolean} checkFirstBlockOnly - if truthy, only checks the first block's box
     */
    sjrk.storyTelling.testUtils.checkBlockCheckboxes = function (blockManager, checkFirstBlockOnly) {
        var managedComponentRegistryAsArray = fluid.hashToArray(blockManager.managedViewComponentRegistry, "managedComponentKey");

        if (checkFirstBlockOnly) {
            sjrk.storyTelling.testUtils.checkSingleBlockCheckbox(managedComponentRegistryAsArray[0]);
        } else {
            fluid.each(managedComponentRegistryAsArray, function (managedComponent) {
                sjrk.storyTelling.testUtils.checkSingleBlockCheckbox(managedComponent);
            });
        }
    };

    /**
     * Checks the "select block" checkbox for a given blockUi
     *
     * @param {Component} block - the sjrk.storyTelling.blockUi whose checkbox we wish to become checked
     */
    sjrk.storyTelling.testUtils.checkSingleBlockCheckbox = function (block) {
        var checkBox = block.locate("selectedCheckbox");
        checkBox.prop("checked", true);
    };

    /**
     * Verifies that a given blockUi was indeed added to the blockManager
     *
     * @param {Component} blockManager - an instance of sjrk.dynamicViewComponentManager
     * @param {String} addedBlockKey - a unique key which is provided when a new block is added
     * @param {String} expectedGrade - the expected grade/type of the newly-added blockUi
     */
    sjrk.storyTelling.testUtils.verifyBlockAdded = function (blockManager, addedBlockKey, expectedGrade) {
        var blockComponent = blockManager.managedViewComponentRegistry[addedBlockKey];

        // Verify the block is added to the manager's registry
        jqUnit.assertNotNull("New block added to manager's registry", blockComponent);

        // Verify the block's type is correct
        jqUnit.assertEquals("Block's dynamicComponent type is expected " + expectedGrade, expectedGrade,  blockComponent.options.managedViewComponentRequiredConfig.type);

        // Verify the block is added to the DOM
        var newBlock = blockManager.container.find("." + addedBlockKey);
        jqUnit.assertTrue("New block added to DOM", newBlock.length > 0);
    };

    /**
     * Verifies that the blockManager has the expected number of blocks after a
     * call to remove blocks was made
     *
     * @param {Component} blockManager - an instance of sjrk.dynamicViewComponentManager
     * @param {Number} expectedNumberOfBlocks - the expected number of blocks after removal
     */
    sjrk.storyTelling.testUtils.verifyBlocksRemoved = function (blockManager, expectedNumberOfBlocks) {
        var managedComponentRegistryAsArray = fluid.hashToArray(blockManager.managedViewComponentRegistry, "managedComponentKey");
        jqUnit.assertEquals("Number of remaining blocks is expected #: " + expectedNumberOfBlocks, expectedNumberOfBlocks, managedComponentRegistryAsArray.length);
    };

    /**
     * Alters URL without pageload, via code from StackOverflow
     * {@link https://stackoverflow.com/questions/10970078/modifying-a-query-string-without-reloading-the-page}
     *
     * @param {String} queryString - the query string to append to the current page URL
     */
    sjrk.storyTelling.testUtils.setQueryString = function (queryString) {
        if (history.pushState) {
            var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + "?" + queryString;
            window.history.pushState({ path:newurl }, "", newurl);
        }
    };

    // the mock server
    var mockServer;

    /**
     * Sets up a mock server response with given data for a given URL
     *
     * @param {String} url - the URL for which to set up a response
     * @param {Object} responseData - JSON data to include in the server response
     */
    sjrk.storyTelling.testUtils.setupMockServer = function (url, responseData) {
        mockServer = sinon.createFakeServer();
        mockServer.respondImmediately = true;
        mockServer.respondWith(url, [200, { "Content-Type": "application/json"}, JSON.stringify(responseData)]);
    };

    /**
     * Stops the remote server and hands any previously set-up routes back to Kettle
     */
    sjrk.storyTelling.testUtils.teardownMockServer = function () {
        mockServer.restore();
    };

})(jQuery, fluid);
