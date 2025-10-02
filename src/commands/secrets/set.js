// src/commands/secrets/set.js
const chalk = require('chalk');
const ora = require('ora');
const { KeyvaultifyAPI } = require('../../utils/api');
const { getToken } = require('../../utils/auth');
const { getProjectConfig } = require('../../utils/project');

module.exports = async function setSecret(key, value) {
  try {
    if (!key) {
      console.error(chalk.red('❌ Secret key is required.'));
      console.log(chalk.gray('Usage: keyvault secrets set <key> <value>'));
      process.exit(1);
    }

    if (!value) {
      console.error(chalk.red('❌ Secret value is required.'));
      console.log(chalk.gray('Usage: keyvault secrets set <key> <value>'));
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
    const spinner = ora('Setting secret...').start();

    // Prepare secret for API
    const secrets = [{ key: key.trim(), value: value.trim() }];

    const response = await api.pushSecrets(config.environmentId, secrets);

    if (!response.success) {
      spinner.fail('Failed to set secret');
      console.error(chalk.red('❌'), response.message);
      if (response.suggestions) {
        console.log(chalk.gray('\nSuggestions:'));
        response.suggestions.forEach((suggestion) => {
          console.log(chalk.gray(`• ${suggestion}`));
        });
      }
      process.exit(1);
    }

    spinner.succeed('Secret set successfully');

    // Show results
    const results = response.data.results;
    if (results) {
      if (results.created > 0) {
        console.log(
          chalk.green(
            `✅ Created secret "${key}" in ${config.projectName} (${config.environmentName})`
          )
        );
      } else if (results.updated > 0) {
        console.log(
          chalk.green(
            `✅ Updated secret "${key}" in ${config.projectName} (${config.environmentName})`
          )
        );
      }

      if (results.failed > 0) {
        console.log(chalk.yellow(`⚠️  Failed to set secret "${key}"`));
        if (results.errors && results.errors.length > 0) {
          console.log(chalk.gray('Errors:'));
          results.errors.forEach((error) => {
            console.log(chalk.gray(`  • ${error}`));
          });
        }
      }
    } else {
      console.log(
        chalk.green(
          `✅ Secret "${key}" set successfully in ${config.projectName} (${config.environmentName})`
        )
      );
    }

    console.log(chalk.gray('\nCommands:'));
    console.log(chalk.gray('• keyvault secrets show ' + key));
    console.log(chalk.gray('• keyvault secrets list'));
  } catch (error) {
    console.error(chalk.red('❌ Failed to set secret:'), error.message);
    process.exit(1);
  }
};
