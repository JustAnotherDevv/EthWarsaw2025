import React from "react";
import {
  QueryBar,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/consoleUI";
import { decodeEntityData } from "@/utils/helpers";

const QueryConsole: React.FC<{
  query: string;
  setQuery: (v: string) => void;
  runQuery: () => void;
  connected: boolean;
  results: any[];
}> = ({ query, setQuery, runQuery, connected, results }) => (
  <div className="space-y-4">
    <QueryBar
      value={query}
      setValue={setQuery}
      onRun={runQuery}
      connected={connected}
      placeholder='type = "message" && version = 1'
    />
    <Card>
      <CardHeader>
        <CardTitle>Raw Results</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-hidden">
        <pre className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs overflow-y-auto max-h-[60vh]">
          {JSON.stringify(
            results.map((r) => ({
              entityKey: r.entityKey,
              data: decodeEntityData(r),
            })),
            null,
            2
          )}
        </pre>
      </CardContent>
    </Card>
  </div>
);

export default QueryConsole;
