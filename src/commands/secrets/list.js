// src/commands/secrets/list.js
const { table } = require('table');
const chalk = require('chalk');
const ora = require('ora');
const { KeyvaultifyAPI } = require('../../utils/api');
const { getToken } = require('../../utils/auth');
const { getProjectConfig } = require('../../utils/project');

module.exports = async function listSecrets(environmentId = null) {
  try {
    const token = getToken();
    if (!token) {
      console.error(chalk.red('❌ Not logged in. Run `keyvault login` first.'));
      process.exit(1);
    }

    // If no environment ID provided, try to get from current project config
    if (!environmentId) {
      const config = getProjectConfig();
      if (config) {
        environmentId = config.environmentId;
        console.log(
          chalk.gray(`Using current environment: ${config.environmentName}`)
        );
      } else {
        console.error(
          chalk.red(
            '❌ No environment specified and no project linked to this directory.'
          )
        );
        console.log(
          chalk.gray('Use: keyvault secrets list --env <environment-id>')
        );
        console.log(chalk.gray('Or run: keyvault init'));
        process.exit(1);
      }
    }

    const api = new KeyvaultifyAPI(token);
    const spinner = ora('Fetching secrets...').start();

    const response = await api.getSecrets(environmentId);

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
    spinner.succeed(`Found ${secrets.length} secret(s)`);

    if (secrets.length === 0) {
      console.log(chalk.yellow('⚠️  No secrets found in this environment.'));
      console.log(chalk.gray('Use `keyvault push` to upload secrets.'));
      return;
    }

    // Create table
    const tableData = [
      [chalk.bold('Key'), chalk.bold('Value'), chalk.bold('Created')],
    ];

    secrets.forEach((secret) => {
      const maskedValue =
        secret.value.length > 30
          ? secret.value.substring(0, 30) + '...'
          : secret.value;

      const createdAt = secret.createdAt
        ? new Date(secret.createdAt).toLocaleDateString()
        : 'Unknown';

      tableData.push([
        chalk.white(secret.key),
        chalk.gray(maskedValue),
        createdAt,
      ]);
    });

    console.log(
      '\n' +
        table(tableData, {
          border: {
            topBody: '─',
            topJoin: '┬',
            topLeft: '┌',
            topRight: '┐',
            bottomBody: '─',
            bottomJoin: '┴',
            bottomLeft: '└',
            bottomRight: '┘',
            bodyLeft: '│',
            bodyRight: '│',
            bodyJoin: '│',
            joinBody: '─',
            joinLeft: '├',
            joinRight: '┤',
            joinJoin: '┼',
          },
          columnDefault: {
            paddingLeft: 1,
            paddingRight: 1,
          },
          drawHorizontalLine: (index, size) => {
            return index === 0 || index === 1 || index === size;
          },
        })
    );

    console.log(
      chalk.gray(
        `\nUse \`keyvault secrets show <key>\` to see a specific secret`
      )
    );
    console.log(
      chalk.gray(`Use \`keyvault secrets set <key> <value>\` to set a secret`)
    );
    console.log(
      chalk.gray(`Use \`keyvault secrets delete <key>\` to delete a secret`)
    );
  } catch (error) {
    console.error(chalk.red('❌ Failed to list secrets:'), error.message);
    process.exit(1);
  }
};
