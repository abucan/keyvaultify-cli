#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const boxen = require('boxen');

// Auth commands
const login = require('./commands/login');
const logout = require('./commands/logout');

// Project commands
const init = require('./commands/init');
const projectsList = require('./commands/projects/list');
const projectsShow = require('./commands/projects/show');

// Environment commands
const environmentsList = require('./commands/environments/list');
const environmentsShow = require('./commands/environments/show');

// Secret commands
const push = require('./commands/push');
const pull = require('./commands/pull');
const secretsList = require('./commands/secrets/list');
const secretsShow = require('./commands/secrets/show');
const secretsSet = require('./commands/secrets/set');
const secretsDelete = require('./commands/secrets/delete');

const program = new Command();

program
  .name('keyvault')
  .description(
    'Official Keyvaultify CLI for managing secrets across environments'
  )
  .version('1.0.0');

// Auth commands
program
  .command('login')
  .description('Authenticate with Keyvaultify')
  .action(login);

program
  .command('logout')
  .description('Log out and clear stored credentials')
  .action(logout);

// Project commands
program
  .command('init')
  .description('Link local project to Keyvaultify project')
  .action(init);

program
  .command('projects')
  .description('List all available projects')
  .action(projectsList);

program
  .command('projects:show')
  .description('Show details of a specific project')
  .argument('<project-id>', 'Project ID to show')
  .action(projectsShow);

// Environment commands
program
  .command('environments')
  .description('List environments in current or specified project')
  .option(
    '--project <id>',
    'Project ID (uses current project if not specified)'
  )
  .action((opts) => environmentsList(opts.project));

program
  .command('environments:show')
  .description('Show details of a specific environment')
  .argument('<environment-id>', 'Environment ID to show')
  .action(environmentsShow);

// Secret commands
program
  .command('push')
  .description('Push secrets from .env file to Keyvaultify')
  .option('--env <path>', 'Path to .env file', '.env')
  .action((opts) => push(opts.env));

program
  .command('pull')
  .description('Pull secrets from Keyvaultify to .env file')
  .option('--env <file>', 'Specify output file (e.g., .env.local)', '.env')
  .option('--force', 'Overwrite existing file without confirmation', false)
  .action((opts) => pull(opts));

program
  .command('secrets')
  .description('List secrets in current or specified environment')
  .option(
    '--env <id>',
    'Environment ID (uses current environment if not specified)'
  )
  .action((opts) => secretsList(opts.env));

program
  .command('secrets:show')
  .description('Show details of a specific secret')
  .argument('<key>', 'Secret key to show')
  .action(secretsShow);

program
  .command('secrets:set')
  .description('Set a secret value')
  .argument('<key>', 'Secret key')
  .argument('<value>', 'Secret value')
  .action(secretsSet);

program
  .command('secrets:delete')
  .description('Delete a secret')
  .argument('<key>', 'Secret key to delete')
  .option('--force', 'Skip confirmation prompt', false)
  .action((key, opts) => secretsDelete(key, opts.force));

// Help command
program
  .command('help')
  .description('Show help information')
  .action(() => {
    console.log(
      boxen(
        chalk.bold.white('Keyvaultify CLI') +
          '\n\n' +
          chalk.gray(
            'A powerful CLI tool for managing secrets across environments.\n\n'
          ) +
          chalk.white('Quick Start:') +
          '\n' +
          chalk.gray('1. keyvault login          # Authenticate\n') +
          chalk.gray('2. keyvault init           # Link your project\n') +
          chalk.gray('3. keyvault push           # Upload secrets\n') +
          chalk.gray('4. keyvault pull           # Download secrets\n\n') +
          chalk.white('For more help, run:') +
          '\n' +
          chalk.gray('• keyvault <command> --help'),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: 'blue',
        }
      )
    );
  });

program.parse(process.argv);
