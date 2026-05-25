function decToNum(v: any): number {
  if (v == null) return 0;
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const s = v?.toString?.();
  const n = typeof s === 'string' ? Number(s) : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function normalizeLeanValue(v: any): any {
  if (v == null) return v;

  // Convert Mongo ObjectId to a plain string id.
  if (v?._bsontype === 'ObjectId') return v?.toString?.() ?? String(v);

  // Convert Mongo Decimal128 to a plain JS number (major units).
  if (v?._bsontype === 'Decimal128') return decToNum(v);

  if (Array.isArray(v)) return v.map(normalizeLeanValue);

  if (typeof v === 'object') {
    // Keep Date instances as-is.
    if (v instanceof Date) return v;

    const out: any = {};
    for (const [k, val] of Object.entries(v)) {
      out[k] = normalizeLeanValue(val);
    }
    return out;
  }

  return v;
}

export function sanitizeLeanDoc<T extends { _id: any; __v?: any }>(doc: T) {
  const obj: any = normalizeLeanValue({ ...doc });
  obj.id = obj._id?.toString?.() ?? obj._id;
  delete obj._id;
  delete obj.__v;
  return obj as Omit<T, '_id' | '__v'> & { id: string };
}

export function sanitizeLeanArray<T extends { _id: any; __v?: any }>(docs: T[]) {
  return docs.map(sanitizeLeanDoc);
}
