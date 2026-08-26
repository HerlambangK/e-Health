import { randomBytes } from 'node:crypto';

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function generateId(prefix: string, length = 8): string {
  const year = new Date().getFullYear();
  const bytes = randomBytes(length);
  let id = '';
  for (let i = 0; i < length; i++) {
    id += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return `${prefix}-${year}-${id}`;
}
