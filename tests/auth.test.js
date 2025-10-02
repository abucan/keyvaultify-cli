// tests/auth.test.js
const fs = require('fs');
const os = require('os');
const path = require('path');
const { getToken, saveUserInfo, clearAuth } = require('../src/utils/auth');

// Mock the API module
jest.mock('../src/utils/api');

describe('Auth Utils', () => {
  const mockConfigPath = path.join(
    os.tmpdir(),
    '.keyvaultify-test',
    'config.json'
  );

  beforeEach(() => {
    // Override the config path for testing
    jest.doMock('../src/utils/auth', () => {
      const originalModule = jest.requireActual('../src/utils/auth');
      return {
        ...originalModule,
        CONFIG_PATH: mockConfigPath,
      };
    });
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(mockConfigPath)) {
      fs.unlinkSync(mockConfigPath);
    }
    const configDir = path.dirname(mockConfigPath);
    if (fs.existsSync(configDir)) {
      fs.rmdirSync(configDir);
    }
  });

  describe('getToken', () => {
    it('should return null if config file does not exist', () => {
      const token = getToken();
      expect(token).toBeNull();
    });

    it('should return token from config file', () => {
      const testToken = 'kvf_test123';
      const configDir = path.dirname(mockConfigPath);

      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      fs.writeFileSync(mockConfigPath, JSON.stringify({ token: testToken }));

      const token = getToken();
      expect(token).toBe(testToken);
    });

    it('should return null if config file is invalid JSON', () => {
      const configDir = path.dirname(mockConfigPath);

      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      fs.writeFileSync(mockConfigPath, 'invalid json');

      const token = getToken();
      expect(token).toBeNull();
    });
  });

  describe('saveUserInfo', () => {
    it('should save user info to config file', async () => {
      const testToken = 'kvf_test123';
      const testUserInfo = { organizationName: 'Test Org' };

      const result = await saveUserInfo(testToken, testUserInfo);

      expect(result).toBe(true);
      expect(fs.existsSync(mockConfigPath)).toBe(true);

      const config = JSON.parse(fs.readFileSync(mockConfigPath, 'utf8'));
      expect(config.token).toBe(testToken);
      expect(config.userInfo).toEqual(testUserInfo);
      expect(config.lastUpdated).toBeDefined();
    });
  });

  describe('clearAuth', () => {
    it('should return true if config file does not exist', () => {
      const result = clearAuth();
      expect(result).toBe(true);
    });

    it('should delete config file if it exists', () => {
      const configDir = path.dirname(mockConfigPath);

      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      fs.writeFileSync(mockConfigPath, JSON.stringify({ token: 'test' }));

      expect(fs.existsSync(mockConfigPath)).toBe(true);

      const result = clearAuth();
      expect(result).toBe(true);
      expect(fs.existsSync(mockConfigPath)).toBe(false);
    });
  });
});
