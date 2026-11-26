const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { assertDeployConfig, assertDiscordToken, loadConfig, parsePositiveInt } = require('../src/config');

describe('config', () => {
  it('loads defaults when optional environment variables are unset', () => {
    const config = loadConfig({}, {});
    assert.equal(config.discordToken, '');
    assert.equal(config.welcomeChannelName, 'general');
    assert.equal(config.currencyName, 'coins');
    assert.equal(config.dailyReward, 50);
    assert.equal(config.dailyCooldownHours, 24);
    assert.deepEqual(config.database, {
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: '',
      database: 'discordbot',
    });
  });

  it('prefers environment variables over config.json fallback', () => {
    const config = loadConfig(
      {
        DISCORD_TOKEN: 'env-token',
        DISCORD_CLIENT_ID: 'env-client',
        DISCORD_GUILD_ID: 'env-guild',
        TENOR_API_KEY: 'tenor-key',
        POSTGRES_USER: 'botuser',
        POSTGRES_PASSWORD: 'secret',
        POSTGRES_DB: 'botdb',
        PGHOST: 'postgres',
        PGPORT: '5433',
        CURRENCY_NAME: 'stars',
        DAILY_REWARD: '100',
        DAILY_COOLDOWN_HOURS: '12',
      },
      { token: 'file-token', clientId: 'file-client' },
    );

    assert.equal(config.discordToken, 'env-token');
    assert.equal(config.discordClientId, 'env-client');
    assert.equal(config.discordGuildId, 'env-guild');
    assert.equal(config.tenorApiKey, 'tenor-key');
    assert.equal(config.currencyName, 'stars');
    assert.equal(config.dailyReward, 100);
    assert.equal(config.dailyCooldownHours, 12);
    assert.deepEqual(config.database, {
      host: 'postgres',
      port: 5433,
      user: 'botuser',
      password: 'secret',
      database: 'botdb',
    });
  });

  it('supports DATABASE_URL when provided', () => {
    const config = loadConfig({ DATABASE_URL: 'postgres://user:pass@db:5432/app' }, {});
    assert.deepEqual(config.database, { connectionString: 'postgres://user:pass@db:5432/app' });
  });

  it('falls back to positive defaults for invalid numeric strings', () => {
    assert.equal(parsePositiveInt('-5', 24), 24);
    assert.equal(parsePositiveInt('abc', 50), 50);
    assert.equal(parsePositiveInt('0', 10), 10);
    assert.equal(parsePositiveInt('75', 50), 75);
  });

  it('validates required Discord credentials', () => {
    assert.throws(() => assertDiscordToken(loadConfig({}, {})), /DISCORD_TOKEN/);
    assert.throws(
      () => assertDeployConfig(loadConfig({ DISCORD_TOKEN: 'tok' }, {})),
      /DISCORD_CLIENT_ID/,
    );
    assert.doesNotThrow(() =>
      assertDeployConfig(loadConfig({ DISCORD_TOKEN: 'tok', DISCORD_CLIENT_ID: 'cid' }, {})),
    );
  });
});
