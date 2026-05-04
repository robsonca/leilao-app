import type { ImovelComScore } from '../../lib/types';
import { formatBRL, formatPct } from '../../lib/format';

interface Props {
  imoveis: ImovelComScore[];
  onAnalise: (imovel: ImovelComScore) => void;
}

const RANK_COLOR = ['#F59E0B', '#9CA3AF', '#CD7C32'];

export default function TopOportunidades({ imoveis, onAnalise }: Props) {
  const top = [...imoveis].sort((a, b) => b.score - a.score).slice(0, 8);
  if (!top.length) return null;

  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: 18, marginBottom: 24,
      boxShadow: 'var(--shadow-sm)',
    }}>
      <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>🏆 Top Oportunidades</p>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
        Os {top.length} imóveis com maior score de oportunidade
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {top.map((im, i) => (
          <div key={im.id} onClick={() => onAnalise(im)} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 14px', background: 'var(--bg)',
            borderRadius: 10, border: '1px solid var(--border)',
            cursor: 'pointer', transition: 'border-color 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--brand)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <span style={{ fontWeight: 800, fontSize: 16, color: RANK_COLOR[i] ?? 'var(--text-muted)', minWidth: 24, textAlign: 'center' }}>
              {i + 1}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {im.tipo} — {im.bairro}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{im.cidade}</p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontWeight: 800, fontSize: 13 }}>{formatBRL(im.preco)}</p>
              {im.desconto && (
                <p style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>{formatPct(im.desconto)} desc.</p>
              )}
            </div>
            <div style={{
              background: 'var(--brand-light)', color: 'var(--brand)',
              fontWeight: 800, fontSize: 13, padding: '4px 10px', borderRadius: 20, flexShrink: 0,
            }}>
              {im.score.toFixed(0)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
