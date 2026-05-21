const { rmSync } = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

function cleanNextDir() {
  const nextDir = path.join(process.cwd(), ".next");
  try {
    rmSync(nextDir, { recursive: true, force: true });
    console.log("[build-reset] .next cleaned");
  } catch (error) {
    console.warn("[build-reset] .next cleanup skipped:", error?.message || error);
  }
}

function runBuild() {
  const nextBin = require.resolve("next/dist/bin/next");
  const result = spawnSync(process.execPath, [nextBin, "build"], {
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_OPTIONS: process.env.NODE_OPTIONS || "--dns-result-order=ipv4first",
    },
  });

  process.exit(result.status ?? 1);
}

cleanNextDir();
runBuild();
