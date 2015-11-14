var app = require('express')();
var uuid = require('node-uuid');
var server = require('http').Server(app);
var io = require('socket.io')(server);

var port = Number(process.env.PORT || 8080)
server.listen(port);

console.log(port)

var connections = 0
console.log('The server has started running...')

var waitingRooms = [];


var room = {id: uuid.v4(), users: [1,4], course: 'math', material: 'meiosis', grade: '10'}
var room2 = {id: uuid.v4(), users: [2,3], course: 'bio', material: 'meiosis', grade: '10'}

waitingRooms.push(room)
waitingRooms.push(room2)


function findRoom(course, material, grade, room) {
  var result = waitingRooms.filter(function(obj, index) {
    return obj.course == course && obj.material == material && obj.grade == grade
  })  
  var index = waitingRooms.indexOf(result[0])
  waitingRooms.splice(index, 1)
  room(result[0])
}


io.on('connection', function (socket) {
  // Handle connections and disconnection dev logging 
  connections++
  console.log('[+] A new connection has been made. There are now '+ connections +' connections to the server.')
  socket.emit('news', { hello: 'world' });

  socket.on('disconnect', function() {
    connections--
    console.log('[-] A connection has been lost. There are now '+ connections +' connections to the server.')
  })

  socket.on('start', function(roomInfo) {
    // stores the username 

    // stores the room
    console.log(roomInfo.username, roomInfo.course, roomInfo.material)
    findRoom(roomInfo.course, roomInfo.material, roomInfo.grade, function(matchedRoom) {
      if (matchedRoom) {
        // Found a room that matches what we're looking for! Add user to it and start playing
        socket.join(matchedRoom.id)
        console.log('\n \n You joined the room ' + matchedRoom + '\nwith the id ' + matchedRoom.id)

      } else {
        // Couldn't find a room that matches what we're looking for... Create a new one and add it to the list
        var newRoom = {id: uuid.v4(), users: [roomInfo.username], course: roomInfo.course, material: roomInfo.material, grade: roomInfo.grade}
        waitingRooms.push(newRoom)
        socket.join(newRoom.id)      
        console.log('You created a new room with the id ' + newRoom.id)


      }
    })



  })

});

module.exports = app;