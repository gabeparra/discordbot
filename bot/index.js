// Require the necessary discord.js classes
require("dotenv").config();
const path = require("path");
const fs = require("fs");
const {
  Client: DiscordClient,
  Collection,
  Events,
  GatewayIntentBits,
} = require("discord.js");

// Create a new client instance
const discordclient = new DiscordClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

discordclient.commands = new Collection();

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);
for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      discordclient.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

// When the client is ready, run this code (only once)
discordclient.once("ready", () => {
  console.log(`Ready! Logged in as ${discordclient.user.tag}`);

  // Log the bot's clientId
  console.log(`Client ID: ${discordclient.user.id}`);

  // Log the IDs of all the guilds the bot is in
  discordclient.guilds.cache.forEach((guild) => {
    console.log(`Guild ID: ${guild.id}`);
  });
});

discordclient.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  // Get the guild from the interaction
  const { guild } = interaction;

  // Log the guild ID
  console.log(`Interaction received from guild: ${guild.id}`);

  const command = discordclient.commands.get(interaction.commandName);

  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
  }
});

// Listen for messages and reply with 'pong' if the bot is tagged and the message is 'ping'
discordclient.on("messageCreate", async (message) => {
  if (message.author.bot) return false;

  if (
    message.content.includes("@here") ||
    message.content.includes("@everyone") ||
    message.type == "REPLY"
  )
    return false;

  if (message.content.toLowerCase().includes("ping")) {
    message.channel.send("I wanna eat some ass");
  }
  if (message.content.toLowerCase().includes("can you suck it?")) {
    message.channel.send("Whaat?");
  }
  if (message.content.toLowerCase().includes("can you bless me?")) {
    message.channel.send("Money wise");
  }
  if (message.content.toLowerCase().includes("god")) {
    message.channel.send("On god.");
  }
  if (message.content.toLowerCase().includes("prayer")) {
    message.channel.send({
      files: [
        {
          attachment:
            "https://media.discordapp.net/attachments/539934160534372412/973009788810182696/IMG_8403.gif?width=667&height=805",
          name: "SPOILER_prayer.gif",
        },
      ],
    });
  }
  if (
    message.content.toLowerCase().includes("goon")
  ) {
    message.channel.send({
      files: [
        {
          attachment:
            "https://media.discordapp.net/attachments/922115343877546034/1154379690438565959/153551090-1.gif?ex=654388dd&is=653113dd&hm=1690535d24024743e8fcf8825b4559fa2948373402e1123148c5ff2beeeb18c1&=",
          name: "SPOILER_goon.gif",
        }
      ],
    });
  }
  if (message.content.toLowerCase().includes("live" || "love" || "lie")) {
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
    message.content.toLowerCase().includes("criminal")
  ) {
    message.channel.send({
      files: ["https://im.ezgif.com/tmp/ezgif-1-77191792b3.gif"],
    });
  }

});

discordclient.on("guildMemberAdd", async (guildMember) => {
  console.log("Guild Member joined");

  // Send a direct message to the new member
  guildMember.send("Buss!");

  // Or send a message to a specific channel in the guild
  const welcomeChannel = guildMember.guild.channels.cache.find((channel) =>
    channel.name.toLowerCase().includes("general")
  );
  if (welcomeChannel) {
    welcomeChannel.send(
      `Welcome ${guildMember.user.tag}, I wanna eat some ass.`
    );
  }
});

discordclient.on("guildMemberRemove", async (guildMember) => {
  console.log("One bitch has left");

  // Try to find a channel named "general"
  let generalChannel = guildMember.guild.channels.cache.find((channel) =>
    channel.name.toLowerCase().includes("general")
  );

  // If not found, try to find the first text channel that everyone has permission to send messages in
  if (!generalChannel) {
    generalChannel = guildMember.guild.channels.cache.find(
      (channel) =>
        channel.type === "GUILD_TEXT" &&
        channel
          .permissionsFor(guildMember.guild.roles.everyone)
          .has("SEND_MESSAGES")
    );
  }

  // Send a message if a suitable channel is found
  if (generalChannel) {
    generalChannel.send(
      `${guildMember.user.tag} has left the server. Fuck you, you stupid.`
    );
  }
});

// Log in to Discord with your client's token
discordclient.login(process.env.CLIENTTOKEN);
