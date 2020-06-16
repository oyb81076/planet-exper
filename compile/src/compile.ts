import { parse, DefaultTreeElement, parseFragment } from 'parse5';
import { IHTMLFullDocument, IHTMLFragDocument } from './ast';
import { parseRoot } from './parse';

interface IConfig {
  parseExpression?: boolean;
  files?: Record<string, string>;
}

export function compile(content: string, fragment: false, cfg?: IConfig): IHTMLFullDocument;
export function compile(content: string, fragment: true, cfg?: IConfig): IHTMLFragDocument;
export function compile(
  content: string,
  fragment: boolean,
  config: IConfig = {},
): IHTMLFullDocument | IHTMLFragDocument {
  if (fragment) {
    return compileFragment(content, config);
  }
  // const doc = parse(content) as DefaultTreeDocument;
  return compileFull(content, config);
}

function compileFull(content: string, cfg: IConfig): IHTMLFullDocument {
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
function compileFragment(content: string, cfg: IConfig): IHTMLFragDocument {
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
