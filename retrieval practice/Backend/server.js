//Adds an random selection function to the Array
Array.prototype.random = function () {
    return this[Math.floor((Math.random()*this.length))];
};

//---Config variables

// ports:
let httpPort = 80;
let httpsPort = 443;

// header settings
let origin = "*";
let headers = "Origin, X-Requested-With, Accept, X-CSRFToken, chap, seq, vert";

//To indicate if you are running an development environment
let dev = true;
// To allow to download data from server
let enableDownload = false;



//Loading all  dependencies and setting global variables
let express = require('express');
let json2csv = require('json2csv');
let app = express();    // Create a service (the app object is just a callback).
let https = require('https');
let http = require('http');
let fs = require('fs');
let bodyParser = require('body-parser');
let mongoose = require('mongoose');

let connectOptions = {
    db: { native_parser: true },
    server: { poolSize: 5 }
};

mongoose.connect('localhost:27017/EdEx',connectOptions);

mongoose.connection.on('connected', function () {
    console.log('Mongoose default connection open to EdEx');
});

// If the connection throws an error
mongoose.connection.on('error',function (err) {
    console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
});

let Schema = mongoose.Schema;

// This line is from the Node.js HTTPS documentation.
let options = {
    key: fs.readFileSync('../../certs/server.key'),
    cert: fs.readFileSync('../../certs/lambda-rp_ewi_tudelft_nl.crt')
};


//All the database Schema's
// calculation data -------------------------------------------------------|

//Schema that links sections to an progression level
let sectionLevelSchema = new Schema({
    sectionId: {type: String, unique: true},
    sectionLevel: Number,
    courseId: String
});

//Schema that allows to link sessions to responses and requests
let sessionTrakerSchema = new Schema({
    sessionId: Number,
    userId: Number,
    problemId: String,
    verticalId: String,
    courseId: String
});

//Schema that allows for users to Opt-out of the experience
let optOutSchema = new Schema({
    userId: Number,
    courseId: String
});

//Schema that logs the users maximum progress for retrieval calculations
let userProgressSchema = new Schema({
    userId: Number,
    courseId: String,
    maxSectionId: String
});

//Schema for the questions that are asked
let courseDataSchema = new Schema({
    problem: Object,
    problemId: String,
    verticalId: String,
    subSectionId: String,
    sectionId: String,
    lvl: Number,
    courseId: String,
    disabled: Boolean
});
// ------------------------------------------------------------------------|



// Log data ---------------------------------------------------------------|
// Raw data for research purpose


//Schema for the users response to an question
let popupResponseLogSchema = new Schema({
    problemId: String,
    userId: Number,
    sessionId: Number,
    sectionId: String,
    courseId: String,
    verticalId: String,
    answered: Boolean,
    correct:  Boolean,
    timeStamp: { type: Date, default: Date.now }
});

//Schema for Logging the users request for an popup
let popupRequestLogSchema = new Schema({
    timeStamp: { type: Date, default: Date.now },
    problemId: String,
    sessionId: Number,
    userId: Number,
    sectionId: String,
    courseId: String,
    verticalId: String,
    buttonPressed: Boolean

});

//Schema for logging the users location in the course
let userLogSchema = new Schema({
    timeStamp: { type: Date, default: Date.now },
    userId: Number,
    sectionId: String,
    courseId: String,
    verticalId: String,
    closing: Boolean
});

// ------------------------------------------------------------------------|

//----Adding methods to the schemas ---------------------------------------|
/**
 * Create sectionLevel object based on and input id and level number.
 * @param {String} sectionId - the section id to create
 * @param {number} sectionLvl - the level of the section
 */
sectionLevelSchema.statics.createSectionLvl = function(sectionId,sectionLvl,courseId) {
    //check if it already exists
    this.find({sectionId: sectionId},function (err,doc) {
        if (err) return console.error(err);
        if (doc.length > 0){
            return false
        }else {
            let newSectionLvl = new sectionLevelsDB({sectionId: sectionId, sectionLevel: sectionLvl, courseId: courseId});
            newSectionLvl.save(function (err) {
                if (err) return console.error(err);
            });
        }
    });
};

