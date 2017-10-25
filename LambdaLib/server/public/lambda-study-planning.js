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

        //Data
        let controlGroupCheck;
        let useControlGroup = false;
        let quote ='You haven\'t set a goal yet. Click "Edit" below to create one.';
        let qualityLoaded = false;
        let qualityRef;

        //Methods
        /**
         * set the url to the quality html code in the coures files (Static url doesn't work)
         * @param {String} ref the url
         */
        SP.setQualityRef = function (ref) {
            qualityRef = ref
        };

        /**
         * retrieve initial data from the server.
         * @param {Boolean} showQuality If quality needs to be shown after
         * @param {Boolean} QualityInput If quality needs to show input page
         * @param {Boolean} showQuant If quantity needs to be shown after
         * @param {Boolean} QuantInput If quantity needs to show input page
         */
        SP.getInitialData = function (showQuality,QualityInput,showQuant,QuantInput) {
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
         * send quote to server
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
         * get the quote from the server
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
         * Loads the content from the static library of edx
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
         * switches the view in the quality window
         */
        SP.qualityToggle = function () {
            if (qualityLoaded) {
                $("#LambdaFeedback").toggle();
                $("#LambdaInput").toggle();
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
            console.log("Study planning already defined");
        }
    }
})(window);
