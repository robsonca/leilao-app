import type { FilterState, KpiData, PaginatedResponse, Imovel, Insights } from './types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function toParams(filters: Partial<FilterState>): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== null) params.set(k, String(v));
  });
  return params.toString();
}

export async function fetchImoveis(
  filters: Partial<FilterState> = {},
): Promise<PaginatedResponse<Imovel>> {
  const res = await fetch(`${BASE}/imoveis?${toParams(filters)}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error('Erro ao buscar imóveis');
  return res.json();
}

export async function fetchKpis(
  filters: Partial<Omit<FilterState, 'page' | 'limit' | 'orderBy'>> = {},
): Promise<KpiData> {
  const res = await fetch(`${BASE}/imoveis/kpis?${toParams(filters)}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error('Erro ao buscar KPIs');
  return res.json();
}

export async function fetchCidades(): Promise<string[]> {
  const res = await fetch(`${BASE}/imoveis/cidades`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error('Erro ao buscar cidades');
  return res.json();
}

export async function fetchBairros(cidade?: string): Promise<string[]> {
  const url = cidade ? `${BASE}/imoveis/bairros?cidade=${encodeURIComponent(cidade)}` : `${BASE}/imoveis/bairros`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao buscar bairros');
  return res.json();
}

export async function fetchInsights(): Promise<Insights> {
  const res = await fetch(`${BASE}/imoveis/insights`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Erro ao buscar insights');
  return res.json();
}

export async function checkDisponivel(numero: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/imoveis/disponivel/${encodeURIComponent(numero)}`);
    if (!res.ok) return true;
    const data = await res.json();
    return data.disponivel;
  } catch {
    return true;
  }
}

export async function uploadCsv(file: File): Promise<{ upserted: number; errors: number }> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE}/imoveis/upload`, { method: 'POST', body: form });
  if (!res.ok) throw new Error('Erro ao fazer upload');
  return res.json();
}