/**
 * Update the users maximum visited section.
 * @param {String} sectionId - the current section
 * @param {String} userId - the user's id
 * @param {String} courseId - the course
 */
userProgressSchema.statics.update = function (sectionId,userId,courseId) {
    this.findOne({userId: userId, courseId: courseId},function (err,userPro) {
        if (err) return console.error(err);
        //Check if there is already an record of that user
        if(userPro) {
            //get the levels from the database
            sectionLevelsDB.find({
                $or: [{sectionId: sectionId},{sectionId: userPro.maxSectionId}]},function (err,sectionLevels) {
                if (err) return console.error(err);
                //only if we found 2 instances
                if (sectionLevels.length == 2) {
                    //if [0] is the current check if that is bigger than max
                    if (sectionLevels[0].sectionId == sectionId) {
                        if (sectionLevels[0].sectionLevel > sectionLevels[1].sectionLevel) {
                            userPro.maxSectionId = sectionId;
                            userPro.save(function (err) {
                                if (err) return console.error(err);
                            });
                        } else {
                            return false;
                        }
                    } else { //if [1] is the current check if that is bigger than max
                        if (sectionLevels[1].sectionLevel > sectionLevels[0].sectionLevel) {
                            userPro.maxSectionId = sectionId;
                            userPro.save(function (err) {
                                if (err) return console.error(err);
                            });
                        } else {
                            return false;
                        }
                    }
                }else if(sectionLevels.length == 1){
                    return console.log("same as maximum week");
                }else {
                    return console.error("data query failed");
                }
            });
        } else {
            let newUserProgress = new userProgressDB({userId: userId, courseId: courseId, maxSectionId: sectionId});
            newUserProgress.save(function (err) {
                if (err) return console.error(err);
            });
        }
    })
};
/**
 * Get the users max lvl for a course
 * @param userId
 * @param courseId
 */
userProgressSchema.statics.getlvl = function (userId,courseId) {
    this.findOne({userId: userId, courseId: courseId},function (err,userPro) {
        if (err) return console.error(err);
        if (userPro) {
            return userPro.maxSectionId;
        }
    });
};
//-------------------------------------------------------------------------|



//All the database Models based on the above defined schemas
let userProgressDB = mongoose.model("userProgress",userProgressSchema);
let sectionLevelsDB = mongoose.model("sectionLevels",sectionLevelSchema);
let courseDataDB = mongoose.model("courseDataList",courseDataSchema);
let optOutDB = mongoose.model("optOut",optOutSchema);
let sessionDB = mongoose.model("sessionTracker",sessionTrakerSchema);

let popupResponseLog = mongoose.model("popupResponseLog",popupResponseLogSchema);
let popupRequestLog = mongoose.model("popupRequestLog",popupRequestLogSchema);
let userLog = mongoose.model("userLog",userLogSchema);

// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// setting global request parameters
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Headers", headers);
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST");
    next();
});

// ROUTES FOR OUR API
// =============================================================================
let router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
    next();
});

/**
 * deals with the popup requests
 * Only sent question pop-ups about questions of a lesser course sessions of the user registered highest course session and not there current section.
 * Step 0: check if user is not opt-out
 * Step 1: check highest section id know
 * Step 2: get all question id's that can be asked based on section progress
 * Step 3: select a random question
 * @param {String} user - the users id
 * @param {String} courseId - the course id
 * @param {String} section - the section id
 * @param {String} verticalId - the vertical id
 * @return {String} problem or message - Json string of the problem object or an error message
 */
