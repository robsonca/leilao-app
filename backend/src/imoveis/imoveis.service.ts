import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

export interface FilterImoveisDto {
  cidade?: string;
  tipo?: string;
  modalidade?: string;
  financiamento?: string;
  precoMin?: number;
  precoMax?: number;
  page?: number;
  limit?: number;
  orderBy?: 'preco_asc' | 'preco_desc' | 'desconto_desc' | 'cidade_asc';
}

@Injectable()
export class ImoveisService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: FilterImoveisDto = {}) {
    const {
      cidade,
      tipo,
      modalidade,
      financiamento,
      precoMin,
      precoMax,
      page = 1,
      limit = 15,
      orderBy = 'desconto_desc',
    } = filters;

    const where: Prisma.ImovelWhereInput = {
      ...(cidade && { cidade: { contains: cidade, mode: 'insensitive' } }),
      ...(tipo && { tipo: { contains: tipo, mode: 'insensitive' } }),
      ...(modalidade && { modalidade: { contains: modalidade, mode: 'insensitive' } }),
      ...(financiamento !== undefined && financiamento !== '' && {
        financiamento: financiamento === 'true',
      }),
      ...((precoMin || precoMax) && {
        preco: {
          ...(precoMin && { gte: Number(precoMin) }),
          ...(precoMax && { lte: Number(precoMax) }),
        },
      }),
    };

    const orderMap: Record<string, Prisma.ImovelOrderByWithRelationInput> = {
      preco_asc: { preco: 'asc' },
      preco_desc: { preco: 'desc' },
      desconto_desc: { desconto: { sort: 'desc', nulls: 'last' } },
      cidade_asc: { cidade: 'asc' },
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.imovel.findMany({
        where,
        orderBy: orderMap[orderBy] ?? { desconto: { sort: 'desc', nulls: 'last' } },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      this.prisma.imovel.count({ where }),
    ]);

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  async findOne(id: number) {
    return this.prisma.imovel.findUnique({ where: { id } });
  }

  async getKpis(filters: Omit<FilterImoveisDto, 'page' | 'limit' | 'orderBy'> = {}) {
    const { cidade, tipo, modalidade, financiamento, precoMin, precoMax } = filters;

    const where: Prisma.ImovelWhereInput = {
      ...(cidade && { cidade: { contains: cidade, mode: 'insensitive' } }),
      ...(tipo && { tipo: { contains: tipo, mode: 'insensitive' } }),
      ...(modalidade && { modalidade: { contains: modalidade, mode: 'insensitive' } }),
      ...(financiamento !== undefined && financiamento !== '' && {
        financiamento: financiamento === 'true',
      }),
      ...((precoMin || precoMax) && {
        preco: {
          ...(precoMin && { gte: Number(precoMin) }),
          ...(precoMax && { lte: Number(precoMax) }),
        },
      }),
    };

    const [aggregate, total, comFinanciamento, porTipo, porModalidade] =
      await this.prisma.$transaction([
        this.prisma.imovel.aggregate({
          where,
          _avg: { preco: true, desconto: true },
          _max: { desconto: true },
          _min: { preco: true },
        }),
        this.prisma.imovel.count({ where }),
        this.prisma.imovel.count({ where: { ...where, financiamento: true } }),
        this.prisma.imovel.groupBy({
          by: ['tipo'],
          where,
          _count: { _all: true },
          orderBy: { _count: { tipo: 'desc' } },
        }),
        this.prisma.imovel.groupBy({
          by: ['modalidade'],
          where,
          _count: { _all: true },
          orderBy: { _count: { modalidade: 'desc' } },
        }),
      ]);

    const cidades = await this.prisma.imovel.findMany({
      where,
      select: { cidade: true },
      distinct: ['cidade'],
    });

    return {
      total,
      precoMedio: aggregate._avg.preco ?? 0,
      descontoMedio: aggregate._avg.desconto ?? 0,
      maiorDesconto: aggregate._max.desconto ?? 0,
      comFinanciamento,
      totalCidades: cidades.length,
      porTipo: porTipo.map((t) => ({ tipo: t.tipo, count: (t._count as { _all: number })._all })),
      porModalidade: porModalidade.map((m) => ({
        modalidade: m.modalidade,
        count: (m._count as { _all: number })._all,
      })),
    };
  }

  async getInsights() {
    const [aggregate, comFinanciamento, topVolume, topDesconto, porTipo, porModalidade] =
      await this.prisma.$transaction([
        this.prisma.imovel.aggregate({
          _count: { _all: true },
          _avg: { preco: true, desconto: true },
        }),
        this.prisma.imovel.count({ where: { financiamento: true } }),
        this.prisma.imovel.groupBy({
          by: ['cidade'],
          _count: { _all: true },
          orderBy: { _count: { cidade: 'desc' } },
          take: 10,
        }),
        this.prisma.imovel.groupBy({
          by: ['cidade'],
          where: { desconto: { gt: 0 } },
          _avg: { desconto: true },
          _count: { _all: true },
          orderBy: { _avg: { desconto: 'desc' } },
          take: 10,
        }),
        this.prisma.imovel.groupBy({
          by: ['tipo'],
          _count: { _all: true },
          orderBy: { _count: { tipo: 'desc' } },
        }),
        this.prisma.imovel.groupBy({
          by: ['modalidade'],
          _count: { _all: true },
          orderBy: { _count: { modalidade: 'desc' } },
        }),
      ]);

    const totalCidades = await this.prisma.imovel.findMany({
      select: { cidade: true },
      distinct: ['cidade'],
    });

    return {
      totais: {
        total: (aggregate._count as { _all: number })._all,
        precoMedio: aggregate._avg.preco ?? 0,
        descontoMedio: aggregate._avg.desconto ?? 0,
        comFinanciamento,
        totalCidades: totalCidades.length,
      },
      topCidadesPorVolume: topVolume.map((c) => ({
        cidade: c.cidade,
        count: (c._count as { _all: number })._all,
      })),
      topCidadesPorDesconto: topDesconto.map((c) => ({
        cidade: c.cidade,
        count: (c._count as { _all: number })._all,
        descontoMedio: c._avg?.desconto ?? 0,
      })),
      porTipo: porTipo.map((t) => ({
        tipo: t.tipo,
        count: (t._count as { _all: number })._all,
      })),
      porModalidade: porModalidade.map((m) => ({
        modalidade: m.modalidade,
        count: (m._count as { _all: number })._all,
      })),
    };
  }

  async getCidades(): Promise<string[]> {
    const result = await this.prisma.imovel.findMany({
      select: { cidade: true },
      distinct: ['cidade'],
      orderBy: { cidade: 'asc' },
    });
    return result.map((r) => r.cidade);
  }

  async checkDisponivel(numero: string): Promise<{ disponivel: boolean }> {
    const photoUrl = `https://venda-imoveis.caixa.gov.br/fotos/F${numero.replace(/-/g, '')}21.jpg`;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(photoUrl, {
        method: 'HEAD',
        signal: controller.signal,
      });
      clearTimeout(timer);
      return { disponivel: response.ok };
    } catch {
      return { disponivel: true };
    }
  }
}
