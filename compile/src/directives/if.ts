import { Expression } from 'estree';
import type { IDirectiveIf } from '../ast';
import { NodeTypes } from '../ast';
import { IContext } from '../parse/faces';
import { createCompilerError, ErrorCodes } from '../errors';
import parseDirectiveStructure, { serializeDirectiveStructure } from './utils/directiveStructure';
import parseExpression from '../utils/parseExpression';
import serializeExpression from '../utils/serializeExpression';
import { ISerializer } from '../serialize/faces';

/**
 * <div x-each="$user:{item:$item}">
 * <div x-each="{array:$user}:{item:$item}">
 */
export default function processIf(ctx: IContext, content: string): void {
  try {
    const { input, mock } = parseDirectiveStructure(content);
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

export function srzIf(expr: IDirectiveIf, opts: ISerializer): string {
  const input = expr.input.expr
    ? srzInputExpr(expr.input.expr, opts.compactJS)
    : expr.input.content;
  const mock = srzMockExpr(expr.mock.expr);
  return serializeDirectiveStructure(input, undefined, mock);
}
function srzInputExpr({ test }: { test?: Expression }, compress: boolean): string {
  if (!test) { return ''; }
  return serializeExpression(test, compress);
}
function parseInputExpr(content: string): { test?: Expression } {
  if (content.length === 0) { return {}; }
  return { test: parseExpression(content) };
}
function srzMockExpr(expr: boolean) {
  return expr === false ? '0' : '';
}
function parseMockExpr(content: string) {
  if (content) {
    return false;
  }
  return true;
}
