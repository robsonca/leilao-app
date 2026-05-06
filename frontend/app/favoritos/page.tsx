'use client';

import { useState } from 'react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import ImoveisGrid from '../../components/imoveis/ImoveisGrid';
import AiModal from '../../components/ia/AiModal';
import { useFavorites } from '../../lib/favorites';
import type { ImovelComScore } from '../../lib/types';

export default function FavoritosPage() {
  const { isFav, toggle: toggleFav, count: favCount, favList } = useFavorites();
  const [selectedImovel, setSelectedImovel] = useState<ImovelComScore | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [geminiKey, setGeminiKey] = useState('');

  return (
    <>
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>

      <Header
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
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)',
        }}>
          <div>
            <p style={{ fontWeight: 800, fontSize: 17 }}>❤️ Meus Favoritos</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              {favCount} {favCount === 1 ? 'imóvel salvo' : 'imóveis salvos'}
            </p>
          </div>
        </div>

        {favCount === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🤍</div>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>Nenhum favorito ainda</p>
            <p style={{ fontSize: 13 }}>Toque no coração dos imóveis para salvar</p>
          </div>
        ) : (
          <ImoveisGrid
            imoveis={favList}
            loading={false}
            onAnalise={setSelectedImovel}
            isFav={isFav}
            onToggleFav={toggleFav}
          />
        )}
      </main>

      <AiModal imovel={selectedImovel} geminiKey={geminiKey} onClose={() => setSelectedImovel(null)}
        isFav={selectedImovel ? isFav(selectedImovel.id) : false}
        onToggleFav={toggleFav}
      />
    </>
  );
}
