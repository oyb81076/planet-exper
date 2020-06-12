export enum DirectiveTokenKind {
  JSON, // json
  LITERAL, // 常量
  IDENTIFIER, // 变量饮用
  EXPRESSION, // 表达式
}
export interface IDirectiveTokenJSON {
  kind: DirectiveTokenKind.JSON;
  value: object | object[];
}
export interface IDirectiveTokenLiteral {
  kind: DirectiveTokenKind.LITERAL;
  value: string | number | null | undefined
}
export interface IDirectiveTokenIdentifier {
  kind: DirectiveTokenKind.IDENTIFIER;
  value: string
}
export interface IDirectiveTokenExpression {
  kind: DirectiveTokenKind.EXPRESSION;
  value: string;
}
export type DirectiveToken = IDirectiveTokenJSON | IDirectiveTokenLiteral | IDirectiveTokenIdentifier | IDirectiveTokenExpression;
// {a:1,b:2}
export interface IDirectiveArgs {
  input: DirectiveToken[];
  output: IDirectiveTokenIdentifier[];
  effective: IDirectiveTokenLiteral;
}
/**
 * {literal};{output}[,output]:input
 * @param args @example x-if='false;!active'
 */
export default function parseArgs(value: string): IDirectiveArgs {
  // let tokens: DirectiveToken = [];
  // const colon = value.indexOf(':');
  // const d = value.indexOf('|')
  // const output =
  //   d < colon
  //   value.substring(0, colon);
  // const input = value.substring(colon + 1);
  // const outputTokens = parseOutputToken(output);
  // const inputTokens = parseInputToken(input);
  return null as any;
}

// function parseGrammar(value: string): { effective: string, input: string, output: string } {
//   let effective = ''
//   let input = ''
//   let output = ''
//   const colon = value.indexOf(':');
//   const semicolon = value.indexOf(';')
// }
function parseEffective(content: string) {
  const effective = content.lastIndexOf(';');
  // if (effective === -1) {
  //   return '';
  // }
  // if (content.indexOf(',', effective))
}
function parseOutputToken(output: string): string[] {
  return output.split(',').map(trim)
}
function parseInputToken(input: string): string[] {
  const output: string[] = [];
  let token = '';
  let flagStr = false
  for (let i = 0; i < input.length; i++) {
    const v = input[i];
    if (v === "'") {
      token += v
      flagStr = !flagStr
    } else if (flagStr) { // 文字模式
      token += v;
    } else if (v === ',') {
      output.push(token)
      token = ''
    } else {
      token += input[i];
    }
  }
  output.push(token)
  return output.map(trim);
}
function trim(x: string) { return x.trim() }
