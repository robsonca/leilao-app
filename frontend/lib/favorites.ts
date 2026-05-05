'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ImovelComScore } from './types';

const KEY = 'leilao:favoritos';

type FavMap = Record<number, ImovelComScore>;

function readStorage(): FavMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as FavMap) : {};
  } catch {
    return {};
  }
}

export function useFavorites() {
  const [favMap, setFavMap] = useState<FavMap>({});

  useEffect(() => {
    setFavMap(readStorage());
  }, []);

  const toggle = useCallback((imovel: ImovelComScore) => {
    setFavMap(prev => {
      const next = { ...prev };
      if (next[imovel.id]) delete next[imovel.id];
      else next[imovel.id] = imovel;
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFav = useCallback((id: number) => !!favMap[id], [favMap]);
  const favList = Object.values(favMap);

  return { isFav, toggle, count: favList.length, favList };
}
