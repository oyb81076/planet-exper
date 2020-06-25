import { parseExpressionAt } from 'acorn';
import { Expression } from 'estree';

export default function parseExpression(content: string): Expression {
  return parseExpressionAt(content) as Expression;
}
