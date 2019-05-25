const levenshtein = require('js-levenshtein');
var rp = require('request-promise');
var Trello = require("trello");
var trello = new Trello(process.env.TRELLO_API_KEY, process.env.TRELLO_API_TOKEN);

const conv = [
	// Not found reply
	['!', { reply: `You speak in riddles, old man.`, strictLevel: -1 }],

	// Trello commands
	['trello-create-card', { reply: '#create-trello-card', strictLevel: 0 }],

	// Kick commands
	['kick', { reply: '#kick-user', strictLevel: 0 }],
	['kick user', { reply: '#kick-user', strictLevel: 0 }],

	// Joke commands
	['Tell me a joke', { reply: '#fetch-joke', strictLevel: 5 }],
	['Tell me another joke', { reply: '#fetch-joke' }],
	['Do you know any jokes?', { reply: '#fetch-joke' }],

	// Conversations
	['hello', { reply: 'Sup?', strictLevel: 3 }],
	['how are you?', { reply: `Couldn't be botter!` }],
];


const baseStrictLevel = 10;
const conversations = conv.map(row => {
	return typeof row[1].strictLevel !== 'undefined' ? row : [ row[0], { ...row[1], strictLevel: baseStrictLevel }]
});

module.exports = message => {
	// Attempt to find a response
	const response = searchConversations(message);

	console.log('response: ', response);

	// Case for sending back a joke
	if (response.reply === '#fetch-joke') {
		return findJoke();
	}

	if (response.reply === '#create-trello-card') {
		trelloCreateCard(message);
	}

	// Case for sending back a simple conversation response
	if (response.reply) {
		return { status: 'success', text: response.reply };
	}
}

function searchConversations(message) {

	console.log('message.content: ', message.content);



	// Keep the message without the ! and trasformed to lowercase.
	const messageLo = message.content.substring(1).toLowerCase();

	const messageSplit = messageLo.split('::')

	console.log('messageSplit: ', messageSplit);

	const command = messageSplit[0];

	// Initialize a VERY bad distance.
	let bestDistance = 99;
	let bestDistanceIndex = -1;

	for (let i = 0; i < conversations.length; i++) {
		const levDistance = levenshtein(command, conversations[i][0]);

		console.log(`Checking if ${levDistance} < ${conversations[i][1].strictLevel}`);
		if (levDistance < bestDistance && levDistance <= conversations[i][1].strictLevel) {
			// Update the best distance so far
			bestDistance = levDistance;
			bestDistanceIndex = i;
		}

		if (levDistance === 0) {
			// If a perfect match is found, no need to continue the search.
			break;
		}

		console.log('best answer so far (distance, index): ', bestDistance, bestDistanceIndex);
	}

	if (bestDistanceIndex < 0) {
		return conversations[0][1];
	}

	return conversations[bestDistanceIndex][1];
}


async function findJoke() {
	const options = {
    uri: 'https://api.chucknorris.io/jokes/random',
    json: true 
	};

	try {
		const data = await rp(options);

		return { status: 'success', text: data.value }
	} catch (error) {

		return ({ status: 'fail', text: `I can't think o' any jokes right naw` });
	}
}

async function trelloCreateCard(message) {
	const messageSplit = message.content.substring(1).split('::')
	const title = messageSplit[1];
	const description = messageSplit[2] ? messageSplit[2] : '';  

	trello.addCard(title, description, '5c53068fb8475c5e55c774a0',
      function (error, trelloCard) {
          if (error) {
              console.log('Could not add card:', error);
          }
          else {
              console.log('Added card:', trelloCard);
          }
      });
}
