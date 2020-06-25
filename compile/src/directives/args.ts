import { parse } from 'json5';
import {
  isArray,
} from 'lodash';
import { IContext } from '../parse/faces';
import { createCompilerError, ErrorCodes } from '../errors';
import parseTypeArgs from './utils/parseTypeArgs';
import { ITypeArg } from '../ast';
import compactTypeArgs from './utils/compactTypeArgs';
import serializeJson from '../utils/serializeJson';
import { ISerializer } from '../serialize/faces';

export default function processArgs(ctx: IContext, value: string): void {
  const { args, root } = ctx;
  if (!root) {
    throw createCompilerError(ErrorCodes.X_D_ARGS_NOT_IN_ROOT, ctx, value, null);
  }
  try {
    const arr = parse(value) as unknown;
    if (isArray(arr)) {
      arr.forEach((x) => {
        args.push(parseTypeArgs(x));
      });
    } else {
      throw createCompilerError(ErrorCodes.X_D_ARGS_ERR_SYNTAX, ctx, value, null);
    }
  } catch (err) {
    throw createCompilerError(ErrorCodes.X_D_ARGS_ERR_SYNTAX, ctx, value, err);
  }
}

export function srzArgs(args: ITypeArg[], opts: ISerializer): string {
  if (args.length === 0) { return ''; }
  if (!opts.compactJSON) {
    return serializeJson(args, opts);
  }
  const compact = compactTypeArgs(args);
  return serializeJson(compact, opts);
}
