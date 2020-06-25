import {
  ObjectExpression, Expression, SimpleLiteral, Identifier, MemberExpression,
} from 'estree';
// ast 动态节点部分以 content 为主, 用户修改
export enum NodeTypes {
  // 文档属性
  SCRIPT,
  LINK,
  JS_GLOBALS,

  ELEMENT,
  TEXT,

  ELEMENT_ATTRIBUTE,

  // 指令
  DIRECTIVE_EACH,
  DIRECTIVE_IF,
  DIRECTIVE_FIND_ONE,
  DIRECTIVE_FIND_MANY,
  DIRECTIVE_FIND_PAGE,
  DIRECTIVE_TEXT,
  DIRECTIVE_DISABLED,
  DIRECTIVE_JAVASCRIPT,
  DIRECTIVE_ON,
  DIRECTIVE_BIND,
  DIRECTIVE_SRC,
  DIRECTIVE_HREF,
  DIRECTIVE_CLASSES,
  DIRECTIVE_PAGINATION_OPTS,
  DIRECTIVE_PAGINATION_TO,
  DIRECTIVE_PAGINATION_LINKS,
}
interface INode {
  type: NodeTypes
}
interface IHTMLDocument {
  // 引入的模版(这个是ast分析的结果, 非常难以维护, 如果后续有任何的节点修改属性x-include都需要重新计算)
  links: ILink[]; // x-links
  scripts: IScript[]; // x-scripts
  jsGlobals: IJsGlobals; // x-js-globals
  element: IElementNode;
}
/**
 * 基础节点
 */
export interface IHTMLFullDocument extends IHTMLDocument {
  type: '#html-document';
}
export interface IHTMLFragDocument extends IHTMLDocument {
  type: '#html-fragment',
  args: Array<{ key: string, title?: string, desc?: string, type: IType }>;
}
export interface IScript extends INode {
  type: NodeTypes.SCRIPT;
  file?: string;
  src?: string;
}

export interface ILink extends INode {
  type: NodeTypes.LINK;
  file?: string;
  href?: string;
  media?: string;
}
export interface IJsGlobals extends INode {
  type: NodeTypes.JS_GLOBALS;
  expr?: Record<string, SimpleLiteral>;
  content: string;
}
export type IJsExpression = Identifier | MemberExpression | SimpleLiteral;

export type IChildNode = ITextNode | IElementNode;
export interface ITextNode extends INode {
  type: NodeTypes.TEXT;
  content: string;
}

export interface IElementNode extends INode {
  type: NodeTypes.ELEMENT;
  key: string;
  tagName: string;
  // 静态属性
  attrs: IElementAttribute[];
  /**
   * 因为非常常用, 为了加快客户端渲染速度, 这里就把 directives 用Record结构
   * 这里的object排序, 就等于渲染的排序
   */
  directives: IDirectives;
  nodes: IChildNode[];
}
export interface IDirectives {
  disabled?: IDirectiveDisabled;
  each?: IDirectiveEach;
  if?: IDirectiveIf;
  binds: IDirectiveBind[];
  src?: IDirectiveSrc;
  href?: IDirectiveHref;
  classes?: IDirectiveClasses;
  on: IElementOn[];
  javascript?: IDirectiveJavascript;
  text?: IDirectiveText;
  find?: IDirectiveFindOne | IDirectiveFindMany | IDirectiveFindPage;
  pagination?: IDirectivePaginationOpts | IDirectivePaginationTo | IDirectivePaginationLinks;
}

export enum ElementEvent {
  CLICK, DOUBLE_CLICK, MOUSE_DOWN, MOUSE_UP,
  MOUSE_ENTER, MOUSE_LEAVE, MOUSE_MOVE,
  FOCUS, BLUR,
  CHANGE, INPUT, SUBMIT,
  KEYDOWN, KEYUP, KEYPRESS,
  SCROLL,
  TOUCH_START, TOUCH_MOVE, TOUCH_END, TOUCH_CANCEL,
  LOAD, ERROR
}

export enum ElementEventNS {
  VARS, ASSIGNMENT, OPEN, ALERT, SCROLL_TO, VISIBLE, CLASS, CSS, ATTRS, DATASET, CONTENT,
}

export interface IElementOn {
  type: NodeTypes.DIRECTIVE_ON;
  event: ElementEvent; // 事件名称
  ns: ElementEventNS;
  rawName?: string; // x-on-click-name
  rawValue: string;
}

export interface IElementAttribute {
  type: NodeTypes.ELEMENT_ATTRIBUTE;
  name: string;
  value: string;
}

export interface IDirectiveDisabled extends INode {
  type: NodeTypes.DIRECTIVE_DISABLED;
}

/**
 * <input x-value="$item.data.name">
 */
export interface IDirectiveBind extends INode {
  type: NodeTypes.DIRECTIVE_BIND;
  name: string;
  expr?: { value?: Expression };
  value: string;
}

export interface IDirectiveSrc extends INode {
  type: NodeTypes.DIRECTIVE_SRC;
  expr?: {
    file?: string;
  }
  content: string;
}

