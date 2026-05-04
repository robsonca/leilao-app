-- DropTable (old schema)
DROP TABLE IF EXISTS "Imovel";

-- CreateTable
CREATE TABLE "Imovel" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT,
    "preco" DOUBLE PRECISION NOT NULL,
    "desconto" DOUBLE PRECISION,
    "financiamento" BOOLEAN NOT NULL DEFAULT false,
    "modalidade" TEXT NOT NULL,
    "link" TEXT,
    "areaTotal" DOUBLE PRECISION,
    "quartos" INTEGER,
    "vagas" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Imovel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Imovel_numero_key" ON "Imovel"("numero");
