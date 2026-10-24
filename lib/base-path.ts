/** True when running on Liara PaaS (not GitHub Pages static export). */
function isLiaraHosting(): boolean {
  return Boolean(
    process.env.LIARA_URL?.trim() ||
      process.env.LIARA_APP_NAME?.trim() ||
      process.env.LIARA_APP_SLUG?.trim(),
  );
}

/** Base path for GitHub Pages project sites (e.g. /onlinshop). Empty for Liara/local root. */
export function getBasePath(): string {
  const explicit = process.env.NEXT_PUBLIC_BASE_PATH?.trim();
  if (explicit) {
    return explicit.startsWith("/") ? explicit : `/${explicit}`;
  }

  // Liara always serves the app at the domain root — never infer /repo from GITHUB_*.
  if (isLiaraHosting()) return "";

  // Repo URL alone must not set basePath in dev — that breaks /admin, /api, etc.
  const pagesExport = process.env.GITHUB_PAGES === "true";
  if (!pagesExport) return "";

  const repoUrl = process.env.GITHUB_REPO?.trim();
  if (repoUrl) {
    const match = repoUrl.match(/github\.com\/[^/]+\/([^/.]+)/i);
    if (match) return `/${match[1]}`;
  }

  const ghRepo = process.env.GITHUB_REPOSITORY?.trim();
  if (ghRepo) {
    const name = ghRepo.split("/")[1];
    if (name) return `/${name}`;
  }

  return "";
}
