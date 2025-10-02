// src/utils/api.js
const axios = require('axios');

class KeyvaultifyAPI {
  constructor(token = null) {
    this.token = token;
    this.baseURL = process.env.KEYVAULTIFY_API_URL || 'http://localhost:3000';

    if (!this.token) {
      throw new Error('No API token found. Run `keyvault login` first.');
    }
  }

  async request(method, endpoint, data = null) {
    try {
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'keyvaultify-cli/1.0.0',
        },
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 401:
          return {
            success: false,
            error: 'UNAUTHORIZED',
            message:
              'Invalid or expired API token. Run `keyvault login` to authenticate.',
            suggestions: [
              'Run `keyvault login` to get a new token',
              'Check your token in ~/.keyvaultify/config.json',
            ],
          };
        case 403:
          return {
            success: false,
            error: 'FORBIDDEN',
            message:
              'Insufficient permissions. You may not have access to this resource.',
            suggestions: [
              'Check your role in the organization',
              'Contact your admin for access',
            ],
          };
        case 404:
          return {
            success: false,
            error: 'NOT_FOUND',
            message:
              'Resource not found. The project or environment may not exist.',
            suggestions: [
              'Run `keyvault projects` to see available projects',
              'Check your project ID',
            ],
          };
        case 429:
          return {
            success: false,
            error: 'RATE_LIMITED',
            message: 'Too many requests. Please wait before trying again.',
            suggestions: [
              'Wait a few minutes before retrying',
              'Consider reducing the frequency of requests',
            ],
          };
        case 500:
          return {
            success: false,
            error: 'SERVER_ERROR',
            message: 'Server error occurred. Please try again later.',
            suggestions: [
              'Try again in a few minutes',
              'Check https://status.keyvaultify.com for updates',
            ],
          };
        default:
          return {
            success: false,
            error: 'API_ERROR',
            message: data?.message || `Request failed with status ${status}`,
            suggestions: [
              'Check your internet connection',
              'Verify the API endpoint is correct',
            ],
          };
      }
    } else if (error.request) {
      // Network error
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message:
          'Unable to connect to Keyvaultify API. Check your internet connection.',
        suggestions: [
          'Check your internet connection',
          'Verify the API URL is correct',
          'Check if the service is running',
        ],
      };
    } else {
      // Other error
      return {
        success: false,
        error: 'UNKNOWN_ERROR',
        message: error.message || 'An unexpected error occurred',
        suggestions: ['Try again', 'Check the logs for more details'],
      };
    }
  }

  // Projects API
  async getProjects() {
    return await this.request('GET', '/api/cli/projects');
  }

  async getProject(projectId) {
    return await this.request('GET', `/api/cli/projects/${projectId}`);
  }

  async getProjectEnvironments(projectId) {
    return await this.request(
      'GET',
      `/api/cli/projects/${projectId}/environments`
    );
  }

  // Secrets API
  async getSecrets(environmentId) {
    return await this.request('GET', `/api/cli/secrets/${environmentId}`);
  }

  async pushSecrets(environmentId, secrets) {
    return await this.request('POST', `/api/cli/secrets/${environmentId}`, {
      secrets,
    });
  }

  async deleteSecret(environmentId, key) {
    return await this.request(
      'DELETE',
      `/api/cli/secrets/${environmentId}/${key}`
    );
  }

  // Utility methods
  async validateToken() {
    const response = await this.request('GET', '/api/cli/auth');
    return response.success;
  }

  async getUserInfo() {
    const response = await this.request('GET', '/api/cli/auth');
    if (response.success && response.data) {
      return {
        organizationId: response.data.organizationId,
        organizationName: response.data.organizationName,
        projectId: response.data.projectId,
        userId: response.data.userId,
        role: response.data.role,
        canRead: response.data.canRead,
        canWrite: response.data.canWrite,
      };
    }
    return null;
  }
}

module.exports = { KeyvaultifyAPI };
