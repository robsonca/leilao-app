import type { ImovelComScore } from '../../lib/types';
import CardImovel from './CardImovel';

interface Props {
  imoveis: ImovelComScore[];
  loading?: boolean;
  onAnalise: (imovel: ImovelComScore) => void;
  isFav?: (id: number) => boolean;
  onToggleFav?: (id: number) => void;
}

export default function ImoveisGrid({ imoveis, loading, onAnalise, isFav, onToggleFav }: Props) {
  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} style={{
            height: 380, borderRadius: 'var(--radius)',
            background: 'linear-gradient(90deg,#E5E7EB 25%,#F3F4F6 50%,#E5E7EB 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }} />
        ))}
      </div>
    );
  }

  if (!imoveis.length) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🏚️</div>
        <p style={{ fontWeight: 600, marginBottom: 4 }}>Nenhum imóvel encontrado</p>
        <p style={{ fontSize: 13 }}>Tente ajustar os filtros</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
      {imoveis.map(imovel => (
        <CardImovel key={imovel.id} imovel={imovel} onAnalise={onAnalise}
          isFav={isFav?.(imovel.id)}
          onToggleFav={onToggleFav}
        />
      ))}
    </div>
  );
}
