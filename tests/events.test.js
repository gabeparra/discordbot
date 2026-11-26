const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { ChannelType, Collection, MessageType, PermissionFlagsBits } = require('discord.js');
const {
  findAnnouncementChannel,
  handleGuildMemberAdd,
  handleGuildMemberRemove,
  handleInteraction,
  handleMessageCreate,
} = require('../src/bot');

describe('bot event handlers', () => {
  it('handles command errors with reply or followUp safely', async () => {
    const commands = new Collection();
    commands.set('boom', {
      async execute() {
        throw new Error('boom');
      },
    });

    const replies = [];
    const followUps = [];
    const silentLogger = { warn() {}, error() {} };

    await handleInteraction(
      {
        isChatInputCommand: () => true,
        commandName: 'boom',
        replied: false,
        deferred: false,
        async reply(payload) {
          replies.push(payload);
        },
        async followUp(payload) {
          followUps.push(payload);
        },
      },
      commands,
      silentLogger,
    );
    assert.equal(replies.length, 1);
    assert.equal(followUps.length, 0);

    await handleInteraction(
      {
        isChatInputCommand: () => true,
        commandName: 'boom',
        replied: false,
        deferred: true,
        async reply(payload) {
          replies.push(payload);
        },
        async followUp(payload) {
          followUps.push(payload);
        },
      },
      commands,
      silentLogger,
    );
    assert.equal(followUps.length, 1);
  });

  it('responds with Pong only when mentioned with ping and ignores replies/bots', async () => {
    const sent = [];
    const botUser = { id: 'bot-1' };

    await handleMessageCreate(
      {
        author: { bot: false },
        content: '<@bot-1> ping',
        type: MessageType.Default,
        mentions: { everyone: false, has: (id) => id === 'bot-1' },
        channel: { send: async (msg) => sent.push(msg) },
      },
      botUser,
    );
    assert.deepEqual(sent, ['Pong!']);

    await handleMessageCreate(
      {
        author: { bot: false },
        content: '<@bot-1> ping',
        type: MessageType.Reply,
        mentions: { everyone: false, has: (id) => id === 'bot-1' },
        channel: { send: async (msg) => sent.push(msg) },
      },
      botUser,
    );
    assert.equal(sent.length, 1);
  });

  it('finds preferred or fallback guild text channel and handles closed DMs gracefully', async () => {
    const sentMessages = [];
    const fallbackChannel = {
      name: 'lobby',
      type: ChannelType.GuildText,
      permissionsFor: () => ({ has: (perm) => perm === PermissionFlagsBits.SendMessages }),
      send: async (msg) => sentMessages.push(msg),
    };

    const channels = new Collection([['1', fallbackChannel]]);
    const guild = {
      name: 'My Guild',
      roles: { everyone: {} },
      channels: { cache: channels },
    };

    assert.equal(findAnnouncementChannel(guild, 'general'), fallbackChannel);

    const warnings = [];
    const member = {
      guild,
      user: { tag: 'newuser#0001' },
      send: async () => {
        throw new Error('Cannot send messages to this user');
      },
    };

    await handleGuildMemberAdd(member, {
      welcomeChannelName: 'general',
      logger: { warn: (msg) => warnings.push(msg) },
    });
    assert.equal(warnings.length, 1);
    assert.equal(sentMessages[0], 'Welcome to the server, newuser#0001!');

    await handleGuildMemberRemove(member, { welcomeChannelName: 'general' });
    assert.equal(sentMessages[1], 'newuser#0001 has left the server.');
  });
});
