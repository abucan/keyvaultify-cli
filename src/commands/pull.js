const fs = require('fs');
const path = require('path');
const readline = require('readline');
const ora = require('ora');
const chalk = require('chalk');
const { KeyvaultifyAPI } = require('../utils/api');
const { getToken } = require('../utils/auth');
const { getProjectConfig } = require('../utils/project');

module.exports = async function pull(opts = {}) {
  try {
    const token = getToken();
    if (!token) {
      console.error(chalk.red('❌ Not logged in. Run `keyvault login` first.'));
      process.exit(1);
    }

    const config = getProjectConfig();
    if (!config) {
      console.error(
        chalk.red('❌ Project not initialized. Run `keyvault init` first.')
      );
      process.exit(1);
    }

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
          chalk.yellow(`⚠️  ${envFile} already exists. Overwrite? (y/N): `),
          (answer) => {
            rl.close();
            if (answer.toLowerCase() !== 'y') {
              console.log(chalk.red('❌ Aborted.'));
              process.exit(0);
            }
            resolve();
          }
        );
      });
    }

    // Fetch secrets from API
    const api = new KeyvaultifyAPI(token);
    const spinner = ora('Fetching secrets...').start();

    const response = await api.getSecrets(config.environmentId);

    if (!response.success) {
      spinner.fail('Failed to fetch secrets');
      console.error(chalk.red('❌'), response.message);
      if (response.suggestions) {
        console.log(chalk.gray('\nSuggestions:'));
        response.suggestions.forEach((suggestion) => {
          console.log(chalk.gray(`• ${suggestion}`));
        });
      }
      process.exit(1);
    }

    const secrets = response.data.secrets;

    if (!secrets || secrets.length === 0) {
      spinner.fail('No secrets found');
      console.log(chalk.yellow('⚠️  No secrets found in this environment.'));
      console.log(chalk.gray('Use `keyvault push` to upload secrets first.'));
      return;
    }

    spinner.succeed(
      `Fetched ${secrets.length} secrets from ${config.projectName} (${config.environmentName})`
    );

    // Convert to .env format
    const content = secrets
      .map((secret) => `${secret.key}=${secret.value}`)
      .join('\n');

    // Write to file
    const writeSpinner = ora('Writing to file...').start();
    fs.writeFileSync(outputPath, content, 'utf-8');
    writeSpinner.succeed(`Wrote to ${envFile}`);

    console.log(
      chalk.green(`✅ Successfully pulled ${secrets.length} secrets`)
    );
    console.log(chalk.gray(`📄 Saved to: ${outputPath}`));
  } catch (err) {
    console.error(chalk.red('❌ Pull failed:'), err.message);
    process.exit(1);
  }
};
