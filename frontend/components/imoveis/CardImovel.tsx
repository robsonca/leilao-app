'use client';

import { useState } from 'react';
import type { ImovelComScore } from '../../lib/types';
import { streetViewUrl, streetViewWebUrl } from '../../lib/streetView';
import { formatBRL, formatPct } from '../../lib/format';

interface Props {
  imovel: ImovelComScore;
  onAnalise: (imovel: ImovelComScore) => void;
  isFav?: boolean;
  onToggleFav?: (imovel: ImovelComScore) => void;
}

const SCORE_STYLE = {
  oportunidade: { bg: 'var(--green-bg)', color: 'var(--green)', label: '↑ Oportunidade' },
  neutro: { bg: 'var(--yellow-bg)', color: 'var(--yellow)', label: '→ Neutro' },
  cautela: { bg: 'var(--red-bg)', color: 'var(--red)', label: '↓ Cautela' },
};

export default function CardImovel({ imovel, onAnalise, isFav = false, onToggleFav }: Props) {
  const [imgOk, setImgOk] = useState(true);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [heartPop, setHeartPop] = useState(false);
  const score = SCORE_STYLE[imovel.classificacao];

  function handleFav(e: React.MouseEvent) {
    e.stopPropagation();
    onToggleFav?.(imovel);
    setHeartPop(true);
    setTimeout(() => setHeartPop(false), 300);
  }

  return (
    <div style={{
      background: 'var(--white)', borderRadius: 'var(--radius)',
      border: '1px solid var(--border)', overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)', transition: 'box-shadow 0.2s, transform 0.2s',
      cursor: 'pointer',
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-hover)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-sm)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Foto Street View */}
      <div style={{ position: 'relative', width: '100%', height: 180, background: '#F3F4F6' }}>
        {/* Image layer — overflow:hidden applied only here so it doesn't block button clicks */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 0 }}>
          {!imgLoaded && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg,#E5E7EB 25%,#F3F4F6 50%,#E5E7EB 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }} />
          )}
          {imgOk ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={streetViewUrl(imovel.endereco, { width: 640, height: 400 })}
              alt={`${imovel.tipo} em ${imovel.bairro}`}
              onLoad={() => setImgLoaded(true)}
              onError={() => { setImgOk(false); setImgLoaded(true); }}
              loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: imgLoaded ? 'block' : 'none', transition: 'transform 0.4s' }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 13, color: 'var(--text-muted)' }}>
              📷 Foto indisponível
            </div>
          )}
        </div>

        {/* Badge tipo */}
        <span style={{
          position: 'absolute', top: 10, left: 10,
          background: 'var(--white)', fontSize: 11, fontWeight: 700,
          padding: '3px 9px', borderRadius: 6, boxShadow: 'var(--shadow-sm)',
          zIndex: 1,
        }}>
          {imovel.tipo}
        </span>

        {/* Badge desconto */}
        {imovel.desconto && imovel.desconto > 0 && (
          <span style={{
            position: 'absolute', top: 10, right: 10,
            background: 'var(--brand)', color: 'white',
            fontSize: 11, fontWeight: 800,
            padding: '3px 9px', borderRadius: 6,
            zIndex: 1,
          }}>
            -{formatPct(imovel.desconto)}
          </span>
        )}

        {/* Link Street View */}
        {imgOk && imgLoaded && (
          <a
            href={streetViewWebUrl(imovel.endereco)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            title="Ver no Google Street View"
            style={{
              position: 'absolute', bottom: 10, left: 10,
              background: 'rgba(255,255,255,0.92)',
              border: 'none', borderRadius: 6, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 9px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
              textDecoration: 'none',
              fontSize: 11, fontWeight: 700, color: '#1a73e8',
              zIndex: 2,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            Street View
          </a>
        )}

        {/* Botão favorito */}
        <button onClick={handleFav} style={{
          position: 'absolute', bottom: 10, right: 10,
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(255,255,255,0.92)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
          transform: heartPop ? 'scale(1.35)' : 'scale(1)',
          transition: 'transform 0.2s cubic-bezier(.36,2,.6,1)',
          zIndex: 2,
        }}>
          <Heart filled={isFav} />
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, letterSpacing: '-0.2px' }}>
          {imovel.tipo} — {imovel.bairro}
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
          📍 {imovel.cidade}
        </p>

        {/* Specs */}
        {(imovel.areaTotal || imovel.quartos || imovel.vagas) && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
            {imovel.areaTotal && <Spec>{imovel.areaTotal}m²</Spec>}
            {imovel.quartos && <Spec>🛏 {imovel.quartos} qt.</Spec>}
            {imovel.vagas && <Spec>🚗 {imovel.vagas} vg.</Spec>}
            {imovel.financiamento && <Spec>🏦 Financiável</Spec>}
          </div>
        )}

        {/* Preço */}
        <div style={{ marginBottom: 12 }}>
          {imovel.desconto && imovel.desconto > 0 ? (
            <>
              {/* Valor original cortado */}
              <p style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'line-through', marginBottom: 1 }}>
                De {formatBRL(imovel.preco / (1 - imovel.desconto / 100))}
              </p>
              {/* Preço com desconto */}
              <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--brand)', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                {formatBRL(imovel.preco)}
              </p>
              {/* Economia */}
              <p style={{
                fontSize: 12, fontWeight: 700, color: 'var(--green)',
                background: 'var(--green-bg)', display: 'inline-block',
                padding: '2px 8px', borderRadius: 6, marginTop: 4,
              }}>
                Economia de {formatBRL(imovel.preco / (1 - imovel.desconto / 100) - imovel.preco)} ({formatPct(imovel.desconto)})
              </p>
            </>
          ) : (
            <>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 2 }}>
                Valor
              </p>
              <p style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>
                {formatBRL(imovel.preco)}
              </p>
            </>
          )}
        </div>

        {/* Score */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <span style={{
            background: score.bg, color: score.color,
            fontSize: 11, fontWeight: 700,
            padding: '4px 10px', borderRadius: 20,
          }}>
            {score.label} {imovel.score.toFixed(0)}
          </span>
        </div>

        {/* Botões */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => onAnalise(imovel)}
            style={{
              flex: 1, padding: '11px 0', borderRadius: 10,
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              color: 'white', border: 'none', fontWeight: 700,
              fontSize: 13, cursor: 'pointer', letterSpacing: '0.01em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
            Analisar com IA
          </button>
          {imovel.link && (
            <a
              href={imovel.link} target="_blank" rel="noopener noreferrer"
              style={{
                padding: '11px 14px', borderRadius: 10,
                border: '1px solid var(--border)', color: 'var(--text-secondary)',
                fontSize: 14, fontWeight: 700, textDecoration: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--white)',
              }}
              title="Ver no site da CEF"
            >
              ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24"
      fill={filled ? '#F04E37' : 'none'}
      stroke={filled ? '#F04E37' : '#6B7280'}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transition: 'fill 0.2s, stroke 0.2s' }}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function Spec({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)',
      background: 'var(--bg)', padding: '3px 8px', borderRadius: 6,
    }}>
      {children}
    </span>
  );
}
