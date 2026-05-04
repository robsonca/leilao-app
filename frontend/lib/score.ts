import type { Imovel, ImovelComScore } from './types';

const MEDIANA = 148667;

const LIQUIDEZ_TIPO: Record<string, number> = {
  Apartamento: 20, Casa: 17, Sobrado: 15,
  Comercial: 10, Loja: 10, Sala: 8, Terreno: 8,
  Prédio: 7, Galpão: 6, Gleba: 4, Outros: 5,
};

const DEMANDA_CIDADE: Record<string, number> = {
  'SÃO PAULO': 100, 'CAMPINAS': 90, 'SANTOS': 88,
  'GUARULHOS': 85, 'SÃO BERNARDO DO CAMPO': 84,
  'SANTO ANDRÉ': 82, 'OSASCO': 80, 'RIBEIRÃO PRETO': 78,
  'SÃO JOSÉ DOS CAMPOS': 76, 'SOROCABA': 74,
  'MAUÁ': 72, 'DIADEMA': 71, 'BAURU': 70,
  'JUNDIAÍ': 69, 'PIRACICABA': 68, 'CARAPICUÍBA': 67,
  'MOGI DAS CRUZES': 66, 'PRAIA GRANDE': 65,
  'ITAQUAQUECETUBA': 65, 'SÃO VICENTE': 65,
};

function pontosPorPreco(preco: number): number {
  const ratio = preco / MEDIANA;
  if (ratio <= 0.5) return 25;
  if (ratio <= 0.75) return 20;
  if (ratio <= 1.0) return 15;
  if (ratio <= 1.5) return 8;
  if (ratio <= 2.5) return 3;
  return 0;
}

export function calcScore(imovel: Imovel): number {
  const desconto = imovel.desconto ?? 0;
  const pontoDesconto = Math.min((desconto / 67) * 35, 35);
  const pontoPreco = pontosPorPreco(imovel.preco);
  const pontoLiquidez = LIQUIDEZ_TIPO[imovel.tipo] ?? 5;
  const pontoFinanciamento = imovel.financiamento ? 10 : 0;

  const cidadeUpper = imovel.cidade.toUpperCase();
  const cidadeScore = DEMANDA_CIDADE[cidadeUpper] ?? 40;
  const pontoCidade = Math.max(((cidadeScore - 40) / 60) * 10, 0);

  return Math.min(100, Math.max(0,
    pontoDesconto + pontoPreco + pontoLiquidez + pontoFinanciamento + pontoCidade,
  ));
}

export function classificar(score: number): 'oportunidade' | 'neutro' | 'cautela' {
  if (score >= 65) return 'oportunidade';
  if (score >= 40) return 'neutro';
  return 'cautela';
}

export function enriquece(imoveis: Imovel[]): ImovelComScore[] {
  return imoveis.map((i) => {
    const score = calcScore(i);
    return { ...i, score, classificacao: classificar(score) };
  });
}
