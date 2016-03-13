// Mackenzie Boudreau @ 2016
// Study buddy backend

var mongoose = require('mongoose');
var Room = require('./rooms.js')

var conn = mongoose.connection


module.exports.add = function(studentName, subjectName, curriculumName, selectedGrade, completion) {

	
		console.log('db is open')
		var newRoom = new Room({
			student1: studentName,
			student2: null,
			subject: subjectName,
			curriculum: curriculumName,
			grade: selectedGrade,
			turns: 0
		})

		newRoom.save(function(err) {
			if (err) {
				console.log(err)
			} else {
				console.log('A room is saved')
				completion(0, newRoom.id)
			}
		})


}

module.exports.search = function(subjectName, curriculumName, selectedGrade, completion) {

		Room.findOne({ student2: null, subject: subjectName, curriculum: curriculumName, grade: selectedGrade }, function(err, rooms) {
			if (rooms) {
				completion(rooms)
			} else {
				completion(null)
			}
		})


}

module.exports.searchById = function(id, completion) {

		Room.findById(id, function(err, rooms) {
			if (rooms) {
				completion(rooms)
			} else {
				completion(null)
			}
		})


}

module.exports.removeRoom = function(id) {

		Room.findById(id, function(err, rooms) {
			if (rooms) {
				rooms.remove(function(err) {
					console.log('A room has been removed')
				})
			} else {
				console.log('We couldn\'t find a room')
			}
		})
}
