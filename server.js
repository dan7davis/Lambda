// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();
var https = require('https');
var http = require('http');
var fs = require('fs');
var options = {
    key: fs.readFileSync('./cert/server.key'),
    cert: fs.readFileSync('./cert/server.cert')
};

var mongoose   = require('mongoose');
//mongoose.set('debug', true);
var Event     = require('./app/models/event');
var pLog 	  = require('./app/models/event');
var vLog 	  = require('./app/models/event');
var quLog 	  = require('./app/models/event');
var zLog 	  = require('./app/models/event');


// Build the connection string
var dbURL = 'localhost:27017/SP';

// Create the database connection
mongoose.connect(dbURL,{
    server: {
        socketOptions: {
            socketTimeoutMS: 0,
            connectionTimeout: 0,
            poolSize: 4
        }
    }
});

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function () {
    console.log('Mongoose default connection open to ' + dbURL);
});

// If the connection throws an error
mongoose.connection.on('error',function (err) {
    console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
});

// configure body parser, get data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// set our port
var port     = process.env.PORT || 8080; // set our port

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Accept, X-CSRFToken, chap, seq, vert");
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST");
    next();
});


// ROUTES FOR OUR API
// =============================================================================

// create our router
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
    console.log('Something is happening.');
    next();
});



// on routes that end in /events
// ----------------------------------------------------
router.route('/events')

// create an event (accessed at POST https://server:port/api/events)
    .post(function(req, res) {

        var response = {};

        var event = new Event();		// create a new instance of the event model
        event.week 				= req.body.week;  // set the events week (comes from the request)
        event.id 				= req.body.id;
        event.course 			= req.body.course;
        event.time 				= req.body.time;
        event.index 			= req.body.index;
        event.vert 				= req.body.vert;
        event.edited 			= req.body.edited;
        event.vidID 			= req.body.vidID;
        event.quID 				= req.body.quID;
        event.vidDuration 		= req.body.vidDuration;
        event.watched 			= req.body.watched;
        event.submits 			= req.body.submits;
        event.uniqueSubmits 	= req.body.uniqueSubmits;
        event.timeSite 			= req.body.timeSite;

        // SUM OF ALL QUANT VARIABLES GROUPED BY LEARNER COURSE WEEK
        Event.aggregate(
            [
                {
                    $match: {
                        id: req.body.id,
                        course: req.body.course,
                        week: req.body.week
                    }
                },
                {
                    $group:
                        {
                            _id: { id: req.body.id, course: req.body.course, week: req.body.week },
                            totalSubmits: { $sum: "$uniqueSubmits" },
                            totalVidDuration: { $sum: "$vidDuration" },
                            totalVidWatched: { $sum: "$watched" },
                            totalTimeSite: { $sum: "$timeSite" },
                            totalEvents: { $sum: 1 },
                            edited: { $sum: "$edited" }
                        }
                }
            ], function(err,result) {
                console.log(result);
                //res.json(result);
                response.result = result;
                event.save(function(err) {
                    if (err)
                        return res.send(err);


                    response.message = 'event created';
                    console.log("<-------------Here is an response------------------>");
                    console.log(response);
                    console.log("<-------------------------------------------------->");
                    res.json(response);
                });

            }
        );





    })

    // get all the events (accessed at GET http://localhost:8080/api/events)
    .get(function(req, res) {
        Event.find({}, function(err, events) {
            if (err) {
                console.log("db error");
                return res.send(err);
            }

            console.log("getting events");
            res.json(events);
        });
    });

router.route('/events/pLog')

