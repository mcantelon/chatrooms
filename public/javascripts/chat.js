var socket = io.connect('http://127.0.0.1');

function divElement(message) {
  return $('<div></div>').text(message);
}

function processMessage(socket) {
  var message = $('#send-message').val();

  if (message[0] == '/') {
    console.log('command');
    processCommand(socket, message);
  } else {
    sendMessage(socket);
  }   
  $('#send-message').val('');
}

function processCommand(socket, command) {
  var words = command.split(' ')
    , command = words[0].substring(1, words[0].length);

  if (command == 'join') {
    console.log('joining');
    words.shift();
    var room = words.join(' '); 
    console.log('room: ' + room + '.');
    socket.emit('join', {
      newRoom: room,
      previousRoom: $('#room').text()
    }); 
    $('#room').text(room);
  }
}

function sendMessage(socket) {
  var message = {
    room: $('#room').text(),
    text: $('#send-message').val()
  };
  socket.emit('message', message);
  $('#messages').append(divElement(message.text));
  $('#messages').scrollTop($('#messages').prop('scrollHeight'))
}

$(document).ready(function() {
  $('#room').text('Lobby');

  socket.on('message', function (message) {
    var newElement = $('<div></div>').text(message.text);
    $('#messages').append(newElement);
  });

  socket.on('rooms', function(rooms) {
    $('#room-list').empty();
    for(var room in rooms) {
      room = room.substring(1, room.length);
      $('#room-list').append(divElement(room));
    }
  });

  $('#send-form').submit(function() {
    processMessage(socket);
    return false;
  });

  $('#send-button').click(function() {
    processMessage(socket);
  });

  setInterval(function() {
    socket.emit('rooms');
  }, 1000);
});
