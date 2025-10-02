const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const boxen = require('boxen');
const { KeyvaultifyAPI } = require('../utils/api');
const { getToken } = require('../utils/auth');

module.exports = async function init() {
  try {
    const token = getToken();
    if (!token) {
      console.error(chalk.red('❌ Not logged in. Run `keyvault login` first.'));
      process.exit(1);
    }

    const api = new KeyvaultifyAPI(token);
    const spinner = ora('Fetching your projects...').start();

    // Get projects
    const projectsResponse = await api.getProjects();

    if (!projectsResponse.success) {
      spinner.fail('Failed to fetch projects');
      console.error(chalk.red('❌'), projectsResponse.message);
      if (projectsResponse.suggestions) {
        console.log(chalk.gray('\nSuggestions:'));
        projectsResponse.suggestions.forEach((suggestion) => {
          console.log(chalk.gray(`• ${suggestion}`));
        });
      }
      process.exit(1);
    }

    const projects = projectsResponse.data.projects;

    if (projects.length === 0) {
      spinner.fail('No projects found');
      console.log(chalk.yellow("⚠️  You don't have access to any projects."));
      console.log(
        chalk.gray('Create a project at: https://keyvaultify.com/projects')
      );
      process.exit(1);
    }

    spinner.succeed(`Found ${projects.length} project(s)`);

    // Interactive project selection
    const projectChoices = projects.map((project) => ({
      name: `${project.name} (${project.environmentsCount || 0} environments, ${
        project.secretsCount || 0
      } secrets)`,
      value: project.id,
      short: project.name,
    }));

    const { projectId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'projectId',
        message: 'Select a project:',
        choices: projectChoices,
        pageSize: 10,
      },
    ]);

    const selectedProject = projects.find((p) => p.id === projectId);

    // Get environments for selected project
    const envSpinner = ora('Fetching environments...').start();
    const environmentsResponse = await api.getProjectEnvironments(projectId);

    if (!environmentsResponse.success) {
      envSpinner.fail('Failed to fetch environments');
      console.error(chalk.red('❌'), environmentsResponse.message);
      process.exit(1);
    }

    const environments = environmentsResponse.data.environments;
    envSpinner.succeed(`Found ${environments.length} environment(s)`);

    if (environments.length === 0) {
      console.log(chalk.yellow('⚠️  This project has no environments.'));
      console.log(
        chalk.gray(
          'Create environments at: https://keyvaultify.com/projects/' +
            projectId
        )
      );
      process.exit(1);
    }

    // Interactive environment selection
    const environmentChoices = environments.map((env) => ({
      name: `${env.name}${env.description ? ` - ${env.description}` : ''}`,
      value: env.id,
      short: env.name,
    }));

    const { environmentId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'environmentId',
        message: 'Select an environment:',
        choices: environmentChoices,
        pageSize: 10,
      },
    ]);

    const selectedEnvironment = environments.find(
      (e) => e.id === environmentId
    );

    // Save project configuration
    const configDir = path.join(process.cwd(), '.keyvaultify');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const projectConfig = {
      projectId,
      projectName: selectedProject.name,
      environmentId,
      environmentName: selectedEnvironment.name,
      lastUpdated: new Date().toISOString(),
    };

    fs.writeFileSync(
      path.join(configDir, 'project.json'),
      JSON.stringify(projectConfig, null, 2)
    );

    console.log(
      boxen(
        chalk.green(`✅ Project initialized successfully!\n\n`) +
          chalk.white(`Project: ${selectedProject.name}\n`) +
          chalk.white(`Environment: ${selectedEnvironment.name}\n`) +
          chalk.gray(`Config saved to: .keyvaultify/project.json`),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: 'green',
        }
      )
    );

    console.log(chalk.gray('\nNext steps:'));
    console.log(chalk.gray('• Run `keyvault push` to upload your .env file'));
    console.log(chalk.gray('• Run `keyvault pull` to download secrets'));
    console.log(
      chalk.gray('• Run `keyvault secrets` to manage individual secrets')
    );
  } catch (error) {
    console.error(chalk.red('❌ Initialization failed:'), error.message);
    process.exit(1);
  }
};
