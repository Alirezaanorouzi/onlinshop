/** Internal product id for URLs (ASCII only — safe on mobile browsers and Liara). */
export function createProductSlug(_name: string, collection: string): string {
  const tail = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  return `${collection}-p-${tail}`.toLowerCase();
}
