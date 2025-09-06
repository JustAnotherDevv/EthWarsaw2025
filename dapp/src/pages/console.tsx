import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  createClient,
  Annotation,
  Tagged,
  type GolemBaseClient,
  type GolemBaseCreate,
  type GolemBaseUpdate,
} from "golem-base-sdk";
import { DEFAULTS, LONG_BTL, RESERVED } from "@/config/constants";
import {
  cx,
  dec,
  enc,
  toHexBytes,
  useLS,
  parseJsonSafe,
  detectPrimary,
  basicValidate,
} from "@/utils/helpers";
import { HeaderStat, SidebarLink, SectionId } from "@/components/consoleUI";
import Explorer from "@/components/Explorer";
import QueryConsole from "@/components/QueryConsole";
import CreateUpdate from "@/components/CreateUpdate";
import CollectionsPanel from "@/components/CollectionsPanel";

const TITLES: Record<SectionId, string> = {
  explorer: "Explorer",
  query: "Query Console",
  create: "Create / Update",
  collections: "Collections & Schemas",
  settings: "Settings",
};

const Settings: React.FC<{
  privateKey: string;
  setPrivateKey: (v: string) => void;
  chainId: number;
  setChainId: (n: number) => void;
  httpRpc: string;
  setHttpRpc: (v: string) => void;
  wsRpc: string;
  setWsRpc: (v: string) => void;
  connected: boolean;
  connect: () => void;
  disconnect: () => void;
  logs: string[];
}> = (p) => (
  <div className="space-y-4 overflow-x-hidden">
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 shadow-sm">
      <div className="p-4 border-b border-neutral-800">
        <h3 className="text-base font-semibold text-neutral-100">Connection</h3>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-neutral-400">
            Private Key (0x… test only)
          </label>
          <input
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:ring-2 focus:ring-white/10"
            type="password"
            placeholder="0x…"
            value={p.privateKey}
            onChange={(e) => p.setPrivateKey(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-400">
            Chain ID
          </label>
          <input
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:ring-2 focus:ring-white/10"
            type="number"
            value={p.chainId}
            onChange={(e) => p.setChainId(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-400">
            HTTP RPC
          </label>
          <input
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:ring-2 focus:ring-white/10"
            value={p.httpRpc}
            onChange={(e) => p.setHttpRpc(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-400">WS RPC</label>
          <input
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:ring-2 focus:ring-white/10"
            value={p.wsRpc}
            onChange={(e) => p.setWsRpc(e.target.value)}
          />
        </div>
        <div className="md:col-span-2 flex gap-2">
          {!p.connected ? (
            <button
              className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600"
              onClick={p.connect}
            >
              Connect
            </button>
          ) : (
            <button
              className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium bg-rose-600 text-white hover:bg-rose-700"
              onClick={p.disconnect}
            >
              Disconnect
            </button>
          )}
        </div>
      </div>
    </div>

    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 shadow-sm">
      <div className="p-4 border-b border-neutral-800">
        <h3 className="text-base font-semibold text-neutral-100">Console</h3>
      </div>
      <div className="p-4">
        <div className="h-48 overflow-y-auto rounded-xl border border-neutral-800 bg-black text-white p-3 text-xs">
          {p.logs.map((l, i) => (
            <div key={i} className="font-mono">
              {l}
            </div>
          ))}
          {p.logs.length === 0 && (
            <div className="text-neutral-500">No logs yet.</div>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default function GolemDBConsole() {
  const [section, setSection] = useState<SectionId>("explorer");

  const [chainId, setChainId] = useLS<number>(
    "golem_chainId",
    DEFAULTS.chainId
  );
  const [httpRpc, setHttpRpc] = useLS<string>("golem_http", DEFAULTS.http);
  const [wsRpc, setWsRpc] = useLS<string>("golem_ws", DEFAULTS.ws);
  const [privateKey, setPrivateKey] = useLS<string>("golem_pk", "");

  const [client, setClient] = useState<GolemBaseClient | null>(null);
  const [owner, setOwner] = useState<string>("");
  const [balance, setBalance] = useState<string>("");
  const connected = !!client;

  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [query, setQuery] = useLS<string>("golem_query", 'type = "message"');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [inspecting, setInspecting] = useState<any | null>(null);
  const [inspectMeta, setInspectMeta] = useState<any | null>(null);
  const [inspectData, setInspectData] = useState<string>("");

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
  const [collections, setCollections] = useState<CollectionRow[]>([]);
  const [schemas, setSchemas] = useState<SchemaRow[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [selectedSchemaId, setSelectedSchemaId] = useState<string>("");

  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDesc, setNewCollectionDesc] = useState("");
  const [schemaCollection, setSchemaCollection] = useState("");
  const [schemaName, setSchemaName] = useState("");
  const [schemaVersion, setSchemaVersion] = useState<number>(1);
  const [schemaJson, setSchemaJson] = useState<string>(() =>
    JSON.stringify(
      {
        type: "object",
        primaryKey: { field: "id", autoincrement: true },
        properties: { id: { type: "integer" }, title: { type: "string" } },
        required: ["title"],
      },
      null,
      2
    )
  );

  const [entityKey, setEntityKey] = useState<string>("");
  const [loadKey, setLoadKey] = useState<string>("");
  const [payload, setPayload] = useState<string>(() =>
    JSON.stringify({ message: "Hello Golem!", ts: Date.now() }, null, 2)
  );
  const [btl, setBtl] = useState<number>(300);
  const [strings, setStrings] = useState<{ k: string; v: string }[]>([
    { k: "type", v: "message" },
    {
      k: "id",
      v: (globalThis.crypto as any)?.randomUUID?.() || `${Date.now()}`,
    },
  ]);
  const [numbers, setNumbers] = useState<{ k: string; v: number }[]>([
    { k: "version", v: 1 },
  ]);

  const [logs, setLogs] = useState<string[]>([]);
  const appendLog = useCallback(
    (msg: string) => setLogs((p) => [...p.slice(-500), msg]),
    []
  );

  const refreshCollections = useCallback(async () => {
    if (!client) return appendLog("Collections: not connected");
    try {
      const rows = await client.queryEntities(
        `type = "${RESERVED.TYPE_COLLECTION}"`
      );
      const list: CollectionRow[] = [];
      for (const r of rows) {
        const pj = parseJsonSafe<any>(dec.decode(r.storageValue));
        const name = (pj.ok && pj.value?.name) || "unknown";
        const description = pj.ok ? pj.value?.description : undefined;
        let count = 0;
        try {
          const all = await client.queryEntities(`collection = "${name}"`);
          count = all.filter((x: any) => {
            const anns = x.stringAnnotations || [];
            const t = anns.find((a: any) => a.key === "type")?.value || "";
            return t !== RESERVED.TYPE_COLLECTION && t !== RESERVED.TYPE_SCHEMA;
          }).length;
        } catch {}
        list.push({ name, entityKey: r.entityKey, description, count });
      }
      setCollections(list);
      appendLog(`Loaded ${list.length} collections`);
    } catch (e: any) {
      appendLog(`Collections load error: ${e?.message ?? e}`);
    }
  }, [appendLog, client]);

  const refreshSchemas = useCallback(async () => {
    if (!client) return appendLog("Schemas: not connected");
    try {
      const rows = await client.queryEntities(
        `type = "${RESERVED.TYPE_SCHEMA}"`
      );
      const list: SchemaRow[] = rows.map((r: any) => {
        const pj = parseJsonSafe<any>(dec.decode(r.storageValue));
        const data = pj.ok ? pj.value : {};
        const anns = (r as any).stringAnnotations || [];
        const collection =
          anns.find((a: any) => a.key === "collection")?.value ||
          data.collection ||
          "";
        const name =
          anns.find((a: any) => a.key === "schemaName")?.value ||
          data.name ||
          "schema";
        const versionAnn = (r as any).numericAnnotations?.find?.(
          (a: any) => a.key === "version"
        )?.value;
        const version =
          typeof versionAnn === "number" ? versionAnn : data.version ?? 1;
        const schemaId = (
          anns.find((a: any) => a.key === "schemaId")?.value ||
          `${collection}:${name}@${version}` ||
          ""
        ).trim();
        return {
          schemaId,
          name,
          version,
          collection,
          entityKey: r.entityKey,
          schema: data.schema ?? data,
        };
      });
      setSchemas(list);
      appendLog(`Loaded ${list.length} schemas`);
    } catch (e: any) {
      appendLog(`Schemas load error: ${e?.message ?? e}`);
    }
  }, [appendLog, client]);

  const onRefreshRefs = useCallback(() => {
    refreshCollections();
    refreshSchemas();
  }, [refreshCollections, refreshSchemas]);

  const validateIfSchemaSelected = useCallback(() => {
    if (!selectedSchemaId) return true;
    const sch = schemas.find((s) => s.schemaId === selectedSchemaId)?.schema;
    if (!sch) return true;
    const parsed = parseJsonSafe<any>(payload);
    if (!parsed.ok) {
      appendLog(`Schema validate: payload is not JSON — ${parsed.error}`);
      return false;
    }
    const prim = detectPrimary(sch);
    const errs = basicValidate(sch, parsed.value, prim);
    if (errs.length) {
      errs.forEach((e) => appendLog(`Schema error: ${e}`));
      return false;
    }
    return true;
  }, [appendLog, payload, schemas, selectedSchemaId]);

  const createCollection = useCallback(async () => {
    if (!client) return appendLog("Create collection: not connected");
    if (!newCollectionName.trim()) return appendLog("Collection name required");
    try {
      const body = enc.encode(
        JSON.stringify({
          name: newCollectionName.trim(),
          description: newCollectionDesc,
          createdAt: Date.now(),
        })
      );
      const [r] = await client.createEntities([
        {
          data: body,
          btl: LONG_BTL,
          stringAnnotations: [
            new Annotation("type", RESERVED.TYPE_COLLECTION),
            new Annotation("collection", newCollectionName.trim()),
          ],
          numericAnnotations: [new Annotation("version", 1)],
        },
      ]);
      appendLog(`Created collection ${newCollectionName} → ${r.entityKey}`);
      setNewCollectionName("");
      setNewCollectionDesc("");
      refreshCollections();
    } catch (e: any) {
      appendLog(`Create collection error: ${e?.message ?? e}`);
    }
  }, [
    appendLog,
    client,
    newCollectionDesc,
    newCollectionName,
    refreshCollections,
  ]);

  const createSchema = useCallback(async () => {
    if (!client) return appendLog("Create schema: not connected");
    if (!schemaCollection.trim() || !schemaName.trim())
      return appendLog("Schema: collection and name required");
    const pj = parseJsonSafe<any>(schemaJson);
    if (!pj.ok) return appendLog(`Schema JSON invalid: ${pj.error}`);
    try {
      const schemaId = `${schemaCollection.trim()}:${schemaName.trim()}@${schemaVersion}`;
      const body = enc.encode(
        JSON.stringify({
          collection: schemaCollection.trim(),
          name: schemaName.trim(),
          version: schemaVersion,
          schema: pj.value,
        })
      );
      const [r] = await client.createEntities([
        {
          data: body,
          btl: LONG_BTL,
          stringAnnotations: [
            new Annotation("type", RESERVED.TYPE_SCHEMA),
            new Annotation("collection", schemaCollection.trim()),
            new Annotation("schemaName", schemaName.trim()),
            new Annotation("schemaId", schemaId),
          ],
          numericAnnotations: [new Annotation("version", schemaVersion)],
        },
      ]);
      appendLog(`Created schema ${schemaId} → ${r.entityKey}`);
      refreshSchemas();
    } catch (e: any) {
      appendLog(`Create schema error: ${e?.message ?? e}`);
    }
  }, [
    appendLog,
    client,
    refreshSchemas,
    schemaCollection,
    schemaJson,
    schemaName,
    schemaVersion,
  ]);

  const connect = useCallback(async () => {
    try {
      if (!privateKey) throw new Error("Provide a PRIVATE KEY (testnet only)");
      const pkHex = privateKey.replace(/^0x/, "");
      if (!/^[0-9a-fA-F]+$/.test(pkHex))
        throw new Error("Private key must be hex");
      const tagged = new Tagged("privatekey", toHexBytes(pkHex));
      const c = await createClient(Number(chainId), tagged, httpRpc, wsRpc);
      setClient(c);
      const addr = await c.getOwnerAddress();
      setOwner(addr);
      appendLog(`Connected: ${addr}`);
      try {
        const raw = await c
          .getRawClient()
          .httpClient.getBalance({ address: addr });
        const eth = Number(raw) / 1e18;
        setBalance(`${eth}`);
        appendLog(`Balance: ${eth} ETH`);
      } catch (e: any) {
        appendLog(`(Non-fatal) balance fetch failed: ${e?.message ?? e}`);
      }
    } catch (e: any) {
      appendLog(`Connect error: ${e?.message ?? e}`);
    }
  }, [appendLog, chainId, httpRpc, privateKey, wsRpc]);

  const disconnect = useCallback(() => {
    setClient(null);
    setOwner("");
    setBalance("");
    appendLog("Disconnected.");
  }, [appendLog]);

  const runQuery = useCallback(async () => {
    if (!client) return appendLog("Query: not connected");
    try {
      const rows = await client.queryEntities(query);
      setQueryResults(rows);
      setPage(1);
      appendLog(`Query OK (${rows.length} rows)`);
    } catch (e: any) {
      appendLog(`Query error: ${e?.message ?? e}`);
    }
  }, [appendLog, client, query]);

  const pageData = useMemo(
    () =>
      queryResults.slice(
        (page - 1) * pageSize,
        (page - 1) * pageSize + pageSize
      ),
    [page, pageSize, queryResults]
  );

  const openInspect = useCallback(
    async (row: any) => {
      if (!client) return;
      try {
        const meta = await client.getEntityMetaData(row.entityKey);
        const data = dec.decode(await client.getStorageValue(row.entityKey));
        setInspecting(row);
        setInspectMeta(meta);
        setInspectData(data);
      } catch (e: any) {
        appendLog(`Inspect error: ${e?.message ?? e}`);
      }
    },
    [appendLog, client]
  );

  const editFromRow = useCallback(
    async (row: any) => {
      if (!client) return;
      try {
        setEntityKey(row.entityKey);
        const txt = dec.decode(await client.getStorageValue(row.entityKey));
        try {
          setPayload(JSON.stringify(JSON.parse(txt), null, 2));
        } catch {
          setPayload(txt);
        }
        setSection("create");
        appendLog("Loaded row into editor.");
      } catch (e: any) {
        appendLog(`Edit load error: ${e?.message ?? e}`);
      }
    },
    [appendLog, client]
  );

  const buildCreate = useCallback((): GolemBaseCreate => {
    const base: GolemBaseCreate = {
      data: enc.encode(payload),
      btl,
      stringAnnotations: strings
        .filter((s) => s.k)
        .map(({ k, v }) => new Annotation(k, v)),
      numericAnnotations: numbers
        .filter((n) => n.k)
        .map(({ k, v }) => new Annotation(k, Number(v))),
    };
    if (selectedCollection)
      base.stringAnnotations.push(
        new Annotation("collection", selectedCollection)
      );
    if (selectedSchemaId)
      base.stringAnnotations.push(
        new Annotation("schemaId", selectedSchemaId.trim())
      );
    return base;
  }, [btl, numbers, payload, selectedCollection, selectedSchemaId, strings]);

  const doCreate = useCallback(async () => {
    if (!client) return appendLog("Create: not connected");
    if (!validateIfSchemaSelected()) return;
    try {
      const [r] = await client.createEntities([buildCreate()]);
      setEntityKey(r.entityKey);
      appendLog(
        `Created entityKey: ${r.entityKey} (expires @ ${r.expirationBlock})`
      );
    } catch (e: any) {
      appendLog(`Create error: ${e?.message ?? e}`);
    }
  }, [appendLog, buildCreate, client, validateIfSchemaSelected]);

  const doUpdate = useCallback(async () => {
    if (!client) return appendLog("Update: not connected");
    if (!entityKey) return appendLog("Update: set entityKey first");
    if (!validateIfSchemaSelected()) return;
    try {
      const upd: GolemBaseUpdate = {
        entityKey,
        data: enc.encode(payload),
        btl,
        stringAnnotations: strings
          .filter((s) => s.k)
          .map(({ k, v }) => new Annotation(k, v)),
        numericAnnotations: numbers
          .filter((n) => n.k)
          .map(({ k, v }) => new Annotation(k, Number(v))),
      };
      if (selectedCollection)
        upd.stringAnnotations.push(
          new Annotation("collection", selectedCollection)
        );
      if (selectedSchemaId)
        upd.stringAnnotations.push(
          new Annotation("schemaId", selectedSchemaId.trim())
        );
      const [r] = await client.updateEntities([upd]);
      appendLog(`Updated entityKey: ${r.entityKey}`);
    } catch (e: any) {
      appendLog(`Update error: ${e?.message ?? e}`);
      appendLog(
        `Hint: Must be the creator, entity not expired, and have test ETH.`
      );
    }
  }, [
    appendLog,
    btl,
    client,
    entityKey,
    numbers,
    payload,
    selectedCollection,
    selectedSchemaId,
    strings,
    validateIfSchemaSelected,
  ]);

  const doExtend = useCallback(async () => {
    if (!client) return appendLog("Extend: not connected");
    if (!entityKey) return appendLog("Extend: set entityKey first");
    try {
      const [r] = await client.extendEntities([
        { entityKey, numberOfBlocks: 120 },
      ]);
      appendLog(`Extended to block: ${r.newExpirationBlock}`);
    } catch (e: any) {
      appendLog(`Extend error: ${e?.message ?? e}`);
      appendLog(`Hint: Must be owner, not fully expired, and have test ETH.`);
    }
  }, [appendLog, client, entityKey]);

  const doDelete = useCallback(async () => {
    if (!client) return appendLog("Delete: not connected");
    if (!entityKey) return appendLog("Delete: set entityKey first");
    try {
      const [r] = await client.deleteEntities([entityKey]);
      appendLog(`Deleted entityKey: ${r.entityKey}`);
    } catch (e: any) {
      appendLog(`Delete error: ${e?.message ?? e}`);
    }
  }, [appendLog, client, entityKey]);

  const loadByKey = useCallback(async () => {
    if (!client) return appendLog("Load: not connected");
    const key = loadKey.trim();
    if (!key) return appendLog("Load: enter an entityKey");
    try {
      setEntityKey(key);
      const meta = await client.getEntityMetaData(key);
      appendLog(`Loaded meta: expiresAtBlock=${meta?.expiresAtBlock ?? "?"}`);
      const text = dec.decode(await client.getStorageValue(key));
      try {
        setPayload(JSON.stringify(JSON.parse(text), null, 2));
      } catch {
        setPayload(text);
      }
      appendLog("Loaded payload to editor.");
    } catch (e: any) {
      appendLog(`Load error: ${e?.message ?? e}`);
    }
  }, [appendLog, client, loadKey]);

  useEffect(() => {
    if (client) {
      refreshCollections();
      refreshSchemas();
    }
  }, [client, refreshCollections, refreshSchemas]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex overflow-x-hidden">
      <aside className="w-64 border-r border-neutral-800 p-4 space-y-2">
        <div className="text-lg font-semibold mb-1">Golem DB Console</div>
        <div className="text-xs text-neutral-500 mb-4">
          Made For EthWarsaw • 2025
        </div>
        {(Object.keys(TITLES) as SectionId[]).map((id) => (
          <SidebarLink
            key={id}
            section={section}
            setSection={setSection}
            id={id}
            label={TITLES[id]}
          />
        ))}
      </aside>

      <main className="flex-1 p-6 space-y-6 max-w-full overflow-x-hidden">
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold">{TITLES[section]}</div>
          <div className="flex gap-2">
            <HeaderStat
              label="Status"
              value={connected ? "Connected" : "Disconnected"}
            />
            <HeaderStat
              label="Owner"
              value={owner ? `${owner.slice(0, 6)}…${owner.slice(-6)}` : "—"}
            />
            <HeaderStat
              label="Balance"
              value={balance ? `${balance} ETH` : "—"}
            />
          </div>
        </div>

        {section === "explorer" && (
          <Explorer
            query={query}
            setQuery={setQuery}
            runQuery={runQuery}
            connected={connected}
            pageData={pageData}
            queryResults={queryResults}
            page={page}
            pageSize={pageSize}
            setPage={setPage}
            setPageSize={setPageSize}
            onInspect={openInspect}
            onEdit={editFromRow}
            inspecting={inspecting}
            inspectMeta={inspectMeta}
            inspectData={inspectData}
          />
        )}

        {section === "query" && (
          <QueryConsole
            query={query}
            setQuery={setQuery}
            runQuery={runQuery}
            connected={connected}
            results={queryResults}
          />
        )}

        {section === "create" && (
          <CreateUpdate
            payload={payload}
            setPayload={setPayload}
            btl={btl}
            setBtl={setBtl}
            strings={strings}
            setStrings={setStrings}
            numbers={numbers}
            setNumbers={setNumbers}
            onCreate={doCreate}
            onUpdate={doUpdate}
            onExtend={doExtend}
            onDelete={doDelete}
            entityKey={entityKey}
            loadKey={loadKey}
            setLoadKey={setLoadKey}
            onLoadByKey={loadByKey}
            connected={connected}
            collections={collections}
            schemas={schemas}
            selectedCollection={selectedCollection}
            setSelectedCollection={setSelectedCollection}
            selectedSchemaId={selectedSchemaId}
            setSelectedSchemaId={setSelectedSchemaId}
            onRefreshRefs={onRefreshRefs}
          />
        )}

        {section === "collections" && (
          <CollectionsPanel
            client={client}
            log={appendLog}
            connected={connected}
            collections={collections}
            schemas={schemas}
            newCollectionName={newCollectionName}
            setNewCollectionName={setNewCollectionName}
            newCollectionDesc={newCollectionDesc}
            setNewCollectionDesc={setNewCollectionDesc}
            schemaCollection={schemaCollection}
            setSchemaCollection={setSchemaCollection}
            schemaName={schemaName}
            setSchemaName={setSchemaName}
            schemaVersion={schemaVersion}
            setSchemaVersion={setSchemaVersion}
            schemaJson={schemaJson}
            setSchemaJson={setSchemaJson}
            createCollection={createCollection}
            createSchema={createSchema}
            onRefreshRefs={onRefreshRefs}
            onPickCollection={(name) => {
              setQuery(`collection = "${name}"`);
              setSection("explorer");
            }}
          />
        )}

        {section === "settings" && (
          <Settings
            privateKey={privateKey}
            setPrivateKey={setPrivateKey}
            chainId={Number(chainId)}
            setChainId={(n) => setChainId(Number(n))}
            httpRpc={httpRpc}
            setHttpRpc={setHttpRpc}
            wsRpc={wsRpc}
            setWsRpc={setWsRpc}
            connected={connected}
            connect={connect}
            disconnect={disconnect}
            logs={logs}
          />
        )}
      </main>
    </div>
  );
}
