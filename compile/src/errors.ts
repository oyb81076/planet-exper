import { isString } from 'lodash';

export class CompilerError extends SyntaxError {
  constructor(
    public code: ErrorCodes,
    public key: string | undefined,
    public tagName: string | undefined,
    public content: string,
    public cause: Error | string | null,
  ) {
    // eslint-disable-next-line no-nested-ternary
    super(cause ? (isString(cause) ? cause : cause.message) : errorMessages[code]);
  }
}
interface IErrCtx {
  key?: string;
  tagName?: string;
}
export function createCompilerError(
  code: ErrorCodes,
  ctx: IErrCtx, content: string, error: Error | string | null,
): CompilerError {
  if (error instanceof CompilerError) {
    return error;
  }
  return new CompilerError(code, ctx.key, ctx.tagName, content, error);
}

export enum ErrorCodes {
  X_D_UNKNOWN,
  X_D_SRC_ERR_SYNTAX,
  X_D_HREF_ERR_SYNTAX,
  X_D_EACH_NO_INPUT,
  X_D_EACH_ERR_SYNTAX,
  X_D_IF_ERR_SYNTAX,

  X_D_LINKS_NOT_IN_ROOT,
  X_D_LINKS_ERR_SYNTAX,

  X_D_SCRIPTS_NOT_IN_ROOT,
  X_D_SCRIPTS_ERR_SYNTAX,

  X_D_CLASSES_SYNTAX,
  X_D_TEXT_SYNTAX,
  X_D_BIND_SYNTAX,
}
export const errorMessages: Record<ErrorCodes, string> = {
  [ErrorCodes.X_D_UNKNOWN]: '未知指令',
  [ErrorCodes.X_D_SRC_ERR_SYNTAX]: `x-src语法错误,正确的例子:
  x-src=""
  x-src="5ee4443700eef44a9041f9f0"`,
  [ErrorCodes.X_D_HREF_ERR_SYNTAX]: `x-href语法错误,正确的例子:
  x-href=""
  x-href="5ee4443700eef44a9041f9f0"
  x-href="{file:'5ee4443700eef44a9041f9f0',query:{id:$item.data.id},hash:'this_is_hash'}"
  x-href="{pathname:'/',query:{id:$item.data.id},hash:'this_is_hash'}"
  x-href="{query:{id:$item.data.id},hash:'this_is_hash'}"`,
  [ErrorCodes.X_D_EACH_NO_INPUT]: 'x-each指令缺少输入参数',
  [ErrorCodes.X_D_EACH_ERR_SYNTAX]: `x-each指令语法错误,正确的例子:
  x-each="{array:$array}:{item:$item};{length:10}"`,
  [ErrorCodes.X_D_IF_ERR_SYNTAX]: `if指令语法错误,正确的例子:
  x-if=""
  x-if="a>1;true"`,
  [ErrorCodes.X_D_LINKS_NOT_IN_ROOT]: 'x-links指令只能出现在根节点',
  [ErrorCodes.X_D_LINKS_ERR_SYNTAX]: `x-links指令语法错误,正确的例子:
  x-links="5ee4443700eef44a9041f9f0"
  x-links="[
    {href:'http://cdn.cn/file.css',media:'screen and (min-width: 600px) and (max-width: 800px)'},
    {href:'https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/4.5.0/css/bootstrap-grid.css'},
    '5ee4443700eef44a9041f9f0'
    {file:'5ee4443700eef44a9041f9f1'},
  ]"
  `,
  [ErrorCodes.X_D_SCRIPTS_NOT_IN_ROOT]: 'x-scripts只能在跟节点使用',
  [ErrorCodes.X_D_SCRIPTS_ERR_SYNTAX]: `x-scripts语法错误,正确的例子
  x-scripts="5ee4443700eef44a9041f9f0"
  x-scripts="['5ee4443700eef44a9041f9f0']"
  x-scripts="[
    '5ee4443700eef44a9041f9f0',
    {src:'https://cdn.bootcdn.net/ajax/libs/jquery/3.5.1/jquery.js'},
    {file:'5ee4443700eef44a9041f9f0'},
  ]"`,
  [ErrorCodes.X_D_CLASSES_SYNTAX]: `x-classes指令语法错误,正确的例子:
  <div x-classes="{cls0:$val,cls1:$val}">`,
  [ErrorCodes.X_D_TEXT_SYNTAX]: `x-text指令语法错误,正确的例子:
  <div x-text="$val">`,
  [ErrorCodes.X_D_BIND_SYNTAX]: `x--指令语法错误,正确的例子:
  <input x--value="$value">
  <input x--value="$value+3">
  `,
};
