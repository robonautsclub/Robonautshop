/** Query-string helpers for paginated product lists (task 134). */

/** Parses `?page=`; anything missing or invalid is page 1. */
export function parsePageParam(value: string | undefined): number {
  const page = Number.parseInt(value ?? "", 10);
  return Number.isFinite(page) && page >= 1 ? page : 1;
}

/**
 * Builds a list URL that keeps the given filters and sets the page.
 * Empty values are dropped, and page 1 is omitted so it has one canonical URL.
 */
export function buildListHref(
  basePath: string,
  params: Record<string, string | undefined>,
  page: number,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }
  if (page > 1) {
    search.set("page", String(page));
  }
  const query = search.toString();
  return query ? `${basePath}?${query}` : basePath;
}
