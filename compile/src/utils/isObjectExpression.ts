import { Expression, ObjectExpression } from 'estree';

export default function isObjectExpression(expr: Expression): expr is ObjectExpression {
  return expr.type === 'ObjectExpression';
}
