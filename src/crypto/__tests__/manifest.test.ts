import { encrypt, decrypt, deriveKey } from '../manifest';
import * as crypto from 'crypto';

describe('manifest crypto', () => {
  const passphrase = 'super-secret-passphrase';
  const plaintext = JSON.stringify({ version: '1.0', entries: [], checksum: 'abc' });

  it('encrypts and decrypts round-trip successfully', () => {
    const ciphertext = encrypt(plaintext, passphrase);
    const result = decrypt(ciphertext, passphrase);
    expect(result).toBe(plaintext);
  });

  it('produces different ciphertext each call (random IV/salt)', () => {
    const c1 = encrypt(plaintext, passphrase);
    const c2 = encrypt(plaintext, passphrase);
    expect(c1).not.toBe(c2);
  });

  it('throws on wrong passphrase', () => {
    const ciphertext = encrypt(plaintext, passphrase);
    expect(() => decrypt(ciphertext, 'wrong-passphrase')).toThrow();
  });

  it('throws on tampered ciphertext', () => {
    const ciphertext = encrypt(plaintext, passphrase);
    const tampered = Buffer.from(ciphertext, 'base64');
    tampered[tampered.length - 1] ^= 0xff;
    expect(() => decrypt(tampered.toString('base64'), passphrase)).toThrow();
  });

  it('deriveKey returns a 32-byte buffer', () => {
    const salt = crypto.randomBytes(16);
    const key = deriveKey(passphrase, salt);
    expect(key.length).toBe(32);
  });
});
