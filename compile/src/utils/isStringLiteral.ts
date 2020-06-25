import { Expression, SimpleLiteral } from 'estree';
import { isString } from 'lodash';

export default function isStringLiteral(
  expr: Expression,
): expr is SimpleLiteral & { value: string } {
  if (expr.type === 'Literal') {
    return isString(expr.value);
  }
  return false;
}
