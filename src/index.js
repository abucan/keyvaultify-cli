#!/usr/bin/env node

const { Command } = require('commander');
const login = require('./commands/login');
const init = require('./commands/init');

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

program.parse(process.argv);
