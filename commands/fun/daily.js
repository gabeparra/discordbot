const { InteractionContextType, MessageFlags, SlashCommandBuilder } = require('discord.js');
const { loadConfig } = require('../../src/config');
const { claimDailyReward, getPool } = require('../../src/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your daily coin reward.')
    .setContexts(InteractionContextType.Guild),
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
    const now = deps.now ?? new Date();

    try {
      const result = await claimDailyReward(pool, {
        guildId: interaction.guildId,
        memberId: interaction.user.id,
        amount: config.dailyReward,
        cooldownHours: config.dailyCooldownHours,
        now,
      });

      if (!result.claimed) {
        const nextTimestamp = Math.floor(result.nextClaimAt.getTime() / 1000);
        await interaction.editReply(
          `You already claimed your daily reward. Come back <t:${nextTimestamp}:R>. Current balance: **${result.balance} ${config.currencyName}**.`,
        );
        return;
      }

      await interaction.editReply(
        `Added **${result.amount} ${config.currencyName}** to your balance! New total: **${result.balance} ${config.currencyName}**.`,
      );
    } catch (error) {
      console.error('Error processing daily reward:', error);
      await interaction.editReply('There was an error updating your balance. Please try again later.');
    }
  },
};
