import { Expression } from 'estree';
import { parseExpressionAt } from 'acorn';
import { generate } from 'escodegen';
import { IContext } from '../parse/faces';
import { IDirectiveBind, NodeTypes } from '../ast';
import { createCompilerError, ErrorCodes } from '../errors';

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

export function srzBind({ name, value, expr }: IDirectiveBind): [string, string] {
  return [
    `x--${name}`,
    expr ? srzExpr(expr) : value,
  ];
}

function parseExpr(content: string): { value?: Expression } {
  if (!content) { return {}; }
  return { value: parseExpressionAt(content) as Expression };
}

function srzExpr({ value }: { value?: Expression }) {
  if (!value) { return ''; }
  return generate(value);
}
