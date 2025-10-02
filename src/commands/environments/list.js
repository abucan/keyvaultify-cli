// src/commands/environments/list.js
const { table } = require('table');
const chalk = require('chalk');
const ora = require('ora');
const { KeyvaultifyAPI } = require('../../utils/api');
const { getToken } = require('../../utils/auth');
const { getProjectConfig } = require('../../utils/project');

module.exports = async function listEnvironments(projectId = null) {
  try {
    const token = getToken();
    if (!token) {
      console.error(chalk.red('❌ Not logged in. Run `keyvault login` first.'));
      process.exit(1);
    }

    // If no project ID provided, try to get from current project config
    if (!projectId) {
      const config = getProjectConfig();
      if (config) {
        projectId = config.projectId;
        console.log(chalk.gray(`Using current project: ${config.projectName}`));
      } else {
        console.error(
          chalk.red(
            '❌ No project specified and no project linked to this directory.'
          )
        );
        console.log(
          chalk.gray('Use: keyvault environments list --project <project-id>')
        );
        console.log(chalk.gray('Or run: keyvault init'));
        process.exit(1);
      }
    }

    const api = new KeyvaultifyAPI(token);
    const spinner = ora('Fetching environments...').start();

    const response = await api.getProjectEnvironments(projectId);

    if (!response.success) {
      spinner.fail('Failed to fetch environments');
      console.error(chalk.red('❌'), response.message);
      if (response.suggestions) {
        console.log(chalk.gray('\nSuggestions:'));
        response.suggestions.forEach((suggestion) => {
          console.log(chalk.gray(`• ${suggestion}`));
        });
      }
      process.exit(1);
    }

    const environments = response.data.environments;
    spinner.succeed(`Found ${environments.length} environment(s)`);

    if (environments.length === 0) {
      console.log(chalk.yellow('⚠️  No environments found.'));
      console.log(
        chalk.gray(
          'Create environments at: https://keyvaultify.com/projects/' +
            projectId
        )
      );
      return;
    }

    // Create table
    const tableData = [
      [
        chalk.bold('Name'),
        chalk.bold('Description'),
        chalk.bold('Created'),
        chalk.bold('ID'),
      ],
    ];

    environments.forEach((env) => {
      const createdAt = env.createdAt
        ? new Date(env.createdAt).toLocaleDateString()
        : 'Unknown';

      tableData.push([
        env.name,
        env.description || chalk.gray('No description'),
        createdAt,
        chalk.gray(env.id.substring(0, 8) + '...'),
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
        `\nUse \`keyvault environments show <id>\` to see environment details`
      )
    );
    console.log(
      chalk.gray(
        `Use \`keyvault secrets list --env <id>\` to see secrets in an environment`
      )
    );
  } catch (error) {
    console.error(chalk.red('❌ Failed to list environments:'), error.message);
    process.exit(1);
  }
};