router.route('/popupRequest').post(function (req,res) {
    //handel the request for a popup

    if (req.body.user != undefined && req.body.courseId != undefined && req.body.section != undefined) {
        //get parameters from client
        let userId = req.body.user;
        let courseId = req.body.courseId;
        let sectionId = req.body.section;
        let verticalId = req.body.verticalId;
        let button = req.body.button;


        let maxLvl;
        let currentLvl;

        //Check if user wants popup
        optOutDB.findOne({userId: userId, courseId: courseId},function (err,optUser) {
            if (optUser){
                console.log("User is opt-out");
                res.end("User is opt-out");
                return false;
            }else {
                //get the users max section
                userProgressDB.findOne({userId: userId, courseId: courseId}, function (err, userPro) {
                    if (err) return console.error(err);
                    if (userPro) {
                        // get the current section lvl and the max section lvl
                        sectionLevelsDB.find({
                            $or: [{sectionId: sectionId}, {sectionId: userPro.maxSectionId}]
                        }, function (err, sectionLevels) {
                            if (err) return console.error(err);

                            // check if the were 2 sections with lvls
                            if (sectionLevels.length == 2) {
                                // set them in the right order
                                if (sectionLevels[0].sectionId == sectionId) {
                                    currentLvl = sectionLevels[0].sectionLevel;
                                    maxLvl = sectionLevels[1].sectionLevel;
                                } else { //if [1] is the current check if that is bigger than max
                                    currentLvl = sectionLevels[1].sectionLevel;
                                    maxLvl = sectionLevels[0].sectionLevel;
                                }

                                //get all problems from the database older than max lvl and not equal to current lvl
                                courseDataDB.find({
                                    $and: [
                                        {lvl: {$lt: maxLvl}},
                                        {lvl: {$ne: currentLvl}},
                                        {disabled: {$ne: true}}
                                    ]
                                }, "problem", function (err, problems) {
                                    if (err) return console.error(err);

                                    //send a random problem to the client
                                    if (problems.length > 0) {
                                        let problem = problems.random().problem;

                                        //build new session
                                        let newSession = {
                                            sessionId: 0,
                                            userId: userId,
                                            verticalId: verticalId,
                                            courseId: courseId,
                                            problemId: problem.id
                                        };

                                        console.log("New session:");
                                        console.log(newSession);
                                        //check for existing one and update
                                        sessionDB.findOne({ userId: userId, courseId: courseId }, (err, doc) => {
                                            if (doc){
                                                console.log("old session found");
                                                newSession.sessionId = doc.sessionId + 1
                                            }
                                            const session = (doc) ? Object.assign(doc, newSession) : new sessionDB(newSession);
                                            console.log("no old session building new one");

                                            //saving new session data
                                            session.save((saveErr, savedsession) => {
                                                if (saveErr) throw saveErr;
                                                console.log("new session saved");
                                                console.log(savedsession);

                                                //setting up request data for data base entry
                                                let items = {
                                                    problemId: problem.id,
                                                    sessionId: newSession.sessionId,
                                                    userId: userId,
                                                    sectionId: sectionId,
                                                    courseId: courseId,
                                                    verticalId: verticalId,
                                                    buttonPressed: button
                                                };

                                                let log = new popupRequestLog(items);
                                                log.save(function (err) {
                                                    if (err) {
                                                        console.log("save error:");
                                                        return console.error(err);
                                                    }
                                                });

                                            });
                                        });

                                        console.log("Sending problem: '" + problem.id + "' to user");
                                        res.end(JSON.stringify(problem));
                                    } else {
                                        res.end("no problem found");
                                        return  console.log("No problem found time to break free");
                                    }
                                })

                            }else if(sectionLevels.length == 1){

                                // set them in the right order
                                if (sectionLevels[0].sectionId == sectionId) {
                                    currentLvl = sectionLevels[0].sectionLevel;
                                    maxLvl = sectionLevels[0].sectionLevel;
                                }

                                //get all problems from the database older than max lvl and not equal to current lvl
                                courseDataDB.find({
                                    $and: [
                                        {lvl: {$lt: maxLvl}},
                                        {lvl: {$ne: currentLvl}},
                                        {disabled: {$ne: true}}
                                    ]
                                }, "problem", function (err, problems) {
                                    if (err) return console.error(err);

                                    //send a random problem to the client
                                    if (problems.length > 0) {
                                        let problem = problems.random().problem;
                                        //build new session
                                        let newSession = {
                                            sessionId: 0,
                                            userId: userId,
                                            verticalId: verticalId,
                                            courseId: courseId,
                                            problemId: problem.id
                                        };

                                        console.log("New session:");
                                        console.log(newSession);
                                        //check for existing one and update
                                        sessionDB.findOne({ userId: userId, courseId: courseId }, (err, doc) => {
                                            if (doc){
                                                console.log("old session found");
                                                newSession.sessionId = doc.sessionId + 1
                                            }
                                            const session = (doc) ? Object.assign(doc, newSession) : new sessionDB(newSession);
                                            console.log("no old session building new one");

                                            //saving new session data
                                            session.save((saveErr, savedsession) => {
                                                if (saveErr) throw saveErr;
                                                console.log("new session saved");
                                                console.log(savedsession);

                                                //setting up request data for data base entry
                                                let items = {
                                                    problemId: problem.id,
                                                    sessionId: newSession.sessionId,
                                                    userId: userId,
                                                    sectionId: sectionId,
                                                    courseId: courseId,
                                                    verticalId: verticalId,
                                                    buttonPressed: button
                                                };

                                                let log = new popupRequestLog(items);
                                                log.save(function (err) {
                                                    if (err) {
                                                        console.log("save error:");
                                                        return console.error(err);
                                                    }
                                                });

                                            });
                                        });

                                        console.log("Sending problem: '" + problem.id + "' to user");
                                        res.end(JSON.stringify(problem));
                                    } else {
                                        console.log("No problem found");
                                        res.end("no problem found");
                                    }
                                })
                            } else {
                                res.end("No match");
                                return console.error("not a good match in database");
                            }
                        });
                    }
                });
            }
        });
    } else {
        console.log("missing parameters");
        res.end("missing parameters")
    }

});

