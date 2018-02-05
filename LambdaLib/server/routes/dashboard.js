/**
 * Created by caspar on 10/22/2017.
 */
let express = require('express');
let mongoose = require('mongoose');
var crypto = require('crypto');
var session = require('express-session');
var randomstring = require("randomstring");

//Get promise library
mongoose.Promise = require('bluebird');

let connectOptions = {
    useMongoClient: true,
    poolSize: 5
};

mongoose.connect('mongodb://user:1a4#hkyHBWI&CMeJ@localhost:27017/Lambda',connectOptions);

let Schema = mongoose.Schema;

let usersDB = require('../schemas/DashBoardUser.js');


// ROUTES FOR OUR API
// =============================================================================

// create our router
let router = express.Router();

router.use(session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: 'shhhht, very secret'
}));

// middleware to use for all requests
router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST");

    let err = req.session.error;
    let msg = req.session.success;
    delete req.session.error;
    delete req.session.success;
    res.locals.message = '';

    next();
});

router.use('/assets',express.static('dashboard/assets'));

router.get("/login",function (req, res) {
    if (req.session.user) {
        res.redirect('/dashboard');
    }
   res.render('login');
});

router.post("/login", function (req, res) {
    authenticate(req.body.userName, req.body.password, function (err, user) {
       if (user) {
           req.session.regenerate(function(){
               req.session.user = user;
               res.redirect('/dashboard');
           });
       } else {
           res.redirect('/dashboard/login');
       }
    });
});

// router.get("/register", function () {
//    let user = new usersDB();
//    user.userName = "ckrijgsman";
//    let data = saltHashPassword("uO47HI6R0htf!0zf");
//    user.hash = data.passwordHash;
//    user.salt = data.salt;
//    user.save(function(err) {
//        if (err) {
//            console.log(err);
//        } else {
//            console.log("user saved");
//        }
//    })
// });

router.get("/", restrict,function (req, res) {
    res.render('home',{userName: req.session.user.userName});
});

router.get("/logout", restrict, function (req, res) {
    req.session.destroy();
    res.redirect('/dashboard/login');
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

/**
 * hash password with sha512.
 * @function
 * @param {string} password - List of required fields.
 * @param {string} salt - Data to be validated.
 */
function sha512(password, salt){
    let hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    return hash.digest('hex')
}

/**
 * Takes a password and generates a slat and hashes it.
 * @param password the password to hash
 */
function saltHashPassword(password) {
    let salt = randomstring.generate(16); /** Gives us salt of length 16 */
    let passwordData = sha512(password, salt, null);
    return {
        salt:salt,
        passwordHash:passwordData
    };
}

/**
 * check for login
 * @param name userName
 * @param pass password
 * @param fn callback
 */
function authenticate(name, pass, fn) {
    usersDB.findOne({userName: name}, function(err, user) {
        if (!user) return fn(new Error('cannot find user'));

        let hash = sha512(pass, user.salt);
        if (hash === user.hash) {
            return fn(null, user);
        }
        fn(new Error('invalid password'))
    })
}

function restrict(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        req.session.error = 'Access denied!';
        res.redirect('/dashboard/login');
    }
}

module.exports = router;