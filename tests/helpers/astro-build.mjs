import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const distDir = path.join(root, "dist");
const stampPath = path.join(distDir, ".test-build-stamp");
const lockPath = path.join(root, "node_modules", ".cache", "astro-test-build.lock");

const BUILD_TIMEOUT_MS = 170000;
const WAIT_TIMEOUT_MS = 200000;

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function runId() {
  return String(process.ppid);
}

function stampMatches() {
  try {
    return fs.readFileSync(stampPath, "utf8") === runId();
  } catch {
    return false;
  }
}

function pidAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === "EPERM";
  }
}

function acquireLock() {
  fs.mkdirSync(path.dirname(lockPath), { recursive: true });
  const start = Date.now();
  while (true) {
    try {
      fs.writeFileSync(lockPath, String(process.pid), { flag: "wx" });
      return true;
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      if (stampMatches()) return false;
      let holder = Number.NaN;
      try {
        holder = Number(fs.readFileSync(lockPath, "utf8").trim());
      } catch (readError) {
        if (readError.code !== "ENOENT") throw readError;
      }
      if (!pidAlive(holder)) {
        try {
          fs.unlinkSync(lockPath);
        } catch (unlinkError) {
          if (unlinkError.code !== "ENOENT") throw unlinkError;
        }
        continue;
      }
      if (Date.now() - start > WAIT_TIMEOUT_MS) {
        throw new Error("timed out waiting for the shared astro build");
      }
      sleep(200);
    }
  }
}

function releaseLock() {
  try {
    if (fs.readFileSync(lockPath, "utf8").trim() !== String(process.pid)) return;
  } catch (error) {
    if (error.code === "ENOENT") return;
    throw error;
  }
  try {
    fs.unlinkSync(lockPath);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

export function ensureAstroBuild() {
  if (stampMatches()) return;
  const held = acquireLock();
  if (!held) return;
  try {
    if (stampMatches()) return;
    fs.rmSync(distDir, { recursive: true, force: true });
    try {
      execFileSync("npx", ["astro", "build"], {
        cwd: root,
        stdio: "pipe",
        timeout: BUILD_TIMEOUT_MS,
      });
    } catch (error) {
      const stdout = error.stdout?.toString?.() ?? "";
      const stderr = error.stderr?.toString?.() ?? "";
      const wrapped = new Error(`astro build failed\n${stdout}\n${stderr}`);
      wrapped.cause = error;
      throw wrapped;
    }
    fs.writeFileSync(stampPath, runId());
  } finally {
    releaseLock();
  }
}
