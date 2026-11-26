const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const pingCommand = require('../commands/fun/ping');
const serverCommand = require('../commands/fun/server');
const userCommand = require('../commands/fun/user');
const gifsearchCommand = require('../commands/fun/gifsearch');
const dailyCommand = require('../commands/fun/daily');
const balanceCommand = require('../commands/fun/balance');

function createMockInteraction(overrides = {}) {
  const replies = [];
  const edited = [];
  let deferred = false;

  return {
    guildId: 'guild-1',
    guild: {
      name: 'Test Server',
      memberCount: 42,
      createdAt: new Date('2023-01-01T00:00:00Z'),
    },
    user: { id: 'user-1', username: 'alice' },
    member: { joinedAt: new Date('2023-06-15T00:00:00Z') },
    client: { ws: { ping: 37.4 } },
    options: {
      getString: () => '',
      getUser: () => null,
      getMember: () => null,
    },
    async reply(payload) {
      replies.push(payload);
    },
    async deferReply() {
      deferred = true;
    },
    async editReply(payload) {
      edited.push(payload);
    },
    get replies() {
      return replies;
    },
    get edited() {
      return edited;
    },
    get deferred() {
      return deferred;
    },
    ...overrides,
  };
}

describe('slash commands', () => {
  it('/ping replies with Pong and latency', async () => {
    const interaction = createMockInteraction();
    await pingCommand.execute(interaction);
    assert.equal(interaction.replies[0], 'Pong! (37ms)');
  });

  it('/server returns server details and guards against DMs', async () => {
    const guildInteraction = createMockInteraction();
    await serverCommand.execute(guildInteraction);
    assert.match(guildInteraction.replies[0], /Test Server/);
    assert.match(guildInteraction.replies[0], /42/);

    const dmInteraction = createMockInteraction({ guild: null, guildId: null });
    await serverCommand.execute(dmInteraction);
    assert.match(dmInteraction.replies[0].content, /only be used inside a server/);
  });

  it('/user returns invoker join info', async () => {
    const interaction = createMockInteraction();
    await userCommand.execute(interaction);
    assert.match(interaction.replies[0], /\*\*alice\*\*/);
    assert.match(interaction.replies[0], /<t:\d+:D>/);
  });

  it('/gifsearch handles missing API key, valid results, and empty results', async () => {
    const noKeyInteraction = createMockInteraction({
      options: { getString: () => 'cats & dogs' },
    });
    await gifsearchCommand.execute(noKeyInteraction, { apiKey: '' });
    assert.match(noKeyInteraction.edited[0].content, /TENOR_API_KEY/);

    let requestedUrl = '';
    const okInteraction = createMockInteraction({
      options: { getString: () => 'cats & dogs' },
    });
    await gifsearchCommand.execute(okInteraction, {
      apiKey: 'test-key',
      randomFn: () => 0.99,
      fetchImpl: async (url) => {
        requestedUrl = url;
        return {
          ok: true,
          async json() {
            return { results: [{ itemurl: 'https://tenor.com/view/cat-1' }] };
          },
        };
      },
    });
    assert.match(requestedUrl, /q=cats\+%26\+dogs/);
    assert.equal(okInteraction.edited[0].content, 'https://tenor.com/view/cat-1');

    const emptyInteraction = createMockInteraction({
      options: { getString: () => 'zzz-not-found' },
    });
    await gifsearchCommand.execute(emptyInteraction, {
      apiKey: 'test-key',
      fetchImpl: async () => ({
        ok: true,
        async json() {
          return { results: [] };
        },
      }),
    });
    assert.equal(
      emptyInteraction.edited[0].content,
      'I could not find a matching GIF for "zzz-not-found".',
    );
  });

  it('/daily grants coins and respects cooldown', async () => {
    const makePool = (rows) => ({
      async connect() {
        return {
          async query(sql) {
            if (sql.startsWith('SELECT')) {
              return { rows };
            }
            return { rows: [] };
          },
          release() {},
        };
      },
    });

    const config = { currencyName: 'coins', dailyReward: 50, dailyCooldownHours: 24 };
    const now = new Date('2026-01-01T12:00:00Z');

    const firstClaim = createMockInteraction();
    await dailyCommand.execute(firstClaim, { config, pool: makePool([]), now });
    assert.match(firstClaim.edited[0], /Added \*\*50 coins\*\*/);
    assert.match(firstClaim.edited[0], /New total: \*\*50 coins\*\*/);

    const cooldownClaim = createMockInteraction();
    await dailyCommand.execute(cooldownClaim, {
      config,
      pool: makePool([{ balance: '50', last_daily_at: '2026-01-01T10:00:00Z' }]),
      now,
    });
    assert.match(cooldownClaim.edited[0], /already claimed your daily reward/);
  });

  it('/balance returns the member balance', async () => {
    const interaction = createMockInteraction();
    const pool = {
      async query() {
        return { rows: [{ balance: '250' }] };
      },
    };
    await balanceCommand.execute(interaction, {
      config: { currencyName: 'coins' },
      pool,
    });
    assert.equal(interaction.edited[0], 'Your balance is **250 coins**.');
  });
});
