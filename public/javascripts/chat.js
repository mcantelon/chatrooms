var socket = io.connect('http://127.0.0.1');

function divEscapedContentElement(message) {
  return $('<div></div>').text(message);
}

function divSystemContentElement(message) {
  return $('<div></div>').html(message);
}

function processMessage(socket) {
  var message = $('#send-message').val();

  if (message[0] == '/') {
    processCommand(socket, message);
  } else {
    sendMessage(socket);
  }   
  $('#send-message').val('');
}

function processCommand(socket, command) {
  var words = command.split(' ')
    , command = words[0].substring(1, words[0].length)
    , message;

  switch(command) {
    case 'join':
      words.shift();
      var room = words.join(' '); 
      socket.emit('join', {
        newRoom: room,
        previousRoom: $('#room').text()
      });
      message = '<i>Room changed.</i>'; 
      $('#room').text(room);
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

  $('#messages').append(divSystemContentElement(message));
}

function sendMessage(socket) {
  var message = {
    room: $('#room').text(),
    text: $('#send-message').val()
  };
  socket.emit('message', message);
  $('#messages').append(divEscapedContentElement(message.text));
  $('#messages').scrollTop($('#messages').prop('scrollHeight'))
}

$(document).ready(function() {
  var name;

  $('#room').text('Lobby');

  socket.on('nameResult', function(result) {
    var message;
    if (result.success) {
      message = 'You are now know as ' + result.name + '.';
      name = result.name;
    } else {
      message = result.message;
      //message = 'That name is unavailable.';
    }
    message = '<i>' + message + '</i>';
    $('#messages').append(divSystemContentElement(message));
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
