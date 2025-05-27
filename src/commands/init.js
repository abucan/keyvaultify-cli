const readline = require('readline');
const fs = require('fs');
const path = require('path');

module.exports = function init() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('🆔 Enter your Project ID: ', (projectId) => {
    rl.question('🌱 Environment (default: dev): ', (environment) => {
      const configDir = path.join(process.cwd(), '.keyvaultify');
      if (!fs.existsSync(configDir))
        fs.mkdirSync(configDir, { recursive: true });

      fs.writeFileSync(
        path.join(configDir, 'project.json'),
        JSON.stringify(
          { projectId, environment: environment || 'dev' },
          null,
          2
        )
      );

      console.log('✅ Project initialized and linked to KeyVaultify.');
      rl.close();
    });
  });
};
