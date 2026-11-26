const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { loadCommands } = require('../src/commandLoader');

describe('commandLoader', () => {
  it('loads all repository slash commands with valid schemas', () => {
    const commands = loadCommands();
    const names = Array.from(commands.keys()).sort();

    assert.deepEqual(names, ['balance', 'daily', 'gifsearch', 'ping', 'server', 'user']);

    for (const command of commands.values()) {
      const json = command.data.toJSON();
      assert.equal(typeof json.name, 'string');
      assert.equal(typeof json.description, 'string');
      assert.equal(typeof command.execute, 'function');
    }
  });

  it('warns and skips malformed command files', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'discordbot-cmds-'));
    const categoryDir = path.join(tempDir, 'misc');
    fs.mkdirSync(categoryDir);
    fs.writeFileSync(path.join(categoryDir, 'broken.js'), 'module.exports = { foo: 1 };\n');

    const warnings = [];
    const commands = loadCommands(tempDir, { warn: (msg) => warnings.push(msg) });

    assert.equal(commands.size, 0);
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /missing a required "data" or "execute" property/);

    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});
