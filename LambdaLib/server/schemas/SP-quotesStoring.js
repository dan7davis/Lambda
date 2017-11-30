let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let quotes = new Schema({
    userId: String,
    courseId: String,
    sectionId: String,
    quote: String,
    placedTime: { type: Date, default: Date.now }
});


module.exports = mongoose.model('quotesStorage', quotes);