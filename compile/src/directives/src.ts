import json5 from 'json5';
import { isPlainObject, isString } from 'lodash';
import { IContext } from '../parse/faces';
import { createDirectiveSrc } from '../astUtils';
import { IDirectiveSrc } from '../ast';
import { ErrorCodes, createCompilerError } from '../errors';

/**
 *
 * @example
 *  <img x-src="{file:'5ee71f0159c61b62cdaaf7a3'}" />
 *  <img x-src="{src:'https://www.baidu.com/favicon.ico'}" />
 */
export default function processSrc(ctx: IContext, content: string): void {
  try {
    const expr = ctx.parseExpression ? parseExpr(content) : undefined;
    ctx.directives.src = createDirectiveSrc(content, expr);
  } catch (err) {
    throw createCompilerError(ErrorCodes.X_D_SRC_ERR_SYNTAX, ctx, content, err);
  }
}

export function computeSrcExpr(
  input: IDirectiveSrc,
): NonNullable<IDirectiveSrc['expr']> {
  return input.expr || (input.expr = parseExpr(input.content));
}

export function srzSrc(value: IDirectiveSrc): string {
  return value.expr ? srzExpr(value.expr) : value.content;
}

export function srzExpr({ file }: NonNullable<IDirectiveSrc['expr']>): string {
  if (!file) { return ''; }
  return file;
}

function parseExpr(content: string): NonNullable<IDirectiveSrc['expr']> {
  if (content.length === 0) {
    return {};
  }
  if (content[0] !== '{') {
    return { file: content };
  }
  const obj = json5.parse(content) as unknown;
  if (isPlainObject(obj)) {
    const { file } = obj as Record<string, unknown>;
    if (isString(file)) {
      return { file: content };
    }
  }
  throw new SyntaxError('必须使用Object表达式');
}
