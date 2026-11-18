import assert from "node:assert/strict";
import test from "node:test";
import { evaluateProductionAudit } from "./check-production-audit.mjs";

const picomatchFinding = {
  severity: "high",
  via: [
    {
      url: "https://github.com/advisories/GHSA-fc5q-39xc-vjpf",
      range: "<=4.0.7",
    },
  ],
  nodes: [
    "node_modules/@parcel/watcher/node_modules/picomatch",
  ],
};

const report = (vulnerabilities) => ({
  metadata: { vulnerabilities: { high: Object.keys(vulnerabilities).length } },
  vulnerabilities,
});

test("allows only the known Picomatch finding and its Parcel watcher parent", () => {
  const result = evaluateProductionAudit(
    report({
      "@parcel/watcher": {
        severity: "high",
        via: ["picomatch"],
        nodes: ["node_modules/@parcel/watcher"],
      },
      picomatch: picomatchFinding,
    })
  );

  assert.deepEqual(result.allowed, ["@parcel/watcher", "picomatch"]);
  assert.deepEqual(result.blocking, []);
});

test("continues blocking unrelated high and critical findings", () => {
  const result = evaluateProductionAudit(
    report({
      "@parcel/watcher": {
        severity: "high",
        via: ["picomatch"],
        nodes: ["node_modules/@parcel/watcher"],
      },
      picomatch: picomatchFinding,
      anotherPackage: {
        severity: "critical",
        via: ["another-advisory"],
        nodes: ["node_modules/anotherPackage"],
      },
    })
  );

  assert.deepEqual(result.allowed, ["@parcel/watcher", "picomatch"]);
  assert.deepEqual(
    result.blocking.map((finding) => finding.name),
    ["anotherPackage"]
  );
});

test("does not allow the same Picomatch advisory outside Parcel watcher", () => {
  const result = evaluateProductionAudit(
    report({
      picomatch: {
        ...picomatchFinding,
        nodes: ["node_modules/anotherPackage/node_modules/picomatch"],
      },
    })
  );

  assert.deepEqual(result.allowed, []);
  assert.deepEqual(result.blocking.map((finding) => finding.name), [
    "picomatch",
  ]);
});

test("fails closed when npm audit does not return a valid report", () => {
  assert.throws(
    () => evaluateProductionAudit({ error: { code: "EAI_AGAIN" } }),
    /valid vulnerability report/
  );
});
