import { useSyncExternalStore } from 'react';

const read = () => (location.hash.replace(/^#/, '') || '/');
export function useRoute() {
  const path = useSyncExternalStore(cb => { addEventListener('hashchange', cb); return () => removeEventListener('hashchange', cb); }, read);
  const [p, q = ''] = path.split('?');
  return { path: p, parts: p.split('/').filter(Boolean), query: new URLSearchParams(q) };
}
export const go = (path: string) => { location.hash = path; window.scrollTo(0, 0); };
export const back = (fallback = '/') => (history.length > 1 ? history.back() : go(fallback));
