import CryptoJS from 'crypto-js';

// Get the secret key from environment variables or set a default key
const SECRET_KEY = import.meta.env.VITE_SECRET_KEY || 'default_secret_key';

export const encryptAES = (plainText: string): string => {
  const key = CryptoJS.enc.Utf8.parse(SECRET_KEY.padEnd(32, ' ').substring(0, 32));
  const iv = CryptoJS.enc.Utf8.parse('\0'.repeat(16)); // Zero IV (like .NET)

  const encrypted = CryptoJS.AES.encrypt(plainText, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return encrypted.toString();
};

export const encryptAESBackend = (plainText: string): string => {
  // Create 32-byte key like backend: pad to 32 chars and truncate if longer
  const key = CryptoJS.enc.Utf8.parse(SECRET_KEY.padEnd(32).substring(0, 32));

  // 16-byte zero IV
  const iv = CryptoJS.enc.Utf8.parse('\0'.repeat(16));

  // Encrypt
  const encrypted = CryptoJS.AES.encrypt(plainText, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  // Convert to standard Base64
  const base64 = encrypted.ciphertext.toString(CryptoJS.enc.Base64);

  // Convert to URL-safe Base64 (match C# backend)
  const urlSafeBase64 = base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return urlSafeBase64;
};

export const decryptAES = (cipherText: string): string => {
  const key = CryptoJS.enc.Utf8.parse(SECRET_KEY.padEnd(32, ' ').substring(0, 32));
  const iv = CryptoJS.enc.Utf8.parse('\0'.repeat(16)); // Zero IV

  const decrypted = CryptoJS.AES.decrypt(cipherText, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
};

export const encryptAESUrl = (plainText: string): string => {
  const key = CryptoJS.SHA256(SECRET_KEY);
  const iv = CryptoJS.lib.WordArray.random(16);

  const encrypted = CryptoJS.AES.encrypt(plainText, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const ivBase64 = iv.toString(CryptoJS.enc.Base64);
  const encryptedBase64 = encrypted.toString();

  const ivSafe = ivBase64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const encryptedSafe = encryptedBase64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  return `${ivSafe}.${encryptedSafe}`;
};

export const decryptAESURL = (cipherText: string): string => {
  const key = CryptoJS.SHA256(SECRET_KEY);

  const [ivSafe, encryptedSafe] = cipherText.split('.');

  const ivBase64 = ivSafe.replace(/-/g, '+').replace(/_/g, '/');
  const encryptedBase64 = encryptedSafe.replace(/-/g, '+').replace(/_/g, '/');

  const iv = CryptoJS.enc.Base64.parse(ivBase64);

  const decrypted = CryptoJS.AES.decrypt(encryptedBase64, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
};

export const encryptAESSlaes = (plainText: any) => {
  const key = CryptoJS.enc.Utf8.parse(SECRET_KEY.padEnd(32, ' ').substring(0, 32));
  const iv = CryptoJS.enc.Utf8.parse('\0'.repeat(16)); // Zero IV (like .NET)

  const encrypted = CryptoJS.AES.encrypt(plainText, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return encrypted.toString().replace(/\//g, '_').replace(/\+/g, '-').replace(/=+$/, '');
};

export const decryptAESSlase = (cipherText: any) => {
  if (!cipherText || typeof cipherText !== 'string') return '';
  const key = CryptoJS.enc.Utf8.parse(SECRET_KEY.padEnd(32, ' ').substring(0, 32));
  const iv = CryptoJS.enc.Utf8.parse('\0'.repeat(16)); // Zero IV (like .NET)

  let base64 = cipherText.replace(/_/g, '/').replace(/-/g, '+');
  while (base64.length % 4) base64 += '=';

  const decrypted = CryptoJS.AES.decrypt(base64, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
};