router.route('/getStructureData').post(function (req,res) {
    if(dev){
        let courseId = req.body.courseId;

        sectionLevelsDB.find({courseId: courseId},{"sectionId":1, "sectionLevel":1 ,"_id":0},function (err,result) {
            if (err) return console.error(err);
            res.json(result);
        });
    }else {
        res.end("Error: Not in dev mode!");
    }
});

router.route('/getBackendData').post(function (req,res) {
    var returner = {};

    //count responses
    popupResponseLog.count({}, function (err, resCount) {
        if (err) return console.error(err);
        returner.responseCount = resCount;

        //count requests
        popupRequestLog.count({}, function (err, reqCount) {
            if (err) return console.error(err);
            returner.requestCount = reqCount;

            //count questions
            courseDataDB.count({}, function (err, probCount) {
                if (err) return console.error(err);
                returner.questionCount = probCount;

                //count user activates
                userLog.count({}, function (err, userCount) {
                    if (err) return console.error(err);
                    returner.userActivitiesCount = userCount;

                    //get all course Ids for selections
                    courseDataDB.distinct("courseId", function (err, courseIds) {
                        if (err) return console.error(err);
                        returner.courses = courseIds;
                        returner.dev = dev;
                        res.json(returner);
                    });
                });
            });
        });

    });
});


/**
 * deals with the popup responses.
 * Ads the record to the database of the user's response
 * @param {String} user - the users id
 * @param {String} courseId - the course id
 * @param {String} section - the section id
 * @param {String} verticalId - the vertical id
 * @param {String} problemId - the problem id
 * @param {Boolean} answered - if the user answered the popup
 * @param {Boolean} correct - if the answer was correct
 * @return {String} message - if the action was successful or not
 */
router.route('/popupResponse').post(function (req,res) {
    if (req.body.user != undefined && req.body.courseId != undefined && req.body.section != undefined) {
        //get parameters from client
        let userId = req.body.user;
        let courseId = req.body.courseId;
        let sectionId = req.body.section;
        let verticalId = req.body.verticalId;
        let problemId = req.body.problemId;
        let answered = req.body.answered;
        let correct = req.body.correct;

        sessionDB.findOne({userId: userId, courseId: courseId, problemId: problemId}, function (err,doc) {
            if (err) {
                console.log("find error:");
                return console.error(err);
            }

            let items = {
                problemId: problemId,
                userId: userId,
                sessionId: doc.sessionId,
                sectionId: sectionId,
                courseId: courseId,
                verticalId: verticalId,
                answered: answered,
                correct: correct,
            };

            let log = new popupResponseLog(items);
            log.save(function (err) {
                if (err) {
                    console.log("save error:");
                    return console.error(err);
                }
            });

            console.log("logging user: "+userId+ " his/her response");
            res.end("logging user: "+userId+ " his/her response");
        });

    } else {
        console.log("missing parameters");
        res.end("missing parameters")
    }
});

