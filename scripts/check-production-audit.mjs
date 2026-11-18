import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const PICOMATCH_ADVISORY =
  "https://github.com/advisories/GHSA-fc5q-39xc-vjpf";

export function evaluateProductionAudit(report) {
  if (
    !report ||
    report.error ||
    !report.metadata?.vulnerabilities ||
    typeof report.metadata.vulnerabilities !== "object" ||
    !report.vulnerabilities ||
    typeof report.vulnerabilities !== "object" ||
    Array.isArray(report.vulnerabilities)
  ) {
    throw new Error("npm audit did not return a valid vulnerability report.");
  }

  const picomatch = report.vulnerabilities.picomatch;
  const isKnownPicomatchFinding =
    picomatch?.severity === "high" &&
    Array.isArray(picomatch.via) &&
    picomatch.via.length === 1 &&
    picomatch.via[0]?.url === PICOMATCH_ADVISORY &&
    picomatch.via[0]?.range === "<=4.0.7" &&
    Array.isArray(picomatch.nodes) &&
    picomatch.nodes.length > 0 &&
    picomatch.nodes.every((node) =>
      node.includes("/@parcel/watcher/node_modules/picomatch")
    );

  const findings = Object.entries(report.vulnerabilities).filter(
    ([, vulnerability]) =>
      vulnerability.severity === "high" ||
      vulnerability.severity === "critical"
  );
  const allowed = [];
  const blocking = [];

  for (const [name, vulnerability] of findings) {
    const isKnownWatcherParent =
      name === "@parcel/watcher" &&
      vulnerability.severity === "high" &&
      isKnownPicomatchFinding &&
      Array.isArray(vulnerability.via) &&
      vulnerability.via.length === 1 &&
      vulnerability.via[0] === "picomatch" &&
      Array.isArray(vulnerability.nodes) &&
      vulnerability.nodes.length > 0 &&
      vulnerability.nodes.every((node) =>
        node.endsWith("/@parcel/watcher")
      );

    if (
      (name === "picomatch" && isKnownPicomatchFinding) ||
      isKnownWatcherParent
    ) {
      allowed.push(name);
    } else {
      blocking.push({
        name,
        severity: vulnerability.severity,
        range: vulnerability.range,
        via: vulnerability.via,
      });
    }
  }

  return { allowed, blocking };
}

function readReport(reportPath) {
  const contents = readFileSync(resolve(reportPath));
  let text;
  if (contents[0] === 0xff && contents[1] === 0xfe) {
    text = contents.subarray(2).toString("utf16le");
  } else if (contents[0] === 0xfe && contents[1] === 0xff) {
    text = Buffer.from(contents.subarray(2)).swap16().toString("utf16le");
  } else {
    text = contents.toString("utf8").replace(/^\uFEFF/, "");
  }
  return JSON.parse(text);
}

function main() {
  const reportPath = process.argv[2];
  const npmExitCode = Number(process.argv[3]);
  if (!reportPath || !Number.isInteger(npmExitCode)) {
    throw new Error(
      "Usage: node check-production-audit.mjs <report.json> <npm-exit-code>"
    );
  }
  if (npmExitCode !== 0 && npmExitCode !== 1) {
    throw new Error(`npm audit failed unexpectedly with exit code ${npmExitCode}.`);
  }

  const report = readReport(reportPath);
  const { allowed, blocking } = evaluateProductionAudit(report);

  if (blocking.length > 0) {
    console.error("::error::Unapproved high/critical production vulnerabilities:");
    console.error(JSON.stringify(blocking, null, 2));
    process.exitCode = 1;
    return;
  }

  if (allowed.length > 0) {
    if (npmExitCode !== 1) {
      throw new Error("npm audit reported high findings with a success exit code.");
    }
    console.warn(
      `::warning::Temporarily allowing ${PICOMATCH_ADVISORY} via @parcel/watcher; remove this exception once Picomatch is patched.`
    );
  }

  if (npmExitCode === 1 && allowed.length === 0) {
    throw new Error("npm audit exited non-zero without an approved finding.");
  }

  console.log("Production dependency audit passed.");
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  try {
    main();
  } catch (error) {
    console.error(`::error::${error.message}`);
    process.exitCode = 1;
  }
}
