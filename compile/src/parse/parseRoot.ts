import { DefaultTreeElement, DefaultTreeNode, DefaultTreeTextNode } from 'parse5';
import {
  IElementNode, IChildNode, ITextNode, ILink, IScript, IJsGlobals, ITypeArg,
} from '../ast';
import { createElement, createText, createJsGlobals } from '../astUtils';
import { IContext, IConfig } from './faces';
import processAttrs from './processAttrs';

export default function parseRoot(node: DefaultTreeElement, config: IConfig): {
  element: IElementNode;
  links: ILink[];
  includes: string[];
  scripts: IScript[];
  args: ITypeArg[];
  jsGlobals: IJsGlobals;
} {
  const ctx: IContext = {
    root: true,
    trimSpace: true,
    nodeName: node.nodeName,
    parseExpression: config.parseExpression === true,
    attrs: [],
    directives: {
      binds: [],
      on: [],
    },
    includes: [],
    links: [],
    scripts: [],
    args: [],
  };
  shouldTrim(ctx);
  processAttrs(ctx, node.attrs);
  const { key, attrs, directives } = ctx;
  const nodes = parseNodes(ctx, node.childNodes);
  const element = createElement(key, node.tagName, attrs, directives, nodes);
  return {
    links: ctx.links,
    includes: ctx.includes,
    scripts: ctx.scripts,
    jsGlobals: ctx.jsGlobals || createJsGlobals(''),
    args: ctx.args,
    element,
  };
}

function parseNodes(ctx: IContext, nodes: DefaultTreeNode[]): IChildNode[] {
  if (nodes.length === 0) { return []; }
  const out: IChildNode[] = [];
  nodes.forEach((node) => {
    if (isText(node)) {
      const text = parseText(ctx, node);
      if (text) out.push(text);
    } else if (isElement(node)) {
      out.push(parseElement(ctx, node));
    }
  });
  return out;
}

function shouldTrim(ctx: IContext) {
  if (ctx.trimSpace && ctx.nodeName === 'pre') {
    ctx.trimSpace = false;
  }
}
function parseText(ctx: IContext, { value }: DefaultTreeTextNode): ITextNode | undefined {
  ctx.key = undefined;
  if (ctx.trimSpace) {
    value = trim(value);
  }
  if (!value) { return undefined; }
  return createText(value);
}
// 去空格的时候不要把\u00A0(nbsp)给去掉, 所以不使用String.prototype.trim操作
function trim(val: string) {
  return val.replace(/[ \r\t\n]/g, '');
}
function parseElement(ctx: IContext, node: DefaultTreeElement) {
  ctx.attrs = [];
  ctx.directives = {
    binds: [],
    on: [],
  };
  shouldTrim(ctx);
  processAttrs(ctx, node.attrs);
  const { key, attrs, directives } = ctx;
  const nodes = parseNodes(ctx, node.childNodes);
  return createElement(key, node.tagName, attrs, directives, nodes);
}
function isText(node: DefaultTreeNode): node is DefaultTreeTextNode {
  return node.nodeName === '#text';
}
function isElement(node: DefaultTreeNode): node is DefaultTreeElement {
  return node.nodeName[0] !== '#';
}
