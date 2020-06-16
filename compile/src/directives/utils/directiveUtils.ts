import {
  Expression, Pattern, ObjectExpression, Property, SpreadElement,
} from 'estree';
import { parseExpressionAt } from 'acorn';
import { fromPairs } from 'lodash';
import { generate } from 'escodegen';
import { isStringLiteral } from '../../utils/esUtils';

const RE_SPACE = /\s/;
interface IContext { content: string, offset: number, length: number }
interface IInputOutputResult { input: string; output: string; mock: string }
export function srzInputOutput(
  input: string | undefined,
  output: string | undefined,
  mock?: string,
): string {
  let out = '';
  if (input) {
    out += input;
  }
  if (output && output !== '{}') {
    out += `:${output}`;
  }
  if (mock) {
    mock += `;${mock}`;
  }
  return out;
}
/**
 * "{array:$xxx};{};"
 * "{array:$xxx};{};"
 * "{array:$xxx}:{item};{}"
 * "{array:$xxx}:{item:$item};{};"
 * "{array:$xxx}:$output:{};"
 * @param content
 */
export function parseInputOutput(content: string): IInputOutputResult {
  const out: IInputOutputResult = { input: '', output: '', mock: '' };
  const ctx: IContext = { content, offset: 0, length: content.length };
  skipSpace(ctx);
  out.input = getInputContent(ctx);
  skipSpace(ctx);
  if (content[ctx.offset] === ':') {
    ctx.offset += 1;
    skipSpace(ctx);
    out.output = getOutputObjectContent(ctx);
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
// {a:[],b:{}}, $users.data.0
function getInputContent(ctx: IContext) {
  const { content, offset, length } = ctx;
  if (content[offset] === '$') {
    let i = offset + 1;
    while (i < length && /[a-zA-Z0-9_.[\]'"]/.test(content[i])) {
      i += 1;
    }
    ctx.offset = i;
    return content.substring(offset, ctx.offset);
  }
  if (content[offset] === '{') {
    let block = 1;
    let str = '';
    for (let i = offset + 1; i < length; i += 1) {
      if (str) {
        if (content[i] === str) {
          str = '';
        }
      } else {
        const s = content[i];
        switch (s) {
          case '"':
          case "'":
            str = s;
            break;
          case '{':
            block += 1;
            break;
          case '}':
            block -= 1;
            if (block === 0) {
              ctx.offset = i + 1;
              return content.substring(offset, ctx.offset);
            }
            break;
          default:
        }
      }
    }
  }
  throw new SyntaxError(`无法解析inputObject表达式${content}`);
}
// {a:$item,b:2}:xxx
// {array:$user}
export function parseInputObjectExpression(content: string): Record<string, Expression> {
  if (content[0] !== '{' || content[content.length - 1] !== '}') {
    throw new SyntaxError(`必须以{}包裹${content}`);
  }
  const expr = parseExpressionAt(content, 0, {}) as Expression;
  if (expr.type !== 'ObjectExpression') {
    throw new SyntaxError('无法解析为Object表达式');
  }
  return fromPairs(expr.properties.map(mapObjectExpression));
}

export function objectToRecord(expr: ObjectExpression): Record<string, Expression> {
  return fromPairs(expr.properties.map(mapObjectExpression));
}
export function recordExprToString(record: Record<string, Expression>): string {
  let out = '{';
  Object.entries(record).forEach(([key, expr]) => {
    if (out !== '{') {
      out += ',';
    }
    if (isShortKey(key)) {
      out += key;
    } else {
      out += `'${key.replace(/'/g, "\\'")}'`;
    }
    out += ':';
    out += generate(expr);
  });
  out += '}';
  return out;
}
const SHORT_KEY_RE = /^[a-zA-Z0-9_$]$/;
function isShortKey(v: string) {
  return SHORT_KEY_RE.test(v);
}

function mapObjectExpression(prop: Property | SpreadElement): [string, Expression] {
  if (prop.type !== 'Property') {
    throw new SyntaxError('不能使用...表达式');
  }
  if (prop.computed) {
    throw new SyntaxError('不能使用computed表达式');
  }
  let key: string;
  if (prop.key.type === 'Identifier') {
    key = prop.key.name;
  } else if (isStringLiteral(prop.key)) {
    key = prop.key.value;
  } else {
    throw new SyntaxError('object表达式中的key语法错误');
  }
  if (!isExpression(prop.value)) {
    throw new SyntaxError('不是正确的');
  }
  return [key, prop.value];
}
function isExpression(expr: Expression | Pattern): expr is Expression {
  return expr.type !== 'ObjectPattern'
    && expr.type !== 'ArrayPattern'
    && expr.type !== 'RestElement'
    && expr.type !== 'AssignmentPattern';
}
export function parseOutput(content: string): Record<string, string> | string {
  if (content[0] === '{') {
    const out: Record<string, string> = {};
    content.substring(1, content.length - 1).split(',').filter(Boolean).forEach((s) => {
      const arr = s.split(':').map(trim);
      const key = arr[0];
      const value = arr[1] || `$${key}`;
      if (value[0] !== '$') {
        throw new Error(`自定义变量别名${value}必须以$开始: ${content}`);
      }
      out[key] = value;
    });
    return out;
  }
  if (!/^\$[a-zA-Z0-9_]+$/.test(content)) {
    throw new Error(`自定义变量"${content}"命名格式错误`);
  }
  return content;
}

export function srzOutput(obj: Record<string, string | undefined>): string {
  let out = '{';
  Object.entries(obj).forEach(([key, value]) => {
    if (value == null) { return; }
    if (out !== '{') {
      out += ',';
    }
    if (`$${key}` === value) {
      out += key;
    } else {
      out += `${key}:${value}`;
    }
  });
  out += '}';
  return out;
}

function trim(v: string) {
  return v.trim();
}
