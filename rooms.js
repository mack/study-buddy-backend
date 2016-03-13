var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var roomSchema = new Schema({
	// Course info + Student
	student1: String,
	student2: String,
	subject: String,
	curriculum: String,
	grade: String,

	// Study info
	questions: [String],
	answers: [String],
	verifies: [String],
	turns: Number
})

var Room = mongoose.model('Room', roomSchema)

module.exports = Room;

