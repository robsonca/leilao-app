'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import FilterBar from '../components/filters/FilterBar';
import ImoveisGrid from '../components/imoveis/ImoveisGrid';
import ImoveisTable from '../components/imoveis/ImoveisTable';
import ViewToggle, { type ViewMode } from '../components/imoveis/ViewToggle';
import AiModal from '../components/ia/AiModal';
import { fetchImoveis, fetchCidades, fetchBairros } from '../lib/api';
import { enriquece } from '../lib/score';
import { useFavorites } from '../lib/favorites';
import type { FilterState, ImovelComScore } from '../lib/types';

const DEFAULT_FILTERS: FilterState = {
  cidade: '', bairro: '', tipo: '', modalidade: '', financiamento: '',
  precoMin: '', precoMax: '', page: 1, limit: 6, orderBy: 'desconto_desc',
};

const FILTERS_KEY = 'leilao_filters';
const TTL_MS = 24 * 60 * 60 * 1000;

const SESSION_KEY = 'leilao_session';

function filtersKey(f: FilterState) {
  const { page, limit, ...rest } = f;
  return JSON.stringify(rest);
}

function saveSession(data: object) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(data)); } catch {}
}

function clearSession() {
  try { sessionStorage.removeItem(SESSION_KEY); } catch {}
}

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function loadSavedFilters(): FilterState {
  try {
    const raw = localStorage.getItem(FILTERS_KEY);
    if (!raw) return DEFAULT_FILTERS;
    const { savedAt, ...saved } = JSON.parse(raw);
    if (Date.now() - savedAt > TTL_MS) {
      localStorage.removeItem(FILTERS_KEY);
      return DEFAULT_FILTERS;
    }
    return { ...DEFAULT_FILTERS, ...saved, page: 1 };
  } catch {
    return DEFAULT_FILTERS;
  }
}

function saveFilters(filters: FilterState) {
  try {
    const { page, ...rest } = filters;
    localStorage.setItem(FILTERS_KEY, JSON.stringify({ ...rest, savedAt: Date.now() }));
  } catch {}
}

