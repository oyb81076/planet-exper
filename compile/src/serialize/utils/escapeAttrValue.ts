export default function escapeAttrValue(value: string, compress: boolean): string {
  // if (!compress && !/[\s'"]/.test(value) && value[0] !== '"' && value[0] !== "'") {
  if (!compress && !/[\s'"=]/.test(value)) {
    return value;
  }
  return `"${value.replace(/"/, '&quot;')}"`;
}
