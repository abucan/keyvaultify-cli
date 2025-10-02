// src/commands/projects/show.js
const chalk = require('chalk');
const boxen = require('boxen');
const ora = require('ora');
const { KeyvaultifyAPI } = require('../../utils/api');
const { getToken } = require('../../utils/auth');

module.exports = async function showProject(projectId) {
  try {
    if (!projectId) {
      console.error(chalk.red('❌ Project ID is required.'));
      console.log(chalk.gray('Usage: keyvault projects show <project-id>'));
      process.exit(1);
    }

    const token = getToken();
    if (!token) {
      console.error(chalk.red('❌ Not logged in. Run `keyvault login` first.'));
      process.exit(1);
    }

    const api = new KeyvaultifyAPI(token);
    const spinner = ora('Fetching project details...').start();

    // Get project details
    const projectResponse = await api.getProject(projectId);

    if (!projectResponse.success) {
      spinner.fail('Failed to fetch project');
      console.error(chalk.red('❌'), projectResponse.message);
      if (projectResponse.suggestions) {
        console.log(chalk.gray('\nSuggestions:'));
        projectResponse.suggestions.forEach((suggestion) => {
          console.log(chalk.gray(`• ${suggestion}`));
        });
      }
      process.exit(1);
    }

    const project = projectResponse.data;
    spinner.succeed('Project details fetched');

    // Get environments
    const envSpinner = ora('Fetching environments...').start();
    const environmentsResponse = await api.getProjectEnvironments(projectId);

    if (!environmentsResponse.success) {
      envSpinner.fail('Failed to fetch environments');
      console.error(chalk.red('❌'), environmentsResponse.message);
      process.exit(1);
    }

    const environments = environmentsResponse.data.environments;
    envSpinner.succeed(`Found ${environments.length} environment(s)`);

    // Display project info
    console.log(
      boxen(
        chalk.bold.white(project.name) +
          '\n\n' +
          chalk.gray('Description: ') +
          (project.description || 'No description') +
          '\n' +
          chalk.gray('ID: ') +
          project.id +
          '\n' +
          chalk.gray('Created: ') +
          (project.createdAt
            ? new Date(project.createdAt).toLocaleString()
            : 'Unknown') +
          '\n' +
          chalk.gray('Environments: ') +
          environments.length +
          '\n' +
          chalk.gray('Total Secrets: ') +
          (project.secretsCount || 0),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: 'blue',
        }
      )
    );

    // Display environments
    if (environments.length > 0) {
      console.log(chalk.bold('\n📁 Environments:'));
      environments.forEach((env, index) => {
        console.log(chalk.gray(`  ${index + 1}. `) + chalk.white(env.name));
        if (env.description) {
          console.log(chalk.gray(`     ${env.description}`));
        }
        console.log(
          chalk.gray(
            `     Created: ${
              env.createdAt
                ? new Date(env.createdAt).toLocaleDateString()
                : 'Unknown'
            }`
          )
        );
        console.log();
      });
    } else {
      console.log(chalk.yellow('\n⚠️  No environments found.'));
      console.log(
        chalk.gray(
          'Create environments at: https://keyvaultify.com/projects/' +
            projectId
        )
      );
    }

    console.log(chalk.gray('\nCommands:'));
    console.log(
      chalk.gray('• keyvault environments list --project ' + projectId)
    );
    console.log(chalk.gray('• keyvault init (to link this project)'));
    console.log(chalk.gray('• keyvault secrets list --project ' + projectId));
  } catch (error) {
    console.error(chalk.red('❌ Failed to show project:'), error.message);
    process.exit(1);
  }
};
