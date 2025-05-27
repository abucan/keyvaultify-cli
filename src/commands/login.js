const readline = require('readline');
const fs = require('fs');
const os = require('os');
const path = require('path');

module.exports = function login() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('🔑 Paste your API token: ', (token) => {
    const configDir = path.join(os.homedir(), '.keyvaultify');
    const configPath = path.join(configDir, 'config.json');

    if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });

    fs.writeFileSync(
      configPath,
      JSON.stringify({ token: token.trim() }, null, 2)
    );

    console.log(`✅ Token saved to ${configPath}`);
    rl.close();
  });
};
