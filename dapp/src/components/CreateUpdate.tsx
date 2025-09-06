import React, { useMemo } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
} from "@/components/consoleUI";
import { detectPrimary, schemaToSkeleton } from "@/utils/helpers";

type KVStr = { k: string; v: string };
type KVNum = { k: string; v: number };

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

const CreateUpdate: React.FC<{
  payload: string;
  setPayload: (v: string) => void;
  btl: number;
  setBtl: (n: number) => void;
  strings: KVStr[];
  setStrings: (u: any) => void;
  numbers: KVNum[];
  setNumbers: (u: any) => void;
  onCreate: () => void;
  onUpdate: () => void;
  onExtend: () => void;
  onDelete: () => void;
  entityKey: string;
  loadKey: string;
  setLoadKey: (v: string) => void;
  onLoadByKey: () => void;
  connected: boolean;
  collections: CollectionRow[];
  schemas: SchemaRow[];
  selectedCollection: string;
  setSelectedCollection: (v: string) => void;
  selectedSchemaId: string;
  setSelectedSchemaId: (v: string) => void;
  onRefreshRefs: () => void;
}> = ({
  payload,
  setPayload,
  btl,
  setBtl,
  strings,
  setStrings,
  numbers,
  setNumbers,
  onCreate,
  onUpdate,
  onExtend,
  onDelete,
  entityKey,
  loadKey,
  setLoadKey,
  onLoadByKey,
  connected,
  collections,
  schemas,
  selectedCollection,
  setSelectedCollection,
  selectedSchemaId,
  setSelectedSchemaId,
  onRefreshRefs,
}) => {
  const selSchema = useMemo(
    () => schemas.find((s) => s.schemaId === selectedSchemaId)?.schema,
    [schemas, selectedSchemaId]
  );
  const prim = useMemo(
    () => (selSchema ? detectPrimary(selSchema) : undefined),
    [selSchema]
  );

  return (
    <div className="space-y-4 overflow-x-hidden">
      <Card>
        <CardHeader>
          <CardTitle>Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label>Payload (JSON or text)</Label>
              <Textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
              />
            </div>
            <div>
              <Label>BTL (blocks)</Label>
              <Input
                type="number"
                value={btl}
                onChange={(e) => setBtl(Number(e.target.value))}
              />
              <div className="text-[10px] text-neutral-500 mt-1">
                Update/Extend require creator + funds; expired entities may fail
                to extend.
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>String Annotations</Label>
              <Button
                variant="secondary"
                className="h-8 px-3"
                onClick={() =>
                  setStrings((s: KVStr[]) => [...s, { k: "", v: "" }])
                }
              >
                + Add
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {strings.map((s, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center"
                >
                  <Input
                    placeholder="key"
                    value={s.k}
                    onChange={(e) =>
                      setStrings((arr: KVStr[]) =>
                        arr.map((it, idx) =>
                          idx === i ? { k: e.target.value, v: it.v } : it
                        )
                      )
                    }
                  />
                  <Input
                    placeholder="value"
                    value={s.v}
                    onChange={(e) =>
                      setStrings((arr: KVStr[]) =>
                        arr.map((it, idx) =>
                          idx === i ? { k: it.k, v: e.target.value } : it
                        )
                      )
                    }
                  />
                  <Button
                    variant="secondary"
                    className="h-9 px-3"
                    onClick={() =>
                      setStrings((arr: KVStr[]) =>
                        arr.filter((_, idx) => idx !== i)
                      )
                    }
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Collection</Label>
              <select
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:ring-2 focus:ring-white/10"
                value={selectedCollection}
                onChange={(e) => setSelectedCollection(e.target.value)}
              >
                <option value="">— none —</option>
                {collections.map((c) => (
                  <option key={c.entityKey} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Schema</Label>
              <select
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:ring-2 focus:ring-white/10"
                value={selectedSchemaId}
                onChange={(e) => setSelectedSchemaId(e.target.value)}
              >
                <option value="">— none —</option>
                {schemas
                  .filter(
                    (s) =>
                      !selectedCollection || s.collection === selectedCollection
                  )
                  .map((s) => (
                    <option key={s.entityKey} value={s.schemaId}>
                      {s.collection}:{s.name}@{s.version}
                    </option>
                  ))}
              </select>
              {prim && (
                <div className="text-[11px] text-neutral-400 mt-1">
                  Primary: <code className="font-mono">{prim.field}</code>{" "}
                  {prim.autoincrement ? "(autoincrement)" : ""}
                </div>
              )}
            </div>
            <div className="flex items-end gap-2">
              <Button variant="secondary" onClick={onRefreshRefs}>
                Refresh
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  if (!selSchema) return;
                  const sk = schemaToSkeleton(selSchema, prim);
                  setPayload(JSON.stringify(sk, null, 2));
                }}
              >
                Fill from Schema
              </Button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Numeric Annotations</Label>
              <Button
                variant="secondary"
                className="h-8 px-3"
                onClick={() =>
                  setNumbers((n: KVNum[]) => [...n, { k: "", v: 1 }])
                }
              >
                + Add
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {numbers.map((n, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center"
                >
                  <Input
                    placeholder="key"
                    value={n.k}
                    onChange={(e) =>
                      setNumbers((arr: KVNum[]) =>
                        arr.map((it, idx) =>
                          idx === i ? { k: e.target.value, v: it.v } : it
                        )
                      )
                    }
                  />
                  <Input
                    type="number"
                    placeholder="value"
                    value={n.v}
                    onChange={(e) =>
                      setNumbers((arr: KVNum[]) =>
                        arr.map((it, idx) =>
                          idx === i
                            ? { k: it.k, v: Number(e.target.value) }
                            : it
                        )
                      )
                    }
                  />
                  <Button
                    variant="secondary"
                    className="h-9 px-3"
                    onClick={() =>
                      setNumbers((arr: KVNum[]) =>
                        arr.filter((_, idx) => idx !== i)
                      )
                    }
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={onCreate} disabled={!connected}>
              Create
            </Button>
            <Button
              variant="secondary"
              onClick={onUpdate}
              disabled={!connected || !entityKey}
            >
              Update
            </Button>
            <Button
              variant="secondary"
              onClick={onExtend}
              disabled={!connected || !entityKey}
            >
              Extend +120
            </Button>
            <Button
              variant="danger"
              onClick={onDelete}
              disabled={!connected || !entityKey}
            >
              Delete
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Current entityKey</Label>
              <Input readOnly value={entityKey} placeholder="—" />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label>Load by entityKey</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="0x…"
                    value={loadKey}
                    onChange={(e) => setLoadKey(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onLoadByKey()}
                  />
                  <Button variant="secondary" onClick={onLoadByKey}>
                    Load
                  </Button>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() =>
                  setPayload(
                    JSON.stringify(
                      { message: "Hello Golem!", ts: Date.now() },
                      null,
                      2
                    )
                  )
                }
              >
                Reset Payload
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateUpdate;
