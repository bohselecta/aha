import { useEffect, useState } from "react";
import type {
  Case,
  ExportArtifact,
} from "../../../../packages/contracts/contracts";
import { request } from "../api";

type Health = {
  latest: ExportArtifact | null;
  available: boolean;
  rehearsal: {
    export_id: string;
    case_revision: number;
    verified_at: string;
    file_count: number;
  } | null;
};
export function BackupHealth({
  active,
  refreshKey,
}: {
  active: Case;
  refreshKey: string;
}) {
  const [health, setHealth] = useState<Health | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    let live = true;
    request<Health>(`/cases/${active.id}/backup/status`)
      .then((h) => {
        if (live) setHealth(h);
      })
      .catch(() => {
        if (live) setError("Backup history could not be loaded.");
      });
    return () => {
      live = false;
    };
  }, [active.id, refreshKey]);
  return (
    <section className="panel">
      <h2>Check that recovery works</h2>
      {health?.latest ? (
        <p>
          Last prepared backup: revision {health.latest.case_revision}.{" "}
          {health.latest.case_revision < active.case_revision
            ? "The case has changed since this backup."
            : "Matches the current case revision."}{" "}
          {health.available
            ? "A temporary local copy is available."
            : "The temporary copy has expired. Keep your downloaded backup separately."}
        </p>
      ) : (
        <p>No portable backup has been prepared yet.</p>
      )}
      <p>
        A rehearsal restores the latest backup into a separate temporary folder,
        checks its database and file hashes, and then removes the temporary
        copy. Your working case stays in place.
      </p>
      <button
        disabled={busy || !health?.available}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            await request(
              `/cases/${active.id}/backup/rehearse`,
              "POST",
              {},
              active.case_revision,
            );
            setHealth(
              await request<Health>(`/cases/${active.id}/backup/status`),
            );
          } catch (e) {
            setError(
              e instanceof Error
                ? e.message
                : "Recovery rehearsal did not complete.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Restoring and checking…" : "Rehearse recovery"}
      </button>
      {health?.rehearsal && (
        <p role="status">
          Restore verified at{" "}
          {new Date(health.rehearsal.verified_at).toLocaleString()}: revision{" "}
          {health.rehearsal.case_revision}, {health.rehearsal.file_count} files.
          {health.rehearsal.export_id !== health.latest?.export_id
            ? " A newer backup has not been rehearsed yet."
            : ""}
        </p>
      )}
      <p className="muted">
        Keep a separate encrypted copy. A rehearsal on this computer does not
        prove recovery after loss of this device.
      </p>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
