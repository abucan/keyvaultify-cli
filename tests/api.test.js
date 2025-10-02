// tests/api.test.js
const { KeyvaultifyAPI } = require('../src/utils/api');

// Mock axios
jest.mock('axios');
const axios = require('axios');

describe('KeyvaultifyAPI', () => {
  let api;

  beforeEach(() => {
    api = new KeyvaultifyAPI('test-token');
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create API instance with token', () => {
      expect(api.token).toBe('test-token');
      expect(api.baseURL).toBe('http://localhost:3000');
    });

    it('should throw error if no token provided', () => {
      expect(() => new KeyvaultifyAPI()).toThrow('No API token found');
    });
  });

  describe('request', () => {
    it('should make successful request', async () => {
      const mockResponse = {
        data: { success: true },
        status: 200,
      };
      axios.mockResolvedValue(mockResponse);

      const result = await api.request('GET', '/test');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ success: true });
      expect(axios).toHaveBeenCalledWith({
        method: 'GET',
        url: 'http://localhost:3000/test',
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
          'User-Agent': 'keyvaultify-cli/1.0.0',
        },
      });
    });

    it('should handle 401 error', async () => {
      const mockError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      };
      axios.mockRejectedValue(mockError);

      const result = await api.request('GET', '/test');

      expect(result.success).toBe(false);
      expect(result.error).toBe('UNAUTHORIZED');
      expect(result.message).toContain('Invalid or expired API token');
    });

    it('should handle network error', async () => {
      const mockError = {
        request: {},
        message: 'Network Error',
      };
      axios.mockRejectedValue(mockError);

      const result = await api.request('GET', '/test');

      expect(result.success).toBe(false);
      expect(result.error).toBe('NETWORK_ERROR');
      expect(result.message).toContain('Unable to connect');
    });
  });

  describe('getProjects', () => {
    it('should call correct endpoint', async () => {
      const mockResponse = {
        data: { projects: [] },
        status: 200,
      };
      axios.mockResolvedValue(mockResponse);

      await api.getProjects();

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: 'http://localhost:3000/api/cli/projects',
        })
      );
    });
  });

  describe('pushSecrets', () => {
    it('should call correct endpoint with secrets', async () => {
      const mockResponse = {
        data: { success: true },
        status: 200,
      };
      axios.mockResolvedValue(mockResponse);

      const secrets = [{ key: 'TEST_KEY', value: 'test_value' }];
      await api.pushSecrets('env-123', secrets);

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'http://localhost:3000/api/cli/secrets/env-123',
          data: { secrets },
        })
      );
    });
  });
});
