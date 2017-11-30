let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let userTrackingSchema = new Schema({
    userId: String,
    courseId: String,
    sectionId: String,
    verticalId: String,
    timeStart: Date,
    timeLeave: { type: Date, default: Date.now }
});


module.exports = mongoose.model('userTracking', userTrackingSchema);