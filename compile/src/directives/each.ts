import { parse } from 'json5';
import { Expression, Identifier, MemberExpression } from 'estree';
import { isPlainObject, isNumber } from 'lodash';
import type { IDirectiveEach } from '../ast';
import { NodeTypes } from '../ast';

import { IContext } from '../parse/faces';
import { ErrorCodes, createCompilerError } from '../errors';
import parseDirectiveStructure, { serializeDirectiveStructure } from './utils/directiveStructure';
import { parseDirectiveOutput, serializeDirectiveOutput } from './utils/directiveOutput';
import parseRecordExpr from '../utils/parseRecordExpr';
import parseExpression from '../utils/parseExpression';
import serializeExpression from '../utils/serializeExpression';
import { ISerializer } from '../serialize/faces';

/**
 * <div x-each="$user:{item:$item}">
 * <div x-each="{array:$user}:{item:$item}">
 */
export default function processEach(ctx: IContext, content: string): void {
  try {
    const { input, output, mock } = parseDirectiveStructure(content);
    if (!input) { throw createCompilerError(ErrorCodes.X_D_EACH_NO_INPUT, ctx, content, null); }
    ctx.directives.each = {
      type: NodeTypes.DIRECTIVE_EACH,
      input: {
        expr: ctx.parseExpression ? parseInputExpr(input) : undefined,
        content: input,
      },
      output: {
        expr: ctx.parseExpression ? parseOutputExpr(output) : undefined,
        content: output,
      },
      mock: {
        expr: ctx.parseExpression ? parseMockExpr(mock) : undefined,
        content: mock,
      },
      content,
    };
  } catch (err) {
    throw createCompilerError(ErrorCodes.X_D_EACH_ERR_SYNTAX, ctx, content, err);
  }
}

export function computeEachOutputExpr(
  { output }: IDirectiveEach,
): { stat?: string, item?: string } {
  return output.expr || (output.expr = parseOutputExpr(output.content));
}

export function computeEachInputExpr(
  { input }: IDirectiveEach,
): { array?: Identifier | MemberExpression } {
  return input.expr || (input.expr = parseInputExpr(input.content));
}

export function computeEachMockExpr({ mock }: IDirectiveEach): { length?: number } {
  return mock.expr || (mock.expr = parseMockExpr(mock.content));
}
function parseMockExpr(content: string): { length?: number } {
  if (!content) { return {}; }
  const c = parse(content) as number | { length: number };
  if (isNumber(c)) {
    return { length: c };
  } if (isPlainObject(c) && isNumber(c.length)) {
    return { length: c.length };
  }
  throw new SyntaxError(`each Mock语法错误${content}`);
}
function parseOutputExpr(content: string): { stat?: string, item?: string } {
  const out = parseDirectiveOutput(content);
  if (typeof out === 'string') { throw new SyntaxError('each指令返回值格式错误'); }
  const { item, stat } = out;
  return { item, stat };
}

/**
 *
 * @param content {array:$users} or $users
 */
function parseInputExpr(content: string): { array?: Identifier | MemberExpression } {
  if (content.length === 0) {
    return {};
  }
  let expr: Expression;
  if (content[0] === '{') {
    const { array } = parseRecordExpr(content);
    if (!array) { throw new SyntaxError('each指令输入参数需要array'); }
    expr = array;
  } else {
    expr = parseExpression(content);
  }
  if (expr.type !== 'Identifier' && expr.type !== 'MemberExpression') {
    throw new SyntaxError('数组表达式必须为引用');
  }
  return { array: expr };
}

export function srzEachValue({ input, output, mock }: IDirectiveEach, opts: ISerializer): string {
  const inputStr = input.expr ? srzInputExpr(input.expr, opts.compactJS) : input.content;
  const outputStr = output.expr ? serializeDirectiveOutput(output.expr) : output.content;
  const mockStr = mock.expr ? srzMockExpr(mock.expr) : mock.content;
  return serializeDirectiveStructure(inputStr, outputStr, mockStr);
}

function srzInputExpr(expr: NonNullable<IDirectiveEach['input']['expr']>, compress: boolean) {
  if (!expr.array) {
    return '';
  }
  return serializeExpression(expr.array, compress);
}
function srzMockExpr(expr: NonNullable<IDirectiveEach['mock']['expr']>): string {
  if (expr.length == null) { return ''; }
  return String(expr.length);
}
