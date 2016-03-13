var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var dbHandler = require('./dbHandler.js')
var mongoose = require('mongoose');

var port = Number(process.env.PORT || 8080)
server.listen(port);


mongoose.connect('mongodb://localhost/rooms');
var conn = mongoose.connection;

conn.once('open', function callback () {
  io.on('connection', function (socket) {

    socket.on('verify', function(verify) {
      // add verify to the db
      // change turns
      // if turns are at the end
      // send back summary
      dbHandler.searchById(socket.room, function(room) {
        room.verifies.push(verify)
        var newTurn = room.turns + 1
        room.turns = newTurn

        room.save(function(err) {
          if (err) {
            console.log(err)
          } else {
            
            if (newTurn < 2) {
              console.log('A room is updated. Added a answer into the answer array.  ' + newTurn)
              socket.emit('paired', room.student2, "Round " + newTurn + "! We're waiting for " + room.student2 + " to write a new question.")
              socket.broadcast.to(socket.room).emit('writeQuestion', "")
            } else {
              console.log('Emitting summary')
              io.sockets.to(socket.room).emit('summary', room.questions, room.answers, room.verifies)
            }
          }
        })
      }) 
    })

    socket.on('answer', function(answer) {
      // add the answer to the db
      console.log('A answer came in')
      console.log('this is the answer ' + answer)
      dbHandler.searchById(socket.room, function(room) {
        room.answers.push(answer)
        room.save(function(err) {
          if (err) {
            console.log(err)
          } else {
            console.log('A room is updated. Added a answer into the answer array.')
            socket.broadcast.to(socket.room).emit('verifyAnswer', room.questions[room.turns], answer)
          }
        })
      }) 
      // send it back to the other student
      // wait for verify
    })

    socket.on('question', function(question) {
      // add the question to the db
    dbHandler.searchById(socket.room, function(room) {
        room.questions.push(question)
        room.save(function(err) {
          if (err) {
            console.log(err)
          } else {
            console.log('A room is updated. Added a question into the questions array.')
            socket.broadcast.to(socket.room).emit('writeAnswer', question)
          }
        })
      }) 

      // send it back to the other student
      // wait for answer
    })

  // Handle setting up and removing rooms in the db when a user connects
    socket.on('start', function(info) {
      console.log('Got start')
      var name = info.studentName.toString();
      var subject = info.subject.toString();
      var curriculum = info.curriculum.toString();
      var grade = info.grade.toString(); 

      
    dbHandler.search(subject, curriculum, grade, function(room) {
      if (room) {
        room.student2 = name;
        room.save(function(err) {
          if (err) {
            console.log(err)
          } else {
            console.log('A room is updated with a new student')
            socket.room = room.id
            socket.join(room.id)
            socket.emit('paired', room.student1)
            socket.broadcast.to(socket.room).emit('writeQuestion', room.student2)
          }
        })

      } else {
        // No rooms. Add one to the db
        dbHandler.add(name, subject, curriculum, grade, function(success, id) {
            if (success == 0) {
              console.log('Adding a room to the db.')
              socket.room = id
              socket.join(id)
            }
        }) 

      }
    })

    })


    socket.on('disconnect', function() {
        if (socket.room) {
          socket.broadcast.to(socket.room).emit('abandoned', "")
          dbHandler.removeRoom(socket.room)
          socket.leave(socket.room)
          socket.room = null;
        }
    })

  })

});

module.exports = app;

