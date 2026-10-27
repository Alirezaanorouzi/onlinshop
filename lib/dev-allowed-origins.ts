import os from "node:os";

/** Hosts allowed to load Next.js dev HMR (e.g. phone on same Wi‑Fi). */
export function getAllowedDevOrigins(): string[] {
  const hosts = new Set(["127.0.0.1", "localhost"]);

  for (const part of process.env.ALLOWED_DEV_ORIGINS?.split(",") ?? []) {
    const host = part.trim();
    if (host) hosts.add(host);
  }

  if (process.env.NODE_ENV === "production") {
    return [...hosts];
  }

  for (const iface of Object.values(os.networkInterfaces())) {
    for (const net of iface ?? []) {
      if (!net.internal && net.address.includes(".")) {
        hosts.add(net.address);
      }
    }
  }

  return [...hosts];
}
