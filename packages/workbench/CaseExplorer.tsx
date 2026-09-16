import { useMemo, useRef, useState } from "react";
import type { Evidence, Ref } from "../contracts/contracts";
import {
  atlasLinks,
  atlasNodes,
  atlasSubset,
  chronology,
  human,
  matchesText,
  searchIndex,
  recordTitle,
  refKey,
  type CaseRecord,
} from "./model";
import "./explorer.css";
type View = "Atlas" | "Timeline" | "Questions" | "Possibilities" | "Sources";
const views: View[] = [
  "Atlas",
  "Timeline",
  "Questions",
  "Possibilities",
  "Sources",
];
const descriptiveKinds = [
  "Evidence",
  "Entity",
  "Observation",
  "Interpretation",
  "Event",
  "Edge",
  "Contradiction",
  "Hypothesis",
  "Question",
  "Scenario",
];
export function CaseExplorer({
  records,
  historical = [],
  caseTitle,
  caseRevision,
  sourceTexts,
  onOpenSource,
  initialView = "Atlas",
  initialSelected = null,
  headingLevel = 2,
}: {
  records: CaseRecord[];
  historical?: CaseRecord[];
  caseTitle: string;
  caseRevision: number;
  sourceTexts?: Record<string, string>;
  onOpenSource?: (r: Evidence) => void;
  initialView?: View;
  initialSelected?: string | null;
  headingLevel?: 1 | 2;
}) {
  const [view, setView] = useState<View>(initialView),
    [query, setQuery] = useState(""),
    [basis, setBasis] = useState("All"),
    [mode, setMode] = useState<"Map" | "Table">("Map"),
    [selected, setSelected] = useState<string | null>(initialSelected);
  const [page, setPage] = useState(0);
  const Heading = headingLevel === 1 ? "h1" : "h2";
  const detail = useRef<HTMLDivElement>(null);
  const trigger = useRef<Element | null>(null);
  const closeDetail = () => {
    setSelected(null);
    if (
      trigger.current instanceof HTMLElement ||
      trigger.current instanceof SVGElement
    )
      trigger.current.focus();
  };
  const textIndex = useMemo(
    () => searchIndex(records, sourceTexts),
    [records, sourceTexts],
  );
  const graphRecords = useMemo(
    () => [...records, ...historical],
    [records, historical],
  );
  const connections = useMemo(
    () => atlasLinks(records, historical),
    [records, historical],
  );
  const visible = useMemo(
    () =>
      records.filter(
        (r) =>
          descriptiveKinds.includes(r.kind) &&
          matchesText(textIndex.get(refKey(r)) ?? "", query) &&
          (basis === "All" || ("tier" in r && r.tier === basis)),
      ),
    [records, query, basis, textIndex],
  );
  const byRef = useMemo(
    () => new Map(graphRecords.map((r) => [refKey(r), r])),
    [graphRecords],
  );
  const chosen = selected
    ? (byRef.get(selected) ??
      records.find((r) => r.id === selected || refKey(r) === selected))
    : undefined;
  const select = (id: string) => {
    if (!detail.current?.contains(document.activeElement))
      trigger.current = document.activeElement;
    setSelected(id);
    requestAnimationFrame(() => detail.current?.focus());
  };
  const reference = (ref: Ref) => {
    const r = byRef.get(refKey(ref));
    return r ? (
      <button
        className="ex-link"
        onClick={() => select(refKey(r))}
        key={refKey(ref)}
      >
        {recordTitle(r)}
        {records.some(
          (current) => current.id === r.id && current.revision !== r.revision,
        )
          ? ` · cited version ${r.revision}`
          : ""}
      </button>
    ) : (
      <span key={refKey(ref)}>
        Referenced version unavailable ({ref.id.slice(-6)}, version{" "}
        {ref.revision})
      </span>
    );
  };
  const clear = () => {
    setPage(0);
    setQuery("");
    setBasis("All");
  };
  const results =
    view === "Atlas"
      ? atlasNodes(visible)
      : view === "Timeline"
        ? chronology(visible)
        : visible.filter((r) =>
            view === "Sources"
              ? r.kind === "Evidence"
              : view === "Questions"
                ? ["Question", "Contradiction", "Hypothesis"].includes(r.kind)
                : r.kind === "Scenario",
          );
  const currentPage = Math.min(
    page,
    Math.max(0, Math.ceil(results.length / 100) - 1),
  );
  const pageResults = results.slice(currentPage * 100, (currentPage + 1) * 100);
  return (
    <section className="explorer" aria-label="Case explorer">
      <div className="ex-top">
        <div>
          <span className="ex-kicker">CASE WORKSPACE</span>
          <Heading>{caseTitle}</Heading>
        </div>
        <span className="ex-revision">Case revision {caseRevision}</span>
      </div>
      <div className="ex-tabs" role="group" aria-label="Case views">
        {views.map((v) => (
          <button
            key={v}
            aria-pressed={view === v}
            onClick={() => {
              setPage(0);
              setView(v);
              setSelected(null);
            }}
          >
            {v === "Questions" ? "Questions & conflicts" : v}
          </button>
        ))}
      </div>
      <div className="ex-controls">
        <label>
          Search this case
          <input
            type="search"
            value={query}
            maxLength={2000}
            onChange={(e) => {
              setPage(0);
              setQuery(e.target.value);
            }}
            placeholder="Search words, names or details…"
          />
        </label>
        <label>
          Evidence basis
          <select
            value={basis}
            onChange={(e) => {
              setPage(0);
              setBasis(e.target.value);
            }}
          >
            {["All", "DOCUMENTED", "OBSERVED", "INFERRED", "SPECULATIVE"].map(
              (t) => (
                <option key={t} value={t}>
                  {human(t)}
                </option>
              ),
            )}
          </select>
        </label>
        <button onClick={clear} disabled={!query && basis === "All"}>
          Clear lens
        </button>
      </div>
      <div className="ex-search-info">
        <p role="status">
          {results.length} {results.length === 1 ? "record" : "records"} ·{" "}
          {query ? "Matching all search words" : "All records in this view"}
        </p>
        <span>
          Keyword search ·{" "}
          {sourceTexts
            ? "records and full sample sources"
            : "labels, statements and cited text"}
        </span>
      </div>
      <div className={`ex-layout ${chosen ? "" : "no-selection"}`}>
        <div className="ex-content">
          <h2 className="ex-view-title">
            {view === "Questions"
              ? "Questions & conflicts"
              : view === "Atlas"
                ? "Recorded connections"
                : view}
          </h2>
          {view === "Atlas" && (
            <>
              <div className="ex-view-options">
                <p>Select a record to follow its sources and connections.</p>
                <div role="group" aria-label="Atlas display">
                  {(["Map", "Table"] as const).map((m) => (
                    <button
                      key={m}
                      aria-pressed={mode === m}
                      onClick={() => setMode(m)}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="ex-legend">
                <span>━ Source citation</span>
                <span>┄ Named subject</span>
                <span>━━ Reviewed relationship</span>
              </div>
              <p className="ex-help">
                Lines show recorded references, not proof of involvement. Shared
                search words do not create connections.
              </p>
            </>
          )}
          {view === "Possibilities" && (
            <p className="ex-callout">
              AI-generated possibilities — not evidence. Compare assumptions and
              questions before drawing conclusions.
            </p>
          )}
          {results.length === 0 ? (
            <div className="ex-empty">
              <h3>
                {query || basis !== "All"
                  ? "No matches under these filters"
                  : "No records in this view"}
              </h3>
              <p>
                {query || basis !== "All"
                  ? "Try fewer words or clear the lens. Other source material may contain information not captured here."
                  : view === "Possibilities"
                    ? "Saved scenarios will appear here when they are available."
                    : view === "Questions"
                      ? "Recorded questions, conflicts and retired explanations appear here."
                      : "Add and review source material to begin."}
              </p>
              {(query || basis !== "All") && (
                <button onClick={clear}>Show all records</button>
              )}
            </div>
          ) : view === "Atlas" && mode === "Map" ? (
            <Atlas
              records={graphRecords}
              shown={[
                ...results,
                ...historical.filter((r) => !query && basis === "All"),
              ]}
              selected={selected}
              select={select}
            />
          ) : view === "Atlas" || view === "Timeline" ? (
            <div
              className="ex-table-scroll"
              tabIndex={0}
              role="region"
              aria-label={view + " records"}
            >
              <table>
                <thead>
                  <tr>
                    <th>Record</th>
                    <th>Basis</th>
                    <th>
                      {view === "Timeline"
                        ? "Time as recorded"
                        : "Sources / references"}
                    </th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pageResults.map((r) => (
                    <tr key={r.id}>
                      <td>
                        {recordTitle(r)}
                        <small>{human(r.kind)}</small>
                      </td>
                      <td>
                        <Basis r={r} />
                      </td>
                      <td>
                        {view === "Timeline" && "occurrence" in r ? (
                          <>
                            {r.occurrence.raw ?? "Time unknown"}
                            <small>
                              {human(r.occurrence.precision)} ·{" "}
                              {r.occurrence.timezone ?? "Timezone unresolved"}
                            </small>
                          </>
                        ) : "citations" in r ? (
                          `${r.citations.length} cited sources`
                        ) : r.kind === "Evidence" ? (
                          "Original file"
                        ) : (
                          "See record details"
                        )}
                      </td>
                      <td>
                        <button
                          aria-label={`Inspect ${recordTitle(r)}`}
                          onClick={() => select(r.id)}
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="ex-cards">
              {pageResults.map((r) => (
                <article key={r.id}>
                  <div className="ex-card-meta">
                    <Basis r={r} />
                    {"status" in r && <span>{human(r.status)}</span>}
                    {r.kind === "Hypothesis" && <span>{human(r.state)}</span>}
                  </div>
                  <h3>
                    {r.kind === "Contradiction"
                      ? "A difference worth checking"
                      : recordTitle(r)}
                  </h3>
                  {r.kind === "Contradiction" && (
                    <p>{r.qualifications.join(" ")}</p>
                  )}
                  {r.kind === "Scenario" && (
                    <>
                      <p>{r.summary}</p>
                      <p className="ex-help">
                        Saved possibility · {human(r.review)} review
                      </p>
                    </>
                  )}
                  {r.kind === "Evidence" && (
                    <p>{(r.bytes / 1024).toFixed(1)} KB · Original file</p>
                  )}
                  {r.kind === "Question" && (
                    <p>Next step: {r.source_to_check}</p>
                  )}
                  {r.kind === "Hypothesis" && (
                    <p>{r.retirement_reason ?? r.rationale}</p>
                  )}
                  <button
                    onClick={() => select(r.id)}
                    aria-label={`Inspect ${recordTitle(r)}`}
                  >
                    View details →
                  </button>
                </article>
              ))}
            </div>
          )}
          {results.length > 100 && !(view === "Atlas" && mode === "Map") && (
            <nav className="ex-view-options" aria-label="Result pages">
              <button
                disabled={currentPage === 0}
                onClick={() => setPage(currentPage - 1)}
              >
                Previous page
              </button>
              <span>
                Page {currentPage + 1} of {Math.ceil(results.length / 100)} ·{" "}
                {results.length} records
              </span>
              <button
                disabled={(currentPage + 1) * 100 >= results.length}
                onClick={() => setPage(currentPage + 1)}
              >
                Next page
              </button>
            </nav>
          )}
        </div>
        <div
          className="ex-inspector"
          ref={detail}
          tabIndex={-1}
          onKeyDown={(e) => {
            if (e.key === "Escape") closeDetail();
          }}
          aria-label="Record details"
        >
          {chosen ? (
            <>
              <div className="ex-detail-heading">
                <span className="ex-kicker">RECORD DETAILS</span>
                <button onClick={closeDetail} aria-label="Close record details">
                  ×
                </button>
              </div>
              <Basis r={chosen} />
              <h3>{recordTitle(chosen)}</h3>
              {"review" in chosen && (
                <p className="ex-help">
                  {human(chosen.review)} review
                  {"origin" in chosen && chosen.origin === "AI_SYNTHETIC"
                    ? " · AI-generated possibility — not evidence"
                    : ""}
                </p>
              )}
              {query && (
                <div className="ex-callout">
                  <strong>Why shown?</strong>
                  <p>
                    {matchesText(textIndex.get(refKey(chosen)) ?? "", query)
                      ? `Its label, statement or cited text contains all search words: “${query}”.`
                      : "Opened from a reference; this record does not match all search words."}
                  </p>
                </div>
              )}
              {"rationale" in chosen && <p>{chosen.rationale}</p>}
              {chosen.kind === "Evidence" && (
                <>
                  {sourceTexts?.[chosen.original_filename] !== undefined ? (
                    <>
                      <h4>Original text</h4>
                      <pre className="ex-source-text" data-testid="source-text">
                        {sourceTexts[chosen.original_filename]}
                      </pre>
                    </>
                  ) : onOpenSource ? (
                    <button onClick={() => onOpenSource(chosen)}>
                      Review original source ↗
                    </button>
                  ) : (
                    <p>Original content is unavailable here.</p>
                  )}
                  <details>
                    <summary>File details</summary>
                    <p>
                      {chosen.media_type} · {chosen.bytes} bytes
                    </p>
                    <p className="ex-hash">SHA-256: {chosen.sha256}</p>
                  </details>
                </>
              )}
              {"occurrence" in chosen && (
                <>
                  <h4>Time as recorded</h4>
                  <p>{chosen.occurrence.raw ?? "Time unknown"}</p>
                  <dl>
                    <dt>Precision</dt>
                    <dd>{human(chosen.occurrence.precision)}</dd>
                    <dt>Timezone</dt>
                    <dd>{chosen.occurrence.timezone ?? "Unresolved"}</dd>
                    <dt>Clock</dt>
                    <dd>{chosen.occurrence.clock_source ?? "Unknown"}</dd>
                    <dt>Lower bound</dt>
                    <dd>
                      {chosen.occurrence.start ??
                        (chosen.occurrence.precision === "UNKNOWN"
                          ? "Unknown"
                          : "Unbounded")}{" "}
                      {chosen.occurrence.start
                        ? chosen.occurrence.start_inclusive
                          ? "(inclusive)"
                          : "(exclusive)"
                        : ""}
                    </dd>
                    <dt>Upper bound</dt>
                    <dd>
                      {chosen.occurrence.end ??
                        (chosen.occurrence.precision === "UNKNOWN"
                          ? "Unknown"
                          : "Unbounded")}{" "}
                      {chosen.occurrence.end
                        ? chosen.occurrence.end_inclusive
                          ? "(inclusive)"
                          : "(exclusive)"
                        : ""}
                    </dd>
                  </dl>
                </>
              )}
              {chosen.kind === "Contradiction" && (
                <>
                  <p className="ex-callout">
                    {human(chosen.strength)} conflict · {human(chosen.status)}
                  </p>
                  <h4>Accounts to compare</h4>
                  <div className="ex-refs">
                    {chosen.proposition_refs.map(reference)}
                  </div>
                  <h4>What remains uncertain</h4>
                  <ul>
                    {chosen.qualifications.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                  <h4>Questions worth checking</h4>
                  <ul>
                    {chosen.resolution_targets.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </>
              )}
              {chosen.kind === "Question" && (
                <>
                  <h4>Where to look</h4>
                  <p>{chosen.source_to_check}</p>
                  <h4>What different findings would change</h4>
                  {chosen.outcomes.map((o) => (
                    <div className="ex-outcome" key={o.observation}>
                      <p>{o.observation}</p>
                      {[
                        ["Supports", o.supports_scenario_ids],
                        ["Weakens", o.weakens_scenario_ids],
                      ].map(([heading, ids]) => (
                        <div key={heading as string}>
                          <strong>{heading}</strong>
                          <div className="ex-refs">
                            {(ids as string[]).map((id) => {
                              const s = records.find((r) => r.id === id);
                              return s ? (
                                <button
                                  key={id}
                                  className="ex-link"
                                  onClick={() => select(id)}
                                >
                                  {recordTitle(s)}
                                </button>
                              ) : (
                                <p key={id}>Scenario unavailable</p>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                  <h4>Limits</h4>
                  <ul>
                    {chosen.limitations.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </>
              )}
              {chosen.kind === "Hypothesis" && (
                <>
                  <p className="ex-callout">
                    {human(chosen.state)} explanation
                    {chosen.state === "RETIRED"
                      ? ": new evidence and review required."
                      : ""}
                  </p>
                  <p>{chosen.retirement_reason}</p>
                  <h4>Would weaken this idea</h4>
                  <ul>
                    {chosen.weaken_if.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </>
              )}
              {chosen.kind === "Scenario" && (
                <>
                  <p>{chosen.summary}</p>
                  <h4>Proposed sequence</h4>
                  {chosen.steps.map((s) => (
                    <div className="ex-outcome" key={s.id}>
                      <strong>
                        {s.origin === "SOURCE_BOUND"
                          ? "From a source"
                          : "Possibility — not evidence"}
                      </strong>
                      <p>{s.description}</p>
                      {s.assumptions.length > 0 && (
                        <>
                          <h4>Assumptions</h4>
                          <ul>
                            {s.assumptions.map((t) => (
                              <li key={t}>{t}</li>
                            ))}
                          </ul>
                        </>
                      )}
                      <div className="ex-refs">
                        {s.source_refs.map(reference)}
                      </div>
                    </div>
                  ))}
                  <h4>Questions worth checking</h4>
                  <div className="ex-refs">
                    {chosen.question_ids.map((id) => {
                      const q = records.find((r) => r.id === id);
                      return q ? (
                        <button
                          className="ex-link"
                          key={id}
                          onClick={() => select(id)}
                        >
                          {recordTitle(q)}
                        </button>
                      ) : (
                        <p key={id}>Question unavailable</p>
                      );
                    })}
                  </div>
                </>
              )}
              {chosen.kind === "Edge" && (
                <>
                  <h4>Recorded relationship</h4>
                  <div className="ex-refs">
                    {reference(chosen.from_ref)}
                    <span>{human(chosen.relation)}</span>
                    {reference(chosen.to_ref)}
                  </div>
                </>
              )}
              {"subject_refs" in chosen && chosen.subject_refs.length > 0 && (
                <>
                  <h4>Named subjects</h4>
                  <div className="ex-refs">
                    {chosen.subject_refs.map(reference)}
                  </div>
                </>
              )}
              {"citations" in chosen && chosen.citations.length > 0 && (
                <>
                  <h4>Source passages</h4>
                  {chosen.citations.map((c, i) => (
                    <div className="ex-citation" key={i}>
                      {c.quote && <blockquote>{c.quote}</blockquote>}
                      {reference(c.evidence)}
                      <small>
                        Source version {c.evidence.revision}
                        {c.locator.type === "text"
                          ? ` · Characters ${c.locator.start}–${c.locator.end}`
                          : ""}
                      </small>
                    </div>
                  ))}
                </>
              )}
              {"support_refs" in chosen && chosen.support_refs.length > 0 && (
                <>
                  <h4>Supporting records</h4>
                  <div className="ex-refs">
                    {chosen.support_refs.map(reference)}
                  </div>
                </>
              )}
              {"counter_refs" in chosen && chosen.counter_refs.length > 0 && (
                <>
                  <h4>Counter-evidence</h4>
                  <div className="ex-refs">
                    {chosen.counter_refs.map(reference)}
                  </div>
                </>
              )}
              {connections.some(
                (l) =>
                  l.to === refKey(chosen) ||
                  (l.recordId && l.from === refKey(chosen)),
              ) && (
                <>
                  <h4>Follow recorded connections</h4>
                  <div className="ex-refs">
                    {connections
                      .filter(
                        (l) =>
                          l.to === refKey(chosen) ||
                          (l.recordId && l.from === refKey(chosen)),
                      )
                      .slice(0, 50)
                      .map((l, i) => {
                        const other = graphRecords.find(
                          (r) =>
                            refKey(r) ===
                            (l.from === refKey(chosen) ? l.to : l.from),
                        );
                        return (
                          other && (
                            <div key={i}>
                              <small>
                                {l.from === refKey(chosen)
                                  ? l.label
                                  : l.label === "Cites source"
                                    ? "Cited by"
                                    : l.label === "Names subject"
                                      ? "Named in"
                                      : "Referenced by"}
                                {l.tier ? ` · ${human(l.tier)}` : ""}
                              </small>
                              <button
                                className="ex-link"
                                aria-label={`Follow ${recordTitle(other)}`}
                                onClick={() =>
                                  select(l.recordId ?? refKey(other))
                                }
                              >
                                {recordTitle(other)}
                              </button>
                            </div>
                          )
                        );
                      })}
                  </div>
                  {connections.filter(
                    (l) =>
                      l.to === refKey(chosen) ||
                      (l.recordId && l.from === refKey(chosen)),
                  ).length > 50 && (
                    <p className="ex-help">
                      Showing the first 50 recorded connections.
                    </p>
                  )}
                </>
              )}
              <details>
                <summary>Record history reference</summary>
                <p className="ex-hash">{chosen.id}</p>
                <p>
                  Version {chosen.revision} · Added at case revision{" "}
                  {chosen.introduced_case_revision}
                </p>
              </details>
            </>
          ) : (
            <div className="ex-inspector-empty">
              <span aria-hidden="true">⌕</span>
              <h3>Look a little closer.</h3>
              <p>
                Select a record to read its source passages, see what supports
                it, and find questions worth checking.
              </p>
              <p className="ex-help">
                Your view changes; the case records stay intact.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
function Basis({ r }: { r: CaseRecord }) {
  return (
    <span className={`ex-basis ${"tier" in r ? r.tier.toLowerCase() : ""}`}>
      {r.kind === "Scenario"
        ? "AI possibility"
        : "tier" in r
          ? human(r.tier)
          : human(r.kind)}
    </span>
  );
}
function Atlas({
  records,
  shown,
  selected,
  select,
}: {
  records: CaseRecord[];
  shown: CaseRecord[];
  selected: string | null;
  select: (id: string) => void;
}) {
  const all = atlasNodes(records).filter((r) => r.kind !== "Edge");
  const [limit, setLimit] = useState(80);
  const capped = atlasSubset(records, shown, limit).sort((a, b) =>
    refKey(a).localeCompare(refKey(b)),
  );
  const visible = new Set(shown.map(refKey));
  const lanes = [
    capped.filter((r) => r.kind === "Evidence"),
    capped.filter((r) => r.kind !== "Evidence" && r.kind !== "Entity"),
    capped.filter((r) => r.kind === "Entity"),
  ];
  const positions = new Map(
    lanes.flatMap((list, lane) =>
      list.map(
        (r, index) =>
          [refKey(r), { x: 20 + lane * 315, y: 60 + index * 100 }] as const,
      ),
    ),
  );
  const availableLinks = atlasLinks(records).filter(
    (l) => positions.has(l.from) && positions.has(l.to),
  );
  const links = availableLinks.slice(0, 1500);
  const height = Math.max(260, ...lanes.map((l) => l.length * 100 + 70));
  return (
    <>
      <div
        className="ex-map-scroll"
        tabIndex={0}
        role="region"
        aria-label="Case map"
      >
        <svg
          viewBox={`0 0 940 ${height}`}
          width="940"
          height={height}
          role="group"
          aria-label="Sources, statements and subjects"
        >
          <title>Recorded references by source, statement and subject</title>
          {["Sources", "Statements & events", "People, places & objects"].map(
            (t, i) => (
              <text className="ex-lane-label" key={t} x={20 + i * 315} y={28}>
                {t}
              </text>
            ),
          )}
          {links.map((l, i) => {
            const a = positions.get(l.from)!,
              b = positions.get(l.to)!;
            return (
              <path
                key={i}
                className={`ex-wire ${l.tier?.toLowerCase() ?? ""} ${l.recordId ? "relationship" : l.label === "Names subject" ? "subject" : ""} ${visible.has(l.from) && visible.has(l.to) ? "" : "dim"}`}
                d={`M${a.x + 130},${a.y + 30} C${a.x + 160},${a.y + 30} ${b.x + 100},${b.y + 30} ${b.x + 130},${b.y + 30}`}
              >
                <title>
                  {l.label}
                  {l.tier ? ` · ${human(l.tier)}` : ""}
                </title>
              </path>
            );
          })}
          {capped.map((r) => {
            const p = positions.get(refKey(r))!;
            return (
              <g
                key={refKey(r)}
                role="button"
                tabIndex={0}
                aria-label={`Inspect ${recordTitle(r)}`}
                aria-pressed={r.id === selected || refKey(r) === selected}
                onClick={() => select(refKey(r))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    select(refKey(r));
                  }
                }}
                transform={`translate(${p.x},${p.y})`}
                className={`ex-node ${visible.has(refKey(r)) ? "" : "dim"} ${r.id === selected || refKey(r) === selected ? "selected" : ""}`}
              >
                <rect width="265" height="69" rx="9" />
                <text x="12" y="22" className="ex-node-kind">
                  {human(r.kind)} · v{r.revision}
                  {"tier" in r ? ` · ${human(r.tier)}` : ""}
                </text>
                <text x="12" y="46">
                  {recordTitle(r).length > 31
                    ? recordTitle(r).slice(0, 30) + "…"
                    : recordTitle(r)}
                </text>
                <title>{recordTitle(r)}</title>
              </g>
            );
          })}
        </svg>
      </div>
      {all.length > capped.length && (
        <div className="ex-callout">
          <p>
            Map overview: {capped.length} of {all.length} records. Search
            matches appear first. All results are available in Table.
          </p>
          {limit < 500 && (
            <button onClick={() => setLimit(Math.min(500, limit + 80))}>
              Show more records
            </button>
          )}
        </div>
      )}
      {availableLinks.length > links.length && (
        <p className="ex-callout">
          Showing {links.length} of {availableLinks.length} map connections.
          Inspect individual records in Table for their references.
        </p>
      )}
      <details className="ex-map-links">
        <summary>Recorded connections · {links.length}</summary>
        {links.map((l, i) => (
          <p key={i}>
            {recordTitle(records.find((r) => refKey(r) === l.from)!)} —{" "}
            <strong>
              {l.label}
              {l.tier ? ` (${human(l.tier)})` : ""}
            </strong>{" "}
            — {recordTitle(records.find((r) => refKey(r) === l.to)!)}
            {l.recordId && (
              <button onClick={() => select(l.recordId!)}>
                Inspect relationship
              </button>
            )}
          </p>
        ))}
      </details>
    </>
  );
}