/**
 * Adds the user to the opt-out list based on the input parameters.
 * @param {String} user - the users id
 * @param {String} courseId - the course id
 * @return {String} message - if the action was successful or not
 */
router.route('/optOut').post(function (req,res) {
    let userId = req.body.user;
    let courseId = req.body.courseId;

    let newOptOut = new optOutDB(userId,courseId);
    newOptOut.save(function (err) {
        if (err) {
            console.log("save error:");
            return console.error(err);
        }
        res.end("user is opt-out");
    });
});

/**
 * Sends all the logs of all the users there max session to requester.
 * @return {String} message - Json representation of the userLog table
 */
router.route('/debuglog').post(function (req,res) {
    if(dev) {
        userLog.find({}, function (err, logs) {
            if (err) return console.error(err);
            res.end(JSON.stringify(logs));
        });
    }else {
        res.end("Error: Not in dev mode!");
    }
});

/**
 * Sends all the logs of all the users there max session to requester.
 * @return {String} message - Json representation of the userProgress table
 */
router.route('/debugusers').post(function (req,res) {
    if(dev) {
        userProgressDB.find({}, function (err, logs) {
            if (err) return console.error(err);
            res.end(JSON.stringify(logs));
        });
    }else {
        res.end("Error: Not in dev mode!");
    }
});

/**
 * Sends all the logs of the input user's course position to the requester.
 * @param {String} userId - the user id to debug
 * @return {String} message - Json representation of a users records in the userLog table
 *
 */
router.route('/debuguser').post(function (req,res) {
    if(dev) {
        userLog.find({userId: req.body.userId}, function (err, logs) {
            if (err) return console.error(err);
            res.end(JSON.stringify(logs));
        });
    }else {
        res.end("Error: Not in dev mode!");
    }
});


router.route('/checkCount').post(function (req,res) {
    if(dev) {
        popupRequestLog.find({},function (err, logs) {
            if (err) return console.error(err);
            res.end(JSON.stringify({count: logs.length, data: logs}));
        })
    } else {
        res.end("Error: Not in dev mode!")
    }
});


/**
 * Sends all the problems to the requester.
 * @return {String} message - Json representation of all the problems in the courseData table
 */
router.route('/getProblems').post(function (req,res) {
    if(dev) {
        if (req.body.courseId != undefined){
            courseDataDB.find({courseId: req.body.courseId}, function (err, problems) {
                if (err) return console.error(err);
                res.json(problems);
            });
        } else {
            res.end("missing parameters")
        }
    } else {
        res.end("Error: Not in dev mode!");
    }
});

/**
 * sets the state of an problem entry.
 * @return {String} message - Json representation of query result
 */
router.route('/editProblem').post(function (req,res) {
    if(dev) {
        if (req.body.courseId != undefined && req.body.problemId != undefined && req.body.problem != undefined){
            courseDataDB.update({courseId: req.body.courseId, problemId: req.body.problemId},{lvl: req.body.lvl, problem: req.body.problem, sectionId: req.body.sectionId, subSectionId: req.body.subSectionId, verticalId: req.body.verticalId,disabled: req.body.disabled}, function (err, problems) {
                if (err) return console.error(err);
                res.end(JSON.stringify(problems));
            });
        } else {
            res.end("missing parameters")
        }
    } else {
        res.end("Error: Not in dev mode!");
    }
});

/**
 * Sends all the responses to the requester.
 * @return {String} message - Json representation of all the responses in the popupResponseLog table
 */
router.route('/deresponse').post(function (req,res) {
    if(dev) {
        popupResponseLog.find({courseId: "DD.003x"}, function (err, problems) {
            if (err) return console.error(err);
            res.end(JSON.stringify(problems));
        });
    } else {
        res.end("Error: Not in dev mode!");
    }
});

