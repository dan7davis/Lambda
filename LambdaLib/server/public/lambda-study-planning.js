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
        let quote ='You haven\'t set a goal yet. Click "Edit" below to create one.';

        //Methods

        /**
         * Set the new current quote
         * @param q the new quote
         */
        SP.setQuote = function (q) {
            quote = q
        };

        /**
         * get the quote
         * @returns {string} the quote
         */
        SP.getQuote = function () {
            return quote;
        };

        /**
         * Sets a callback for the send quote function.
         * @param callback the function to call
         */
        SP.setQuoteSendCallback = function (callback) {
            quoteSendCallback = callback;
        };

        /**
         * Sets a callback for the receive quote function.
         * @param callback the function to call
         */
        SP.setQuoteReceivedCallBack = function (callback) {
            quoteReceivedCallback = callback;
        };

        /**
         * send quote to server
         * If a callback is set this will be used.
         * @param args optional argument for callback
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
         * @param args optional argument for callback
         */
        SP.requestQuote = function (args) {
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
                    quote = response.quote;
                    //TODO update in view
                }
                if(typeof(quoteReceivedCallback) !== 'undefined') {
                    quoteReceivedCallback(args);
                }
                return response;
            })

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
