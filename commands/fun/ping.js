const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong and current websocket latency.'),
  async execute(interaction) {
    const latency = interaction.client?.ws?.ping;
    if (typeof latency === 'number' && latency >= 0) {
      await interaction.reply(`Pong! (${Math.round(latency)}ms)`);
      return;
    }
    await interaction.reply('Pong!');
  },
};
