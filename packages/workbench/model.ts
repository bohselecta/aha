import type { Record as CaseRecord, Ref } from "../contracts/contracts";
export type { Record as CaseRecord } from "../contracts/contracts";
export function recordTitle(r: CaseRecord): string {
  if ("title" in r) return r.title;
  if ("label" in r) return r.label;
  if ("statement" in r) return r.statement;
  if ("claim" in r) return r.claim;
  if ("text" in r) return r.text;
  if (r.kind === "Evidence") return r.original_filename;
  if (r.kind === "Edge") return r.relation.replaceAll("_", " ").toLowerCase();
  if (r.kind === "Contradiction") return "Conflicting accounts";
  return `${r.kind} ${r.id.slice(-4)}`;
}
export function human(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^./, (c) => c.toUpperCase());
}
export function searchableText(r: CaseRecord) {
  return [
    recordTitle(r),
    "summary" in r ? r.summary : "",
    "citations" in r ? r.citations.map((c) => c.quote ?? "").join(" ") : "",
    r.kind === "Contradiction"
      ? [...r.qualifications, ...r.resolution_targets].join(" ")
      : "",
  ].join(" ");
}
export function matches(r: CaseRecord, query: string) {
  return matchesText(searchableText(r), query);
}
export function matchesText(text: string, query: string) {
  const normalize = (s: string) =>
    s.normalize("NFKC").toLocaleLowerCase("en-US");
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  return terms.every((t) => normalize(text).includes(t));
}
export function searchIndex(
  records: CaseRecord[],
  sourceTexts?: Record<string, string>,
) {
  const index = new Map(records.map((r) => [refKey(r), searchableText(r)]));
  for (const r of records) {
    if (r.kind === "Evidence" && sourceTexts?.[r.original_filename])
      index.set(
        refKey(r),
        (index.get(refKey(r)) ?? "") + " " + sourceTexts[r.original_filename],
      );
    if ("citations" in r && r.review === "ACCEPTED")
      for (const c of r.citations) {
        const key = refKey(c.evidence);
        if (index.has(key) && c.quote)
          index.set(key, index.get(key) + " " + c.quote);
      }
  }
  return index;
}
export function refKey(r: Ref) {
  return `${r.id}:${r.revision}`;
}
export type Link = {
  from: string;
  to: string;
  label: string;
  recordId?: string;
  tier?: string;
};
export function atlasLinks(
  records: CaseRecord[],
  historical: CaseRecord[] = [],
): Link[] {
  const available = new Map(
    [...records, ...historical].map((r) => [refKey(r), r]),
  );
  const links: Link[] = [];
  const add = (from: CaseRecord, to: Ref, label: string) => {
    if (available.has(refKey(to)))
      links.push({ from: refKey(from), to: refKey(to), label });
  };
  for (const r of records) {
    if ("citations" in r)
      for (const c of r.citations) add(r, c.evidence, "Cites source");
    if ("subject_refs" in r)
      for (const ref of r.subject_refs) add(r, ref, "Names subject");
    if (r.kind === "Event")
      for (const ref of r.observation_refs) add(r, ref, "Based on statement");
    if (
      r.kind === "Edge" &&
      r.review === "ACCEPTED" &&
      available.has(refKey(r.from_ref)) &&
      available.has(refKey(r.to_ref))
    )
      links.push({
        from: refKey(r.from_ref),
        to: refKey(r.to_ref),
        label: human(r.relation),
        recordId: r.id,
        tier: r.tier,
      });
  }
  const unique = new Map<string, Link>();
  for (const link of links)
    unique.set(
      JSON.stringify([link.from, link.to, link.label, link.recordId]),
      link,
    );
  return [...unique.values()];
}
export function atlasNodes(records: CaseRecord[]) {
  return records
    .filter(
      (r) =>
        [
          "Evidence",
          "Entity",
          "Observation",
          "Event",
          "Interpretation",
          "Edge",
        ].includes(r.kind) &&
        (!("review" in r) || r.review === "ACCEPTED"),
    )
    .sort((a, b) => a.id.localeCompare(b.id));
}
export function chronology(records: CaseRecord[]) {
  return records
    .filter((r) => "occurrence" in r)
    .sort((a, b) => {
      const time = (r: CaseRecord) =>
        "occurrence" in r && r.occurrence.timezone
          ? (r.occurrence.start ?? r.occurrence.end)
          : null;
      const at = time(a),
        bt = time(b);
      const ai = at ? Date.parse(at) : NaN;
      const bi = bt ? Date.parse(bt) : NaN;
      return Number.isFinite(ai) && Number.isFinite(bi)
        ? ai - bi || a.id.localeCompare(b.id)
        : at
          ? -1
          : bt
            ? 1
            : a.id.localeCompare(b.id);
    });
}

/** Select matches before applying the rendering budget; never hide the only match. */
export function atlasSubset(
  records: CaseRecord[],
  shown: CaseRecord[],
  limit = 80,
) {
  const nodes = atlasNodes(records).filter((r) => r.kind !== "Edge");
  const visible = new Set(shown.map(refKey));
  return [
    ...nodes.filter((r) => visible.has(refKey(r))),
    ...nodes.filter((r) => !visible.has(refKey(r))),
  ].slice(0, limit);
}
