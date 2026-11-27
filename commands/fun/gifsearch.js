const { SlashCommandBuilder } = require('discord.js');
const { loadConfig } = require('../../src/config');

const TENOR_SEARCH_URL = 'https://tenor.googleapis.com/v2/search';
const RESULT_LIMIT = 7;

async function searchTenorGif(query, { apiKey, fetchImpl = fetch, randomFn = Math.random } = {}) {
  const params = new URLSearchParams({
    q: query,
    key: apiKey,
    client_key: 'discordbot',
    limit: String(RESULT_LIMIT),
  });

  const response = await fetchImpl(`${TENOR_SEARCH_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Tenor API responded with status ${response.status}`);
  }

  const payload = await response.json();
  const results = Array.isArray(payload?.results) ? payload.results : [];
  if (results.length === 0) {
    return null;
  }

  const index = Math.min(results.length - 1, Math.floor(randomFn() * results.length));
  return results[index]?.itemurl || results[index]?.url || null;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gifsearch')
    .setDescription('Search Tenor for a GIF.')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('What to search for')
        .setRequired(true),
    ),
  searchTenorGif,
  async execute(interaction, deps = {}) {
    await interaction.deferReply();

    const query = interaction.options.getString('query', true).trim();
    const apiKey = deps.apiKey ?? loadConfig().tenorApiKey;

    if (!apiKey) {
      await interaction.editReply({
        content: 'GIF search is not configured (missing TENOR_API_KEY).',
      });
      return;
    }

    try {
      const gifUrl = await searchTenorGif(query, {
        apiKey,
        fetchImpl: deps.fetchImpl,
        randomFn: deps.randomFn,
      });

      if (!gifUrl) {
        await interaction.editReply({
          content: `I could not find a matching GIF for "${query}".`,
        });
        return;
      }

      await interaction.editReply({ content: gifUrl });
    } catch (error) {
      console.error('Error searching Tenor:', error);
      await interaction.editReply({
        content: 'Could not reach the GIF search service right now. Please try again later.',
      });
    }
  },
};
