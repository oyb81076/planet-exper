import { isUndefined, isString } from 'lodash';

export default function isUndefinedOrString(v: unknown): v is string | undefined {
  return isUndefined(v) || isString(v);
}
