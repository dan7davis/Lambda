let express = require('express');
let bodyParser = require('body-parser');
let mongoose = require('mongoose');

//Get promise library
mongoose.Promise = require('bluebird');

let connectOptions = {
    useMongoClient: true,
    poolSize: 5
};

mongoose.connect('mongodb://user:W9B2hbLj3rTu@localhost:27017/Lambda',connectOptions);

mongoose.connection.on('connected', function () {
    console.log('study-planning: Mongoose default connection open to Lambda database');
});

// If the connection throws an error
mongoose.connection.on('error',function (err) {
    console.log('study-planning: Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
    console.log('study-planning: Mongoose default connection disconnected');
});

let Schema = mongoose.Schema;

let UserTrackingDB = require('../schemas/userTracking.js');
let ProblemTrackingDB = require('../schemas/problemTracking.js');
let VideoTrackingDB = require('../schemas/videoTracking.js');

let QuotesDB = require('../schemas/SP-quotes.js');
let QuoteStoreDB = require('../schemas/SP-quotesStoring.js');
let GoalsDB = require('../schemas/SP-goal.js');
let GoalsStoreDB = require('../schemas/SP-goalStoring.js');



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

/**
 * Set a quote for an user for a week.
 * and backups the old quote
 */
router.route("/setQuote").post(function (req, res) {
    let userId = req.body.userId;
    let courseId = req.body.courseId;
    let sectionId = req.body.sectionId;
    let quote = req.body.quote;

    let checking = [];
    checking.push(userId);
    checking.push(courseId);
    checking.push(sectionId);
    checking.push(quote);

    //Check if all the data is present
    if (required(checking)) {
        let data = {
            userId: String(userId),
            courseId: courseId,
            sectionId: sectionId,
            quote: quote,
            updateTime: new Date()
        };

        //save old record
        QuotesDB.findOne({userId: userId, courseId: courseId, sectionId: sectionId}, function (err, entry) {
            if (entry !== null) {
                let save = {
                    userId: entry.userId,
                    courseId: entry.courseId,
                    sectionId: entry.sectionId,
                    quote: entry.quote,
                    placedTime: entry.updateTime
                };

                QuoteStoreDB.create(save, function (err) {
                    if (err !== null) {
                        return console.error(err);
                    }
                });
            }

            //update current quote
            QuotesDB.findOneAndUpdate({userId: userId, courseId: courseId, sectionId: sectionId}, data, {upsert:true, setDefaultsOnInsert: true}, function(err){
                if (err) return res.send(500, { error: err });
                return res.end("successfully saved");
            });
        });



    }
    res.end("error");
});

router.route("/getQuote").post(function (req, res) {
    let userId = req.body.userId;
    let courseId = req.body.courseId;
    let sectionId = req.body.sectionId;

    let checking = [];
    checking.push(userId);
    checking.push(courseId);
    checking.push(sectionId);

    //Check if all the data is present
    if (required(checking)) {
        let data = {
            userId: String(userId),
            courseId: courseId,
            sectionId: sectionId,
        };

        QuotesDB.findOne(data, function (err, entry) {
            if (err !== null) {
                res.end("error");
                return console.error(err);
            } else {
                return res.json(entry);
            }
        })
    } else {
        return res.end("error");
    }
});

router.route("/setGoal").post(function (req, res) {
    let userId = req.body.userId;
    let courseId = req.body.courseId;
    let sectionId = req.body.sectionId;
    let problems = req.body.problems;
    let videos = req.body.videos;
    let time = req.body.time;

    let checking = [];
    checking.push(userId);
    checking.push(courseId);
    checking.push(sectionId);
    checking.push(problems);
    checking.push(videos);
    checking.push(time);

    if (required(checking)) {
        let data = {
            userId: String(userId),
            courseId: courseId,
            sectionId: sectionId,
            problems: problems,
            videos: videos,
            time: time,
            updateTime: new Date()

        };

        //save old record
        GoalsDB.findOne({userId: userId, courseId: courseId, sectionId: sectionId}, function (err, entry) {
            if (entry !== null) {
                let save = {
                    userId: entry.userId,
                    courseId: entry.courseId,
                    sectionId: entry.sectionId,
                    problems: entry.problems,
                    videos: entry.videos,
                    time: entry.time,
                    placedTime: entry.updateTime
                };

                GoalsStoreDB.create(save, function (err) {
                    if (err !== null) {
                        return console.error(err);
                    }
                });
            }

            //Update current record
            GoalsDB.findOneAndUpdate({userId: userId, courseId: courseId, sectionId: sectionId}, data, {upsert: true, setDefaultsOnInsert: true}, function(err){
                if (err) return res.send(500, { error: err });
                return res.end("successfully saved");
            });

        });

    }
    res.end("error");
});

router.route("/getGoal").post(function (req, res) {
    let userId = req.body.userId;
    let courseId = req.body.courseId;
    let sectionId = req.body.sectionId;

    let checking = [];
    checking.push(userId);
    checking.push(courseId);
    checking.push(sectionId);

    //Check if all the data is present
    if (required(checking)) {
        let data = {
            userId: String(userId),
            courseId: courseId,
            sectionId: sectionId,
        };

        GoalsDB.findOne(data, function (err, entry) {
            if (err !== null) {
                res.end("error");
                return console.error(err);
            } else {
                return res.json(entry);
            }
        })
    } else {
        return res.end("error");
    }
});

router.route("/getProgress").post(function (req, res) {
    let userId = req.body.userId;
    let courseId = req.body.courseId;
    let sectionId = req.body.sectionId;

    let checking = [];
    checking.push(userId);
    checking.push(courseId);
    checking.push(sectionId);

    //Check if all the data is present
    if (required(checking)) {
        let data = {
            userId: String(userId),
            courseId: courseId,
            sectionId: sectionId,
        };

        //This contains all the return data
        let returner = {};

        //Problem progress
        ProblemTrackingDB.find(data).distinct('problemId').exec(function(err, result) {
            if (err !== null) {
                res.end("error");
                return console.error(err);
            } else {
                returner.problemsCount = result.length;

                //Video progress
                VideoTrackingDB.aggregate(
                    [
                        {
                            $match: data
                        },
                        {
                            $group:
                                {
                                    _id: "$videoId",
                                    timeWatched: { $sum: "$timeWatched" }
                                }
                        }
                    ], function(err, result) {
                        if (err !== null) {
                            res.end("error");
                            return console.error(err);
                        } else {
                            //Count the videos with more than 30 seconds
                            returner.videoCount = 0;
                            result.forEach(function (record) {
                                if (record.timeWatched > 30) {
                                    returner.videoCount++;
                                }
                            });


                            //Time progress
                            UserTrackingDB.aggregate(
                                [
                                    {
                                        $match: data
                                    },
                                    {
                                        $group:
                                            {
                                                _id: "$userId",
                                                timeSpendOnCourse: { $sum: { $subtract: ["$timeLeave","$timeStart"]} }
                                            }
                                    }
                                ], function(err, result) {
                                    if (err !== null) {
                                        res.end("error");
                                        return console.error(err);
                                    } else {
                                        //change time to hours
                                        returner.timeCount = result[0].timeSpendOnCourse / 3600000;
                                        return res.json(returner);
                                    }
                                }
                            )
                        }
                    }
                )
            }
        });
    } else {
        return res.end("error");
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