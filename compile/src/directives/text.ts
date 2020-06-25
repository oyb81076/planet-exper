import { Expression } from 'estree';
import type { IDirectiveText } from '../ast';
import { IContext } from '../parse/faces';
import { createDirectiveText } from '../astUtils';
import { createCompilerError, ErrorCodes } from '../errors';
import parseExpression from '../utils/parseExpression';
import serializeExpression from '../utils/serializeExpression';
import { ISerializer } from '../serialize/faces';

/**
 * @example
 *  <div x-text="$user.data.name">
 *  <div x-text="$user.data.name + ' other text value'">
 */
export default function processText(ctx: IContext, content: string): void {
  try {
    const expr = ctx.parseExpression ? parseExpr(content) : undefined;
    ctx.directives.text = createDirectiveText(content, expr);
  } catch (err) {
    throw createCompilerError(ErrorCodes.X_D_TEXT_SYNTAX, ctx, content, err);
  }
}

export function computeTextExpr(input: IDirectiveText): { value?: Expression } {
  return input.expr || (input.expr = parseExpr(input.content));
}
export function srzText(dir: IDirectiveText, opts: ISerializer): string {
  return dir.expr ? srzExpr(dir.expr, opts.compactJS) : dir.content;
}
function srzExpr({ value }: { value?: Expression }, compress: boolean): string {
  return value ? serializeExpression(value, compress) : '';
}
function parseExpr(content: string): { value?: Expression } {
  if (!content) { return {}; }
  return { value: parseExpression(content) };
}
