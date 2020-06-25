import {
  ObjectExpression, Expression, Property, SpreadElement, Pattern,
} from 'estree';
import { fromPairs } from 'lodash';
import isStringLiteral from './isStringLiteral';

export default function objectExprToRecord(expr: ObjectExpression): Record<string, Expression> {
  return fromPairs(expr.properties.map(mapObjectExpression));
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
