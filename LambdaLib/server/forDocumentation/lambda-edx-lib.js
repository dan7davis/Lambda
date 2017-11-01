'use strict';

/**
 * The core library for the Lambda code.
 * If the library code is used then the default instance is LambdaLib
 *
 * @class Lambda
 * @example
 * LambdaLib.getVersion()
 */
function Lambda() {
    //Private variable
    //Configs
    this.version = "1.0-beta";
    this.serverURL = "";
    this.showMessages = true;
    this.setUp = false;

    //analytic data
    this.userData = {};
    this.pageData = {};
    this.loadTime = new Date();

    //Callbacks
    this.userLogCallback;
    this.problemLogCallback;
    this.videoLogCallback;

}


//Methods
/**
 * Sets a new loadTime.
 */
Lambda.prototype.refreshLoadTime = function () {
    this.loadTime = new Date();
};

/**
 * Logs all the page info to the console.
 */
Lambda.prototype.showPageData = function() {
    console.log("Week Id (sectionId): " + this.pageData.sectionId);
    console.log("Sub section Id(seq): " + this.pageData.seq);
    console.log("Unit Id (vert): " + this.pageData.vert);
    console.log("Course Id (courseId): " + this.pageData.courseId);
};

/**
 * Suppresses irrelevant warnings.
 */
Lambda.prototype.suppressMessages = function () {
    this.showMessages = false;
};

/**
 * runs all the data gather functions
 */
Lambda.prototype.gatherData = function () {
    Lambda.loadPageData();
    Lambda.loadUserData();
};

/**
 * Get library version.
 * @returns {string} version of library
 */
Lambda.prototype.getVersion = function () {
    return this.version;
};

/**
 * set the node Js server url.
 * @param {String} URL node server url
 */
Lambda.prototype.setServer = function (URL) {
    this.serverURL = URL;
};

/**
 * Get the server url that is set in the library.
 * @returns {String} the url of the server (undefined by default)
 */
Lambda.prototype.getServerURL = function () {
    return this.serverURL;
};

/**
 * get the user data
 * @returns {Object} userData object
 */
Lambda.prototype.getUserData = function () {
    return this.userData;
};

/**
 * get the page data
 * @returns {Object} pageData object
 */
Lambda.prototype.getPageData = function() {
    return this.pageData;
};

/**
 * Check if this is an edx page.
 */
Lambda.prototype.isEdx = function () {
    return typeof(edx) !== 'undefined';
};

/**
 * Check if everything is set that is needed for aan Ajax request
 * @throws TypeError if serverURL or userData is missing
 * @returns {boolean}
 */
