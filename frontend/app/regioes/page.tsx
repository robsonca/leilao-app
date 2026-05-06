'use client';

import { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import { fetchInsights } from '../../lib/api';
import { formatBRL, formatPct } from '../../lib/format';
import { useFavorites } from '../../lib/favorites';
import type { Insights } from '../../lib/types';

export default function RegioesPage() {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { count: favCount } = useFavorites();

  useEffect(() => {
    fetchInsights()
      .then(setInsights)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      <Header onMenuClick={() => setSidebarOpen(true)} favCount={favCount} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="main-container">
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.3px' }}>Onde Investir</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Análise de oportunidades por região em São Paulo
          </p>
        </div>

        {loading ? <Skeleton /> : insights ? <Dashboard data={insights} /> : null}
      </main>
    </>
  );
}

function Dashboard({ data }: { data: Insights }) {
  const { totais, topCidadesPorVolume, topCidadesPorDesconto, porTipo, porModalidade } = data;
  const maxVolume = topCidadesPorVolume[0]?.count ?? 1;
  const maxDesconto = topCidadesPorDesconto[0]?.descontoMedio ?? 1;
  const maxTipo = porTipo[0]?.count ?? 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* KPIs */}
      <div className="regioes-kpis">
        <KpiCard label="Total de imóveis" value={totais.total.toLocaleString('pt-BR')} sub={`em ${totais.totalCidades} cidades`} color="var(--brand)" />
        <KpiCard label="Preço médio" value={formatBRL(totais.precoMedio)} sub="valor médio em leilão" color="#7C3AED" />
        <KpiCard label="Desconto médio" value={formatPct(totais.descontoMedio)} sub="abaixo do valor de avaliação" color="var(--green)" />
        <KpiCard label="Aceitam financiamento" value={totais.comFinanciamento.toLocaleString('pt-BR')} sub={`${((totais.comFinanciamento / totais.total) * 100).toFixed(0)}% do total`} color="#F59E0B" />
      </div>

      {/* Cidades por volume + por desconto */}
      <div className="regioes-grid-2">

        <Section title="Top cidades por volume" sub="Maior número de imóveis disponíveis">
          {topCidadesPorVolume.map((c, i) => (
            <BarRow
              key={c.cidade}
              rank={i + 1}
              label={fmt(c.cidade)}
              value={`${c.count.toLocaleString('pt-BR')} imóveis`}
              pct={(c.count / maxVolume) * 100}
              color="var(--brand)"
            />
          ))}
        </Section>

        <Section title="Top cidades por desconto" sub="Maior desconto médio em relação ao valor de avaliação">
          {topCidadesPorDesconto.map((c, i) => (
            <BarRow
              key={c.cidade}
              rank={i + 1}
              label={fmt(c.cidade)}
              value={formatPct(c.descontoMedio)}
              pct={(c.descontoMedio / maxDesconto) * 100}
              color="var(--green)"
            />
          ))}
        </Section>

      </div>

      {/* Tipo + Modalidade */}
      <div className="regioes-grid-2">

        <Section title="Por tipo de imóvel" sub="Distribuição do estoque disponível">
          {porTipo.slice(0, 8).map((t) => (
            <BarRow
              key={t.tipo}
              label={t.tipo || 'Outros'}
              value={`${t.count.toLocaleString('pt-BR')}`}
              pct={(t.count / maxTipo) * 100}
              color="#7C3AED"
            />
          ))}
        </Section>

        <Section title="Por modalidade de venda" sub="Como os imóveis estão sendo ofertados">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {porModalidade.map((m) => {
              const pct = ((m.count / totais.total) * 100);
              return (
                <div key={m.modalidade} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{m.modalidade}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pct.toFixed(1)}%</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--bg)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: '#F59E0B', borderRadius: 99, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, minWidth: 40, textAlign: 'right', color: 'var(--text-muted)' }}>
                    {m.count.toLocaleString('pt-BR')}
                  </span>
                </div>
              );
            })}
          </div>
        </Section>

      </div>
    </div>
  );
}

function KpiCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '18px 20px',
      borderTop: `3px solid ${color}`,
      boxShadow: 'var(--shadow-sm)',
    }}>
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{sub}</p>
    </div>
  );
}

function Section({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
      <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{title}</p>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>{sub}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {children}
      </div>
    </div>
  );
}

function BarRow({ rank, label, value, pct, color }: { rank?: number; label: string; value: string; pct: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {rank !== undefined && (
        <span style={{ fontSize: 12, fontWeight: 800, color: rank <= 3 ? color : 'var(--text-muted)', minWidth: 18, textAlign: 'center' }}>
          {rank}
        </span>
      )}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>{value}</span>
        </div>
        <div style={{ height: 5, background: 'var(--bg)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 0.6s ease' }} />
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div className="regioes-kpis">
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ height: 100, borderRadius: 'var(--radius)', background: 'linear-gradient(90deg,#E5E7EB 25%,#F3F4F6 50%,#E5E7EB 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
        ))}
      </div>
      <div className="regioes-grid-2">
        {[0, 1].map(i => (
          <div key={i} style={{ height: 320, borderRadius: 'var(--radius)', background: 'linear-gradient(90deg,#E5E7EB 25%,#F3F4F6 50%,#E5E7EB 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
        ))}
      </div>
    </div>
  );
}

function fmt(cidade: string) {
  return cidade.charAt(0) + cidade.slice(1).toLowerCase();
}
