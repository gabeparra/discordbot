// Require the necessary discord.js classes
const { Client, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent],
});

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log(`Ready! Logged in as ${client.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);

// Listen for messages and reply with 'pong' if the bot is tagged and the message is 'ping'
client.on('messageCreate', (message) => {
	console.log(`Received message: ${message.content}`);
	// Debug line
	if (message.mentions.has(client.user.id) && message.content.includes('ping')) {
		console.log('Ping received, sending pong.');
		// Debug line
		message.channel.send('Hello there!');
	}
});
