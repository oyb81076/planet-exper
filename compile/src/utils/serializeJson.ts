import { stringify } from 'json5';
import { isArray } from 'lodash';

export default function serializeJson(
  val: unknown,
  { compactJSON }: { compactJSON: boolean },
): string {
  if (compactJSON) {
    return stringify(val);
  } if (isArray(val)) {
    return `[\n${val.map((x) => `  ${stringify(x)}`).join(',\n')}\n]`;
  }
  return stringify(val, null, '  ');
}
