const { InteractionContextType, MessageFlags, SlashCommandBuilder } = require('discord.js');
const { loadConfig } = require('../../src/config');
const { getMemberBalance, getPool } = require('../../src/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your coin balance (or another member\'s balance).')
    .setContexts(InteractionContextType.Guild)
    .addUserOption((option) =>
      option.setName('target').setDescription('Member whose balance to check (defaults to you)'),
    ),
  async execute(interaction, deps = {}) {
    if (!interaction.guildId) {
      await interaction.reply({
        content: 'This command can only be used inside a server.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply();

    const config = deps.config ?? loadConfig();
    const pool = deps.pool ?? getPool();
    const targetUser = interaction.options?.getUser('target') ?? interaction.user;

    try {
      const balance = await getMemberBalance(pool, {
        guildId: interaction.guildId,
        memberId: targetUser.id,
      });

      const subject =
        targetUser.id === interaction.user.id ? 'Your balance is' : `${targetUser.username}'s balance is`;

      await interaction.editReply(`${subject} **${balance} ${config.currencyName}**.`);
    } catch (error) {
      console.error('Error reading member balance:', error);
      await interaction.editReply('There was an error reading the balance. Please try again later.');
    }
  },
};
