let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let goal = new Schema({
    userId: String,
    courseId: String,
    sectionId: String,
    problems: Number,
    videos: Number,
    time: Number,
    placedTime: { type: Date, default: Date.now }
});


module.exports = mongoose.model('goalStorage', goal);