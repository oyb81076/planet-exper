import { Expression } from 'estree';
import serializeExpression from './serializeExpression';
import { ISerializer } from '../serialize/faces';

export default function recordExprToString(
  record: Record<string, Expression>,
  { compactJS }: ISerializer,
): string {
  let out = '{';
  Object.entries(record).forEach(([key, expr]) => {
    if (out !== '{') {
      out += ',';
    }
    if (isShortKey(key)) {
      out += key;
    } else {
      out += `'${key.replace(/'/g, "\\'")}'`;
    }
    out += ':';
    out += serializeExpression(expr, compactJS);
  });
  out += '}';
  return out;
}
const SHORT_KEY_RE = /^[a-zA-Z0-9_$]+$/;
function isShortKey(v: string) {
  return SHORT_KEY_RE.test(v);
}