export default function Home() {
  const [filters, setFilters] = useState<FilterState>(() => loadSavedFilters());
  const [imoveis, setImoveis] = useState<ImovelComScore[]>([]);
  const [cidades, setCidades] = useState<string[]>([]);
  const [bairros, setBairros] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState<ViewMode>('grid');
  const [geminiKey, setGeminiKey] = useState('');
  const [selectedImovel, setSelectedImovel] = useState<ImovelComScore | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const sessionRestoredRef = useRef(false);
  const imoveisRef = useRef<ImovelComScore[]>([]);
  const filtersRef = useRef<FilterState>(filters);
  const totalRef = useRef(0);
  const totalPagesRef = useRef(1);
  const { isFav, toggle: toggleFav, count: favCount } = useFavorites();

  const loadImoveis = useCallback(async () => {
    if (sessionRestoredRef.current) {
      sessionRestoredRef.current = false;
      return;
    }
    setLoading(true);
    try {
      const res = await fetchImoveis(filters);
      const novos = enriquece(res.data);
      setImoveis(prev => filters.page === 1 ? novos : [...prev, ...novos]);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Sincroniza refs (para usar no scroll handler sem dependências reativas)
  useEffect(() => { imoveisRef.current = imoveis; }, [imoveis]);
  useEffect(() => { filtersRef.current = filters; }, [filters]);
  useEffect(() => { totalRef.current = total; }, [total]);
  useEffect(() => { totalPagesRef.current = totalPages; }, [totalPages]);

  // Restaura sessão ao montar (volta de favoritos, etc.)
  useEffect(() => {
    const session = loadSession();
    if (!session || session.filtersKey !== filtersKey(filters)) { clearSession(); return; }
    sessionRestoredRef.current = true;
    setImoveis(session.imoveis);
    setFilters(prev => ({ ...prev, page: session.page }));
    setTotal(session.total);
    setTotalPages(session.totalPages);
    setLoading(false);
    setTimeout(() => window.scrollTo({ top: session.scrollY, behavior: 'instant' }), 80);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Salva sessão no scroll (debounced 300ms)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const handler = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (imoveisRef.current.length === 0) return;
        saveSession({
          imoveis: imoveisRef.current,
          page: filtersRef.current.page,
          scrollY: window.scrollY,
          total: totalRef.current,
          totalPages: totalPagesRef.current,
          filtersKey: filtersKey(filtersRef.current),
        });
      }, 300);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => { window.removeEventListener('scroll', handler); clearTimeout(timer); };
  }, []);

  useEffect(() => { loadImoveis(); }, [loadImoveis]);
  useEffect(() => { fetchCidades().then(setCidades).catch(console.error); }, []);
  useEffect(() => {
    fetchBairros(filters.cidade || undefined).then(setBairros).catch(console.error);
  }, [filters.cidade]);

  // Scroll infinito: observa o sentinel só quando não está carregando e há mais páginas
  useEffect(() => {
    if (loading || filters.page >= totalPages) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFilters(prev => ({ ...prev, page: prev.page + 1 }));
        }
      },
      { rootMargin: '300px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading, filters.page, totalPages]);

  function handleFilterChange(partial: Partial<FilterState>) {
    clearSession();
    setFilters(prev => {
      const next = { ...prev, ...partial };
      saveFilters(next);
      return next;
    });
  }

  function handleClear() {
    setImoveis([]);
    localStorage.removeItem(FILTERS_KEY);
    clearSession();
    setFilters(DEFAULT_FILTERS);
  }

  const isFirstLoad = loading && imoveis.length === 0;
  const isLoadingMore = loading && imoveis.length > 0;
  const hasMore = filters.page < totalPages;

  return (
    <>
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <Header
        total={total}
        onMenuClick={() => setSidebarOpen(true)}
        favCount={favCount}
      />

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        geminiKey={geminiKey}
        onGeminiKeyChange={setGeminiKey}
      />

      <main className="main-container">
        <FilterBar
          filters={filters}
          cidades={cidades}
          bairros={bairros}
          onChange={handleFilterChange}
          onClear={handleClear}
          total={total}
        />

        <div className="listing-header">
          <div className="listing-header-left">
            <p style={{ fontWeight: 700, fontSize: 15 }}>Imóveis</p>
            <select
              value={filters.orderBy}
              onChange={e => handleFilterChange({ orderBy: e.target.value as FilterState['orderBy'], page: 1 })}
              style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'var(--white)', cursor: 'pointer' }}
            >
              <option value="desconto_desc">Maior desconto</option>
              <option value="preco_asc">Menor preço</option>
              <option value="preco_desc">Maior preço</option>
              <option value="cidade_asc">Cidade A-Z</option>
            </select>
          </div>
          <ViewToggle view={view} onChange={setView} />
        </div>

        {view === 'grid' ? (
          <ImoveisGrid
            imoveis={imoveis}
            loading={isFirstLoad}
            onAnalise={setSelectedImovel}
            isFav={isFav}
            onToggleFav={toggleFav}
          />
        ) : (
          <ImoveisTable imoveis={imoveis} loading={isFirstLoad} onAnalise={setSelectedImovel} />
        )}

        {/* Sentinel para IntersectionObserver */}
        {hasMore && <div ref={sentinelRef} style={{ height: 1 }} />}

        {/* Spinner de "carregando mais" */}
        {isLoadingMore && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              border: '3px solid var(--border)',
              borderTopColor: 'var(--brand)',
              animation: 'spin 0.7s linear infinite',
            }} />
          </div>
        )}

        {/* Fim da lista */}
        {!loading && !hasMore && imoveis.length > 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '24px 0' }}>
            Todos os {total.toLocaleString('pt-BR')} imóveis carregados
          </p>
        )}
      </main>

      <AiModal key={selectedImovel?.id} imovel={selectedImovel} geminiKey={geminiKey} onClose={() => setSelectedImovel(null)}
        isFav={selectedImovel ? isFav(selectedImovel.id) : false}
        onToggleFav={toggleFav}
      />
    </>
  );
}
