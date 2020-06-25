import { Expression } from 'estree';
import { IContext } from '../parse/faces';
import { IDirectiveBind, NodeTypes } from '../ast';
import { createCompilerError, ErrorCodes } from '../errors';
import parseExpression from '../utils/parseExpression';
import serializeExpression from '../utils/serializeExpression';
import { ISerializer } from '../serialize/faces';

/**
 * @example
 *  <div x--href="$item.name">
 *  <div x--href="'text'">
 */
export default function processBind(ctx: IContext, xName: string, xValue: string): void {
  try {
    ctx.directives.binds.push({
      type: NodeTypes.DIRECTIVE_BIND,
      expr: ctx.parseExpression ? parseExpr(xValue) : undefined,
      name: xName.substr(3),
      value: xValue,
    });
  } catch (err) {
    throw createCompilerError(ErrorCodes.X_D_BIND_SYNTAX, ctx, xValue, err);
  }
}

export function computeBindExpr(input: IDirectiveBind): { value?: Expression } {
  return input.expr || (input.expr = parseExpr(input.value));
}

export function srzBind(
  { name, value, expr }: IDirectiveBind,
  { compactJS }: ISerializer,
): [string, string] {
  return [
    `x--${name}`,
    expr ? srzExpr(expr, compactJS) : value,
  ];
}

function parseExpr(content: string): { value?: Expression } {
  if (!content) { return {}; }
  return { value: parseExpression(content) };
}

function srzExpr({ value }: { value?: Expression }, compress: boolean) {
  if (!value) { return ''; }
  return serializeExpression(value, compress);
}
