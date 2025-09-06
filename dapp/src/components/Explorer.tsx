import React from "react";
import {
  QueryBar,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Button,
  Label,
} from "@/components/consoleUI";
import { decodeEntityData } from "@/utils/helpers";

const Explorer: React.FC<{
  query: string;
  setQuery: (v: string) => void;
  runQuery: () => void;
  connected: boolean;
  pageData: any[];
  queryResults: any[];
  page: number;
  pageSize: number;
  setPage: (v: number | ((p: number) => number)) => void;
  setPageSize: (n: number) => void;
  onInspect: (row: any) => void;
  onEdit: (row: any) => void;
  inspecting: any | null;
  inspectMeta: any | null;
  inspectData: string;
}> = ({
  query,
  setQuery,
  runQuery,
  connected,
  pageData,
  queryResults,
  page,
  pageSize,
  setPage,
  setPageSize,
  onInspect,
  onEdit,
  inspecting,
  inspectMeta,
  inspectData,
}) => (
  <div className="space-y-4">
    <QueryBar
      value={query}
      setValue={setQuery}
      onRun={runQuery}
      connected={connected}
      placeholder='type = "message"'
    />
    <Card>
      <CardHeader>
        <CardTitle>Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-neutral-400">
            {queryResults.length} total
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Label>Page size</Label>
            <Input
              style={{ width: 80 }}
              type="number"
              value={pageSize}
              onChange={(e) =>
                setPageSize(Math.max(1, Number(e.target.value) || 25))
              }
            />
          </div>
        </div>
        <div className="rounded-xl border border-neutral-800 overflow-hidden">
          <table className="w-full table-fixed text-sm">
            <thead className="bg-neutral-900/80">
              <tr>
                <th className="px-3 py-2 text-left w-[40%]">Entity Key</th>
                <th className="px-3 py-2 text-left">Preview</th>
                <th className="px-3 py-2 text-left w-[160px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((r, i) => (
                <tr key={i} className="odd:bg-neutral-900/40">
                  <td className="px-3 py-2 font-mono text-[11px] break-all">
                    {r.entityKey}
                  </td>
                  <td className="px-3 py-2 text-xs text-neutral-300 truncate">
                    {(() => {
                      const d = decodeEntityData(r);
                      return typeof d === "string" ? d : JSON.stringify(d);
                    })()}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => onInspect(r)}>
                        Inspect
                      </Button>
                      <Button variant="secondary" onClick={() => onEdit(r)}>
                        Edit
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {pageData.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-3 py-8 text-center text-neutral-500"
                  >
                    No rows
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="text-xs text-neutral-500">
            Page {page} of{" "}
            {Math.max(1, Math.ceil(queryResults.length / pageSize))}
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                setPage((p) =>
                  Math.min(
                    Math.ceil(queryResults.length / pageSize) || 1,
                    p + 1
                  )
                )
              }
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    {inspecting && (
      <Card>
        <CardHeader>
          <CardTitle>Entity Inspector</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>entityKey</Label>
            <div className="font-mono text-xs break-all bg-neutral-950 border border-neutral-800 rounded-lg p-2">
              {inspecting.entityKey}
            </div>
          </div>
          <div>
            <Label>Meta</Label>
            <pre className="bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs overflow-auto max-h-48">
              {JSON.stringify(inspectMeta, null, 2)}
            </pre>
          </div>
          <div className="md:col-span-2">
            <Label>Payload</Label>
            <pre className="bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs overflow-auto max-h-64">
              {inspectData}
            </pre>
          </div>
        </CardContent>
      </Card>
    )}
  </div>
);

export default Explorer;
