"""Development dependency inventory. Does not replace a legal/license audit."""

import importlib.metadata
import json
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
packages = []
notices = [
    "# Dependency metadata inventory",
    "",
    "Generated from installed Python distributions. This is not a complete redistribution notice bundle or a legal license audit. See the npm CycloneDX inventory for JavaScript dependencies.",
    "",
]
for dist in sorted(
    importlib.metadata.distributions(), key=lambda d: d.metadata["Name"].lower()
):
    name = dist.metadata["Name"]
    version = dist.version
    ident = "SPDXRef-Package-" + re.sub("[^a-zA-Z0-9.-]", "-", name)
    expression = dist.metadata.get("License-Expression") or "NOASSERTION"
    packages.append(
        {
            "SPDXID": ident,
            "name": name,
            "versionInfo": version,
            "downloadLocation": "NOASSERTION",
            "filesAnalyzed": False,
            "licenseConcluded": "NOASSERTION",
            "licenseDeclared": expression,
            "copyrightText": "NOASSERTION",
            "externalRefs": [
                {
                    "referenceCategory": "PACKAGE-MANAGER",
                    "referenceType": "purl",
                    "referenceLocator": f"pkg:pypi/{name.lower()}@{version}",
                }
            ],
        }
    )
    notices.append(
        f'- {name} {version}: {expression}; upstream {dist.metadata.get("Home-page") or "see distribution metadata"}.'
    )
document = {
    "spdxVersion": "SPDX-2.3",
    "dataLicense": "CC0-1.0",
    "SPDXID": "SPDXRef-DOCUMENT",
    "name": "AHA development Python environment",
    "documentNamespace": f"https://spdx.org/spdxdocs/aha-development-{uuid.uuid4()}",
    "creationInfo": {
        "creators": ["Tool: AHA development inventory script"],
        "created": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    },
    "packages": packages,
    "relationships": [
        {
            "spdxElementId": "SPDXRef-DOCUMENT",
            "relationshipType": "DESCRIBES",
            "relatedSpdxElement": p["SPDXID"],
        }
        for p in packages
    ],
}
(ROOT / "artifacts/python-sbom.spdx.json").write_text(
    json.dumps(document, indent=2) + "\n"
)
(ROOT / "THIRD_PARTY_NOTICES.md").write_text("\n".join(notices) + "\n")
