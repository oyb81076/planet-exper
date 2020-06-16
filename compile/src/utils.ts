import { customAlphabet } from 'nanoid';

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
// eslint-disable-next-line import/prefer-default-export
export const keygen = customAlphabet(ALPHABET, 6);
