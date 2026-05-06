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
  const [imgSrc, setImgSrc] = useState<'cef' | 'streetview' | 'none'>('cef');
  const [imgLoaded, setImgLoaded] = useState(false);
  const [heartPop, setHeartPop] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const score = SCORE_STYLE[imovel.classificacao];

  function buildShareText() {
    const preco = formatBRL(imovel.preco);
    const desconto = imovel.desconto && imovel.desconto > 0 ? ` (-${formatPct(imovel.desconto)})` : '';
    return `🏠 ${imovel.tipo} em ${imovel.bairro}, ${imovel.cidade}\n💰 ${preco}${desconto}\n📍 ${imovel.endereco}\n🔗 ${imovel.link ?? 'https://venda-imoveis.caixa.gov.br'}`;
  }

  async function handleShare(e: React.MouseEvent) {
    e.stopPropagation();
    const text = buildShareText();
    if (navigator.share) {
      try {
        await navigator.share({ title: `${imovel.tipo} em ${imovel.bairro}`, text });
      } catch { /* usuário cancelou */ }
    } else {
      setShareOpen(v => !v);
    }
  }

  function shareWhatsApp(e: React.MouseEvent) {
    e.stopPropagation();
    window.open(`https://wa.me/?text=${encodeURIComponent(buildShareText())}`, '_blank');
    setShareOpen(false);
  }

  function shareEmail(e: React.MouseEvent) {
    e.stopPropagation();
    const text = buildShareText();
    window.open(`mailto:?subject=${encodeURIComponent(`${imovel.tipo} em ${imovel.bairro}`)}&body=${encodeURIComponent(text)}`, '_blank');
    setShareOpen(false);
  }

  async function copyLink(e: React.MouseEvent) {
    e.stopPropagation();
    await navigator.clipboard.writeText(imovel.link ?? buildShareText());
    setShareOpen(false);
  }

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
          {!imgLoaded && imgSrc !== 'none' && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg,#E5E7EB 25%,#F3F4F6 50%,#E5E7EB 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }} />
          )}
          {imgSrc === 'cef' && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`https://venda-imoveis.caixa.gov.br/fotos/F${imovel.numero.replace(/-/g, '')}21.jpg`}
              alt={`${imovel.tipo} em ${imovel.bairro}`}
              onLoad={() => setImgLoaded(true)}
              onError={() => { setImgSrc('streetview'); setImgLoaded(false); }}
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s' }}
            />
          )}
          {imgSrc === 'streetview' && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={streetViewUrl(imovel, { width: 640, height: 400 })}
              alt={`${imovel.tipo} em ${imovel.bairro}`}
              onLoad={() => setImgLoaded(true)}
              onError={() => { setImgSrc('none'); setImgLoaded(true); }}
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s' }}
            />
          )}
          {imgSrc === 'none' && (
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
        {imgSrc === 'streetview' && imgLoaded && (
          <a
            href={streetViewWebUrl(imovel)}
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
        <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
          <button
            onClick={() => onAnalise(imovel)}
            style={{
              flex: 1, padding: '11px 0', borderRadius: 10,
              background: 'var(--brand)',
              color: 'white', border: 'none', fontWeight: 700,
              fontSize: 13, cursor: 'pointer', letterSpacing: '0.01em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              boxShadow: '0 2px 8px rgba(240,78,55,0.25)',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Análise do Imóvel
          </button>

          {/* Botão compartilhar */}
          <button
            onClick={handleShare}
            title="Compartilhar"
            style={{
              padding: '11px 12px', borderRadius: 10,
              border: '1px solid var(--border)', color: 'var(--text-secondary)',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--white)',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </button>

          {/* Dropdown fallback (desktop) */}
          {shareOpen && (
            <div
              onClick={e => e.stopPropagation()}
              style={{
                position: 'absolute', bottom: 48, right: 0,
                background: 'var(--white)', border: '1px solid var(--border)',
                borderRadius: 12, boxShadow: 'var(--shadow-hover)',
                zIndex: 10, minWidth: 180, overflow: 'hidden',
              }}
            >
              <ShareItem onClick={shareWhatsApp} color="#25D366">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </ShareItem>
              <ShareItem onClick={shareEmail} color="#EA4335">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EA4335" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>
                E-mail
              </ShareItem>
              <ShareItem onClick={copyLink} color="var(--text-secondary)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Copiar link
              </ShareItem>
            </div>
          )}

          {imovel.link && (
            <a
              href={imovel.link} target="_blank" rel="noopener noreferrer"
              style={{
                padding: '11px 12px', borderRadius: 10,
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

function ShareItem({ children, onClick, color }: { children: React.ReactNode; onClick: (e: React.MouseEvent) => void; color: string }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: '10px 14px', background: 'none', border: 'none',
      display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
      fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
      borderBottom: '1px solid var(--border)',
    }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
    >
      <span style={{ color }}>{(children as React.ReactNode[])[0]}</span>
      {(children as React.ReactNode[])[1]}
    </button>
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
