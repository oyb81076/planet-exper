export default function isEmptyString(text: string): boolean {
  if (text.length === 0) { return true; }
  if (!/^\s*$/.test(text)) { return false; }
  return text.indexOf('\u00a0') === -1;
}
