// Require the necessary discord.js classes
const { Client, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages],
});

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log(`Ready! Logged in as ${client.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);

// Listen for messages and reply with 'pong' if the bot is tagged and the message is 'ping'
client.on('messageCreate', (message) => {
	if (message.author.bot) return false;

	if (message.content.includes('@here') || message.content.includes('@everyone') || message.type == 'REPLY') return false;

	if (message.mentions.has(client.user.id) && message.content.includes('ping')) {
		message.channel.send('I wanna eat some ass <@404060860752068619>');
	}
});
