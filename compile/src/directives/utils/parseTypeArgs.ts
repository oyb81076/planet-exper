import {
  isPlainObject, isString, isUndefined, isNumber, isBoolean, isArray,
} from 'lodash';
import {
  ITypeArg, IType, TypeKinds, ITypeRecord,
} from '../../ast';
import isUndefinedOrString from '../../utils/isUndefinedOrString';
import assertNever from '../../utils/assertNever';

export default function parseTypeArgs(args: Exclude<unknown, string>): ITypeArg {
  if (!isRecord(args)) { throw new TypeError(`无法将${JSON.stringify(args, null, 2)}解析为type args`); }
  const {
    key, title, desc, type,
  } = args;
  if (!isString(key)) {
    throw new TypeError('key必须为字符串类型');
  }
  if (!isUndefinedOrString(title)) {
    throw new TypeError('title必须为字符串类型');
  }
  if (!isUndefinedOrString(desc)) {
    throw new TypeError('desc必须为字符串类型');
  }
  return {
    key, title, desc, type: transformType(type),
  };
}

const isRecord = isPlainObject as (x: unknown) => x is Record<string, unknown>;
function transformType(x: unknown): IType {
  if (isString(x)) {
    switch (x) {
      case TypeKinds.BOOLEAN:
      case TypeKinds.DATE:
      case TypeKinds.NULL:
      case TypeKinds.STRING:
      case TypeKinds.NUMBER: return { kind: x };
      default: throw new TypeError(`未知的类型${JSON.stringify(x)}`);
    }
  }
  if (!isRecord(x)) { throw new TypeError(`无法解析类型${JSON.stringify(x)}`); }
  const { kind, defaults } = x;
  switch (kind) {
    case TypeKinds.NUMBER: return { kind, defaults: parseNumber(defaults, true) };
    case TypeKinds.BOOLEAN: return { kind, defaults: parseBoolean(defaults, true) };
    case TypeKinds.NULL: return { kind };
    case TypeKinds.STRING: return { kind, defaults: parseString(defaults, true) };
    case TypeKinds.DATE: return { kind, defaults: parseDate(defaults, true) };
    case TypeKinds.ARRAY: {
      const type = transformType(x.type);
      return { kind, type, defaults: parseArray(type, defaults, true) };
    }
    case TypeKinds.RECORD: {
      const props = transformRecordProps(x.props);
      return { kind, props, defaults: parseRecord(props, defaults) };
    }
    default:
      return assertNever('{types:TypeKinds}', x);
  }
}
function parseBoolean(value: unknown, allowUndefined: boolean): boolean | undefined {
  if (allowUndefined && isUndefined(value)) { return undefined; }
  if (isBoolean(value)) { return value; }
  throw new TypeError(`无法将${JSON.stringify(value)}解析为布尔`);
}
function parseNumber(value: unknown, allowUndefined: boolean): number | undefined {
  if ((allowUndefined && isUndefined(value)) || isNumber(value)) return undefined;
  throw new TypeError(`无法将${JSON.stringify(value)}解析为数字`);
}
function parseString(value: unknown, allowUndefined: boolean): string | undefined {
  if ((allowUndefined && isUndefined(value)) || isString(value)) { return value; }
  throw new TypeError(`无法解析字符串${JSON.stringify(value)}`);
}
function parseDate(value: unknown, allowUndefined: boolean): Date | undefined {
  if (allowUndefined && isUndefined(value)) { return undefined; }
  if (isNumber(value) || isString(value)) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new TypeError(`无法解析日期${value}`);
    }
    return date;
  }
  throw new TypeError(`无法解析日期${JSON.stringify(value)}`);
}
function parseNull(v: unknown) {
  if (v !== null) { throw new TypeError(`无法将${JSON.stringify(v)}解析为null`); }
}
function parseArray(type: IType, value: unknown, allowUndefined: boolean): unknown[] | undefined {
  if (allowUndefined && isUndefined(value)) { return undefined; }
  if (isArray(value)) {
    return value.map((x) => parseValue(type, x));
  }
  throw new TypeError(`无法解析数组${JSON.stringify(value)}`);
}
function parseRecord(props: ITypeRecord['props'], value: unknown): Record<string, unknown> {
  if (!isRecord(value)) { throw new TypeError(`无法将解析object:${JSON.stringify(value, null, 2)}`); }
  const out: Record<string, unknown> = {};
  props.forEach(({ key, type }) => {
    let v = value[key];
    if (v === undefined && 'defaults' in type) {
      v = type.defaults;
    }
    out[key] = parseValue(type, v);
  });
  return out;
}
function transformRecordProps(props: unknown): Array<{ key: string, type: IType }> {
  if (!isArray(props)) { throw new TypeError(`无法将records类型声明props${JSON.stringify(props, null, 2)}`); }
  return props.map((x) => {
    if (!isRecord(x)) { throw new TypeError('无法解析record声明'); }
    const { key, type } = x;
    if (!isString(key)) { throw new TypeError('无法解析key'); }
    return { key, type: transformType(type) };
  });
}
function parseValue(type: IType, value: unknown): unknown {
  switch (type.kind) {
    case TypeKinds.BOOLEAN: return parseBoolean(value, false);
    case TypeKinds.DATE: return parseDate(value, false);
    case TypeKinds.NULL: return parseNull(value);
    case TypeKinds.NUMBER: return parseNumber(value, false);
    case TypeKinds.STRING: return parseString(value, false);
    case TypeKinds.ARRAY: return parseArray(type.type, value, false);
    case TypeKinds.RECORD: return parseRecord(type.props, value);
    default: return assertNever('{TypeKinds}', type);
  }
}
