require('dotenv').config();
const { SlashCommandBuilder } = require("discord.js");
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.PGHOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.PGPORT,
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Add money to bank'),
    async execute(interaction) {
        // Immediately acknowledge the interaction
        const guildId = interaction.guildId;
        const memberId = interaction.user.id;

        // Start a transaction
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const res = await client.query('SELECT value FROM guild_member_data WHERE guild_id = $1 AND member_id = $2 FOR UPDATE', [guildId, memberId]);
            if (res.rows.length > 0) {
                const currentValue = parseInt(res.rows[0].value, 10) || 0;
                await client.query('UPDATE guild_member_data SET value = $1 WHERE guild_id = $2 AND member_id = $3', [currentValue + 50, guildId, memberId]);
            } else {
                await client.query('INSERT INTO guild_member_data (guild_id, member_id, value) VALUES ($1, $2, $3)', [guildId, memberId, '50']);
            }
            await client.query('COMMIT');
            const currentValue = parseInt(res.rows[0].value, 10) || 0;
            // Send the final response
            await interaction.editReply('Money has been added! New total $'+[currentValue + 50]+' goon coin.');
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Error processing transaction', err);
            await interaction.editReply('There was an error adding money. Please try again later.');
        } finally {
            client.release();
        }
    },
};
