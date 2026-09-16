import { useEffect, useState } from "react";
import type { CaseRecord } from "../api";
import type {
  Command,
  Evidence,
} from "../../../../packages/contracts/contracts";
export function SourceReview({
  evidence,
  records,
  caseId,
  propose,
}: {
  evidence: Evidence;
  records: CaseRecord[];
  caseId: string;
  propose: (c: Command) => Promise<void>;
}) {
  const derivative = records
    .filter(
      (r) =>
        r.kind === "Derivative" &&
        r.evidence.id === evidence.id &&
        ["TEXT", "OCR"].includes(r.derivative_type),
    )
    .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  const entities = records.filter(
    (r) => r.kind === "Entity" && r.review === "ACCEPTED",
  );
  const [text, setText] = useState(""),
    [error, setError] = useState(""),
    [selection, setSelection] = useState({ start: 0, end: 0, quote: "" });
  useEffect(() => {
    let active = true;
    setText("");
    setError("");
    setSelection({ start: 0, end: 0, quote: "" });
    if (derivative)
      fetch(`/api/v1/cases/${caseId}/derivatives/${derivative.id}/content`)
        .then(async (r) => {
          if (!r.ok)
            throw Error(
              "Source content failed integrity verification or is unavailable.",
            );
          return r.text();
        })
        .then((t) => {
          if (active) setText(t);
        })
        .catch((e) => {
          if (active) setError(e.message);
        });
    return () => {
      active = false;
    };
  }, [derivative?.id, caseId, evidence.id]);
  return (
    <>
      <p>
        <strong>{evidence.scan_status}</strong> · {evidence.bytes} bytes
      </p>
      <p className="hash">
        SHA-256
        <br />
        {evidence.sha256}
      </p>
      <a
        className="button secondary"
        href={`/api/v1/cases/${caseId}/evidence/${evidence.id}/original`}
      >
        Download original
      </a>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {derivative && derivative.kind === "Derivative" ? (
        <>
          <label>
            Source text
            <textarea
              className="source-text"
              readOnly
              value={text}
              onSelect={(e) => {
                const el = e.currentTarget;
                setSelection({
                  start: Array.from(text.slice(0, el.selectionStart)).length,
                  end: Array.from(text.slice(0, el.selectionEnd)).length,
                  quote: text.slice(el.selectionStart, el.selectionEnd),
                });
              }}
            />
          </label>
          <p className="muted">
            Select an exact passage, then describe what this source reports. The
            selected passage stays attached to your statement.
          </p>
          {entities.length ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const d = new FormData(e.currentTarget);
                const entity = entities.find((r) => r.id === d.get("subject"))!;
                await propose({
                  type: "proposeRecord",
                  reason: String(d.get("rationale")),
                  record: {
                    kind: "Observation",
                    tier: "OBSERVED",
                    citations: [
                      {
                        evidence: {
                          id: evidence.id,
                          revision: evidence.revision,
                        },
                        evidence_sha256: evidence.sha256,
                        derivative: {
                          id: derivative.id,
                          revision: derivative.revision,
                        },
                        derivative_sha256: derivative.sha256,
                        locator: {
                          type: "text",
                          start: selection.start,
                          end: selection.end,
                        },
                        quote: selection.quote,
                      },
                    ],
                    support_refs: [],
                    counter_refs: [],
                    rationale: String(d.get("rationale")),
                    statement: String(d.get("statement")),
                    subject_refs: [
                      { id: entity.id, revision: entity.revision },
                    ],
                    predicate: "reports",
                    object_value: String(d.get("statement")),
                    occurrence: {
                      raw: null,
                      start: null,
                      end: null,
                      start_inclusive: true,
                      end_inclusive: true,
                      timezone: null,
                      precision: "UNKNOWN",
                      clock_source: "Unknown",
                      tolerance_seconds: null,
                      alternative_refs: [],
                    },
                    discovered_at: null,
                    recorded_at: null,
                    provenance_group: evidence.id,
                    independence: "UNKNOWN",
                  },
                });
              }}
            >
              <p className="selected-quote">
                {selection.quote
                  ? `Selected: “${selection.quote}”`
                  : "Select source text to attach an exact citation."}
              </p>
              <label>
                Subject
                <select name="subject">
                  {entities.map((e) => (
                    <option value={e.id} key={e.id}>
                      {e.kind === "Entity" ? e.label : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Reported statement
                <textarea name="statement" required maxLength={20000} />
              </label>
              <label>
                Why this represents the selected source
                <input name="rationale" required />
              </label>
              <p className="notice">
                This statement will be marked as a reported observation. Its
                time and source independence remain unknown until reviewed.
              </p>
              <button
                disabled={!selection.quote || selection.quote.length > 20000}
              >
                Send statement for review
              </button>
            </form>
          ) : (
            <p className="notice">
              Propose and review a subject in Inbox before creating a source
              statement.
            </p>
          )}
        </>
      ) : (
        <p className="notice">
          Original saved. No readable text is available yet. Check import
          progress in Inbox, or download the original to inspect it.
        </p>
      )}
    </>
  );
}
