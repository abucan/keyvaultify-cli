const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');
const { encryptSecrets } = require('../utils/encrypt');
const { getProjectConfig } = require('../utils/project');
const { getToken } = require('../utils/auth');

module.exports = async function push(envPath = '.env') {
  try {
    const fullPath = path.resolve(process.cwd(), envPath);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ .env file not found at: ${fullPath}`);
      process.exit(1);
    }

    // 1. Read and parse .env
    const envData = dotenv.parse(fs.readFileSync(fullPath));
    const secretsCount = Object.keys(envData).length;

    if (secretsCount === 0) {
      console.warn('⚠️ No secrets found in .env file.');
      return;
    }

    console.log(`📦 Found ${secretsCount} secrets in ${envPath}`);

    // 2. Load config
    const token = getToken();
    if (!token) throw new Error('Not logged in. Run `keyvault login`.');

    const config = getProjectConfig();
    if (!config) throw new Error('Not initialized. Run `keyvault init`.');

    // 3. Encrypt
    const passphrase = token; // 🔐 for now, use token as key
    const encryptedSecrets = encryptSecrets(envData, passphrase);
    console.log('🔐 Encrypted secrets');

    // 4. Send POST request
    const res = await axios.post(
      'http://localhost:3000/api/vault',
      {
        projectId: config.projectId,
        environment: config.environment,
        encryptedSecrets,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (res.status === 200) {
      console.log(
        `☁️ Secrets pushed to ${config.projectId} (${config.environment})`
      );
      console.log('✅ Done.');
    } else {
      console.error(`❌ Failed with status ${res.status}`);
    }
  } catch (err) {
    console.error('❌ Push failed:', err.message);
  }
};
