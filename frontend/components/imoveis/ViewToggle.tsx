'use client';

export type ViewMode = 'grid' | 'table';

interface Props {
  view: ViewMode;
  onChange: (v: ViewMode) => void;
}

export default function ViewToggle({ view, onChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: 4, background: 'var(--border)', padding: 3, borderRadius: 8 }}>
      {(['grid', 'table'] as ViewMode[]).map((v) => (
        <button key={v} onClick={() => onChange(v)} style={{
          padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
          fontSize: 13, fontWeight: 600,
          background: view === v ? 'var(--white)' : 'transparent',
          color: view === v ? 'var(--text-primary)' : 'var(--text-muted)',
          boxShadow: view === v ? 'var(--shadow-sm)' : 'none',
          transition: 'all 0.15s',
        }}>
          {v === 'grid' ? '⊞ Cards' : '☰ Tabela'}
        </button>
      ))}
    </div>
  );
}
