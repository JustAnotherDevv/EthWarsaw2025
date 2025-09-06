export const DEFAULTS = {
  chainId: 60138453033,
  http: "https://ethwarsaw.holesky.golemdb.io/rpc",
  ws: "wss://ethwarsaw.holesky.golemdb.io/rpc/ws",
} as const;

export const LONG_BTL = 100000;

export const RESERVED = {
  TYPE_COLLECTION: "__collection",
  TYPE_SCHEMA: "__schema",
} as const;

export const TITLES = {
  explorer: "Explorer",
  query: "Query Console",
  create: "Create / Update",
  collections: "Collections & Schemas",
  settings: "Settings",
} as const;
