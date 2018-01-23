/**
 * Created by caspar on 10/22/2017.
 */
let express = require('express');
let mongoose = require('mongoose');

//Get promise library
mongoose.Promise = require('bluebird');

let connectOptions = {
    useMongoClient: true,
    poolSize: 5
};

mongoose.connect('mongodb://user:1a4#hkyHBWI&CMeJ@localhost:27017/Lambda',connectOptions);

mongoose.connection.on('connected', function () {
    console.log('Lambda: Mongoose default connection open to Lambda database');
});

// If the connection throws an error
mongoose.connection.on('error',function (err) {
    console.log('Lambda: Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
    console.log('Lambda: Mongoose default connection disconnected');
});

let Schema = mongoose.Schema;

let UserTrackingDB = require('../schemas/userTracking.js');
let ProblemTrackingDB = require('../schemas/problemTracking.js');
let VideoTrackingDB = require('../schemas/videoTracking.js');


// ROUTES FOR OUR API
// =============================================================================

// create our router
let router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Accept, X-CSRFToken, chap, seq, vert");
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST");
    next();
});

router.route("/logUserActivity").post(function (req, res) {
    let userId = req.body.userId;
    let courseId = req.body.courseId;
    let sectionId = req.body.sectionId;
    let verticalId = req.body.verticalId;
    let timeStart = req.body.timeStart;

    let checking = [];
    checking.push(userId);
    checking.push(courseId);
    checking.push(sectionId);
    checking.push(verticalId);
    checking.push(timeStart);


    //Check if all the data is present
    if (required(checking)) {
        let data = {
            userId: String(userId),
            courseId: courseId,
            sectionId: sectionId,
            verticalId: verticalId,
            timeStart: timeStart
        };

        UserTrackingDB.create(data, function (err, entry) {
            if (err !== null) {
                return console.error(err);
            }
            console.log("log entry saved");
            res.end("entry saved");
        });

    } else {
        res.end("error");
    }
});

router.route("/logProblemActivity").post(function (req, res) {
    let userId = req.body.userId;
    let courseId = req.body.courseId;
    let sectionId = req.body.sectionId;
    let verticalId = req.body.verticalId;
    let problemId = req.body.problemId;

    let checking = [];
    checking.push(userId);
    checking.push(courseId);
    checking.push(sectionId);
    checking.push(verticalId);
    checking.push(problemId);

    //Check if all the data is present
    if (required(checking)) {
        let data = {
            userId: String(userId),
            courseId: courseId,
            sectionId: sectionId,
            verticalId: verticalId,
            problemId: problemId
        };

        ProblemTrackingDB.create(data, function (err, entry) {
            if (err !== null) {
                return console.error(err);
            }
            console.log("problem entry saved");
            res.end("entry saved");
        });
    }



});

router.route("/logVideoActivity").post(function (req, res) {
    let userId = req.body.userId;
    let courseId = req.body.courseId;
    let sectionId = req.body.sectionId;
    let verticalId = req.body.verticalId;
    let videoId = req.body.videoId;
    let videoStart = req.body.videoStart;
    let videoEnd = req.body.videoEnd;
    let timeWatched = req.body.timeWatched;

    let checking = [];
    checking.push(userId);
    checking.push(courseId);
    checking.push(sectionId);
    checking.push(verticalId);
    checking.push(videoId);
    checking.push(videoStart);
    checking.push(videoEnd);
    checking.push(timeWatched);

    //Check if all the data is present
    if (required(checking)) {
        let data = {
            userId: String(userId),
            courseId: courseId,
            sectionId: sectionId,
            verticalId: verticalId,
            videoId: videoId,
            videoStart: videoStart,
            videoEnd: videoEnd,
            timeWatched: timeWatched
        };

        VideoTrackingDB.create(data, function (err, entry) {
            if (err !== null) {
                return console.error(err);
            }
            console.log("video entry saved");
            res.end("entry saved");
        });
    }



});

/**
 * Checks if all variables are set
 * @param vars array of vars
 * @return {boolean} true if they are all set
 */
function required(vars) {
    if (typeof (vars) !== "undefined") {
        for (let i = 0; i < vars.length; i++ ) {
            if (typeof (vars[i]) === "undefined") {
                console.log(vars[i] + "is undefined at pos: " + i);
                console.log(vars);
                return false;
            }
        }
    } else {
        console.log("vars is undefined");
    }
    return true;
}

module.exports = router;