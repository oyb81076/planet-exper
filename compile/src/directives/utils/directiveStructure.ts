/* eslint-disable no-restricted-syntax */
/* eslint-disable no-labels */
const RE_SPACE = /\s/;

/** 序列化指令结构 */
export function serializeDirectiveStructure(
  input: string | undefined,
  output: string | undefined,
  mock?: string,
): string {
  let out = '';
  if (input) {
    out += input;
  }
  if (output && output !== '{}') {
    out += `::${output}`;
  }
  if (mock) {
    out += `;${mock}`;
  }
  return out;
}
/**
 * 解析指令结构
 * "{array:$xxx};{}"
 * "{array:$xxx};{};"
 * "{array:$xxx}::{item};{}"
 * "{array:$xxx}::{item:$item};{}"
 * "{array:$xxx}::$output;{}"
 * @param content
 */
interface IContext { content: string, offset: number, length: number }
export default function parseDirectiveStructure(
  content: string,
): { input: string; output: string; mock: string } {
  const out = { input: '', output: '', mock: '' };
  const ctx: IContext = { content, offset: 0, length: content.length };
  skipSpace(ctx);
  out.input = getInputContent(ctx);
  if (content[ctx.offset] === ':' && content[ctx.offset + 1] === ':') {
    ctx.offset += 2;
    skipSpace(ctx);
    out.output = getOutputObjectContent(ctx);
    if (out.output && /\{\s*\}/.test(out.output)) {
      out.output = '';
    }
    skipSpace(ctx);
  }
  if (content[ctx.offset] === ';') {
    ctx.offset += 1;
    out.mock = content.substr(ctx.offset).trim();
  } else if (ctx.length !== ctx.offset) {
    throw new SyntaxError('指令语法错误');
  }
  return out;
}

function getOutputObjectContent(ctx: IContext): string {
  const { content, offset, length } = ctx;
  if (content[offset] === '{') {
    const end = content.indexOf('}', offset + 1);
    if (end === -1) {
      throw new SyntaxError(`无法解析出outputObject${content.substr(offset)}`);
    }
    ctx.offset = end + 1;
    return content.substring(offset, ctx.offset);
  }
  if (content[offset] === '$') {
    let i = offset + 1;
    while (i < length && /[a-zA-Z0-9_]/.test(content[i])) {
      i += 1;
    }
    ctx.offset = i;
    return content.substring(offset, ctx.offset);
  }
  throw new SyntaxError('输出指令格式错误');
}
function skipSpace(ctx: IContext) {
  while (ctx.offset < ctx.length && RE_SPACE.test(ctx.content[ctx.offset])) {
    ctx.offset += 1;
  }
}
/**
 * 不会严格的按照语法来解析
 */
function getInputContent(ctx: IContext) {
  const { content, offset, length } = ctx;
  const char0 = content[offset];
  if (char0 === ';') { return ''; }
  let colon = 0;
  let quotation = '';
  let i = offset;
  for (; i < length; i += 1) {
    const char = content[i];
    if (quotation) {
      if (char === quotation) {
        quotation = '';
      } else {
        quotation = char;
      }
    } else if (char === '"' || char === "'") {
      quotation = char;
    } else if (char === ':') {
      if (colon === 0) {
        colon += 1;
      } else if (colon === 1) {
        return content.substring(offset, ctx.offset = i - 1).trim();
      }
    } else if (char === ';') {
      return content.substring(offset, ctx.offset = i).trim();
    } else {
      colon = 0;
    }
  }
  return content.substring(offset, ctx.offset = length).trim();
}
