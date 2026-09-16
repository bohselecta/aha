import type {
  Record as CaseRecord,
  Ref,
} from "../../../../packages/contracts/contracts";
import {
  human,
  recordTitle,
  refKey,
} from "../../../../packages/workbench/model";

/** The substantive fields a person must see before accepting a representation. */
export function RecordFacts({
  record,
  records,
  inspect,
}: {
  record: CaseRecord;
  records: CaseRecord[];
  inspect: (r: CaseRecord) => void;
}) {
  const groups: [string, Ref[]][] = [];
  if ("support_refs" in record)
    groups.push(["Supporting material", record.support_refs]);
  if ("counter_refs" in record)
    groups.push(["Counter-evidence", record.counter_refs]);
  if ("basis_refs" in record)
    groups.push(["Basis for this decision", record.basis_refs]);
  if ("premise_refs" in record) groups.push(["Premises", record.premise_refs]);
  if ("subject_refs" in record) groups.push(["Subjects", record.subject_refs]);
  if ("participant_refs" in record)
    groups.push(["Participants", record.participant_refs]);
  if ("observation_refs" in record)
    groups.push(["Source statements", record.observation_refs]);
  if ("proposition_refs" in record)
    groups.push(["Competing claims", record.proposition_refs]);
  if (record.kind === "Edge")
    groups.push(["From", [record.from_ref]], ["To", [record.to_ref]]);
  if (record.kind === "TemporalConstraint")
    groups.push(
      ["First occurrence", [record.left]],
      ["Second occurrence", record.right ? [record.right] : []],
    );
  const lists: [string, string[]][] = [];
  if ("assumptions" in record) lists.push(["Assumptions", record.assumptions]);
  if ("weaken_if" in record)
    lists.push(["What would weaken this?", record.weaken_if]);
  if ("retire_if" in record)
    lists.push(["When should this be retired?", record.retire_if]);
  if ("qualifications" in record)
    lists.push(["Uncertainty and qualifications", record.qualifications]);
  if ("resolution_targets" in record)
    lists.push(["What to check next", record.resolution_targets]);
  if ("limitations" in record) lists.push(["Limitations", record.limitations]);
  return (
    <div className="record-facts">
      {"occurrence" in record && (
        <section>
          <h3>Time as recorded</h3>
          <p>{record.occurrence.raw || "No source wording recorded"}</p>
          <p>
            {human(record.occurrence.precision)} ·{" "}
            {record.occurrence.timezone || "Time zone unknown"}
          </p>
          <p>
            {record.occurrence.start || "Open start"}{" "}
            {record.occurrence.start_inclusive ? "(included)" : "(excluded)"} →{" "}
            {record.occurrence.end || "Open end"}{" "}
            {record.occurrence.end_inclusive ? "(included)" : "(excluded)"}
          </p>
          <p>
            Clock: {record.occurrence.clock_source || "Unknown"}
            {record.occurrence.tolerance_seconds !== null
              ? ` · uncertainty ±${record.occurrence.tolerance_seconds} seconds`
              : ""}
          </p>
        </section>
      )}
      {record.kind === "Edge" && (
        <p>
          Relationship: {human(record.relation)} · independence:{" "}
          {human(record.independence)}
        </p>
      )}
      {record.kind === "Observation" && (
        <p>Source independence: {human(record.independence)}</p>
      )}
      {record.kind === "Hypothesis" && (
        <p>
          {human(record.falsifiability)} · {human(record.state)}
        </p>
      )}
      {record.kind === "Contradiction" && (
        <p>
          {human(record.strength)} difference · {human(record.status)}
        </p>
      )}
      {record.kind === "TemporalConstraint" && (
        <p>
          {human(record.constraint_type)} · gap{" "}
          {record.min_lag_seconds ?? "unbounded"} to{" "}
          {record.max_lag_seconds ?? "unbounded"} seconds
          {record.strict ? " · strict bounds" : ""}
        </p>
      )}
      {record.kind === "ClockCorrection" && (
        <p>
          Clock {record.clock_id}: offset {record.offset_min_seconds} to{" "}
          {record.offset_max_seconds} seconds
        </p>
      )}
      {lists.map(([name, items]) => (
        <section key={name}>
          <h3>{name}</h3>
          {items.length ? (
            <ul>
              {items.map((text, i) => (
                <li key={i}>{text}</li>
              ))}
            </ul>
          ) : (
            <p className="muted">None recorded.</p>
          )}
        </section>
      ))}
      {groups.map(([name, refs]) => (
        <section key={name}>
          <h3>{name}</h3>
          {refs.length ? (
            refs.map((ref) => {
              const r = records.find((r) => refKey(r) === refKey(ref));
              return r ? (
                <button
                  className="quiet reference-link"
                  key={refKey(ref)}
                  onClick={() => inspect(r)}
                >
                  {recordTitle(r)} · version {ref.revision}
                </button>
              ) : (
                <p key={refKey(ref)}>
                  Cited version {ref.revision} is unavailable in this view.
                  Refresh before deciding.
                </p>
              );
            })
          ) : (
            <p className="muted">None recorded.</p>
          )}
        </section>
      ))}
    </div>
  );
}
