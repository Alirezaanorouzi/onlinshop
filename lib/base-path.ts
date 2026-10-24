/** Base path for GitHub Pages project sites (e.g. /onlinshop). Empty for Liara/local root. */
export function getBasePath(): string {
  const explicit = process.env.NEXT_PUBLIC_BASE_PATH?.trim();
  if (explicit) {
    return explicit.startsWith("/") ? explicit : `/${explicit}`;
  }

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
