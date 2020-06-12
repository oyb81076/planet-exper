// 类型系统
type IBaseType = ITypeNumber | ITypeString | ITypeDate | ITypeBool | ITypeObject | ITypeRecord | ITypeNull;
interface ITypeNumber {
  kind: 'number';
  defaults?: number;
}
interface ITypeString {
  kind: 'string';
  defaults?: string;
}
interface ITypeDate {
  kind: 'date';
  defaults?: string | number;
}
interface ITypeBool {
  kind: 'bool';
  defaults?: boolean;
}
interface ITypeNull {
  kind: 'null'
}
interface ITypeObject {
  kind: 'object';
  defaults?: object;
}
interface ITypeArray {
  kind: 'array';
  value: IBaseType;
  defaults?: any[];
}
interface ITypeRecord {
  kind: 'record';
  value: Array<{ key: string, title?: string, desc?: string, value: IBaseType }>
}

interface ITypeArguments {
  kind: 'arguments';
  value: IBaseType[];
}
