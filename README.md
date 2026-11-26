# discordbot

A Discord bot built with Node.js, [discord.js](https://discord.js.org/) v14, and PostgreSQL. Supports slash commands, Tenor GIF search, member welcome/leave announcements, and a PostgreSQL-backed daily coin reward system.

## Commands

| Command | Description |
| --- | --- |
| `/ping` | Replies with `Pong!` and current Discord WebSocket latency. |
| `/server` | Displays the current server name, member count, and creation date. |
| `/user [target]` | Displays a member's username and server join date. |
| `/gifsearch <query>` | Searches Tenor v2 for a matching GIF and posts a random result. |
| `/daily` | Claims your daily coin reward (enforces a configurable cooldown, 24 hours by default). |
| `/balance [target]` | Shows your current coin balance, or another server member's balance. |

Mentioning the bot with `ping` in a channel also replies with `Pong!`.

## Prerequisites

- Node.js 20+ (or Docker with Compose v2)
- A Discord application and bot token from the [Discord Developer Portal](https://discord.com/developers/applications)
  - Enable **Server Members Intent** and **Message Content Intent** under Bot settings if you want join/leave announcements and mention responses.
- PostgreSQL 14+ (included in `docker-compose.yml`) for `/daily` and `/balance`
- A [Tenor API v2 key](https://developers.google.com/tenor) for `/gifsearch`

## Configuration

Copy `.env.example` to `.env` and fill in your local values:

```bash
cp .env.example .env
```

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `DISCORD_TOKEN` | Yes | | Discord bot token. |
| `DISCORD_CLIENT_ID` | For deploy | | Discord application client ID (used by `deploy-commands.js`). |
| `DISCORD_GUILD_ID` | No | | Optional server ID for instant guild-scoped slash command deployment. Leave empty for global registration. |
| `TENOR_API_KEY` | For `/gifsearch` | | Tenor v2 API key. |
| `POSTGRES_USER` | For DB | `postgres` | PostgreSQL username. |
| `POSTGRES_PASSWORD` | For DB | | PostgreSQL password. |
| `POSTGRES_DB` | For DB | `discordbot` | PostgreSQL database name. |
| `PGHOST` | No | `localhost` | PostgreSQL host (set automatically to `postgres` in Docker Compose). |
| `PGPORT` | No | `5432` | PostgreSQL port. |
| `DATABASE_URL` | No | | Optional PostgreSQL connection URI (overrides individual `PG*` variables). |
| `WELCOME_CHANNEL_NAME` | No | `general` | Preferred text channel name for member join/leave messages. |
| `CURRENCY_NAME` | No | `coins` | Display name for the bot's virtual currency. |
| `DAILY_REWARD` | No | `50` | Amount granted by `/daily`. |
| `DAILY_COOLDOWN_HOURS` | No | `24` | Hours required between `/daily` claims. |

## Running Locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Initialize the PostgreSQL schema:

   ```bash
   psql "$DATABASE_URL" -f database/init.sql
   ```

3. Register slash commands with Discord:

   ```bash
   npm run deploy-commands
   ```

4. Start the bot:

   ```bash
   npm start
   ```

## Running with Docker Compose

`docker-compose.yml` starts PostgreSQL 16 (automatically applying `database/init.sql` on first boot) and the bot container:

```bash
cp .env.example .env
# Edit .env with your credentials
docker compose up --build -d
```

To register slash commands from the container:

```bash
docker compose run --rm discord npm run deploy-commands
```

## Development

```bash
npm run lint   # Run ESLint across the codebase
npm test       # Run the Node built-in test suite
```

## Project Structure

```text
commands/fun/       Slash command definitions (ping, server, user, gifsearch, daily, balance)
database/init.sql   PostgreSQL schema for member balances and daily claim timestamps
src/bot.js          Discord client factory and event handlers
src/commandLoader.js Dynamic slash command discovery and validation
src/config.js       Environment configuration loading and validation
src/db.js           PostgreSQL pool and transactional reward/balance queries
deploy-commands.js  Slash command registration CLI
index.js            Application entrypoint and graceful shutdown
tests/              Unit tests using node:test
```

## License

[MIT](LICENSE)
