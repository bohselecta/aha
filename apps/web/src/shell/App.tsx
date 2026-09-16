import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  command,
  label,
  loadProposals,
  loadRecords,
  logout,
  pair,
  request,
  type Case,
  type CaseRecord,
  type Proposal,
} from "../api";
import type {
  Job,
  VerificationResult,
  ExportArtifact,
  Command,
  Citation,
  Entity,
} from "../../../../packages/contracts/contracts";
import { SourceReview } from "../inbox/SourceReview";

type Workspace =
  | "Inbox"
  | "Review queue"
  | "Case register"
  | "Timeline"
  | "Integrity & backup";
const workspaces: Workspace[] = [
  "Inbox",
  "Review queue",
  "Case register",
  "Timeline",
  "Integrity & backup",
];
function Basis({ record }: { record: CaseRecord }) {
  return (
    <span className={`badge ${"tier" in record ? record.tier : ""}`}>
      {"tier" in record ? record.tier : "kind" in record ? record.kind : ""}
      {"origin" in record && record.origin === "AI_SYNTHETIC"
        ? " · SYNTHETIC"
        : ""}
    </span>
  );
}

export function App() {
  const [operator, setOperator] = useState(""),
    [cases, setCases] = useState<Case[]>([]),
    [active, setActive] = useState<Case | null>(null),
    [records, setRecords] = useState<CaseRecord[]>([]),
    [proposals, setProposals] = useState<Proposal[]>([]);
  const [workspace, setWorkspace] = useState<Workspace>("Inbox"),
    [selected, setSelected] = useState<CaseRecord | null>(null),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [filter, setFilter] = useState(""),
    [verification, setVerification] = useState<VerificationResult | null>(null);
  const [theme, setTheme] = useState(
    () =>
      localStorage.getItem("aha-theme") ||
      (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
  );
  const epoch = useRef(0);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("aha-theme", theme);
  }, [theme]);
  async function refresh(c: Case) {
    const version = epoch.current;
    const [fresh, rows, pending] = await Promise.all([
      request<Case>(`/cases/${c.id}`),
      loadRecords(c.id),
      loadProposals(c.id),
    ]);
    if (version !== epoch.current) return;
    setActive(fresh);
    setRecords(rows);
    setProposals(pending);
  }
  async function act(fn: () => Promise<void>) {
    setError("");
    setMessage("");
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "The operation failed. Your input has been retained.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function open(c: Case) {
    epoch.current++;
    setSelected(null);
    setRecords([]);
    setProposals([]);
    setVerification(null);
    setFilter("");
    await refresh(c);
  }
  async function mutate(body: Command) {
    if (!active) return;
    await command(active, body);
    await refresh(active);
    setMessage("Review decision saved. History retained.");
  }
  async function signIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await act(async () => {
      const session = await pair(
        String(form.get("secret")),
        String(form.get("operator")),
      );
      setOperator(session.actor);
      const result = await request<{ items: Case[] }>("/cases");
      setCases(result.items);
      if (result.items[0]) await open(result.items[0]);
    });
  }
  const sources = records.filter((r) => r.kind === "Evidence"),
    pending = proposals.filter((p) => p.status === "PENDING");
  const shown = records.filter((r) =>
    label(r).toLowerCase().includes(filter.toLowerCase()),
  );
  const timeline = shown
    .filter((r) => "occurrence" in r)
    .sort(
      (a, b) =>
        ("occurrence" in a ? a.occurrence.start : null)?.localeCompare(
          "occurrence" in b ? b.occurrence.start || "" : "",
        ) || 0,
    );
  return (
    <>
      <a className="skip" href="#main">
        Skip to workspace
      </a>
      <header>
        <div className="brand">
          <img
            className="brand-logo"
            src="/brand/aha-logo.png"
            alt=""
            width="58"
            height="58"
          />
          <div>
            <strong>Aha!</strong>
            <small>OPEN INVESTIGATIONS</small>
          </div>
        </div>
        <div className="header-status">
          <span className="dot" />
          Local workstation <span className="build">Development · M1</span>
        </div>
        <button
          className="quiet"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? "Dark" : "Light"} theme
        </button>
        {operator && (
          <button
            className="quiet"
            onClick={() =>
              act(async () => {
                await logout();
                epoch.current++;
                setOperator("");
                setActive(null);
                setRecords([]);
                setProposals([]);
                setSelected(null);
              })
            }
          >
            Sign out
          </button>
        )}
      </header>
      {!operator ? (
        <main id="main" className="onboarding">
          <div className="intro">
            <img
              className="welcome-logo"
              src="/brand/aha-logo.png"
              alt="Aha! Open Investigations — a corgi looking through a magnifying glass"
              width="256"
              height="256"
            />
            <p className="eyebrow">EVIDENCE FIRST. HUMAN REVIEW ALWAYS.</p>
            <h1>
              A clear place
              <br />
              to begin.
            </h1>
            <p>
              Preserve your sources. Review each statement. Keep the history of
              every decision.
            </p>
            <p className="notice">
              Early implementation: source storage, manual review and recovery.
              The complete investigation workbench is still being built.
            </p>
          </div>
          <form onSubmit={signIn} className="panel pair">
            <p className="eyebrow">CONNECT TO THIS COMPUTER</p>
            <h2>Pair your workspace</h2>
            <label>
              Local operator label
              <input
                name="operator"
                required
                maxLength={200}
                autoComplete="name"
                placeholder="Your name or operator label"
              />
            </label>
            <label>
              Pairing secret
              <input
                name="secret"
                required
                type="password"
                autoComplete="off"
              />
            </label>
            <p className="muted">
              Use the ten-minute secret in <code>.local/pairing-secret</code> on
              this computer. Your operator label is recorded with each review.
            </p>
            <button disabled={busy}>
              {busy ? "Connecting…" : "Open local workspace →"}
            </button>
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
          </form>
        </main>
      ) : (
        <div className="shell">
          <aside className="navigation">
            <p className="eyebrow">YOUR WORKSPACE</p>
            <label className="case-switch">
              Case
              <select
                value={active?.id || ""}
                onChange={(e) => {
                  const c = cases.find((c) => c.id === e.target.value);
                  if (c) act(() => open(c));
                }}
              >
                {!cases.length && <option>No cases yet</option>}
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="secondary"
              disabled={busy}
              onClick={() => {
                epoch.current++;
                setActive(null);
                setSelected(null);
                setRecords([]);
                setProposals([]);
                setVerification(null);
              }}
            >
              + Create case
            </button>
            <nav aria-label="Workspace">
              {workspaces.map((w, i) => (
                <button
                  className={w === workspace ? "active" : ""}
                  key={w}
                  onClick={() => {
                    setWorkspace(w);
                    setSelected(null);
                  }}
                >
                  <span>{["▤", "✓", "⊞", "◷", "◇"][i]}</span>
                  {w}
                  {w === "Review queue" && pending.length > 0 && (
                    <b>{pending.length}</b>
                  )}
                </button>
              ))}
            </nav>
            <div className="nav-foot">
              <strong>
                Human decisions,
                <br />
                preserved history.
              </strong>
              <p>
                Originals remain unchanged. Generated material never becomes
                evidence automatically.
              </p>
            </div>
          </aside>
          <main id="main" aria-busy={busy}>
            <div className="page-heading">
              <div>
                <p className="eyebrow">
                  {active?.synthetic
                    ? "SYNTHETIC CASE · FICTIONAL MATERIAL"
                    : "LOCAL CASE"}
                  {active ? ` / REVISION ${active.case_revision}` : ""}
                </p>
                <h1>{workspace}</h1>
                <p className="muted">
                  {workspace === "Inbox"
                    ? "The original is your starting point. Every statement keeps its source."
                    : workspace === "Review queue"
                      ? "A proposal changes the case only after your deliberate review."
                      : workspace === "Integrity & backup"
                        ? "Verify the bytes. Preserve a complete, portable copy."
                        : "Recorded in a source; not independently established."}
                </p>
              </div>
              {active && (
                <button
                  className="secondary"
                  disabled={busy}
                  onClick={() => act(() => refresh(active))}
                >
                  Refresh case
                </button>
              )}
            </div>
            <div aria-live="polite">
              {message && <p className="success">{message}</p>}
            </div>
            {error && (
              <p role="alert" className="error">
                {error}{" "}
                <button className="quiet" onClick={() => setError("")}>
                  Dismiss
                </button>
              </p>
            )}
            {!active ? (
              <section className="panel">
                <h2>Create your first case</h2>
                <CreateCase
                  onCreate={async (data) => {
                    await act(async () => {
                      const c = await request<Case>("/cases", "POST", data);
                      setCases([...cases, c]);
                      await open(c);
                    });
                  }}
                />
              </section>
            ) : (
              <>
                <section className="summary" aria-label="Case totals">
                  <div>
                    <strong>
                      {sources.length.toString().padStart(2, "0")}
                    </strong>
                    <span>Preserved sources</span>
                  </div>
                  <div>
                    <strong>
                      {pending.length.toString().padStart(2, "0")}
                    </strong>
                    <span>Awaiting your review</span>
                  </div>
                  <div>
                    <strong>
                      {records
                        .filter((r) => "review" in r && r.review === "ACCEPTED")
                        .length.toString()
                        .padStart(2, "0")}
                    </strong>
                    <span>Accepted records</span>
                  </div>
                  <div>
                    <strong>Local</strong>
                    <span>No model connected</span>
                  </div>
                </section>
                {workspace === "Inbox" && (
                  <>
                    <form
                      className="upload panel"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const data = new FormData(form);
                        act(async () => {
                          await request<Job>(
                            `/cases/${active.id}/ingest`,
                            "POST",
                            data,
                            active.case_revision,
                          );
                          await refresh(active);
                          form.reset();
                          setMessage(
                            "Original preserved. UTF-8 text is extracted; other formats are stored without extraction.",
                          );
                        });
                      }}
                    >
                      <div>
                        <h2>Bring material into the case</h2>
                        <p className="muted">
                          UTF-8 text supports source-side review. Other formats
                          are preserved; their parsers are not implemented yet.
                        </p>
                      </div>
                      <label>
                        Source file
                        <input name="file" type="file" required />
                      </label>
                      <label>
                        Receipt note
                        <input
                          name="source_note"
                          required
                          maxLength={20000}
                          placeholder="Where did this material come from?"
                        />
                      </label>
                      <button disabled={busy}>Preserve original</button>
                    </form>
                    <div className="section-title">
                      <h2>Source library</h2>
                      <span>
                        {sources.length} originals · SHA-256 addressed
                      </span>
                    </div>
                    <div className="source-grid">
                      {sources.map((r) => (
                        <button
                          className="source-card"
                          key={r.id}
                          onClick={() => setSelected(r)}
                        >
                          <span className="file-icon">TXT</span>
                          <strong>{label(r)}</strong>
                          <small>
                            {r.kind === "Evidence"
                              ? `${r.bytes} bytes · ${r.scan_status}`
                              : ""}
                          </small>
                          <span className="source-link">Review source ↗</span>
                        </button>
                      ))}
                      {!sources.length && (
                        <p className="empty">
                          No sources yet. Import a file to preserve its original
                          bytes.
                        </p>
                      )}
                    </div>
                    <div className="panel new-record">
                      <h2>Add a person, place or object</h2>
                      <EntityForm submit={(body) => act(() => mutate(body))} />
                    </div>
                  </>
                )}
                {workspace === "Review queue" && (
                  <>
                    <p className="notice">
                      Accepting a statement confirms its representation of the
                      source, not its truth.
                    </p>
                    {pending.length === 0 && (
                      <div className="empty panel">
                        <h2>Nothing awaiting review</h2>
                        <p>
                          Review a source or write an investigator note to
                          create a proposal.
                        </p>
                      </div>
                    )}
                    {pending.map((p) => (
                      <ProposalReview
                        key={p.id}
                        proposal={p}
                        busy={busy}
                        sources={records}
                        onSource={setSelected}
                        decide={(decision, reason) =>
                          act(() =>
                            mutate({
                              type: "reviewProposal",
                              proposal_id: p.id,
                              decision,
                              reason,
                            }),
                          )
                        }
                      />
                    ))}
                    <details>
                      <summary>
                        Review history · {proposals.length - pending.length}{" "}
                        decisions
                      </summary>
                      {proposals
                        .filter((p) => p.status !== "PENDING")
                        .map((p) => (
                          <p key={p.id}>
                            <span className="badge">{p.status}</span>{" "}
                            {label(p.record)}
                          </p>
                        ))}
                    </details>
                  </>
                )}
                {(workspace === "Case register" ||
                  workspace === "Timeline") && (
                  <>
                    <label className="search-label">
                      Filter this view
                      <input
                        type="search"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        placeholder="Find a recorded statement or label…"
                      />
                    </label>
                    <div
                      className="table-region"
                      role="region"
                      aria-label={workspace}
                      tabIndex={0}
                    >
                      <table>
                        <thead>
                          <tr>
                            <th>Record</th>
                            <th>Kind / basis</th>
                            <th>
                              {workspace === "Timeline"
                                ? "Occurrence / uncertainty"
                                : "Version / review"}
                            </th>
                            <th>Source detail</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(workspace === "Timeline" ? timeline : shown).map(
                            (r) => (
                              <tr key={r.id}>
                                <td>{label(r)}</td>
                                <td>
                                  <Basis record={r} />
                                </td>
                                <td>
                                  {workspace === "Timeline" &&
                                  "occurrence" in r ? (
                                    <>
                                      {r.occurrence.raw || "Undated"}
                                      <small>
                                        {r.occurrence.precision} ·{" "}
                                        {r.occurrence.timezone ||
                                          "Timezone unresolved"}
                                      </small>
                                    </>
                                  ) : (
                                    <>
                                      v{r.revision}
                                      <small>
                                        {"review" in r ? r.review : "Recorded"}
                                      </small>
                                    </>
                                  )}
                                </td>
                                <td>
                                  <button
                                    className="quiet"
                                    onClick={() => setSelected(r)}
                                  >
                                    Inspect →
                                  </button>
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                    {workspace === "Case register" && (
                      <form
                        className="panel"
                        onSubmit={(e) => {
                          e.preventDefault();
                          const form = e.currentTarget;
                          const data = new FormData(form);
                          act(async () => {
                            await mutate({
                              type: "proposeRecord",
                              record: {
                                kind: "Note",
                                text: String(data.get("text")),
                                target_refs: [],
                                note_type: "INVESTIGATOR_NOTE",
                              },
                              reason: "Human authored investigator note.",
                            });
                            form.reset();
                            setWorkspace("Review queue");
                          });
                        }}
                      >
                        <h2>Investigator note</h2>
                        <label>
                          Your observation or scope limitation
                          <textarea name="text" required maxLength={20000} />
                        </label>
                        <button disabled={busy}>Send note for review</button>
                      </form>
                    )}
                  </>
                )}
                {workspace === "Integrity & backup" && (
                  <>
                    <div className="two-col">
                      <section className="panel">
                        <span className="eyebrow">BYTE IDENTITY</span>
                        <h2>Verify this case</h2>
                        <p>
                          Check original and derivative hashes and the audit
                          chain. A hash establishes byte identity, not source
                          truth.
                        </p>
                        <button
                          disabled={busy}
                          onClick={() =>
                            act(async () => {
                              const job = await request<Job>(
                                `/cases/${active.id}/integrity/verify`,
                                "POST",
                                {},
                                active.case_revision,
                              );
                              setVerification(
                                await request<VerificationResult>(
                                  job.result_path!.replace("/api/v1", ""),
                                ),
                              );
                              setMessage("Integrity verification completed.");
                            })
                          }
                        >
                          Verify stored content
                        </button>
                        {verification && (
                          <div
                            className={
                              verification.failures.length ? "error" : "success"
                            }
                          >
                            <strong>
                              {verification.failures.length
                                ? "Integrity failure — export blocked"
                                : "All checked content matches"}
                            </strong>
                            <p>
                              {verification.checked_count} checks at revision{" "}
                              {verification.case_revision}
                            </p>
                            {verification.failures.map((f) => (
                              <p key={f}>{f}</p>
                            ))}
                            {verification.warnings.map((w) => (
                              <p key={w}>{w}</p>
                            ))}
                          </div>
                        )}
                      </section>
                      <section className="panel">
                        <span className="eyebrow">PORTABLE RECOVERY</span>
                        <h2>Back up the case</h2>
                        <p>
                          A full backup contains the case database, all
                          originals and derivatives. It contains sensitive
                          material and is not a redacted publication.
                        </p>
                        <button
                          disabled={busy}
                          onClick={() =>
                            act(async () => {
                              const job = await request<Job>(
                                `/cases/${active.id}/backup`,
                                "POST",
                                {},
                                active.case_revision,
                              );
                              const artifact = await request<ExportArtifact>(
                                job.result_path!.replace("/api/v1", ""),
                              );
                              const a = document.createElement("a");
                              a.href = `/api/v1/cases/${active.id}/exports/${artifact.export_id}/download`;
                              a.download = "";
                              a.click();
                              setMessage(
                                `Backup prepared at revision ${artifact.case_revision}. Download expires in 24 hours.`,
                              );
                            })
                          }
                        >
                          Create portable backup
                        </button>
                      </section>
                    </div>
                    <section className="panel">
                      <h2>Build status</h2>
                      <p>
                        This is a development slice, not an accepted release.
                        PDF/OCR/Office parsers, full chronology rules, Atlas,
                        Query Lens, model generation, briefing/redaction, LAN
                        gateway and release certification remain unfinished.
                        CASEMAIL and Scene View are disabled.
                      </p>
                      <p>
                        Restore on a fresh volume with{" "}
                        <code>
                          make restore BUNDLE=/path/to/case.aha-case.zip
                        </code>
                        . Acceptance evidence is tracked in
                        IMPLEMENTATION_STATUS.md.
                      </p>
                    </section>
                  </>
                )}
              </>
            )}
          </main>
          {selected && active && (
            <Detail
              record={selected}
              records={records}
              caseId={active.id}
              onClose={() => setSelected(null)}
              onSelect={setSelected}
              propose={(body) => act(() => mutate(body))}
            />
          )}
        </div>
      )}
    </>
  );
}
function CreateCase({
  onCreate,
}: {
  onCreate: (data: {
    title: string;
    timezone: string;
    synthetic: boolean;
  }) => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const d = new FormData(e.currentTarget);
        onCreate({
          title: String(d.get("title")),
          timezone: String(d.get("timezone")),
          synthetic: d.get("synthetic") === "on",
        });
      }}
    >
      <label>
        Case title
        <input name="title" required maxLength={200} />
      </label>
      <label>
        Timezone
        <input name="timezone" defaultValue="America/Chicago" required />
      </label>
      <label className="check">
        <input name="synthetic" type="checkbox" defaultChecked />
        Fictional training material
      </label>
      <button>Create local case</button>
    </form>
  );
}
function EntityForm({ submit }: { submit: (c: Command) => void }) {
  return (
    <form
      className="form-row"
      onSubmit={(e) => {
        e.preventDefault();
        const d = new FormData(e.currentTarget);
        submit({
          type: "proposeRecord",
          record: {
            kind: "Entity",
            label: String(d.get("label")),
            entity_type: String(d.get("kind")) as Entity["entity_type"],
            aliases: [],
            source_refs: [],
          },
          reason: "Human entered entity; no automatic matching or merging.",
        });
      }}
    >
      <label>
        Label
        <input name="label" required maxLength={200} />
      </label>
      <label>
        Type
        <select name="kind">
          {[
            "PERSON",
            "PLACE",
            "ORGANIZATION",
            "OBJECT",
            "VEHICLE",
            "DEVICE",
            "UNKNOWN_ACTOR",
          ].map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
      </label>
      <button>Propose entity</button>
    </form>
  );
}
function ProposalReview({
  proposal,
  busy,
  sources,
  onSource,
  decide,
}: {
  proposal: Proposal;
  busy: boolean;
  sources: CaseRecord[];
  onSource: (r: CaseRecord) => void;
  decide: (d: "ACCEPT" | "REJECT", r: string) => void;
}) {
  const [reason, setReason] = useState("");
  const record = proposal.record;
  return (
    <section className="panel">
      <div className="section-title">
        <Basis record={record} />
        <span className="badge">PENDING HUMAN REVIEW</span>
      </div>
      <h2>{label(record)}</h2>
      {"rationale" in record && <p>{record.rationale}</p>}
      {"citations" in record &&
        record.citations.map((c, i) => {
          const source = sources.find((r) => r.id === c.evidence.id);
          return (
            <blockquote key={i}>
              {c.quote || "Source-bound record"}
              {source && (
                <button className="quiet" onClick={() => onSource(source)}>
                  Review source: {label(source)}
                </button>
              )}
            </blockquote>
          );
        })}
      <label>
        Reason for your decision
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
      </label>
      <div className="actions">
        <button
          disabled={busy || !reason.trim()}
          onClick={() => decide("ACCEPT", reason)}
        >
          Accept reviewed representation
        </button>
        <button
          className="secondary"
          disabled={busy || !reason.trim()}
          onClick={() => decide("REJECT", reason)}
        >
          Reject proposal
        </button>
      </div>
    </section>
  );
}
function Detail({
  record,
  records,
  caseId,
  onClose,
  onSelect,
  propose,
}: {
  record: CaseRecord;
  records: CaseRecord[];
  caseId: string;
  onClose: () => void;
  onSelect: (r: CaseRecord) => void;
  propose: (c: Command) => Promise<void>;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const before = document.activeElement as HTMLElement;
    closeRef.current?.focus();
    return () => before?.focus();
  }, []);
  return (
    <aside
      className="detail"
      aria-label="Record detail"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <button ref={closeRef} className="quiet" onClick={onClose}>
        ← Close detail
      </button>
      <Basis record={record} />
      <h2>{label(record)}</h2>
      <p className="muted">
        Version {record.revision} · introduced at case revision{" "}
        {record.introduced_case_revision}
      </p>
      {record.kind === "Evidence" ? (
        <SourceReview
          evidence={record}
          records={records}
          caseId={caseId}
          propose={propose}
        />
      ) : (
        <>
          {"rationale" in record && <p>{record.rationale}</p>}
          {"citations" in record &&
            record.citations.map((c: Citation, i: number) => {
              const source = records.find((r) => r.id === c.evidence.id);
              return (
                <blockquote key={i}>
                  <p>{c.quote || "Source locator without exact quote"}</p>
                  {source && (
                    <button className="quiet" onClick={() => onSelect(source)}>
                      {label(source)} →
                    </button>
                  )}
                </blockquote>
              );
            })}
          {"state" in record && (
            <p>
              Lifecycle: <strong>{record.state}</strong>
            </p>
          )}
          <details>
            <summary>Record metadata</summary>
            <pre>{JSON.stringify(record, null, 2)}</pre>
          </details>
        </>
      )}
      <p className="provenance">
        Recorded by {record.created_by}
        <br />
        {record.created_at}
      </p>
    </aside>
  );
}
