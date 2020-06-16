import { Expression } from 'estree';
import { parseExpressionAt } from 'acorn';
import { IContext } from '../parse/faces';
import { objectToRecord, recordExprToString } from './utils/directiveUtils';
import { isObjectExpression } from '../utils/esUtils';
import { createCompilerError, ErrorCodes } from '../errors';
import { createDirectiveClasses } from '../astUtils';
import { IDirectiveClasses } from '../ast';

export default function processClasses(ctx: IContext, content: string): void {
  try {
    const expr = ctx.parseExpression ? parseExpr(content) : undefined;
    ctx.directives.classes = createDirectiveClasses(content, expr);
  } catch (err) {
    throw createCompilerError(ErrorCodes.X_D_EACH_ERR_SYNTAX, ctx, content, err);
  }
}
export function computeClassesExpr(dir: IDirectiveClasses): NonNullable<IDirectiveClasses['expr']> {
  return dir.expr || (dir.expr = parseExpr(dir.content));
}

export function srzClasses(dir: IDirectiveClasses): string {
  return dir.expr ? srzExpr(dir.expr) : dir.content;
}

function srzExpr(record: Record<string, Expression>) {
  return recordExprToString(record);
}
function parseExpr(content: string): Record<string, Expression> {
  if (content.length === 0) { return {}; }
  const expr = parseExpressionAt(content) as Expression;
  if (!isObjectExpression(expr)) {
    throw new SyntaxError('必须使用object表达式');
  }
  return objectToRecord(expr);
}
