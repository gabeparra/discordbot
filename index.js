require('dotenv').config();

const { assertDiscordToken, loadConfig } = require('./src/config');
const { createBotClient } = require('./src/bot');
const { closePool } = require('./src/db');

async function start() {
  const config = loadConfig();
  assertDiscordToken(config);

  const client = createBotClient({ config });

  const shutdown = async (signal) => {
    console.log(`Received ${signal}, shutting down...`);
    client.destroy();
    await closePool();
    process.exit(0);
  };

  process.once('SIGINT', () => {
    shutdown('SIGINT');
  });
  process.once('SIGTERM', () => {
    shutdown('SIGTERM');
  });

  await client.login(config.discordToken);
}

if (require.main === module) {
  start().catch((error) => {
    console.error('Failed to start bot:', error);
    process.exit(1);
  });
}

module.exports = { start };
