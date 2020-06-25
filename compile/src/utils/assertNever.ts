export default function assertNever(label: string, obj: unknown): never {
  throw new TypeError(`未能预期的值${label}值:${JSON.stringify(obj)}`);
}
