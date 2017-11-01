let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let user = new Schema({
    userName: String,
    salt: String,
    hash: String,
});


module.exports = mongoose.model('dashboardUser', user);