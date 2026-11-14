import type { Product } from "@/lib/catalog";

/** Content-based ranking, not a trained probability model. Reservations weigh more than favorites. */
export function rankBehavior(products: Product[], favoriteIds: string[], reservedIds: string[]) {
  const favorites = products.filter((p) => favoriteIds.includes(p.id));
  const reservations = products.filter((p) => reservedIds.includes(p.id));
  const excluded = new Set([...favoriteIds, ...reservedIds]);
  const signals = [...new Set([...favorites, ...reservations].map((p) => p.category))];
  const candidates = products.filter((p) => !excluded.has(p.id) && p.offers.some((o) => o.availability !== "UNAVAILABLE")).map((p) => ({
    id: p.id, name: p.name, category: p.category, brand: p.brand,
    score: (favorites.some((f) => f.category === p.category) ? 3 : 0) + (reservations.some((r) => r.category === p.category) ? 5 : 0) + (favorites.some((f) => f.brand === p.brand) ? 1 : 0) + (reservations.some((r) => r.brand === p.brand) ? 2 : 0) + (p.offers.some((o) => o.original_price_cents !== null) ? 1 : 0),
  })).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)).slice(0, 6);
  return { hasSignals: favorites.length + reservations.length > 0, signals, favoriteCount: favorites.length, reservedCount: reservations.length, candidates };
}