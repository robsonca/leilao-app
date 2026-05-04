'use client';

import { useRef, useState } from 'react';
import { uploadCsv } from '../../lib/api';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  geminiKey: string;
  onGeminiKeyChange: (key: string) => void;
}

export default function Sidebar({ open, onClose, geminiKey, onGeminiKeyChange }: SidebarProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [csvStatus, setCsvStatus] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [keyDraft, setKeyDraft] = useState(geminiKey);

  async function handleFile(file: File) {
    setUploading(true);
    setCsvStatus(null);
    try {
      const res = await uploadCsv(file);
      setCsvStatus({ type: 'ok', msg: `${res.upserted} imóveis atualizados` });
    } catch {
      setCsvStatus({ type: 'err', msg: 'Erro ao processar CSV' });
    } finally {
      setUploading(false);
    }
  }

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
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 320,
        background: 'var(--white)', borderLeft: '1px solid var(--border)',
        zIndex: 201, display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(.4,0,.2,1)',
        boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{
          padding: '18px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>⚙️ Configurações</span>
          <button onClick={onClose} style={{
            background: 'none', border: '1px solid var(--border)',
            borderRadius: 8, width: 30, height: 30, cursor: 'pointer',
            fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Upload CSV */}
          <section>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 12 }}>
              Atualizar dados
            </p>
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              style={{
                border: '2px dashed var(--border)', borderRadius: 10,
                padding: '24px 16px', textAlign: 'center', cursor: 'pointer',
                marginBottom: 12, transition: 'border-color 0.2s',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>📂</div>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Arraste o CSV aqui</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>ou clique para selecionar</p>
            </div>
            <input ref={fileRef} type="file" accept=".csv" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

            {uploading && <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>Processando…</p>}
            {csvStatus && (
              <p style={{
                fontSize: 13, fontWeight: 600, padding: '8px 12px', borderRadius: 8, textAlign: 'center',
                background: csvStatus.type === 'ok' ? 'var(--green-bg)' : 'var(--red-bg)',
                color: csvStatus.type === 'ok' ? 'var(--green)' : 'var(--red)',
              }}>
                {csvStatus.msg}
              </p>
            )}
          </section>

          {/* Gemini API Key */}
          <section>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 12 }}>
              Análise com IA (Gemini)
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.6 }}>
              Necessário para análise individual dos imóveis. Obtenha sua chave em{' '}
              <a href="https://aistudio.google.com" target="_blank" rel="noopener" style={{ color: 'var(--brand)' }}>
                aistudio.google.com
              </a>
            </p>
            <input
              type="password"
              value={keyDraft}
              onChange={(e) => setKeyDraft(e.target.value)}
              placeholder="AIza..."
              style={{
                width: '100%', padding: '9px 12px', borderRadius: 8,
                border: '1px solid var(--border)', fontSize: 13,
                fontFamily: 'monospace', outline: 'none', marginBottom: 10,
              }}
            />
            <button
              onClick={() => onGeminiKeyChange(keyDraft)}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 8,
                background: 'var(--brand)', color: 'white', border: 'none',
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}
            >
              Salvar chave
            </button>
            {geminiKey && (
              <p style={{ marginTop: 10, fontSize: 12, color: 'var(--green)', fontWeight: 600, textAlign: 'center' }}>
                ✓ Chave configurada
              </p>
            )}
          </section>
        </div>
      </aside>
    </>
  );
}
