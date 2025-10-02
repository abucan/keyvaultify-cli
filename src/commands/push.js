const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const ora = require('ora');
const chalk = require('chalk');
const { KeyvaultifyAPI } = require('../utils/api');
const { getProjectConfig } = require('../utils/project');
const { getToken } = require('../utils/auth');

module.exports = async function push(envPath = '.env') {
  try {
    const fullPath = path.resolve(process.cwd(), envPath);
    if (!fs.existsSync(fullPath)) {
      console.error(chalk.red(`❌ .env file not found at: ${fullPath}`));
      process.exit(1);
    }

    // 1. Read and parse .env
    const spinner = ora('Reading .env file...').start();
    const envData = dotenv.parse(fs.readFileSync(fullPath));
    const secretsCount = Object.keys(envData).length;

    if (secretsCount === 0) {
      spinner.fail('No secrets found');
      console.warn(chalk.yellow('⚠️ No secrets found in .env file.'));
      return;
    }

    spinner.succeed(`Found ${secretsCount} secrets in ${envPath}`);

    // 2. Load config
    const token = getToken();
    if (!token) {
      console.error(chalk.red('❌ Not logged in. Run `keyvault login` first.'));
      process.exit(1);
    }

    const config = getProjectConfig();
    if (!config) {
      console.error(
        chalk.red('❌ Project not initialized. Run `keyvault init` first.')
      );
      process.exit(1);
    }

    // 3. Prepare secrets for API
    const secrets = Object.entries(envData).map(([key, value]) => ({
      key: key.trim(),
      value: value.trim(),
    }));

    // 4. Send to API
    const api = new KeyvaultifyAPI(token);
    const pushSpinner = ora('Uploading secrets...').start();

    const response = await api.pushSecrets(config.environmentId, secrets);

    if (!response.success) {
      pushSpinner.fail('Upload failed');
      console.error(chalk.red('❌'), response.message);
      if (response.suggestions) {
        console.log(chalk.gray('\nSuggestions:'));
        response.suggestions.forEach((suggestion) => {
          console.log(chalk.gray(`• ${suggestion}`));
        });
      }
      process.exit(1);
    }

    pushSpinner.succeed('Secrets uploaded successfully');

    // 5. Show results
    const results = response.data.results;
    if (results) {
      console.log(
        chalk.green(
          `✅ Successfully pushed ${secretsCount} secrets to ${config.projectName} (${config.environmentName})`
        )
      );

      if (results.created > 0) {
        console.log(chalk.gray(`• Created: ${results.created} new secrets`));
      }
      if (results.updated > 0) {
        console.log(
          chalk.gray(`• Updated: ${results.updated} existing secrets`)
        );
      }
      if (results.failed > 0) {
        console.log(chalk.yellow(`• Failed: ${results.failed} secrets`));
        if (results.errors && results.errors.length > 0) {
          console.log(chalk.gray('Errors:'));
          results.errors.forEach((error) => {
            console.log(chalk.gray(`  • ${error}`));
          });
        }
      }
    } else {
      console.log(
        chalk.green(
          `✅ Successfully pushed ${secretsCount} secrets to ${config.projectName} (${config.environmentName})`
        )
      );
    }
  } catch (err) {
    console.error(chalk.red('❌ Push failed:'), err.message);
    process.exit(1);
  }
};
