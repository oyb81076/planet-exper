import { Expression } from 'estree';
import { IContext } from '../parse/faces';
import { createCompilerError, ErrorCodes } from '../errors';
import { createDirectiveClasses } from '../astUtils';
import { IDirectiveClasses } from '../ast';
import recordExprToString from '../utils/recordExprToString';
import objectExprToRecord from '../utils/objectExprToRecord';
import isObjectExpression from '../utils/isObjectExpression';
import parseExpression from '../utils/parseExpression';
import { ISerializer } from '../serialize/faces';

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

export function srzClasses(dir: IDirectiveClasses, opts: ISerializer): string {
  return dir.expr ? srzExpr(dir.expr, opts.compactJS) : dir.content;
}

function srzExpr(record: Record<string, Expression>, compress: boolean) {
  return recordExprToString(record, compress);
}
function parseExpr(content: string): Record<string, Expression> {
  if (content.length === 0) { return {}; }
  const expr = parseExpression(content);
  if (!isObjectExpression(expr)) {
    throw new SyntaxError('必须使用object表达式');
  }
  return objectExprToRecord(expr);
}
