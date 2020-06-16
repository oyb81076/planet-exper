export default function isFile(v: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(v);
}
