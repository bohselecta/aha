import { useEffect, useState } from "react";
import type {
  Case,
  Citation,
  Evidence,
} from "../../../../packages/contracts/contracts";
import { request } from "../api";
type SearchResult = {
  hits: { source: Evidence; citation: Citation }[];
  has_more: boolean;
  coverage: {
    source_count: number;
    text_source_count: number;
    indexed_source_count: number;
    index_revision: number;
    case_revision: number;
  };
};
export function SourceSearch({
  active,
  inspect,
}: {
  active: Case;
  inspect: (source: Evidence) => void;
}) {
  const [query, setQuery] = useState(""),
    [submitted, setSubmitted] = useState(""),
    [page, setPage] = useState(0),
    [result, setResult] = useState<SearchResult | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [generation, setGeneration] = useState(0);
  useEffect(() => {
    let live = true;
    setBusy(true);
    setError("");
    request<SearchResult>(
      `/cases/${active.id}/source-search?q=${encodeURIComponent(submitted)}&offset=${page * 20}&limit=20`,
    )
      .then((r) => {
        if (live) setResult(r);
      })
      .catch((e) => {
        if (live) setError(e.message);
      })
      .finally(() => {
        if (live) setBusy(false);
      });
    return () => {
      live = false;
    };
  }, [active.id, submitted, page, generation]);
  return (
    <section className="panel">
      <h2>Search original source text</h2>
      <p>
        Find words in extracted material, including passages that have not yet
        been recorded as statements. All search words must occur within a
        matching passage.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setPage(0);
          setSubmitted(query.trim());
        }}
      >
        <label>
          Words to find
          <input
            type="search"
            value={query}
            maxLength={2000}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <button disabled={busy}>Search sources</button>
      </form>
      {result && (
        <p className="notice">
          {result.coverage.indexed_source_count} of{" "}
          {result.coverage.source_count} sources indexed ·{" "}
          {result.coverage.text_source_count} with extracted text. Sources
          without readable text are not searched.
        </p>
      )}
      <button
        className="secondary"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            await request(
              `/cases/${active.id}/indexes/rebuild`,
              "POST",
              {},
              active.case_revision,
            );
            setGeneration((n) => n + 1);
          } catch (e) {
            setError(
              e instanceof Error
                ? e.message
                : "Could not rebuild source search.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        Rebuild source index
      </button>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {busy && <p role="status">Searching local material…</p>}
      {!busy && submitted && result && !result.hits.length && (
        <p role="status">
          No matches in indexed material under these search words.
        </p>
      )}
      {result?.hits.map((hit, i) => (
        <article
          className="search-hit"
          key={`${hit.citation.derivative?.id}:${i}`}
        >
          <h3>{hit.source.original_filename}</h3>
          <blockquote>{hit.citation.quote}</blockquote>
          <p className="muted">
            Exact extracted passage · source version {hit.source.revision}
          </p>
          <button className="secondary" onClick={() => inspect(hit.source)}>
            Open source for review
          </button>
        </article>
      ))}
      {(page > 0 || result?.has_more) && (
        <nav className="actions" aria-label="Source result pages">
          <button
            disabled={busy || page === 0}
            onClick={() => setPage(page - 1)}
          >
            Previous results
          </button>
          <span>Page {page + 1}</span>
          <button
            disabled={busy || !result?.has_more}
            onClick={() => setPage(page + 1)}
          >
            Next results
          </button>
        </nav>
      )}
    </section>
  );
}
