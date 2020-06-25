import { parse } from 'json5';
import {
  isArray, isString, isPlainObject,
} from 'lodash';
import { NodeTypes, ILink } from '../ast';
import isUndefinedOrString from '../utils/isUndefinedOrString';
import { createLink } from '../astUtils';
import { IContext } from '../parse/faces';
import { createCompilerError, ErrorCodes } from '../errors';
import serializeJson from '../utils/serializeJson';
import { ISerializer } from '../serialize/faces';

/**
 *
 * @example
 *  parseLinks("'5ee71f0159c61b62cdaaf7a3'")
 *  parseLinks("['5ee71f0159c61b62cdaaf7a3']")
 *  parseLinks(`
 *    [
 *      '5ee71f0159c61b62cdaaf7a3',
 *      {href:'http://www.baidu.com'},
 *      {
 *        file:'5ee71f0159c61b62cdaaf7a3',
 *        media:'screen and (min-width: 600px) and (max-width: 800px)'
 *      }
 *    ]`
 *  )
 */
export default function processLinks(ctx: IContext, value: string): void {
  const { root, links } = ctx;
  if (!root) {
    throw createCompilerError(ErrorCodes.X_D_LINKS_NOT_IN_ROOT, ctx, value, null);
  }
  value = value.trim();
  if (value[0] !== '[' && value[0] !== "'" && value[0] !== '"') {
    links.push(createLink(value));
    return;
  }
  try {
    const arr = parse(value) as unknown;
    if (isString(arr)) {
      links.push(createLink(arr));
    } else if (isArray(arr)) {
      arr.forEach((obj) => {
        if (isString(obj)) {
          links.push({ type: NodeTypes.LINK, file: obj });
          return;
        } if (isPlainObject(obj)) {
          const { file, href, media } = obj as Record<string, unknown>;
          if (isUndefinedOrString(file)
            && isUndefinedOrString(href)
            && isUndefinedOrString(media)) {
            if (file && href) {
              throw createCompilerError(ErrorCodes.X_D_LINKS_ERR_SYNTAX, ctx, value, '不能同时包含file和href两个参数');
            }
            links.push(createLink(file, href, media));
            return;
          }
        }
        throw createCompilerError(ErrorCodes.X_D_LINKS_ERR_SYNTAX, ctx, value, `无法解析引用${JSON.stringify(obj)}`);
      });
    } else {
      throw createCompilerError(ErrorCodes.X_D_LINKS_ERR_SYNTAX, ctx, value, '类型必须为string或者array');
    }
  } catch (err) {
    throw createCompilerError(ErrorCodes.X_D_LINKS_ERR_SYNTAX, ctx, value, err);
  }
}
export function srzLinks(links: ILink[], opts: ISerializer): string {
  const value = links.map(mapLinks).filter(Boolean);
  if (value.length === 0) { return ''; }
  if (value.length === 1 && isString(value[0])) {
    return value[0];
  }
  return serializeJson(value, opts);
}
function mapLinks({ media, href, file }: ILink) {
  if (!media && !href) { return file; }
  return { media, href, file };
}
