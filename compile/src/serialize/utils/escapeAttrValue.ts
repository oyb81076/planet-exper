export default function escapeAttrValue(value: string, quote: boolean): string {
  if (!quote && !/[\s'"=]/.test(value)) {
    return value;
  }
  return `"${value.replace(/"/, '&quot;')}"`;
}
