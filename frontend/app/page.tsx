'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import FilterBar from '../components/filters/FilterBar';
import ImoveisGrid from '../components/imoveis/ImoveisGrid';
import ImoveisTable from '../components/imoveis/ImoveisTable';
import ViewToggle, { type ViewMode } from '../components/imoveis/ViewToggle';
import AiModal from '../components/ia/AiModal';
import { fetchImoveis, fetchCidades } from '../lib/api';
import { enriquece } from '../lib/score';
import { useFavorites } from '../lib/favorites';
import type { FilterState, ImovelComScore } from '../lib/types';

const DEFAULT_FILTERS: FilterState = {
  cidade: '', tipo: '', modalidade: '', financiamento: '',
  precoMin: '', precoMax: '', page: 1, limit: 6, orderBy: 'desconto_desc',
};

export default function Home() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [imoveis, setImoveis] = useState<ImovelComScore[]>([]);
  const [cidades, setCidades] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState<ViewMode>('grid');
  const [geminiKey, setGeminiKey] = useState('');
  const [selectedImovel, setSelectedImovel] = useState<ImovelComScore | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { isFav, toggle: toggleFav, count: favCount } = useFavorites();

  const loadImoveis = useCallback(async () => {
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

  useEffect(() => { loadImoveis(); }, [loadImoveis]);
  useEffect(() => { fetchCidades().then(setCidades).catch(console.error); }, []);

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
    setFilters(prev => ({ ...prev, ...partial }));
  }

  function handleClear() {
    setImoveis([]);
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
