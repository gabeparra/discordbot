const { InteractionContextType, MessageFlags, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('server')
    .setDescription('Provides information about this server.')
    .setContexts(InteractionContextType.Guild),
  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({
        content: 'This command can only be used inside a server.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const { name, memberCount, createdAt } = interaction.guild;
    const createdTimestamp = createdAt ? Math.floor(createdAt.getTime() / 1000) : null;
    const createdText = createdTimestamp ? ` (created <t:${createdTimestamp}:D>)` : '';

    await interaction.reply(
      `This server is **${name}** and has **${memberCount}** members${createdText}.`,
    );
  },
};
