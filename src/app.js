const express = require('express');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./util/chatFunction');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const details = require('./util/RoutingControl')
const socketio = require('socket.io');
var xss = require("xss")
// provide express to the app
const app = express();

const server = http.createServer(app);

// to parse body from post request

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json())
app.use(cors())

// app.use(cors({
//   credentials:false,
//   origin: '*'
// }));

// routers or controllers are here

app.use('/details', details);
// server port here
server.listen(7000,()=>{
  console.log('start on 7000');
})
// this is for chat

const io = socketio.listen(server)

const users={};
console.log('hi pawn')
       io.on('connection', (socket) => {
        console.log("User has Joined!!!!");
        socket.on('join', ({ name, room }, callback) => {
            console.log("new user joined => ",name)
          const { error, user } = addUser({ id: socket.id, name, room });
      
          if(error) return callback(error);
      
          socket.join(user.room);
      
          socket.emit('message', { user: 'admin', text: `${user.name}, welcome to Meeting ID ${user.room}.`});
          socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });
      
          io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
      
          callback();
        });    

    
   
    //     socket.broadcast.emit('receive',{message:message,name:users[socket.id]});
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
       // console.log("Hi pawan",user.name);
       io.to(user.room).emit('message', { user:user.name, text: message });
    
        callback();
      });

    socket.on('disconnect',()=>{
        console.log("User has left!!!!");
        const user = removeUser(socket.id);

    if(user) {
      io.to(user.room).emit('message', { user: 'sdmin', text: `${user.name} has left.` });
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
    }
    })
    
})


// video call

sanitizeString = (str) => {
  return xss(str)
}

connections = {}
messages = {}
timeOnline = {}

io.on('connection', (socket) => {

  socket.on('join-call', (path) => {
      if(connections[path] === undefined){
          connections[path] = []
      }
      connections[path].push(socket.id)

      timeOnline[socket.id] = new Date()

      for(let a = 0; a < connections[path].length; ++a){
          io.to(connections[path][a]).emit("user-joined", socket.id, connections[path])
      }

      // if(messages[path] !== undefined){
      //  for(let a = 0; a < messages[path].length; ++a){
      //      io.to(socket.id).emit("chat-message", messages[path][a]['data'], 
      //          messages[path][a]['sender'], messages[path][a]['socket-id-sender'])
      //  }
      // }

      console.log(path, connections[path])
  })

  socket.on('signal', (toId, message) => {
      io.to(toId).emit('signal', socket.id, message)
  })

  // socket.on('chat-message', (data, sender) => {
  //  data = sanitizeString(data)
  //  sender = sanitizeString(sender)

  //  var key
  //  var ok = false
  //  for (const [k, v] of Object.entries(connections)) {
  //      for(let a = 0; a < v.length; ++a){
  //          if(v[a] === socket.id){
  //              key = k
  //              ok = true
  //          }
  //      }
  //  }

  //  if(ok === true){
  //      if(messages[key] === undefined){
  //          messages[key] = []
  //      }
  //      messages[key].push({"sender": sender, "data": data, "socket-id-sender": socket.id})
  //      console.log("message", key, ":", sender, data)

  //      for(let a = 0; a < connections[key].length; ++a){
  //          io.to(connections[key][a]).emit("chat-message", data, sender, socket.id)
  //      }
  //  }
  // })

  socket.on('disconnect', () => {
      var diffTime = Math.abs(timeOnline[socket.id] - new Date())
      var key
      for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {
          for(let a = 0; a < v.length; ++a){
              if(v[a] === socket.id){
                  key = k

                  // for(let a = 0; a < connections[key].length; ++a){
                  //  io.to(connections[key][a]).emit("user-left", socket.id)
                  // }
          
                  var index = connections[key].indexOf(socket.id)
                  connections[key].splice(index, 1)

                  console.log(key, socket.id, Math.ceil(diffTime / 1000))

                  if(connections[key].length === 0){
                      delete connections[key]
                  }
              }
          }
      }
  })
})

