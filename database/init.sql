CREATE TABLE IF NOT EXISTS guild_member_data (
  guild_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  balance BIGINT NOT NULL DEFAULT 0,
  last_daily_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (guild_id, member_id)
);