/**
 * Sends all the requests to the requester.
 * @return {String} message - Json representation of all the requests in the popupRequestLog table
 */
router.route('/debugrequest').post(function (req,res) {
    if(dev) {
        popupRequestLog.find({courseId: "DD.003x"}, function (err, problems) {
            if (err) return console.error(err);
            res.end(JSON.stringify(problems));
        });
    } else {
        res.end("Error: Not in dev mode!");
    }
});

/**
 * Sends all the requests to the requester.
 * @return {String} message - Json representation of all the requests in the popupRequestLog table
 */
router.route('/debugsessions').post(function (req,res) {
    if(dev) {
        sessionDB.find({}, function (err, problems) {
            if (err) return console.error(err);
            res.end(JSON.stringify(problems));
        });
    } else {
        res.end("Error: Not in dev mode!");
    }
});


/**
 *  Lets the user download the csv data of the provided course.
 *  @param {String} courseId - the course to download data from
 *  @return {File} File - csv file containing course data
 */
router.route('/downloadData').post(function (req,res) {
    if(dev && enableDownload) {
        if (req.body.courseId != undefined){
            let file = __dirname + '/' + req.body.courseId + '_data.csv';
            res.download(file);
        } else {
            res.end("missing parameters")
        }
    } else {
        res.end("Error: Not in dev mode!");
    }
});

/**
 * Sends the course results to the client and builds an csv file called [COURSEID]_data.csv.
 * @param {String} courseId - the course to gather data from
 * @return {String} message - Json representation of the course data result
 */
router.route('/buildResults').post(function (req,res) {
    if(dev) {
        if (req.body.courseId != undefined) {
            //Getting all question data
            courseDataDB.find({},'problemId lvl',function (err, questionData) {
                //Build quick access array for question level data
                let questionLevels = [];
                for (let i = 0; i < questionData.length; i++){
                    questionLevels[questionData[i].problemId] = questionData[i].lvl;
                }

                //Get all the popup responses
                popupResponseLog.find({courseId: req.body.courseId}, 'userId timeStamp problemId sectionId verticalId answered correct', { sort:{ userId : 1, timeStamp : 1 }}).lean().exec(function (err, data) {
                    if (err) {
                        return console.error(err);
                    }
                    //Getting all section lvl data for mutations
                    sectionLevelsDB.find({},function (err, levelData) {
                        if (err) {
                            return console.error(err);
                        }
                        //building quick access array for section level
                        let levels = {};
                        for(let i = 0; i < levelData.length; i++){
                            levels[levelData[i].sectionId] = levelData[i].sectionLevel;
                        }

                        //Getting all the request data for the mutations
                        popupRequestLog.find({courseId: req.body.courseId}, 'userId timeStamp problemId sectionId verticalId', { sort:{ userId : 1, timeStamp : 1 }}).lean().exec(function (err,requestData) {
                            if (err) {
                                return console.error(err);
                            }

                            //Linking request and response

                            //let lastIndex;
                            let sessionData = {};
                            let problems = [];
                            let resIndex = 0;
                            let reqHitIndex = 0;

                            for (let i = 0; i < requestData.length; i++) {

                                //Applying id to request
                                if (sessionData[requestData[i].userId] == undefined) {
                                    sessionData[requestData[i].userId] = 0;
                                }
                                sessionData[requestData[i].userId]++;
                                requestData[i].sessionId = requestData[i].userId + "-" + sessionData[requestData[i].userId];
                            }

                            // adding the id to the responses
                            do {
                                problems = [];
                                // for all the requests starting from the last hit
                                for (let i = reqHitIndex; i < requestData.length; i++) {
                                    let sessionTime = undefined;
                                    // compare it to responses
                                    while (resIndex < data.length && data[resIndex].userId == requestData[i].userId && data[resIndex].problemId == requestData[i].problemId) {
                                        // convert time to json objects
                                        let requestTime = new Date(requestData[i].timeStamp);
                                        let responseTime = new Date(data[resIndex].timeStamp);
                                        //check for location or time
                                        if (data[resIndex].verticalId == requestData[i].verticalId || timeDiff(requestTime, responseTime) < 125000) {
                                            // assigning data to the response
                                            data[resIndex].sessionId = requestData[i].sessionId;

                                            // time calculations
                                            // response time
                                            data[resIndex].time = requestData[i].timeStamp;
                                            if(sessionTime == undefined){
                                                sessionTime = new Date(data[resIndex].timeStamp);
                                                data[resIndex].responseDuration = timeDifference(new Date(requestData[i].timeStamp),new Date(data[resIndex].timeStamp));
                                            } else {
                                                data[resIndex].responseDuration = timeDifference(sessionTime,new Date(data[resIndex].timeStamp));
                                            }
                                            // instance time
                                            data[resIndex].instanceDuration = timeDifference(new Date(requestData[i].timeStamp),new Date(data[resIndex].timeStamp));
                                            delete data[resIndex].timeStamp;

                                            reqHitIndex = i;
                                            resIndex++;
                                        } else {
                                            break;
                                        }
                                    }
                                }


                                // Looping over all data to do mutations
                                for (let i = 0; i < data.length; i++) {
                                    // adding levels and incorrectness fields
                                    data[i].problemLevel = questionLevels[data[i].problemId];
                                    data[i].incorrect = !data[i].correct;
                                    data[i].sectionLevel = levels[data[i].sectionId];

                                    //counting problem cases
                                    if (data[i].sessionId == undefined) {
                                        problems.push(data[i]);
                                    }
                                }
                                if (problems.length > 0) {
                                    data.splice(resIndex,1);
                                }
                            } while (problems.length > 0);

                            // declaring csv fields
                            let fields = ['_id','problemId','problemLevel','sectionId','verticalId','userId','answered','correct','incorrect','sectionLevel','sessionId','time','responseDuration','instanceDuration'];

                            // building csv file
                            let csv = json2csv({ data: data, fields: fields });
                            fs.writeFile(req.body.courseId+ '_data.csv', csv, function(err) {
                                if (err) throw err;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({fileState: "File 'data.csv' is saved",problems: problems, data: data, requestData: requestData}));
                            });
                        });
                    });
                });
            });
        }else {
            res.end("missing parameters")
        }
    } else {
        res.end("Error: Not in dev mode!");
    }
});

