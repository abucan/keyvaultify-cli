#!/usr/bin/env node

const { Command } = require('commander');
const login = require('./commands/login');
const init = require('./commands/init');
const push = require('./commands/push');
const pull = require('./commands/pull');

const program = new Command();

program.name('keyvault').description('KeyVaultify CLI for managing secrets');

program
  .command('login')
  .description('Authenticate with KeyVaultify')
  .action(login);

program
  .command('init')
  .description('Link local project to KeyVaultify project')
  .action(init);

program
  .command('push')
  .description('Push encrypted secrets to KeyVaultify')
  .option('--env <path>', 'Path to .env file', '.env')
  .action((opts) => push(opts.env));

program
  .command('pull')
  .description('Pull and decrypt secrets from KeyVaultify')
  .option('--env <file>', 'Specify output file (e.g., .env.local)', '.env')
  .option('--force', 'Overwrite existing file without confirmation', false)
  .action((opts) => pull(opts));

program.parse(process.argv);
