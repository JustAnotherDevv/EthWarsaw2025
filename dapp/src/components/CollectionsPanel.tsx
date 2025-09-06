import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
  Badge,
} from "@/components/consoleUI";
import {
  enc,
  dec,
  parseJsonSafe,
  detectPrimary,
  validateSchemaDefinition,
  basicValidate,
  schemaToSkeleton,
  enrichRowsWithMeta,
  decodeEntityData,
  type PrimaryMeta,
  cx,
} from "@/utils/helpers";
import { RESERVED } from "@/config/constants";
import type { GolemBaseClient } from "golem-base-sdk";
import { Annotation } from "golem-base-sdk";
import {
  Database,
  Table,
  Info,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Eye,
  Code2,
  ChevronDown,
  ChevronRight,
  Hash,
  Box,
  AlertTriangle,
  Tag,
  Hash as HashIcon,
  FilePlus2,
  FileJson,
  Key,
} from "lucide-react";

type CollectionRow = {
  name: string;
  entityKey: string;
  description?: string;
  count?: number;
};
type SchemaRow = {
  schemaId: string;
  name: string;
  version: number;
  collection: string;
  entityKey: string;
  schema?: any;
};

const SchemaMini: React.FC<{ row: SchemaRow | undefined }> = ({ row }) => {
  if (!row)
    return <div className="text-xs text-neutral-500">Schema not found.</div>;
  const s = row.schema ?? {};
  const props = s.properties ?? {};
  const required: string[] = s.required ?? [];
  const prim = detectPrimary(s);
  return (
    <div className="rounded-lg border border-neutral-800 p-3 bg-neutral-950">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">Schema</div>
        <Badge tone="outline">{row.schemaId}</Badge>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="rounded border border-neutral-800 p-2">
          <div className="text-neutral-400">Type</div>
          <div className="mt-1">{s.type || "—"}</div>
        </div>
        <div className="rounded border border-neutral-800 p-2">
          <div className="text-neutral-400">Properties</div>
          <div className="mt-1">{Object.keys(props).length}</div>
        </div>
        <div className="rounded border border-neutral-800 p-2">
          <div className="text-neutral-400">Required</div>
          <div className="mt-1">{required.length}</div>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs">
        <span className="text-neutral-400">Primary:</span>
        {prim ? (
          <>
            <Key className="h-3.5 w-3.5 text-yellow-400" />
            <code className="font-mono">{prim.field}</code>
            {prim.autoincrement && (
              <Badge tone="outline" className="ml-1">
                autoincrement
              </Badge>
            )}
          </>
        ) : (
          <span>—</span>
        )}
      </div>
    </div>
  );
};

