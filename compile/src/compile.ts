import { parse, DefaultTreeElement, parseFragment } from 'parse5';
import { IHTMLFullDocument, IHTMLFragDocument } from './ast';
import { parseRoot } from './parse';

interface IConfig {
  parseExpression?: boolean;
  files?: Record<string, string>;
}

export function compileFull(content: string, cfg: IConfig = {}): IHTMLFullDocument {
  const doc = parse(content) as DefaultTreeElement;
  const node = doc.childNodes.find((x): x is DefaultTreeElement => x.nodeName === 'html');
  if (!node) {
    throw new Error('未发现<html>节点');
  }
  const {
    scripts, links, jsGlobals, element,
  } = parseRoot(node, cfg);
  return {
    type: '#html-document', scripts, links, jsGlobals, element,
  };
}
export function compileFragment(content: string, cfg: IConfig = {}): IHTMLFragDocument {
  const doc = parseFragment(content) as DefaultTreeElement;
  const node = doc.childNodes.find((x): x is DefaultTreeElement => x.nodeName[0] !== '#');
  if (!node) {
    throw new Error('未发现根节点');
  }
  const {
    scripts, links, jsGlobals, element, args,
  } = parseRoot(node, cfg);
  return {
    type: '#html-fragment', scripts, links, args, jsGlobals, element,
  };
}
