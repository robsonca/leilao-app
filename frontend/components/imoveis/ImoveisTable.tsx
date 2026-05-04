'use client';

import type { ImovelComScore } from '../../lib/types';
import { formatBRL, formatPct } from '../../lib/format';

interface Props {
  imoveis: ImovelComScore[];
  loading?: boolean;
  onAnalise: (imovel: ImovelComScore) => void;
}

const SCORE_COLOR = {
  oportunidade: 'var(--green)',
  neutro: 'var(--yellow)',
  cautela: 'var(--red)',
};

export default function ImoveisTable({ imoveis, loading, onAnalise }: Props) {
  if (loading) {
    return (
      <div style={{ background: 'var(--white)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{
            height: 48, margin: '4px 0',
            background: 'linear-gradient(90deg,#E5E7EB 25%,#F3F4F6 50%,#E5E7EB 75%)',
            backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
          }} />
        ))}
      </div>
    );
  }

  if (!imoveis.length) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🏚️</div>
        <p style={{ fontWeight: 600 }}>Nenhum imóvel encontrado</p>
      </div>
    );
  }

  const th: React.CSSProperties = {
    padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)',
    borderBottom: '1px solid var(--border)', background: 'var(--bg)',
  };
  const td: React.CSSProperties = { padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #F3F4F6' };

  return (
    <div style={{ background: 'var(--white)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Cidade</th>
              <th style={th}>Bairro</th>
              <th style={th}>Tipo</th>
              <th style={th}>Preço</th>
              <th style={th}>Desconto</th>
              <th style={th}>Modalidade</th>
              <th style={th}>Financ.</th>
              <th style={th}>Score</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {imoveis.map((im) => (
              <tr key={im.id} style={{ transition: 'background 0.1s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#FAFAFA')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={td}>{im.cidade}</td>
                <td style={{ ...td, color: 'var(--text-secondary)' }}>{im.bairro}</td>
                <td style={td}>
                  <span style={{ background: 'var(--bg)', padding: '2px 8px', borderRadius: 5, fontSize: 12, fontWeight: 600 }}>
                    {im.tipo}
                  </span>
                </td>
                <td style={{ ...td, fontWeight: 700 }}>{formatBRL(im.preco)}</td>
                <td style={{ ...td, fontWeight: 700, color: im.desconto ? 'var(--green)' : 'var(--text-muted)' }}>
                  {formatPct(im.desconto)}
                </td>
                <td style={{ ...td, fontSize: 12, color: 'var(--text-secondary)' }}>{im.modalidade}</td>
                <td style={td}>{im.financiamento ? '✓' : '—'}</td>
                <td style={td}>
                  <span style={{
                    color: SCORE_COLOR[im.classificacao],
                    fontWeight: 800, fontSize: 13,
                  }}>
                    {im.score.toFixed(0)}
                  </span>
                </td>
                <td style={td}>
                  <button onClick={() => onAnalise(im)} style={{
                    background: 'var(--brand-light)', color: 'var(--brand)',
                    border: 'none', borderRadius: 6, padding: '4px 10px',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  }}>
                    🤖 IA
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
