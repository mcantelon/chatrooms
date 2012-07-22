var socket = io.connect();

function divEscapedContentElement(message) {
  return $('<div></div>').text(message);
}

function divSystemContentElement(message) {
  return $('<div></div>').html(message);
}

function processMessage(socket) {
  var message = $('#send-message').val()
    , systemMessage;

  if (message[0] == '/') {
    systemMessage = processCommand(socket, message);
    $('#messages').append(divSystemContentElement(systemMessage));
  } else {
    sendMessage(socket, $('#room').text(), message);
    $('#messages').append(divEscapedContentElement(message));
    $('#messages').scrollTop($('#messages').prop('scrollHeight'));
  }
  $('#send-message').val('');
}

function changeRoom(room) {
  socket.emit('join', {
    newRoom: room,
    previousRoom: $('#room').text()
  });
}

function processCommand(socket, command) {
  var words = command.split(' ')
    , command = words[0].substring(1, words[0].length)
    , message;

  switch(command) {
    case 'join':
      words.shift();
      var room = words.join(' '); 
      changeRoom(room);
      break;

    case 'nick':
      words.shift();
      var name = words.join(' ');
      socket.emit('nameAttempt', name);
      break;

    default:
      message = '<i>Unrecognized command.</i>';
      break;
  }

  return message;
}

function sendMessage(socket, room, text) {
  var message = {
    room: room,
    text: text
  };
  socket.emit('message', message);
}

$(document).ready(function() {
  var name;

  $('#room').text('Lobby');

  socket.on('nameResult', function(result) {
    var message;
    if (result.success) {
      message = 'You are now known as ' + result.name + '.';
      name = result.name;
    } else {
      message = result.message;
    }
    message = '<i>' + message + '</i>';
    $('#messages').append(divSystemContentElement(message));
  });

  socket.on('joinResult', function(result) {
    $('#room').text(result.room);
    $('#messages').append(divSystemContentElement('<i>Room changed.</i>'));
  });

  socket.on('message', function (message) {
    var newElement = $('<div></div>').text(message.text);
    $('#messages').append(newElement);
  });

  socket.on('rooms', function(rooms) {
    $('#room-list').empty();

    for(var room in rooms) {
      room = room.substring(1, room.length);
      if (room != '') {
        $('#room-list').append(divEscapedContentElement(room));
      }
    }

    $('#room-list div').click(function() {
      processCommand(socket, '/join ' + $(this).text())
    });
  });

  setInterval(function() {
    socket.emit('rooms');
  }, 1000);

  $('#send-form').submit(function() {
    processMessage(socket);
    return false;
  });

  $('#send-button').click(function() {
    processMessage(socket);
  });
});
