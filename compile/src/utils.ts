import { customAlphabet } from 'nanoid';
const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
export const keygen = customAlphabet(ALPHABET, 6);