const SchemaOverview: React.FC<{ s: SchemaRow; usageCount: number }> = ({
  s,
  usageCount,
}) => {
  const schema = s.schema ?? {};
  const props: Record<string, any> = schema?.properties ?? {};
  const required: string[] = schema?.required ?? [];
  const entries = Object.entries<any>(props);
  const prim = detectPrimary(schema);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="neutral">{s.collection}</Badge>
        <Badge tone="neutral">{s.name}</Badge>
        <Badge tone="neutral">v{s.version}</Badge>
        <Badge tone="outline">{s.schemaId}</Badge>
        <Badge tone="neutral" className="ml-auto">
          Usage: {usageCount}
        </Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="rounded-lg border border-neutral-800 p-3">
          <div className="text-xs text-neutral-400">Root type</div>
          <div className="text-sm">{schema.type || "—"}</div>
        </div>
        <div className="rounded-lg border border-neutral-800 p-3">
          <div className="text-xs text-neutral-400">Properties</div>
          <div className="text-sm">{entries.length}</div>
        </div>
        <div className="rounded-lg border border-neutral-800 p-3">
          <div className="text-xs text-neutral-400">Required</div>
          <div className="text-sm">{required.length}</div>
        </div>
        <div className="rounded-lg border border-neutral-800 p-3">
          <div className="text-xs text-neutral-400">Primary Key</div>
          <div className="text-sm flex items-center gap-2">
            {prim ? (
              <>
                <Key className="h-4 w-4 text-yellow-400" />
                <span className="font-mono">{prim.field}</span>
                {prim.autoincrement && (
                  <Badge tone="outline">autoincrement</Badge>
                )}
              </>
            ) : (
              "—"
            )}
          </div>
        </div>
      </div>
      <div>
        <div className="text-sm font-medium mb-2">Fields</div>
        <div className="grid gap-2">
          {entries.length === 0 && (
            <div className="text-xs text-neutral-500">No properties.</div>
          )}
          {entries.map(([k, def]) => {
            const isReq = required.includes(k);
            const isPk = detectPrimary(schema)?.field === k;
            return (
              <div
                key={k}
                className="flex items-start gap-2 rounded-lg border border-neutral-800 p-2"
              >
                {isPk ? (
                  <Key className="h-3.5 w-3.5 text-yellow-400 mt-0.5" />
                ) : (
                  <Box className="h-3.5 w-3.5 text-neutral-400 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{k}</span>
                    <Badge tone="outline">{def?.type ?? "any"}</Badge>
                    {isReq && <Badge tone="warning">required</Badge>}
                    {isPk && <Badge tone="outline">primary</Badge>}
                    {"minimum" in (def || {}) && (
                      <Badge tone="outline">min: {def.minimum}</Badge>
                    )}
                    {"maximum" in (def || {}) && (
                      <Badge tone="outline">max: {def.maximum}</Badge>
                    )}
                    {(def?.xAutoIncrement || def?.autoincrement) && (
                      <Badge tone="outline">autoincrement</Badge>
                    )}
                  </div>
                  {def?.description && (
                    <div className="text-[11px] text-neutral-400 mt-1">
                      {def.description}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ObjectExpandedPanel: React.FC<{
  client: GolemBaseClient | null;
  entityKey: string;
  data: any;
  schemaId?: string;
  schemaRow?: SchemaRow;
  stringAnnotations: Array<{ key: string; value: string }>;
  numericAnnotations: Array<{ key: string; value: number }>;
  onOpenFullSchema: (row?: SchemaRow) => void;
}> = ({
  client,
  entityKey,
  data,
  schemaId,
  schemaRow,
  stringAnnotations,
  numericAnnotations,
  onOpenFullSchema,
}) => {
  const [tab, setTab] = useState<"props" | "raw" | "schema" | "annotations">(
    "props"
  );
  const [fallbackSchema, setFallbackSchema] = useState<SchemaRow | null>(null);
  const [loadingSchema, setLoadingSchema] = useState(false);
  const resolvedSchema = schemaRow || fallbackSchema || undefined;

  useEffect(() => {
    const sid = (schemaId || "").trim();
    if (tab !== "schema" || !sid || schemaRow || !client) return;
    let cancelled = false;
    (async () => {
      try {
        setLoadingSchema(true);
        const rows = await client.queryEntities(
          `type = "${RESERVED.TYPE_SCHEMA}" && schemaId = "${sid}"`
        );
        const r = rows?.[0];
        if (!r) {
          if (!cancelled) setFallbackSchema(null);
          return;
        }
        const pj = parseJsonSafe<any>(dec.decode(r.storageValue));
        const data = pj.ok ? pj.value : {};
        const sRow: SchemaRow = {
          schemaId: sid,
          name:
            (r.stringAnnotations || []).find((a: any) => a.key === "schemaName")
              ?.value ||
            data.name ||
            sid.split(":")[1]?.split("@")[0] ||
            "schema",
          version:
            (r.numericAnnotations || []).find((a: any) => a.key === "version")
              ?.value ||
            data.version ||
            Number(sid.split("@")[1]) ||
            1,
          collection:
            (r.stringAnnotations || []).find((a: any) => a.key === "collection")
              ?.value ||
            data.collection ||
            sid.split(":")[0] ||
            "",
          entityKey: r.entityKey,
          schema: data.schema ?? data,
        };
        if (!cancelled) setFallbackSchema(sRow);
      } finally {
        if (!cancelled) setLoadingSchema(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tab, schemaId, schemaRow, client]);

  return (
    <div className="rounded-xl border border-neutral-800 p-3 bg-neutral-950">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium">Object</div>
        <div className="inline-flex gap-1 rounded-lg border border-neutral-800 p-1">
          {(["props", "raw", "schema", "annotations"] as const).map((t) => (
            <Button
              key={t}
              size="sm"
              variant={tab === t ? "secondary" : "ghost"}
              className="h-8"
              onClick={() => setTab(t)}
            >
              {t === "raw" ? "Raw JSON" : t[0].toUpperCase() + t.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {tab === "props" && (
        <div className="grid md:grid-cols-2 gap-2">
          {data && typeof data === "object" ? (
            Object.entries<any>(data).map(([k, v]) => (
              <div key={k} className="rounded-lg border border-neutral-800 p-2">
                <div className="text-[10px] text-neutral-500">{k}</div>
                <div className="text-xs break-words">
                  {typeof v === "object" ? JSON.stringify(v) : String(v)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs text-neutral-400">
              Primitive: {String(data)}
            </div>
          )}
        </div>
      )}

      {tab === "raw" && (
        <pre className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs overflow-y-auto max-h-[40vh]">
          {typeof data === "string" ? data : JSON.stringify(data, null, 2)}
        </pre>
      )}

      {tab === "annotations" && (
        <div className="grid md:grid-cols-2 gap-3">
          <div className="rounded-lg border border-neutral-800 p-2">
            <div className="text-sm font-medium mb-1">
              String Annotations ({stringAnnotations.length})
            </div>
            {stringAnnotations.length === 0 ? (
              <div className="text-xs text-neutral-500">None</div>
            ) : (
              <div className="flex flex-wrap gap-1">
                {stringAnnotations.map((a, i) => (
                  <Badge
                    key={`sa-${i}`}
                    tone="outline"
                    className="whitespace-nowrap"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {a.key}:{a.value}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-lg border border-neutral-800 p-2">
            <div className="text-sm font-medium mb-1">
              Numeric Annotations ({numericAnnotations.length})
            </div>
            {numericAnnotations.length === 0 ? (
              <div className="text-xs text-neutral-500">None</div>
            ) : (
              <div className="flex flex-wrap gap-1">
                {numericAnnotations.map((a, i) => (
                  <Badge
                    key={`na-${i}`}
                    tone="outline"
                    className="whitespace-nowrap"
                  >
                    <HashIcon className="h-3 w-3 mr-1" />
                    {a.key}:{String(a.value)}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "schema" && (
        <div className="space-y-2">
          {loadingSchema && (
            <div className="text-xs text-neutral-400">Loading schema…</div>
          )}
          <SchemaMini row={resolvedSchema} />
          <div className="flex justify-end">
            <Button
              variant="secondary"
              onClick={() => onOpenFullSchema(resolvedSchema || undefined)}
              disabled={!resolvedSchema}
            >
              Open full schema
            </Button>
          </div>
        </div>
      )}

      <div className="mt-3 text-[11px] text-neutral-500 font-mono break-all">
        entityKey: {entityKey}
      </div>
    </div>
  );
};

const CollectionsPanel: React.FC<{
  client: GolemBaseClient | null;
  log: (msg: string) => void;
  connected: boolean;
  collections: CollectionRow[];
  schemas: SchemaRow[];
  newCollectionName: string;
  setNewCollectionName: (v: string) => void;
  newCollectionDesc: string;
  setNewCollectionDesc: (v: string) => void;
  schemaCollection: string;
  setSchemaCollection: (v: string) => void;
  schemaName: string;
  setSchemaName: (v: string) => void;
  schemaVersion: number;
  setSchemaVersion: (v: number) => void;
  schemaJson: string;
  setSchemaJson: (v: string) => void;
  createCollection: () => void;
  createSchema: () => void;
  onRefreshRefs: () => void;
  onPickCollection: (name: string) => void;
}> = (props) => {
  const {
    client,
    log,
    connected,
    collections,
    schemas,
    newCollectionName,
    setNewCollectionName,
    newCollectionDesc,
    setNewCollectionDesc,
    schemaCollection,
    setSchemaCollection,
    schemaName,
    setSchemaName,
    schemaVersion,
    setSchemaVersion,
    schemaJson,
    setSchemaJson,
    createCollection,
    createSchema,
    onRefreshRefs,
    onPickCollection,
  } = props;

  const [activeCollection, setActiveCollection] =
    useState<CollectionRow | null>(null);
  const [activeSchema, setActiveSchema] = useState<SchemaRow | null>(null);
  const [schemaTab, setSchemaTab] = useState<"overview" | "json">("overview");
  const [collLoading, setCollLoading] = useState(false);
  const [collObjects, setCollObjects] = useState<any[]>([]);
  const [collObjectCount, setCollObjectCount] = useState<number>(0);
  const [collViewMode, setCollViewMode] = useState<"table" | "raw">("table");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [schemaFilterId, setSchemaFilterId] = useState<string>("");
  const [collSchemaId, setCollSchemaId] = useState<string>("");
  const [collPayload, setCollPayload] = useState<string>("{}");
  const [collBTL, setCollBTL] = useState<number>(300);

  const schemasById = useMemo(
    () => new Map(schemas.map((s) => [s.schemaId.trim(), s] as const)),
    [schemas]
  );
  const collParsed = useMemo(
    () => parseJsonSafe<any>(collPayload),
    [collPayload]
  );
  const selectedSchemaRow = useMemo(
    () => schemasById.get((collSchemaId || "").trim()),
    [schemasById, collSchemaId]
  );
  const collSelectedSchema = selectedSchemaRow?.schema;
  const primMeta = useMemo<PrimaryMeta | undefined>(
    () => (collSelectedSchema ? detectPrimary(collSelectedSchema) : undefined),
    [collSelectedSchema]
  );
  const schemaDefCheck = useMemo(
    () =>
      collSelectedSchema
        ? validateSchemaDefinition(collSelectedSchema)
        : ({ ok: true } as const),
    [collSelectedSchema]
  );
  const collValidationErrors = useMemo(() => {
    if (!collSelectedSchema || !collParsed.ok) return [];
    return basicValidate(collSelectedSchema, collParsed.value, primMeta);
  }, [collParsed, collSelectedSchema, primMeta]);
  const isCollValidSansUniq =
    collParsed.ok && collValidationErrors.length === 0;

  const loadCollectionDetail = useCallback(
    async (c: CollectionRow) => {
      if (!client) return log("Collection detail: not connected");
      setActiveCollection(c);
      setActiveSchema(null);
      setSchemaTab("overview");
      setCollLoading(true);
      setCollObjects([]);
      setSchemaFilterId("");
      setExpanded({});
      setCollSchemaId("");
      try {
        const baseRows = await client.queryEntities(`collection = "${c.name}"`);
        const enriched = await enrichRowsWithMeta(client, baseRows, 8);
        const objects = enriched.filter((r: any) => {
          const t =
            (r.stringAnnotations || []).find((a: any) => a.key === "type")
              ?.value || "";
          return t !== RESERVED.TYPE_COLLECTION && t !== RESERVED.TYPE_SCHEMA;
        });
        setCollObjects(objects);
        setCollObjectCount(objects.length);
        log(`Loaded ${objects.length} objects for collection "${c.name}"`);
      } catch (e: any) {
        log(`Collection objects load error: ${e?.message ?? e}`);
      } finally {
        setCollLoading(false);
      }
    },
    [client, log]
  );

  const toggleExpand = (k: string) =>
    setExpanded((p) => ({ ...p, [k]: !p[k] }));

  const fillFromSelectedSchema = useCallback(() => {
    if (!collSelectedSchema) return;
    try {
      const skeleton = schemaToSkeleton(collSelectedSchema, primMeta);
      setCollPayload(JSON.stringify(skeleton, null, 2));
    } catch {}
  }, [collSelectedSchema, primMeta]);

  const getObjectsForUniqCheck = useCallback(
    async (collection: string, schemaId?: string) => {
      if (!client) return [];
      const q =
        schemaId && schemaId.length
          ? `collection = "${collection}" && schemaId = "${schemaId}"`
          : `collection = "${collection}"`;
      const base = await client.queryEntities(q);
      const enriched = await enrichRowsWithMeta(client, base, 8);
      return enriched
        .filter((r: any) => {
          const t =
            (r.stringAnnotations || []).find((a: any) => a.key === "type")
              ?.value || "";
          return t !== RESERVED.TYPE_COLLECTION && t !== RESERVED.TYPE_SCHEMA;
        })
        .map((r: any) => decodeEntityData(r));
    },
    [client]
  );

  const ensureUniquenessOrAuto = useCallback(
    async (collection: string, schemaId: string, input: any) => {
      if (!collSelectedSchema) return { ok: true, value: input } as const;
      const prim = primMeta;
      if (!prim) return { ok: true, value: input } as const;
      const existing = await getObjectsForUniqCheck(collection, schemaId);
      if (prim.autoincrement) {
        if (
          input[prim.field] === undefined ||
          input[prim.field] === null ||
          input[prim.field] === ""
        ) {
          const nums = existing
            .map((o: any) => Number(o?.[prim.field]))
            .filter((n) => Number.isFinite(n));
          const next = (nums.length ? Math.max(...nums) : 0) + 1;
          return { ok: true, value: { ...input, [prim.field]: next } } as const;
        }
      }
      const incoming = input[prim.field];
      if (incoming === undefined || incoming === null || incoming === "") {
        return {
          ok: false,
          error: `Primary key "${prim.field}" is required`,
        } as const;
      }
      const dup = existing.find((o: any) => o?.[prim.field] === incoming);
      if (dup)
        return {
          ok: false,
          error: `Duplicate primary key "${prim.field}" value: ${String(
            incoming
          )}`,
        } as const;
      return { ok: true, value: input } as const;
    },
    [collSelectedSchema, getObjectsForUniqCheck, primMeta]
  );

  const createInCollection = useCallback(async () => {
    if (!client) return log("Create in collection: not connected");
    if (!activeCollection) return log("No active collection");
    if (!selectedSchemaRow) return log("Pick a schema first");
    if (!collParsed.ok) return log(`Payload JSON invalid: ${collParsed.error}`);
    if (!schemaDefCheck.ok) {
      (schemaDefCheck as any).errors.forEach((e: string) =>
        log(`Schema definition error: ${e}`)
      );
      return;
    }
    if (collValidationErrors.length) {
      collValidationErrors.forEach((e) => log(`Schema error: ${e}`));
      return;
    }

    const prepared = await ensureUniquenessOrAuto(
      activeCollection.name,
      selectedSchemaRow.schemaId,
      collParsed.value
    );
    if (!prepared.ok) return log(prepared.error);

    try {
      const finalStr = JSON.stringify(prepared.value);
      const [receipt] = await client.createEntities([
        {
          data: enc.encode(finalStr),
          btl: collBTL,
          stringAnnotations: [
            new Annotation("collection", activeCollection.name),
            new Annotation("schemaId", selectedSchemaRow.schemaId.trim()),
          ],
          numericAnnotations: [],
        },
      ]);
      log(
        `Created object in "${activeCollection.name}" → ${receipt.entityKey}`
      );
      setCollPayload(finalStr);
      await loadCollectionDetail(activeCollection);
    } catch (e: any) {
      log(`Create in collection error: ${e?.message ?? e}`);
    }
  }, [
    client,
    activeCollection,
    selectedSchemaRow,
    collParsed,
    schemaDefCheck,
    collValidationErrors,
    ensureUniquenessOrAuto,
    collBTL,
    log,
    loadCollectionDetail,
  ]);

  const filteredObjects = useMemo(() => {
    if (!schemaFilterId) return collObjects;
    const sid = schemaFilterId.trim();
    return collObjects.filter(
      (r: any) =>
        (r.stringAnnotations || [])
          .find((a: any) => a.key === "schemaId")
          ?.value?.trim() === sid
    );
  }, [collObjects, schemaFilterId]);

  return (
    <div className="space-y-4 overflow-x-hidden">
      {/* Create Collection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-4 w-4 text-emerald-400" />
            Create Collection
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <Label>Name</Label>
            <Input
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="e.g. messages"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Description</Label>
            <Input
              value={newCollectionDesc}
              onChange={(e) => setNewCollectionDesc(e.target.value)}
              placeholder="optional"
            />
          </div>
          <Button
            variant="primary"
            onClick={createCollection}
            disabled={!connected}
          >
            <FilePlus2 className="h-4 w-4 mr-2" />
            Create
          </Button>
        </CardContent>
      </Card>

      {/* Define Schema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilePlus2 className="h-4 w-4 text-emerald-400" />
            Define Schema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 overflow-x-hidden">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Collection</Label>
              <select
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:ring-2 focus:ring-white/10"
                value={schemaCollection}
                onChange={(e) => setSchemaCollection(e.target.value)}
              >
                <option value="">— choose —</option>
                {collections.map((c) => (
                  <option key={c.entityKey} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Schema Name</Label>
              <Input
                value={schemaName}
                onChange={(e) => setSchemaName(e.target.value)}
                placeholder="e.g. message"
              />
            </div>
            <div>
              <Label>Version</Label>
              <Input
                type="number"
                value={schemaVersion}
                onChange={(e) => setSchemaVersion(Number(e.target.value) || 1)}
              />
            </div>
            <div>
              <Label>Computed schemaId</Label>
              <div className="text-xs font-mono border border-neutral-800 bg-neutral-950 rounded-lg px-2.5 py-2 truncate">
                {schemaCollection.trim() && schemaName.trim()
                  ? `${schemaCollection.trim()}:${schemaName.trim()}@${schemaVersion}`
                  : "—"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_340px] gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>JSON Schema</Label>
                <div className="flex items-center gap-2">
                  {(() => {
                    const draft = parseJsonSafe<any>(schemaJson);
                    const check = draft.ok
                      ? validateSchemaDefinition(draft.value)
                      : { ok: false, errors: [draft.error] };
                    return check.ok ? (
                      <Badge tone="success">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Valid schema
                      </Badge>
                    ) : (
                      <Badge tone="danger">
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Invalid schema
                      </Badge>
                    );
                  })()}
                </div>
              </div>
              <Textarea
                value={schemaJson}
                onChange={(e) => setSchemaJson(e.target.value)}
              />
              {(() => {
                const draft = parseJsonSafe<any>(schemaJson);
                const check = draft.ok
                  ? validateSchemaDefinition(draft.value)
                  : { ok: false, errors: [draft.error] };
                return !check.ok ? (
                  <ul className="mt-2 text-[11px] text-rose-300 list-disc list-inside space-y-0.5">
                    {(check as any).errors?.map?.((e: string, i: number) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                ) : null;
              })()}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={createSchema}
              disabled={!connected}
            >
              Save Schema
            </Button>
            <Button
              variant="secondary"
              onClick={onRefreshRefs}
              title="Reload collections & schemas"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Lists
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Collections list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-4 w-4 text-emerald-400" />
            Collections
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-hidden">
          <div className="text-xs text-neutral-400 mb-2">
            {collections.length} found
          </div>
          <div className="grid gap-2">
            {collections.map((c) => (
              <div
                key={c.entityKey}
                className="rounded-lg border border-neutral-800 p-3 hover:bg-neutral-900/50 cursor-pointer"
                onClick={() => loadCollectionDetail(c)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-emerald-400" />
                      <div className="text-sm font-semibold">{c.name}</div>
                      <Badge tone="outline">{c.count ?? "—"} objects</Badge>
                    </div>
                    {c.description && (
                      <div className="text-xs text-neutral-400 mt-1 line-clamp-1">
                        {c.description}
                      </div>
                    )}
                    <div className="text-[10px] font-mono text-neutral-500 break-all mt-1">
                      {c.entityKey}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPickCollection(c.name);
                      }}
                    >
                      View in Explorer
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {collections.length === 0 && (
              <div className="text-neutral-500 text-sm">
                No collections yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Schemas list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Table className="h-4 w-4 text-emerald-400" />
            Schemas
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-hidden">
          <div className="text-xs text-neutral-400 mb-2">
            {schemas.length} total
          </div>
          <div className="rounded-xl border border-neutral-800 overflow-hidden">
            <table className="w-full table-fixed text-sm">
              <thead className="bg-neutral-900/80">
                <tr>
                  <th className="px-3 py-2 text-left w-[45%]">Schema ID</th>
                  <th className="px-3 py-2 text-left">Collection</th>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left w-[100px]">Version</th>
                </tr>
              </thead>
              <tbody>
                {schemas.map((s) => (
                  <tr
                    key={s.entityKey}
                    className="odd:bg-neutral-900/40 hover:bg-neutral-900/70 cursor-pointer"
                    onClick={() => {
                      setActiveSchema(s);
                      setActiveCollection(null);
                      setSchemaTab("overview");
                    }}
                  >
                    <td className="px-3 py-2 font-mono text-[11px] break-all">
                      {s.schemaId}
                    </td>
                    <td className="px-3 py-2">{s.collection}</td>
                    <td className="px-3 py-2">{s.name}</td>
                    <td className="px-3 py-2">{s.version}</td>
                  </tr>
                ))}
                {schemas.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-8 text-center text-neutral-500"
                    >
                      No schemas yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detail: Collection */}
      {activeCollection && (
        <Card>
          <CardHeader>
            <CardTitle>Collection: {activeCollection.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 overflow-x-hidden">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <Label>Description</Label>
                <div className="text-sm text-neutral-200 mt-1">
                  {activeCollection.description || "—"}
                </div>
              </div>
              <div>
                <Label>Objects</Label>
                <div className="text-sm text-neutral-200 mt-1">
                  {collObjectCount}
                </div>
              </div>
              <div>
                <Label>Filter by schema</Label>
                <select
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:ring-2 focus:ring-white/10"
                  value={schemaFilterId}
                  onChange={(e) => setSchemaFilterId(e.target.value)}
                >
                  <option value="">All</option>
                  {schemas
                    .filter((s) => s.collection === activeCollection.name)
                    .map((s) => (
                      <option key={s.entityKey} value={s.schemaId}>
                        {s.schemaId}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex items-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => onPickCollection(activeCollection.name)}
                >
                  View in Explorer
                </Button>
                <Button variant="ghost" onClick={() => onRefreshRefs()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh refs
                </Button>
              </div>
            </div>

            {/* Create inside collection */}
            <div className="rounded-xl border border-neutral-800 p-3">
              <div className="text-sm font-semibold mb-2 flex items-center gap-2">
                <FilePlus2 className="h-4 w-4 text-emerald-400" />
                Add Object
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label>Schema</Label>
                  <select
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:ring-2 focus:ring-white/10"
                    value={collSchemaId}
                    onChange={(e) => setCollSchemaId(e.target.value)}
                  >
                    <option value="">— choose —</option>
                    {schemas
                      .filter((s) => s.collection === activeCollection.name)
                      .map((s) => (
                        <option key={s.entityKey} value={s.schemaId}>
                          {s.collection}:{s.name}@{s.version}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <Label>BTL</Label>
                  <Input
                    type="number"
                    value={collBTL}
                    onChange={(e) => setCollBTL(Number(e.target.value) || 300)}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button variant="secondary" onClick={fillFromSelectedSchema}>
                    Fill from Schema
                  </Button>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <Label>Payload (JSON)</Label>
                  <div className="flex items-center gap-2">
                    {!schemaDefCheck.ok && (
                      <Badge tone="danger">
                        <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                        Bad schema
                      </Badge>
                    )}
                    {collParsed.ok ? (
                      isCollValidSansUniq ? (
                        <Badge tone="success">
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Looks valid
                        </Badge>
                      ) : (
                        <Badge tone="warning">
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                          {collValidationErrors.length} issues
                        </Badge>
                      )
                    ) : (
                      <Badge tone="danger">
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        JSON invalid
                      </Badge>
                    )}
                    {primMeta && (
                      <Badge tone="outline">
                        <Key className="h-3.5 w-3.5 mr-1" />
                        {primMeta.field}
                        {primMeta.autoincrement ? " (auto)" : ""}
                      </Badge>
                    )}
                  </div>
                </div>
                <Textarea
                  className={cx(
                    collParsed.ok
                      ? isCollValidSansUniq
                        ? "border-emerald-600/40"
                        : "border-amber-600/40"
                      : "border-rose-700/40"
                  )}
                  value={collPayload}
                  onChange={(e) => setCollPayload(e.target.value)}
                />
                {!collParsed.ok && (
                  <div className="mt-1 text-[11px] text-rose-300">
                    Parse error: {collParsed.error}
                  </div>
                )}
                {collParsed.ok && collValidationErrors.length > 0 && (
                  <ul className="mt-2 text-[11px] text-amber-200 list-disc list-inside space-y-0.5">
                    {collValidationErrors.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex items-center gap-2 mt-3">
                <Button
                  variant="primary"
                  disabled={!connected || !isCollValidSansUniq || !collSchemaId}
                  onClick={createInCollection}
                >
                  Create Object
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (!collParsed.ok)
                      return log(`JSON invalid: ${collParsed.error}`);
                    if (!collSelectedSchema)
                      return log("Pick a schema to validate against");
                    if (collValidationErrors.length === 0)
                      log("Payload is valid ✅");
                    else
                      collValidationErrors.forEach((e) =>
                        log(`Schema error: ${e}`)
                      );
                  }}
                >
                  Validate
                </Button>
              </div>
            </div>

            {/* Objects view */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-neutral-400">
                {collLoading
                  ? "Loading objects…"
                  : `${filteredObjects.length} objects`}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={collViewMode === "table" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setCollViewMode("table")}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Table
                </Button>
                <Button
                  variant={collViewMode === "raw" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setCollViewMode("raw")}
                >
                  <Code2 className="h-4 w-4 mr-2" />
                  Raw
                </Button>
              </div>
            </div>

            {collViewMode === "raw" ? (
              <div className="rounded-xl border border-neutral-800 overflow-hidden">
                <pre className="bg-neutral-950 p-3 text-xs max-h-[60vh] overflow-y-auto">
                  {JSON.stringify(
                    filteredObjects.map((r: any) => ({
                      entityKey: r.entityKey,
                      data: decodeEntityData(r),
                      annotations: {
                        string: r.stringAnnotations ?? [],
                        numeric: r.numericAnnotations ?? [],
                      },
                    })),
                    null,
                    2
                  )}
                </pre>
              </div>
            ) : (
              <div className="rounded-xl border border-neutral-800 overflow-hidden">
                <table className="w-full table-fixed text-sm">
                  <thead className="bg-neutral-900/80">
                    <tr>
                      <th className="px-2 py-2 text-left w-[36px]"></th>
                      <th className="px-3 py-2 text-left w-[28%]">Key / PK</th>
                      <th className="px-3 py-2 text-left w-[26%]">Schema</th>
                      <th className="px-3 py-2 text-left">Preview</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredObjects.map((r: any) => {
                      const eid = r.entityKey as string;
                      const d = decodeEntityData(r);
                      const schemaIdAnn = (r.stringAnnotations || []).find(
                        (a: any) => a.key === "schemaId"
                      )?.value as string | undefined;
                      const schemaId = (schemaIdAnn || "").trim();
                      const srow = schemaId
                        ? schemasById.get(schemaId)
                        : undefined;
                      const prim = srow?.schema
                        ? detectPrimary(srow.schema)
                        : undefined;
                      const pkValue =
                        prim && d && typeof d === "object"
                          ? d[prim.field]
                          : undefined;
                      const open = !!expanded[eid];
                      const preview = (() => {
                        const txt =
                          typeof d === "string" ? d : JSON.stringify(d);
                        return txt.length > 120 ? `${txt.slice(0, 120)}…` : txt;
                      })();
                      return (
                        <React.Fragment key={eid}>
                          <tr className="odd:bg-neutral-900/40">
                            <td className="px-2 py-2 align-top">
                              <button
                                className="text-neutral-300 hover:text-white"
                                onClick={() => toggleExpand(eid)}
                                title={open ? "Collapse" : "Expand"}
                              >
                                {open ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </button>
                            </td>
                            <td className="px-3 py-2 align-top">
                              <div className="text-[11px] font-mono break-all">
                                {pkValue !== undefined ? (
                                  <span className="inline-flex items-center gap-1">
                                    <Hash className="h-3.5 w-3.5 text-yellow-400" />
                                    {String(pkValue)}{" "}
                                    <span className="text-neutral-500 ml-1">
                                      ({eid.slice(0, 6)}…{eid.slice(-6)})
                                    </span>
                                  </span>
                                ) : (
                                  <span>{eid}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2 align-top">
                              {schemaId ? (
                                <div className="flex flex-col gap-1">
                                  <Badge
                                    tone="outline"
                                    title={schemaId}
                                    className="truncate max-w-full"
                                  >
                                    {schemaId}
                                  </Badge>
                                  <div className="text-[11px] text-neutral-500">
                                    {srow
                                      ? `${srow.name} v${srow.version}`
                                      : "Unknown schema"}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-neutral-500">
                                  —
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 align-top">
                              <div className="text-xs text-neutral-300 truncate">
                                {preview}
                              </div>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {(r.stringAnnotations || [])
                                  .slice(0, 3)
                                  .map((a: any, i: number) => (
                                    <Badge
                                      key={`sa-${eid}-${i}`}
                                      tone="outline"
                                    >
                                      <Tag className="h-3 w-3 mr-1" />
                                      {a.key}:{a.value}
                                    </Badge>
                                  ))}
                                {(r.numericAnnotations || [])
                                  .slice(0, 1)
                                  .map((a: any, i: number) => (
                                    <Badge
                                      key={`na-${eid}-${i}`}
                                      tone="outline"
                                    >
                                      <HashIcon className="h-3 w-3 mr-1" />
                                      {a.key}:{a.value}
                                    </Badge>
                                  ))}
                              </div>
                            </td>
                          </tr>
                          {open && (
                            <tr className="bg-neutral-950/60">
                              <td></td>
                              <td colSpan={3} className="px-3 pb-3">
                                <ObjectExpandedPanel
                                  client={client}
                                  entityKey={eid}
                                  data={d}
                                  schemaId={schemaId}
                                  schemaRow={srow}
                                  stringAnnotations={r.stringAnnotations || []}
                                  numericAnnotations={
                                    r.numericAnnotations || []
                                  }
                                  onOpenFullSchema={(row) => {
                                    const target =
                                      row ||
                                      (schemaId
                                        ? schemasById.get(schemaId)
                                        : undefined);
                                    if (target) {
                                      setActiveSchema(target);
                                      setSchemaTab("overview");
                                      setTimeout(
                                        () =>
                                          document
                                            .getElementById(
                                              "schema-detail-section"
                                            )
                                            ?.scrollIntoView({
                                              behavior: "smooth",
                                              block: "start",
                                            }),
                                        0
                                      );
                                    }
                                  }}
                                />
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                    {filteredObjects.length === 0 && !collLoading && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-3 py-8 text-center text-neutral-500"
                        >
                          No objects yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detail: Schema */}
      {activeSchema && (
        <Card id="schema-detail-section">
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Table className="h-5 w-5 text-emerald-400" />
              <CardTitle>Schema: {activeSchema.schemaId}</CardTitle>
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 p-1 bg-neutral-950">
              <Button
                size="sm"
                variant={schemaTab === "overview" ? "secondary" : "ghost"}
                className="h-8"
                onClick={() => setSchemaTab("overview")}
              >
                Overview
              </Button>
              <Button
                size="sm"
                variant={schemaTab === "json" ? "secondary" : "ghost"}
                className="h-8"
                onClick={() => setSchemaTab("json")}
              >
                <FileJson className="h-4 w-4 mr-2" />
                JSON
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 overflow-x-hidden">
            {schemaTab === "overview" ? (
              <SchemaOverview s={activeSchema} usageCount={0} />
            ) : (
              <pre className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs overflow-y-auto max-h-[60vh]">
                {JSON.stringify(activeSchema.schema ?? {}, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CollectionsPanel;
