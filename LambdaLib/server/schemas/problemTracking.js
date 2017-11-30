let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let problemTrackingSchema = new Schema({
    userId: String,
    courseId: String,
    sectionId: String,
    verticalId: String,
    problemId: String,
    timeAnswered: { type: Date, default: Date.now }
});


module.exports = mongoose.model('problemTracking', problemTrackingSchema);