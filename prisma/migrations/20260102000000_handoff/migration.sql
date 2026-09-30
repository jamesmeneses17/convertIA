-- ConvertIA :: buzon del puente con Claude Escritorio (MCP)
-- CreateTable
CREATE TABLE "handoffs" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "html" TEXT,
    "css" TEXT,
    "js" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pendiente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deliveredAt" TIMESTAMP(3),

    CONSTRAINT "handoffs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "handoffs_code_key" ON "handoffs"("code");

-- CreateIndex
CREATE INDEX "handoffs_status_createdAt_idx" ON "handoffs"("status", "createdAt");
