-- CreateTable
CREATE TABLE "Imovel" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "desconto" DOUBLE PRECISION,
    "tipo" TEXT NOT NULL,
    "modalidade" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Imovel_pkey" PRIMARY KEY ("id")
);
