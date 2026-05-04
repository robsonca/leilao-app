import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse';
import { Readable } from 'stream';

type CsvRow = Record<string, string>;

function parseBRNumber(value: string): number {
  if (!value) return 0;
  // Formato BR: 347.736,30 → remove pontos (milhar), troca vírgula por ponto (decimal)
  return parseFloat(value.trim().replace(/\./g, '').replace(',', '.')) || 0;
}

function parsePorcentagem(value: string): number | null {
  if (!value || value.trim() === '' || value.trim() === '0' || value.trim() === '0.00') return null;
  const v = value.trim();
  // CEF usa ponto como decimal no desconto: "48.10" → 48.10
  if (!v.includes(',') && v.includes('.')) return parseFloat(v) || null;
  return parseBRNumber(v) || null;
}

function parseDescricao(text: string): { areaTotal: number | null; quartos: number | null; vagas: number | null } {
  if (!text) return { areaTotal: null, quartos: null, vagas: null };

  const allAreaMatches = [...text.matchAll(/(\d+[\.,]?\d*)\s*de\s+[áa]rea/gi)];
  const areaMatch = allAreaMatches.find(m => parseFloat(m[1].replace(',', '.')) > 0) ?? null;
  const quartosMatch = text.match(/(\d+)\s*qto/i);
  const vagasMatch = text.match(/(\d+)\s*vaga/i);

  return {
    areaTotal: areaMatch ? (parseFloat(areaMatch[1].replace(',', '.')) || null) : null,
    quartos: quartosMatch ? parseInt(quartosMatch[1]) : null,
    vagas: vagasMatch ? parseInt(vagasMatch[1]) : null,
  };
}

function detectFromLine(buffer: Buffer): number {
  const text = buffer.toString('latin1');
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const line = lines[i];
    // Linha de cabeçalho contém "N" + "im" (N° do imóvel) e ponto-e-vírgula
    if (line.includes(';') && /N.{0,5}im/i.test(line)) {
      return i + 1; // csv-parse usa índice 1-based
    }
  }
  return 4; // fallback padrão CEF
}

function getField(row: CsvRow, ...keys: string[]): string {
  for (const key of keys) {
    const normalizedKey = Object.keys(row).find(
      k => k.toLowerCase().replace(/[^a-z0-9]/g, '').includes(key.toLowerCase().replace(/[^a-z0-9]/g, ''))
    );
    if (normalizedKey && row[normalizedKey]?.trim()) return row[normalizedKey].trim();
  }
  return '';
}

