import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { CaseExplorer } from "../../../packages/workbench/CaseExplorer";
import type { CaseRecord } from "../../../packages/workbench/model";
import fixture from "../../../packages/fixtures/demo/case.json";
import "./style.css";
const raw = import.meta.glob(
  "../../../packages/fixtures/demo/originals/*.txt",
  { query: "?raw", import: "default", eager: true },
) as Record<string, string>;
const sourceTexts = Object.fromEntries(
  Object.entries(raw).map(([path, text]) => [path.split("/").pop()!, text]),
);
const repo = "https://github.com/bohselecta/aha";
function App() {
  const [demo, setDemo] = useState(location.hash === "#demo");
  useEffect(() => {
    const onHash = () => {
      setDemo(location.hash === "#demo");
      window.scrollTo(0, 0);
    };
    addEventListener("hashchange", onHash);
    return () => removeEventListener("hashchange", onHash);
  }, []);
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header>
        <a className="brand" href="#home" aria-label="Aha home">
          <img src="/brand/aha-logo.png" alt="" width="58" height="58" />
          <span>
            Aha!<small>OPEN INVESTIGATIONS</small>
          </span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#demo">Open sample case</a>
          <a href={repo + "#run-the-development-container"}>Get Aha!</a>
          <a href={repo}>GitHub ↗</a>
        </nav>
      </header>
      {demo ? (
        <main id="main" className="demo-page">
          <div className="demo-page-heading">
            <a href="#home">← Back to Aha!</a>
            <span>Sample case · Fictional people and events · Read only</span>
          </div>
          <CaseExplorer
            records={fixture.records as CaseRecord[]}
            caseTitle="The Lantern Annex"
            headingLevel={1}
            caseRevision={fixture.case.case_revision}
            sourceTexts={sourceTexts}
          />
        </main>
      ) : (
        <main id="main">
          <section className="hero">
            <div>
              <p className="eyebrow">PEOPLE FIND ANSWERS.</p>
              <h1>
                A fresh perspective.
                <br />A clearer case.
              </h1>
              <p className="lead">
                Bring the details together. Follow a statement to its source,
                compare accounts, and find the next question worth asking.
              </p>
              <div className="actions">
                <a className="button" href="#demo">
                  Open sample case <span>↗</span>
                </a>
                <a href={repo + "#run-the-development-container"}>Get Aha! →</a>
              </div>
              <p className="quiet">
                Open source · Free to use · Casework stays on your computer
              </p>
            </div>
            <div className="mascot">
              <img
                src="/brand/aha-logo.png"
                alt="Aha! A curious corgi with a magnifying glass. People find answers."
                width="1280"
                height="1280"
              />
            </div>
          </section>
          <div className="principles">
            <p>
              <b>Keep the source close</b>Inspect the passage behind a
              statement.
            </p>
            <p>
              <b>See what connects</b>Explore records without losing their
              context.
            </p>
            <p>
              <b>Make room for another idea</b>Keep questions and uncertainty in
              view.
            </p>
          </div>
          <section className="product-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">A PLACE TO THINK IT THROUGH</p>
                <h2>
                  Less searching through files.
                  <br />
                  More following the evidence.
                </h2>
              </div>
              <p>
                Start with a source. Follow the account. Check the connection.
                Aha! keeps the material and the reasoning side by side.
              </p>
            </div>
            <div className="product-grid">
              <article>
                <span>01 / CASE ATLAS</span>
                <h3>See the case in context.</h3>
                <p>
                  Move between a connection map and a clear record table. Search
                  a detail, inspect a relationship, and follow its source.
                </p>
              </article>
              <article>
                <span>02 / TIMELINE</span>
                <h3>Give every account its time.</h3>
                <p>
                  Compare recorded times while keeping estimates, unknowns, and
                  the source’s own wording visible.
                </p>
              </article>
              <article>
                <span>03 / QUESTIONS & CONFLICTS</span>
                <h3>Find what needs checking.</h3>
                <p>
                  Review conflicting accounts, compare possible explanations,
                  and inspect evidence that could change your view.
                </p>
              </article>
            </div>
          </section>
          <section className="case-invite">
            <div>
              <p className="eyebrow">TRY AHA! IN YOUR BROWSER</p>
              <h2>The Lantern Annex</h2>
              <p>
                A missing records crate. Two accounts of a red vehicle. A camera
                clock worth checking. Explore the sources and decide what you
                would ask next.
              </p>
              <a className="button" href="#demo">
                Open sample case ↗
              </a>
              <p className="quiet">
                Fictional training material. No sign-in required.
              </p>
            </div>
            <div className="sample-note">
              <span>QUESTION WORTH CHECKING</span>
              <h3>Do the two accounts describe the same vehicle?</h3>
              <p>
                Color alone cannot establish identity. The original images and
                identification notes may help distinguish the possibilities.
              </p>
              <a href="#demo">Follow the question →</a>
            </div>
          </section>
          <section className="local" id="local">
            <div>
              <p className="eyebrow">YOUR MATERIAL. YOUR WORKSPACE.</p>
              <h2>Keep casework close.</h2>
              <p>
                Aha! runs on your computer. Preserve original files, review
                statements, and keep a portable copy of your work.
              </p>
              <a
                className="button"
                href={repo + "#run-the-development-container"}
              >
                Set up your workspace ↗
              </a>
            </div>
            <div className="getting-started">
              <h3>Start with the sample case.</h3>
              <ol>
                <li>Explore the sources and recorded connections.</li>
                <li>Compare the timeline and conflicting accounts.</li>
                <li>
                  Follow a question to see what would support or weaken an idea.
                </li>
              </ol>
              <p className="quiet">
                Local download: evaluation version. Use sample material while
                assessing it for your work.{" "}
                <a href={repo + "/blob/main/IMPLEMENTATION_STATUS.md"}>
                  Version details
                </a>
              </p>
            </div>
          </section>
        </main>
      )}
      <footer>
        <b>
          Aha! <span>People find answers.</span>
        </b>
        <div>
          <a href={repo}>Source code</a>
          <a href={repo + "/blob/main/LICENSE"}>License</a>
          <a href={repo + "/blob/main/SECURITY.md"}>Security</a>
        </div>
        <p>
          © 2026 Aha! contributors · Apache-2.0 · No analytics or evidence
          uploads on this site.
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
