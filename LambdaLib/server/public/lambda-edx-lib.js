
(function (window) {

    /**
     * This contains all the library code.
     */
    'use strict';
    function library_init() {
        //The object to return
        let Lib = {};

        //Private variable
        const version = "1.0-alpha";
        let serverURL = undefined;

        let userData = {};
        let pageData = {};

        let loadTime = new Date();
        let userLogCallback;
        let problemLogCallback;
        let videoLogCallback;
        let showMessages = true;

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


        /**
         * get the user data
         * @returns {Object} userData object
         */
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
         * Check if everything is set that is needed for aan Ajax request
         * @throws TypeError if serverURL or userData is missing
         * @returns {boolean}
         */
        Lib.logCheck = function () {
            let error = false;
            //Check if there is a server url
            if (typeof(serverURL) === 'undefined' ){
                if(showMessages) {
                    console.error("serverURL is not present! Dit you run setServer?");
                }
                error = true;
            }
            //check if userData is present
            if (typeof(userData) === 'undefined') {
                if(showMessages) {
                    console.error("userData is not present! Dit you run loadUserData?");
                }
                error = true;
            }

            if (error) {
                if(showMessages) {
                    throw new TypeError("undefined variable(s)");
                }
                return false;
            } else {
                return true;
            }
        };

        /**
         * Gets the users info from the edx platform.
         */
        Lib.loadUserData = function () {

            if (!Lib.isEdx()){
                if(showMessages){
                    console.error("To gather page data this must be called on the Edx page!");
                    throw new Error("Edx page element was not found. Are we on the correct page or did Edx not load?");
                }
                return false;
            }

            if (typeof(analytics) !== 'undefined') {
                userData.userName = analytics._user._getTraits().username;
                userData.userId = analytics.user()._getId();
            } else {
                if(showMessages) {
                    console.error("analytics was not found. Is the page fully loaded yet?")
                }
            }

        };

        /**
         * Gets the page information from the edx platform.
         */
        Lib.loadPageData = function () {
            if (!Lib.isEdx()){
                if(showMessages){
                    console.error("To gather page data this must be called on the Edx page!");
                    throw new Error("Edx page element was not found. Are we on the correct page or did Edx not load?");
                }
                return false;
            }

            let url = window.location.href;
            let split = url.split("/");
            let block = $('#sequence-list .nav-item.active').data('id');

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
        Lib.setUserLogCallback = function (callback) {
            userLogCallback = callback;
        };

        /**
         * Sets a callback for the problem-log function.
         * @param callback the function to call
         */
        Lib.setProblemLogCallback = function (callback) {
            problemLogCallback = callback;
        };

        /**
         * Sets a callback for the video-log function.
         * @param callback the function to call
         */
        Lib.setVideoLogCallback = function (callback) {
            videoLogCallback = callback;
        };

        /**
         * The default logging function for user activity.
         * If a callback is set this will be used.
         * @param args optional argument for callback
         */
        Lib.logUserActivity = function (args) {

            if (!Lib.logCheck()) {
                return false;
            }

            let settings = {
                "async": true,
                "crossDomain": true,
                "url": serverURL + "/lambda/logUserActivity",
                "method": "POST",
                "data": {
                    "userId": userData.userId,
                    "courseId": pageData.courseId,
                    "sectionId": pageData.sectionId,
                    "verticalId": pageData.vert,
                    "timeStart": loadTime,
                }
            };
            if(typeof(userLogCallback) === 'undefined') {
                $.ajax(settings).done(function (response) {
                    console.log(response);
                })
            } else {
                $.ajax(settings).done(function (response) {
                    userLogCallback(args)
                });
            }

        };

        /**
         * The default logging function for problem activity.
         * If a callback is set this will be used.
         * @param args optional argument for callback
         */
        Lib.logProblemActivity = function (args) {
            if (!Lib.logCheck()) {
                return false;
            }

            let settings = {
                "async": true,
                "crossDomain": true,
                "url": serverURL + "/edx/logProblemActivity",
                "method": "POST",
                "data": {
                    "user": userData.userId,
                    "section": userData.sectionId,
                    "problemId": problemId
                }
            };
            if(typeof(userLogCallback) === 'undefined') {
                $.ajax(settings)
            } else {
                $.ajax(settings).done(function (response) {
                    problemLogCallback(args)
                });
            }
        };

        /**
         * The default logging function for video activity.
         * If a callback is set this will be used.
         * @param args optional argument for callback
         */
        Lib.logVideoActivity = function (args) {
            if (!Lib.logCheck()) {
                return false;
            }

            let settings = {
                "async": true,
                "crossDomain": true,
                "url": serverURL + "/edx/logVideoActivity",
                "method": "POST",
                "data": {
                    "user": userData.userId,
                    "section": userData.sectionId,
                    "videoId": videoId
                }
            };
            if(typeof(userLogCallback) === 'undefined') {
                $.ajax(settings)
            } else {
                $.ajax(settings).done(function (response) {
                    problemLogCallback(args)
                });
            }
        };

        /**
         * Sets up the user tracking in a page.
         * @param {Boolean} replace true if the customFunction replaces the default function.
         * @param {Function} customFunction The custom function for the tracker
         * @param {object } arg Arguments for the function
         * @returns {boolean} returns false if there was an error
         */
        Lib.trackUser = function (replace,customFunction,arg) {
            //Only works on edx page
            if (!Lib.isEdx()){
                if(showMessages){
                    console.error("To gather page data this must be called on the Edx page!");
                    throw new Error("Edx page element was not found. Are we on the correct page or did Edx not load?");
                }
                return false;
            }

            //Build the default function
            // eventType, data, element are elements form the Logger callback
            let func = function (eventType, data, element) {
                if (replace === false) {
                    //TODO create default tracker function
                    console.log("Tracked the user");
                }

                //Add custom function if needed
                if (typeof(customFunction) === "function") {
                    customFunction(arg,eventType, data, element);
                }
            };

            //Check for logger
            if (typeof(window.Logger.listen) === "function") {
                //Build all loggers
                Logger.listen("edx.ui.lms.sequence.tab_selected",null, func);
                Logger.listen("edx.ui.lms.sequence.next_selected",null, func);
                Logger.listen("edx.ui.lms.sequence.previous_selected",null, func);
                Logger.listen("edx.ui.lms.link_clicked",null, func);
            } else {
                if (showMessages) {
                    console.error("Logger is not defined");
                }
            }

            //Place event on window close.
            $(window).on('beforeunload', function(){
                func();
            });



        };


        /**
         * Sets up the problem tracking in a page.
         * @param {Boolean} replace true if the customFunction replaces the default function.
         * @param {Function} customFunction The custom function for the tracker
         * @param {object } arg Arguments for the function
         * @returns {boolean} returns false if there was an error
         */
        Lib.trackProblems = function (replace,customFunction,arg) {
            //Only works on edx page
            if (!Lib.isEdx()){
                if(showMessages){
                    console.error("To gather page data this must be called on the Edx page!");
                    throw new Error("Edx page element was not found. Are we on the correct page or did Edx not load?");
                }
                return false;
            }

            //Build the default function
            // eventType, data, element are elements form the Logger callback
            let func = function (eventType, data, element) {
                if (replace === false) {
                    //TODO create default tracker function


                    console.log("Tracked the problem");
                    console.log("type: " + eventType);
                    console.log("data: " + data);
                    console.log("element: " + element);
                }

                //Add custom function if needed
                if (typeof(customFunction) === "function") {
                    customFunction(arg,eventType, data, element);
                }
            };

            //Check for logger
            if (typeof(window.Logger.listen) === "function") {
                //Build all loggers
                Logger.listen("problem_check",null, func);
            } else {
                if (showMessages) {
                    console.error("Logger is not defined");
                }
            }
        };

        /**
         * Sets up the video tracking in a page.
         * @param {Boolean} replace true if the customFunction replaces the default function.
         * @param {Function} customFunction The custom function for the tracker
         * @param {object } arg Arguments for the function
         * @returns {boolean} returns false if there was an error
         */
        Lib.trackVideo = function (replace,customFunction,arg) {
            //Only works on edx page
            if (!Lib.isEdx()){
                if(showMessages){
                    console.error("To gather page data this must be called on the Edx page!");
                    throw new Error("Edx page element was not found. Are we on the correct page or did Edx not load?");
                }
                return false;
            }

            let videoLogs = {};

            // eventType, data, element are elements form the Logger callback
            let playFunc = function (eventType, data, element) {
                console.log(data);
                videoLogs[data.id] = data.currentTime;
            };

            //Build the default function
            // eventType, data, element are elements form the Logger callback
            let pauseFunc = function (eventType, data, element) {
                if (replace === false) {
                    //TODO create default tracker function
                    console.log(data);
                    if (videoLogs[data.id]) {
                        console.log("time watched: " + (data.currentTime - videoLogs[data.id]));
                        delete videoLogs[data.id];
                        console.log(videoLogs);
                    }
                }

                //Add custom function if needed
                if (typeof(customFunction) === "function") {
                    customFunction(arg,eventType, data, element);
                }
            };

            //Check for logger
            if (typeof(window.Logger.listen) === "function") {
                //Build all loggers
                Logger.listen("play_video",null, playFunc);
                Logger.listen("pause_video", null, pauseFunc);
            } else {
                if (showMessages) {
                    console.error("Logger is not defined");
                }
            }

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