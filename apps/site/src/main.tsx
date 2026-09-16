import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import lens from "../../../packages/fixtures/demo/lens-result.json";
import "./style.css";
const raw = import.meta.glob(
  "../../../packages/fixtures/demo/originals/*.txt",
  { query: "?raw", import: "default", eager: true },
) as Record<string, string>;
const sources = Object.entries(raw).map(([path, text]) => ({
  id: path.split("/").pop()!,
  text,
}));
const repo = "https://github.com/bohselecta/aha";
function App() {
  const [selected, setSelected] = useState("attendant.txt");
  const [query, setQuery] = useState("");
  const source = sources.find((s) => s.id === selected)!;
  const shown = sources.filter((s) =>
    (s.id + " " + s.text).toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header>
        <a className="brand" href="#">
          <img
            src="/brand/aha-logo.png"
            alt="Aha! Open Investigations"
            width="58"
            height="58"
          />
          <span>
            Aha!<small>OPEN INVESTIGATIONS</small>
          </span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#demo">Explore demo</a>
          <a href="#status">Project status</a>
          <a href={repo}>GitHub ↗</a>
        </nav>
      </header>
      <main id="main">
        <section className="hero">
          <div>
            <p className="eyebrow">CURIOUS BY NATURE. CAREFUL BY DESIGN.</p>
            <h1>
              Every answer starts
              <br />
              with a better question.
            </h1>
            <p className="lead">
              An open-source workbench for following evidence, keeping
              uncertainty visible, and finding your way back to the source.
            </p>
            <div className="actions">
              <a className="button" href="#demo">
                Explore a fictional case <span>↗</span>
              </a>
              <a href="#local">Run the local preview →</a>
            </div>
            <p className="quiet">
              Free to use · Apache-2.0 · Local application in development
            </p>
          </div>
          <div className="mascot">
            <img
              src="/brand/aha-logo.png"
              alt="A curious corgi holding a magnifying glass; Aha! People find answers"
              width="1280"
              height="1280"
            />
            <span className="sticker">
              A little curiosity.
              <br />A lot of care.
            </span>
          </div>
        </section>
        <div className="principles">
          <p>
            <b>01 / Keep the source</b>Originals stay original.
          </p>
          <p>
            <b>02 / Show your working</b>Claims need traceable citations.
          </p>
          <p>
            <b>03 / Leave room for doubt</b>Unknown is a useful answer.
          </p>
        </div>
        <section id="demo" className="demo">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE LANTERN ANNEX</p>
              <h2>
                Follow the detail.
                <br />
                Question the connection.
              </h2>
            </div>
            <p>
              A records crate is missing. A witness, a camera, and a receipt
              tell different parts of the story. What do we actually know?
            </p>
          </div>
          <div className="notice">
            <strong>Synthetic, read-only demo.</strong> All people and events
            are fictional. This public page uses bundled example files; it does
            not run the local application, a model, or accept evidence uploads.
          </div>
          <div className="workspace">
            <aside>
              <div className="panel-title">
                Source library <span>6 files</span>
              </div>
              <label htmlFor="search">Search source text</label>
              <input
                id="search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Try eggs or camera"
              />
              <ul>
                {shown.map((s) => (
                  <li key={s.id}>
                    <button
                      aria-pressed={selected === s.id}
                      onClick={() => setSelected(s.id)}
                    >
                      <span aria-hidden="true">▤</span> {s.id}
                    </button>
                  </li>
                ))}
              </ul>
              {!shown.length && <p role="status">No matching sources.</p>}
              <p className="quiet">
                Search runs in this browser. No queries are sent to a server.
              </p>
            </aside>
            <article className="source">
              <div className="panel-title">
                Original text <span>UTF-8 / synthetic</span>
              </div>
              <h3>{source.id}</h3>
              <pre data-testid="source-text">{source.text}</pre>
              <p className="source-note">
                These are the original demonstration texts supplied with the
                specification. They describe claims and limits, not findings
                about real people.
              </p>
            </article>
          </div>
          <div className="insights">
            <article>
              <span className="tag">SIMILARITY ≠ RELATIONSHIP</span>
              <h3>
                Two mentions of eggs.
                <br />
                Zero established links.
              </h3>
              <p>{lens.matches[0].why}</p>
              <div className="actions">
                {["attendant.txt", "receipt.txt"].map((id) => (
                  <button
                    className="text-button"
                    key={id}
                    onClick={() => {
                      setSelected(id);
                      document
                        .querySelector(".workspace")
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                    }}
                  >
                    Inspect {id} ↗
                  </button>
                ))}
              </div>
              <p className="quiet">
                Prerecorded Lens example · No persistent relationship created
              </p>
            </article>
            <article>
              <span className="tag amber">COUNTER-EVIDENCE MATTERS</span>
              <h3>
                An idea can be retired.
                <br />
                Its history stays visible.
              </h3>
              <p>
                An earlier maintenance note speculated about a camera clock
                running 47 minutes fast. A later calibration record constrains
                the offset to ±2 minutes, excluding that explanation.
              </p>
              <button
                className="text-button"
                onClick={() => {
                  setSelected("calibration.txt");
                  document
                    .querySelector(".workspace")
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
              >
                Inspect calibration.txt ↗
              </button>
              <p className="quiet">
                Still unknown: vehicle identity, crate location, anyone’s
                involvement.
              </p>
            </article>
          </div>
        </section>
        <section id="status" className="status">
          <div>
            <p className="eyebrow">BUILT IN THE OPEN</p>
            <h2>
              Useful foundations.
              <br />
              Honest boundaries.
            </h2>
            <p>
              The public demo is available now. The local investigative
              application is an early development preview, with application
              acceptance still in progress.
            </p>
            <a href={repo + "/blob/main/IMPLEMENTATION_STATUS.md"}>
              See every acceptance gate →
            </a>
          </div>
          <div className="status-list">
            <div>
              <span className="tag">IMPLEMENTED LOCALLY</span>
              <p>
                Original file preservation, exact TXT citations, manual
                proposals and human review, history, integrity checks, and
                portable backup/restore.
              </p>
            </div>
            <div>
              <span className="tag amber">STILL IN DEVELOPMENT</span>
              <p>
                Local model adapters, broader parsers, full reasoning and
                reporting workspaces, redaction, LAN access, and completed
                release acceptance.
              </p>
            </div>
            <p>
              <strong>For synthetic evaluation only.</strong> The local preview
              is not a completed production investigative system.
            </p>
          </div>
        </section>
        <section id="local" className="local">
          <div>
            <p className="eyebrow">YOUR CASEWORK STAYS LOCAL</p>
            <h2>Take a closer look.</h2>
            <p>
              Run the development preview on your own computer with Docker. It
              starts with the fictional case. Vercel hosts only this public
              site.
            </p>
            <a
              className="button"
              href={repo + "#run-the-development-container"}
            >
              Local setup guide ↗
            </a>
          </div>
          <div className="terminal">
            <span>LOCAL DEVELOPMENT / TERMINAL</span>
            <pre>
              {
                "git clone https://github.com/bohselecta/aha.git\ncd aha\ndocker compose up --build -d"
              }
            </pre>
            <p>
              Follow the setup guide to pair your local browser.
              <br />
              Use synthetic material while evaluating.
            </p>
          </div>
        </section>
      </main>
      <footer>
        <b>
          Aha! <span>People find answers.</span>
        </b>
        <div>
          <a href={repo}>Source code</a>
          <a href={repo + "/blob/main/LICENSE"}>Apache-2.0 license</a>
          <a href={repo + "/blob/main/SECURITY.md"}>Security</a>
        </div>
        <p>
          © 2026 bohselecta and Aha! contributors. Provided “as is”, without
          warranties, under the license terms. No analytics, accounts, or
          evidence collection on this site.
        </p>
      </footer>
    </>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
