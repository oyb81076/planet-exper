import { IContext } from './faces';
import processEach from '../directives/each';
import processLinks from '../directives/links';
import processScripts from '../directives/scripts';
import processIf from '../directives/if';
import processDisabled from '../directives/disabled';
import processJavascript from '../directives/javascript';
import processSrc from '../directives/src';
import processHref from '../directives/href';
import processClasses from '../directives/classes';
import processText from '../directives/text';
import processBind from '../directives/bind';
import { createCompilerError, ErrorCodes } from '../errors';
import processOn from '../directives/on';

export default function processDirective(
  ctx: IContext,
  name: string,
  value: string,
): void {
  ctx.attrName = name;
  switch (name) {
    case 'x-each': return processEach(ctx, value);
    case 'x-if': return processIf(ctx, value);
    case 'x-links': return processLinks(ctx, value);
    case 'x-scripts': return processScripts(ctx, value);
    case 'x-disabled': return processDisabled(ctx);
    case 'x-javascript': return processJavascript(ctx, value);
    case 'x-src': return processSrc(ctx, value);
    case 'x-href': return processHref(ctx, value);
    case 'x-classes': return processClasses(ctx, value);
    case 'x-text': return processText(ctx, value);
    default:
      if (name.startsWith('x--')) {
        processBind(ctx, name, value);
      } else if (name.startsWith('x-on-')) {
        processOn(ctx, name, value);
      } else {
        throw createCompilerError(ErrorCodes.X_D_UNKNOWN, ctx, name, `未知指令${name}`);
      }
  }
}
