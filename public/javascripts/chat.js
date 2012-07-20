var socket = io.connect('http://127.0.0.1');

function messageHtml(message) {
  return '<div>' + message + '</div>';
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
  $('#messages').append(messageHtml(message.text));
}

$(document).ready(function() {
  socket.on('message', function (message) {
    $('#messages').append(messageHtml(message.text));
  });

  $('#room').text('Lobby');

  $('#send-form').submit(function() {
    processMessage(socket);
    return false;
  });

  $('#send-button').click(function() {
    //var message = $('#send-message').val();
    processMessage(socket);
    /*
    if (message[0] == '/') {
      console.log('command');
      var words = message.split(' ')
        , command = words[0].substring(1, words[0].length);
      console.log(command);
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
    } else {
      sendMessage(socket);
    }
    */
  });
});
