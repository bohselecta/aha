import type {
  Case,
  Command,
  CommandResult,
  Page,
  Proposal,
  Record as CaseRecord,
  Session,
} from "../../../packages/contracts/contracts";
export type { Case, CaseRecord, Proposal };
let csrf = "";
// Only unresolved operations remain here. Case text stays in memory, never browser storage.
const pendingOperations = new Map<string, { key: string; revision?: number }>();
function operationIdentity(path: string, method: string, body: unknown) {
  const content =
    body instanceof FormData
      ? [...body.entries()].map(([k, v]) => {
          if (v instanceof File) {
            // The server binds this key to the actual byte hash, rejecting changed content.
            return [k, v.name, v.type, v.size, v.lastModified];
          }
          return [k, v];
        })
      : body;
  return JSON.stringify([path, method, content]);
}
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
export async function request<T>(
  path: string,
  method = "GET",
  body?: unknown,
  revision?: number,
): Promise<T> {
  const headers: Record<string, string> = {};
  const identity = operationIdentity(path, method, body);
  if (method !== "GET") {
    const operation = pendingOperations.get(identity) ?? {
      key: crypto.randomUUID(),
      revision,
    };
    pendingOperations.set(identity, operation);
    headers["X-CSRF-Token"] = csrf;
    headers["Idempotency-Key"] = operation.key;
    if (operation.revision !== undefined)
      headers["If-Match"] = `"${operation.revision}"`;
  }
  if (body && !(body instanceof FormData))
    headers["Content-Type"] = "application/json";
  const response = await fetch(`/api/v1${path}`, {
    method,
    headers,
    body:
      body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    // An explicit client rejection is definite; network/5xx outcomes retain the key.
    if (response.status < 500) pendingOperations.delete(identity);
    const error = await response.json().catch(() => ({
      code: "REQUEST_FAILED",
      message: "The service could not complete this request. Please retry.",
    }));
    throw new ApiError(error.code, error.message);
  }
  const result =
    response.status === 204 ? (undefined as T) : await response.json();
  pendingOperations.delete(identity);
  return result;
}
export async function resumeSession() {
  const session = await request<Session>("/session");
  csrf = session.csrf_token;
  return session;
}
export async function pair(secret: string, operator: string) {
  const session = await request<Session>("/session", "POST", {
    pairing_secret: secret,
    operator_label: operator,
  });
  csrf = session.csrf_token;
  return session;
}
export async function logout() {
  await request("/session", "DELETE");
  csrf = "";
  pendingOperations.clear();
}
export async function loadRecords(caseId: string) {
  let items: CaseRecord[] = [];
  let cursor: string | null = null;
  do {
    const page: Page = await request(
      `/cases/${caseId}/records?limit=200${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`,
    );
    items.push(...page.items);
    cursor = page.next_cursor;
  } while (cursor);
  return items;
}
export async function loadProposals(caseId: string) {
  let items: Proposal[] = [];
  let cursor: string | null = null;
  do {
    const page: { items: Proposal[]; next_cursor: string | null } =
      await request(
        `/cases/${caseId}/proposals?limit=200${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`,
      );
    items.push(...page.items);
    cursor = page.next_cursor;
  } while (cursor);
  return items;
}
export function command(c: Case, body: Command) {
  return request<CommandResult>(
    `/cases/${c.id}/commands`,
    "POST",
    body,
    c.case_revision,
  );
}
export function label(r: CaseRecord): string {
  if ("label" in r) return r.label;
  if ("statement" in r) return r.statement;
  if ("claim" in r) return r.claim;
  if ("text" in r) return r.text;
  if ("original_filename" in r) return r.original_filename;
  if ("question" in r && typeof r.question === "string") return r.question;
  return `${r.kind} · ${r.id.slice(-6)}`;
}

export async function loadReferenceVersions(caseId: string) {
  const items: CaseRecord[] = [];
  let cursor: string | null = null;
  do {
    const page: Page = await request(
      `/cases/${caseId}/references?limit=200${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`,
    );
    items.push(...page.items);
    cursor = page.next_cursor;
  } while (cursor);
  return items;
}
