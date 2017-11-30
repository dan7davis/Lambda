let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let quotes = new Schema({
    userId: String,
    courseId: String,
    sectionId: String,
    quote: String,
    updateTime: { type: Date, default: Date.now }
});


module.exports = mongoose.model('quotes', quotes);