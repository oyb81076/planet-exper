import { Expression } from 'estree';
import objectExprToRecord from './objectExprToRecord';
import parseExpression from './parseExpression';

// {a:$item,b:2}:xxx
// {array:$user}
export default function parseRecordExpr(content: string): Record<string, Expression> {
  if (content[0] !== '{' || content[content.length - 1] !== '}') {
    throw new SyntaxError(`必须以{}包裹${content}`);
  }
  const expr = parseExpression(content);
  if (expr.type !== 'ObjectExpression') {
    throw new SyntaxError('无法解析为Object表达式');
  }
  return objectExprToRecord(expr);
}
