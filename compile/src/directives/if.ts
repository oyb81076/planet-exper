import { parseExpressionAt } from 'acorn';
import { Expression } from 'estree';
import { generate } from 'escodegen';
import type { IDirectiveIf } from '../ast';
import { NodeTypes } from '../ast';
import { parseInputOutput, srzInputOutput } from './utils/directiveUtils';
import { IContext } from '../parse/faces';
import { createCompilerError, ErrorCodes } from '../errors';

/**
 * <div x-each="$user:{item:$item}">
 * <div x-each="{array:$user}:{item:$item}">
 */
export default function processIf(ctx: IContext, content: string): void {
  try {
    const { input, mock } = parseInputOutput(content);
    ctx.directives.if = {
      type: NodeTypes.DIRECTIVE_IF,
      input: { content: input },
      mock: { expr: parseMockExpr(mock), content: mock },
      content,
    };
  } catch (err) {
    throw createCompilerError(ErrorCodes.X_D_IF_ERR_SYNTAX, ctx, content, err);
  }
}

export function computeIfInputExpr({ input }: IDirectiveIf): { test?: Expression } {
  return input.expr || (input.expr = parseInputExpr(input.content));
}

export function srzIf(expr: IDirectiveIf): string {
  const input = expr.input.expr ? srzInputExpr(expr.input.expr) : expr.input.content;
  const mock = srzMockExpr(expr.mock.expr);
  return srzInputOutput(input, undefined, mock);
}
function srzInputExpr({ test }: { test?: Expression }): string {
  if (!test) { return ''; }
  return generate(test);
}
function parseInputExpr(content: string): { test?: Expression } {
  if (content.length === 0) { return {}; }
  return { test: parseExpressionAt(content) as Expression };
}
function srzMockExpr(expr: boolean) {
  return expr === false ? 'false' : '';
}
function parseMockExpr(content: string) { return content !== 'false'; }