function parseCsvBuffer(buffer: Buffer): Promise<CsvRow[]> {
  return new Promise((resolve, reject) => {
    const fromLine = detectFromLine(buffer);
    // Decodifica como latin1 para preservar acentos do CEF
    const text = buffer.toString('latin1');
    const rows: CsvRow[] = [];

    Readable.from(text)
      .pipe(parse({
        delimiter: ';',
        columns: true,
        skip_empty_lines: true,
        trim: true,
        from_line: fromLine,
        relax_column_count: true,
        bom: true,
      }))
      .on('data', (row: CsvRow) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

@Injectable()
export class ImovelSyncService {
  private readonly logger = new Logger(ImovelSyncService.name);

  constructor(private prisma: PrismaService) {}

  async syncFromCef(): Promise<{ upserted: number; errors: number }> {
    const CEF_URL = 'https://venda-imoveis.caixa.gov.br/listaweb/Lista_imoveis_SP.csv';
    this.logger.log(`Baixando CSV da CEF: ${CEF_URL}`);

    const response = await fetch(CEF_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9',
        'Referer': 'https://venda-imoveis.caixa.gov.br/',
      },
    });
    if (!response.ok) throw new Error(`Falha ao baixar CSV: ${response.status}`);

    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('text/html')) {
      throw new Error('CEF retornou HTML em vez de CSV — possível CAPTCHA');
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    await this.saveToStorage(buffer);
    return this.processBuffer(buffer);
  }

  async syncFromStorage(): Promise<{ upserted: number; errors: number }> {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
    );

    this.logger.log('Baixando CSV do Supabase Storage');
    const { data, error } = await supabase.storage
      .from('csvs')
      .download('imoveis-latest.csv');

    if (error) throw new Error(`Erro ao baixar do Storage: ${error.message}`);

    const buffer = Buffer.from(await data.arrayBuffer());
    return this.processBuffer(buffer);
  }

  private async saveToStorage(buffer: Buffer): Promise<void> {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    if (!supabaseUrl || !supabaseKey) return;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const date = new Date().toISOString().split('T')[0];

    await supabase.storage.from('csvs').upload('imoveis-latest.csv', buffer, { upsert: true, contentType: 'text/csv' });
    await supabase.storage.from('csvs').upload(`imoveis-${date}.csv`, buffer, { upsert: true, contentType: 'text/csv' });
    this.logger.log(`CSV salvo no Storage: imoveis-${date}.csv`);
  }

  private async processBuffer(buffer: Buffer): Promise<{ upserted: number; errors: number }> {
    const rows = await parseCsvBuffer(buffer);
    this.logger.log(`Processando ${rows.length} imóveis — colunas: ${Object.keys(rows[0] ?? {}).join(' | ')}`);

    let upserted = 0;
    let errors = 0;

    for (const row of rows) {
      try {
        const numero = getField(row, 'Nimóvel', 'N°doimóvel', 'Ndoimóvel', 'numero', 'imovel');
        if (!numero || numero.length < 3) continue;

        const cidade   = getField(row, 'Cidade', 'cidade');
        const endereco = getField(row, 'Endereço', 'Endereco', 'endereco');
        const descricaoRaw = getField(row, 'Descrição', 'Descricao', 'descricao');
        // CEF encodes tipo as first segment of Descrição: "Apartamento, 0.00 de área total, ..."
        const tipoFromField = getField(row, 'Tipo', 'tipo');
        const [tipoFromDesc, ...descParts] = descricaoRaw.split(',');
        const tipo = tipoFromField || (tipoFromDesc ? tipoFromDesc.trim() : '');
        const descricao = tipoFromField ? descricaoRaw : descParts.join(',').trim();
        const modalidade = getField(row, 'Modalidade', 'modalidadedevenda');
        const link     = getField(row, 'Link', 'linkdeacesso');
        const financiamentoStr = getField(row, 'Financiamento', 'financiamento', 'FGTS');
        const precoStr  = getField(row, 'Preço', 'Preco', 'preco', 'valor');
        const descontoStr = getField(row, 'Desconto', 'desconto');

        // Bairro: campo próprio ou última parte do endereço
        const bairroRaw = getField(row, 'Bairro', 'bairro');
        const bairro = bairroRaw || (endereco.includes(',')
          ? endereco.split(',').pop()!.trim()
          : '');

        const preco = parseBRNumber(precoStr);
        if (!preco) continue; // linha inválida sem preço

        const desconto = parsePorcentagem(descontoStr);
        const financiamento = financiamentoStr.toLowerCase().includes('sim');
        const { areaTotal, quartos, vagas } = parseDescricao(descricao);

        await this.prisma.imovel.upsert({
          where: { numero },
          update: { cidade, bairro, endereco, tipo, descricao: descricao || null, preco, desconto, financiamento, modalidade, link: link || null, areaTotal, quartos, vagas },
          create: { numero, cidade, bairro, endereco, tipo, descricao: descricao || null, preco, desconto, financiamento, modalidade, link: link || null, areaTotal, quartos, vagas },
        });

        upserted++;
      } catch {
        errors++;
      }
    }

    this.logger.log(`Sync concluído: ${upserted} upserted, ${errors} erros`);
    return { upserted, errors };
  }

  async syncFromUpload(buffer: Buffer): Promise<{ upserted: number; errors: number }> {
    await this.saveToStorage(buffer);
    return this.processBuffer(buffer);
  }
}
