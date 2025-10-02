// src/commands/secrets/delete.js
const chalk = require('chalk');
const ora = require('ora');
const readline = require('readline');
const { KeyvaultifyAPI } = require('../../utils/api');
const { getToken } = require('../../utils/auth');
const { getProjectConfig } = require('../../utils/project');

module.exports = async function deleteSecret(key, force = false) {
  try {
    if (!key) {
      console.error(chalk.red('❌ Secret key is required.'));
      console.log(chalk.gray('Usage: keyvault secrets delete <key> [--force]'));
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

    // Confirm deletion unless --force is used
    if (!force) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      await new Promise((resolve) => {
        rl.question(
          chalk.yellow(
            `⚠️  Are you sure you want to delete secret "${key}"? (y/N): `
          ),
          (answer) => {
            rl.close();
            if (answer.toLowerCase() !== 'y') {
              console.log(chalk.red('❌ Deletion cancelled.'));
              process.exit(0);
            }
            resolve();
          }
        );
      });
    }

    const api = new KeyvaultifyAPI(token);
    const spinner = ora('Deleting secret...').start();

    const response = await api.deleteSecret(config.environmentId, key);

    if (!response.success) {
      spinner.fail('Failed to delete secret');
      console.error(chalk.red('❌'), response.message);
      if (response.suggestions) {
        console.log(chalk.gray('\nSuggestions:'));
        response.suggestions.forEach((suggestion) => {
          console.log(chalk.gray(`• ${suggestion}`));
        });
      }
      process.exit(1);
    }

    spinner.succeed('Secret deleted successfully');

    console.log(
      chalk.green(
        `✅ Secret "${key}" deleted from ${config.projectName} (${config.environmentName})`
      )
    );

    console.log(chalk.gray('\nCommands:'));
    console.log(chalk.gray('• keyvault secrets list'));
    console.log(chalk.gray('• keyvault secrets set <key> <value>'));
  } catch (error) {
    console.error(chalk.red('❌ Failed to delete secret:'), error.message);
    process.exit(1);
  }
};
