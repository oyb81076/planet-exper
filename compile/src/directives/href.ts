import { stringify } from 'json5';
import { IContext } from '../parse/faces';
import { createDirectiveHref } from '../astUtils';
import { IDirectiveHref } from '../ast';
import { ErrorCodes, createCompilerError } from '../errors';
import recordExprToString from '../utils/recordExprToString';
import isStringLiteral from '../utils/isStringLiteral';
import objectExprToRecord from '../utils/objectExprToRecord';
import isObjectExpression from '../utils/isObjectExpression';
import parseExpression from '../utils/parseExpression';
import { ISerializer } from '../serialize/faces';

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

export function srzHref(dir: IDirectiveHref, opts: ISerializer): string {
  return dir.expr ? srzExpr(dir.expr, opts) : dir.content;
}

function srzExpr(
  {
    file, uri, query, hash,
  }: NonNullable<IDirectiveHref['expr']>,
  opts: ISerializer,
): string {
  const params: string[] = [];
  if (file) {
    params.push(`file:${stringify(file)}`);
  }
  if (uri) {
    params.push(`uri:${stringify(uri)}`);
  }
  if (query) {
    params.push(`query:${recordExprToString(query, opts)}`);
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
  const obj = parseExpression(content);
  if (obj.type !== 'ObjectExpression') {
    throw new SyntaxError('必须使用object表达式');
  }
  const {
    file, uri, query, hash,
  } = objectExprToRecord(obj);
  const out: IDirectiveHref['expr'] = {};
  if (file) {
    if (!isStringLiteral(file)) {
      throw new SyntaxError('file参数必须是字符串类型');
    }
    out.file = file.value;
  }
  if (uri) {
    if (!isStringLiteral(uri)) {
      throw new SyntaxError('uri参数必须是字符串类型');
    }
    out.uri = uri.value;
  }
  if (query) {
    if (!isObjectExpression(query)) {
      throw new SyntaxError('query参数必须使用object表达式');
    }
    out.query = objectExprToRecord(query);
  }
  if (hash) {
    if (!isStringLiteral(hash)) {
      throw new SyntaxError('hash参数必须使用字符串表达式');
    }
    out.hash = hash.value;
  }
  return out;
}
