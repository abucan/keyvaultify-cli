const fs = require('fs');
const os = require('os');
const path = require('path');

const CONFIG_PATH = path.join(os.homedir(), '.keyvaultify', 'config.json');

function getToken() {
  try {
    if (!fs.existsSync(CONFIG_PATH)) return null;

    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    const parsed = JSON.parse(raw);

    return parsed.token || null;
  } catch (err) {
    console.error('❌ Error reading token config:', err.message);
    return null;
  }
}

module.exports = { getToken };
