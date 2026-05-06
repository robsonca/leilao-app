export interface Imovel {
  id: number;
  numero: string;
  cidade: string;
  bairro: string;
  endereco: string;
  tipo: string;
  descricao: string | null;
  preco: number;
  desconto: number | null;
  financiamento: boolean;
  modalidade: string;
  link: string | null;
  areaTotal: number | null;
  quartos: number | null;
  vagas: number | null;
  criadoEm: string;
}

export interface ImovelComScore extends Imovel {
  score: number;
  classificacao: 'oportunidade' | 'neutro' | 'cautela';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface KpiData {
  total: number;
  precoMedio: number;
  descontoMedio: number;
  maiorDesconto: number;
  comFinanciamento: number;
  totalCidades: number;
  porTipo: { tipo: string; count: number }[];
  porModalidade: { modalidade: string; count: number }[];
}

export interface Insights {
  totais: {
    total: number;
    precoMedio: number;
    descontoMedio: number;
    comFinanciamento: number;
    totalCidades: number;
  };
  topCidadesPorVolume: { cidade: string; count: number }[];
  topCidadesPorDesconto: { cidade: string; count: number; descontoMedio: number }[];
  porTipo: { tipo: string; count: number }[];
  porModalidade: { modalidade: string; count: number }[];
}

export interface FilterState {
  cidade: string;
  tipo: string;
  modalidade: string;
  financiamento: string;
  precoMin: string;
  precoMax: string;
  page: number;
  limit: number;
  orderBy: 'preco_asc' | 'preco_desc' | 'desconto_desc' | 'cidade_asc';
}