Lambda.prototype.logCheck = function () {
    let error = false;
    //Check if there is a server url
    if (typeof(this.serverURL) === 'undefined' || this.serverURL === ''){
        if(this.showMessages) {
            console.error("serverURL is not present! Dit you run setServer?");
        }
        error = true;
    }
    //check if userData is present
    if (typeof(this.userData) === 'undefined') {
        if(this.showMessages) {
            console.error("userData is not present! Dit you run loadUserData?");
        }
        error = true;
    }

    if (error) {
        if(this.showMessages) {
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
Lambda.prototype.loadUserData = function () {

    if (!Lambda.isEdx()){
        if(this.showMessages){
            console.error("To gather page data this must be called on the Edx page!");
            throw new Error("Edx page element was not found. Are we on the correct page or did Edx not load?");
        }
        return false;
    }

    if (typeof(analytics) !== 'undefined') {
        this.userData.userName = analytics._user._getTraits().username;
        this.userData.userId = analytics.user()._getId();
    } else {
        if(this.showMessages) {
            console.error("analytics was not found. Is the page fully loaded yet?")
        }
    }

};

/**
 * Gets the page information from the edx platform.
 */
Lambda.prototype.loadPageData = function () {
    if (!Lambda.isEdx()){
        if(this.showMessages){
            console.error("To gather page data this must be called on the Edx page!");
            throw new Error("Edx page element was not found. Are we on the correct page or did Edx not load?");
        }
        return false;
    }

    let url = window.location.href;
    let split = url.split("/");
    let block = $('#sequence-list').find('.nav-item.active').data('id');

    this.pageData.sectionId = split[6];
    this.pageData.seq = split[7];
    this.pageData.vert = block.split("@").pop();
    this.pageData.courseId = split[4].split(":")[1].split("+")[1];
    this.pageData.origin = this.userData.sectionId+"/"+this.userData.seq+"/"+this.userData.vert;

};

/**
 * Sets a callback for the user-log function.
 * @param {Function} callback the function to call
 */
Lambda.prototype.setUserLogCallback = function (callback) {
    this.userLogCallback = callback;
};

/**
 * Sets a callback for the problem-log function.
 * @param {Function} callback the function to call
 */
Lambda.prototype.setProblemLogCallback = function (callback) {
    this.problemLogCallback = callback;
};

/**
 * Sets a callback for the video-log function.
 * @param {Function} callback the function to call
 */
Lambda.prototype.setVideoLogCallback = function (callback) {
    this.videoLogCallback = callback;
};

/**
 * Sets the setUp state to true
 */
Lambda.prototype.setUp = function () {
    this.setUp = true;
};


/**
 * Check if we already run the setup code
 * @return {boolean} setUp state
 */
Lambda.prototype.isSetUp = function () {
    return this.setUp
};

/**
 * The default logging function for user activity.
 * If a callback is set this will be used.
 * @param {Object} args optional argument for callback
 */
Lambda.prototype.logUserActivity = function (args) {
    let object = this;


    if (!Lambda.logCheck()) {
        return false;
    }

    let settings = {
        "async": true,
        "crossDomain": true,
        "url": this.serverURL + "/lambda/logUserActivity",
        "method": "POST",
        "data": {
            "userId": this.userData.userId,
            "courseId": this.pageData.courseId,
            "sectionId": this.pageData.sectionId,
            "verticalId": this.pageData.vert,
            "timeStart": this.loadTime,
        }
    };
    if(typeof(this.userLogCallback) === 'undefined') {
        $.ajax(settings)
    } else {
        $.ajax(settings).done(function (response) {
            object.userLogCallback(args, response)
        });
    }

};

/**
 * The default logging function for problem activity.
 * If a callback is set this will be used.
 * @param {Object} args optional argument for callback
 */
Lambda.prototype.logProblemActivity = function (args) {
    let object = this;

    if (!Lambda.logCheck()) {
        return false;
    }

    let settings = {
        "async": true,
        "crossDomain": true,
        "url": this.serverURL + "/lambda/logProblemActivity",
        "method": "POST",
        "data": {
            "userId": this.userData.userId,
            "courseId": this.pageData.courseId,
            "sectionId": this.pageData.sectionId,
            "verticalId": this.pageData.vert,
            "problemId": this.pageData.problemId
        }
    };
    if(typeof(this.userLogCallback) === 'undefined') {
        $.ajax(settings).done(function (response) {
            console.log(response);
        })
    } else {
        $.ajax(settings).done(function (response) {
            object.problemLogCallback(args, response)
        });
    }
};

/**
 * The default logging function for video activity.
 * If a callback is set this will be used.
 * @param {Object} args optional argument for callback
 */
Lambda.prototype.logVideoActivity = function (args) {
    let object = this;

    if (!Lambda.logCheck()) {
        return false;
    }

    let settings = {
        "async": true,
        "crossDomain": true,
        "url": this.serverURL + "/lambda/logVideoActivity",
        "method": "POST",
        "data": {
            "userId": this.userData.userId,
            "courseId": this.pageData.courseId,
            "sectionId": this.pageData.sectionId,
            "verticalId": this.pageData.vert,
            "videoId": this.pageData.videoId,
            "videoStart": this.pageData.videoStart,
            "videoEnd": this.pageData.videoEnd,
            "timeWatched": this.pageData.timeWatched
        }
    };
    if(typeof(this.userLogCallback) === 'undefined') {
        $.ajax(settings)
    } else {
        $.ajax(settings).done(function (response) {
            object.problemLogCallback(args, response)
        });
    }
};

/**
 * Sets up the user tracking in a page.
 * @param {Boolean} replace true if the customFunction replaces the default function.
 * @param {Function} customFunction The custom function for the tracker
 * @param {object} arg Arguments for the function
 * @returns {boolean} returns false if there was an error
 */
Lambda.prototype.trackUser = function (replace, customFunction, arg) {
    let object = this;

    //Only works on edx page
    if (!Lambda.isEdx()){
        if(showMessages){
            console.error("To gather page data this must be called on the Edx page!");
            throw new Error("Edx page element was not found. Are we on the correct page or did Edx not load?");
        }
        return false;
    }

    //Build the default function
    // eventType, data, element are elements form the Logger callback
    let func = function (eventType, data, element) {
        if (replace === false || replace === undefined) {
            object.logUserActivity();
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
        if (this.showMessages) {
            console.error("Logger is not defined");
        }
    }

    //Place event on window close.
    window.addEventListener("beforeunload", function(){
        func();
    });



};


/**
 * Sets up the problem tracking in a page.
 * @param {Boolean} replace true if the customFunction replaces the default function.
 * @param {Function} customFunction The custom function for the tracker
 * @param {object} arg Arguments for the function
 * @returns {boolean} returns false if there was an error
 */
Lambda.prototype.trackProblems = function (replace, customFunction, arg) {
    let object = this;

    //Only works on edx page
    if (!Lambda.isEdx()){
        if(this.showMessages){
            console.error("To gather page data this must be called on the Edx page!");
            throw new Error("Edx page element was not found. Are we on the correct page or did Edx not load?");
        }
        return false;
    }

    //Build the default function
    // eventType, data, element are elements form the Logger callback
    let func = function (eventType, data, element) {
        if (replace === false || replace === undefined) {
            object.pageData.problemId = data.split("_")[1];
            object.logProblemActivity();
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
        if (this.showMessages) {
            console.error("Logger is not defined");
        }
    }
};

/**
 * Sets up the video tracking in a page.
 * @param {Boolean} replace true if the customFunction replaces the default function.
 * @param {Function} customFunction The custom function for the tracker
 * @param {object} arg Arguments for the function
 * @returns {boolean} returns false if there was an error
 */
Lambda.prototype.trackVideo = function (replace, customFunction, arg) {
    let object = this;

    //Only works on edx page
    if (!Lambda.isEdx()){
        if(this.showMessages){
            console.error("To gather page data this must be called on the Edx page!");
            throw new Error("Edx page element was not found. Are we on the correct page or did Edx not load?");
        }
        return false;
    }

    let videoLogs = {};

    // eventType, data, element are elements form the Logger callback
    let playFunc = function (eventType, data) {
        videoLogs[data.id] = data.currentTime;
    };

    //Build the default function
    // eventType, data, element are elements form the Logger callback
    let pauseFunc = function (eventType, data, element) {
        if (replace === false || replace === undefined) {
            if (videoLogs[data.id]) {
                object.pageData.videoId = data.id;
                object.pageData.videoStart = videoLogs[data.id];
                object.pageData.videoEnd = data.currentTime;
                object.pageData.timeWatched = data.currentTime - videoLogs[data.id];

                delete videoLogs[data.id];
                object.logVideoActivity();
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
        if (this.showMessages) {
            console.error("Logger is not defined");
        }
    }

};

