export { parseFragment, parseHTML } from './parseHTML';
export interface IHTMLFullDoc {
  type: '#html-document'
  links: string[];
  // 插件SRC,和插件描述文件
  scripts: Array<{ src: string, schemaURL: string }>;
}
export interface IHTMLFragDoc {
  type: '#html-fragment'
  links: string[];
  args: Array<{ key: string, title?: string, desc?: string, type: string }>;
}
export type IHTMLNode = IHTMLNodeText | IHTMLNodeElement;
export interface IHTMLNodeText {
  type: 'text'
  value: string;
}

export interface IHTMLNodeElement {
  key: string;
  type: 'tag';
  disabled: boolean;
  tagName: string;
  // 静态属性
  attrs: Record<string, string>;
  /**
   * @example <img x-value='user.data.name'>
   */
  xAttrs: Record<string, string>;
  /**
   * 服务器指令
   * @example x-if, x-each, x-href, x-src
   */
  directives: {
    if?: IDirectiveIf;
    each?: IDirectiveEach;
    href?: IDirectiveHref;
    src?: IDirectiveSrc;
    text?: IDirectiveText;
  };
  /**
   * @example <div x-on-click-vars="{a:1,id:query.id}" x-on-click-alert="pt.alert('nickname')">
   * ===>   { 'click-vars': json, 'click-alert': 'pt.alert('nickname')' }
   */
  events: Record<string, string>;
  /**
   * 插件 x-plugin="pt.carousel({timer:12})"
   */
  plugins: Record<string, Record<string, any[]>>;
  nodes: IHTMLNode[];
}
/**
 * x-text="pt.format_date(user.timestamp, 'YYYY-MM-DD HH:mm')"
 */
interface IDirectiveText {
  value?: string;
}
interface IDirectiveIf {
  value: string;
  effective: boolean;
}
interface IDirectiveHref {
  value?: string;
  file?: string;
  query?: Record<string, string>;
  url?: string;
}
interface IDirectiveSrc {
  value?: string;
  url?: string;
  file?: string;
}
interface IDirectiveEach {
  item: string;
  stat: string;
  input: string;
  // 静态开发循环次数
  effective?: number;
}

export interface IHTMLAttribute {
  name: string;
  value: string;
}
