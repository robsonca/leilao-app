'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import type { KpiData } from '../../lib/types';
import { formatBRL } from '../../lib/format';

const COLORS = ['#F04E37', '#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EC4899', '#06B6D4'];

interface Props {
  kpis: KpiData | null;
}

const cardStyle: React.CSSProperties = {
  background: 'var(--white)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius)', padding: '18px 18px 14px',
  boxShadow: 'var(--shadow-sm)',
};

function ChartTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontWeight: 700, fontSize: 14 }}>{title}</p>
      {sub && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</p>}
    </div>
  );
}

export default function ChartsGrid({ kpis }: Props) {
  if (!kpis) return null;

  const faixas = [
    { name: 'Até 100k', range: [0, 100000] },
    { name: '100-200k', range: [100000, 200000] },
    { name: '200-300k', range: [200000, 300000] },
    { name: '300-500k', range: [300000, 500000] },
    { name: '500k-1M', range: [500000, 1000000] },
    { name: '+1M', range: [1000000, Infinity] },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 24 }}>

      {/* Tipos de imóvel — Donut */}
      <div style={cardStyle}>
        <ChartTitle title="Distribuição por Tipo" sub="Quantidade por categoria" />
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={kpis.porTipo.slice(0, 7)}
              dataKey="count"
              nameKey="tipo"
              cx="50%" cy="50%"
              innerRadius={55} outerRadius={85}
            >
              {kpis.porTipo.slice(0, 7).map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => (typeof v === 'number' ? v.toLocaleString('pt-BR') : v)} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Modalidades — Donut */}
      <div style={cardStyle}>
        <ChartTitle title="Modalidade de Venda" sub="Distribuição por tipo de venda" />
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={kpis.porModalidade}
              dataKey="count"
              nameKey="modalidade"
              cx="50%" cy="50%"
              innerRadius={55} outerRadius={85}
            >
              {kpis.porModalidade.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => (typeof v === 'number' ? v.toLocaleString('pt-BR') : v)} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Top cidades */}
      <div style={{ ...cardStyle, gridColumn: 'span 2' }}>
        <ChartTitle title="Top Tipos por Volume" sub="Quantidade de imóveis por tipo" />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={kpis.porTipo.slice(0, 8)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis dataKey="tipo" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} width={40} />
            <Tooltip formatter={(v) => (typeof v === 'number' ? v.toLocaleString('pt-BR') : v)} />
            <Bar dataKey="count" name="Imóveis" radius={[4, 4, 0, 0]}>
              {kpis.porTipo.slice(0, 8).map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
