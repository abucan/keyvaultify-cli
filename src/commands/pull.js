const fs = require('fs');
const path = require('path');
const axios = require('axios');
const readline = require('readline');
const { getToken } = require('../utils/auth');
const { getProjectConfig } = require('../utils/project');
const { decryptSecrets } = require('../utils/encrypt');

module.exports = async function pull(opts = {}) {
  try {
    const token = getToken();
    if (!token) throw new Error('Not logged in. Run `keyvault login`.');

    const config = getProjectConfig();
    if (!config) throw new Error('Not initialized. Run `keyvault init`.');

    const envFile = opts.env || '.env';
    const force = opts.force || false;
    const outputPath = path.join(process.cwd(), envFile);

    // Check for existing file
    if (fs.existsSync(outputPath) && !force) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      await new Promise((resolve) => {
        rl.question(
          `⚠️ ${envFile} already exists. Overwrite? (y/N): `,
          (answer) => {
            rl.close();
            if (answer.toLowerCase() !== 'y') {
              console.log('❌ Aborted.');
              process.exit(0);
            }
            resolve();
          }
        );
      });
    }

    // Fetch encrypted secrets
    const url = `http://localhost:3000/api/vault?projectId=${config.projectId}&environment=${config.environment}`;
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status !== 200) throw new Error(`Server returned ${res.status}`);

    const encrypted = res.data;
    console.log(
      `☁️ Fetched secrets for ${config.projectId} (${config.environment})`
    );

    const decrypted = decryptSecrets(encrypted, token);
    const content = Object.entries(decrypted)
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');

    fs.writeFileSync(outputPath, content, 'utf-8');

    console.log(`🔓 Decrypted ${Object.keys(decrypted).length} secrets`);
    console.log(`📄 Wrote to ${envFile}`);
    console.log('✅ Done.');
  } catch (err) {
    console.error('❌ Pull failed:', err.message);
  }
};
