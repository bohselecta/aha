import { readFile, writeFile } from "node:fs/promises";
import { compile } from "json-schema-to-typescript";
import openapiTS, { astToString } from "openapi-typescript";
const schema = JSON.parse(
  await readFile("packages/contracts/contracts.schema.json", "utf8"),
);
await writeFile(
  "packages/contracts/contracts.d.ts",
  await compile({ ...schema, $ref: "#/$defs/CaseExchange" }, "CaseExchange", {
    unreachableDefinitions: true,
    ignoreMinAndMaxItems: true,
    bannerComment:
      "/* Generated from the authoritative specification. Do not edit. */",
  }),
);
await writeFile(
  "packages/contracts/api.d.ts",
  astToString(
    await openapiTS(
      new URL("../packages/contracts/openapi.json", import.meta.url),
    ),
  ),
);
