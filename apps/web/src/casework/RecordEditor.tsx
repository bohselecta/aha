import { useState } from "react";
import type {
  Record as CaseRecord,
  Command,
  HumanRecordDraft,
  Ref,
  Time,
} from "../../../../packages/contracts/contracts";
import {
  human,
  recordTitle,
  refKey,
} from "../../../../packages/workbench/model";

type RecordKind = HumanRecordDraft["kind"];
const names: Record<RecordKind, string> = {
  Entity: "Person, place or object",
  Observation: "Source statement",
  Event: "Event",
  Interpretation: "Interpretation",
  Edge: "Relationship",
  Hypothesis: "Explanation",
  Note: "Investigator note",
  TemporalConstraint: "Time constraint",
  ClockCorrection: "Clock correction",
  EntityMerge: "Entity equivalence",
};
export const referenceOf = (r: CaseRecord): Ref => ({
  id: r.id,
  revision: r.revision,
});
export const unknownTime: Time = {
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
};
const lines = (value: FormDataEntryValue | null) =>
  String(value ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

export function ReferencePicker({
  name,
  label,
  records,
  selected = [],
  kinds,
  required = false,
}: {
  name: string;
  label: string;
  records: CaseRecord[];
  selected?: Ref[];
  kinds?: string[];
  required?: boolean;
}) {
  const choices = records.filter(
    (r) =>
      (!kinds || kinds.includes(r.kind)) &&
      (!("review" in r) || r.review === "ACCEPTED") &&
      !("origin" in r && r.origin === "AI_SYNTHETIC"),
  );
  return (
    <fieldset className="reference-picker">
      <legend>
        {label}
        {required ? " (choose at least one)" : ""}
      </legend>
      {choices.length ? (
        choices.map((r) => (
          <label className="check" key={refKey(r)}>
            <input
              type="checkbox"
              name={name}
              value={refKey(r)}
              defaultChecked={selected.some((ref) => refKey(ref) === refKey(r))}
            />
            <span>
              {recordTitle(r)}{" "}
              <small>
                {human(r.kind)} · version {r.revision}
              </small>
            </span>
          </label>
        ))
      ) : (
        <p className="muted">
          No eligible records yet. Add and review the prerequisite material
          first.
        </p>
      )}
    </fieldset>
  );
}
export function chosenRefs(
  data: FormData,
  name: string,
  records: CaseRecord[],
) {
  const selected = new Set(data.getAll(name).map(String));
  return records.filter((r) => selected.has(refKey(r))).map(referenceOf);
}
export function TimeFields({ value = unknownTime }: { value?: Time }) {
  const [precision, setPrecision] = useState<Time["precision"]>(
    value.precision,
  );
  return (
    <fieldset>
      <legend>When did it happen?</legend>
      <label>
        Time as the source describes it
        <input
          name="time_raw"
          defaultValue={value.raw ?? ""}
          placeholder="For example: shortly after closing"
        />
      </label>
      <label>
        How precisely is the time known?
        <select
          name="time_precision"
          value={precision}
          onChange={(e) => setPrecision(e.target.value as Time["precision"])}
        >
          {[
            "UNKNOWN",
            "EXACT",
            "RANGE",
            "APPROXIMATE",
            "DATE_ONLY",
            "DISPUTED",
          ].map((p) => (
            <option key={p} value={p}>
              {human(p)}
            </option>
          ))}
        </select>
      </label>
      {precision !== "UNKNOWN" && (
        <>
          <p className="muted">
            Enter known bounds with their UTC offset, such as
            2026-09-16T09:30:00-05:00. Leave an unknown bound empty. An exact
            time uses the same value for both bounds.
          </p>
          <label>
            Earliest time
            <input
              name="time_start"
              defaultValue={value.start ?? ""}
              placeholder="2026-09-16T09:30:00-05:00"
            />
          </label>
          <label>
            Latest time
            <input
              name="time_end"
              defaultValue={value.end ?? ""}
              placeholder="2026-09-16T09:30:00-05:00"
            />
          </label>
          <label>
            Time zone
            <input
              name="time_zone"
              defaultValue={value.timezone ?? ""}
              placeholder="America/Chicago"
            />
          </label>
          <label className="check">
            <input
              type="checkbox"
              name="time_start_inclusive"
              defaultChecked={value.start_inclusive}
            />
            Include earliest bound
          </label>
          <label className="check">
            <input
              type="checkbox"
              name="time_end_inclusive"
              defaultChecked={value.end_inclusive}
            />
            Include latest bound
          </label>
          {precision === "APPROXIMATE" && (
            <label>
              Uncertainty, in seconds
              <input
                type="number"
                name="time_tolerance"
                min="0"
                required
                defaultValue={value.tolerance_seconds ?? 0}
              />
            </label>
          )}
        </>
      )}
      <label>
        Clock or source of time
        <input name="time_clock" defaultValue={value.clock_source} required />
      </label>
    </fieldset>
  );
}
function formTime(data: FormData, previous?: Time): Time {
  const precision = String(data.get("time_precision")) as Time["precision"];
  return {
    ...unknownTime,
    raw: String(data.get("time_raw") || "") || null,
    precision,
    clock_source: String(data.get("time_clock") || "Unknown"),
    alternative_refs: previous?.alternative_refs ?? [],
    ...(precision !== "UNKNOWN"
      ? {
          start: String(data.get("time_start") || "") || null,
          end: String(data.get("time_end") || "") || null,
          timezone: String(data.get("time_zone") || "") || null,
          start_inclusive: data.has("time_start_inclusive"),
          end_inclusive: data.has("time_end_inclusive"),
          tolerance_seconds:
            precision === "APPROXIMATE"
              ? Number(data.get("time_tolerance"))
              : null,
        }
      : {}),
  };
}
const baseProps = [
  "id",
  "case_id",
  "revision",
  "introduced_case_revision",
  "created_at",
  "created_by",
  "origin",
  "review",
  "state",
  "predecessor_id",
  "retirement_reason",
  "retired_at_case_revision",
  "reopening_evidence",
];
export function draftOf(record: CaseRecord): HumanRecordDraft {
  return Object.fromEntries(
    Object.entries(record).filter(([key]) => !baseProps.includes(key)),
  ) as unknown as HumanRecordDraft;
}

export function RecordEditor({
  records,
  initial,
  busy,
  onSubmit,
  onClose,
}: {
  records: CaseRecord[];
  initial?: HumanRecordDraft;
  busy: boolean;
  onSubmit: (draft: HumanRecordDraft, reason: string) => Promise<boolean>;
  onClose?: () => void;
}) {
  const [kind, setKind] = useState<RecordKind>(initial?.kind ?? "Event");
  const [error, setError] = useState("");
  const i = initial?.kind === kind ? initial : undefined;
  const eligible = records.filter(
    (r) => !("review" in r) || r.review === "ACCEPTED",
  );
  const options = (kinds?: string[]) =>
    eligible
      .filter((r) => !kinds || kinds.includes(r.kind))
      .map((r) => (
        <option key={refKey(r)} value={refKey(r)}>
          {recordTitle(r)} · v{r.revision}
        </option>
      ));
  const pick = (data: FormData, name: string) => {
    const r = eligible.find((r) => refKey(r) === data.get(name));
    if (!r)
      throw Error("Choose a reviewed record for each required connection.");
    return referenceOf(r);
  };
  const supported = [
    "Event",
    "Interpretation",
    "Edge",
    "Hypothesis",
    "Observation",
  ].includes(kind);
  return (
    <form
      className="record-editor"
      onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        const form = event.currentTarget,
          data = new FormData(form);
        const str = (name: string) => String(data.get(name) ?? "").trim();
        const selected = (name: string) => chosenRefs(data, name, records);
        try {
          const support = selected("support"),
            counter = selected("counter");
          const common = {
            tier: str("tier"),
            citations: [
              ...(i && "citations" in i ? i.citations : []),
              ...selected("cite_passages").flatMap((ref) => {
                const r = records.find((r) => refKey(r) === refKey(ref));
                return r && "citations" in r ? r.citations : [];
              }),
            ],
            support_refs: support,
            counter_refs: counter,
            rationale: str("rationale"),
          };
          let draft: HumanRecordDraft;
          switch (kind) {
            case "Entity":
              draft = {
                kind,
                label: str("label"),
                entity_type: str("entity_type"),
                aliases: lines(data.get("aliases")),
                source_refs: selected("sources"),
              } as HumanRecordDraft;
              break;
            case "Note":
              draft = {
                kind,
                text: str("text"),
                note_type: str("note_type"),
                target_refs: selected("targets"),
              } as HumanRecordDraft;
              break;
            case "Event": {
              const observation_refs = selected("observations");
              if (!observation_refs.length)
                throw Error(
                  "Choose at least one reviewed source statement for this event.",
                );
              draft = {
                kind,
                ...common,
                label: str("label"),
                occurrence: formTime(
                  data,
                  i && "occurrence" in i ? i.occurrence : undefined,
                ),
                participant_refs: selected("participants"),
                observation_refs,
                support_refs: [
                  ...new Map(
                    [...support, ...observation_refs].map((ref) => [
                      refKey(ref),
                      ref,
                    ]),
                  ).values(),
                ],
              } as HumanRecordDraft;
              break;
            }
            case "Observation":
              if (!i || i.kind !== "Observation")
                throw Error(
                  "Create source statements by selecting a passage in Inbox.",
                );
              draft = {
                ...i,
                ...common,
                statement: str("statement"),
                object_value: str("statement"),
                predicate: str("predicate"),
                subject_refs: selected("participants"),
                occurrence: formTime(data, i.occurrence),
              } as HumanRecordDraft;
              break;
            case "Interpretation":
              if (!support.length)
                throw Error(
                  "Choose the reviewed premises for this interpretation.",
                );
              draft = {
                kind,
                ...common,
                statement: str("statement"),
                assumptions: lines(data.get("assumptions")),
                premise_refs: support,
              } as HumanRecordDraft;
              break;
            case "Edge":
              draft = {
                kind,
                ...common,
                from_ref: pick(data, "from"),
                to_ref: pick(data, "to"),
                relation: str("relation"),
                independence: str("independence"),
              } as HumanRecordDraft;
              break;
            case "Hypothesis":
              draft = {
                kind,
                ...common,
                claim: str("claim"),
                family_key: str("family"),
                strengthen_if: lines(data.get("strengthen")),
                weaken_if: lines(data.get("weaken")),
                retire_if: lines(data.get("retire")),
                falsifiability: str("falsifiability"),
              } as HumanRecordDraft;
              break;
            case "ClockCorrection":
              draft = {
                kind,
                clock_id: str("clock"),
                raw_time_refs: selected("times"),
                offset_min_seconds: Number(str("offset_min")),
                offset_max_seconds: Number(str("offset_max")),
                basis_refs: selected("support"),
                rationale: str("rationale"),
              };
              break;
            case "TemporalConstraint":
              draft = {
                kind,
                constraint_type: "BEFORE",
                left: pick(data, "from"),
                right: pick(data, "to"),
                window: null,
                min_lag_seconds: str("lag_min") ? Number(str("lag_min")) : null,
                max_lag_seconds: str("lag_max") ? Number(str("lag_max")) : null,
                strict: data.has("strict"),
                basis_refs: selected("support"),
                rationale: str("rationale"),
              };
              break;
            default:
              throw Error(
                "Use the source review workflow for this record type.",
              );
          }
          if (await onSubmit(draft, str("reason"))) {
            form.reset();
            onClose?.();
          }
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : "Could not save the proposal.",
          );
        }
      }}
    >
      <label>
        What would you like to record?
        <select
          value={kind}
          disabled={!!initial}
          onChange={(e) => {
            setKind(e.target.value as RecordKind);
            setError("");
          }}
        >
          {(initial
            ? [initial.kind]
            : ([
                "Event",
                "Interpretation",
                "Edge",
                "Hypothesis",
                "Note",
                "Entity",
                "ClockCorrection",
                "TemporalConstraint",
              ] as RecordKind[])
          ).map((k) => (
            <option value={k} key={k}>
              {names[k]}
            </option>
          ))}
        </select>
      </label>
      <div key={kind}>
        {(kind === "Event" || kind === "Entity") && (
          <label>
            Label
            <input
              name="label"
              required
              maxLength={200}
              defaultValue={i && "label" in i ? i.label : ""}
            />
          </label>
        )}
        {kind === "Entity" && (
          <>
            <label>
              Type
              <select
                name="entity_type"
                defaultValue={i?.kind === "Entity" ? i.entity_type : "PERSON"}
              >
                {[
                  "PERSON",
                  "PLACE",
                  "ORGANIZATION",
                  "OBJECT",
                  "VEHICLE",
                  "DEVICE",
                  "UNKNOWN_ACTOR",
                ].map((k) => (
                  <option key={k} value={k}>
                    {human(k)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Other names, one per line
              <textarea
                name="aliases"
                defaultValue={i?.kind === "Entity" ? i.aliases.join("\n") : ""}
              />
            </label>
            <ReferencePicker
              name="sources"
              label="Sources naming this subject"
              records={records}
              kinds={["Evidence"]}
              selected={i?.kind === "Entity" ? i.source_refs : []}
            />
          </>
        )}
        {kind === "Note" && (
          <>
            <label>
              Note
              <textarea
                name="text"
                required
                maxLength={20000}
                defaultValue={i?.kind === "Note" ? i.text : ""}
              />
            </label>
            <label>
              Note type
              <select
                name="note_type"
                defaultValue={
                  i?.kind === "Note" ? i.note_type : "INVESTIGATOR_NOTE"
                }
              >
                {["INVESTIGATOR_NOTE", "SCOPE_LIMIT", "DECISION_NOTE"].map(
                  (k) => (
                    <option key={k} value={k}>
                      {human(k)}
                    </option>
                  ),
                )}
              </select>
            </label>
            <ReferencePicker
              name="targets"
              label="Related records"
              records={records}
              selected={i?.kind === "Note" ? i.target_refs : []}
            />
          </>
        )}
        {(kind === "Interpretation" || kind === "Observation") && (
          <label>
            {kind === "Observation"
              ? "Source statement"
              : "Your interpretation"}
            <textarea
              name="statement"
              required
              maxLength={20000}
              defaultValue={i && "statement" in i ? i.statement : ""}
            />
          </label>
        )}
        {kind === "Observation" && (
          <label>
            What kind of claim is this?
            <input
              name="predicate"
              required
              defaultValue={i?.kind === "Observation" ? i.predicate : "reports"}
            />
          </label>
        )}
        {kind === "Interpretation" && (
          <label>
            Assumptions, one per line
            <textarea
              name="assumptions"
              defaultValue={
                i?.kind === "Interpretation" ? i.assumptions.join("\n") : ""
              }
            />
          </label>
        )}
        {(kind === "Event" || kind === "Observation") && (
          <>
            <TimeFields
              value={i && "occurrence" in i ? i.occurrence : undefined}
            />
            <ReferencePicker
              name="participants"
              label="People, places or objects involved in the account"
              records={records}
              kinds={["Entity"]}
              selected={
                i?.kind === "Event"
                  ? i.participant_refs
                  : i?.kind === "Observation"
                    ? i.subject_refs
                    : []
              }
            />
          </>
        )}
        {kind === "Event" && (
          <ReferencePicker
            name="observations"
            label="Statements describing this event"
            records={records}
            kinds={["Observation"]}
            selected={i?.kind === "Event" ? i.observation_refs : []}
            required
          />
        )}
        {(kind === "Edge" || kind === "TemporalConstraint") && (
          <>
            <label>
              {kind === "Edge" ? "From record" : "Earlier occurrence"}
              <select
                name="from"
                required
                defaultValue={
                  i?.kind === "Edge"
                    ? refKey(i.from_ref)
                    : i?.kind === "TemporalConstraint"
                      ? refKey(i.left)
                      : ""
                }
              >
                <option value="">Choose a record</option>
                {options(
                  kind === "TemporalConstraint"
                    ? ["Observation", "Event"]
                    : ["Entity", "Observation", "Event", "Interpretation"],
                )}
              </select>
            </label>
            <label>
              {kind === "Edge" ? "To record" : "Later occurrence"}
              <select
                name="to"
                required
                defaultValue={
                  i?.kind === "Edge"
                    ? refKey(i.to_ref)
                    : i?.kind === "TemporalConstraint" && i.right
                      ? refKey(i.right)
                      : ""
                }
              >
                <option value="">Choose a record</option>
                {options(
                  kind === "TemporalConstraint"
                    ? ["Observation", "Event"]
                    : ["Entity", "Observation", "Event", "Interpretation"],
                )}
              </select>
            </label>
          </>
        )}
        {kind === "Edge" && (
          <>
            <label>
              Relationship
              <select
                name="relation"
                defaultValue={i?.kind === "Edge" ? i.relation : "REFERS_TO"}
              >
                {[
                  "MENTIONS",
                  "LOCATED_AT",
                  "PARTICIPATED_IN",
                  "SUPPORTS",
                  "CONTRADICTS",
                  "PRECEDES",
                  "REFERS_TO",
                  "SAME_IDENTIFIER",
                ].map((k) => (
                  <option key={k} value={k}>
                    {human(k)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Source independence
              <select
                name="independence"
                defaultValue={i?.kind === "Edge" ? i.independence : "UNKNOWN"}
              >
                {["UNKNOWN", "SHARED", "REVIEWED_INDEPENDENT"].map((k) => (
                  <option key={k} value={k}>
                    {human(k)}
                  </option>
                ))}
              </select>
            </label>
            <p className="muted">
              The relationship needs its own support. The status of either
              endpoint does not establish the connection.
            </p>
          </>
        )}
        {kind === "Hypothesis" && (
          <>
            <label>
              Possible explanation
              <textarea
                name="claim"
                required
                defaultValue={i?.kind === "Hypothesis" ? i.claim : ""}
              />
            </label>
            <label>
              Short name for this explanation
              <input
                name="family"
                maxLength={200}
                required
                defaultValue={i?.kind === "Hypothesis" ? i.family_key : ""}
              />
            </label>
            <label>
              What would strengthen it?
              <textarea
                name="strengthen"
                defaultValue={
                  i?.kind === "Hypothesis" ? i.strengthen_if.join("\n") : ""
                }
              />
            </label>
            <label>
              What would weaken it?
              <textarea
                name="weaken"
                defaultValue={
                  i?.kind === "Hypothesis" ? i.weaken_if.join("\n") : ""
                }
              />
            </label>
            <label>
              What would cause you to retire it?
              <textarea
                name="retire"
                defaultValue={
                  i?.kind === "Hypothesis" ? i.retire_if.join("\n") : ""
                }
              />
            </label>
            <label>
              Can it currently be tested?
              <select
                name="falsifiability"
                defaultValue={
                  i?.kind === "Hypothesis" ? i.falsifiability : "TESTABLE"
                }
              >
                <option value="TESTABLE">Testable</option>
                <option value="NOT_CURRENTLY_FALSIFIABLE">
                  No current way to test it
                </option>
              </select>
            </label>
          </>
        )}
        {kind === "ClockCorrection" && (
          <>
            <label>
              Clock identifier
              <input
                name="clock"
                required
                defaultValue={i?.kind === "ClockCorrection" ? i.clock_id : ""}
              />
            </label>
            <p className="muted">
              Add this offset to the recorded UTC time. A clock running fast
              needs a negative correction. Original times remain unchanged.
            </p>
            <label>
              Minimum correction, seconds
              <input
                name="offset_min"
                type="number"
                step="any"
                required
                defaultValue={
                  i?.kind === "ClockCorrection" ? i.offset_min_seconds : 0
                }
              />
            </label>
            <label>
              Maximum correction, seconds
              <input
                name="offset_max"
                type="number"
                step="any"
                required
                defaultValue={
                  i?.kind === "ClockCorrection" ? i.offset_max_seconds : 0
                }
              />
            </label>
            <ReferencePicker
              name="times"
              label="Affected source times"
              records={records}
              kinds={["Observation", "Event"]}
              selected={i?.kind === "ClockCorrection" ? i.raw_time_refs : []}
              required
            />
          </>
        )}
        {kind === "TemporalConstraint" && (
          <>
            <label>
              Minimum gap, seconds
              <input
                name="lag_min"
                type="number"
                min="0"
                defaultValue={
                  i?.kind === "TemporalConstraint"
                    ? (i.min_lag_seconds ?? "")
                    : ""
                }
              />
            </label>
            <label>
              Maximum gap, seconds
              <input
                name="lag_max"
                type="number"
                min="0"
                defaultValue={
                  i?.kind === "TemporalConstraint"
                    ? (i.max_lag_seconds ?? "")
                    : ""
                }
              />
            </label>
            <label className="check">
              <input
                type="checkbox"
                name="strict"
                defaultChecked={i?.kind === "TemporalConstraint" && i.strict}
              />
              Exclude equality at a stated bound
            </label>
          </>
        )}
        {supported && (
          <label>
            Basis
            <select
              name="tier"
              defaultValue={
                i && "tier" in i
                  ? i.tier
                  : kind === "Hypothesis"
                    ? "SPECULATIVE"
                    : "INFERRED"
              }
            >
              {["DOCUMENTED", "OBSERVED", "INFERRED", "SPECULATIVE"].map(
                (k) => (
                  <option value={k} key={k}>
                    {human(k)}
                  </option>
                ),
              )}
            </select>
          </label>
        )}
        {supported && (
          <ReferencePicker
            name="cite_passages"
            label="Attach exact source passages from these reviewed statements"
            records={records}
            kinds={["Observation"]}
          />
        )}
        {(supported ||
          kind === "ClockCorrection" ||
          kind === "TemporalConstraint") && (
          <>
            <ReferencePicker
              name="support"
              label="Supporting material or premises"
              records={records}
              kinds={[
                "Evidence",
                "Observation",
                "Event",
                "Interpretation",
                "Edge",
              ]}
              selected={
                i && "support_refs" in i
                  ? i.support_refs
                  : i && "basis_refs" in i
                    ? i.basis_refs
                    : []
              }
            />
            <label>
              Explain the basis
              <textarea
                name="rationale"
                required
                defaultValue={i && "rationale" in i ? i.rationale : ""}
              />
            </label>
          </>
        )}
        {supported && (
          <ReferencePicker
            name="counter"
            label="Counter-evidence or competing material"
            records={records}
            kinds={[
              "Evidence",
              "Observation",
              "Event",
              "Interpretation",
              "Edge",
            ]}
            selected={i && "counter_refs" in i ? i.counter_refs : []}
          />
        )}
        <label>
          Reason for this proposal
          <input name="reason" required maxLength={20000} />
        </label>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="actions">
        <button disabled={busy}>Send for review</button>
        {onClose && (
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
