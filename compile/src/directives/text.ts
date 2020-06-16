import { parseExpressionAt } from 'acorn';
import { Expression } from 'estree';
import { generate } from 'escodegen';
import type { IDirectiveText } from '../ast';
import { IContext } from '../parse/faces';
import { createDirectiveText } from '../astUtils';
import { createCompilerError, ErrorCodes } from '../errors';

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
export function srzText(dir: IDirectiveText): string {
  return dir.expr ? srzExpr(dir.expr) : dir.content;
}
function srzExpr({ value }: { value?: Expression }): string {
  return value ? generate(value) : '';
}
function parseExpr(content: string): { value?: Expression } {
  if (!content) { return {}; }
  return { value: parseExpressionAt(content) as Expression };
}
