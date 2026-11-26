const {
  ChannelType,
  Client,
  Events,
  GatewayIntentBits,
  MessageFlags,
  MessageType,
  PermissionFlagsBits,
} = require('discord.js');
const { loadCommands } = require('./commandLoader');
const { loadConfig } = require('./config');

function findAnnouncementChannel(guild, preferredName = 'general') {
  const normalizedName = preferredName.toLowerCase();
  const textChannels = guild.channels.cache.filter(
    (channel) => channel.type === ChannelType.GuildText,
  );

  const namedChannel = textChannels.find(
    (channel) => channel.name.toLowerCase() === normalizedName,
  );
  if (namedChannel) {
    return namedChannel;
  }

  return textChannels.find((channel) => {
    const permissions = channel.permissionsFor(guild.roles.everyone);
    return Boolean(permissions && permissions.has(PermissionFlagsBits.SendMessages));
  });
}

async function handleInteraction(interaction, commands, logger = console) {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const command = commands.get(interaction.commandName);
  if (!command) {
    logger.warn(`No command matching "${interaction.commandName}" was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    logger.error(`Error executing /${interaction.commandName}:`, error);
    const errorReply = {
      content: 'There was an error while executing this command.',
      flags: MessageFlags.Ephemeral,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorReply);
    } else {
      await interaction.reply(errorReply);
    }
  }
}

async function handleMessageCreate(message, botUser) {
  if (message.author.bot) {
    return;
  }

  if (
    message.mentions.everyone ||
    message.content.includes('@here') ||
    message.content.includes('@everyone') ||
    message.type === MessageType.Reply
  ) {
    return;
  }

  const normalized = message.content.trim().toLowerCase();
  const isMentioned = Boolean(botUser && message.mentions.has(botUser.id));

  if (isMentioned && normalized.includes('ping')) {
    await message.channel.send('Pong!');
  }
}

async function handleGuildMemberAdd(guildMember, { welcomeChannelName = 'general', logger = console } = {}) {
  try {
    await guildMember.send(`Welcome to ${guildMember.guild.name}! Type / in any channel to see available commands.`);
  } catch {
    logger.warn(`Could not send welcome DM to ${guildMember.user.tag} (DMs may be disabled).`);
  }

  const welcomeChannel = findAnnouncementChannel(guildMember.guild, welcomeChannelName);
  if (welcomeChannel) {
    await welcomeChannel.send(`Welcome to the server, ${guildMember.user.tag}!`);
  }
}

async function handleGuildMemberRemove(guildMember, { welcomeChannelName = 'general' } = {}) {
  const announcementChannel = findAnnouncementChannel(guildMember.guild, welcomeChannelName);
  if (announcementChannel) {
    await announcementChannel.send(`${guildMember.user.tag} has left the server.`);
  }
}

function createBotClient({ config = loadConfig(), commands = loadCommands(), logger = console } = {}) {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  client.commands = commands;

  client.once(Events.ClientReady, (readyClient) => {
    logger.log(`Ready! Logged in as ${readyClient.user.tag} (${readyClient.user.id}).`);
    logger.log(`Serving ${readyClient.guilds.cache.size} guild(s).`);
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    await handleInteraction(interaction, client.commands, logger);
  });

  client.on(Events.MessageCreate, async (message) => {
    try {
      await handleMessageCreate(message, client.user);
    } catch (error) {
      logger.error('Error handling messageCreate:', error);
    }
  });

  client.on(Events.GuildMemberAdd, async (guildMember) => {
    try {
      await handleGuildMemberAdd(guildMember, {
        welcomeChannelName: config.welcomeChannelName,
        logger,
      });
    } catch (error) {
      logger.error('Error handling guildMemberAdd:', error);
    }
  });

  client.on(Events.GuildMemberRemove, async (guildMember) => {
    try {
      await handleGuildMemberRemove(guildMember, {
        welcomeChannelName: config.welcomeChannelName,
      });
    } catch (error) {
      logger.error('Error handling guildMemberRemove:', error);
    }
  });

  return client;
}

module.exports = {
  createBotClient,
  findAnnouncementChannel,
  handleInteraction,
  handleMessageCreate,
  handleGuildMemberAdd,
  handleGuildMemberRemove,
};
