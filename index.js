// Require the necessary discord.js classes
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const { token } = require("./config.json");

// Create a new client instance
const client = new Client({
  intents: [GatewayIntentBits.Guilds,GatewayIntentBits.MessageContent,GatewayIntentBits.GuildMessages,],
});

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);
for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// When the client is ready, run this code (only once)
client.once("ready", () => {
  console.log(`Ready! Logged in as ${client.user.tag}`);
  
  // Log the bot's clientId
  console.log(`Client ID: ${client.user.id}`);
  
  // Log the IDs of all the guilds the bot is in
  client.guilds.cache.forEach(guild => {
    console.log(`Guild ID: ${guild.id}`);
  });
});



client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  // Get the guild from the interaction
  const { guild } = interaction;
  
  // Log the guild ID
  console.log(`Interaction received from guild: ${guild.id}`);

  const command = client.commands.get(interaction.commandName);
  

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});


// Listen for messages and reply with 'pong' if the bot is tagged and the message is 'ping'
client.on("messageCreate", (message) => {
  if (message.author.bot) return false;

  if (
    message.content.includes("@here") ||
    message.content.includes("@everyone") ||
    message.type == "REPLY"
  )
    return false;

  if (message.content.toLowerCase().includes("ping")) {
    message.channel.send("I wanna eat some ass <@404060860752068619>");
  }
  if (message.content.toLowerCase().includes("can you suck it?")) {
    message.channel.send("Whaat?");
  }
  if (message.content.toLowerCase().includes("can you bless me?")) {
    message.channel.send("Money wise");
  }
  if (message.content.toLowerCase().includes("prayer")) {
    message.channel.send({
      files: [{attachment: "https://media.discordapp.net/attachments/539934160534372412/973009788810182696/IMG_8403.gif?width=667&height=805",name:'SPOILER_prayer.gif'}],
    });
  }
  if (message.content.toLowerCase().includes("we live we love we lie")) {
    message.channel.send({
      files: [
        "https://images-ext-2.discordapp.net/external/CV58HF9COOPBVP_QjECtpBKrvOba1VfvK5iKKVMzm2Y/https/media.tenor.com/gf_-X6I29z8AAAPo/smurf-cat-smurf.mp4",
      ],
    });
  }
  if (message.content.toLowerCase().includes("i need more bulles")) {
    message.channel.send({
      files: [
        "https://media.discordapp.net/attachments/1077811415332700274/1147780275066118176/i-need-more-bullets.gif?width=345&height=747",
      ],
    });
  }
  if (
    message.content.toLowerCase().includes("mama ima criminal") ||
    message.content.toLowerCase().includes("mama im a criminal")
  ) {
    message.channel.send({
      files: ["https://im.ezgif.com/tmp/ezgif-1-77191792b3.gif"],
    });
  }
});

// Log in to Discord with your client's token
client.login(token);
