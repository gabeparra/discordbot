const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { claimDailyReward, getMemberBalance } = require('../src/db');

function createFakePool(handlers) {
  const queries = [];
  let released = false;

  const client = {
    async query(sql, params) {
      queries.push({ sql, params });
      if (handlers.onQuery) {
        return handlers.onQuery(sql, params);
      }
      return { rows: [] };
    },
    release() {
      released = true;
    },
  };

  return {
    queries,
    get released() {
      return released;
    },
    async connect() {
      return client;
    },
    async query(sql, params) {
      queries.push({ sql, params });
      if (handlers.onQuery) {
        return handlers.onQuery(sql, params);
      }
      return { rows: [] };
    },
  };
}

describe('db', () => {
  it('inserts a new member row on first daily claim', async () => {
    const pool = createFakePool({
      onQuery(sql) {
        if (sql.startsWith('SELECT')) {
          return { rows: [] };
        }
        return { rows: [] };
      },
    });

    const now = new Date('2026-01-01T12:00:00Z');
    const result = await claimDailyReward(pool, {
      guildId: 'g1',
      memberId: 'u1',
      amount: 50,
      cooldownHours: 24,
      now,
    });

    assert.deepEqual(result, { claimed: true, balance: 50, amount: 50 });
    assert.equal(pool.released, true);
    assert.ok(pool.queries.some((q) => q.sql.startsWith('INSERT INTO guild_member_data')));
    assert.ok(pool.queries.some((q) => q.sql === 'COMMIT'));
  });

  it('rejects daily claim when still within cooldown window', async () => {
    const now = new Date('2026-01-01T12:00:00Z');
    const lastClaim = new Date('2026-01-01T06:00:00Z');
    const pool = createFakePool({
      onQuery(sql) {
        if (sql.startsWith('SELECT')) {
          return { rows: [{ balance: '150', last_daily_at: lastClaim.toISOString() }] };
        }
        return { rows: [] };
      },
    });

    const result = await claimDailyReward(pool, {
      guildId: 'g1',
      memberId: 'u1',
      amount: 50,
      cooldownHours: 24,
      now,
    });

    assert.equal(result.claimed, false);
    assert.equal(result.balance, 150);
    assert.equal(result.nextClaimAt.toISOString(), '2026-01-02T06:00:00.000Z');
    assert.equal(pool.released, true);
    assert.equal(
      pool.queries.some((q) => q.sql.startsWith('UPDATE')),
      false,
    );
  });

  it('updates balance when cooldown has expired', async () => {
    const now = new Date('2026-01-02T12:00:00Z');
    const lastClaim = new Date('2026-01-01T06:00:00Z');
    const pool = createFakePool({
      onQuery(sql) {
        if (sql.startsWith('SELECT')) {
          return { rows: [{ balance: '150', last_daily_at: lastClaim.toISOString() }] };
        }
        return { rows: [] };
      },
    });

    const result = await claimDailyReward(pool, {
      guildId: 'g1',
      memberId: 'u1',
      amount: 50,
      cooldownHours: 24,
      now,
    });

    assert.deepEqual(result, { claimed: true, balance: 200, amount: 50 });
    assert.equal(pool.released, true);
    const updateQuery = pool.queries.find((q) => q.sql.startsWith('UPDATE'));
    assert.ok(updateQuery);
    assert.equal(updateQuery.params[0], 200);
  });

  it('rolls back and releases client on database failure', async () => {
    const pool = createFakePool({
      onQuery(sql) {
        if (sql.startsWith('SELECT')) {
          throw new Error('connection lost');
        }
        return { rows: [] };
      },
    });

    await assert.rejects(
      () => claimDailyReward(pool, { guildId: 'g1', memberId: 'u1' }),
      /connection lost/,
    );
    assert.equal(pool.released, true);
    assert.ok(pool.queries.some((q) => q.sql === 'ROLLBACK'));
  });

  it('returns 0 balance when member has no record yet', async () => {
    const pool = createFakePool({ onQuery: () => ({ rows: [] }) });
    const balance = await getMemberBalance(pool, { guildId: 'g1', memberId: 'u2' });
    assert.equal(balance, 0);
  });
});
