import { generate } from 'escodegen';
import { Expression } from 'estree';

export default function serializeExpression(expr: Expression, compress: boolean): string {
  return generate(expr, { format: { compact: compress } });
}