/**
 * Sends all the Sessions and there levels to the requester.
 * @return {String} message - Json representation of the sectionLevel table
 */
router.route('/debuglvl').post(function (req,res) {
    if(dev) {
        sectionLevelsDB.find({}, function (err, levels) {
            if (err) return console.error(err);
            res.end(JSON.stringify(levels));
        });
    } else {
        res.end("Error: Not in dev mode!");
    }
});

router.route('/debugQuery').post(function (req,res) {
    res.end("not used right now")
});


/**
 * removes an question from the database based on input id.
 * @return {String} message - if the action was successful or not
 */
router.route('/remove').post(function (req,res) {
    if(dev) {
        courseDataDB.find({problemId: req.body.problemId}).remove().exec(function () {
            res.end("removed: " + req.body.problemId);
        });
    } else {
        res.end("Error: Not in dev mode!");
    }
});

/**
 * ads an Section and its level to the database based on the input id and level.
 * @param {String} section - the section id to add to the database
 * @param {String} level - the sections level
 * @return {String} message - if the action was successful or not
 */
router.route('/insertLevel').post(function (req,res) {
    if(dev) {
        //console.log(req.body.section);
        //console.log(req.body.level);
        if (req.body.section != undefined && req.body.level != undefined && req.body.courseId != undefined) {
            sectionLevelsDB.createSectionLvl(req.body.section, parseInt(req.body.level), req.body.courseId);
            console.log("added: " +req.body.section);
        }
        res.end("done!");
    }else {
        res.end("Error: Not in dev mode!");
    }
});

/**
 * removes an Section and its level from the database based on the input id and level.
 * @param {String} section - the section id to add to the database
 * @param {String} level - the sections level
 * @return {String} message - if the action was successful or not
 */
