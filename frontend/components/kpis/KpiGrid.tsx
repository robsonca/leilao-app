import type { KpiData } from '../../lib/types';
import { formatBRL, formatPct } from '../../lib/format';

interface Props {
  kpis: KpiData | null;
  loading?: boolean;
}

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: string;
  color: string;
}

function KpiCard({ label, value, sub, icon, color }: KpiCardProps) {
  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '16px 18px',
      position: 'relative', overflow: 'hidden',
      borderTop: `3px solid ${color}`,
      boxShadow: 'var(--shadow-sm)',
    }}>
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8 }}>
        {label}
      </p>
      <p style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5 }}>{sub}</p>}
      <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 24, opacity: 0.15 }}>
        {icon}
      </span>
    </div>
  );
}

export default function KpiGrid({ kpis, loading }: Props) {
  if (loading || !kpis) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 20 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{
            height: 90, borderRadius: 'var(--radius)',
            background: 'linear-gradient(90deg,#E5E7EB 25%,#F3F4F6 50%,#E5E7EB 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }} />
        ))}
      </div>
    );
  }

  const pctFinanciamento = kpis.total > 0 ? ((kpis.comFinanciamento / kpis.total) * 100).toFixed(0) : '0';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 20 }}>
      <KpiCard label="Total de imóveis" value={kpis.total.toLocaleString('pt-BR')} icon="🏠" color="var(--brand)" />
      <KpiCard label="Preço médio" value={formatBRL(kpis.precoMedio)} icon="💰" color="#3B82F6" />
      <KpiCard label="Desconto médio" value={formatPct(kpis.descontoMedio)} icon="🏷️" color="#8B5CF6" />
      <KpiCard label="Maior desconto" value={formatPct(kpis.maiorDesconto)} icon="🔥" color="#F59E0B" />
      <KpiCard
        label="Com financiamento"
        value={kpis.comFinanciamento.toLocaleString('pt-BR')}
        sub={`${pctFinanciamento}% do total`}
        icon="🏦"
        color="var(--green)"
      />
      <KpiCard label="Cidades" value={kpis.totalCidades.toLocaleString('pt-BR')} icon="📍" color="#EC4899" />
    </div>
  );
}
