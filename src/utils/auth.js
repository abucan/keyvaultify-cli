const fs = require('fs');
const os = require('os');
const path = require('path');
const { KeyvaultifyAPI } = require('./api');

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

function getUserInfo() {
  try {
    if (!fs.existsSync(CONFIG_PATH)) return null;

    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    const parsed = JSON.parse(raw);

    return parsed.userInfo || null;
  } catch (err) {
    return null;
  }
}

async function validateToken(token = null) {
  try {
    const api = new KeyvaultifyAPI(token);
    return await api.validateToken();
  } catch (error) {
    return false;
  }
}

async function saveUserInfo(token, userInfo) {
  try {
    const configDir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const config = {
      token,
      userInfo,
      lastUpdated: new Date().toISOString(),
    };

    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    return true;
  } catch (err) {
    console.error('❌ Error saving user info:', err.message);
    return false;
  }
}

function clearAuth() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      fs.unlinkSync(CONFIG_PATH);
    }
    return true;
  } catch (err) {
    console.error('❌ Error clearing auth:', err.message);
    return false;
  }
}

module.exports = {
  getToken,
  getUserInfo,
  validateToken,
  saveUserInfo,
  clearAuth,
};
