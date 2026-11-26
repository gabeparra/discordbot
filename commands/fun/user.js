const { InteractionContextType, MessageFlags, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('user')
    .setDescription('Provides information about a server member.')
    .setContexts(InteractionContextType.Guild)
    .addUserOption((option) =>
      option.setName('target').setDescription('Member to inspect (defaults to you)'),
    ),
  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({
        content: 'This command can only be used inside a server.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const targetUser = interaction.options?.getUser('target') ?? interaction.user;
    const targetMember =
      targetUser.id === interaction.user.id
        ? interaction.member
        : interaction.options?.getMember('target');

    const joinedAt = targetMember?.joinedAt;
    const joinedText = joinedAt
      ? `joined on <t:${Math.floor(joinedAt.getTime() / 1000)}:D>`
      : 'join date unavailable';

    await interaction.reply(`**${targetUser.username}** (${joinedText}).`);
  },
};
