import { parse } from 'json5';
import {
  isArray, isString, isPlainObject,
} from 'lodash';
import { createScript } from '../astUtils';
import { IContext } from '../parse/faces';
import { createCompilerError, ErrorCodes } from '../errors';

/**
 *
 * @example
 *  parseLinks("'5ee71f0159c61b62cdaaf7a3'")
 *  parseLinks("['5ee71f0159c61b62cdaaf7a3']")
 *  parseLinks(`
 *    [
 *      '5ee71f0159c61b62cdaaf7a3',
 *      {src:'http://www.baidu.com'},
 *      {file: '5ee71f0159c61b62cdaaf7a3'}
 *    ]`
 *  )
 */
export default function processScripts(ctx: IContext, value: string): void {
  const { scripts, root } = ctx;
  if (!root) {
    throw createCompilerError(ErrorCodes.X_D_SCRIPTS_NOT_IN_ROOT, ctx, value, null);
  }
  try {
    const arr = parse(value) as unknown;
    if (isString(arr)) {
      scripts.push(createScript(arr));
    } else if (isArray(arr)) {
      arr.forEach((obj) => {
        if (isString(obj)) {
          scripts.push(createScript(obj));
        } if (isPlainObject(obj)) {
          const { file, src } = obj as Record<string, unknown>;
          if (isString(file)) {
            scripts.push(createScript(file));
          } else if (isString(src)) {
            scripts.push(createScript(undefined, src));
          } else {
            scripts.push(createScript());
          }
        }
        throw createCompilerError(ErrorCodes.X_D_SCRIPTS_ERR_SYNTAX, ctx, value, null);
      });
    }
    throw createCompilerError(ErrorCodes.X_D_SCRIPTS_ERR_SYNTAX, ctx, value, null);
  } catch (err) {
    throw createCompilerError(ErrorCodes.X_D_SCRIPTS_ERR_SYNTAX, ctx, value, err);
  }
}
