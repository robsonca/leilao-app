'use client';

import { useEffect, useRef, useState } from 'react';
import type { FilterState } from '../../lib/types';

const TIPOS = ['Apartamento', 'Casa', 'Sobrado', 'Terreno', 'Comercial', 'Sala', 'Loja', 'Prédio', 'Galpão'];
const MODALIDADES = ['Venda Online', 'Venda Direta Online', 'Leilão SFI - Edital Único', 'Licitação Aberta'];
const FAIXAS = [
  { label: 'Até R$100k',    min: '',       max: '100000'  },
  { label: 'R$100–200k',    min: '100000', max: '200000'  },
  { label: 'R$200–300k',    min: '200000', max: '300000'  },
  { label: 'R$300–500k',    min: '300000', max: '500000'  },
  { label: 'R$500k–1M',     min: '500000', max: '1000000' },
  { label: 'Acima de R$1M', min: '1000000',max: ''        },
];

interface Props {
  filters: FilterState;
  cidades: string[];
  onChange: (f: Partial<FilterState>) => void;
  onClear: () => void;
  total: number;
}

type Pending = Pick<FilterState, 'cidade' | 'tipo' | 'modalidade' | 'financiamento' | 'precoMin' | 'precoMax'>;

function toPending(f: FilterState): Pending {
  return { cidade: f.cidade, tipo: f.tipo, modalidade: f.modalidade, financiamento: f.financiamento, precoMin: f.precoMin, precoMax: f.precoMax };
}

function faixaLabel(min: string, max: string) {
  return FAIXAS.find(f => f.min === min && f.max === max)?.label ?? '';
}

function summaryText(f: FilterState) {
  const parts: string[] = [];
  if (f.cidade) parts.push(f.cidade.charAt(0) + f.cidade.slice(1).toLowerCase());
  if (f.tipo) parts.push(f.tipo);
  const fl = faixaLabel(f.precoMin, f.precoMax);
  if (fl) parts.push(fl);
  if (f.financiamento === 'true') parts.push('Financiável');
  if (!parts.length) parts.push('Sem filtros');
  return parts.join(' · ');
}

