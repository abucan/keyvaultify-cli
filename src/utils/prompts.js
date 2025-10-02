// src/utils/prompts.js
const inquirer = require('inquirer');
const chalk = require('chalk');

class Prompts {
  static async confirm(message, defaultValue = false) {
    const { confirmed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message: chalk.yellow(message),
        default: defaultValue,
      },
    ]);
    return confirmed;
  }

  static async input(message, defaultValue = '', validate = null) {
    const { value } = await inquirer.prompt([
      {
        type: 'input',
        name: 'value',
        message: chalk.white(message),
        default: defaultValue,
        validate: validate,
      },
    ]);
    return value;
  }

  static async password(message, validate = null) {
    const { value } = await inquirer.prompt([
      {
        type: 'password',
        name: 'value',
        message: chalk.white(message),
        mask: '*',
        validate: validate,
      },
    ]);
    return value;
  }

  static async select(message, choices, pageSize = 10) {
    const { value } = await inquirer.prompt([
      {
        type: 'list',
        name: 'value',
        message: chalk.white(message),
        choices: choices,
        pageSize: pageSize,
      },
    ]);
    return value;
  }

  static async multiSelect(message, choices, pageSize = 10) {
    const { values } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'values',
        message: chalk.white(message),
        choices: choices,
        pageSize: pageSize,
      },
    ]);
    return values;
  }

  static async selectProject(projects) {
    if (projects.length === 0) {
      throw new Error('No projects available');
    }

    const choices = projects.map((project) => ({
      name: `${project.name} (${project.environmentsCount || 0} environments, ${
        project.secretsCount || 0
      } secrets)`,
      value: project.id,
      short: project.name,
    }));

    return await this.select('Select a project:', choices);
  }

  static async selectEnvironment(environments) {
    if (environments.length === 0) {
      throw new Error('No environments available');
    }

    const choices = environments.map((env) => ({
      name: `${env.name}${env.description ? ` - ${env.description}` : ''}`,
      value: env.id,
      short: env.name,
    }));

    return await this.select('Select an environment:', choices);
  }

  static async selectSecret(secrets) {
    if (secrets.length === 0) {
      throw new Error('No secrets available');
    }

    const choices = secrets.map((secret) => ({
      name: `${secret.key} (${
        secret.value.length > 20
          ? secret.value.substring(0, 20) + '...'
          : secret.value
      })`,
      value: secret.key,
      short: secret.key,
    }));

    return await this.select('Select a secret:', choices);
  }

  static async confirmOverwrite(filename) {
    return await this.confirm(
      `⚠️  ${filename} already exists. Overwrite?`,
      false
    );
  }

  static async confirmDelete(resource, name) {
    return await this.confirm(
      `⚠️  Are you sure you want to delete ${resource} "${name}"?`,
      false
    );
  }

  static async inputToken() {
    return await this.input('🔑 Paste your API token:', '', (input) => {
      if (!input.trim()) {
        return 'Token is required';
      }
      if (!input.startsWith('kvf_')) {
        return 'Token must start with "kvf_"';
      }
      return true;
    });
  }

  static async inputSecretKey() {
    return await this.input('Enter secret key:', '', (input) => {
      if (!input.trim()) {
        return 'Secret key is required';
      }
      if (!/^[A-Z0-9_]+$/.test(input)) {
        return 'Secret key must contain only uppercase letters, numbers, and underscores';
      }
      return true;
    });
  }

  static async inputSecretValue() {
    return await this.input('Enter secret value:', '', (input) => {
      if (!input.trim()) {
        return 'Secret value is required';
      }
      return true;
    });
  }

  static async inputProjectId() {
    return await this.input('Enter project ID:', '', (input) => {
      if (!input.trim()) {
        return 'Project ID is required';
      }
      return true;
    });
  }

  static async inputEnvironmentId() {
    return await this.input('Enter environment ID:', '', (input) => {
      if (!input.trim()) {
        return 'Environment ID is required';
      }
      return true;
    });
  }

  // Utility methods for common patterns
  static async retry(fn, maxAttempts = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxAttempts) {
          throw error;
        }

        const retry = await this.confirm(
          `Attempt ${attempt} failed: ${error.message}. Retry?`,
          true
        );

        if (!retry) {
          throw error;
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  static async withSpinner(message, fn) {
    const ora = require('ora');
    const spinner = ora(message).start();

    try {
      const result = await fn();
      spinner.succeed();
      return result;
    } catch (error) {
      spinner.fail();
      throw error;
    }
  }
}

module.exports = Prompts;
