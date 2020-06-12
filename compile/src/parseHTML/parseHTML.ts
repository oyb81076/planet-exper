import parse5, {
  DefaultTreeDocument, DefaultTreeDocumentFragment, DefaultTreeNode, DefaultTreeTextNode, DefaultTreeElement,
  Attribute,
} from 'parse5';
import { IHTMLNode, IHTMLNodeText, IHTMLNodeElement, IHTMLAttribute } from '.';
import { keygen } from '../utils';
export function parseHTML(content: string) {
  const doc = parse5.parse(content) as DefaultTreeDocument;
}
function parseRoot(nodes: DefaultTreeNode[]): IHTMLNodeElement {
  const elements = nodes.filter((x): x is DefaultTreeElement => x.nodeName[0] !== '#')
  if (elements.length === 0) {
    return { key: keygen(), type: 'tag', tagName: 'div', disabled: false, attrs: [], nodes: [] }
  } else {// just allow first
    return parseElement(elements[0], true);
  }
}

export function parseFragment(content: string) {
  const doc = parse5.parseFragment(content) as DefaultTreeDocumentFragment;
}
const nonNull: (x: IHTMLNode | undefined) => x is IHTMLNode = Boolean as any;
function parseNodes(childNodes: DefaultTreeNode[]): IHTMLNode[] {
  return childNodes.map(parseNode).filter(nonNull);
}
function parseNode(node: DefaultTreeNode): IHTMLNode | undefined {
  if (node.nodeName === '#text') {
    return parseText(node as DefaultTreeTextNode)
  } else if (node.nodeName[0] !== '#') {
    return parseElement(node as DefaultTreeElement, false);
  }
  return undefined

}
function parseText(node: DefaultTreeTextNode): IHTMLNodeText {
  return { type: "text", value: node.value }
}
function parseElement(element: DefaultTreeElement, root: boolean): IHTMLNodeElement {
  const { tagName } = element;
  // const obj: IHTMLNodeElement = {
  //   tagName,
  // };
  // return obj;
}
function parseAttrs(attributes: Attribute[]): Pick<IHTMLNodeElement, 'attrs' | 'disabled' | 'key' | 'events' | 'xAttrs'> {
  const attrs: IHTMLAttribute[] = [];
  const binds: IHTMLAttribute[] = [];
  let key: string;
  const events: Record<string, string> = {};
  const directives: Record<string, string>
  attributes.forEach(({ name, value }) => {
    if (name === 'x-key') {
      key = value;
    } else if (name.startsWith('x-@')) {
      events[name.substr(3)] = value;
    } else if (name.startsWith('x-bind-')) {
      binds.push({ name: name.substr(7), value })
    }
  });
  return {};
}
