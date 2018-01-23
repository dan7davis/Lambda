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
        let layoutReceivedCallback;

        //Data
        let controlGroupCheck;
        let useControlGroup = false;
        let reloaded = true;

        let quote ='You haven\'t set a goal yet. Click "Edit" below to create one.';
        let qualityLoaded = false;
        let qualityRef;

        let problems;
        let videos;
        let time;
        let progress = {};
        let layout = {};
        let quantityLoaded = false;
        let quantityRef;

        //Methods
        /**
         * set the url to the quality html code in the course files (Static url doesn't work)
         * @param {String} ref, the url
         */
        SP.setQualityRef = function (ref) {
            qualityRef = ref
        };

        /**
         * Get the version of the study planning library.
         * @return {string} the version
         */
        SP.getVersion = function () {
            return version
        };

        /**
         * set te url to the quantity html code in the course files (Static url doesn't work)
         * @param {String} ref, the url
         */
        SP.setQuantityRef = function (ref) {
            quantityRef = ref;
        };

        /**
         * Loading next vertical.
         */
        SP.nextVertical = function () {
            qualityLoaded = false;
            quantityLoaded = false;
            reloaded = true;
        };


        /**
         * Indicates if the SP module is ready for setup call.
         * @return {boolean}
         */
        SP.ready = function () {
            return reloaded;
        };

        /**
         * retrieve initial data from the server.
         * @param {Boolean} showQuality, If quality needs to be shown after
         * @param {Boolean} qualityInput, If quality needs to show input page
         * @param {Boolean} showQuantity, If quantity needs to be shown after
         * @param {Boolean} quantityInput, If quantity needs to show input page
         */
        SP.getInitialData = function (showQuality,qualityInput,showQuantity,quantityInput) {
            reloaded = false;

            SP.requestQuote(null,showQuality,qualityInput);
            SP.requestGoals(null);
            SP.requestLayout(null);
            SP.requestProgress(null);
            if (showQuantity) {
                SP.waitForQuantityData(quantityInput);
            }
        };

        /**
         * set if the library should use a controlGroup
         * @param {Boolean} status, where or not to use controlGroup
         */
        SP.useControlGroup = function (status) {
            useControlGroup = status;
        };


        /**
         * set the control group check function
         * @param {Function} check, a function that must return a boolean and has userData as parameter.
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
         * @param {String} q, the new quote
         * @param {Boolean} saveToDB, If the data needs to be send to the database
         * @param {Boolean} switchView, If the view needs to be toggled after execution
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
         * @param {Function} callback, the function to call
         */
        SP.setQuoteSendCallback = function (callback) {
            quoteSendCallback = callback;
        };

        /**
         * Sets a callback for the receive quote function.
         * @param {Function} callback, the function to call
         */
        SP.setQuoteReceivedCallBack = function (callback) {
            quoteReceivedCallback = callback;
        };

        /**
         * send quote to server.
         * If a callback is set this will be used.
         * @param {Object} args, optional argument for callback
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
         * @param {Object} args, optional argument for callback
         * @param {Boolean} showQualityAfter, If quality needs to be opened after request
         * @param {Boolean} qualityInput, if quality needs to show input page
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
                if (response !== null) {
                    if (typeof response.quote !== 'undefined') {
                        SP.setQuote(response.quote, false, false);
                        if (showQualityAfter) {
                            SP.loadQualityPlanning(qualityInput);
                        }
                    }
                }
                if(typeof(quoteReceivedCallback) !== 'undefined') {
                    quoteReceivedCallback(args);
                }
            })

        };

        /**
         * Loads the quality planning content from the static library of edx.
         * @param {Boolean} inputMode, if the input mode should be shown
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
                $("#LambdaQualityFeedback").toggle();
                $("#LambdaQualityInput").toggle();
            }
        };

        /**
         * Loads the quantity planning content from the static library of edx.
         * @param {Boolean} inputMode, if the input mode should be shown
         * @param {Boolean} render, if the html data needs to be rendered after
         */
        SP.loadQuantityPlanning = function (inputMode, render) {
            if (typeof quantityRef !== "undefined") {
                if (!quantityLoaded) {
                    if (!SP.isControlGroup()){
                        if (LambdaLib.isEdx()) {
                            $("#LambdaFrame").load(quantityRef, function () {
                                quantityLoaded = true;

                                if (render) {
                                    SP.renderBars();
                                    SP.drawLayout();
                                }

                                if (inputMode) {
                                    SP.quantityToggle();
                                }

                            });
                        }
                    }
                }
            }
        };

        /**
         * Switches the view of the quantity module.
         */
        SP.quantityToggle = function () {
            if (quantityLoaded) {
                $('#LambdaQuantityFeedback').toggle();
                $('#LambdaQuantityInput').toggle();
            }
        };

        /**
         * Set the new value of the problems to answer this week.
         * @param {Number} prob, the new amount of problems
         */
        SP.setProblems = function (prob) {
            problems = prob;
        };

        /**
         * Set the new value of the videos to watch this week.
         * @param {Number} vid, the new amount of videos to watch
         */
        SP.setVideos = function (vid) {
            videos = vid;

        };

        /**
         * Set the new value of the time to spend this week.
         * @param {Number} t, the new amount of time to spend
         */
        SP.setTime = function (t) {
            time = t;

        };

        /**
         * Set the new values of all goals.
         * @param {Number} prob, the new amount of problems
         * @param {Number} vid, the new amount of videos to watch
         * @param {Number} t, the new amount of time to spend
         * @param {Boolean} saveToDB, If the data needs to be send to the database
         * @param {Boolean} switchView, If the view needs to be toggled after execution
         */
        SP.setGoals = function (prob, vid, t, saveToDB, switchView) {
            SP.setProblems(prob);
            SP.setVideos(vid);
            SP.setTime(t);

            if (quantityLoaded) {
                SP.renderBars();
            }

            if (saveToDB) {
                SP.sendGoals();
            }

            if (switchView) {
                setTimeout(SP.quantityToggle,600);
            }

        };

        /**
         * Set the callback for the send goals function.
         * @param {Function} func, the function that is called as callback
         */
        SP.setGoalsSendCallback = function (func) {
            goalsSendCallback = func;
        };

        /**
         * Set the callback for the received goals from server function.
         * @param {Function} func, the function that is called as callback
         */
        SP.setGoalsReceivedCallback = function (func) {
            goalsReceivedCallback = func;
        };

        /**
         * Set the callback for the received progress from the server function.
         * @param {Function} func, the function that is called as callback
         */
        SP.setProgressReceivedCallback = function (func) {
            progressReceivedCallback = func
        };

        /**
         * Set the callback for the received progress from the server function.
         * @param {Function} func, the function that is called as callback
         */
        SP.setLayoutReceivedCallback = function (func) {
            layoutReceivedCallback = func;
        };

        /**
         * Send the goals to the server.
         * If a callback is set this will be used.
         * @param {Object} args, optional argument for callback
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
         * Get the goals from the server.
         * If a callback is set this will be used.
         * @param {Object} args, optional argument for callback
         */
        SP.requestGoals = function (args) {
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
                if (response !== null) {
                    if (typeof response.problems !== 'undefined')
                        SP.setProblems(response.problems);
                    if (typeof response.videos !== 'undefined')
                        SP.setVideos(response.videos);
                    if (typeof response.time !== 'undefined')
                        SP.setTime(response.time);
                }
                if(typeof(quoteReceivedCallback) !== 'undefined') {
                    quoteReceivedCallback(args);
                }
            })
        };

        /**
         * Set the progress values in the progress object.
         * @param {Number} problems, progress in problems
         * @param {Number} videos, progress in videos
         * @param {Number} time, progress in time
         */
        SP.setProgress = function (problems, videos, time) {
            progress.problems = problems;
            progress.videos = videos;
            progress.time = time;
        };

        /**
         * Get the users progress from the server.
         * @param {Object} args, optional argument for callback
         * @returns {boolean} false if the data was not present
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
                    SP.setProgress(response.problemsCount, response.videoCount, response.timeCount);



                }
                if(typeof(quoteReceivedCallback) !== 'undefined') {
                    quoteReceivedCallback(args);
                }
            })
        };


        /**
         * Get the course layout for the current week for example the amount of questions this week.
         * @param {Object} args, optional argument for callback
         * @returns {boolean} false if the data was not present
         */
        SP.requestLayout = function (args) {
            if (!LambdaLib.logCheck()) {
                return false;
            }

            let pageData = LambdaLib.getPageData();

            let settings = {
                "async": true,
                "crossDomain": true,
                "url": LambdaLib.getServerURL() + "/study-planning/getLayout",
                "method": "POST",
                "data": {
                    "courseId": pageData.courseId,
                    "sectionId": pageData.sectionId
                }
            };
            $.ajax(settings).done(function (response) {
                if (typeof response !== 'undefined') {
                    if (typeof response[0] !== 'undefined'){
                        if (typeof response[0].problems !== 'undefined' && typeof response[0].videos !== 'undefined' && typeof response[0].time !== 'undefined')
                            SP.setLayout(response[0].problems, response[0].videos, response[0].time);
                    }
                }
                if(typeof(quoteReceivedCallback) !== 'undefined') {
                    quoteReceivedCallback(args);
                }
            })
        };

        /**
         * Sets the layout data in the layout variable.
         * If quantity planning is loaded than it also loads the data in the DOM elements.
         * @param {Number} problems, the amount of problems this week
         * @param {Number} videos, the amount of videos this week
         * @param {Number} time, the recommended amount of time to spend this week
         */
        SP.setLayout = function (problems, videos, time) {
            layout.problems = problems;
            layout.videos = videos;
            layout.time = time;

            SP.drawLayout();
        };

        /**
         * Load the layout in the html.
         */
        SP.drawLayout = function () {
            if (quantityLoaded) {
                $('#problemLayout').text(layout.problems);
                $('#videoLayout').text(layout.videos);
                $('#timeLayout').text(layout.time);

                //Set defaults values
                $('#problemInput').val(problems);
                $('#videoInput').val(videos);
                $('#timeInput').val(time);
            }
        };

        /**
         * Get all the goals of this week.
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
         * Get the layout of this week.
         * @return {Object} object containing layout of this week
         */
        SP.getLayout = function () {
            return layout
        };

        /**
         * Get the progress of this week.
         * @returns {Object} object containing the progress
         */
        SP.getProgress = function () {
            return progress
        };


        SP.saveGoal = function () {
            let probGoal = Number($('#problemInput').val());
            let vidGoal = Number($('#videoInput').val());
            let timeGoal = Number($('#timeInput').val());

            let errorCount = 0;


            if (vidGoal < 0 || Math.floor(vidGoal) < vidGoal || typeof vidGoal !== 'number') {
                errorCount++;
                vidGoal = videos;
            }

            if (probGoal < 0 || Math.floor(probGoal) < probGoal || typeof probGoal !== 'number') {
                errorCount++;
                probGoal = problems;
            }

            if (timeGoal < 0 || Math.floor(timeGoal) < timeGoal || typeof timeGoal !== 'number') {
                errorCount++;
                timeGoal = time;
            }

            if (errorCount == 0) {
                quantitySaved();
            } else if (errorCount < 3) {
                quantitySaveError("Invalid Response: only whole numbers and video and questions goal cannot be bigger than total.<br> Only the valid inputs are saved to the server.")
            } else {
                quantitySaveError("Invalid Response: only whole numbers and video and questions goal cannot be bigger than total.")
            }

            SP.setGoals(probGoal,vidGoal,timeGoal,true,true);

        };

        /**
         * Renders the progress bars on the page.
         */
        SP.renderBars = function () {

            let pro = [];
            pro.push(progress.videos);
            pro.push(progress.problems);
            pro.push(progress.time);

            let goal = [];
            goal.push(videos);
            goal.push(problems);
            goal.push(time);

            let barElements = [];
            barElements.push('#videoBar');
            barElements.push('#problemBar');
            barElements.push('#timeBar');

            let textElemtns = [];
            textElemtns.push('#vidText');
            textElemtns.push('#problemText');
            textElemtns.push('#timeText');

            for (let i = 0; i < 3; i++) {
                let p = pro[i];
                let g = goal[i];
                let barEl = barElements[i];
                let textEl = textElemtns[i];

                $(barEl).empty();

                let bar = new ProgressBar.SemiCircle(
                    barEl,
                    {
                        strokeWidth: 8,
                        color: '#FFEA82',
                        trailColor: '#eee',
                        trailWidth: 8,
                        easing: 'easeInOut',
                        duration: 1400,
                        svgStyle: null,
                        text: {
                            value: '1',
                            alignToBottom: false
                        },
                        from: {color: '#ffb366'},
                        to: {color: '#00e600'},
                        step: function (state, bar) {
                            bar.path.setAttribute('stroke', state.color);
                            let value = Math.round(bar.value() * Number(g));
                            if (value === 0) {
                                bar.setText('');
                            } else {
                                bar.setText(Math.floor(p) + "/" + g);
                            }

                            bar.text.style.color = state.color;
                        }
                    }
                );

                bar.text.style.fontFamily = '"Abel", Helvetica, sans-serif';
                bar.text.style.fontSize = '2rem';

                bar.animate(Math.min(p/g,1));  // Number from 0.0 to 1.0

                if ((p/g) < 0.25) {
                    $(textEl).text("It's a start. Keep up the good work!");
                } else if ((p/g) < 0.75) {
                    $(textEl).text("You're on your way. Keep it up!");
                } else if ((p/g) < 1) {
                    $(textEl).text("Nearly there. Keep up the good work!");
                } else {
                    $(textEl).text("you did it! Goal completed, good job!");
                }

            }
        };

        /**
         * Waits until all the data is present for the quantity module.
         * @param {Boolean} quantityInput, if quantity planing should show input mode
         */
        SP.waitForQuantityData = function (quantityInput) {
            if (typeof time !== 'undefined'
                && typeof progress.time !== 'undefined'
                && typeof layout.time !== 'undefined'
            ) {
                SP.loadQuantityPlanning(quantityInput,true);
            } else {
                setTimeout(function () {
                    SP.waitForQuantityData(quantityInput);
                }, 200);
            }
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


    function quantitySaved() {
        let pHolder = $('.pHolder');
        let subConfirm = $('#subConfirm');

        pHolder.css("display", "none");
        subConfirm.css({"visibility": "visible", "display": "block"});
        setTimeout( function(){
            subConfirm.fadeTo( "slow", 0 );
            pHolder.css("display", "block");
            subConfirm.css("display", "none");
        }, 2000);
        subConfirm.css({"visibility": "invisible", "opacity": "1"});
    }

    function quantitySaveError(text) {
        let subError = $('#subError');
        let pHolder = $('.pHolder');
        let bars = $('#bars');
        let editGoals = $('#editGoals');

        subError.html(text);
        pHolder.css("display", "none");
        subError.css({"visibility": "visible", "display": "block"});
        setTimeout( function(){
            subError.fadeTo( "slow", 0 );
            pHolder.css("display", "block");
            subError.css("display", "none");
        }, 2000);
        subError.css({"visibility": "invisible", "opacity": "1"});
        bars.css("display", "none");
        editGoals.addClass("emerald-flat-button").removeClass("emerald-flat-button-small");
    }

})(window);
