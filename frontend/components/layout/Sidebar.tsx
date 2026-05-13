'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  geminiKey?: string;
  onGeminiKeyChange?: (key: string) => void;
}

const NAV = [
  {
    label: 'Imóveis Vendidos',
    href: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
        <path d="M9 7l3-3 3 3"/>
        <polyline points="8 12 12 8 16 12"/>
      </svg>
    ),
    badge: 'Em breve',
  },
  {
    label: 'Criar Alerta',
    href: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        <line x1="12" y1="2" x2="12" y2="3"/>
      </svg>
    ),
    badge: 'Em breve',
  },
  {
    label: 'Login',
    href: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
        <polyline points="10 17 15 12 10 7"/>
        <line x1="15" y1="12" x2="3" y2="12"/>
      </svg>
    ),
    badge: 'Em breve',
  },
  {
    label: 'Onde Investir',
    href: '/regioes',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
      </svg>
    ),
    badge: null,
  },
  {
    label: 'Calculadora',
    href: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/>
        <line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/><line x1="8" y1="18" x2="12" y2="18"/>
      </svg>
    ),
    badge: 'Em breve',
  },
  {
    label: 'Favoritos',
    href: '/favoritos',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    badge: null,
  },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)', zIndex: 200,
          }}
        />
      )}

      <aside style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 280,
        background: 'var(--white)', borderLeft: '1px solid var(--border)',
        zIndex: 201, display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(.4,0,.2,1)',
        boxShadow: 'var(--shadow-md)',
      }}>

        {/* Header */}
        <div style={{
          padding: '18px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo.png" alt="Arrematou" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '0.5px' }}>ARREMATOU</span>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: '1px solid var(--border)',
            borderRadius: 8, width: 30, height: 30, cursor: 'pointer',
            fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 12px' }}>
          {NAV.map(item => {
            const active = item.href ? pathname === item.href : false;
            const inner = (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '13px 16px', borderRadius: 10,
                background: active ? 'var(--brand-light)' : 'transparent',
                color: active ? 'var(--brand)' : item.badge ? 'var(--text-muted)' : 'var(--text-primary)',
                cursor: item.href ? 'pointer' : 'default',
                transition: 'background 0.15s',
              }}>
                <span style={{ color: active ? 'var(--brand)' : item.badge ? 'var(--text-muted)' : 'var(--text-secondary)', flexShrink: 0 }}>
                  {item.icon}
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                    background: 'var(--bg)', color: 'var(--text-muted)',
                    border: '1px solid var(--border)',
                  }}>
                    {item.badge}
                  </span>
                )}
              </div>
            );

            if (item.href) {
              return (
                <Link key={item.label} href={item.href} onClick={onClose} style={{ textDecoration: 'none', display: 'block' }}>
                  {inner}
                </Link>
              );
            }
            return <div key={item.label}>{inner}</div>;
          })}
        </nav>
      </aside>
    </>
  );
}
