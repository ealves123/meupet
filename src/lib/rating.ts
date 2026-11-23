import type { AppState } from './types';
export function ratingOf(s: AppState, providerId: string) {
  const rs = s.reviews.filter(r => r.providerId === providerId);
  const avg = rs.length ? rs.reduce((a, r) => a + r.stars, 0) / rs.length : 0;
  return { avg, count: rs.length, isNew: rs.length < 3 }; // RN-08
}
