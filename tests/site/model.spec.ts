import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
const fixture = JSON.parse(
  readFileSync(
    new URL("../../packages/fixtures/demo/case.json", import.meta.url),
    "utf8",
  ),
);
import {
  atlasLinks,
  atlasNodes,
  chronology,
  matches,
  matchesText,
  searchIndex,
  refKey,
  type CaseRecord,
} from "../../packages/workbench/model";
const records = fixture.records as CaseRecord[];
test("search is literal, Unicode-aware and does not mutate evidence or invent links", () => {
  const before = JSON.stringify(records);
  const hits = records.filter((r) => matches(r, "ＥＧＧＳ"));
  expect(hits.map((r) => r.id)).toContain(
    "00000000-0000-4000-8000-000000000043",
  );
  expect(records.filter((r) => matches(r, "eggs nonexistent")).length).toBe(0);
  const edges = atlasLinks(records).filter((l) => l.recordId);
  expect(edges).toHaveLength(1);
  expect(edges[0].tier).toBe("OBSERVED");
  expect(
    edges.some((l) => l.from.endsWith("000030") && l.to.endsWith("000034")),
  ).toBe(false);
  expect(atlasNodes(records).some((r) => r.kind === "Scenario")).toBe(false);
  expect(JSON.stringify(records)).toBe(before);
});
test("references resolve exact versions, and unaccepted relationships are never drawn", () => {
  const edge = records.find((r) => r.kind === "Edge")!;
  const from = records.find(
    (r) => r.id === ("from_ref" in edge ? edge.from_ref.id : ""),
  )!;
  const changed = records.map((r) =>
    r.id === from.id ? { ...r, revision: 2 } : r,
  ) as CaseRecord[];
  expect(atlasLinks(changed).filter((l) => l.recordId)).toHaveLength(0);
  const recovered = atlasLinks(changed, [from]).filter((l) => l.recordId);
  expect(recovered).toHaveLength(1);
  expect(recovered[0].from).toBe(refKey(from));
  expect(recovered[0].from).not.toBe(`${from.id}:2`);
  expect(
    atlasLinks(
      records.map((r) => (r.kind === "Edge" ? { ...r, review: "PENDING" } : r)),
    ).filter((l) => l.recordId),
  ).toHaveLength(0);
});
test("unknown chronology remains undated and sorting preserves original interval boundaries", () => {
  const sorted = chronology(records);
  const first = sorted[0];
  expect("occurrence" in first && first.occurrence.end_inclusive).toBe(false);
  const last = sorted.at(-1)!;
  expect("occurrence" in last && last.occurrence.start).toBeNull();
  expect(
    sorted.filter((r) => "occurrence" in r && r.occurrence.start === null)
      .length,
  ).toBeGreaterThan(0);
});

test("source search includes accepted quoted passages at the exact source version", () => {
  const source = records.find(
    (r) => r.kind === "Evidence" && r.original_filename === "receipt.txt",
  )!;
  const index = searchIndex(records);
  expect(matchesText(index.get(refKey(source))!, "eggs")).toBe(true);
  const changed = records.map((r) =>
    r.id === source.id ? { ...r, revision: 2 } : r,
  ) as CaseRecord[];
  expect(matchesText(searchIndex(changed).get(`${source.id}:2`)!, "eggs")).toBe(
    false,
  );
});

test("chronology compares instants across UTC offsets without changing source values", () => {
  const source = records.find((r) => r.kind === "Observation")!;
  if (!("occurrence" in source)) throw Error("Missing time fixture");
  const times = ["2026-09-11T04:00:00Z", "2026-09-11T05:00:00+02:00"];
  const inputs = times.map((start, i) => ({
    ...source,
    id: String(i),
    occurrence: { ...source.occurrence, start, end: start, timezone: "UTC" },
  }));
  const before = JSON.stringify(inputs);
  expect(chronology(inputs).map((r) => r.id)).toEqual(["1", "0"]);
  expect(JSON.stringify(inputs)).toBe(before);
});

test("map budget includes a matching record beyond the initial 80 nodes", async () => {
  const { atlasSubset } = await import("../../packages/workbench/model");
  const source = records.find((r) => r.kind === "Entity")!;
  const rows = Array.from({ length: 501 }, (_, i) => ({
    ...source,
    id: String(i).padStart(4, "0"),
  }));
  expect(atlasSubset(rows, [rows[500]])[0].id).toBe("0500");
  expect(atlasSubset(rows, rows)).toHaveLength(80);
});
