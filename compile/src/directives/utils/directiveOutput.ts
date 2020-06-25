export function parseDirectiveOutput(content: string): Record<string, string> | string {
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

export function serializeDirectiveOutput(obj: Record<string, string | undefined>): string {
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
