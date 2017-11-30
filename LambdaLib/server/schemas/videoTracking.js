let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let videoTrackingSchema = new Schema({
    userId: String,
    courseId: String,
    sectionId: String,
    verticalId: String,
    videoId: String,
    videoStart: Number,
    videoEnd: Number,
    timeWatched: Number,
    timeLogged: { type: Date, default: Date.now }
});


module.exports = mongoose.model('videoTracking', videoTrackingSchema);