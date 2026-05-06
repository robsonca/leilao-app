'use client';

import type { ImovelComScore } from '../../lib/types';
import { formatBRL, formatPct } from '../../lib/format';
import { streetViewUrl, streetViewWebUrl } from '../../lib/streetView';
import { useState } from 'react';

interface Props {
  imovel: ImovelComScore | null;
  geminiKey: string;
  onClose: () => void;
  isFav?: boolean;
  onToggleFav?: (imovel: ImovelComScore) => void;
}

const SCORE_STYLE = {
  oportunidade: { bg: 'var(--green-bg)', color: 'var(--green)', label: '↑ Oportunidade' },
  neutro:       { bg: 'var(--yellow-bg)', color: 'var(--yellow)', label: '→ Neutro' },
  cautela:      { bg: 'var(--red-bg)', color: 'var(--red)', label: '↓ Cautela' },
};

export default function AiModal({ imovel, onClose, isFav = false, onToggleFav }: Props) {
  const [imgSrc, setImgSrc] = useState<'cef' | 'streetview' | 'none'>('cef');
  const [heartPop, setHeartPop] = useState(false);

  function handleFav(e: React.MouseEvent) {
    e.stopPropagation();
    onToggleFav?.(imovel!);
    setHeartPop(true);
    setTimeout(() => setHeartPop(false), 300);
  }

  if (!imovel) return null;

  const score = SCORE_STYLE[imovel.classificacao];
  const precoOriginal = imovel.desconto && imovel.desconto > 0
    ? imovel.preco / (1 - imovel.desconto / 100)
    : null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)', zIndex: 300,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--white)', borderRadius: 18,
          border: '1px solid var(--border)', width: '100%', maxWidth: 560,
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
          boxShadow: 'var(--shadow-hover)', overflow: 'hidden',
        }}
      >
        {/* Foto */}
        <div style={{ position: 'relative', height: 200, background: '#F3F4F6', flexShrink: 0 }}>
          {imgSrc === 'cef' && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`https://venda-imoveis.caixa.gov.br/fotos/F${imovel.numero.replace(/-/g, '')}21.jpg`}
              alt={imovel.endereco}
              onError={() => setImgSrc('streetview')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
          {imgSrc === 'streetview' && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={streetViewUrl(imovel, { width: 800, height: 400 })}
              alt={imovel.endereco}
              onError={() => setImgSrc('none')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
          {imgSrc === 'none' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 13, color: 'var(--text-muted)' }}>
              📷 Foto indisponível
            </div>
          )}

          {/* Badge tipo */}
          <span style={{
            position: 'absolute', top: 12, left: 12,
            background: 'var(--white)', fontSize: 12, fontWeight: 700,
            padding: '4px 10px', borderRadius: 6, boxShadow: 'var(--shadow-sm)',
          }}>
            {imovel.tipo}
          </span>

          {/* Badge desconto */}
          {imovel.desconto && imovel.desconto > 0 && (
            <span style={{
              position: 'absolute', bottom: 12, left: 12,
              background: 'var(--brand)', color: 'white',
              fontSize: 12, fontWeight: 800,
              padding: '4px 10px', borderRadius: 6,
            }}>
              -{formatPct(imovel.desconto)}
            </span>
          )}

          {/* Botão favorito */}
          <button
            onClick={handleFav}
            style={{
              position: 'absolute', top: 12, right: 50,
              background: 'rgba(255,255,255,0.92)', border: 'none',
              borderRadius: '50%', width: 36, height: 36, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
              transform: heartPop ? 'scale(1.35)' : 'scale(1)',
              transition: 'transform 0.2s cubic-bezier(.36,2,.6,1)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24"
              fill={isFav ? '#F04E37' : 'none'}
              stroke={isFav ? '#F04E37' : '#6B7280'}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ transition: 'fill 0.2s, stroke 0.2s' }}
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* Botão fechar */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 12, right: 12,
              background: 'rgba(255,255,255,0.92)', border: 'none',
              borderRadius: 8, width: 30, height: 30, cursor: 'pointer',
              fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            ×
          </button>
        </div>

        {/* Conteúdo scrollável */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Título + score */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <p style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>
                {imovel.tipo} — {imovel.bairro}
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                📍 {imovel.endereco}
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                {imovel.cidade}
              </p>
            </div>
            <span style={{
              flexShrink: 0,
              background: score.bg, color: score.color,
              fontSize: 12, fontWeight: 700,
              padding: '5px 12px', borderRadius: 20,
            }}>
              {score.label}
            </span>
          </div>

          {/* Preço */}
          <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '16px 20px' }}>
            {precoOriginal ? (
              <>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'line-through', marginBottom: 2 }}>
                  De {formatBRL(precoOriginal)}
                </p>
                <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--brand)', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                  {formatBRL(imovel.preco)}
                </p>
                <p style={{
                  marginTop: 6, fontSize: 12, fontWeight: 700, color: 'var(--green)',
                  background: 'var(--green-bg)', display: 'inline-block',
                  padding: '3px 10px', borderRadius: 6,
                }}>
                  Economia de {formatBRL(precoOriginal - imovel.preco)} ({formatPct(imovel.desconto!)})
                </p>
              </>
            ) : (
              <p style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>
                {formatBRL(imovel.preco)}
              </p>
            )}
          </div>

          {/* Specs */}
          {(imovel.areaTotal || imovel.quartos || imovel.vagas) && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {imovel.areaTotal && <Spec icon="📐" label="Área" value={`${imovel.areaTotal} m²`} />}
              {imovel.quartos   && <Spec icon="🛏" label="Quartos" value={String(imovel.quartos)} />}
              {imovel.vagas     && <Spec icon="🚗" label="Vagas" value={String(imovel.vagas)} />}
            </div>
          )}

          {/* Tags */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Tag>{imovel.modalidade}</Tag>
            {imovel.financiamento && <Tag accent>🏦 Aceita financiamento</Tag>}
          </div>

          {/* Descrição */}
          {imovel.descricao && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 6 }}>
                Descrição
              </p>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                {imovel.descricao}
              </p>
            </div>
          )}

          {/* Ações */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
            <a
              href={`https://venda-imoveis.caixa.gov.br/editais/matricula/SP/${imovel.numero.replace(/-/g, '')}.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '12px 0', borderRadius: 10,
                background: 'var(--brand)', color: 'white',
                fontSize: 13, fontWeight: 700, textDecoration: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                boxShadow: '0 2px 8px rgba(240,78,55,0.25)',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
              </svg>
              Abrir Matrícula (PDF)
            </a>
            <div style={{ display: 'flex', gap: 8 }}>
              {imovel.link && (
                <a
                  href={imovel.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1, padding: '11px 0', borderRadius: 10,
                    border: '1.5px solid var(--border)', color: 'var(--text-secondary)',
                    fontSize: 13, fontWeight: 700, textDecoration: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  Site CEF ↗
                </a>
              )}
              <a
                href={streetViewWebUrl(imovel)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1, padding: '11px 0', borderRadius: 10,
                  border: '1.5px solid var(--border)', color: 'var(--text-secondary)',
                  fontSize: 13, fontWeight: 700, textDecoration: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                🗺 Street View
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Spec({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{
      background: 'var(--bg)', borderRadius: 10, padding: '10px 16px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 80,
    }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ fontSize: 15, fontWeight: 800 }}>{value}</span>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
    </div>
  );
}

function Tag({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span style={{
      fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 20,
      background: accent ? 'var(--green-bg)' : 'var(--bg)',
      color: accent ? 'var(--green)' : 'var(--text-secondary)',
      border: `1px solid ${accent ? 'var(--green)' : 'var(--border)'}`,
    }}>
      {children}
    </span>
  );
}
