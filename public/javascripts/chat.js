var socket = io.connect();

var Chat = function(socket) {
  this.socket = socket;
};

Chat.prototype.sendMessage = function(room, text) {
  var message = {
    room: room,
    text: text
  };
  this.socket.emit('message', message);
};

Chat.prototype.changeRoom = function(currentRoom, newRoom) {
  this.socket.emit('join', {
    newRoom: newRoom,
    previousRoom: currentRoom
  });
};

Chat.prototype.processCommand = function(currentRoom, command) {
  var words = command.split(' ')
    , command = words[0].substring(1, words[0].length)
    , message;

  switch(command) {
    case 'join':
      words.shift();
      var newRoom = words.join(' '); 
      this.changeRoom(currentRoom, newRoom);
      break;

    case 'nick':
      words.shift();
      var name = words.join(' ');
      this.socket.emit('nameAttempt', name);
      break;

    default:
      message = '<i>Unrecognized command.</i>';
      break;
  }

  return message;
};

function divEscapedContentElement(message) {
  return $('<div></div>').text(message);
}

function divSystemContentElement(message) {
  return $('<div></div>').html(message);
}

function processUserInput(chatApp, socket) {
  var message = $('#send-message').val()
    , systemMessage;

  if (message[0] == '/') {
    systemMessage = chatApp.processCommand($('#room').text(), message);
    $('#messages').append(divSystemContentElement(systemMessage));
  } else {
    chatApp.sendMessage($('#room').text(), message);
    $('#messages').append(divEscapedContentElement(message));
    $('#messages').scrollTop($('#messages').prop('scrollHeight'));
  }

  $('#send-message').val('');
}

$(document).ready(function() {
  var name;

  $('#room').text('Lobby');

  var chatApp = new Chat(socket);

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
      chatApp.processCommand(
        $('#room').text(),
        '/join ' + $(this).text()
      )
    });
  });

  setInterval(function() {
    socket.emit('rooms');
  }, 1000);

  $('#send-form').submit(function() {
    processUserInput(chatApp, socket);
    return false;
  });

  $('#send-button').click(function() {
    processUserInput(chatApp, socket);
  });
});
