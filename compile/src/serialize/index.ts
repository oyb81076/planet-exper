import {
  IHTMLFragDocument, IHTMLFullDocument, IChildNode, NodeTypes,
} from '../ast';
import Serializer from './Serializer';
import type { ISerializeConfig } from './faces';

export default function serialize(
  doc: IHTMLFragDocument | IHTMLFullDocument,
  config: ISerializeConfig = {},
): string {
  const { element } = doc;
  const ctx = new Serializer(config);
  if (doc.type === '#html-document') {
    ctx.doctype();
  }
  ctx.openTag(element.tagName);
  ctx.xKey(element.key);
  if (doc.type === '#html-fragment') {
    ctx.xArgs(doc.args);
  }
  ctx.xLinks(doc.links);
  ctx.xScripts(doc.scripts);
  ctx.xJsGlobals(doc.jsGlobals);
  ctx.attrs(element.attrs);
  ctx.directives(element.directives);
  writeNodes(ctx, element.nodes);
  ctx.closeTag();
  return ctx.html;
}

// 这里使用去递归的方式调用
function writeNodes(ctx: Serializer, nodes: IChildNode[]) {
  const undo = createUndo(nodes);
  let index = undo.length - 1;
  while (index !== -1) {
    const node = undo[index];
    if (node.opened) {
      ctx.closeTag();
      undo.pop();
      index -= 1;
    } else if (node.element.type === NodeTypes.TEXT) {
      ctx.text(node.element.content);
      undo.pop();
      index -= 1;
    } else {
      node.opened = true;
      const { element } = node;
      ctx.openTag(element.tagName);
      ctx.xKey(element.key);
      ctx.attrs(element.attrs);
      ctx.directives(element.directives);
      const nodesLength = element.nodes.length;
      if (!nodesLength) {
        ctx.closeTag();
        undo.pop();
        index -= 1;
      } else if (nodesLength === 1 && element.nodes[0].type === NodeTypes.TEXT) {
        ctx.inlineText(element.nodes[0].content);
        ctx.closeTag();
        undo.pop();
        index -= 1;
      } else {
        undo.push(...createUndo(element.nodes));
        index += element.nodes.length;
      }
    }
  }
}
function createUndo(nodes: IChildNode[]) {
  return nodes.slice(0).reverse().map((x) => ({ element: x, opened: false }));
}
