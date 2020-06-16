import { parseExpressionAt } from 'acorn';
import { Expression } from 'estree';
import json5, { stringify } from 'json5';
import { generate } from 'escodegen';
import { IContext } from '../parse/faces';
import { createDirectiveHref } from '../astUtils';
import { IDirectiveHref } from '../ast';
import { ErrorCodes, createCompilerError } from '../errors';
import { objectToRecord } from './utils/directiveUtils';
import { isStringLiteral, isObjectExpression } from '../utils/esUtils';

/**
 *
 * @example
 *  <a x-href="{file:'5ee71f0159c61b62cdaaf7a3'}" />
 *  <a x-href="{pathname:'https://www.baidu.com/favicon.ico'}" />
 */
export default function processHref(ctx: IContext, content: string): void {
  try {
    const expr = ctx.parseExpression ? parseExpr(content) : undefined;
    ctx.directives.href = createDirectiveHref(content, expr);
  } catch (err) {
    throw createCompilerError(ErrorCodes.X_D_HREF_ERR_SYNTAX, ctx, content, err);
  }
}

export function computeHrefExpr(
  input: IDirectiveHref,
): NonNullable<IDirectiveHref['expr']> {
  return input.expr || (input.expr = parseExpr(input.content));
}

export function srzHref(dir: IDirectiveHref): string {
  return dir.expr ? srzExpr(dir.expr) : dir.content;
}

function srzExpr({
  file, pathname, query, hash,
}: NonNullable<IDirectiveHref['expr']>): string {
  const params: string[] = [];
  if (file) {
    params.push(`file:${stringify(file)}`);
  }
  if (pathname) {
    params.push(`pathname:${stringify(pathname)}`);
  }
  if (query) {
    params.push(`query:${generate(query)}`);
  }
  if (hash) {
    params.push(`hash:${stringify(hash)}`);
  }
  return params.length ? `{${params.join(',')}}` : '';
}
function parseExpr(content: string): NonNullable<IDirectiveHref['expr']> {
  if (content.length === 0) {
    return {};
  }
  if (content[0] !== '{') {
    return { file: content };
  }
  const obj = parseExpressionAt(content) as Expression;
  if (obj.type !== 'ObjectExpression') {
    throw new SyntaxError('必须使用object表达式');
  }
  const {
    file, pathname, query, hash,
  } = objectToRecord(obj);
  const out: IDirectiveHref['expr'] = {};
  if (file) {
    if (!isStringLiteral(file)) {
      throw new SyntaxError('file参数必须是字符串类型');
    }
    out.file = file.value;
  }
  if (pathname) {
    if (!isStringLiteral(pathname)) {
      throw new SyntaxError('pathname参数必须是字符串类型');
    }
    out.pathname = pathname.value;
  }
  if (query) {
    if (!isObjectExpression(query)) {
      throw new SyntaxError('query参数必须使用object表达式');
    }
    out.query = query;
  }
  if (hash) {
    if (!isStringLiteral(hash)) {
      throw new SyntaxError('hash参数必须使用字符串表达式');
    }
    out.hash = hash.value;
  }
  return out;
}
