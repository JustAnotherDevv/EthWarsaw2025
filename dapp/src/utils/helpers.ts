import { useEffect, useState } from "react";
import type { GolemBaseClient } from "golem-base-sdk";

/* ---------- UI / General ---------- */

export const cx = (...c: Array<string | false | null | undefined>) =>
  c.filter(Boolean).join(" ");

export const enc = new TextEncoder();
export const dec = new TextDecoder();

export const toHexBytes = (hexNo0x: string) =>
  Uint8Array.from(hexNo0x.match(/.{1,2}/g)?.map((b) => parseInt(b, 16)) || []);

export const short = (s: string, n = 8) =>
  s.length <= n * 2 + 3 ? s : `${s.slice(0, n)}…${s.slice(-n)}`;

export function parseJsonSafe<T = any>(
  txt: string
): { ok: true; value: T } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(txt) as T };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? String(e) };
  }
}

export const decodeEntityData = (r: any) => {
  const text = dec.decode(r.storageValue);
  const p = parseJsonSafe<any>(text);
  return p.ok ? p.value : text;
};

export function useLS<T extends string | number>(key: string, init: T) {
  const [v, setV] = useState<T>(() => {
    const raw = localStorage.getItem(key);
    if (raw == null) return init;
    return (typeof init === "number" ? (Number(raw) as T) : (raw as T)) ?? init;
  });
  useEffect(() => {
    localStorage.setItem(key, String(v));
  }, [key, v]);
  return [v, setV] as const;
}

/* ---------- Schema helpers ---------- */

export type PrimaryMeta = { field: string; autoincrement?: boolean };

export function detectPrimary(schema: any): PrimaryMeta | undefined {
  if (!schema || typeof schema !== "object") return;
  const props = schema.properties || {};
  if (schema.primaryKey?.field) {
    const field = String(schema.primaryKey.field);
    return { field, autoincrement: !!schema.primaryKey.autoincrement };
  }
  for (const [k, def] of Object.entries<any>(props)) {
    if (def?.xPrimaryKey || def?.primaryKey === true) {
      return {
        field: k,
        autoincrement: !!(def.xAutoIncrement || def.autoincrement),
      };
    }
  }
  return;
}

export function validateSchemaDefinition(
  s: any
): { ok: true; primary?: PrimaryMeta } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  if (!s || typeof s !== "object")
    return { ok: false, errors: ["Schema must be an object"] };
  if (s.type !== "object") errors.push('Root "type" should be "object"');
  if (!s.properties || typeof s.properties !== "object")
    errors.push('"properties" must be an object');

  const props = s.properties || {};
  const required: string[] = Array.isArray(s.required) ? s.required : [];
  const propKeys = new Set(Object.keys(props));
  const unknownRequired = required.filter((k) => !propKeys.has(k));
  if (unknownRequired.length > 0)
    errors.push(
      `"required" contains unknown keys: ${unknownRequired.join(", ")}`
    );

  const prim = detectPrimary(s);
  if (prim) {
    if (!propKeys.has(prim.field)) {
      errors.push(`Primary key "${prim.field}" not found in properties`);
    } else {
      const def = props[prim.field];
      const t = def?.type;
      if (prim.autoincrement && !(t === "integer" || t === "number")) {
        errors.push(
          `Autoincrement primary key "${
            prim.field
          }" must be "integer" or "number", got "${t ?? "unknown"}"`
        );
      }
    }
  }
  let primCount = 0;
  if (s.primaryKey?.field) primCount++;
  for (const [, def] of Object.entries<any>(props))
    if (def?.xPrimaryKey || def?.primaryKey) primCount++;
  if (primCount > 1) errors.push("Only one primary key is allowed");

  if (errors.length) return { ok: false, errors };
  return { ok: true, primary: prim };
}

export function basicValidate(
  schema: any,
  data: any,
  primary?: PrimaryMeta
): string[] {
  const errs: string[] = [];
  if (!schema || typeof schema !== "object") return errs;
  const expectType = schema.type;
  const typeOf = Array.isArray(data) ? "array" : typeof data;
  if (expectType && expectType !== typeOf)
    errs.push(`root: expected ${expectType}, got ${typeOf}`);

  const props = schema.properties || {};
  const required: string[] = Array.isArray(schema.required)
    ? schema.required
    : [];
  for (const k of required) {
    if (primary?.autoincrement && k === primary.field) continue;
    if (!(k in (data || {}))) errs.push(`missing required: ${k}`);
  }

  if (
    expectType === "object" &&
    typeof data === "object" &&
    !Array.isArray(data)
  ) {
    for (const [k, def] of Object.entries<any>(props)) {
      if (!(k in data)) continue;
      const v = (data as any)[k];
      const t = Array.isArray(v) ? "array" : typeof v;
      if (def?.type && def.type !== t)
        errs.push(`${k}: expected ${def.type}, got ${t}`);
      if (def?.type === "number" || def?.type === "integer") {
        const num = Number(v);
        if (Number.isNaN(num)) errs.push(`${k}: not a number`);
        if (def.minimum != null && num < def.minimum)
          errs.push(`${k}: < minimum ${def.minimum}`);
        if (def.maximum != null && num > def.maximum)
          errs.push(`${k}: > maximum ${def.maximum}`);
      }
    }
  }
  return errs;
}

export function schemaToSkeleton(s: any, primary?: PrimaryMeta): any {
  if (!s || typeof s !== "object") return {};
  const out: Record<string, any> = {};
  if (s.type !== "object") return out;
  const props = s.properties || {};
  for (const [k, def] of Object.entries<any>(props)) {
    if (primary?.autoincrement && k === primary.field) continue;
    if (def?.default !== undefined) out[k] = def.default;
    else if (def?.example !== undefined) out[k] = def.example;
    else {
      switch (def?.type) {
        case "string":
          out[k] = "";
          break;
        case "number":
        case "integer":
          out[k] = 0;
          break;
        case "boolean":
          out[k] = false;
          break;
        case "array":
          out[k] = [];
          break;
        case "object":
          out[k] = {};
          break;
        default:
          out[k] = null;
      }
    }
  }
  return out;
}

/* ---------- Data enrichment ---------- */

export async function enrichRowsWithMeta(
  client: GolemBaseClient,
  rows: any[],
  concurrency = 6
): Promise<
  Array<
    any & {
      stringAnnotations?: Array<{ key: string; value: string }>;
      numericAnnotations?: Array<{ key: string; value: number }>;
      _meta?: any;
      _metaError?: string;
    }
  >
> {
  const out: any[] = new Array(rows.length);
  let idx = 0;
  async function worker() {
    while (true) {
      const i = idx++;
      if (i >= rows.length) break;
      const r = rows[i];
      try {
        const meta = await client.getEntityMetaData(r.entityKey);
        out[i] = {
          ...r,
          stringAnnotations: meta?.stringAnnotations ?? [],
          numericAnnotations: meta?.numericAnnotations ?? [],
          _meta: meta,
        };
      } catch (e: any) {
        out[i] = {
          ...r,
          stringAnnotations: [],
          numericAnnotations: [],
          _metaError: e?.message ?? String(e),
        };
      }
    }
  }
  const workers = Array(Math.min(concurrency, rows.length)).fill(0).map(worker);
  await Promise.all(workers);
  return out;
}
