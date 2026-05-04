'use client';

import { useEffect, useState } from 'react';
import type { ImovelComScore } from '../../lib/types';
import { formatBRL, formatPct } from '../../lib/format';

interface Props {
  imovel: ImovelComScore | null;
  geminiKey: string;
  onClose: () => void;
}

interface Sections {
  OPORTUNIDADE?: string;
  PRECO_VALOR?: string;
  LIQUIDEZ?: string;
  RISCOS?: string;
  VEREDICTO?: string;
}

type Veredicto = 'OPORTUNIDADE' | 'CAUTELA' | 'NEUTRO';

const VEREDICTO_STYLE: Record<Veredicto, { bg: string; color: string; icon: string }> = {
  OPORTUNIDADE: { bg: 'var(--green-bg)', color: 'var(--green)', icon: '✅' },
  NEUTRO: { bg: 'var(--yellow-bg)', color: 'var(--yellow)', icon: '⚠️' },
  CAUTELA: { bg: 'var(--red-bg)', color: 'var(--red)', icon: '🚨' },
};

function parseSections(text: string): Sections {
  const keys = ['OPORTUNIDADE', 'PRECO_VALOR', 'LIQUIDEZ', 'RISCOS', 'VEREDICTO'] as const;
  const result: Sections = {};
  keys.forEach((key) => {
    const re = new RegExp(`\\[${key}\\]([\\s\\S]*?)(?=\\[(?:${keys.join('|')})\\]|$)`, 'i');
    const m = text.match(re);
    if (m) result[key] = m[1].trim();
  });
  return result;
}

function detectVeredicto(text: string): Veredicto {
  const upper = text.toUpperCase();
  if (upper.includes('OPORTUNIDADE')) return 'OPORTUNIDADE';
  if (upper.includes('CAUTELA')) return 'CAUTELA';
  return 'NEUTRO';
}

export default function AiModal({ imovel, geminiKey, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<Sections | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!imovel) { setSections(null); setError(''); return; }
    if (!geminiKey) { setError('Configure sua chave do Gemini na sidebar (⚙️)'); return; }
    analyze();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imovel]);

  async function analyze() {
    if (!imovel || !geminiKey) return;
    setLoading(true); setError(''); setSections(null);

    const MEDIANA = 148667;
    const diff = ((imovel.preco - MEDIANA) / MEDIANA * 100).toFixed(0);
    const posicao = imovel.preco < MEDIANA ? `${Math.abs(Number(diff))}% abaixo` : `${diff}% acima`;

    const prompt = `Você é um especialista em leilões imobiliários no Brasil. Analise este imóvel:

[DADOS]
- Imóvel: ${imovel.tipo} em ${imovel.cidade} / ${imovel.bairro}
- Endereço: ${imovel.endereco}
- Preço: ${formatBRL(imovel.preco)}${imovel.desconto ? ` (${formatPct(imovel.desconto)} de desconto)` : ''}
- Posição vs mediana SP (${formatBRL(MEDIANA)}): ${posicao} da mediana
- Financiamento: ${imovel.financiamento ? 'Disponível' : 'Não disponível'}
- Modalidade: ${imovel.modalidade}
${imovel.descricao ? `- Descrição: ${imovel.descricao}` : ''}

Responda obrigatoriamente neste formato com as 5 seções:

[OPORTUNIDADE]
Análise geral do potencial da oportunidade.

[PRECO_VALOR]
Avaliação do preço, desconto e posição vs mercado.

[LIQUIDEZ]
Facilidade de revenda, perfil de compradores, demanda.

[RISCOS]
Riscos: modalidade, jurídico, localização, estado do imóvel.

[VEREDICTO]
Uma frase conclusiva. Classifique como exatamente uma destas palavras: OPORTUNIDADE, NEUTRO ou CAUTELA.`;

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? 'Erro na API Gemini');
      const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      setSections(parseSections(text));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao chamar Gemini');
    } finally {
      setLoading(false);
    }
  }

  if (!imovel) return null;

  const veredicto = sections?.VEREDICTO ? detectVeredicto(sections.VEREDICTO) : null;
  const vs = veredicto ? VEREDICTO_STYLE[veredicto] : null;

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)', zIndex: 300,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--white)', borderRadius: 18,
        border: '1px solid var(--border)', width: '100%', maxWidth: 640,
        maxHeight: '88vh', display: 'flex', flexDirection: 'column',
        boxShadow: 'var(--shadow-hover)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>🤖 Análise com IA</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{imovel.tipo} — {imovel.bairro}, {imovel.cidade}</p>
          </div>
          <button onClick={onClose} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', fontSize: 16 }}>×</button>
        </div>

        {/* Detalhes do imóvel */}
        <div style={{ padding: '12px 24px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: '8px 20px' }}>
          <Pill label="Preço" value={formatBRL(imovel.preco)} />
          {imovel.desconto && <Pill label="Desconto" value={formatPct(imovel.desconto)} />}
          <Pill label="Modalidade" value={imovel.modalidade} />
          <Pill label="Financiamento" value={imovel.financiamento ? 'Sim' : 'Não'} />
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '48px 0', color: 'var(--text-muted)' }}>
              <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ fontSize: 13 }}>Analisando com Gemini…</p>
            </div>
          )}

          {error && (
            <div style={{ background: 'var(--red-bg)', color: 'var(--red)', padding: '12px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600 }}>
              {error}
            </div>
          )}

          {sections && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {vs && sections.VEREDICTO && (
                <div style={{ background: vs.bg, color: vs.color, borderRadius: 10, padding: '12px 16px', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {vs.icon} {veredicto} — {sections.VEREDICTO}
                </div>
              )}
              {(['OPORTUNIDADE', 'PRECO_VALOR', 'LIQUIDEZ', 'RISCOS'] as const).map(key => sections[key] && (
                <div key={key}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--brand)', marginBottom: 6 }}>
                    {key.replace('_', ' ')}
                  </p>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>{sections[key]}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
      {label}: <strong style={{ color: 'var(--text-primary)' }}>{value}</strong>
    </span>
  );
}
