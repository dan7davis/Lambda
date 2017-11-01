'use strict';


/**
 * The study planning library for the Lambda code.
 * If the library code is used then the default instance is LambdaLib.SP
 *
 * @class StudyPlanning
 * @example
 * LambdaLib.SP.getVersion()
 *
 * @param {object} corLib this core library object
 */
function StudyPlanning(corLib) {
    //Private variable
    //Configs
    this.version = "1.0-alpha";


    //Callbacks
    this.quoteSendCallback;
    this.quoteReceivedCallback;

    this.goalsSendCallback;
    this.goalsReceivedCallback;
    this.progressReceivedCallback;
    this.layoutReceivedCallback;

    //Data
    this.controlGroupCheck;
    this.useControlGroup = false;
    this.reloaded = true;

    this.quote = 'You haven\'t set a goal yet. Click "Edit" below to create one.';
    this.qualityLoaded = false;
    this.qualityRef;

    this.problems;
    this.videos;
    this.time;
    this.progress = {};
    this.layout = {};
    this.quantityLoaded = false;
    this.quantityRef;

    this.Lambda = corLib;

}

//Methods
/**
 * set the url to the quality html code in the course files (Static url doesn't work)
 * @param {String} ref, the url
 */
StudyPlanning.prototype.setQualityRef = function (ref) {
    this.qualityRef = ref
};

/**
 * Get the version of the study planning library.
 * @return {string} the version
 */
StudyPlanning.prototype.getVersion = function () {
    return this.version
};

/**
 * set te url to the quantity html code in the course files (Static url doesn't work)
 * @param {String} ref, the url
 */
StudyPlanning.prototype.setQuantityRef = function (ref) {
    this.quantityRef = ref;
};

/**
 * Loading next vertical.
 */
StudyPlanning.prototype.nextVertical = function () {
    this.qualityLoaded = false;
    this.quantityLoaded = false;
    this.reloaded = true;
};


/**
 * Indicates if the SP module is ready for setup call.
 * @return {boolean}
 */
StudyPlanning.prototype.ready = function () {
    return this.reloaded;
};

/**
 * retrieve initial data from the server.
 * @param {Boolean} showQuality, If quality needs to be shown after
 * @param {Boolean} qualityInput, If quality needs to show input page
 * @param {Boolean} showQuantity, If quantity needs to be shown after
 * @param {Boolean} quantityInput, If quantity needs to show input page
 */
StudyPlanning.prototype.getInitialData = function (showQuality,qualityInput,showQuantity,quantityInput) {
    this.reloaded = false;

    this.requestQuote(null,showQuality,qualityInput);
    this.requestGoals(null);
    this.requestLayout(null);
    this.requestProgress(null);
    if (showQuantity) {
        this.waitForQuantityData(quantityInput);
    }
};

/**
 * set if the library should use a controlGroup
 * @param {Boolean} status, where or not to use controlGroup
 */
StudyPlanning.prototype.useControlGroup = function (status) {
    this.useControlGroup = status;
};


/**
 * set the control group check function
 * @param {Function} check, a function that must return a boolean and has userData as parameter.
 */
StudyPlanning.prototype.setControlGroup = function (check) {
    this.controlGroupCheck = check
};

/**
 * run the controlGroupCheck
 * if there is no custom check then even userId is true
 * @returns {Boolean} if user is in control group
 */
