// Cryptographic utilities for Tor plugin
// Provides encryption, decryption, and key generation

// Web Crypto API wrapper for browser compatibility
class CryptoUtils {
  constructor() {
    this.algorithm = 'AES-GCM';
    this.keyLength = 256;
    this.ivLength = 12;
  }

  // Generate a new key pair for encryption
  async generateKeyPair() {
    try {
      // Generate AES key for encryption
      const key = await window.crypto.subtle.generateKey(
        {
          name: this.algorithm,
          length: this.keyLength
        },
        true,
        ['encrypt', 'decrypt']
      );

      // Export the key for storage
      const exportedKey = await window.crypto.subtle.exportKey('raw', key);
      const keyString = this.arrayBufferToBase64(exportedKey);

      return {
        publicKey: keyString,
        privateKey: keyString, // In real implementation, use asymmetric keys
        key: key
      };
    } catch (error) {
      console.error('Failed to generate key pair:', error);
      throw error;
    }
  }

  // Encrypt data using the provided key
  async encryptData(data, keyString) {
    try {
      // Convert base64 key back to CryptoKey
      const keyBuffer = this.base64ToArrayBuffer(keyString);
      const key = await window.crypto.subtle.importKey(
        'raw',
        keyBuffer,
        this.algorithm,
        false,
        ['encrypt']
      );

      // Generate random IV
      const iv = window.crypto.getRandomValues(new Uint8Array(this.ivLength));

      // Encrypt the data
      const encodedData = new TextEncoder().encode(data);
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: this.algorithm,
          iv: iv
        },
        key,
        encodedData
      );

      // Combine IV and encrypted data
      const result = {
        iv: this.arrayBufferToBase64(iv),
        data: this.arrayBufferToBase64(encryptedBuffer)
      };

      return JSON.stringify(result);
    } catch (error) {
      console.error('Encryption failed:', error);
      throw error;
    }
  }

  // Decrypt data using the provided key
  async decryptData(encryptedData, keyString) {
    try {
      // Parse the encrypted data
      const { iv, data } = JSON.parse(encryptedData);

      // Convert base64 key back to CryptoKey
      const keyBuffer = this.base64ToArrayBuffer(keyString);
      const key = await window.crypto.subtle.importKey(
        'raw',
        keyBuffer,
        this.algorithm,
        false,
        ['decrypt']
      );

      // Convert base64 data back to ArrayBuffer
      const ivBuffer = this.base64ToArrayBuffer(iv);
      const dataBuffer = this.base64ToArrayBuffer(data);

      // Decrypt the data
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv: ivBuffer
        },
        key,
        dataBuffer
      );

      // Convert back to string
      return new TextDecoder().decode(decryptedBuffer);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw error;
    }
  }

  // Generate a hash of data for integrity checking
  async hashData(data) {
    try {
      const encodedData = new TextEncoder().encode(data);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', encodedData);
      return this.arrayBufferToBase64(hashBuffer);
    } catch (error) {
      console.error('Hashing failed:', error);
      throw error;
    }
  }

  // Generate a random salt for key derivation
  generateSalt(length = 16) {
    const salt = window.crypto.getRandomValues(new Uint8Array(length));
    return this.arrayBufferToBase64(salt);
  }

  // Derive a key from a password using PBKDF2
  async deriveKey(password, salt, iterations = 100000) {
    try {
      const encoder = new TextEncoder();
      const passwordBuffer = encoder.encode(password);
      const saltBuffer = this.base64ToArrayBuffer(salt);

      const key = await window.crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
      );

      const derivedKey = await window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: saltBuffer,
          iterations: iterations,
          hash: 'SHA-256'
        },
        key,
        {
          name: this.algorithm,
          length: this.keyLength
        },
        true,
        ['encrypt', 'decrypt']
      );

      return derivedKey;
    } catch (error) {
      console.error('Key derivation failed:', error);
      throw error;
    }
  }

  // Utility functions for base64 conversion
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Generate a secure random string
  generateRandomString(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomArray = new Uint8Array(length);
    window.crypto.getRandomValues(randomArray);
    
    for (let i = 0; i < length; i++) {
      result += chars[randomArray[i] % chars.length];
    }
    
    return result;
  }

  // Verify data integrity using hash
  async verifyIntegrity(data, expectedHash) {
    const actualHash = await this.hashData(data);
    return actualHash === expectedHash;
  }
}

// Create and export instance
const cryptoUtils = new CryptoUtils();

// Export individual functions for direct use
export const {
  generateKeyPair,
  encryptData,
  decryptData,
  hashData,
  generateSalt,
  deriveKey,
  generateRandomString,
  verifyIntegrity
} = cryptoUtils;

export default cryptoUtils;
