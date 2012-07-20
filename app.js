
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

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
  socket.join('Lobby');

  socket.on('join', function(room) {
    socket.leave(room.previousRoom);
    socket.join(room.newRoom);
    console.log('Joined ' + room);
  });

  socket.on('rooms', function() {
    socket.emit('rooms', io.sockets.manager.rooms);
  });

  socket.on('message', function (message) {
socket.emit('rooms', io.sockets.manager.rooms);
    socket.broadcast.to(message.room).emit('message', {
      text: message.text
    });
    console.log('Relayed to ' + message.room + ': ' + message.text);
  });
});