
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var io = require('socket.io').listen(server)
  , guestNumber = 1
  , nickNames = {}
  , namesUsed = []
  , name
  , nameIndex;

io.sockets.on('connection', function (socket) {
  socket.join('Lobby');

  socket.on('disconnect', function(socket) {
    nameIndex = namesUsed.indexOf(nickNames[socket.id]);
    delete nameUsed[nameIndex];
    delete nickNames[socket.id];
  });

  name = 'Guest' + guestNumber;
  nickNames[socket.id] = name;
  socket.emit('nameResult', {
    success: true,
    name: name
  });
  namesUsed.push(name);
  guestNumber += 1; 

  socket.on('nameAttempt', function(name) {
    if (name.indexOf('Guest') == 0) {
      socket.emit('nameResult', {
        success: false,
        message: 'Names cannot begin with "Guest".'
      });
    } else {
      if (namesUsed.indexOf(name) == -1) {
        namesUsed.push(name);
        nickNames[socket.id] = name;
        socket.emit('nameResult', {
          success: true,
          name: name
        });
      } else {
        socket.emit('nameResult', {
          success: false,
          message: 'That name is already in use.'
        });
      }
    }
  });

  socket.on('join', function(room) {
    socket.leave(room.previousRoom);
    socket.join(room.newRoom);
    console.log('Joined ' + room);
  });

  socket.on('message', function (message) {
    socket.broadcast.to(message.room).emit('message', {
      text: nickNames[socket.id] + ': ' + message.text
    });
    console.log('Relayed to ' + message.room + ': ' + message.text);
  });

  socket.on('rooms', function() {
    socket.emit('rooms', io.sockets.manager.rooms);
  });
});
