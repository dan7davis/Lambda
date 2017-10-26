(function (window) {

    /**
     * This contains all the library code.
     */
    'use strict';
    function library_init() {
        //The object to return
        let SP = {};

        //Private variable
        //Configs
        const version = "1.0-alpha";


        //Callbacks
        let quoteSendCallback;
        let quoteReceivedCallback;

        let goalsSendCallback;
        let goalsReceivedCallback;
        let progressReceivedCallback;

        //Data
        let controlGroupCheck;
        let useControlGroup = false;

        let quote ='You haven\'t set a goal yet. Click "Edit" below to create one.';
        let qualityLoaded = false;
        let qualityRef;

        let problems;
        let videos;
        let time;
        let progress = {};
        let quantityLoaded = false;
        let quantityRef;

        //Methods
        /**
         * set the url to the quality html code in the course files (Static url doesn't work)
         * @param {String} ref the url
         */
        SP.setQualityRef = function (ref) {
            qualityRef = ref
        };

        /**
         * set te url to the quantity html code in the course files (Static url doesn't work)
         * @param {String} ref the url
         */
        SP.setQuantityRef = function (ref) {
            qualityRef = ref;
        };

        SP.nextVertical = function () {
          qualityLoaded = false;
          quantityLoaded = false;
        };

        /**
         * retrieve initial data from the server.
         * @param {Boolean} showQuality If quality needs to be shown after
         * @param {Boolean} QualityInput If quality needs to show input page
         * @param {Boolean} showQuantity If quantity needs to be shown after
         * @param {Boolean} quantityInput If quantity needs to show input page
         */
        SP.getInitialData = function (showQuality,QualityInput,showQuantity,quantityInput) {
            SP.requestQuote(null,showQuality,QualityInput);
        };

        /**
         * set if the library should use a controlGroup
         * @param {Boolean} status where or not to use controlGroup
         */
        SP.useControlGroup = function (status) {
            useControlGroup = status;
        };


        /**
         * set the control group check function
         * @param {Function} check a function that must return a boolean and has userData as parameter.
         */
        SP.setControlGroup = function (check) {
            controlGroupCheck = check
        };

        /**
         * run the controlGroupCheck
         * if there is no custom check then even userId is true
         * @returns {Boolean} if user is in control group
         */
        SP.isControlGroup = function () {
            if(useControlGroup) {
                let userData = LambdaLib.getUserData();
                if (typeof controlGroupCheck === 'undefined') {
                    return (userData.userId % 2 === 0);
                } else {
                    return controlGroupCheck(userData);
                }
            } else {
                return false;
            }
        };

        /**
         * Set the new current quote
         * @param {String} q the new quote
         * @param {Boolean} saveToDB If the data needs to be send to the database
         * @param {Boolean} switchView If the view needs to be toggled after execution
         */
        SP.setQuote = function (q, saveToDB, switchView) {
            quote = q;
            if (qualityLoaded) {
                $("#LambdaPlanningText").text(quote);
            }
            if (saveToDB) {
                SP.sendQuote();
            }
            if (switchView) {
                setTimeout(SP.qualityToggle(),600);
                setTimeout(function() {$("#QualityTextArea").val(quote)},2000);
            }
        };

        /**
         * get the quote
         * @returns {string} the quote
         */
        SP.getQuote = function () {
            return quote;
        };

        /**
         * saves the text from the textArea of the quality window and saves it to the server
         */
        SP.saveQuote = function () {
            if (qualityLoaded) {
                let textArea = $("#QualityTextArea");

                SP.setQuote(textArea.val(), true, true);
                textArea.val("Saving quote...");
            }
        };

        /**
         * Sets a callback for the send quote function.
         * @param {Function} callback the function to call
         */
        SP.setQuoteSendCallback = function (callback) {
            quoteSendCallback = callback;
        };

        /**
         * Sets a callback for the receive quote function.
         * @param {Function} callback the function to call
         */
        SP.setQuoteReceivedCallBack = function (callback) {
            quoteReceivedCallback = callback;
        };

        /**
         * send quote to server.
         * If a callback is set this will be used.
         * @param {Object} args optional argument for callback
         */
        SP.sendQuote = function (args) {
            if (!LambdaLib.logCheck()) {
                return false;
            }

            let userData = LambdaLib.getUserData();
            let pageData = LambdaLib.getPageData();

            let settings = {
                "async": true,
                "crossDomain": true,
                "url": LambdaLib.getServerURL() + "/study-planning/setQuote",
                "method": "POST",
                "data": {
                    "userId": userData.userId,
                    "courseId": pageData.courseId,
                    "sectionId": pageData.sectionId,
                    "quote": quote,
                }
            };
            if(typeof(quoteSendCallback) === 'undefined') {
                $.ajax(settings)
            } else {
                $.ajax(settings).done(function (response) {
                    quoteSendCallback(args, response)
                });
            }
        };

        /**
         * get the quote from the server.
         * If a callback is set this will be used.
         * @param {Object} args optional argument for callback
         * @param {Boolean} showQualityAfter If quality needs to be opened after request
         * @param {Boolean} qualityInput if quality needs to show input page
         */
        SP.requestQuote = function (args, showQualityAfter, qualityInput) {
            if (!LambdaLib.logCheck()) {
                return false;
            }

            let userData = LambdaLib.getUserData();
            let pageData = LambdaLib.getPageData();

            let settings = {
                "async": true,
                "crossDomain": true,
                "url": LambdaLib.getServerURL() + "/study-planning/getQuote",
                "method": "POST",
                "data": {
                    "userId": userData.userId,
                    "courseId": pageData.courseId,
                    "sectionId": pageData.sectionId
                }
            };
            $.ajax(settings).done(function (response) {
                if (typeof response === 'object') {
                    SP.setQuote(response.quote,false,false);
                    if (showQualityAfter) {
                        SP.loadQualityPlanning(qualityInput);
                    }
                }
                if(typeof(quoteReceivedCallback) !== 'undefined') {
                    quoteReceivedCallback(args);
                }
            })

        };

        /**
         * Loads the content from the static library of edx.
         * @param {Boolean} inputMode
         */
        SP.loadQualityPlanning = function (inputMode) {
            if (typeof qualityRef !== 'undefined') {
                if (!qualityLoaded) {
                    if (!SP.isControlGroup()) {
                        if (LambdaLib.isEdx()) {
                            $("#LambdaFrame").load(qualityRef, function () {
                                qualityLoaded = true;

                                //Load text
                                $("#LambdaPlanningText").text(quote);
                                //Load user
                                $("#dx-username").text(LambdaLib.getUserData().userName);

                                if (inputMode) {
                                    SP.qualityToggle();
                                }
                            });
                        }
                    }
                }
            }
        };

        /**
         * switches the view in the quality window.
         */
        SP.qualityToggle = function () {
            if (qualityLoaded) {
                $("#LambdaFeedback").toggle();
                $("#LambdaInput").toggle();
            }
        };

        /**
         * Set the new value of the problems to answer this week.
         * @param {Number} prob the new amount of problems
         */
        SP.setProblems = function (prob) {
            problems = prob;

            //TODO implement in html
        };

        /**
         * Set the new value of the videos to watch this week.
         * @param {Number} vid the new amount of videos to watch
         */
        SP.setVideos = function (vid) {
            videos = vid

            //TODO implement in html
        };

        /**
         * Set the new value of the time to spend this week.
         * @param {Number} t the new amount of time to spend
         */
        SP.setTime = function (t) {
            time = t;

            //TODO implement in html
        };

        /**
         * Set the callback for the send goals function.
         * @param {Function} func the function that is called as callback
         */
        SP.setGoalsSendCallback = function (func) {
            goalsSendCallback = func;
        };

        /**
         * Set the callback for the received goals from server function.
         * @param {Function} func the function that is called as callback
         */
        SP.setGoalsReceivedCallback = function (func) {
            goalsReceivedCallback = func;
        };

        /**
         * Set the callback for the received progress from the server function.
         * @param {Function} func the function that is called as callback
         */
        SP.setProgressReceivedCallback = function (func) {
            progressReceivedCallback = func
        };

        /**
         * Send the goals to the server.
         * If a callback is set this will be used.
         * @param {Object} args optional argument for callback
         * @returns {boolean} false if the data was not present
         */
        SP.sendGoals = function (args) {
            if (!LambdaLib.logCheck()) {
                return false;
            }

            let userData = LambdaLib.getUserData();
            let pageData = LambdaLib.getPageData();

            let settings = {
                "async": true,
                "crossDomain": true,
                "url": LambdaLib.getServerURL() + "/study-planning/setGoal",
                "method": "POST",
                "data": {
                    "userId": userData.userId,
                    "courseId": pageData.courseId,
                    "sectionId": pageData.sectionId,
                    "problems": problems,
                    "videos": videos,
                    "time": time
                }
            };
            if(typeof(quoteSendCallback) === 'undefined') {
                $.ajax(settings)
            } else {
                $.ajax(settings).done(function (response) {
                    quoteSendCallback(args, response)
                });
            }
        };

        /**
         * get the goals from the server.
         * If a callback is set this will be used.
         * @param {Object} args optional argument for callback
         * @param {Boolean} showQuantity If quantity needs to be opened after request
         * @param {Boolean} quantityInput if quantity needs to show input page
         */
        SP.requestGoals = function (args, showQuantity, quantityInput) {
            if (!LambdaLib.logCheck()) {
                return false;
            }

            let userData = LambdaLib.getUserData();
            let pageData = LambdaLib.getPageData();

            let settings = {
                "async": true,
                "crossDomain": true,
                "url": LambdaLib.getServerURL() + "/study-planning/getGoal",
                "method": "POST",
                "data": {
                    "userId": userData.userId,
                    "courseId": pageData.courseId,
                    "sectionId": pageData.sectionId
                }
            };
            $.ajax(settings).done(function (response) {
                if (typeof response === 'object') {
                    SP.setProblems(response.problems);
                    SP.setVideos(response.videos);
                    SP.setTime(response.time);

                    if (showQuantity) {
                        //TODO load html option
                        //SP.loadQuantityPlanning(quantityInput);
                    }
                }
                if(typeof(quoteReceivedCallback) !== 'undefined') {
                    quoteReceivedCallback(args);
                }
            })
        };

        /**
         * @param args
         * @returns {boolean}
         */
        SP.requestProgress = function (args) {
            if (!LambdaLib.logCheck()) {
                return false;
            }

            let userData = LambdaLib.getUserData();
            let pageData = LambdaLib.getPageData();

            let settings = {
                "async": true,
                "crossDomain": true,
                "url": LambdaLib.getServerURL() + "/study-planning/getProgress",
                "method": "POST",
                "data": {
                    "userId": userData.userId,
                    "courseId": pageData.courseId,
                    "sectionId": pageData.sectionId
                }
            };
            $.ajax(settings).done(function (response) {
                if (typeof response === 'object') {
                    progress.problems = response.problemsCount;
                    progress.videos = response.videoCount;
                    progress.time = response.timeCount;
                }
                if(typeof(quoteReceivedCallback) !== 'undefined') {
                    quoteReceivedCallback(args);
                }
            })
        };

        /**
         * get all the goals of this week.
         * @returns {Object} object containing the goals
         */
        SP.getGoals = function () {
          let goals = {};
          goals.problems = problems;
          goals.videos = videos;
          goals.time = time;

          return goals;
        };

        /**
         * get the progress of this week.
         * @returns {Object} object containing the progress
         */
        SP.getProgress = function () {
            return progress
        };

        return SP
    }


    /**
     * Adds the code to the page.
     */
    if (typeof(jQuery) === 'undefined') {
        console.error("Jquery is required for Study planning");
    } else if (typeof(LambdaLib) === 'undefined') {
        console.error("LambdaLib is required for Study planning");
    }else {
        if (typeof(LambdaLib.SP) === 'undefined') {
            window.LambdaLib.SP = library_init();
        } else {
            window.LambdaLib.SP.nextVertical();
            console.log("Study planning already defined");
        }
    }
})(window);
