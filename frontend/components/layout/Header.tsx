'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  total?: number;
  onMenuClick: () => void;
  favCount?: number;
}

export default function Header({ total = 0, onMenuClick, favCount = 0 }: HeaderProps) {
  const pathname = usePathname();
  const onFavPage = pathname === '/favoritos';

  return (
    <header style={{
      background: 'var(--white)',
      borderBottom: '1px solid var(--border)',
      padding: '0 16px',
      height: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36, height: 36,
          background: 'var(--brand)',
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18,
        }}>
          🏠
        </div>
        <div>
          <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.3px' }}>BR Leilões</span>
          <span style={{
            marginLeft: 8,
            background: 'var(--brand-light)',
            color: 'var(--brand)',
            fontSize: 11, fontWeight: 700,
            padding: '2px 8px', borderRadius: 20,
          }}>
            🔴 Imóveis SP
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {total > 0 && (
          <span className="header-total">
            <strong style={{ color: 'var(--brand)' }}>{total.toLocaleString('pt-BR')}</strong> imóveis
          </span>
        )}

        {/* Botão favoritos */}
        <Link href="/favoritos" style={{
          position: 'relative',
          background: onFavPage ? 'var(--brand-light)' : 'none',
          border: `1px solid ${onFavPage ? 'var(--brand)' : 'var(--border)'}`,
          borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
          textDecoration: 'none',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24"
            fill={favCount > 0 ? '#F04E37' : 'none'}
            stroke={favCount > 0 ? '#F04E37' : '#6B7280'}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {favCount > 0 && (
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand)' }}>
              {favCount}
            </span>
          )}
        </Link>

        <button
          onClick={onMenuClick}
          aria-label="Abrir menu"
          style={{
            background: 'none', border: '1px solid var(--border)',
            borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', gap: 4,
          }}
        >
          {[0, 1, 2].map(i => (
            <span key={i} style={{ display: 'block', width: 18, height: 2, background: 'var(--text-primary)', borderRadius: 2 }} />
          ))}
        </button>
      </div>
    </header>
  );
}
