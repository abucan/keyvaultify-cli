// src/commands/secrets/show.js
const chalk = require('chalk');
const boxen = require('boxen');
const ora = require('ora');
const { KeyvaultifyAPI } = require('../../utils/api');
const { getToken } = require('../../utils/auth');
const { getProjectConfig } = require('../../utils/project');

module.exports = async function showSecret(key) {
  try {
    if (!key) {
      console.error(chalk.red('❌ Secret key is required.'));
      console.log(chalk.gray('Usage: keyvault secrets show <key>'));
      process.exit(1);
    }

    const token = getToken();
    if (!token) {
      console.error(chalk.red('❌ Not logged in. Run `keyvault login` first.'));
      process.exit(1);
    }

    // Get environment ID from current project config
    const config = getProjectConfig();
    if (!config) {
      console.error(chalk.red('❌ No project linked to this directory.'));
      console.log(chalk.gray('Run `keyvault init` first.'));
      process.exit(1);
    }

    const api = new KeyvaultifyAPI(token);
    const spinner = ora('Fetching secret...').start();

    // Get all secrets and find the one with the matching key
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
    const secret = secrets.find((s) => s.key === key);

    if (!secret) {
      spinner.fail('Secret not found');
      console.error(
        chalk.red(`❌ Secret "${key}" not found in this environment.`)
      );
      console.log(
        chalk.gray('Use `keyvault secrets list` to see available secrets.')
      );
      process.exit(1);
    }

    spinner.succeed('Secret found');

    // Display secret info
    console.log(
      boxen(
        chalk.bold.white('Secret Details') +
          '\n\n' +
          chalk.gray('Key: ') +
          chalk.white(secret.key) +
          '\n' +
          chalk.gray('Value: ') +
          chalk.green(secret.value) +
          '\n' +
          chalk.gray('Environment: ') +
          config.environmentName +
          '\n' +
          chalk.gray('Project: ') +
          config.projectName +
          '\n' +
          chalk.gray('Created: ') +
          (secret.createdAt
            ? new Date(secret.createdAt).toLocaleString()
            : 'Unknown'),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: 'green',
        }
      )
    );

    console.log(chalk.gray('\nCommands:'));
    console.log(
      chalk.gray('• keyvault secrets set ' + secret.key + ' <new-value>')
    );
    console.log(chalk.gray('• keyvault secrets delete ' + secret.key));
    console.log(chalk.gray('• keyvault secrets list'));
  } catch (error) {
    console.error(chalk.red('❌ Failed to show secret:'), error.message);
    process.exit(1);
  }
};
