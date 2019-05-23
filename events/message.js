const kick = require('../commands/kick')

module.exports = (client, message) => {
  if (message.content.startsWith('!kick')) {
    return kick(message);
  }
}

module.exports = (client, message) => {
  if (message.content === 'ping') {
    return message.reply('pong');
  }
}
