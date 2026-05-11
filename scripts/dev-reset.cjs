const path = require("path");
const { rmSync } = require("fs");
const { spawn } = require("child_process");
const net = require("net");
const killPort = require("kill-port");

async function freePorts() {
  const ports = [3000, 3001, 3002];
  for (const port of ports) {
    try {
      await killPort(port, "tcp");
      console.log(`Port ${port} freed`);
    } catch {
      console.log(`Port ${port} already free`);
    }
  }
}

function cleanupCache() {
  const nextCachePath = path.join(process.cwd(), ".next");

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      rmSync(nextCachePath, {
        recursive: true,
        force: true,
      });
      console.log(".next cache cleaned");
      return;
    } catch (error) {
      const code = error && error.code ? error.code : "UNKNOWN";
      if (attempt === 3) {
        if (code === "ENOTEMPTY" || code === "EPERM" || code === "EACCES") {
          console.log(`.next cache cleanup skipped (${code}), continuing with dev startup`);
          return;
        }
        throw error;
      }
    }
  }
}

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.on("error", () => resolve(false));
    server.listen({ port }, () => {
      server.close(() => resolve(true));
    });
  });
}

async function resolveDevPort() {
  const basePort = Number(process.env.DEV_PORT || process.env.PORT || 3001);

  if (!Number.isFinite(basePort) || basePort <= 0) {
    throw new Error("Invalid DEV_PORT/PORT value");
  }

  if (await isPortAvailable(basePort)) {
    return basePort;
  }

  throw new Error(
    `Requested dev port ${basePort} is unavailable. Stop the conflicting process or set DEV_PORT explicitly.`
  );
}

async function main() {
  await freePorts();
  cleanupCache();

  const nextBin = require.resolve("next/dist/bin/next");

  // Keep a stable URL in development to avoid stale browser tabs requesting old chunks.
  const port = await resolveDevPort();

  console.log(`Starting Next dev server on http://localhost:${port}`);
  console.log(`Use this exact URL in your browser: http://localhost:${port}`);

  const child = spawn(process.execPath, [nextBin, "dev", "-p", String(port)], {
    stdio: "inherit",
    env: {
      ...process.env,
      NEXT_DISABLE_WEBPACK_CACHE: "1",
    },
  });

  child.on("exit", (code) => {
    if (code !== 0) {
      console.log(`\nWARNING: Dev server crashed (exit code ${code})`);
      console.log("The selected port may be held by another process. Set DEV_PORT manually if needed, e.g. DEV_PORT=3002 npm run dev.");
    }
    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error("dev:reset failed", error);
  process.exit(1);
});

