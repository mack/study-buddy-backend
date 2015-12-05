var app = require('express')();
var uuid = require('node-uuid');
var server = require('http').Server(app);
var io = require('socket.io')(server);

var port = Number(process.env.PORT || 8080)
server.listen(port);

var connections = 0
console.log('[+] The server has started running on ' + port + ".")

var waitingRooms = [];


var room = {id: uuid.v4(), student1: null, student2: null, course: 'math', material: 'meiosis', grade: '10'}
var room2 = {id: uuid.v4(), student1: null, student2: null, course: 'dfgdfgdfg', material: 'dfgdfgdfg', grade: '15'}
var room3 = {id: uuid.v4(), student1: null, student2: null, course: 'sdf34gdfg', material: 'ffdfgd4', grade: '17'}

// waitingRooms.push(room)
// waitingRooms.push(room2)
// waitingRooms.push(room3)
console.log(waitingRooms.length + " is the length of waiting rooms at the very beginning")

function findRoom(course, material, grade, room) {

  var result = waitingRooms.filter(function(obj, index) {
    return obj.course == course && obj.material == material && obj.grade == grade
  })  

  room(result[0])
}

function removeRoom(_id) {
  
  var result = waitingRooms.filter(function(obj, index) {
    return obj.id == _id
  })
  if (result[0] != null) {
    console.log(waitingRooms.length + " is the length of waiting rooms when the remove room function is called")
    var index = waitingRooms.indexOf(result[0])
    waitingRooms.splice(index, 1)
    console.log(waitingRooms.length + " is the length of waiting rooms after the splice in remove rooms")
  }

}




io.on('connection', function (socket) {
  // Handle connections and disconnection dev logging 
  connections++

  socket.on('disconnect', function() {
    console.log("user has disconnected")
    connections--
    removeRoom(socket.room.id)
    socket.leave(socket.room.id)

// 1 - other user disconnected
// 2 - nothing
// 3 - nothing

    io.to(socket.room.id).emit("error", 1)

  })


  socket.on('answer', function(data) {
    io.to(socket.room.id).broadcast.emit("answer", data)
  })


// When the user searches for a new quiz
  socket.on('start', function(roomInfo) {
    // stores the username 
    socket.username = roomInfo.username
    // stores the room
    
    findRoom(roomInfo.course, roomInfo.material, roomInfo.grade, function(matchedRoom) {

      if (matchedRoom != null) {
  
        // Found a room that matches what we're looking for! Add user to it and start playing
        socket.join(matchedRoom.id)
        socket.room = matchedRoom

        matchedRoom.student2 = socket
        // Update the other students matched room
        matchedRoom.student1.room = matchedRoom
        
        //Test
        
        matchedRoom.student2.emit("answer", "")
        matchedRoom.student1.emit("question", "")

        console.log("Found a room, let us put you in there")
        // Idea to emit the room to the clients before we remove all that data, along with names possibly
        var index = waitingRooms.indexOf(matchedRoom)
        waitingRooms.splice(index, 1)


      } else if (matchedRoom == null) {
        // Couldn't find a room that matches what we're looking for... Create a new one and add it to the list
        console.log("Can't find a room")

        var newRoom = {id: uuid.v4(), student1: socket, student2: null, course: roomInfo.course, material: roomInfo.material, grade: roomInfo.grade}
        console.log(waitingRooms.length + " is the length of waiting rooms before the push")
        waitingRooms.push(newRoom)
        console.log(waitingRooms.length + " is the length of waiting rooms after the push")

        socket.join(newRoom.id)
        socket.room = newRoom    
        

      }

    })


  })

});

module.exports = app;