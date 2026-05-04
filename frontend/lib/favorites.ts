'use client';

import { useCallback, useEffect, useState } from 'react';

const KEY = 'leilao:favoritos';

function readStorage(): Set<number> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(KEY);
    return new Set(raw ? (JSON.parse(raw) as number[]) : []);
  } catch {
    return new Set();
  }
}

export function useFavorites() {
  const [favs, setFavs] = useState<Set<number>>(new Set());

  useEffect(() => {
    setFavs(readStorage());
  }, []);

  const toggle = useCallback((id: number) => {
    setFavs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem(KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const isFav = useCallback((id: number) => favs.has(id), [favs]);

  return { favs, isFav, toggle, count: favs.size };
}
