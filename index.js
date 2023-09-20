// Require the necessary discord.js classes
const { Client, GatewayIntentBits } = require("discord.js");
const { token } = require("./config.json");

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
});

// When the client is ready, run this code (only once)
client.once("ready", () => {
  console.log(`Ready! Logged in as ${client.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);

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
      files: [
        "https://media.discordapp.net/attachments/539934160534372412/973009788810182696/IMG_8403.gif?width=667&height=805",
      ],
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
});
