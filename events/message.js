const kick = require('../commands/kick');
const fakeAI = require('../utilities/fakeAI');

/**
 * This runs every time a message is sent in the channel.
 */
module.exports = async (client, message) => {	// TODO: Find one what can I do with client
	// Ignore messages sent by the bot
	if (message.author.bot) {
		return console.log('Ignore message (bot message)');
	}

	// Ignore messages that don't start with
	if (!message.content.startsWith('!')) {
		return console.log('Ignore message (not starting with !)');
	}

	const reply = await fakeAI(message);

	if (reply.text) {
		return message.reply(reply.text);
	}
}
