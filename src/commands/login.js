const readline = require('readline');
const ora = require('ora');
const chalk = require('chalk');
const boxen = require('boxen');
const { validateToken, saveUserInfo } = require('../utils/auth');
const { KeyvaultifyAPI } = require('../utils/api');

module.exports = async function login() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const token = await new Promise((resolve) => {
      rl.question('🔑 Paste your API token: ', (input) => {
        rl.close();
        resolve(input.trim());
      });
    });

    if (!token) {
      console.error(chalk.red('❌ No token provided.'));
      process.exit(1);
    }

    // Validate token format
    if (!token.startsWith('kvf_')) {
      console.error(
        chalk.red('❌ Invalid token format. Token should start with "kvf_".')
      );
      process.exit(1);
    }

    const spinner = ora('Validating token...').start();

    try {
      // Validate token against API
      const isValid = await validateToken(token);

      if (!isValid) {
        spinner.fail('Token validation failed');
        console.error(
          chalk.red('❌ Invalid or expired token. Please check your API token.')
        );
        console.log(
          chalk.gray(
            'Get a new token from: https://keyvaultify.com/settings/developer'
          )
        );
        process.exit(1);
      }

      spinner.text = 'Fetching user information...';

      // Get user info
      const api = new KeyvaultifyAPI(token);
      const userInfo = await api.getUserInfo();

      if (userInfo) {
        await saveUserInfo(token, userInfo);
        spinner.succeed('Authentication successful');

        console.log(
          boxen(
            chalk.green(`✅ Welcome to Keyvaultify!\n\n`) +
              chalk.white(
                `Organization: ${userInfo.organizationName || 'Unknown'}\n`
              ) +
              chalk.gray(`Token: ${token.substring(0, 12)}...`),
            {
              padding: 1,
              margin: 1,
              borderStyle: 'round',
              borderColor: 'green',
            }
          )
        );

        console.log(chalk.gray('\nNext steps:'));
        console.log(chalk.gray('• Run `keyvault init` to link your project'));
        console.log(
          chalk.gray('• Run `keyvault projects` to see available projects')
        );
      } else {
        await saveUserInfo(token, null);
        spinner.succeed('Token validated and saved');
        console.log(chalk.green('✅ Token saved successfully!'));
      }
    } catch (error) {
      spinner.fail('Authentication failed');
      console.error(chalk.red('❌ Failed to authenticate:'), error.message);
      console.error(chalk.gray('Debug info:'), error);
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red('❌ Login failed:'), error.message);
    process.exit(1);
  }
};
