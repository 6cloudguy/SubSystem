export function toPlain<T>(val: unknown): T {
  if (val === null || val === undefined) return val as T;
  if (typeof val === 'object') {
    if (typeof (val as { toNumber?: () => number }).toNumber === 'function') {
      return (val as { toNumber: () => number }).toNumber() as unknown as T;
    }
    if (val instanceof Date) {
      return val.toISOString() as unknown as T;
    }
    if (Array.isArray(val)) {
      return val.map((item) => toPlain(item)) as unknown as T;
    }
    const res: Record<string, unknown> = {};
    for (const key of Object.keys(val)) {
      res[key] = toPlain((val as Record<string, unknown>)[key]);
    }
    return res as T;
  }
  return val as T;
}