router.route('/removeLevel').post(function (req,res) {
    if(dev) {
        //console.log(req.body.section);
        //console.log(req.body.courseId);
        if (req.body.section != undefined && req.body.courseId != undefined) {
            sectionLevelsDB.findOneAndRemove({sectionId: req.body.section, courseId: req.body.courseId},function (err,result) {
                if (err) return console.error(err);
                //console.log(result);
                res.end("done!");
            });
            console.log("removed: "+ req.body.section);
        }
    }else {
        res.end("Error: Not in dev mode!");
    }
});


/**
 * Logs the users position in the course.
 * @param {String} user - the users id
 * @param {String} courseId - the course id
 * @param {String} section - the section id
 * @param {String} verticalId - the vertical id
 * @param {Boolean} eventState - to indicate if it was page open or leave
 * @return {String} message - if the action was successful or not
 */
router.route('/loguser').post(function (req,res) {
    if (req.body.user != undefined && req.body.courseId != undefined && req.body.section != undefined) {
        //get parameters from client
        let userId = req.body.user;
        let courseId = req.body.courseId;
        let sectionId = req.body.section;
        let verticalId = req.body.verticalId;
        let status = req.body.eventState;

        //call the update function with thees parameters
        userProgressDB.update(sectionId,userId,courseId);

        let items = {
            userId: userId,
            sectionId: sectionId,
            courseId: courseId,
            verticalId: verticalId,
            closing: status
        };
        let log = new userLog(items);
        log.save(function (err) {
            if (err) {
                console.log("save error:");
                return console.error(err);
            }
        });

        console.log(new Date()+" "+"updating user: "+userId+ " his/her progress at " + courseId + " " +sectionId + " " + verticalId);
        res.end("updating user: "+userId+ " his/her progress");
    }else {
        res.end("missing parameters")
    }

});

/**
 * Deals with the uploading of questions.
 * @param {String} problems - array of problem objects that are converted using the Json parser
 * @return {String} message - if the action was successful or not
 */
router.route('/upload').post(function (req, res) {
    //check if there are problems
    if(req.body.problems != undefined){
        //save them to local var
        let problems = req.body.problems;

        //for all problems:
        for(let i = 0; i < problems.length; i++){
            if (problems[i] != undefined) {
                //construct the object
                let items = {
                    problem: problems[i].problem,
                    problemId: problems[i].problem.id,
                    verticalId: problems[i].verticalId,
                    subSectionId: problems[i].subSectionId,
                    sectionId: problems[i].sectionId,
                    lvl: problems[i].lvl,
                    courseId: problems[i].courseId
                };

                //create new sectionLevel entry based on upload
                sectionLevelsDB.createSectionLvl(problems[i].sectionId, problems[i].lvl, problems[i].courseId);

                //create new problem based on the uploaded object
                if(!(items.problem.type == "optionresponse")) {
                    let newProblem = new courseDataDB(items);
                    newProblem.save(function (err) {
                        if (err) {
                            console.log("save error:");
                            return console.error(err);
                        }
                    });
                }
            }
        }
        console.log("Uploaded " + problems.length + " items to " + problems[0].courseId);
    }

    res.end("Upload Successful");
});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);
app.use(express.static('public'));


// START THE SERVER
// =============================================================================
// Create an HTTP service.
http.createServer(app).listen(httpPort);
// Create an HTTPS service identical to the HTTP service.
https.createServer(options, app).listen(httpsPort);
console.log('Node server start on port: ' + httpPort + ' for http and port: '+ httpsPort + ' for https');

function msToTime(s) {

    // Pad to 2 or 3 digits, default is 2
    function pad(n, z) {
        z = z || 2;
        return ('00' + n).slice(-z);
    }

    let ms = s % 1000;
    s = (s - ms) / 1000;
    let secs = s % 60;
    s = (s - secs) / 60;
    let mins = s % 60;
    let hrs = (s - mins) / 60;

    return pad(hrs) + ':' + pad(mins) + ':' + pad(secs) + '.' + pad(ms, 3);
}

function timeDifference(start, end) {
    let diff;
    if(start < end){
        diff = end - start;
    } else {
        diff = start - end;
    }
    return msToTime(diff)

}

function timeDiff(start, end) {
    let diff;
    if(start < end){
        diff = end - start;
    } else {
        diff = start - end;
    }
    return diff;

}