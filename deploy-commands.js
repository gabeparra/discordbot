require('dotenv').config();

const { REST, Routes } = require('discord.js');
const { loadCommands } = require('./src/commandLoader');
const { assertDeployConfig, loadConfig } = require('./src/config');

async function deployCommands() {
  const config = loadConfig();
  assertDeployConfig(config);

  const commands = Array.from(loadCommands().values()).map((command) => command.data.toJSON());
  const rest = new REST().setToken(config.discordToken);

  const route = config.discordGuildId
    ? Routes.applicationGuildCommands(config.discordClientId, config.discordGuildId)
    : Routes.applicationCommands(config.discordClientId);

  const scope = config.discordGuildId ? `guild ${config.discordGuildId}` : 'global';
  console.log(`Refreshing ${commands.length} application (/) commands (${scope})...`);

  const data = await rest.put(route, { body: commands });
  console.log(`Successfully reloaded ${data.length} application (/) commands (${scope}).`);
}

if (require.main === module) {
  deployCommands().catch((error) => {
    console.error('Failed to deploy commands:', error);
    process.exit(1);
  });
}

module.exports = { deployCommands };
