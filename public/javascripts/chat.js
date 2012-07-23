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
    , command = words[0].substring(1, words[0].length).toLowerCase()
    , message = false;

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
      message = 'Unrecognized command.';
      break;
  }

  return message;
};