StudyPlanning.prototype.isControlGroup = function () {
    if(this.useControlGroup) {
        let userData = this.Lambda.getUserData();
        if (typeof this.controlGroupCheck === 'undefined') {
            return (userData.userId % 2 === 0);
        } else {
            return this.controlGroupCheck(userData);
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
StudyPlanning.prototype.setQuote = function (q, saveToDB, switchView) {
    let object = this;

    this.quote = q;
    if (this.qualityLoaded) {
        $("#LambdaPlanningText").text(this.quote);
    }
    if (saveToDB) {
        this.sendQuote();
    }
    if (switchView) {
        setTimeout(this.qualityToggle(),600);
        setTimeout(function() {$("#QualityTextArea").val(object.quote)},2000);
    }
};

/**
 * get the quote
 * @returns {string} the quote
 */
StudyPlanning.prototype.getQuote = function () {
    return this.quote;
};

/**
 * saves the text from the textArea of the quality window and saves it to the server
 */
StudyPlanning.prototype.saveQuote = function () {
    if (this.qualityLoaded) {
        let textArea = $("#QualityTextArea");

        this.setQuote(textArea.val(), true, true);
        textArea.val("Saving quote...");
    }
};

/**
 * Sets a callback for the send quote function.
 * @param {Function} callback, the function to call
 */
StudyPlanning.prototype.setQuoteSendCallback = function (callback) {
    this.quoteSendCallback = callback;
};

/**
 * Sets a callback for the receive quote function.
 * @param {Function} callback, the function to call
 */
StudyPlanning.prototype.setQuoteReceivedCallBack = function (callback) {
    this.quoteReceivedCallback = callback;
};

/**
 * send quote to server.
 * If a callback is set this will be used.
 * @param {Object} args, optional argument for callback
 */
StudyPlanning.prototype.sendQuote = function (args) {
    let object = this;
    if (!this.Lambda.logCheck()) {
        return false;

    }
    let userData = this.Lambda.getUserData();

    let pageData = this.Lambda.getPageData();

    let settings = {
        "async": true,
        "crossDomain": true,
        "url": this.Lambda.getServerURL() + "/study-planning/setQuote",
        "method": "POST",
        "data": {
            "userId": userData.userId,
            "courseId": pageData.courseId,
            "sectionId": pageData.sectionId,
            "quote": this.quote,
        }
    };

    if(typeof(this.quoteSendCallback) === 'undefined') {
        $.ajax(settings)
    } else {
        $.ajax(settings).done(function (response) {
            object.quoteSendCallback(args, response)
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
StudyPlanning.prototype.requestQuote = function (args, showQualityAfter, qualityInput) {
    let object = this;

    if (!this.Lambda.logCheck()) {
        return false;
    }

    let userData = this.Lambda.getUserData();
    let pageData = this.Lambda.getPageData();

    let settings = {
        "async": true,
        "crossDomain": true,
        "url": this.Lambda.getServerURL() + "/study-planning/getQuote",
        "method": "POST",
        "data": {
            "userId": userData.userId,
            "courseId": pageData.courseId,
            "sectionId": pageData.sectionId
        }
    };



    $.ajax(settings).done(function (response) {
        if (typeof response === 'object') {
            object.setQuote(response.quote,false,false);
            if (showQualityAfter) {
                object.loadQualityPlanning(qualityInput);
            }
        }
        if(typeof(object.quoteReceivedCallback) !== 'undefined') {
            object.quoteReceivedCallback(args);
        }
    })

};

/**
 * Loads the quality planning content from the static library of edx.
 * @param {Boolean} inputMode, if the input mode should be shown
 */
StudyPlanning.prototype.loadQualityPlanning = function (inputMode) {
    let object = this;

    if (typeof this.qualityRef !== 'undefined') {
        if (!this.qualityLoaded) {
            if (!this.isControlGroup()) {
                if (this.Lambda.isEdx()) {
                    $("#LambdaFrame").load(object.qualityRef, function () {
                        object.qualityLoaded = true;

                        //Load text
                        $("#LambdaPlanningText").text(quote);
                        //Load user
                        $("#dx-username").text(object.Lambda.getUserData().userName);

                        if (inputMode) {
                            object.qualityToggle();
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
StudyPlanning.prototype.qualityToggle = function () {
    if (this.qualityLoaded) {
        $("#LambdaQualityFeedback").toggle();
        $("#LambdaQualityInput").toggle();
    }
};

/**
 * Loads the quantity planning content from the static library of edx.
 * @param {Boolean} inputMode, if the input mode should be shown
 * @param {Boolean} render, if the html data needs to be rendered after
 */
StudyPlanning.prototype.loadQuantityPlanning = function (inputMode, render) {
    let object = this;

    if (typeof this.quantityRef !== "undefined") {
        if (!this.quantityLoaded) {
            if (!this.isControlGroup()){
                if (this.Lambda.isEdx()) {
                    $("#LambdaFrame").load(object.quantityRef, function () {
                        object.quantityLoaded = true;

                        if (render) {
                            object.renderBars();
                            object.drawLayout();
                        }

                        if (inputMode) {
                            object.quantityToggle();
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
StudyPlanning.prototype.quantityToggle = function () {
    if (this.quantityLoaded) {
        $('#LambdaQuantityFeedback').toggle();
        $('#LambdaQuantityInput').toggle();
    }
};

/**
 * Set the new value of the problems to answer this week.
 * @param {Number} prob, the new amount of problems
 */
StudyPlanning.prototype.setProblems = function (prob) {
    this.problems = prob;
};

/**
 * Set the new value of the videos to watch this week.
 * @param {Number} vid, the new amount of videos to watch
 */
StudyPlanning.prototype.setVideos = function (vid) {
    this.videos = vid;

};

/**
 * Set the new value of the time to spend this week.
 * @param {Number} t, the new amount of time to spend
 */
StudyPlanning.prototype.setTime = function (t) {
    this.time = t;

};

/**
 * Set the new values of all goals.
 * @param {Number} prob, the new amount of problems
 * @param {Number} vid, the new amount of videos to watch
 * @param {Number} t, the new amount of time to spend
 * @param {Boolean} saveToDB, If the data needs to be send to the database
 * @param {Boolean} switchView, If the view needs to be toggled after execution
 */
StudyPlanning.prototype.setGoals = function (prob, vid, t, saveToDB, switchView) {
    this.setProblems(prob);
    this.setVideos(vid);
    this.setTime(t);

    if (quantityLoaded) {
        this.renderBars();
    }

    if (saveToDB) {
        this.sendGoals();
    }

    if (switchView) {
        setTimeout(this.quantityToggle,600);
    }

};

/**
 * Set the callback for the send goals function.
 * @param {Function} func, the function that is called as callback
 */
StudyPlanning.prototype.setGoalsSendCallback = function (func) {
    this.goalsSendCallback = func;
};

/**
 * Set the callback for the received goals from server function.
 * @param {Function} func, the function that is called as callback
 */
StudyPlanning.prototype.setGoalsReceivedCallback = function (func) {
    this.goalsReceivedCallback = func;
};

/**
 * Set the callback for the received progress from the server function.
 * @param {Function} func, the function that is called as callback
 */
StudyPlanning.prototype.setProgressReceivedCallback = function (func) {
    this.progressReceivedCallback = func
};

/**
 * Set the callback for the received progress from the server function.
 * @param {Function} func, the function that is called as callback
 */
StudyPlanning.prototype.setLayoutReceivedCallback = function (func) {
    this.layoutReceivedCallback = func;
};

/**
 * Send the goals to the server.
 * If a callback is set this will be used.
 * @param {Object} args, optional argument for callback
 * @returns {boolean} false if the data was not present
 */
StudyPlanning.prototype.sendGoals = function (args) {
    let object = this;

    if (!this.Lambda.logCheck()) {
        return false;
    }

    let userData = this.Lambda.getUserData();
    let pageData = this.Lambda.getPageData();

    let settings = {
        "async": true,
        "crossDomain": true,
        "url": this.Lambda.getServerURL() + "/study-planning/setGoal",
        "method": "POST",
        "data": {
            "userId": userData.userId,
            "courseId": pageData.courseId,
            "sectionId": pageData.sectionId,
            "problems": this.problems,
            "videos": this.videos,
            "time": this.time
        }
    };
    if(typeof(this.quoteSendCallback) === 'undefined') {
        $.ajax(settings)
    } else {
        $.ajax(settings).done(function (response) {
            object.quoteSendCallback(args, response)
        });
    }
};

/**
 * Get the goals from the server.
 * If a callback is set this will be used.
 * @param {Object} args, optional argument for callback
 */
StudyPlanning.prototype.requestGoals = function (args) {
    let object = this;

    if (!this.Lambda.logCheck()) {
        return false;
    }

    let userData = this.Lambda.getUserData();
    let pageData = this.Lambda.getPageData();

    let settings = {
        "async": true,
        "crossDomain": true,
        "url": this.Lambda.getServerURL() + "/study-planning/getGoal",
        "method": "POST",
        "data": {
            "userId": userData.userId,
            "courseId": pageData.courseId,
            "sectionId": pageData.sectionId
        }
    };
    $.ajax(settings).done(function (response) {
        if (typeof response === 'object') {
            object.setProblems(response.problems);
            object.setVideos(response.videos);
            object.setTime(response.time);
        }
        if(typeof(object.quoteReceivedCallback) !== 'undefined') {
            object.quoteReceivedCallback(args);
        }
    })
};

/**
 * Set the progress values in the progress object.
 * @param {Number} problems, progress in problems
 * @param {Number} videos, progress in videos
 * @param {Number} time, progress in time
 */
StudyPlanning.prototype.setProgress = function (problems, videos, time) {
    this.progress.problems = problems;
    this.progress.videos = videos;
    this.progress.time = time;
};

/**
 * Get the users progress from the server.
 * @param {Object} args, optional argument for callback
 * @returns {boolean} false if the data was not present
 */
StudyPlanning.prototype.requestProgress = function (args) {
    let object = this;

    if (!this.Lambda.logCheck()) {
        return false;
    }

    let userData = this.Lambda.getUserData();
    let pageData = this.Lambda.getPageData();

    let settings = {
        "async": true,
        "crossDomain": true,
        "url": this.Lambda.getServerURL() + "/study-planning/getProgress",
        "method": "POST",
        "data": {
            "userId": userData.userId,
            "courseId": pageData.courseId,
            "sectionId": pageData.sectionId
        }
    };
    $.ajax(settings).done(function (response) {
        if (typeof response === 'object') {
            object.setProgress(response.problemsCount, response.videoCount, response.timeCount);



        }
        if(typeof(object.quoteReceivedCallback) !== 'undefined') {
            object.quoteReceivedCallback(args);
        }
    })
};


/**
 * Get the course layout for the current week for example the amount of questions this week.
 * @param {Object} args, optional argument for callback
 * @returns {boolean} false if the data was not present
 */
StudyPlanning.prototype.requestLayout = function (args) {
    let object = this;

    if (!this.Lambda.logCheck()) {
        return false;
    }

    let pageData = this.Lambda.getPageData();

    let settings = {
        "async": true,
        "crossDomain": true,
        "url": this.Lambda.getServerURL() + "/study-planning/getLayout",
        "method": "POST",
        "data": {
            "courseId": pageData.courseId,
            "sectionId": pageData.sectionId
        }
    };
    $.ajax(settings).done(function (response) {
        if (typeof response === 'object') {
            object.setLayout(response[0].problems, response[0].videos, response[0].time);
        }
        if(typeof(object.quoteReceivedCallback) !== 'undefined') {
            object.quoteReceivedCallback(args);
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
StudyPlanning.prototype.setLayout = function (problems, videos, time) {
    this.layout.problems = problems;
    this.layout.videos = videos;
    this.layout.time = time;

    this.drawLayout();
};

/**
 * Load the layout in the html.
 */
StudyPlanning.prototype.drawLayout = function () {
    if (this.quantityLoaded) {
        $('#problemLayout').text(this.layout.problems);
        $('#videoLayout').text(this.layout.videos);
        $('#timeLayout').text(this.layout.time);

        //Set defaults values
        $('#problemInput').val(this.problems);
        $('#videoInput').val(this.videos);
        $('#timeInput').val(this.time);
    }
};

/**
 * Get all the goals of this week.
 * @returns {Object} object containing the goals
 */
StudyPlanning.prototype.getGoals = function () {
    let goals = {};
    goals.problems = this.problems;
    goals.videos = this.videos;
    goals.time = this.time;

    return goals;
};

/**
 * Get the layout of this week.
 * @return {Object} object containing layout of this week
 */
StudyPlanning.prototype.getLayout = function () {
    return this.layout
};

/**
 * Get the progress of this week.
 * @returns {Object} object containing the progress
 */
StudyPlanning.prototype.getProgress = function () {
    return this.progress
};


StudyPlanning.prototype.saveGoal = function () {
    let probGoal = Number($('#problemInput').val());
    let vidGoal = Number($('#videoInput').val());
    let timeGoal = Number($('#timeInput').val());

    let errorCount = 0;


    if (vidGoal < 0 || Math.floor(vidGoal) < vidGoal || typeof vidGoal !== 'number') {
        errorCount++;
        vidGoal = this.videos;
    }

    if (probGoal < 0 || Math.floor(probGoal) < probGoal || typeof probGoal !== 'number') {
        errorCount++;
        probGoal = this.problems;
    }

    if (timeGoal < 0 || Math.floor(timeGoal) < timeGoal || typeof timeGoal !== 'number') {
        errorCount++;
        timeGoal = this.time;
    }

    if (errorCount == 0) {
        quantitySaved();
    } else if (errorCount < 3) {
        quantitySaveError("Invalid Response: only whole numbers and video and questions goal cannot be bigger than total.<br> Only the valid inputs are saved to the server.")
    } else {
        quantitySaveError("Invalid Response: only whole numbers and video and questions goal cannot be bigger than total.")
    }

    this.setGoals(probGoal,vidGoal,timeGoal,true,true);

};

/**
 * Renders the progress bars on the page.
 */
StudyPlanning.prototype.renderBars = function () {

    let pro = [];
    pro.push(this.progress.videos);
    pro.push(this.progress.problems);
    pro.push(this.progress.time);

    let goal = [];
    goal.push(this.videos);
    goal.push(this.problems);
    goal.push(this.time);

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
StudyPlanning.prototype.waitForQuantityData = function (quantityInput) {
    let object = this;

    if (typeof this.time !== 'undefined'
        && typeof this.progress.time !== 'undefined'
        && typeof this.layout.time !== 'undefined'
    ) {
        this.loadQuantityPlanning(quantityInput,true);
    } else {
        setTimeout(function () {
            object.waitForQuantityData(quantityInput);
        }, 200);
    }
};
