
(function (window) {

    /**
     * This contains all the library code.
     */
    'use strict';
    function library_init() {
        //The object to return
        var Lib = {};

        //Private variable
        var version = "1.0-alpha";
        var serverURL = undefined;

        var userData = {};
        var pageData = {};

        var loadTime = new Date();
        var logCallback;
        var showMessages = true;

        //Methods
        /**
         * Sets a new loadTime.
         */
        Lib.refreshLoadTime = function () {
            loadTime = new Date();
        };


        /**
         * Logs all the page info to the console.
         */
        Lib.showPageData = function() {
          console.log("Week Id (sectionId): " + pageData.sectionId);
          console.log("Sub section Id(seq): " + pageData.seq);
          console.log("Unit Id (vert): " + pageData.vert);
          console.log("Course Id (courseId): " + pageData.courseId);
        };

        /**
         * Suppresses irrelevant warnings.
         */
        Lib.suppressMessages = function () {
          showMessages = false;
        };

        /**
         * Get library version.
         * @returns {string} version of library
         */
        Lib.getVersion = function () {
            return version;
        };

        /**
         * set the node Js server url.
         * @param URL node server url
         */
        Lib.setServer = function (URL) {
            serverURL = URL;
        };


        Lib.getUserData = function () {
            return userData
        };

        /**
         * Check if this is an edx page.
         */
        Lib.isEdx = function () {
            return typeof(edx) !== 'undefined';
        };

        /**
         * Gets the users info from the edx platform.
         */
        Lib.loadUserData = function () {

            if (!Lib.isEdx()) {
                console.error("To gather user data this must be called on the Edx page!");
                throw new Error("Edx page element was not found. Are we on the correct page or did Edx not load?");
            }

            if (typeof(analytics) !== 'undefined') {
                userData.userName = analytics._user._getTraits().username;
                userData.userId = analytics.user()._getId();
            } else {
                console.error("analytics was not found. Is the page fully loaded yet?")
            }

        };

        /**
         * Gets the page information from the edx platform.
         */
        Lib.loadPageData = function () {
            if (!Lib.isEdx()) {
                console.error("To gather page data this must be called on the Edx page!");
                throw new Error("Edx page element was not found. Are we on the correct page or did Edx not load?");
            }

            var url = window.location.href;
            var split = url.split("/");
            var block = $('#sequence-list .nav-item.active').data('id');

            pageData.sectionId = split[6];
            pageData.seq = split[7];
            pageData.vert = block.split("@").pop();
            pageData.courseId = split[4].split(":")[1].split("+")[1];
            pageData.origin = userData.sectionId+"/"+userData.seq+"/"+userData.vert;

        };

        /**
         * Sets a callback for the user-log function.
         * @param callback the function to call
         */
        Lib.setLogCallback = function (callback) {
            logCallback = callback;
        };

        /**
         * The default logging function for user activity.
         * If a callback is set this will be used.
         * @param arg1 optional argument for callback
         * @param arg2 optional argument for callback
         * @throws TypeError if serverURL or userData is missing
         */
        Lib.logUserActivity = function (arg1,arg2) {

            var error = false;
            //Check if there is a server url
            if (typeof(serverURL) === 'undefined' ){
                console.error("serverURL is not present! Dit you run setServer?");
                error = true;
            }
            //check if userData is present
            if (typeof(userData) === 'undefined') {
                console.error("userData is not present! Dit you run loadUserData?");
                error = true;
            }

            if (error) {
                throw new TypeError("undefined variable(s)");
            }

            var settings = {
                "async": true,
                "crossDomain": true,
                "url": serverURL + "/edx/logUserActivity",
                "method": "POST",
                "data": {
                    "user": userData.userId,
                    "courseId": userData.courseId,
                    "section": userData.sectionId,
                    "verticalId": userData.vert,
                    "timeStart": loadTime,
                    "timeLeave": new Date()
                }
            };
            if(typeof(logCallback) === 'undefined') {
                $.ajax(settings)
            } else {
                $.ajax(settings).done(function (response) {
                    logCallback(arg1,arg2)
                });
            }

        };

        Lib.trackUser = function () {

        };

        //Returns the instance
        return Lib
    }


    /**
     * Adds the library to the page.
     */
    if (typeof(jQuery) === 'undefined') {
        console.error("Jquery is required for LambdaLib");
    } else {
        if (typeof(LambdaLib) === 'undefined') {
            window.LambdaLib = library_init();
            window.LambdaLib.loadPageData();
        } else {
            console.log("LambdaLib already defined");
            if (typeof(LambdaLib.refreshLoadTime) !== 'undefined') {
                LambdaLib.refreshLoadTime();
                LambdaLib.loadPageData();
                console.log("Refreshed loadTime");
            }
        }
    }


})(window);