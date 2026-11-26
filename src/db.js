const { Pool } = require('pg');
const { loadConfig } = require('./config');

let sharedPool = null;

function createPool(dbConfig = loadConfig().database) {
  return new Pool(dbConfig);
}

function getPool() {
  if (!sharedPool) {
    sharedPool = createPool();
  }
  return sharedPool;
}

async function closePool() {
  if (sharedPool) {
    const poolToClose = sharedPool;
    sharedPool = null;
    await poolToClose.end();
  }
}

async function claimDailyReward(pool, { guildId, memberId, amount = 50, cooldownHours = 24, now = new Date() }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const res = await client.query(
      'SELECT balance, last_daily_at FROM guild_member_data WHERE guild_id = $1 AND member_id = $2 FOR UPDATE',
      [guildId, memberId],
    );

    const cooldownMs = cooldownHours * 60 * 60 * 1000;

    if (res.rows.length > 0) {
      const currentBalance = Number.parseInt(res.rows[0].balance, 10) || 0;
      const lastDailyAt = res.rows[0].last_daily_at ? new Date(res.rows[0].last_daily_at) : null;

      if (lastDailyAt && now.getTime() - lastDailyAt.getTime() < cooldownMs) {
        await client.query('COMMIT');
        const nextClaimAt = new Date(lastDailyAt.getTime() + cooldownMs);
        return {
          claimed: false,
          balance: currentBalance,
          nextClaimAt,
        };
      }

      const newBalance = currentBalance + amount;
      await client.query(
        'UPDATE guild_member_data SET balance = $1, last_daily_at = $2, updated_at = $2 WHERE guild_id = $3 AND member_id = $4',
        [newBalance, now.toISOString(), guildId, memberId],
      );
      await client.query('COMMIT');
      return {
        claimed: true,
        balance: newBalance,
        amount,
      };
    }

    await client.query(
      'INSERT INTO guild_member_data (guild_id, member_id, balance, last_daily_at, updated_at) VALUES ($1, $2, $3, $4, $4)',
      [guildId, memberId, amount, now.toISOString()],
    );
    await client.query('COMMIT');
    return {
      claimed: true,
      balance: amount,
      amount,
    };
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Preserve the original transaction error.
    }
    throw err;
  } finally {
    client.release();
  }
}

async function getMemberBalance(pool, { guildId, memberId }) {
  const res = await pool.query(
    'SELECT balance FROM guild_member_data WHERE guild_id = $1 AND member_id = $2',
    [guildId, memberId],
  );

  if (res.rows.length === 0) {
    return 0;
  }

  return Number.parseInt(res.rows[0].balance, 10) || 0;
}

module.exports = {
  createPool,
  getPool,
  closePool,
  claimDailyReward,
  getMemberBalance,
};
