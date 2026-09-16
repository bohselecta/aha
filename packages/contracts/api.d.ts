export interface paths {
    "/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** health */
        get: operations["health"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/session": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** pairSession */
        post: operations["pairSession"];
        /** logout */
        delete: operations["logout"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/providers": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Sanitized provider configuration; never credentials */
        get: operations["listProviders"];
        put?: never;
        /** Custodian-only configuration; validate URL allowlist and secret reference */
        post: operations["configureProvider"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/providers/{provider_id}/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** providerHealth */
        get: operations["providerHealth"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cases": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listCases */
        get: operations["listCases"];
        put?: never;
        /** createCase */
        post: operations["createCase"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cases/import": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** importCase */
        post: operations["importCase"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cases/{case_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** getCase */
        get: operations["getCase"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cases/{case_id}/policy": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** getCasePolicy */
        get: operations["getCasePolicy"];
        /** Custodian-only; remote enablement never implied by endpoint configuration */
        put: operations["updateCasePolicy"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cases/{case_id}/records": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listRecords */
        get: operations["listRecords"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cases/{case_id}/records/{record_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** getRecord */
        get: operations["getRecord"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cases/{case_id}/commands": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** submitCommand */
        post: operations["submitCommand"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cases/{case_id}/proposals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List pending and reviewed extraction proposals */
        get: operations["listProposals"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cases/{case_id}/ingest": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** ingestFiles */
        post: operations["ingestFiles"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cases/{case_id}/evidence/{record_id}/original": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** downloadOriginal */
        get: operations["downloadOriginal"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cases/{case_id}/derivatives/{record_id}/content": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** downloadDerivative */
        get: operations["downloadDerivative"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cases/{case_id}/graph": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** getGraph */
        get: operations["getGraph"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cases/{case_id}/timeline": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** getTimeline */
        get: operations["getTimeline"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cases/{case_id}/search": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** searchCase */
        get: operations["searchCase"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cases/{case_id}/lens/compile": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** compileLens */
        post: operations["compileLens"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cases/{case_id}/lens/execute": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** executeLens */
        post: operations["executeLens"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cases/{case_id}/surprise": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** suggestLens */
        post: operations["suggestLens"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cases/{case_id}/views": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** saveView */
        post: operations["saveView"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cases/{case_id}/views/{view_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** getView */
        get: operations["getView"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cases/{case_id}/aha/runs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** runAha */
        post: operations["runAha"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cases/{case_id}/aha/runs/{run_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** getAhaResult */
        get: operations["getAhaResult"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cases/{case_id}/contradictions/scan": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** scanContradictions */
        post: operations["scanContradictions"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cases/{case_id}/redactions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** saveRedactionPlan */
        post: operations["saveRedactionPlan"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cases/{case_id}/exports": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** exportCase */
        post: operations["exportCase"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cases/{case_id}/exports/{export_id}/download": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** downloadExport */
        get: operations["downloadExport"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cases/{case_id}/backup": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** backupCase */
        post: operations["backupCase"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cases/{case_id}/integrity/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** verifyIntegrity */
        post: operations["verifyIntegrity"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cases/{case_id}/indexes/rebuild": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** rebuildIndexes */
        post: operations["rebuildIndexes"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cases/{case_id}/jobs/{job_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** getJob */
        get: operations["getJob"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cases/{case_id}/jobs/{job_id}/result": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** getValidatedJobResult */
        get: operations["getValidatedJobResult"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cases/{case_id}/jobs/{job_id}/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** jobEvents */
        get: operations["jobEvents"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cases/{case_id}/jobs/{job_id}/cancel": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** cancelJob */
        post: operations["cancelJob"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/integrations/casemail/envelopes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Optional adapter; 403 when disabled; does not send mail */
        post: operations["ingestMailEnvelope"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        Ref: {
            /** Format: uuid */
            id: string;
            revision: number;
        };
        /** @enum {string} */
        Tier: "DOCUMENTED" | "OBSERVED" | "INFERRED" | "SPECULATIVE";
        /** @enum {string} */
        Origin: "HUMAN" | "EXTRACTED" | "AI_SYNTHETIC";
        /** @enum {string} */
        Review: "PENDING" | "ACCEPTED" | "REJECTED";
        Time: {
            raw: string | null;
            start: string | null;
            end: string | null;
            start_inclusive: boolean;
            end_inclusive: boolean;
            timezone: string | null;
            /** @enum {string} */
            precision: "EXACT" | "RANGE" | "APPROXIMATE" | "DATE_ONLY" | "UNKNOWN" | "DISPUTED";
            clock_source: string;
            tolerance_seconds: number | null;
            alternative_refs: components["schemas"]["Ref"][];
        } & (unknown & unknown & unknown);
        Locator: {
            /** @constant */
            type: "text";
            start: number;
            end: number;
        } | {
            /** @constant */
            type: "page";
            page: number;
            bbox: number[] | null;
        } | {
            /** @constant */
            type: "row";
            sheet: string | null;
            row: number;
            column: string | null;
        } | {
            /** @constant */
            type: "media";
            start_ms: number;
            end_ms: number;
        };
        Citation: {
            evidence: components["schemas"]["Ref"];
            evidence_sha256: string;
            derivative: components["schemas"]["Ref"] | null;
            derivative_sha256: string | null;
            locator: components["schemas"]["Locator"];
            quote: string | null;
        };
        Case: {
            /** Format: uuid */
            id: string;
            title: string;
            timezone: string;
            /** @constant */
            schema_version: "1.0.0";
            case_revision: number;
            synthetic: boolean;
            /** Format: date-time */
            created_at: string;
        };
        Evidence: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            case_id: string;
            revision: number;
            introduced_case_revision: number;
            /** Format: date-time */
            created_at: string;
            created_by: string;
            /** @constant */
            kind: "Evidence";
            sha256: string;
            bytes: number;
            media_type: string;
            original_filename: string;
            /** Format: date-time */
            received_at: string;
            /** @enum {string} */
            source_channel: "UPLOAD" | "MANUAL" | "CASEMAIL" | "IMPORT";
            /** @enum {string} */
            integrity: "PENDING" | "VERIFIED" | "FAILED";
            /** @enum {string} */
            scan_status: "UNSCANNED" | "CLEAN" | "QUARANTINED";
        };
        Derivative: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            case_id: string;
            revision: number;
            introduced_case_revision: number;
            /** Format: date-time */
            created_at: string;
            created_by: string;
            /** @constant */
            kind: "Derivative";
            evidence: components["schemas"]["Ref"];
            sha256: string;
            bytes: number;
            /** @enum {string} */
            derivative_type: "TEXT" | "OCR" | "PREVIEW" | "REDACTED" | "TRANSCRIPT" | "LOCATOR_MAP";
            tool: string;
            tool_version: string;
            config_sha256: string;
            media_type: string;
        };
        Entity: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            case_id: string;
            revision: number;
            introduced_case_revision: number;
            /** Format: date-time */
            created_at: string;
            created_by: string;
            /** @constant */
            kind: "Entity";
            label: string;
            /** @enum {string} */
            entity_type: "PERSON" | "ORGANIZATION" | "PLACE" | "OBJECT" | "VEHICLE" | "DEVICE" | "UNKNOWN_ACTOR";
            aliases: string[];
            review: components["schemas"]["Review"];
            source_refs: components["schemas"]["Ref"][];
        };
        Observation: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            case_id: string;
            revision: number;
            introduced_case_revision: number;
            /** Format: date-time */
            created_at: string;
            created_by: string;
            /** @constant */
            kind: "Observation";
            tier: components["schemas"]["Tier"];
            /** @enum {string} */
            origin: "HUMAN" | "EXTRACTED";
            review: components["schemas"]["Review"];
            citations: components["schemas"]["Citation"][];
            support_refs: components["schemas"]["Ref"][];
            counter_refs: components["schemas"]["Ref"][];
            rationale: string;
            statement: string;
            subject_refs: components["schemas"]["Ref"][];
            predicate: string;
            object_value: string;
            occurrence: components["schemas"]["Time"];
            discovered_at: string | null;
            recorded_at: string | null;
            provenance_group: string;
            /** @enum {string} */
            independence: "UNKNOWN" | "SHARED" | "REVIEWED_INDEPENDENT";
        } & (unknown & unknown & unknown);
        Interpretation: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            case_id: string;
            revision: number;
            introduced_case_revision: number;
            /** Format: date-time */
            created_at: string;
            created_by: string;
            /** @constant */
            kind: "Interpretation";
            tier: components["schemas"]["Tier"];
            origin: components["schemas"]["Origin"];
            review: components["schemas"]["Review"];
            citations: components["schemas"]["Citation"][];
            support_refs: components["schemas"]["Ref"][];
            counter_refs: components["schemas"]["Ref"][];
            rationale: string;
            statement: string;
            assumptions: string[];
            premise_refs: components["schemas"]["Ref"][];
        } & (unknown & unknown & unknown);
        Event: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            case_id: string;
            revision: number;
            introduced_case_revision: number;
            /** Format: date-time */
            created_at: string;
            created_by: string;
            /** @constant */
            kind: "Event";
            tier: components["schemas"]["Tier"];
            origin: components["schemas"]["Origin"];
            review: components["schemas"]["Review"];
            citations: components["schemas"]["Citation"][];
            support_refs: components["schemas"]["Ref"][];
            counter_refs: components["schemas"]["Ref"][];
            rationale: string;
            label: string;
            occurrence: components["schemas"]["Time"];
            participant_refs: components["schemas"]["Ref"][];
            observation_refs: components["schemas"]["Ref"][];
        } & (unknown & unknown & unknown);
        Edge: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            case_id: string;
            revision: number;
            introduced_case_revision: number;
            /** Format: date-time */
            created_at: string;
            created_by: string;
            /** @constant */
            kind: "Edge";
            tier: components["schemas"]["Tier"];
            origin: components["schemas"]["Origin"];
            review: components["schemas"]["Review"];
            citations: components["schemas"]["Citation"][];
            support_refs: components["schemas"]["Ref"][];
            counter_refs: components["schemas"]["Ref"][];
            rationale: string;
            from_ref: components["schemas"]["Ref"];
            to_ref: components["schemas"]["Ref"];
            /** @enum {string} */
            relation: "MENTIONS" | "LOCATED_AT" | "PARTICIPATED_IN" | "SUPPORTS" | "CONTRADICTS" | "PRECEDES" | "REFERS_TO" | "SAME_IDENTIFIER";
            /** @enum {string} */
            independence: "UNKNOWN" | "SHARED" | "REVIEWED_INDEPENDENT";
        } & (unknown & unknown & unknown);
        Contradiction: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            case_id: string;
            revision: number;
            introduced_case_revision: number;
            /** Format: date-time */
            created_at: string;
            created_by: string;
            /** @constant */
            kind: "Contradiction";
            proposition_refs: components["schemas"]["Ref"][];
            rule: string;
            rule_version: string;
            /** @enum {string} */
            strength: "POTENTIAL" | "LOGICAL";
            /** @enum {string} */
            status: "CANDIDATE" | "UNRESOLVED" | "RESOLVED" | "DISMISSED";
            qualifications: string[];
            resolution_targets: string[];
            resolution_refs: components["schemas"]["Ref"][];
            decision_reason: string | null;
            predecessor_id: string | null;
        };
        Hypothesis: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            case_id: string;
            revision: number;
            introduced_case_revision: number;
            /** Format: date-time */
            created_at: string;
            created_by: string;
            /** @constant */
            kind: "Hypothesis";
            tier: components["schemas"]["Tier"];
            origin: components["schemas"]["Origin"];
            review: components["schemas"]["Review"];
            citations: components["schemas"]["Citation"][];
            support_refs: components["schemas"]["Ref"][];
            counter_refs: components["schemas"]["Ref"][];
            rationale: string;
            claim: string;
            /** @enum {string} */
            state: "PROPOSED" | "TESTING" | "SUPPORTED" | "WEAKENED" | "RETIRED";
            family_key: string;
            strengthen_if: string[];
            weaken_if: string[];
            retire_if: string[];
            /** @enum {string} */
            falsifiability: "TESTABLE" | "NOT_CURRENTLY_FALSIFIABLE";
            retirement_reason: string | null;
            retired_at_case_revision: number | null;
            predecessor_id: string | null;
            reopening_evidence: components["schemas"]["Ref"][];
        } & (unknown & unknown & unknown & unknown & unknown);
        Question: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            case_id: string;
            revision: number;
            introduced_case_revision: number;
            /** Format: date-time */
            created_at: string;
            created_by: string;
            /** @constant */
            kind: "Question";
            text: string;
            scenario_ids: string[];
            outcomes: {
                observation: string;
                supports_scenario_ids: string[];
                weakens_scenario_ids: string[];
            }[];
            source_to_check: string;
            limitations: string[];
            /** @enum {string} */
            effort: "UNKNOWN" | "LOW" | "MEDIUM" | "HIGH";
            /** @enum {string} */
            status: "OPEN" | "IN_PROGRESS" | "ANSWERED" | "CLOSED";
            answer_refs: components["schemas"]["Ref"][];
        };
        ScenarioStep: {
            /** Format: uuid */
            id: string;
            /** @enum {string} */
            origin: "SOURCE_BOUND" | "AI_SYNTHETIC";
            description: string;
            occurrence: components["schemas"]["Time"];
            source_refs: components["schemas"]["Ref"][];
            assumptions: string[];
            actor_refs: components["schemas"]["Ref"][];
            unknown_actor_labels: string[];
        } & unknown;
        Signature: {
            mechanism: string;
            ordering: string[];
            actor_structure: string;
            relaxed_premise_ids: string[];
            independence_assumptions: string[];
        };
        Scenario: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            case_id: string;
            revision: number;
            introduced_case_revision: number;
            /** Format: date-time */
            created_at: string;
            created_by: string;
            /** @constant */
            kind: "Scenario";
            /** Format: uuid */
            run_id: string;
            /** @constant */
            tier: "SPECULATIVE";
            /** @constant */
            origin: "AI_SYNTHETIC";
            review: components["schemas"]["Review"];
            title: string;
            summary: string;
            /** @enum {string} */
            family: "MINIMAL_ASSUMPTIONS" | "SOFT_TIME_ERROR" | "INTERPRETATION_ERROR" | "UNKNOWN_ACTOR" | "INDEPENDENT_EVENTS" | "OPPORTUNISTIC" | "ALTERNATE_ORDER" | "CONVENTIONAL" | "ADVERSARIAL" | "WILDCARD";
            signature: components["schemas"]["Signature"];
            anchor_refs: components["schemas"]["Ref"][];
            steps: components["schemas"]["ScenarioStep"][];
            counter_refs: components["schemas"]["Ref"][];
            question_ids: string[];
            /** @enum {string} */
            validation: "PENDING" | "PASSED" | "HELD" | "REJECTED";
        };
        ModelRun: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            case_id: string;
            revision: number;
            introduced_case_revision: number;
            /** Format: date-time */
            created_at: string;
            created_by: string;
            /** @constant */
            kind: "ModelRun";
            /** @enum {string} */
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
            /** @enum {string} */
            status: "QUEUED" | "RUNNING" | "SUCCEEDED" | "PARTIAL" | "FAILED" | "CANCELLED";
            validation_errors: string[];
            context_refs: components["schemas"]["Ref"][];
            omitted_count: number;
        };
        ReviewAction: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            case_id: string;
            revision: number;
            introduced_case_revision: number;
            /** Format: date-time */
            created_at: string;
            created_by: string;
            /** @constant */
            kind: "ReviewAction";
            action: string;
            target_refs: components["schemas"]["Ref"][];
            reason: string;
            actor_subject: string;
        };
        CustodyEvent: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            case_id: string;
            revision: number;
            introduced_case_revision: number;
            /** Format: date-time */
            created_at: string;
            created_by: string;
            /** @constant */
            kind: "CustodyEvent";
            evidence: components["schemas"]["Ref"];
            /** @enum {string} */
            action: "RECEIVED" | "VERIFIED" | "EXPORTED" | "TRANSFER_RECORDED";
            sha256: string;
            actor_subject: string;
            details: string;
        };
        AuditEvent: {
            /** Format: uuid */
            case_id: string;
            sequence: number;
            /** Format: date-time */
            at: string;
            actor: string;
            action: string;
            target_refs: components["schemas"]["Ref"][];
            reason: string;
            previous_sha256: string | null;
            payload_sha256: string;
        };
        SceneObject: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            case_id: string;
            revision: number;
            introduced_case_revision: number;
            /** Format: date-time */
            created_at: string;
            created_by: string;
            /** @constant */
            kind: "SceneObject";
            tier: components["schemas"]["Tier"];
            origin: components["schemas"]["Origin"];
            review: components["schemas"]["Review"];
            citations: components["schemas"]["Citation"][];
            support_refs: components["schemas"]["Ref"][];
            counter_refs: components["schemas"]["Ref"][];
            rationale: string;
            label: string;
            /** Format: uuid */
            frame_id: string;
            /** @constant */
            units: "METERS";
            schematic: boolean;
            geometry_sha256: string;
            position: number[];
            rotation_quaternion: number[];
            uncertainty_radius_m: number;
        } & (unknown & unknown & unknown);
        Anchor: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            case_id: string;
            revision: number;
            introduced_case_revision: number;
            /** Format: date-time */
            created_at: string;
            created_by: string;
            /** @constant */
            kind: "Anchor";
            proposition: components["schemas"]["Ref"];
            reason: string;
            active: boolean;
        };
        EntityMerge: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            case_id: string;
            revision: number;
            introduced_case_revision: number;
            /** Format: date-time */
            created_at: string;
            created_by: string;
            /** @constant */
            kind: "EntityMerge";
            entity_refs: components["schemas"]["Ref"][];
            canonical_ref: components["schemas"]["Ref"];
            reason: string;
            active: boolean;
        };
        Record: components["schemas"]["Evidence"] | components["schemas"]["Derivative"] | components["schemas"]["Entity"] | components["schemas"]["Observation"] | components["schemas"]["Interpretation"] | components["schemas"]["Event"] | components["schemas"]["Edge"] | components["schemas"]["Contradiction"] | components["schemas"]["Hypothesis"] | components["schemas"]["Question"] | components["schemas"]["Scenario"] | components["schemas"]["ModelRun"] | components["schemas"]["ReviewAction"] | components["schemas"]["CustodyEvent"] | components["schemas"]["SceneObject"] | components["schemas"]["Anchor"] | components["schemas"]["EntityMerge"] | components["schemas"]["TemporalConstraint"] | components["schemas"]["ClockCorrection"] | components["schemas"]["Note"];
        CaseExchange: {
            /** @constant */
            schema_version: "1.0.0";
            case: components["schemas"]["Case"];
            records: components["schemas"]["Record"][];
            audit: components["schemas"]["AuditEvent"][];
        };
        Filter: {
            /** @constant */
            field: "text";
            /** @constant */
            op: "contains";
            value: string;
        } | {
            /** @constant */
            field: "tier";
            /** @constant */
            op: "in";
            value: components["schemas"]["Tier"][];
        } | {
            /** @constant */
            field: "entity_type";
            /** @constant */
            op: "in";
            value: ("PERSON" | "ORGANIZATION" | "PLACE" | "OBJECT" | "VEHICLE" | "DEVICE" | "UNKNOWN_ACTOR")[];
        } | {
            /** @constant */
            field: "occurrence";
            /** @constant */
            op: "overlaps";
            /** Format: date-time */
            start: string;
            /** Format: date-time */
            end: string;
        } | {
            /** @enum {string} */
            field: "cited_source" | "depends_on" | "exclude_source";
            /** @constant */
            op: "eq";
            /** Format: uuid */
            value: string;
        };
        LensPlan: {
            query: string;
            case_revision: number;
            /** @enum {string} */
            combine: "all" | "any";
            filters: components["schemas"]["Filter"][];
            hops: number;
            relations: ("MENTIONS" | "LOCATED_AT" | "PARTICIPATED_IN" | "SUPPORTS" | "CONTRADICTS" | "PRECEDES" | "REFERS_TO" | "SAME_IDENTIFIER")[];
            include_similarity: boolean;
            max_nodes: number;
            max_edges: number;
        };
        LensMatch: {
            /** @enum {string} */
            category: "EVIDENTIARY" | "CONTEXTUAL" | "SIMILARITY";
            record_refs: components["schemas"]["Ref"][];
            edge_ref: components["schemas"]["Ref"] | null;
            why: string;
            citations: components["schemas"]["Citation"][];
            method: string;
        } & unknown;
        LensResult: {
            case_revision: number;
            index_revision: number;
            node_ids: string[];
            edge_ids: string[];
            matches: components["schemas"]["LensMatch"][];
            truncated: boolean;
            omitted_count: number;
            warnings: string[];
        };
        AhaRequest: {
            case_revision: number;
            interval: components["schemas"]["Time"];
            anchor_refs: components["schemas"]["Ref"][];
            soft_refs: components["schemas"]["Ref"][];
            exclude_refs: components["schemas"]["Ref"][];
            requested_count: number;
            families: ("MINIMAL_ASSUMPTIONS" | "SOFT_TIME_ERROR" | "INTERPRETATION_ERROR" | "UNKNOWN_ACTOR" | "INDEPENDENT_EVENTS" | "OPPORTUNISTIC" | "ALTERNATE_ORDER" | "CONVENTIONAL" | "ADVERSARIAL" | "WILDCARD")[];
            constraint_refs: components["schemas"]["Ref"][];
        };
        AhaResult: {
            run: components["schemas"]["ModelRun"];
            scenarios: components["schemas"]["Scenario"][];
            questions: components["schemas"]["Question"][];
            requested_count: number;
            rejected_count: number;
            partial_reason: string | null;
        };
        ExtractionResult: {
            proposals: (components["schemas"]["Entity"] | components["schemas"]["Observation"] | components["schemas"]["Event"] | components["schemas"]["Interpretation"] | components["schemas"]["Edge"] | components["schemas"]["Contradiction"])[];
            warnings: string[];
        };
        Proposal: {
            /** Format: uuid */
            id: string;
            case_revision: number;
            record: components["schemas"]["Record"];
            status: components["schemas"]["Review"];
            run_id: string | null;
        };
        Command: {
            /** @constant */
            type: "proposeRecord";
            record: components["schemas"]["HumanRecordDraft"];
            reason: string;
        } | {
            /** @constant */
            type: "reviewProposal";
            /** Format: uuid */
            proposal_id: string;
            /** @enum {string} */
            decision: "ACCEPT" | "REJECT";
            reason: string;
        } | {
            /** @constant */
            type: "transitionHypothesis";
            hypothesis: components["schemas"]["Ref"];
            /** @enum {string} */
            target_state: "PROPOSED" | "TESTING" | "SUPPORTED" | "WEAKENED" | "RETIRED";
            reason: string;
            evidence_refs: components["schemas"]["Ref"][];
        } | {
            /** @constant */
            type: "reopenHypothesis";
            hypothesis: components["schemas"]["Ref"];
            new_evidence_refs: components["schemas"]["Ref"][];
            reason: string;
        } | {
            /** @constant */
            type: "decideContradiction";
            contradiction: components["schemas"]["Ref"];
            /** @enum {string} */
            decision: "UNRESOLVED" | "RESOLVED" | "DISMISSED";
            evidence_refs: components["schemas"]["Ref"][];
            reason: string;
        } | {
            /** @constant */
            type: "setAnchor";
            proposition: components["schemas"]["Ref"];
            active: boolean;
            reason: string;
        } | {
            /** @constant */
            type: "excludeSource";
            source: components["schemas"]["Ref"];
            excluded: boolean;
            reason: string;
        } | {
            /** @constant */
            type: "reviseRecord";
            target: components["schemas"]["Ref"];
            record: components["schemas"]["HumanRecordDraft"];
            reason: string;
        } | {
            /** @constant */
            type: "proposeContradiction";
            proposal: components["schemas"]["ModelContradictionProposal"];
            reason: string;
        } | {
            /** @constant */
            type: "answerQuestion";
            question: components["schemas"]["Ref"];
            /** @enum {unknown} */
            status: "OPEN" | "IN_PROGRESS" | "ANSWERED" | "CLOSED";
            answer_refs: components["schemas"]["Ref"][];
            reason: string;
        };
        CommandResult: {
            case_revision: number;
            changed_refs: components["schemas"]["Ref"][];
            proposal_id: string | null;
            audit_sequence: number;
        };
        Job: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            case_id: string;
            /** @enum {string} */
            type: "INGEST" | "EXTRACT" | "LENS" | "AHA" | "EXPORT" | "BACKUP" | "IMPORT" | "VERIFY" | "REINDEX" | "SURPRISE";
            /** @enum {string} */
            state: "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELLED";
            phase: string;
            fraction: number | null;
            result_path: string | null;
            error: string | null;
            snapshot_revision: number;
        };
        ExportRequest: {
            /** @enum {string} */
            format: "PDF" | "HTML" | "JSON" | "CSV" | "CASE_ZIP";
            sections: ("CHRONOLOGY" | "CONTRADICTIONS" | "QUESTIONS" | "NOTES" | "SCENARIOS" | "SOURCES" | "HISTORY")[];
            case_revision: number;
            include_synthetic: boolean;
            redaction_plan_id: string | null;
        };
        Manifest: {
            /** @constant */
            schema_version: "1.0.0";
            /** Format: uuid */
            case_id: string;
            case_revision: number;
            synthetic: boolean;
            files: {
                path: string;
                bytes: number;
                sha256: string;
            }[];
        };
        ImportEnvelope: {
            /** Format: uuid */
            case_id: string;
            authenticated_sender: string;
            mailbox_id: string;
            message_id: string;
            message_sha256: string;
            attachment_evidence_ids: string[];
            /** Format: date-time */
            received_at: string;
        };
        Error: {
            code: string;
            message: string;
            request_id: string;
            field_errors: {
                path: string;
                code: string;
                message: string;
            }[];
            retryable: boolean;
        };
        CreateCase: {
            title: string;
            timezone: string;
            synthetic: boolean;
        };
        QueryRequest: {
            query: string;
            case_revision: number;
        };
        Page: {
            case_revision: number;
            index_revision: number;
            items: components["schemas"]["Record"][];
            next_cursor: string | null;
        };
        CasePage: {
            items: components["schemas"]["Case"][];
            next_cursor: string | null;
        };
        GraphResult: {
            case_revision: number;
            nodes: components["schemas"]["Record"][];
            edges: components["schemas"]["Edge"][];
            truncated: boolean;
        };
        SavedView: {
            /** Format: uuid */
            id: string;
            view_revision: number;
            title: string;
            plan: components["schemas"]["LensPlan"];
            /** @enum {string} */
            mode: "2D" | "3D" | "TABLE";
            pins: {
                /** Format: uuid */
                id: string;
                x: number;
                y: number;
                z: number;
            }[];
        };
        RedactionPlan: {
            /** Format: uuid */
            id: string;
            case_revision: number;
            reason: string;
            remove_record_ids: string[];
            regions: {
                /** Format: uuid */
                evidence_id: string;
                locator: components["schemas"]["Locator"];
            }[];
            reviewed: boolean;
        };
        Health: {
            /** @enum {string} */
            status: "OK" | "DEGRADED";
            schema_version: string;
            offline_mode: boolean;
        };
        SessionRequest: {
            pairing_secret: string;
            operator_label: string;
        };
        Session: {
            actor: string;
            csrf_token: string;
            /** Format: date-time */
            expires_at: string;
        };
        TemporalConstraint: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            case_id: string;
            revision: number;
            introduced_case_revision: number;
            /** Format: date-time */
            created_at: string;
            created_by: string;
            /** @constant */
            kind: "TemporalConstraint";
            /** @enum {string} */
            constraint_type: "INTERVAL" | "BEFORE";
            left: components["schemas"]["Ref"];
            right: components["schemas"]["Ref"] | null;
            window: components["schemas"]["Time"] | null;
            min_lag_seconds: number | null;
            max_lag_seconds: number | null;
            strict: boolean;
            basis_refs: components["schemas"]["Ref"][];
            review: components["schemas"]["Review"];
            rationale: string;
        } & unknown;
        ClockCorrection: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            case_id: string;
            revision: number;
            introduced_case_revision: number;
            /** Format: date-time */
            created_at: string;
            created_by: string;
            /** @constant */
            kind: "ClockCorrection";
            clock_id: string;
            raw_time_refs: components["schemas"]["Ref"][];
            offset_min_seconds: number;
            offset_max_seconds: number;
            basis_refs: components["schemas"]["Ref"][];
            review: components["schemas"]["Review"];
            rationale: string;
        };
        Note: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            case_id: string;
            revision: number;
            introduced_case_revision: number;
            /** Format: date-time */
            created_at: string;
            created_by: string;
            /** @constant */
            kind: "Note";
            text: string;
            target_refs: components["schemas"]["Ref"][];
            review: components["schemas"]["Review"];
            /** @enum {string} */
            note_type: "INVESTIGATOR_NOTE" | "SCOPE_LIMIT" | "DECISION_NOTE";
        };
        Snapshot: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            case_id: string;
            case_revision: number;
            record_refs: components["schemas"]["Ref"][];
            anchor_refs: components["schemas"]["Ref"][];
            constraint_refs: components["schemas"]["Ref"][];
            retired_hypothesis_refs: components["schemas"]["Ref"][];
            source_manifest_sha256: string;
            /** Format: date-time */
            created_at: string;
        };
        ProviderConfig: {
            /** Format: uuid */
            id: string;
            label: string;
            /** @enum {string} */
            adapter: "REPLAY" | "OLLAMA" | "OPENAI_COMPATIBLE_LOCAL" | "REMOTE_OPTIONAL";
            /** Format: uri */
            base_url: string;
            model: string;
            remote: boolean;
            enabled: boolean;
            secret_ref: string | null;
            context_tokens: number;
            max_output_tokens: number;
            timeout_seconds: number;
        };
        ProviderStatus: {
            /** Format: uuid */
            id: string;
            available: boolean;
            structured_output: boolean;
            embeddings: boolean;
            model_digest: string | null;
            message: string;
        };
        CasePolicy: {
            remote_models_enabled: boolean;
            approved_provider_ids: string[];
            export_names_in_filenames: boolean;
        };
        IngestSummary: {
            /** @constant */
            result_type: "INGEST";
            evidence_refs: components["schemas"]["Ref"][];
            derivative_refs: components["schemas"]["Ref"][];
            proposal_ids: string[];
            warnings: string[];
        };
        ExportArtifact: {
            /** @constant */
            result_type: "EXPORT";
            /** Format: uuid */
            export_id: string;
            sha256: string;
            bytes: number;
            case_revision: number;
            /** Format: date-time */
            expires_at: string;
        };
        VerificationResult: {
            /** @enum {string} */
            result_type: "VERIFY" | "REINDEX" | "IMPORT";
            case_revision: number;
            checked_count: number;
            failures: string[];
            warnings: string[];
        };
        JobEvent: {
            event_id: number;
            /** Format: uuid */
            job_id: string;
            /** Format: date-time */
            at: string;
            /** @enum {string} */
            state: "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELLED";
            phase: string;
            fraction: number | null;
        };
        RunResult: components["schemas"]["AhaResult"] | components["schemas"]["ExtractionResult"] | components["schemas"]["LensPlan"] | components["schemas"]["IngestSummary"] | components["schemas"]["ExportArtifact"] | components["schemas"]["VerificationResult"];
        ModelScenarioProposal: {
            title: string;
            summary: string;
            /** @enum {string} */
            family: "MINIMAL_ASSUMPTIONS" | "SOFT_TIME_ERROR" | "INTERPRETATION_ERROR" | "UNKNOWN_ACTOR" | "INDEPENDENT_EVENTS" | "OPPORTUNISTIC" | "ALTERNATE_ORDER" | "CONVENTIONAL" | "ADVERSARIAL" | "WILDCARD";
            signature: components["schemas"]["Signature"];
            anchor_refs: components["schemas"]["Ref"][];
            steps: components["schemas"]["ScenarioStep"][];
            counter_refs: components["schemas"]["Ref"][];
            candidate_key: string;
            question_keys: string[];
        };
        ModelQuestionProposal: {
            text: string;
            outcomes: {
                observation: string;
                supports_scenario_keys: string[];
                weakens_scenario_keys: string[];
            }[];
            source_to_check: string;
            limitations: string[];
            /** @enum {string} */
            effort: "UNKNOWN" | "LOW" | "MEDIUM" | "HIGH";
            question_key: string;
            scenario_keys: string[];
        };
        ModelAhaOutput: {
            scenarios: components["schemas"]["ModelScenarioProposal"][];
            questions: components["schemas"]["ModelQuestionProposal"][];
            partial_reason: string | null;
        };
        ModelEntityProposal: {
            /** @constant */
            kind: "Entity";
            label: string;
            /** @enum {string} */
            entity_type: "PERSON" | "ORGANIZATION" | "PLACE" | "OBJECT" | "VEHICLE" | "DEVICE" | "UNKNOWN_ACTOR";
            aliases: string[];
            source_refs: components["schemas"]["Ref"][];
            /** Format: uuid */
            proposed_id: string;
        };
        ModelObservationProposal: {
            /** @constant */
            kind: "Observation";
            citations: components["schemas"]["Citation"][];
            support_refs: components["schemas"]["Ref"][];
            counter_refs: components["schemas"]["Ref"][];
            rationale: string;
            statement: string;
            subject_refs: components["schemas"]["Ref"][];
            predicate: string;
            object_value: string;
            occurrence: components["schemas"]["Time"];
            discovered_at: string | null;
            recorded_at: string | null;
            provenance_group: string;
            /** @enum {string} */
            independence: "UNKNOWN" | "SHARED" | "REVIEWED_INDEPENDENT";
            suggested_tier: components["schemas"]["Tier"];
            /** Format: uuid */
            proposed_id: string;
        };
        ModelEventProposal: {
            /** @constant */
            kind: "Event";
            citations: components["schemas"]["Citation"][];
            support_refs: components["schemas"]["Ref"][];
            counter_refs: components["schemas"]["Ref"][];
            rationale: string;
            label: string;
            occurrence: components["schemas"]["Time"];
            participant_refs: components["schemas"]["Ref"][];
            observation_refs: components["schemas"]["Ref"][];
            suggested_tier: components["schemas"]["Tier"];
            /** Format: uuid */
            proposed_id: string;
        };
        ModelInterpretationProposal: {
            /** @constant */
            kind: "Interpretation";
            citations: components["schemas"]["Citation"][];
            support_refs: components["schemas"]["Ref"][];
            counter_refs: components["schemas"]["Ref"][];
            rationale: string;
            statement: string;
            assumptions: string[];
            premise_refs: components["schemas"]["Ref"][];
            suggested_tier: components["schemas"]["Tier"];
            /** Format: uuid */
            proposed_id: string;
        };
        ModelEdgeProposal: {
            /** @constant */
            kind: "Edge";
            citations: components["schemas"]["Citation"][];
            support_refs: components["schemas"]["Ref"][];
            counter_refs: components["schemas"]["Ref"][];
            rationale: string;
            from_ref: components["schemas"]["Ref"];
            to_ref: components["schemas"]["Ref"];
            /** @enum {string} */
            relation: "MENTIONS" | "LOCATED_AT" | "PARTICIPATED_IN" | "SUPPORTS" | "CONTRADICTS" | "PRECEDES" | "REFERS_TO" | "SAME_IDENTIFIER";
            /** @enum {string} */
            independence: "UNKNOWN" | "SHARED" | "REVIEWED_INDEPENDENT";
            suggested_tier: components["schemas"]["Tier"];
            /** Format: uuid */
            proposed_id: string;
        };
        ModelExtractionOutput: {
            proposals: (components["schemas"]["ModelEntityProposal"] | components["schemas"]["ModelObservationProposal"] | components["schemas"]["ModelEventProposal"] | components["schemas"]["ModelInterpretationProposal"] | components["schemas"]["ModelEdgeProposal"])[];
            warnings: string[];
        };
        ModelContradictionProposal: {
            proposition_refs: components["schemas"]["Ref"][];
            rule: string;
            rule_version: string;
            /** @enum {string} */
            strength: "POTENTIAL" | "LOGICAL";
            qualifications: string[];
            resolution_targets: string[];
        };
        ModelContradictionOutput: {
            proposals: components["schemas"]["ModelContradictionProposal"][];
            warnings: string[];
        };
        HumanEntityDraft: {
            /** @constant */
            kind: "Entity";
            label: string;
            /** @enum {string} */
            entity_type: "PERSON" | "ORGANIZATION" | "PLACE" | "OBJECT" | "VEHICLE" | "DEVICE" | "UNKNOWN_ACTOR";
            aliases: string[];
            source_refs: components["schemas"]["Ref"][];
        };
        HumanObservationDraft: {
            /** @constant */
            kind: "Observation";
            tier: components["schemas"]["Tier"];
            citations: components["schemas"]["Citation"][];
            support_refs: components["schemas"]["Ref"][];
            counter_refs: components["schemas"]["Ref"][];
            rationale: string;
            statement: string;
            subject_refs: components["schemas"]["Ref"][];
            predicate: string;
            object_value: string;
            occurrence: components["schemas"]["Time"];
            discovered_at: string | null;
            recorded_at: string | null;
            provenance_group: string;
            /** @enum {string} */
            independence: "UNKNOWN" | "SHARED" | "REVIEWED_INDEPENDENT";
        };
        HumanInterpretationDraft: {
            /** @constant */
            kind: "Interpretation";
            tier: components["schemas"]["Tier"];
            citations: components["schemas"]["Citation"][];
            support_refs: components["schemas"]["Ref"][];
            counter_refs: components["schemas"]["Ref"][];
            rationale: string;
            statement: string;
            assumptions: string[];
            premise_refs: components["schemas"]["Ref"][];
        };
        HumanEventDraft: {
            /** @constant */
            kind: "Event";
            tier: components["schemas"]["Tier"];
            citations: components["schemas"]["Citation"][];
            support_refs: components["schemas"]["Ref"][];
            counter_refs: components["schemas"]["Ref"][];
            rationale: string;
            label: string;
            occurrence: components["schemas"]["Time"];
            participant_refs: components["schemas"]["Ref"][];
            observation_refs: components["schemas"]["Ref"][];
        };
        HumanEdgeDraft: {
            /** @constant */
            kind: "Edge";
            tier: components["schemas"]["Tier"];
            citations: components["schemas"]["Citation"][];
            support_refs: components["schemas"]["Ref"][];
            counter_refs: components["schemas"]["Ref"][];
            rationale: string;
            from_ref: components["schemas"]["Ref"];
            to_ref: components["schemas"]["Ref"];
            /** @enum {string} */
            relation: "MENTIONS" | "LOCATED_AT" | "PARTICIPATED_IN" | "SUPPORTS" | "CONTRADICTS" | "PRECEDES" | "REFERS_TO" | "SAME_IDENTIFIER";
            /** @enum {string} */
            independence: "UNKNOWN" | "SHARED" | "REVIEWED_INDEPENDENT";
        };
        HumanHypothesisDraft: {
            /** @constant */
            kind: "Hypothesis";
            tier: components["schemas"]["Tier"];
            citations: components["schemas"]["Citation"][];
            support_refs: components["schemas"]["Ref"][];
            counter_refs: components["schemas"]["Ref"][];
            rationale: string;
            claim: string;
            family_key: string;
            strengthen_if: string[];
            weaken_if: string[];
            retire_if: string[];
            /** @enum {string} */
            falsifiability: "TESTABLE" | "NOT_CURRENTLY_FALSIFIABLE";
        };
        HumanNoteDraft: {
            /** @constant */
            kind: "Note";
            text: string;
            target_refs: components["schemas"]["Ref"][];
            /** @enum {string} */
            note_type: "INVESTIGATOR_NOTE" | "SCOPE_LIMIT" | "DECISION_NOTE";
        };
        HumanTemporalConstraintDraft: {
            /** @constant */
            kind: "TemporalConstraint";
            /** @enum {string} */
            constraint_type: "INTERVAL" | "BEFORE";
            left: components["schemas"]["Ref"];
            right: components["schemas"]["Ref"] | null;
            window: components["schemas"]["Time"] | null;
            min_lag_seconds: number | null;
            max_lag_seconds: number | null;
            strict: boolean;
            basis_refs: components["schemas"]["Ref"][];
            rationale: string;
        };
        HumanClockCorrectionDraft: {
            /** @constant */
            kind: "ClockCorrection";
            clock_id: string;
            raw_time_refs: components["schemas"]["Ref"][];
            offset_min_seconds: number;
            offset_max_seconds: number;
            basis_refs: components["schemas"]["Ref"][];
            rationale: string;
        };
        HumanEntityMergeDraft: {
            /** @constant */
            kind: "EntityMerge";
            entity_refs: components["schemas"]["Ref"][];
            canonical_ref: components["schemas"]["Ref"];
            reason: string;
            active: boolean;
        };
        HumanRecordDraft: components["schemas"]["HumanEntityDraft"] | components["schemas"]["HumanObservationDraft"] | components["schemas"]["HumanInterpretationDraft"] | components["schemas"]["HumanEventDraft"] | components["schemas"]["HumanEdgeDraft"] | components["schemas"]["HumanHypothesisDraft"] | components["schemas"]["HumanNoteDraft"] | components["schemas"]["HumanTemporalConstraintDraft"] | components["schemas"]["HumanClockCorrectionDraft"] | components["schemas"]["HumanEntityMergeDraft"];
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    health: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Health"];
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    pairSession: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SessionRequest"];
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Session"];
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    logout: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listProviders: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProviderConfig"][];
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    configureProvider: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProviderConfig"];
            };
        };
        responses: {
            /** @description Success */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProviderConfig"];
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    providerHealth: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                provider_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProviderStatus"];
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listCases: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CasePage"];
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createCase: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateCase"];
            };
        };
        responses: {
            /** @description Success */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Case"];
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    importCase: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    bundle: string;
                };
            };
        };
        responses: {
            /** @description Success */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Job"];
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getCase: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                case_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Case"];
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getCasePolicy: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                case_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CasePolicy"];
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    updateCasePolicy: {
        parameters: {
            query?: never;
            header: {
                /** @description Quoted aggregate case revision. */
                "If-Match": string;
                "Idempotency-Key": string;
                "X-CSRF-Token": string;
            };
            path: {
                case_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CasePolicy"];
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CasePolicy"];
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listRecords: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
                kind?: "Evidence" | "Derivative" | "Entity" | "Observation" | "Interpretation" | "Event" | "Edge" | "Contradiction" | "Hypothesis" | "Question" | "Scenario" | "ModelRun" | "ReviewAction" | "CustodyEvent" | "SceneObject" | "Anchor" | "EntityMerge" | "TemporalConstraint" | "ClockCorrection" | "Note";
            };
            header?: never;
            path: {
                case_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page"];
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getRecord: {
        parameters: {
            query?: {
                revision?: number;
            };
            header?: never;
            path: {
                case_id: string;
                record_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Record"];
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    submitCommand: {
        parameters: {
            query?: never;
            header: {
                /** @description Quoted aggregate case revision. */
                "If-Match": string;
                "Idempotency-Key": string;
                "X-CSRF-Token": string;
            };
            path: {
                case_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Command"];
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommandResult"];
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listProposals: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header?: never;
            path: {
                case_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items: components["schemas"]["Proposal"][];
                        next_cursor: string | null;
                    };
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    ingestFiles: {
        parameters: {
            query?: never;
            header: {
                /** @description Quoted aggregate case revision. */
                "If-Match": string;
                "Idempotency-Key": string;
                "X-CSRF-Token": string;
            };
            path: {
                case_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    file: string;
                    source_note: string;
                };
            };
        };
        responses: {
            /** @description Success */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Job"];
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    downloadOriginal: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                case_id: string;
                record_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/octet-stream": string;
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    downloadDerivative: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                case_id: string;
                record_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/octet-stream": string;
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getGraph: {
        parameters: {
            query?: {
                focus_id?: string;
                hops?: number;
            };
            header?: never;
            path: {
                case_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GraphResult"];
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getTimeline: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
                start?: string;
                end?: string;
                time_basis?: "occurrence" | "discovered" | "recorded";
            };
            header?: never;
            path: {
                case_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page"];
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    searchCase: {
        parameters: {
            query: {
                cursor?: string;
                limit?: number;
                q: string;
            };
            header?: never;
            path: {
                case_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page"];
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    compileLens: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path: {
                case_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["QueryRequest"];
            };
        };
        responses: {
            /** @description Success */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Job"];
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    executeLens: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path: {
                case_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LensPlan"];
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LensResult"];
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    suggestLens: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path: {
                case_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["QueryRequest"];
            };
        };
        responses: {
            /** @description Success */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Job"];
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    saveView: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
            };
            path: {
                case_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SavedView"];
            };
        };
        responses: {
            /** @description Success */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SavedView"];
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getView: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                case_id: string;
                view_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SavedView"];
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    runAha: {
        parameters: {
            query?: never;
            header: {
                /** @description Quoted aggregate case revision. */
                "If-Match": string;
                "Idempotency-Key": string;
                "X-CSRF-Token": string;
            };
            path: {
                case_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AhaRequest"];
            };
        };
        responses: {
            /** @description Success */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Job"];
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAhaResult: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                case_id: string;
                run_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AhaResult"];
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    scanContradictions: {
        parameters: {
            query?: never;
            header: {
                /** @description Quoted aggregate case revision. */
                "If-Match": string;
                "Idempotency-Key": string;
                "X-CSRF-Token": string;
            };
            path: {
                case_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Job"];
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    saveRedactionPlan: {
        parameters: {
            query?: never;
            header: {
                /** @description Quoted aggregate case revision. */
                "If-Match": string;
                "Idempotency-Key": string;
                "X-CSRF-Token": string;
            };
            path: {
                case_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RedactionPlan"];
            };
        };
        responses: {
            /** @description Success */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RedactionPlan"];
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    exportCase: {
        parameters: {
            query?: never;
            header: {
                /** @description Quoted aggregate case revision. */
                "If-Match": string;
                "Idempotency-Key": string;
                "X-CSRF-Token": string;
            };
            path: {
                case_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ExportRequest"];
            };
        };
        responses: {
            /** @description Success */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Job"];
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    downloadExport: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                case_id: string;
                export_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/octet-stream": string;
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    backupCase: {
        parameters: {
            query?: never;
            header: {
                /** @description Quoted aggregate case revision. */
                "If-Match": string;
                "Idempotency-Key": string;
                "X-CSRF-Token": string;
            };
            path: {
                case_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Job"];
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    verifyIntegrity: {
        parameters: {
            query?: never;
            header: {
                /** @description Quoted aggregate case revision. */
                "If-Match": string;
                "Idempotency-Key": string;
                "X-CSRF-Token": string;
            };
            path: {
                case_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Job"];
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    rebuildIndexes: {
        parameters: {
            query?: never;
            header: {
                /** @description Quoted aggregate case revision. */
                "If-Match": string;
                "Idempotency-Key": string;
                "X-CSRF-Token": string;
            };
            path: {
                case_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Job"];
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getJob: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                case_id: string;
                job_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Job"];
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getValidatedJobResult: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                case_id: string;
                job_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RunResult"];
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    jobEvents: {
        parameters: {
            query?: never;
            header?: {
                "Last-Event-ID"?: string;
            };
            path: {
                case_id: string;
                job_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/event-stream": string;
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    cancelJob: {
        parameters: {
            query?: never;
            header: {
                /** @description Quoted aggregate case revision. */
                "If-Match": string;
                "Idempotency-Key": string;
                "X-CSRF-Token": string;
            };
            path: {
                case_id: string;
                job_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Job"];
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    ingestMailEnvelope: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ImportEnvelope"];
            };
        };
        responses: {
            /** @description Success */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Job"];
                };
            };
            /** @description Structured error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
}
