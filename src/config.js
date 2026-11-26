const fs = require('node:fs');
const path = require('node:path');

function loadOptionalConfigJson(rootDir = path.resolve(__dirname, '..')) {
  const configPath = path.join(rootDir, 'config.json');
  if (!fs.existsSync(configPath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function parsePositiveInt(value, fallback) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function loadConfig(env = process.env, fileConfig = null) {
  const jsonConfig = fileConfig ?? loadOptionalConfigJson();

  const discordToken = env.DISCORD_TOKEN || env.CLIENTTOKEN || jsonConfig.token || '';
  const discordClientId = env.DISCORD_CLIENT_ID || jsonConfig.clientId || '';
  const discordGuildId = env.DISCORD_GUILD_ID || jsonConfig.guildId || '';
  const tenorApiKey = env.TENOR_API_KEY || '';
  const welcomeChannelName = (env.WELCOME_CHANNEL_NAME || 'general').trim() || 'general';
  const currencyName = (env.CURRENCY_NAME || 'coins').trim() || 'coins';
  const dailyReward = parsePositiveInt(env.DAILY_REWARD, 50);
  const dailyCooldownHours = parsePositiveInt(env.DAILY_COOLDOWN_HOURS, 24);

  const database = env.DATABASE_URL
    ? { connectionString: env.DATABASE_URL }
    : {
        host: env.PGHOST || 'localhost',
        port: parsePositiveInt(env.PGPORT, 5432),
        user: env.PGUSER || env.POSTGRES_USER || 'postgres',
        password: env.PGPASSWORD || env.POSTGRES_PASSWORD || '',
        database: env.PGDATABASE || env.POSTGRES_DB || 'discordbot',
      };

  return {
    discordToken,
    discordClientId,
    discordGuildId,
    tenorApiKey,
    welcomeChannelName,
    currencyName,
    dailyReward,
    dailyCooldownHours,
    database,
  };
}

function assertDiscordToken(config) {
  if (!config.discordToken) {
    throw new Error('Missing DISCORD_TOKEN environment variable (or config.json token).');
  }
}

function assertDeployConfig(config) {
  assertDiscordToken(config);
  if (!config.discordClientId) {
    throw new Error('Missing DISCORD_CLIENT_ID environment variable (or config.json clientId).');
  }
}

module.exports = {
  loadConfig,
  assertDiscordToken,
  assertDeployConfig,
  parsePositiveInt,
};
