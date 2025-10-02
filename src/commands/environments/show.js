// src/commands/environments/show.js
const chalk = require('chalk');
const boxen = require('boxen');
const ora = require('ora');
const { KeyvaultifyAPI } = require('../../utils/api');
const { getToken } = require('../../utils/auth');

module.exports = async function showEnvironment(environmentId) {
  try {
    if (!environmentId) {
      console.error(chalk.red('❌ Environment ID is required.'));
      console.log(
        chalk.gray('Usage: keyvault environments show <environment-id>')
      );
      process.exit(1);
    }

    const token = getToken();
    if (!token) {
      console.error(chalk.red('❌ Not logged in. Run `keyvault login` first.'));
      process.exit(1);
    }

    const api = new KeyvaultifyAPI(token);
    const spinner = ora('Fetching environment details...').start();

    // Get environment secrets to get environment info
    const response = await api.getSecrets(environmentId);

    if (!response.success) {
      spinner.fail('Failed to fetch environment');
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
    spinner.succeed('Environment details fetched');

    // Display environment info
    console.log(
      boxen(
        chalk.bold.white('Environment Details') +
          '\n\n' +
          chalk.gray('ID: ') +
          environmentId +
          '\n' +
          chalk.gray('Secrets: ') +
          (secrets ? secrets.length : 0) +
          '\n' +
          chalk.gray('Status: ') +
          chalk.green('Active'),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: 'green',
        }
      )
    );

    // Display secrets if any
    if (secrets && secrets.length > 0) {
      console.log(chalk.bold('\n🔐 Secrets:'));
      secrets.forEach((secret, index) => {
        const maskedValue =
          secret.value.length > 20
            ? secret.value.substring(0, 20) + '...'
            : secret.value;

        console.log(chalk.gray(`  ${index + 1}. `) + chalk.white(secret.key));
        console.log(chalk.gray(`     Value: ${maskedValue}`));
        console.log();
      });
    } else {
      console.log(chalk.yellow('\n⚠️  No secrets found in this environment.'));
      console.log(chalk.gray('Use `keyvault push` to upload secrets.'));
    }

    console.log(chalk.gray('\nCommands:'));
    console.log(chalk.gray('• keyvault secrets list --env ' + environmentId));
    console.log(chalk.gray('• keyvault push (to upload secrets)'));
    console.log(chalk.gray('• keyvault pull (to download secrets)'));
  } catch (error) {
    console.error(chalk.red('❌ Failed to show environment:'), error.message);
    process.exit(1);
  }
};
