import { useEffect, useState } from "react";
import type {
  Command,
  Record as CaseRecord,
  Proposal,
} from "../../../../packages/contracts/contracts";
import {
  human,
  recordTitle,
  refKey,
} from "../../../../packages/workbench/model";
import { request } from "../api";
import { ReferencePicker, chosenRefs, referenceOf } from "./RecordEditor";

export function CaseOverview({
  records,
  proposals,
  navigate,
  inspect,
}: {
  records: CaseRecord[];
  proposals: Proposal[];
  navigate: (view: string) => void;
  inspect: (r: CaseRecord) => void;
}) {
  const sources = records.filter((r) => r.kind === "Evidence");
  const textSources = new Set(
    records
      .filter(
        (r) =>
          r.kind === "Derivative" &&
          ["TEXT", "OCR"].includes(r.derivative_type),
      )
      .map((r) => (r.kind === "Derivative" ? r.evidence.id : "")),
  );
  const pending = proposals.filter((p) => p.status === "PENDING");
  const openQuestions = records.filter(
    (r) => r.kind === "Question" && ["OPEN", "IN_PROGRESS"].includes(r.status),
  );
  const conflicts = records.filter(
    (r) =>
      r.kind === "Contradiction" &&
      ["CANDIDATE", "UNRESOLVED"].includes(r.status),
  );
  return (
    <>
      <section className="panel">
        <h2>Where would you like to begin?</h2>
        <div className="overview-actions">
          <button className="secondary" onClick={() => navigate("Inbox")}>
            <strong>
              {sources.length
                ? "Add or inspect sources"
                : "Add your first source"}
            </strong>
            <span>Preserve material and review its passages.</span>
          </button>
          <button
            className="secondary"
            onClick={() => navigate("Review queue")}
          >
            <strong>{pending.length} proposals awaiting review</strong>
            <span>Check their source and decide what to accept.</span>
          </button>
          <button
            className="secondary"
            onClick={() => navigate("Case register")}
          >
            <strong>Record your reasoning</strong>
            <span>Add an event, relationship, explanation, or note.</span>
          </button>
          <button
            className="secondary"
            onClick={() => navigate("Questions & comparisons")}
          >
            <strong>
              {openQuestions.length} open questions · {conflicts.length}{" "}
              conflicts
            </strong>
            <span>Compare accounts and decide what to check next.</span>
          </button>
        </div>
      </section>
      <section className="panel">
        <h2>Source coverage</h2>
        <p>
          {textSources.size} of {sources.length} sources have extracted text.
          Processing coverage does not measure how complete the investigation
          is.
        </p>
        {!sources.length && (
          <p className="muted">Add source material to begin.</p>
        )}
        {sources.map((r) => (
          <div className="coverage-row" key={r.id}>
            <button className="quiet" onClick={() => inspect(r)}>
              {recordTitle(r)}
            </button>
            <span>
              {textSources.has(r.id)
                ? "Text available"
                : "Original stored · no extracted text"}
            </span>
            <small>
              {r.scan_status === "UNSCANNED"
                ? "Not scanned for malware"
                : human(r.scan_status)}
            </small>
          </div>
        ))}
      </section>
      <section className="panel">
        <h2>Recent case activity</h2>
        {records
          .filter((r) => r.kind === "ReviewAction")
          .sort(
            (a, b) => b.introduced_case_revision - a.introduced_case_revision,
          )
          .slice(0, 10)
          .map((r) => (
            <p key={r.id}>
              <strong>{r.created_by}</strong> ·{" "}
              {r.kind === "ReviewAction" ? r.reason : ""}
              <small>
                Revision {r.introduced_case_revision} ·{" "}
                {new Date(r.created_at).toLocaleString()}
              </small>
            </p>
          ))}
        <button
          className="secondary"
          onClick={() => navigate("Integrity & backup")}
        >
          Check integrity and back up
        </button>
      </section>
    </>
  );
}
export function DecisionForm({
  record,
  records,
  busy,
  submit,
}: {
  record: CaseRecord;
  records: CaseRecord[];
  busy: boolean;
  submit: (command: Command) => Promise<boolean>;
}) {
  const [message, setMessage] = useState("");
  if (!["Question", "Hypothesis", "Contradiction"].includes(record.kind))
    return null;
  const states =
    record.kind === "Question"
      ? ["OPEN", "IN_PROGRESS", "ANSWERED", "CLOSED"]
      : record.kind === "Contradiction"
        ? ["UNRESOLVED", "RESOLVED", "DISMISSED"]
        : record.kind === "Hypothesis"
          ? {
              PROPOSED: ["TESTING", "RETIRED"],
              TESTING: ["SUPPORTED", "WEAKENED", "RETIRED"],
              SUPPORTED: ["TESTING", "WEAKENED", "RETIRED"],
              WEAKENED: ["TESTING", "RETIRED"],
              RETIRED: ["SUCCESSOR"],
            }[record.state]
          : [];
  return (
    <form
      className="panel"
      onSubmit={async (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget),
          evidence = chosenRefs(data, "decision_evidence", records),
          reason = String(data.get("decision_reason")),
          target = String(data.get("decision_state"));
        const common = { reason };
        const command: Command =
          record.kind === "Question"
            ? {
                ...common,
                type: "answerQuestion",
                question: referenceOf(record),
                status: target as "OPEN",
                answer_refs: evidence,
              }
            : record.kind === "Contradiction"
              ? {
                  ...common,
                  type: "decideContradiction",
                  contradiction: referenceOf(record),
                  decision: target as "UNRESOLVED",
                  evidence_refs: evidence,
                }
              : target === "SUCCESSOR"
                ? {
                    ...common,
                    type: "reopenHypothesis",
                    hypothesis: referenceOf(record),
                    new_evidence_refs: evidence,
                  }
                : {
                    ...common,
                    type: "transitionHypothesis",
                    hypothesis: referenceOf(record),
                    target_state: target as "TESTING",
                    evidence_refs: evidence,
                  };
        if (await submit(command))
          setMessage(
            "Decision recorded. The previous version remains in history.",
          );
      }}
    >
      <h3>Record a decision</h3>
      <label>
        Next status
        <select name="decision_state">
          {states.map((s) => (
            <option key={s} value={s}>
              {s === "SUCCESSOR"
                ? "Create a successor from new evidence"
                : human(s)}
            </option>
          ))}
        </select>
      </label>
      <ReferencePicker
        name="decision_evidence"
        label="Material supporting this decision"
        records={records}
        kinds={["Observation", "Event", "Evidence"]}
      />
      <label>
        Reason and what changed
        <textarea name="decision_reason" required maxLength={20000} />
      </label>
      <button disabled={busy}>Save reviewed decision</button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
export function QuestionBoard({
  records,
  inspect,
}: {
  records: CaseRecord[];
  inspect: (r: CaseRecord) => void;
}) {
  const questions = records.filter((r) => r.kind === "Question");
  return (
    <section className="panel">
      <h2>Questions to work through</h2>
      <p className="muted">
        Record outcomes against sources. Answering a question does not
        automatically establish an explanation.
      </p>
      {!questions.length && (
        <p>
          No scenario questions have been recorded yet. Use investigator notes
          to capture checks while building the case.
        </p>
      )}
      <div className="question-board">
        {["OPEN", "IN_PROGRESS", "ANSWERED", "CLOSED"].map((status) => (
          <section key={status}>
            <h3>{human(status)}</h3>
            {questions
              .filter((r) => r.status === status)
              .map((q) => (
                <article key={q.id}>
                  <h4>{q.text}</h4>
                  <p>{q.source_to_check}</p>
                  <small>Effort: {human(q.effort)}</small>
                  <button className="secondary" onClick={() => inspect(q)}>
                    Inspect and update
                  </button>
                </article>
              ))}
          </section>
        ))}
      </div>
    </section>
  );
}
export function Comparison({
  records,
  inspect,
}: {
  records: CaseRecord[];
  inspect: (r: CaseRecord) => void;
}) {
  const choices = records.filter((r) =>
    [
      "Observation",
      "Event",
      "Interpretation",
      "Hypothesis",
      "Scenario",
    ].includes(r.kind),
  );
  const [left, setLeft] = useState(""),
    [right, setRight] = useState("");
  return (
    <section className="panel">
      <h2>Compare two accounts or explanations</h2>
      <div className="two-col">
        {[
          { label: "First record", value: left, set: setLeft },
          { label: "Second record", value: right, set: setRight },
        ].map(({ label, value, set }) => {
          const r = choices.find((r) => r.id === value);
          return (
            <div key={label}>
              <label>
                {label}
                <select value={value} onChange={(e) => set(e.target.value)}>
                  <option value="">Choose a record</option>
                  {choices.map((r) => (
                    <option key={r.id} value={r.id}>
                      {recordTitle(r)}
                    </option>
                  ))}
                </select>
              </label>
              {r && (
                <>
                  <h3>{recordTitle(r)}</h3>
                  <p>
                    {human(r.kind)} · {"tier" in r ? human(r.tier) : ""}
                  </p>
                  {"occurrence" in r && (
                    <p>
                      {r.occurrence.raw || "Time unknown"} ·{" "}
                      {human(r.occurrence.precision)}
                    </p>
                  )}
                  {"rationale" in r && <p>{r.rationale}</p>}
                  {"citations" in r &&
                    r.citations.map((c, i) => (
                      <blockquote key={i}>
                        {c.quote || "Source location recorded"}
                      </blockquote>
                    ))}
                  {"weaken_if" in r && (
                    <>
                      <h4>What would weaken it?</h4>
                      <ul>
                        {r.weaken_if.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  {"counter_refs" in r && (
                    <p>{r.counter_refs.length} counter-evidence references</p>
                  )}
                  <button onClick={() => inspect(r)}>
                    Open source and full detail
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
export function RecordHistory({
  record,
  caseId,
  records,
  select,
}: {
  record: CaseRecord;
  caseId: string;
  records: CaseRecord[];
  select: (r: CaseRecord) => void;
}) {
  const [history, setHistory] = useState<CaseRecord[]>([]),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setError("");
    setHistory([]);
    request<CaseRecord>(`/cases/${caseId}/records/${record.id}`)
      .then(async (latest) => {
        const rows = await Promise.all(
          Array.from({ length: Math.min(50, latest.revision) }, (_, i) =>
            request<CaseRecord>(
              `/cases/${caseId}/records/${record.id}?revision=${latest.revision - i}`,
            ),
          ),
        );
        if (active) setHistory(rows);
      })
      .catch(() => {
        if (active)
          setError(
            "Version history could not be loaded. Retry by reopening this record.",
          );
      });
    return () => {
      active = false;
    };
  }, [record.id, caseId]);
  return (
    <details>
      <summary>Version history</summary>
      {error && <p role="alert">{error}</p>}
      {history.map((r, index) => {
        const prior = history[index + 1];
        const changed = prior
          ? Object.entries(r).filter(
              ([key, value]) =>
                ![
                  "revision",
                  "created_at",
                  "created_by",
                  "introduced_case_revision",
                ].includes(key) &&
                JSON.stringify(value) !==
                  JSON.stringify(
                    (prior as unknown as Record<string, unknown>)[key],
                  ),
            )
          : [];
        const reviews = records.filter(
          (action) =>
            action.kind === "ReviewAction" &&
            action.target_refs.some((ref) => refKey(ref) === refKey(r)),
        );
        return (
          <article key={refKey(r)}>
            <p>
              <button className="quiet" onClick={() => select(r)}>
                Version {r.revision}
                {r.revision === history[0].revision ? " · latest" : ""}
              </button>
              <small>
                {r.created_by} · {new Date(r.created_at).toLocaleString()}
              </small>
            </p>
            {reviews.map((review) => (
              <p key={review.id}>
                {review.kind === "ReviewAction"
                  ? `${review.actor_subject}: ${review.reason}`
                  : ""}
              </p>
            ))}
            {changed.length > 0 && (
              <details>
                <summary>What changed in this version?</summary>
                <div className="history-diff">
                  <table>
                    <thead>
                      <tr>
                        <th>Field</th>
                        <th>Before</th>
                        <th>After</th>
                      </tr>
                    </thead>
                    <tbody>
                      {changed.map(([key, value]) => (
                        <tr key={key}>
                          <th>{human(key)}</th>
                          <td>
                            {historyValue(
                              (prior as unknown as Record<string, unknown>)[
                                key
                              ],
                              records,
                            )}
                          </td>
                          <td>{historyValue(value, records)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            )}
          </article>
        );
      })}
      {history[0]?.revision > 50 && (
        <p>
          Showing the latest 50 versions. Older exact references remain
          available.
        </p>
      )}
    </details>
  );
}

function historyValue(value: unknown, records: CaseRecord[]): string {
  if (value === null || value === undefined || value === "")
    return "Not recorded";
  if (Array.isArray(value))
    return value.length
      ? value.map((v) => historyValue(v, records)).join("; ")
      : "None";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") {
    const v = value as Record<string, unknown>;
    if (typeof v.id === "string" && typeof v.revision === "number") {
      const r = records.find((r) => r.id === v.id && r.revision === v.revision);
      return `${r ? recordTitle(r) : "Referenced record"} · version ${v.revision}`;
    }
    if (typeof v.quote === "string") return `“${v.quote}”`;
    if ("precision" in v)
      return `${v.raw || "No source wording"}; ${human(String(v.precision))}; ${v.start || "open start"} to ${v.end || "open end"}; ${v.timezone || "unknown zone"}`;
    return Object.entries(v)
      .map(([key, val]) => `${human(key)}: ${historyValue(val, records)}`)
      .join("; ");
  }
  return String(value);
}
