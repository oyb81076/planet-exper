import {
  ILink, IScript, IJsGlobals, IDirectives, IElementAttribute, ITypeArgs,
} from '../ast';

export interface IConfig {
  parseExpression?: boolean;
  files?: Record<string, string>;
}

export interface IContext {
  root: boolean;
  // 当前节点的key
  key?: string;
  nodeName: string;
  // 当前的attr名称
  attrName?: string;
  // 是否 parseExpr
  parseExpression: boolean;
  trimSpace: boolean;
  attrs: IElementAttribute[];
  directives: IDirectives;
  includes: string[]; // 加载的 include
  scripts: IScript[];
  links: ILink[];
  jsGlobals?: IJsGlobals;
  args: ITypeArgs[];
}
