/* Generated from the authoritative specification. Do not edit. */

/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "Record".
 */
export type Record =
  | Evidence
  | Derivative
  | Entity
  | Observation
  | Interpretation
  | Event
  | Edge
  | Contradiction
  | Hypothesis
  | Question
  | Scenario
  | ModelRun
  | ReviewAction
  | CustodyEvent
  | SceneObject
  | Anchor
  | EntityMerge
  | TemporalConstraint
  | ClockCorrection
  | Note;
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "Review".
 */
export type Review = "PENDING" | "ACCEPTED" | "REJECTED";
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "Observation".
 */
export type Observation = {
  id: string;
  case_id: string;
  revision: number;
  introduced_case_revision: number;
  created_at: string;
  created_by: string;
  kind: "Observation";
  tier: Tier;
  origin: "HUMAN" | "EXTRACTED";
  review: Review;
  /**
   * @minItems 1
   * @maxItems 10000
   */
  citations: Citation[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  support_refs: Ref[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  counter_refs: Ref[];
  rationale: string;
  statement: string;
  /**
   * @minItems 1
   * @maxItems 10000
   */
  subject_refs: Ref[];
  predicate: string;
  object_value: string;
  occurrence: Time;
  discovered_at: string | null;
  recorded_at: string | null;
  provenance_group: string;
  independence: "UNKNOWN" | "SHARED" | "REVIEWED_INDEPENDENT";
};
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "Tier".
 */
export type Tier = "DOCUMENTED" | "OBSERVED" | "INFERRED" | "SPECULATIVE";
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "Locator".
 */
export type Locator =
  | {
      type: "text";
      start: number;
      end: number;
    }
  | {
      type: "page";
      page: number;
      bbox: number[] | null;
    }
  | {
      type: "row";
      sheet: string | null;
      row: number;
      column: string | null;
    }
  | {
      type: "media";
      start_ms: number;
      end_ms: number;
    };
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "Time".
 */
export type Time = {
  raw: string | null;
  start: string | null;
  end: string | null;
  start_inclusive: boolean;
  end_inclusive: boolean;
  timezone: string | null;
  precision: "EXACT" | "RANGE" | "APPROXIMATE" | "DATE_ONLY" | "UNKNOWN" | "DISPUTED";
  clock_source: string;
  tolerance_seconds: number | null;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  alternative_refs: Ref[];
};
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "Interpretation".
 */
export type Interpretation = {
  id: string;
  case_id: string;
  revision: number;
  introduced_case_revision: number;
  created_at: string;
  created_by: string;
  kind: "Interpretation";
  tier: Tier;
  origin: Origin;
  review: Review;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  citations: Citation[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  support_refs: Ref[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  counter_refs: Ref[];
  rationale: string;
  statement: string;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  assumptions: string[];
  /**
   * @minItems 1
   * @maxItems 10000
   */
  premise_refs: Ref[];
};
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "Origin".
 */
export type Origin = "HUMAN" | "EXTRACTED" | "AI_SYNTHETIC";
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "Event".
 */
export type Event = {
  id: string;
  case_id: string;
  revision: number;
  introduced_case_revision: number;
  created_at: string;
  created_by: string;
  kind: "Event";
  tier: Tier;
  origin: Origin;
  review: Review;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  citations: Citation[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  support_refs: Ref[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  counter_refs: Ref[];
  rationale: string;
  label: string;
  occurrence: Time;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  participant_refs: Ref[];
  /**
   * @minItems 1
   * @maxItems 10000
   */
  observation_refs: Ref[];
};
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "Edge".
 */
export type Edge = {
  id: string;
  case_id: string;
  revision: number;
  introduced_case_revision: number;
  created_at: string;
  created_by: string;
  kind: "Edge";
  tier: Tier;
  origin: Origin;
  review: Review;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  citations: Citation[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  support_refs: Ref[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  counter_refs: Ref[];
  rationale: string;
  from_ref: Ref;
  to_ref: Ref;
  relation:
    | "MENTIONS"
    | "LOCATED_AT"
    | "PARTICIPATED_IN"
    | "SUPPORTS"
    | "CONTRADICTS"
    | "PRECEDES"
    | "REFERS_TO"
    | "SAME_IDENTIFIER";
  independence: "UNKNOWN" | "SHARED" | "REVIEWED_INDEPENDENT";
};
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "Hypothesis".
 */
export type Hypothesis = {
  id: string;
  case_id: string;
  revision: number;
  introduced_case_revision: number;
  created_at: string;
  created_by: string;
  kind: "Hypothesis";
  tier: Tier;
  origin: Origin;
  review: Review;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  citations: Citation[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  support_refs: Ref[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  counter_refs: Ref[];
  rationale: string;
  claim: string;
  state: "PROPOSED" | "TESTING" | "SUPPORTED" | "WEAKENED" | "RETIRED";
  family_key: string;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  strengthen_if: string[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  weaken_if: string[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  retire_if: string[];
  falsifiability: "TESTABLE" | "NOT_CURRENTLY_FALSIFIABLE";
  retirement_reason: string | null;
  retired_at_case_revision: number | null;
  predecessor_id: string | null;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  reopening_evidence: Ref[];
};
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "ScenarioStep".
 */
export type ScenarioStep = {
  id: string;
  origin: "SOURCE_BOUND" | "AI_SYNTHETIC";
  description: string;
  occurrence: Time;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  source_refs: Ref[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  assumptions: string[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  actor_refs: Ref[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  unknown_actor_labels: string[];
};
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "SceneObject".
 */
export type SceneObject = {
  id: string;
  case_id: string;
  revision: number;
  introduced_case_revision: number;
  created_at: string;
  created_by: string;
  kind: "SceneObject";
  tier: Tier;
  origin: Origin;
  review: Review;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  citations: Citation[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  support_refs: Ref[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  counter_refs: Ref[];
  rationale: string;
  label: string;
  frame_id: string;
  units: "METERS";
  schematic: boolean;
  geometry_sha256: string;
  /**
   * @minItems 3
   * @maxItems 3
   */
  position: number[];
  /**
   * @minItems 4
   * @maxItems 4
   */
  rotation_quaternion: number[];
  uncertainty_radius_m: number;
};
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "TemporalConstraint".
 */
export type TemporalConstraint = {
  id: string;
  case_id: string;
  revision: number;
  introduced_case_revision: number;
  created_at: string;
  created_by: string;
  kind: "TemporalConstraint";
  constraint_type: "INTERVAL" | "BEFORE";
  left: Ref;
  right: Ref | null;
  window: Time | null;
  min_lag_seconds: number | null;
  max_lag_seconds: number | null;
  strict: boolean;
  /**
   * @minItems 1
   * @maxItems 10000
   */
  basis_refs: Ref[];
  review: Review;
  rationale: string;
};
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "Filter".
 */
export type Filter =
  | {
      field: "text";
      op: "contains";
      value: string;
    }
  | {
      field: "tier";
      op: "in";
      /**
       * @minItems 1
       * @maxItems 4
       */
      value: Tier[];
    }
  | {
      field: "entity_type";
      op: "in";
      /**
       * @minItems 1
       * @maxItems 7
       */
      value: ("PERSON" | "ORGANIZATION" | "PLACE" | "OBJECT" | "VEHICLE" | "DEVICE" | "UNKNOWN_ACTOR")[];
    }
  | {
      field: "occurrence";
      op: "overlaps";
      start: string;
      end: string;
    }
  | {
      field: "cited_source" | "depends_on" | "exclude_source";
      op: "eq";
      value: string;
    };
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "LensMatch".
 */
export type LensMatch = {
  category: "EVIDENTIARY" | "CONTEXTUAL" | "SIMILARITY";
  /**
   * @minItems 1
   * @maxItems 10000
   */
  record_refs: Ref[];
  edge_ref: Ref | null;
  why: string;
  /**
   * @minItems 1
   * @maxItems 10000
   */
  citations: Citation[];
  method: string;
};
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "Command".
 */
export type Command =
  | {
      type: "proposeRecord";
      record: HumanRecordDraft;
      reason: string;
    }
  | {
      type: "reviewProposal";
      proposal_id: string;
      decision: "ACCEPT" | "REJECT";
      reason: string;
    }
  | {
      type: "transitionHypothesis";
      hypothesis: Ref;
      target_state: "PROPOSED" | "TESTING" | "SUPPORTED" | "WEAKENED" | "RETIRED";
      reason: string;
      /**
       * @minItems 0
       * @maxItems 10000
       */
      evidence_refs: Ref[];
    }
  | {
      type: "reopenHypothesis";
      hypothesis: Ref;
      /**
       * @minItems 1
       * @maxItems 10000
       */
      new_evidence_refs: Ref[];
      reason: string;
    }
  | {
      type: "decideContradiction";
      contradiction: Ref;
      decision: "UNRESOLVED" | "RESOLVED" | "DISMISSED";
      /**
       * @minItems 0
       * @maxItems 10000
       */
      evidence_refs: Ref[];
      reason: string;
    }
  | {
      type: "setAnchor";
      proposition: Ref;
      active: boolean;
      reason: string;
    }
  | {
      type: "excludeSource";
      source: Ref;
      excluded: boolean;
      reason: string;
    }
  | {
      type: "reviseRecord";
      target: Ref;
      record: HumanRecordDraft;
      reason: string;
    }
  | {
      type: "proposeContradiction";
      proposal: ModelContradictionProposal;
      reason: string;
    }
  | {
      type: "answerQuestion";
      question: Ref;
      status: "OPEN" | "IN_PROGRESS" | "ANSWERED" | "CLOSED";
      answer_refs: Ref[];
      reason: string;
    };
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "HumanRecordDraft".
 */
export type HumanRecordDraft =
  | HumanEntityDraft
  | HumanObservationDraft
  | HumanInterpretationDraft
  | HumanEventDraft
  | HumanEdgeDraft
  | HumanHypothesisDraft
  | HumanNoteDraft
  | HumanTemporalConstraintDraft
  | HumanClockCorrectionDraft
  | HumanEntityMergeDraft;
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "RunResult".
 */
export type RunResult = AhaResult | ExtractionResult | LensPlan | IngestSummary | ExportArtifact | VerificationResult;

export interface AHABuildContract100 {
  schema_version: "1.0.0";
  case: Case;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  records: Record[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  audit: AuditEvent[];
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "Case".
 */
export interface Case {
  id: string;
  title: string;
  timezone: string;
  schema_version: "1.0.0";
  case_revision: number;
  synthetic: boolean;
  created_at: string;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "Evidence".
 */
export interface Evidence {
  id: string;
  case_id: string;
  revision: number;
  introduced_case_revision: number;
  created_at: string;
  created_by: string;
  kind: "Evidence";
  sha256: string;
  bytes: number;
  media_type: string;
  original_filename: string;
  received_at: string;
  source_channel: "UPLOAD" | "MANUAL" | "CASEMAIL" | "IMPORT";
  integrity: "PENDING" | "VERIFIED" | "FAILED";
  scan_status: "UNSCANNED" | "CLEAN" | "QUARANTINED";
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "Derivative".
 */
export interface Derivative {
  id: string;
  case_id: string;
  revision: number;
  introduced_case_revision: number;
  created_at: string;
  created_by: string;
  kind: "Derivative";
  evidence: Ref;
  sha256: string;
  bytes: number;
  derivative_type: "TEXT" | "OCR" | "PREVIEW" | "REDACTED" | "TRANSCRIPT" | "LOCATOR_MAP";
  tool: string;
  tool_version: string;
  config_sha256: string;
  media_type: string;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "Ref".
 */
export interface Ref {
  id: string;
  revision: number;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "Entity".
 */
export interface Entity {
  id: string;
  case_id: string;
  revision: number;
  introduced_case_revision: number;
  created_at: string;
  created_by: string;
  kind: "Entity";
  label: string;
  entity_type: "PERSON" | "ORGANIZATION" | "PLACE" | "OBJECT" | "VEHICLE" | "DEVICE" | "UNKNOWN_ACTOR";
  /**
   * @minItems 0
   * @maxItems 10000
   */
  aliases: string[];
  review: Review;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  source_refs: Ref[];
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "Citation".
 */
export interface Citation {
  evidence: Ref;
  evidence_sha256: string;
  derivative: Ref | null;
  derivative_sha256: string | null;
  locator: Locator;
  quote: string | null;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "Contradiction".
 */
export interface Contradiction {
  id: string;
  case_id: string;
  revision: number;
  introduced_case_revision: number;
  created_at: string;
  created_by: string;
  kind: "Contradiction";
  /**
   * @minItems 2
   * @maxItems 20
   */
  proposition_refs: Ref[];
  rule: string;
  rule_version: string;
  strength: "POTENTIAL" | "LOGICAL";
  status: "CANDIDATE" | "UNRESOLVED" | "RESOLVED" | "DISMISSED";
  /**
   * @minItems 0
   * @maxItems 10000
   */
  qualifications: string[];
  /**
   * @minItems 1
   * @maxItems 10000
   */
  resolution_targets: string[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  resolution_refs: Ref[];
  decision_reason: string | null;
  predecessor_id: string | null;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "Question".
 */
export interface Question {
  id: string;
  case_id: string;
  revision: number;
  introduced_case_revision: number;
  created_at: string;
  created_by: string;
  kind: "Question";
  text: string;
  /**
   * @minItems 1
   * @maxItems 10
   */
  scenario_ids: string[];
  /**
   * @minItems 2
   * @maxItems 10
   */
  outcomes: {
    observation: string;
    /**
     * @minItems 0
     * @maxItems 10000
     */
    supports_scenario_ids: string[];
    /**
     * @minItems 0
     * @maxItems 10000
     */
    weakens_scenario_ids: string[];
  }[];
  source_to_check: string;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  limitations: string[];
  effort: "UNKNOWN" | "LOW" | "MEDIUM" | "HIGH";
  status: "OPEN" | "IN_PROGRESS" | "ANSWERED" | "CLOSED";
  /**
   * @minItems 0
   * @maxItems 10000
   */
  answer_refs: Ref[];
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "Scenario".
 */
export interface Scenario {
  id: string;
  case_id: string;
  revision: number;
  introduced_case_revision: number;
  created_at: string;
  created_by: string;
  kind: "Scenario";
  run_id: string;
  tier: "SPECULATIVE";
  origin: "AI_SYNTHETIC";
  review: Review;
  title: string;
  summary: string;
  family:
    | "MINIMAL_ASSUMPTIONS"
    | "SOFT_TIME_ERROR"
    | "INTERPRETATION_ERROR"
    | "UNKNOWN_ACTOR"
    | "INDEPENDENT_EVENTS"
    | "OPPORTUNISTIC"
    | "ALTERNATE_ORDER"
    | "CONVENTIONAL"
    | "ADVERSARIAL"
    | "WILDCARD";
  signature: Signature;
  /**
   * @minItems 1
   * @maxItems 10000
   */
  anchor_refs: Ref[];
  /**
   * @minItems 1
   * @maxItems 100
   */
  steps: ScenarioStep[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  counter_refs: Ref[];
  /**
   * @minItems 1
   * @maxItems 10000
   */
  question_ids: string[];
  validation: "PENDING" | "PASSED" | "HELD" | "REJECTED";
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "Signature".
 */
export interface Signature {
  mechanism: string;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  ordering: string[];
  actor_structure: string;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  relaxed_premise_ids: string[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  independence_assumptions: string[];
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "ModelRun".
 */
export interface ModelRun {
  id: string;
  case_id: string;
  revision: number;
  introduced_case_revision: number;
  created_at: string;
  created_by: string;
  kind: "ModelRun";
  task: "EXTRACT" | "LENS" | "AHA" | "CONTRADICTION" | "SURPRISE";
  case_revision: number;
  provider: string;
  model: string;
  model_digest: string | null;
  prompt_version: string;
  input_sha256: string;
  output_sha256: string | null;
  temperature: number;
  seed: number | null;
  status: "QUEUED" | "RUNNING" | "SUCCEEDED" | "PARTIAL" | "FAILED" | "CANCELLED";
  /**
   * @minItems 0
   * @maxItems 10000
   */
  validation_errors: string[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  context_refs: Ref[];
  omitted_count: number;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "ReviewAction".
 */
export interface ReviewAction {
  id: string;
  case_id: string;
  revision: number;
  introduced_case_revision: number;
  created_at: string;
  created_by: string;
  kind: "ReviewAction";
  action: string;
  /**
   * @minItems 1
   * @maxItems 10000
   */
  target_refs: Ref[];
  reason: string;
  actor_subject: string;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "CustodyEvent".
 */
export interface CustodyEvent {
  id: string;
  case_id: string;
  revision: number;
  introduced_case_revision: number;
  created_at: string;
  created_by: string;
  kind: "CustodyEvent";
  evidence: Ref;
  action: "RECEIVED" | "VERIFIED" | "EXPORTED" | "TRANSFER_RECORDED";
  sha256: string;
  actor_subject: string;
  details: string;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "Anchor".
 */
export interface Anchor {
  id: string;
  case_id: string;
  revision: number;
  introduced_case_revision: number;
  created_at: string;
  created_by: string;
  kind: "Anchor";
  proposition: Ref;
  reason: string;
  active: boolean;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "EntityMerge".
 */
export interface EntityMerge {
  id: string;
  case_id: string;
  revision: number;
  introduced_case_revision: number;
  created_at: string;
  created_by: string;
  kind: "EntityMerge";
  /**
   * @minItems 2
   * @maxItems 10000
   */
  entity_refs: Ref[];
  canonical_ref: Ref;
  reason: string;
  active: boolean;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "ClockCorrection".
 */
export interface ClockCorrection {
  id: string;
  case_id: string;
  revision: number;
  introduced_case_revision: number;
  created_at: string;
  created_by: string;
  kind: "ClockCorrection";
  clock_id: string;
  /**
   * @minItems 1
   * @maxItems 10000
   */
  raw_time_refs: Ref[];
  offset_min_seconds: number;
  offset_max_seconds: number;
  /**
   * @minItems 1
   * @maxItems 10000
   */
  basis_refs: Ref[];
  review: Review;
  rationale: string;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "Note".
 */
export interface Note {
  id: string;
  case_id: string;
  revision: number;
  introduced_case_revision: number;
  created_at: string;
  created_by: string;
  kind: "Note";
  text: string;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  target_refs: Ref[];
  review: Review;
  note_type: "INVESTIGATOR_NOTE" | "SCOPE_LIMIT" | "DECISION_NOTE";
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "AuditEvent".
 */
export interface AuditEvent {
  case_id: string;
  sequence: number;
  at: string;
  actor: string;
  action: string;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  target_refs: Ref[];
  reason: string;
  previous_sha256: string | null;
  payload_sha256: string;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "CaseExchange".
 */
export interface CaseExchange {
  schema_version: "1.0.0";
  case: Case;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  records: Record[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  audit: AuditEvent[];
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "LensPlan".
 */
export interface LensPlan {
  query: string;
  case_revision: number;
  combine: "all" | "any";
  /**
   * @minItems 0
   * @maxItems 20
   */
  filters: Filter[];
  hops: number;
  /**
   * @minItems 0
   * @maxItems 8
   */
  relations: (
    | "MENTIONS"
    | "LOCATED_AT"
    | "PARTICIPATED_IN"
    | "SUPPORTS"
    | "CONTRADICTS"
    | "PRECEDES"
    | "REFERS_TO"
    | "SAME_IDENTIFIER"
  )[];
  include_similarity: boolean;
  max_nodes: number;
  max_edges: number;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "LensResult".
 */
export interface LensResult {
  case_revision: number;
  index_revision: number;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  node_ids: string[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  edge_ids: string[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  matches: LensMatch[];
  truncated: boolean;
  omitted_count: number;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  warnings: string[];
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "AhaRequest".
 */
export interface AhaRequest {
  case_revision: number;
  interval: Time;
  /**
   * @minItems 1
   * @maxItems 1000
   */
  anchor_refs: Ref[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  soft_refs: Ref[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  exclude_refs: Ref[];
  requested_count: number;
  /**
   * @minItems 1
   * @maxItems 10
   */
  families: (
    | "MINIMAL_ASSUMPTIONS"
    | "SOFT_TIME_ERROR"
    | "INTERPRETATION_ERROR"
    | "UNKNOWN_ACTOR"
    | "INDEPENDENT_EVENTS"
    | "OPPORTUNISTIC"
    | "ALTERNATE_ORDER"
    | "CONVENTIONAL"
    | "ADVERSARIAL"
    | "WILDCARD"
  )[];
  /**
   * @minItems 0
   * @maxItems 1000
   */
  constraint_refs: Ref[];
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "AhaResult".
 */
export interface AhaResult {
  run: ModelRun;
  /**
   * @minItems 0
   * @maxItems 10
   */
  scenarios: Scenario[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  questions: Question[];
  requested_count: number;
  rejected_count: number;
  partial_reason: string | null;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "ExtractionResult".
 */
export interface ExtractionResult {
  /**
   * @minItems 0
   * @maxItems 10000
   */
  proposals: (Entity | Observation | Event | Interpretation | Edge | Contradiction)[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  warnings: string[];
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "Proposal".
 */
export interface Proposal {
  id: string;
  case_revision: number;
  record: Record;
  status: Review;
  run_id: string | null;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "HumanEntityDraft".
 */
export interface HumanEntityDraft {
  kind: "Entity";
  label: string;
  entity_type: "PERSON" | "ORGANIZATION" | "PLACE" | "OBJECT" | "VEHICLE" | "DEVICE" | "UNKNOWN_ACTOR";
  /**
   * @minItems 0
   * @maxItems 10000
   */
  aliases: string[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  source_refs: Ref[];
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "HumanObservationDraft".
 */
export interface HumanObservationDraft {
  kind: "Observation";
  tier: Tier;
  /**
   * @minItems 1
   * @maxItems 10000
   */
  citations: Citation[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  support_refs: Ref[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  counter_refs: Ref[];
  rationale: string;
  statement: string;
  /**
   * @minItems 1
   * @maxItems 10000
   */
  subject_refs: Ref[];
  predicate: string;
  object_value: string;
  occurrence: Time;
  discovered_at: string | null;
  recorded_at: string | null;
  provenance_group: string;
  independence: "UNKNOWN" | "SHARED" | "REVIEWED_INDEPENDENT";
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "HumanInterpretationDraft".
 */
export interface HumanInterpretationDraft {
  kind: "Interpretation";
  tier: Tier;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  citations: Citation[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  support_refs: Ref[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  counter_refs: Ref[];
  rationale: string;
  statement: string;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  assumptions: string[];
  /**
   * @minItems 1
   * @maxItems 10000
   */
  premise_refs: Ref[];
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "HumanEventDraft".
 */
export interface HumanEventDraft {
  kind: "Event";
  tier: Tier;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  citations: Citation[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  support_refs: Ref[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  counter_refs: Ref[];
  rationale: string;
  label: string;
  occurrence: Time;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  participant_refs: Ref[];
  /**
   * @minItems 1
   * @maxItems 10000
   */
  observation_refs: Ref[];
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "HumanEdgeDraft".
 */
export interface HumanEdgeDraft {
  kind: "Edge";
  tier: Tier;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  citations: Citation[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  support_refs: Ref[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  counter_refs: Ref[];
  rationale: string;
  from_ref: Ref;
  to_ref: Ref;
  relation:
    | "MENTIONS"
    | "LOCATED_AT"
    | "PARTICIPATED_IN"
    | "SUPPORTS"
    | "CONTRADICTS"
    | "PRECEDES"
    | "REFERS_TO"
    | "SAME_IDENTIFIER";
  independence: "UNKNOWN" | "SHARED" | "REVIEWED_INDEPENDENT";
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "HumanHypothesisDraft".
 */
export interface HumanHypothesisDraft {
  kind: "Hypothesis";
  tier: Tier;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  citations: Citation[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  support_refs: Ref[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  counter_refs: Ref[];
  rationale: string;
  claim: string;
  family_key: string;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  strengthen_if: string[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  weaken_if: string[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  retire_if: string[];
  falsifiability: "TESTABLE" | "NOT_CURRENTLY_FALSIFIABLE";
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "HumanNoteDraft".
 */
export interface HumanNoteDraft {
  kind: "Note";
  text: string;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  target_refs: Ref[];
  note_type: "INVESTIGATOR_NOTE" | "SCOPE_LIMIT" | "DECISION_NOTE";
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "HumanTemporalConstraintDraft".
 */
export interface HumanTemporalConstraintDraft {
  kind: "TemporalConstraint";
  constraint_type: "INTERVAL" | "BEFORE";
  left: Ref;
  right: Ref | null;
  window: Time | null;
  min_lag_seconds: number | null;
  max_lag_seconds: number | null;
  strict: boolean;
  /**
   * @minItems 1
   * @maxItems 10000
   */
  basis_refs: Ref[];
  rationale: string;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "HumanClockCorrectionDraft".
 */
export interface HumanClockCorrectionDraft {
  kind: "ClockCorrection";
  clock_id: string;
  /**
   * @minItems 1
   * @maxItems 10000
   */
  raw_time_refs: Ref[];
  offset_min_seconds: number;
  offset_max_seconds: number;
  /**
   * @minItems 1
   * @maxItems 10000
   */
  basis_refs: Ref[];
  rationale: string;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "HumanEntityMergeDraft".
 */
export interface HumanEntityMergeDraft {
  kind: "EntityMerge";
  /**
   * @minItems 2
   * @maxItems 10000
   */
  entity_refs: Ref[];
  canonical_ref: Ref;
  reason: string;
  active: boolean;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "ModelContradictionProposal".
 */
export interface ModelContradictionProposal {
  /**
   * @minItems 2
   * @maxItems 20
   */
  proposition_refs: Ref[];
  rule: string;
  rule_version: string;
  strength: "POTENTIAL" | "LOGICAL";
  /**
   * @minItems 0
   * @maxItems 10000
   */
  qualifications: string[];
  /**
   * @minItems 1
   * @maxItems 10000
   */
  resolution_targets: string[];
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "CommandResult".
 */
export interface CommandResult {
  case_revision: number;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  changed_refs: Ref[];
  proposal_id: string | null;
  audit_sequence: number;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "Job".
 */
export interface Job {
  id: string;
  case_id: string;
  type: "INGEST" | "EXTRACT" | "LENS" | "AHA" | "EXPORT" | "BACKUP" | "IMPORT" | "VERIFY" | "REINDEX" | "SURPRISE";
  state: "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELLED";
  phase: string;
  fraction: number | null;
  result_path: string | null;
  error: string | null;
  snapshot_revision: number;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "ExportRequest".
 */
export interface ExportRequest {
  format: "PDF" | "HTML" | "JSON" | "CSV" | "CASE_ZIP";
  /**
   * @minItems 1
   * @maxItems 7
   */
  sections: ("CHRONOLOGY" | "CONTRADICTIONS" | "QUESTIONS" | "NOTES" | "SCENARIOS" | "SOURCES" | "HISTORY")[];
  case_revision: number;
  include_synthetic: boolean;
  redaction_plan_id: string | null;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "Manifest".
 */
export interface Manifest {
  schema_version: "1.0.0";
  case_id: string;
  case_revision: number;
  synthetic: boolean;
  /**
   * @minItems 1
   * @maxItems 10000
   */
  files: {
    path: string;
    bytes: number;
    sha256: string;
  }[];
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "ImportEnvelope".
 */
export interface ImportEnvelope {
  case_id: string;
  authenticated_sender: string;
  mailbox_id: string;
  message_id: string;
  message_sha256: string;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  attachment_evidence_ids: string[];
  received_at: string;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "Error".
 */
export interface Error {
  code: string;
  message: string;
  request_id: string;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  field_errors: {
    path: string;
    code: string;
    message: string;
  }[];
  retryable: boolean;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "CreateCase".
 */
export interface CreateCase {
  title: string;
  timezone: string;
  synthetic: boolean;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "QueryRequest".
 */
export interface QueryRequest {
  query: string;
  case_revision: number;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "Page".
 */
export interface Page {
  case_revision: number;
  index_revision: number;
  /**
   * @minItems 0
   * @maxItems 200
   */
  items: Record[];
  next_cursor: string | null;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "CasePage".
 */
export interface CasePage {
  /**
   * @minItems 0
   * @maxItems 200
   */
  items: Case[];
  next_cursor: string | null;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "GraphResult".
 */
export interface GraphResult {
  case_revision: number;
  /**
   * @minItems 0
   * @maxItems 500
   */
  nodes: Record[];
  /**
   * @minItems 0
   * @maxItems 1500
   */
  edges: Edge[];
  truncated: boolean;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "SavedView".
 */
export interface SavedView {
  id: string;
  view_revision: number;
  title: string;
  plan: LensPlan;
  mode: "2D" | "3D" | "TABLE";
  /**
   * @minItems 0
   * @maxItems 10000
   */
  pins: {
    id: string;
    x: number;
    y: number;
    z: number;
  }[];
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "RedactionPlan".
 */
export interface RedactionPlan {
  id: string;
  case_revision: number;
  reason: string;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  remove_record_ids: string[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  regions: {
    evidence_id: string;
    locator: Locator;
  }[];
  reviewed: boolean;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "Health".
 */
export interface Health {
  status: "OK" | "DEGRADED";
  schema_version: string;
  offline_mode: boolean;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "SessionRequest".
 */
export interface SessionRequest {
  pairing_secret: string;
  operator_label: string;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "Session".
 */
export interface Session {
  actor: string;
  csrf_token: string;
  expires_at: string;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "Snapshot".
 */
export interface Snapshot {
  id: string;
  case_id: string;
  case_revision: number;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  record_refs: Ref[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  anchor_refs: Ref[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  constraint_refs: Ref[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  retired_hypothesis_refs: Ref[];
  source_manifest_sha256: string;
  created_at: string;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "ProviderConfig".
 */
export interface ProviderConfig {
  id: string;
  label: string;
  adapter: "REPLAY" | "OLLAMA" | "OPENAI_COMPATIBLE_LOCAL" | "REMOTE_OPTIONAL";
  base_url: string;
  model: string;
  remote: boolean;
  enabled: boolean;
  secret_ref: string | null;
  context_tokens: number;
  max_output_tokens: number;
  timeout_seconds: number;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "ProviderStatus".
 */
export interface ProviderStatus {
  id: string;
  available: boolean;
  structured_output: boolean;
  embeddings: boolean;
  model_digest: string | null;
  message: string;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "CasePolicy".
 */
export interface CasePolicy {
  remote_models_enabled: boolean;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  approved_provider_ids: string[];
  export_names_in_filenames: boolean;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "IngestSummary".
 */
export interface IngestSummary {
  result_type: "INGEST";
  /**
   * @minItems 0
   * @maxItems 10000
   */
  evidence_refs: Ref[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  derivative_refs: Ref[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  proposal_ids: string[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  warnings: string[];
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "ExportArtifact".
 */
export interface ExportArtifact {
  result_type: "EXPORT";
  export_id: string;
  sha256: string;
  bytes: number;
  case_revision: number;
  expires_at: string;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "VerificationResult".
 */
export interface VerificationResult {
  result_type: "VERIFY" | "REINDEX" | "IMPORT";
  case_revision: number;
  checked_count: number;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  failures: string[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  warnings: string[];
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "JobEvent".
 */
export interface JobEvent {
  event_id: number;
  job_id: string;
  at: string;
  state: "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELLED";
  phase: string;
  fraction: number | null;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "ModelScenarioProposal".
 */
export interface ModelScenarioProposal {
  title: string;
  summary: string;
  family:
    | "MINIMAL_ASSUMPTIONS"
    | "SOFT_TIME_ERROR"
    | "INTERPRETATION_ERROR"
    | "UNKNOWN_ACTOR"
    | "INDEPENDENT_EVENTS"
    | "OPPORTUNISTIC"
    | "ALTERNATE_ORDER"
    | "CONVENTIONAL"
    | "ADVERSARIAL"
    | "WILDCARD";
  signature: Signature;
  /**
   * @minItems 1
   * @maxItems 10000
   */
  anchor_refs: Ref[];
  /**
   * @minItems 1
   * @maxItems 100
   */
  steps: ScenarioStep[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  counter_refs: Ref[];
  candidate_key: string;
  /**
   * @minItems 1
   * @maxItems 30
   */
  question_keys: string[];
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "ModelQuestionProposal".
 */
export interface ModelQuestionProposal {
  text: string;
  /**
   * @minItems 2
   * @maxItems 10
   */
  outcomes: {
    observation: string;
    /**
     * @minItems 0
     * @maxItems 100
     */
    supports_scenario_keys: string[];
    /**
     * @minItems 0
     * @maxItems 100
     */
    weakens_scenario_keys: string[];
  }[];
  source_to_check: string;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  limitations: string[];
  effort: "UNKNOWN" | "LOW" | "MEDIUM" | "HIGH";
  question_key: string;
  /**
   * @minItems 1
   * @maxItems 10
   */
  scenario_keys: string[];
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "ModelAhaOutput".
 */
export interface ModelAhaOutput {
  /**
   * @minItems 0
   * @maxItems 10
   */
  scenarios: ModelScenarioProposal[];
  /**
   * @minItems 0
   * @maxItems 100
   */
  questions: ModelQuestionProposal[];
  partial_reason: string | null;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "ModelEntityProposal".
 */
export interface ModelEntityProposal {
  kind: "Entity";
  label: string;
  entity_type: "PERSON" | "ORGANIZATION" | "PLACE" | "OBJECT" | "VEHICLE" | "DEVICE" | "UNKNOWN_ACTOR";
  /**
   * @minItems 0
   * @maxItems 10000
   */
  aliases: string[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  source_refs: Ref[];
  proposed_id: string;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "ModelObservationProposal".
 */
export interface ModelObservationProposal {
  kind: "Observation";
  /**
   * @minItems 1
   * @maxItems 10000
   */
  citations: Citation[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  support_refs: Ref[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  counter_refs: Ref[];
  rationale: string;
  statement: string;
  /**
   * @minItems 1
   * @maxItems 10000
   */
  subject_refs: Ref[];
  predicate: string;
  object_value: string;
  occurrence: Time;
  discovered_at: string | null;
  recorded_at: string | null;
  provenance_group: string;
  independence: "UNKNOWN" | "SHARED" | "REVIEWED_INDEPENDENT";
  suggested_tier: Tier;
  proposed_id: string;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "ModelEventProposal".
 */
export interface ModelEventProposal {
  kind: "Event";
  /**
   * @minItems 0
   * @maxItems 10000
   */
  citations: Citation[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  support_refs: Ref[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  counter_refs: Ref[];
  rationale: string;
  label: string;
  occurrence: Time;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  participant_refs: Ref[];
  /**
   * @minItems 1
   * @maxItems 10000
   */
  observation_refs: Ref[];
  suggested_tier: Tier;
  proposed_id: string;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "ModelInterpretationProposal".
 */
export interface ModelInterpretationProposal {
  kind: "Interpretation";
  /**
   * @minItems 0
   * @maxItems 10000
   */
  citations: Citation[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  support_refs: Ref[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  counter_refs: Ref[];
  rationale: string;
  statement: string;
  /**
   * @minItems 0
   * @maxItems 10000
   */
  assumptions: string[];
  /**
   * @minItems 1
   * @maxItems 10000
   */
  premise_refs: Ref[];
  suggested_tier: Tier;
  proposed_id: string;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "ModelEdgeProposal".
 */
export interface ModelEdgeProposal {
  kind: "Edge";
  /**
   * @minItems 0
   * @maxItems 10000
   */
  citations: Citation[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  support_refs: Ref[];
  /**
   * @minItems 0
   * @maxItems 10000
   */
  counter_refs: Ref[];
  rationale: string;
  from_ref: Ref;
  to_ref: Ref;
  relation:
    | "MENTIONS"
    | "LOCATED_AT"
    | "PARTICIPATED_IN"
    | "SUPPORTS"
    | "CONTRADICTS"
    | "PRECEDES"
    | "REFERS_TO"
    | "SAME_IDENTIFIER";
  independence: "UNKNOWN" | "SHARED" | "REVIEWED_INDEPENDENT";
  suggested_tier: Tier;
  proposed_id: string;
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "ModelExtractionOutput".
 */
export interface ModelExtractionOutput {
  /**
   * @maxItems 1000
   */
  proposals: (
    | ModelEntityProposal
    | ModelObservationProposal
    | ModelEventProposal
    | ModelInterpretationProposal
    | ModelEdgeProposal
  )[];
  /**
   * @maxItems 100
   */
  warnings: string[];
}
/**
 * This interface was referenced by `AHABuildContract100`'s JSON-Schema
 * via the `definition` "ModelContradictionOutput".
 */
export interface ModelContradictionOutput {
  /**
   * @maxItems 1000
   */
  proposals: ModelContradictionProposal[];
  /**
   * @maxItems 100
   */
  warnings: string[];
}
