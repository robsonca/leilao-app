'use client';

import { useCallback, useEffect, useState } from 'react';
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
  precoMin: '', precoMax: '', page: 1, limit: 15, orderBy: 'desconto_desc',
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
  const { isFav, toggle: toggleFav, count: favCount } = useFavorites();

  const loadImoveis = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchImoveis(filters);
      setImoveis(enriquece(res.data));
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

  function handleFilterChange(partial: Partial<FilterState>) {
    setFilters(prev => ({ ...prev, ...partial }));
  }

  function handleClear() {
    setFilters(DEFAULT_FILTERS);
  }

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

        {/* View favoritos */}
          {/* Filtros */}
          <FilterBar
            filters={filters}
            cidades={cidades}
            onChange={handleFilterChange}
            onClear={handleClear}
            total={total}
          />

          {/* Cabeçalho da listagem */}
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

          {/* Listagem */}
          {view === 'grid' ? (
            <ImoveisGrid imoveis={imoveis} loading={loading} onAnalise={setSelectedImovel}
              isFav={isFav} onToggleFav={toggleFav} />
          ) : (
            <ImoveisTable imoveis={imoveis} loading={loading} onAnalise={setSelectedImovel} />
          )}

          {/* Paginação */}
          {!loading && totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 8, marginTop: 28 }}>
              <PageBtn disabled={filters.page <= 1} onClick={() => handleFilterChange({ page: filters.page - 1 })}>← Anterior</PageBtn>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = filters.page <= 4 ? i + 1 : filters.page - 3 + i;
                if (p < 1 || p > totalPages) return null;
                return (
                  <PageBtn key={p} active={p === filters.page} onClick={() => handleFilterChange({ page: p })}>
                    {p}
                  </PageBtn>
                );
              })}
              <PageBtn disabled={filters.page >= totalPages} onClick={() => handleFilterChange({ page: filters.page + 1 })}>Próxima →</PageBtn>
            </div>
          )}
      </main>

      <AiModal imovel={selectedImovel} geminiKey={geminiKey} onClose={() => setSelectedImovel(null)} />
    </>
  );
}

function PageBtn({ children, onClick, disabled, active }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; active?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
      border: '1px solid var(--border)', cursor: disabled ? 'default' : 'pointer',
      background: active ? 'var(--brand)' : 'var(--white)',
      color: active ? 'white' : disabled ? 'var(--text-muted)' : 'var(--text-primary)',
      opacity: disabled ? 0.4 : 1,
    }}>
      {children}
    </button>
  );
}
