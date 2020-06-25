import { parse } from 'json5';
import {
  isArray, isString, isPlainObject,
} from 'lodash';
import { createScript } from '../astUtils';
import { IContext } from '../parse/faces';
import { createCompilerError, ErrorCodes } from '../errors';
import { ISerializer } from '../serialize/faces';
import { IScript } from '../ast';
import serializeJson from '../utils/serializeJson';

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
    } else {
      throw createCompilerError(ErrorCodes.X_D_SCRIPTS_ERR_SYNTAX, ctx, value, null);
    }
  } catch (err) {
    throw createCompilerError(ErrorCodes.X_D_SCRIPTS_ERR_SYNTAX, ctx, value, err);
  }
}

export function srzScripts(scripts: IScript[], opts: ISerializer): string {
  if (scripts.length === 0) { return ''; }
  const value = scripts
    .map(({ src, file }) => (file || (src ? { src } : undefined)))
    .filter(Boolean);
  if (value.length === 0) { return ''; }
  if (value.length === 1 && isString(value[0])) {
    return value[0];
  }
  return serializeJson(value, opts);
}
