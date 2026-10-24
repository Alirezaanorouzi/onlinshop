import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const apiDir = path.join("app", "api");
const backupDir = path.join(".static-export", "api");

function movePath(from, to) {
  fs.rmSync(to, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(to), { recursive: true });
  try {
    fs.renameSync(from, to);
  } catch {
    fs.cpSync(from, to, { recursive: true });
    fs.rmSync(from, { recursive: true, force: true });
  }
}

function moveApiAside() {
  if (!fs.existsSync(apiDir)) return;
  movePath(apiDir, backupDir);
}

function restoreApi() {
  if (!fs.existsSync(backupDir)) return;
  movePath(backupDir, apiDir);
}

moveApiAside();
const result = spawnSync("npm", ["run", "build"], {
  stdio: "inherit",
  env: { ...process.env, GITHUB_PAGES: "true" },
  shell: true,
});
restoreApi();
process.exit(result.status ?? 1);
