const crypto = require('crypto');

function encryptSecrets(secretsObj, passphrase) {
  const plaintext = JSON.stringify(secretsObj);
  const iv = crypto.randomBytes(12);
  const salt = crypto.randomBytes(16);

  const key = crypto.pbkdf2Sync(passphrase, salt, 100000, 32, 'sha256');
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    salt: salt.toString('hex'),
    tag: tag.toString('hex'),
    data: encrypted.toString('hex'),
  };
}

function decryptSecrets({ iv, salt, tag, data }, passphrase) {
  const key = crypto.pbkdf2Sync(
    passphrase,
    Buffer.from(salt, 'hex'),
    100000,
    32,
    'sha256'
  );
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(tag, 'hex'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(data, 'hex')),
    decipher.final(),
  ]);

  return JSON.parse(decrypted.toString('utf8'));
}

module.exports = { encryptSecrets, decryptSecrets };
