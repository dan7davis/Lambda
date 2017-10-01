var mongoose 			= require('mongoose');
var Schema 				= mongoose.Schema;

var EventSchema 		= new Schema({
	week: 			String,
	id: 			String,
	course: 		String,
	time: 			Date,
	index: 			String,
	vert: 			String,
	edited: 		Number,
	vidID: 			String,
	quID: 			String,
	vidDuration: 	Number,
	watched: 		Number,
	submits: 		String,
	uniqueSubmits: 	Number,
	timeSite: 		Number,
	qualPlan: 		String,
	vidGoal: 		Number,
	quizGoal: 		Number,
	timeGoal: 		Number
});

module.exports = mongoose.model('Event', EventSchema);