import { spawnSync } from "node:child_process";

const migrate = spawnSync("npm", ["run", "db:migrate"], {
  stdio: "inherit",
  shell: true,
});
if (migrate.status !== 0) {
  console.warn("db:migrate failed (continuing to start Next.js):", migrate.status);
}

const start = spawnSync("npm", ["exec", "next", "start"], {
  stdio: "inherit",
  shell: true,
});
process.exit(start.status ?? 1);
