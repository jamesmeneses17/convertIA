-- ConvertIA :: encargos de dos tipos (landing y prompt)
ALTER TABLE "handoffs" ADD COLUMN "tipo" TEXT NOT NULL DEFAULT 'landing';
ALTER TABLE "handoffs" ADD COLUMN "resultado" TEXT;

-- CreateIndex
CREATE INDEX "handoffs_tipo_status_idx" ON "handoffs"("tipo", "status");