// create an event (accessed at POST https://server:port/api/events)
    .post(function(req, res) {
        //console.log(req.body);
        var event = new pLog();		// create a new instance of the event model
        event.week 				= req.body.week;  // set the events week (comes from the request)
        event.id 				= req.body.id;
        event.course 			= req.body.course;
        event.time 				= req.body.time;
        event.index 			= req.body.index;
        event.vert 				= req.body.vert;
        event.edited 			= req.body.edited;
        event.qualPlan 			= req.body.qualPlan;


        event.save(function(err) {
            if (err) {
                console.log(err);
                return res.send(err);
            }
        });

        // SUM OF ALL QUANT VARIABLES GROUPED BY LEARNER COURSE WEEK
        pLog.aggregate(
            [
                {
                    $match: {
                        id: req.body.id,
                        course: req.body.course,
                        week: req.body.week
                    }
                },
                {
                    $group:
                        {
                            _id: { id: req.body.id, course: req.body.course, week: req.body.week },
                            lastQualGoalSet: { $last: req.body.qualPlan }
                        }
                }
            ], function(err,result) {
                console.log("found somthing:");
                console.log(result);
                res.json(result);
            }
        );





    })

    // get all the events (accessed at GET http://localhost:8080/api/events)
    .get(function(req, res) {
        pLog
        // our criteria to filter with
            .find({
                id: req.query.id,
                course: req.query.course,
                week: req.query.week,
                qualPlan: { $ne: null }
            })
            // -1 will sort descending (newest to oldest) by lastQualGoalSet
            .sort({time: -1})
            // only get the first one for efficiency
            .limit(1)
            .exec(function(err, result){
                res.json(result);
            });
    });


router.route('/events/vLog')

    .get(function(req, res) {
        console.log(req.query);
        vLog
        // our criteria to filter with
            .distinct("vidID", {
                id: req.query.id,
                week: req.query.week,
                course: req.query.course
            })
            .exec(function(err, result){
                res.json(result.length);
            });
    });


router.route('/events/quLog')

    .get(function(req, res) {
        console.log(req.query);
        quLog
        // our criteria to filter with
            .distinct("quID", {
                id: req.query.id,
                week: req.query.week,
                course: req.query.course
            })
            .exec(function(err, result){
                res.json(result.length);
            });
    });

router.route('/events/zLog')

// create an event (accessed at POST https://server:port/api/events)
    .post(function(req, res) {

        var event = new zLog();		// create a new instance of the event model
        event.week 				= req.body.week;  // set the events week (comes from the request)
        event.id 				= req.body.id;
        event.course 			= req.body.course;
        event.time 				= req.body.time;
        event.vert 				= req.body.vert;
        event.index 			= req.body.index;
        event.vidGoal 			= req.body.vidGoal;
        event.edited 			= req.body.edited;
        event.quizGoal 			= req.body.quizGoal;
        event.timeGoal 			= req.body.timeGoal;


        event.save(function(err) {
            if (err)
                return res.send(err);
        });

        // SUM OF ALL QUANT VARIABLES GROUPED BY LEARNER COURSE WEEK
        zLog.aggregate(
            [
                {
                    $match: {
                        id: req.body.id,
                        course: req.body.course,
                        week: req.body.week
                    }
                },
                {
                    $group:
                        {
                            _id: { id: req.body.id, course: req.body.course, week: req.body.week },
                            lastVidGoalSet: { $last: req.body.vidGoal},
                            lastQuizGoalSet: { $last: req.body.quizGoal },
                            lastTimeGoalSet: { $last: req.body.timeGoal }
                        }
                }
            ], function(err,result) {
                console.log(result);
                res.json(result);
            }
        );





    })

    // get all the events (accessed at GET http://localhost:8080/api/events)
    .get(function(req, res) {
        zLog
        // our criteria to filter with
            .find({
                id: req.query.id,
                course: req.query.course,
                week: req.query.week,
                vidGoal: { $gte: 1 },
                quizGoal: { $gte: 1 },
                timeGoal: { $gte: 1 }
            })
            // -1 will sort descending (newest to oldest) by lastQualGoalSet
            .sort({time: -1})
            // only get the first one for efficiency
            .limit(1)
            .exec(function(err, result){
                res.json(result);
            });
    });
// on routes that end in /events/:event_id
// ----------------------------------------------------
router.route('/events/:event_id')

// get the event with that id
    .get(function(req, res) {
        Event.findById(req.params.event_id, function(err, event) {
            if (err)
                res.send(err);
            res.json(event);
        });
    })

    // delete the event with this id (accessed at DELETE https://server:port/api/events/:event_id)
    .delete(function(req, res) {
        Event.remove({
            _id: req.params.event_id
        }, function(err, event) {
            if (err)
                res.send(err);

            res.json({ message: 'Successfully deleted' });
        });
    });


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
https.createServer(options, app).listen(port);
console.log('Node server start on port: ' + port);

