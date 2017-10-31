let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let layout = new Schema({
    courseId: String,
    sectionId: String,
    problems: Number,
    videos: Number,
    time: Number,
});


module.exports = mongoose.model('layout', layout);