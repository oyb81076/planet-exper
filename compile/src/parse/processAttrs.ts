import { Attribute } from 'parse5';
import { IContext } from './faces';
import { createElementAttribute } from '../astUtils';
import processDirective from './processDirective';
// HTML5中有些节点才能使用某些attr, 编译期不需要做这种上下文检查
export default function processAttrs(
  ctx: IContext,
  attrs: Attribute[],
): void {
  const attrNodes = ctx.attrs;
  ctx.key = attrs.find((x) => x.name === 'x-key')?.value;
  attrs.forEach(({ name, value }) => {
    if (isElementAttrs(name)) {
      attrNodes.push(createElementAttribute(name, value));
    } else if (name !== 'x-key') {
      processDirective(ctx, name, value);
    }
  });
  ctx.attrName = undefined;
}

function isElementAttrs(name: string): boolean {
  return !name.startsWith('x-');
}