export interface IDirectiveHref extends INode {
  type: NodeTypes.DIRECTIVE_HREF;
  expr?: {
    file?: string;
    uri?: string;
    query?: Record<string, Expression>;
    hash?: string;
  }
  content: string;
}

export interface IDirectiveClasses extends INode {
  type: NodeTypes.DIRECTIVE_CLASSES;
  expr?: Record<string, Expression>;
  content: string;
}
export interface IDirectiveJavascript extends INode {
  type: NodeTypes.DIRECTIVE_JAVASCRIPT;
  content: string;
}

export interface IDirectiveText extends INode {
  type: NodeTypes.DIRECTIVE_TEXT;
  expr?: { value?: Expression };
  content: string;
}
export interface IDirectiveFindPage extends INode {
  type: NodeTypes.DIRECTIVE_FIND_PAGE;
  input: {
    expr?: {
      tb: string;
      params: Record<string, IJsExpression>;
      defaultSize: number;
    }
    content: string;
  },
  output: {
    expr?: {
      total?: string;
      rows?: string;
      size?: string;
      index?: string;
    };
    content: string;
  };
  content: string;
}
export interface IDirectiveFindOne extends INode {
  type: NodeTypes.DIRECTIVE_FIND_ONE;
  input: {
    expr?: {
      tb: string;
      id: IJsExpression;
    }
    content: string;
  },
  output: {
    expr: string
    content: string;
  };
  content: string;
}

export interface IDirectiveFindMany extends INode {
  type: NodeTypes.DIRECTIVE_FIND_ONE;
  input: {
    expr?: {
      tb: string;
      params: Record<string, IJsExpression>;
      limit: number;
    }
    content: string;
  },
  output: {
    expr: string
    content: string;
  };
  content: string;
}

export interface IDirectivePaginationOpts {
  type: NodeTypes.DIRECTIVE_PAGINATION_OPTS;
  input: {
    expr?: {
      index: IJsExpression;
      size: IJsExpression;
      total: IJsExpression;
    }
  };
  output: {
    expr: string;
    content: string;
  }
  mock: {
    expr?: {
      index: number;
      size: number;
      total: number;
    }
    content: string;
  }
}

export interface IDirectivePaginationTo {
  type: NodeTypes.DIRECTIVE_PAGINATION_TO;
  input: {
    expr?: {
      opts: Identifier;
      to: 'first' | 'prev' | 'next' | 'last';
    }
  };
  output: {
    expr?: {
      active?: string;
      url?: string;
    };
    content: string;
  }
  mock: {
    expr?: {
      index: number;
      size: number;
      total: number;
    }
    content: string;
  }
}

export interface IDirectivePaginationLinks {
  type: NodeTypes.DIRECTIVE_PAGINATION_LINKS;
  input: {
    expr?: {
      opts: Identifier;
      size: number;
      border: number;
    }
  };
  output: {
    expr?: {
      starts: string;
      links: string;
      ends: string;
    };
    content: string;
  }
}

export interface IDirectiveIf extends INode {
  type: NodeTypes.DIRECTIVE_IF;
  input: {
    expr?: { test?: Expression };
    content: string;
  };
  mock: {
    expr: boolean;
    content: string;
  };
  content: string;
}

export interface IDirectiveEach extends INode {
  type: NodeTypes.DIRECTIVE_EACH;
  input: {
    expr?: {
      array?: Identifier | MemberExpression;
    }
    content: string;
  };
  output: {
    expr?: {
      item?: string;
      stat?: string;
    }
    content: string;
  };
  // 静态开发循环次数
  mock: {
    expr?: {
      length?: number;
    }
    content: string;
  };
  content: string;
}
export interface ITypeArg {
  key: string;
  title?: string;
  desc?: string;
  type: IType;
}
/**
 * 类型系统, 因为最终序列化到文件中, 为了扩展性, 所以使用string, 所以这里就用 string 而不是 symbol
 */
export enum TypeKinds {
  NUMBER = 'number',
  STRING = 'string',
  DATE = 'date',
  BOOLEAN = 'boolean',
  NULL = 'null',
  ARRAY = 'array',
  RECORD = 'record',
}

export type IType = ITypeBase | ITypeArray | ITypeRecord;

export type ITypeBase =
  | ITypeNumber
  | ITypeString
  | ITypeDate
  | ITypeBool
  | ITypeNull;

export interface ITypeNumber {
  kind: TypeKinds.NUMBER;
  defaults?: number;
}

export interface ITypeString {
  kind: TypeKinds.STRING;
  required?: boolean;
  defaults?: string;
}

export interface ITypeDate {
  kind: TypeKinds.DATE;
  defaults?: Date;
}

export interface ITypeBool {
  kind: TypeKinds.BOOLEAN;
  defaults?: boolean;
}

export interface ITypeNull {
  kind: TypeKinds.NULL;
}

export interface ITypeArray {
  kind: TypeKinds.ARRAY;
  type: IType;
  defaults?: unknown[];
}

export interface ITypeRecord {
  kind: TypeKinds.RECORD;
  props: Array<{ key: string, type: IType }>;
  defaults?: Record<string, unknown>;
}
