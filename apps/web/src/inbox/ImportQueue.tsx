import { useEffect, useRef, useState } from "react";
import type {
  Case,
  Job,
  IngestSummary,
} from "../../../../packages/contracts/contracts";
import { request } from "../api";
type ImportRow = { job: Job; summary: IngestSummary };
export function ImportQueue({
  active,
  onChanged,
}: {
  active: Case;
  onChanged: () => Promise<void>;
}) {
  const [rows, setRows] = useState<ImportRow[]>([]),
    [error, setError] = useState("");
  const callback = useRef(onChanged);
  callback.current = onChanged;
  useEffect(() => {
    let live = true,
      timer: ReturnType<typeof setTimeout>,
      previous = "";
    const poll = async () => {
      try {
        const result = await request<{ items: ImportRow[] }>(
          `/cases/${active.id}/imports`,
        );
        if (!live) return;
        const signature = result.items
          .map(
            (r) =>
              `${r.job.id}:${r.job.state}:${r.summary.derivative_refs.length}`,
          )
          .join("|");
        if (signature !== previous) await callback.current();
        if (!live) return;
        setRows(result.items);
        previous = signature;
      } catch (e) {
        if (live)
          setError(
            e instanceof Error ? e.message : "Import status unavailable.",
          );
      } finally {
        if (live) timer = setTimeout(poll, 2000);
      }
    };
    void poll();
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [active.id]);
  if (!rows.length && !error) return null;
  return (
    <section className="panel">
      <h2>Import progress</h2>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {rows.map(({ job, summary }) => (
        <article className="import-row" key={job.id}>
          <strong>{job.phase}</strong>
          <small>
            {job.state.toLowerCase()} · {summary.evidence_refs.length} preserved
            original
          </small>
          {summary.warnings.map((w, i) => (
            <p className="muted" key={i}>
              {w}
            </p>
          ))}
          {["QUEUED", "RUNNING"].includes(job.state) && (
            <button
              className="secondary"
              onClick={async () => {
                try {
                  await request(
                    `/cases/${active.id}/jobs/${job.id}/cancel`,
                    "POST",
                    {},
                    active.case_revision,
                  );
                } catch (e) {
                  setError(
                    e instanceof Error ? e.message : "Cancellation failed.",
                  );
                }
              }}
            >
              Cancel extraction
            </button>
          )}
          {["FAILED", "CANCELLED", "SUCCEEDED"].includes(job.state) && (
            <button
              className="secondary"
              onClick={async () => {
                try {
                  await request(
                    `/cases/${active.id}/jobs/${job.id}/retry`,
                    "POST",
                    {},
                    active.case_revision,
                  );
                  setError("");
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Retry failed.");
                }
              }}
            >
              Retry extraction
            </button>
          )}
        </article>
      ))}
    </section>
  );
}
