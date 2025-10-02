// src/utils/logger.js
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const os = require('os');

class Logger {
  constructor() {
    this.logLevel = process.env.KEYVAULTIFY_LOG_LEVEL || 'info';
    this.logFile =
      process.env.KEYVAULTIFY_LOG_FILE ||
      path.join(os.homedir(), '.keyvaultify', 'debug.log');
    this.debugMode =
      process.env.KEYVAULTIFY_DEBUG === 'true' || this.logLevel === 'debug';
  }

  _writeLog(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data,
    };

    // Write to file if debug mode
    if (this.debugMode) {
      try {
        const logDir = path.dirname(this.logFile);
        if (!fs.existsSync(logDir)) {
          fs.mkdirSync(logDir, { recursive: true });
        }
        fs.appendFileSync(this.logFile, JSON.stringify(logEntry) + '\n');
      } catch (error) {
        // Silently fail if we can't write to log file
      }
    }
  }

  debug(message, data = null) {
    this._writeLog('debug', message, data);
    if (this.debugMode) {
      console.log(chalk.gray(`[DEBUG] ${message}`));
      if (data) {
        console.log(chalk.gray(JSON.stringify(data, null, 2)));
      }
    }
  }

  info(message) {
    this._writeLog('info', message);
    console.log(chalk.blue(`ℹ️  ${message}`));
  }

  success(message) {
    this._writeLog('success', message);
    console.log(chalk.green(`✅ ${message}`));
  }

  warn(message) {
    this._writeLog('warn', message);
    console.log(chalk.yellow(`⚠️  ${message}`));
  }

  error(message, error = null) {
    this._writeLog('error', message, error);
    console.error(chalk.red(`❌ ${message}`));
    if (error && this.debugMode) {
      console.error(chalk.red(error.stack || error));
    }
  }

  // Progress logging
  start(message) {
    this._writeLog('info', `Starting: ${message}`);
    return {
      succeed: (msg) => {
        this._writeLog('success', msg || message);
        console.log(chalk.green(`✅ ${msg || message}`));
      },
      fail: (msg) => {
        this._writeLog('error', msg || message);
        console.error(chalk.red(`❌ ${msg || message}`));
      },
      info: (msg) => {
        this._writeLog('info', msg);
        console.log(chalk.blue(`ℹ️  ${msg}`));
      },
    };
  }

  // Table logging
  table(data, options = {}) {
    this._writeLog('info', 'Displaying table', { rowCount: data.length });
    // This would integrate with the table library
    // For now, just log the data
    if (this.debugMode) {
      console.log(chalk.gray('Table data:'), data);
    }
  }

  // Box logging
  box(content, options = {}) {
    this._writeLog('info', 'Displaying box', {
      content: content.substring(0, 100) + '...',
    });
    // This would integrate with the boxen library
    // For now, just log the content
    if (this.debugMode) {
      console.log(chalk.gray('Box content:'), content);
    }
  }

  // Clear log file
  clearLogs() {
    try {
      if (fs.existsSync(this.logFile)) {
        fs.unlinkSync(this.logFile);
        this.info('Debug logs cleared');
      }
    } catch (error) {
      this.error('Failed to clear debug logs', error);
    }
  }

  // Get log file path
  getLogPath() {
    return this.logFile;
  }

  // Enable/disable debug mode
  setDebugMode(enabled) {
    this.debugMode = enabled;
    this.logLevel = enabled ? 'debug' : 'info';
  }
}

// Create singleton instance
const logger = new Logger();

module.exports = logger;
