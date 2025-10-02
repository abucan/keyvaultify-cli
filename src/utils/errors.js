// src/utils/errors.js
const chalk = require('chalk');

class KeyvaultifyError extends Error {
  constructor(message, code, suggestions = []) {
    super(message);
    this.name = 'KeyvaultifyError';
    this.code = code;
    this.suggestions = suggestions;
  }

  display() {
    console.error(chalk.red(`❌ ${this.message}`));

    if (this.suggestions.length > 0) {
      console.log(chalk.gray('\nSuggestions:'));
      this.suggestions.forEach((suggestion) => {
        console.log(chalk.gray(`• ${suggestion}`));
      });
    }
  }
}

class AuthenticationError extends KeyvaultifyError {
  constructor(message = 'Authentication failed') {
    super(message, 'AUTH_ERROR', [
      'Run `keyvault login` to authenticate',
      'Check your API token at https://keyvaultify.com/settings/developer',
    ]);
  }
}

class ProjectError extends KeyvaultifyError {
  constructor(message = 'Project error') {
    super(message, 'PROJECT_ERROR', [
      'Run `keyvault init` to link a project',
      'Run `keyvault projects` to see available projects',
    ]);
  }
}

class NetworkError extends KeyvaultifyError {
  constructor(message = 'Network error') {
    super(message, 'NETWORK_ERROR', [
      'Check your internet connection',
      'Verify the API endpoint is correct',
      'Try again in a few minutes',
    ]);
  }
}

class ValidationError extends KeyvaultifyError {
  constructor(message = 'Validation error') {
    super(message, 'VALIDATION_ERROR', [
      'Check your input parameters',
      'Use `keyvault <command> --help` for usage information',
    ]);
  }
}

class PermissionError extends KeyvaultifyError {
  constructor(message = 'Permission denied') {
    super(message, 'PERMISSION_ERROR', [
      'Check your role in the organization',
      'Contact your admin for access',
      'Verify you have the required permissions',
    ]);
  }
}

class NotFoundError extends KeyvaultifyError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', [
      'Check the resource ID',
      'Run `keyvault projects` to see available projects',
      'Run `keyvault environments` to see available environments',
    ]);
  }
}

// Error factory functions
function createError(type, message, suggestions = []) {
  switch (type) {
    case 'auth':
      return new AuthenticationError(message);
    case 'project':
      return new ProjectError(message);
    case 'network':
      return new NetworkError(message);
    case 'validation':
      return new ValidationError(message);
    case 'permission':
      return new PermissionError(message);
    case 'not_found':
      return new NotFoundError(message);
    default:
      return new KeyvaultifyError(message, 'UNKNOWN_ERROR', suggestions);
  }
}

// Error handler for API responses
function handleApiError(response) {
  if (!response.success) {
    switch (response.error) {
      case 'UNAUTHORIZED':
        return new AuthenticationError(response.message);
      case 'FORBIDDEN':
        return new PermissionError(response.message);
      case 'NOT_FOUND':
        return new NotFoundError(response.message);
      case 'NETWORK_ERROR':
        return new NetworkError(response.message);
      case 'VALIDATION_ERROR':
        return new ValidationError(response.message);
      default:
        return new KeyvaultifyError(
          response.message,
          response.error,
          response.suggestions || []
        );
    }
  }
  return null;
}

// Global error handler
function handleError(error) {
  if (error instanceof KeyvaultifyError) {
    error.display();
  } else {
    console.error(chalk.red('❌ Unexpected error:'), error.message);
    console.log(chalk.gray('\nIf this persists, please report it at:'));
    console.log(chalk.gray('https://github.com/keyvaultify/cli/issues'));
  }
  process.exit(1);
}

module.exports = {
  KeyvaultifyError,
  AuthenticationError,
  ProjectError,
  NetworkError,
  ValidationError,
  PermissionError,
  NotFoundError,
  createError,
  handleApiError,
  handleError,
};
