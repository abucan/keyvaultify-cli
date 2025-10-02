// src/commands/projects/list.js
const { table } = require('table');
const chalk = require('chalk');
const ora = require('ora');
const { KeyvaultifyAPI } = require('../../utils/api');
const { getToken } = require('../../utils/auth');

module.exports = async function listProjects() {
  try {
    const token = getToken();
    if (!token) {
      console.error(chalk.red('❌ Not logged in. Run `keyvault login` first.'));
      process.exit(1);
    }

    const api = new KeyvaultifyAPI(token);
    const spinner = ora('Fetching projects...').start();

    const response = await api.getProjects();

    if (!response.success) {
      spinner.fail('Failed to fetch projects');
      console.error(chalk.red('❌'), response.message);
      if (response.suggestions) {
        console.log(chalk.gray('\nSuggestions:'));
        response.suggestions.forEach((suggestion) => {
          console.log(chalk.gray(`• ${suggestion}`));
        });
      }
      process.exit(1);
    }

    const projects = response.data.projects;
    spinner.succeed(`Found ${projects.length} project(s)`);

    if (projects.length === 0) {
      console.log(chalk.yellow('⚠️  No projects found.'));
      console.log(
        chalk.gray('Create a project at: https://keyvaultify.com/projects')
      );
      return;
    }

    // Create table
    const tableData = [
      [
        chalk.bold('Name'),
        chalk.bold('Environments'),
        chalk.bold('Secrets'),
        chalk.bold('Created'),
        chalk.bold('ID'),
      ],
    ];

    projects.forEach((project) => {
      const createdAt = project.createdAt
        ? new Date(project.createdAt).toLocaleDateString()
        : 'Unknown';

      tableData.push([
        project.name,
        project.environmentsCount || 0,
        project.secretsCount || 0,
        createdAt,
        chalk.gray(project.id.substring(0, 8) + '...'),
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
      chalk.gray(`\nUse \`keyvault projects show <id>\` to see project details`)
    );
    console.log(
      chalk.gray(`Use \`keyvault init\` to link a project to this directory`)
    );
  } catch (error) {
    console.error(chalk.red('❌ Failed to list projects:'), error.message);
    process.exit(1);
  }
};
