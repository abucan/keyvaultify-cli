const fs = require('fs');
const path = require('path');

const LOCAL_PROJECT_PATH = path.join(
  process.cwd(),
  '.keyvaultify',
  'project.json'
);

function getProjectConfig() {
  try {
    if (!fs.existsSync(LOCAL_PROJECT_PATH)) return null;

    const raw = fs.readFileSync(LOCAL_PROJECT_PATH, 'utf-8');
    const parsed = JSON.parse(raw);

    if (!parsed.projectId || !parsed.environment) {
      console.warn('⚠️ project.json is missing required fields.');
      return null;
    }

    return parsed;
  } catch (err) {
    console.error('❌ Error reading project config:', err.message);
    return null;
  }
}

module.exports = { getProjectConfig };
