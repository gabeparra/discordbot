const fs = require('node:fs');
const path = require('node:path');
const { Collection } = require('discord.js');

function loadCommands(commandsDir = path.join(__dirname, '..', 'commands'), logger = console) {
  const commands = new Collection();

  if (!fs.existsSync(commandsDir)) {
    return commands;
  }

  const entries = fs.readdirSync(commandsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const folderPath = path.join(commandsDir, entry.name);
    const commandFiles = fs
      .readdirSync(folderPath)
      .filter((file) => file.endsWith('.js'))
      .sort();

    for (const file of commandFiles) {
      const filePath = path.join(folderPath, file);
      const command = require(filePath);

      if (command && 'data' in command && 'execute' in command) {
        commands.set(command.data.name, command);
      } else {
        logger.warn(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
        );
      }
    }
  }

  return commands;
}

module.exports = {
  loadCommands,
};
