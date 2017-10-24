//CONFIG SERVER
// =============================================================================
// ports:
let port = 443;

//To indicate if you are running an development environment
let dev = true;

let express = require('express');
let https = require('https');
let http = require('http');
let fs = require('fs');
let bodyParser = require('body-parser');

// This line is from the Node.js HTTPS documentation.
let options = {
    key: fs.readFileSync('/etc/letsencrypt/live/server.casparkrijgsman.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/server.casparkrijgsman.com/cert.pem')
};


let app = express();

// header settings
let origin = "*";
let headers = "Origin, X-Requested-With, Accept, X-CSRFToken, chap, seq, vert";

// setting global request parameters
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Headers", headers);
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST");
    next();
});

// configure body parser, get data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/static', express.static('public'));



// REGISTER OUR ROUTES -------------------------------
// all of our default routes will be prefixed with /lambda
let lambda = require("./routes/lambda.js");
app.use('/lambda', lambda);

// Study planning will have the /study-planning prefix
let SP = require("./routes/study-planning");
app.use('/study-planning', SP);

// START THE SERVER
// =============================================================================
http.createServer(app).listen(80);
https.createServer(options, app).listen(port);
console.log('Node server start on port: ' + port);
console.log('and port: ' + 80);