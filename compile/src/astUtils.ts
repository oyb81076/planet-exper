import {
  IElementAttribute,
  IDirectives,
  IElementNode,
  NodeTypes,
  IChildNode,
  ILink,
  IScript,
  IDirectiveDisabled,
  IDirectiveBind,
  IDirectiveHref,
  IDirectiveSrc,
  ITextNode,
  IJsGlobals,
  IDirectiveText,
  IDirectiveClasses,
} from './ast';
import { keygen } from './utils';

export function createElement(
  key: string | undefined,
  tagName: string,
  attrs: IElementAttribute[],
  directives: IDirectives,
  nodes: IChildNode[],
): IElementNode {
  return {
    type: NodeTypes.ELEMENT,
    key: key || keygen(),
    tagName,
    attrs,
    directives,
    nodes,
  };
}

export function createJsGlobals(content: string): IJsGlobals {
  return { type: NodeTypes.JS_GLOBALS, content };
}

export function createText(content: string): ITextNode {
  return { type: NodeTypes.TEXT, content };
}

export function createLink(file?: string, href?: string, media?: string): ILink {
  return {
    type: NodeTypes.LINK,
    file,
    href,
    media,
  };
}

export function createScript(file?: string, src?: string): IScript {
  if (file && src) { throw new SyntaxError('脚本不能同时拥有file,src属性'); }
  return {
    type: NodeTypes.SCRIPT,
    file,
    src,
  };
}

export function createDisabled(): IDirectiveDisabled {
  return { type: NodeTypes.DIRECTIVE_DISABLED };
}
export function createElementAttribute(
  name: string,
  value: string,
): IElementAttribute {
  return { type: NodeTypes.ELEMENT_ATTRIBUTE, name, value };
}

export function createDirectiveBind(
  name: string,
  value: string,
  expr?: IDirectiveBind['expr'],
): IDirectiveBind {
  return {
    type: NodeTypes.DIRECTIVE_BIND, name, value, expr,
  };
}

export function createDirectiveHref(
  content: string,
  expr?: IDirectiveHref['expr'],
): IDirectiveHref {
  return { type: NodeTypes.DIRECTIVE_HREF, content, expr };
}

export function createDirectiveSrc(
  content: string,
  expr?: IDirectiveSrc['expr'],
): IDirectiveSrc {
  return { type: NodeTypes.DIRECTIVE_SRC, content, expr };
}

export function createDirectiveText(
  content: string,
  expr?: IDirectiveText['expr'],
): IDirectiveText {
  return { type: NodeTypes.DIRECTIVE_TEXT, content, expr };
}

export function createDirectiveClasses(
  content: string,
  expr?: IDirectiveClasses['expr'],
): IDirectiveClasses {
  return { type: NodeTypes.DIRECTIVE_CLASSES, content, expr };
}