export default function FilterBar({ filters, cidades, onChange, onClear, total }: Props) {
  const hasSearched = !!(filters.cidade || filters.tipo || filters.modalidade || filters.precoMin || filters.precoMax || filters.financiamento);
  const [panelOpen, setPanelOpen] = useState(!hasSearched);
  const [pending, setPending] = useState<Pending>(toPending(filters));
  const [cidadeInput, setCidadeInput] = useState(filters.cidade);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const cidadesFiltradas = cidades
    .filter(c => c.toLowerCase().includes(cidadeInput.toLowerCase()))
    .slice(0, 30);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  function openPanel() {
    setPending(toPending(filters));
    setCidadeInput(filters.cidade);
    setPanelOpen(true);
  }

  function handleSearch() {
    onChange({ ...pending, page: 1 });
    setPanelOpen(false);
  }

  function handleClear() {
    onClear();
    setPending({ cidade: '', tipo: '', modalidade: '', financiamento: '', precoMin: '', precoMax: '' });
    setCidadeInput('');
    setPanelOpen(true);
  }

  function setPendingTipo(tipo: string) {
    setPending(p => ({ ...p, tipo: p.tipo === tipo ? '' : tipo }));
  }

  function handleFaixa(e: React.ChangeEvent<HTMLSelectElement>) {
    const faixa = FAIXAS.find(f => f.label === e.target.value);
    setPending(p => faixa
      ? { ...p, precoMin: faixa.min, precoMax: faixa.max }
      : { ...p, precoMin: '', precoMax: '' }
    );
  }

  const faixaAtual = faixaLabel(pending.precoMin, pending.precoMax);

  /* ─── painel de busca ─── */
  if (panelOpen) {
    return (
      <div style={{
        background: 'var(--white)', borderRadius: 20,
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)', padding: '28px 24px 24px',
        marginBottom: 24,
      }}>

        {/* Cidade */}
        <div ref={dropRef} style={{ marginBottom: 16, position: 'relative' }}>
          <label style={labelStyle}>
            <span style={iconStyle}>📍</span> Cidade
          </label>
          <input
            value={cidadeInput}
            onChange={e => { setCidadeInput(e.target.value); setDropOpen(true); setPending(p => ({ ...p, cidade: '' })); }}
            onFocus={() => setDropOpen(true)}
            placeholder="Busque por cidade..."
            style={inputStyle}
          />
          {dropOpen && cidadesFiltradas.length > 0 && (
            <div style={dropdownStyle}>
              {cidadesFiltradas.map(c => (
                <div key={c} onMouseDown={() => {
                  setCidadeInput(c);
                  setPending(p => ({ ...p, cidade: c }));
                  setDropOpen(false);
                }} style={{
                  padding: '10px 16px', fontSize: 14, cursor: 'pointer',
                  background: c === pending.cidade ? 'var(--brand-light)' : undefined,
                  color: c === pending.cidade ? 'var(--brand)' : undefined,
                  fontWeight: c === pending.cidade ? 700 : undefined,
                }}>
                  {c.charAt(0) + c.slice(1).toLowerCase()}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tipo — pills */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>
            <span style={iconStyle}>🏠</span> Tipo de imóvel
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            {TIPOS.map(t => (
              <button key={t} onClick={() => setPendingTipo(t)} style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', border: '1.5px solid',
                borderColor: pending.tipo === t ? 'var(--brand)' : 'var(--border)',
                background: pending.tipo === t ? 'var(--brand)' : 'var(--white)',
                color: pending.tipo === t ? '#fff' : 'var(--text-primary)',
                transition: 'all 0.15s',
              }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Valor + Modalidade */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div>
            <label style={labelStyle}>
              <span style={iconStyle}>💰</span> Valor total
            </label>
            <select value={faixaAtual} onChange={handleFaixa} style={inputStyle}>
              <option value="">Qualquer valor</option>
              {FAIXAS.map(f => <option key={f.label}>{f.label}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>
              <span style={iconStyle}>🏷️</span> Modalidade
            </label>
            <select value={pending.modalidade} onChange={e => setPending(p => ({ ...p, modalidade: e.target.value }))} style={inputStyle}>
              <option value="">Todas</option>
              {MODALIDADES.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {/* Financiamento toggle */}
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => setPending(p => ({ ...p, financiamento: p.financiamento === 'true' ? '' : 'true' }))}
            style={{
              width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
              background: pending.financiamento === 'true' ? 'var(--brand)' : '#d1d5db',
              position: 'relative', transition: 'background 0.2s',
            }}>
            <span style={{
              position: 'absolute', top: 2,
              left: pending.financiamento === 'true' ? 22 : 2,
              width: 20, height: 20, borderRadius: '50%',
              background: '#fff', transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </button>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            Aceita financiamento
          </span>
        </div>

        {/* Botão buscar */}
        <button onClick={handleSearch} style={{
          width: '100%', padding: '14px', borderRadius: 30,
          background: 'var(--brand)', color: '#fff',
          border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer',
          letterSpacing: '0.01em', boxShadow: '0 2px 8px rgba(240,78,55,0.3)',
        }}>
          Buscar imóveis
        </button>

        {hasSearched && (
          <button onClick={handleClear} style={{
            width: '100%', marginTop: 10, padding: '10px',
            borderRadius: 30, background: 'transparent', color: 'var(--text-muted)',
            border: '1px solid var(--border)', fontSize: 13, cursor: 'pointer',
          }}>
            Limpar filtros
          </button>
        )}
      </div>
    );
  }

  /* ─── barra compacta (após busca) ─── */
  return (
    <div style={{ marginBottom: 20 }}>
      {/* Resumo + botão editar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--white)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '12px 16px',
        boxShadow: 'var(--shadow-sm)', marginBottom: 10,
      }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
            {summaryText(filters)}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--brand)' }}>{total.toLocaleString('pt-BR')}</strong> imóveis em leilão
          </p>
        </div>
        <button onClick={openPanel} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', borderRadius: 20,
          border: '1.5px solid var(--border)', background: 'var(--white)',
          fontSize: 13, fontWeight: 600, cursor: 'pointer', color: 'var(--text-primary)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
            <circle cx="8" cy="6" r="2" fill="white" /><circle cx="16" cy="12" r="2" fill="white" /><circle cx="8" cy="18" r="2" fill="white" />
          </svg>
          Filtros
        </button>
      </div>

      {/* Tipo chips — scroll horizontal */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
        <Chip label="Todos" active={!filters.tipo} onClick={() => onChange({ tipo: '', page: 1 })} />
        {TIPOS.map(t => (
          <Chip key={t} label={t} active={filters.tipo === t}
            onClick={() => onChange({ tipo: filters.tipo === t ? '' : t, page: 1 })} />
        ))}
      </div>
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      flexShrink: 0, padding: '7px 16px', borderRadius: 20,
      border: '1.5px solid', fontSize: 13, fontWeight: 600, cursor: 'pointer',
      borderColor: active ? 'var(--brand)' : 'var(--border)',
      background: active ? 'var(--brand)' : 'var(--white)',
      color: active ? '#fff' : 'var(--text-primary)',
      transition: 'all 0.15s',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </button>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6,
  fontSize: 12, fontWeight: 700, color: 'var(--text-muted)',
  marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em',
};

const iconStyle: React.CSSProperties = { fontSize: 14 };

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: '1.5px solid var(--border)', background: 'var(--white)',
  fontSize: 14, color: 'var(--text-primary)', outline: 'none',
  cursor: 'pointer', boxSizing: 'border-box',
};

const dropdownStyle: React.CSSProperties = {
  position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
  background: 'var(--white)', border: '1px solid var(--border)',
  borderRadius: 12, zIndex: 50, maxHeight: 220, overflowY: 'auto',
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
};
