// src/commands/logout.js
const chalk = require('chalk');
const boxen = require('boxen');
const { clearAuth } = require('../utils/auth');

module.exports = async function logout() {
  try {
    const success = clearAuth();

    if (success) {
      console.log(
        boxen(
          chalk.green('✅ Logged out successfully!\n\n') +
            chalk.gray('Your API token has been removed from this machine.'),
          {
            padding: 1,
            margin: 1,
            borderStyle: 'round',
            borderColor: 'green',
          }
        )
      );

      console.log(chalk.gray('\nTo log back in, run:'));
      console.log(chalk.gray('• keyvault login'));
    } else {
      console.error(
        chalk.red('❌ Failed to logout. You may not have been logged in.')
      );
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red('❌ Logout failed:'), error.message);
    process.exit(1);
  }
};
