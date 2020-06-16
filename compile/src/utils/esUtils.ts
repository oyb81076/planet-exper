import { SimpleLiteral, Expression, ObjectExpression } from 'estree';
import { isString } from 'lodash';

export function createJsLiteral(value: string | boolean | number | null): SimpleLiteral {
  return { type: 'Literal', value };
}

export function isStringLiteral(expr: Expression): expr is SimpleLiteral & { value: string } {
  if (expr.type === 'Literal') {
    return isString(expr.value);
  }
  return false;
}
export function isObjectExpression(expr: Expression): expr is ObjectExpression {
  return expr.type === 'ObjectExpression';
}
