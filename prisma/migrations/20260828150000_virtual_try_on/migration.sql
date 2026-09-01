-- Virtual Try-On MVP

ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "virtualTryOnEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "aiCredits" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "tryOnEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "tryOnCategory" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "tryOnPhotoType" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "tryOnGarmentImageKey" TEXT;

CREATE TYPE "TryOnJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
CREATE TYPE "AiCreditTransactionType" AS ENUM ('ADMIN_ADD', 'ADMIN_REMOVE', 'TRY_ON_USE', 'TRY_ON_REFUND');
CREATE TYPE "TryOnAnalyticsEventType" AS ENUM ('TRY_ON_OPENED', 'TRY_ON_STARTED', 'TRY_ON_COMPLETED', 'TRY_ON_FAILED', 'ORDER_STARTED_AFTER_TRY_ON', 'ORDER_CREATED_AFTER_TRY_ON');

CREATE TABLE "TryOnJob" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "visitorSessionId" TEXT,
    "orderId" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'fal-fashn-v1.6',
    "providerRequestId" TEXT,
    "personImageKey" TEXT NOT NULL,
    "resultImageKey" TEXT,
    "status" "TryOnJobStatus" NOT NULL DEFAULT 'PENDING',
    "creditConsumed" BOOLEAN NOT NULL DEFAULT false,
    "creditRefunded" BOOLEAN NOT NULL DEFAULT false,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "idempotencyKey" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "personImageDeletedAt" TIMESTAMP(3),
    "resultImageDeletedAt" TIMESTAMP(3),

    CONSTRAINT "TryOnJob_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TryOnJob_idempotencyKey_key" ON "TryOnJob"("idempotencyKey");
CREATE INDEX "TryOnJob_shopId_createdAt_idx" ON "TryOnJob"("shopId", "createdAt");
CREATE INDEX "TryOnJob_shopId_status_idx" ON "TryOnJob"("shopId", "status");
CREATE INDEX "TryOnJob_productId_idx" ON "TryOnJob"("productId");
CREATE INDEX "TryOnJob_visitorSessionId_productId_status_idx" ON "TryOnJob"("visitorSessionId", "productId", "status");
CREATE INDEX "TryOnJob_providerRequestId_idx" ON "TryOnJob"("providerRequestId");
CREATE INDEX "TryOnJob_status_createdAt_idx" ON "TryOnJob"("status", "createdAt");

CREATE TABLE "AiCreditTransaction" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "tryOnJobId" TEXT,
    "amount" INTEGER NOT NULL,
    "type" "AiCreditTransactionType" NOT NULL,
    "note" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiCreditTransaction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AiCreditTransaction_shopId_createdAt_idx" ON "AiCreditTransaction"("shopId", "createdAt");
CREATE INDEX "AiCreditTransaction_tryOnJobId_idx" ON "AiCreditTransaction"("tryOnJobId");
CREATE UNIQUE INDEX "AiCreditTransaction_tryOnJobId_use_key" ON "AiCreditTransaction"("tryOnJobId") WHERE "type" = 'TRY_ON_USE' AND "tryOnJobId" IS NOT NULL;
CREATE UNIQUE INDEX "AiCreditTransaction_tryOnJobId_refund_key" ON "AiCreditTransaction"("tryOnJobId") WHERE "type" = 'TRY_ON_REFUND' AND "tryOnJobId" IS NOT NULL;

CREATE TABLE "TryOnAnalyticsEvent" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "productId" TEXT,
    "tryOnJobId" TEXT,
    "visitorSessionId" TEXT,
    "orderId" TEXT,
    "type" "TryOnAnalyticsEventType" NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TryOnAnalyticsEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TryOnAnalyticsEvent_shopId_type_createdAt_idx" ON "TryOnAnalyticsEvent"("shopId", "type", "createdAt");
CREATE INDEX "TryOnAnalyticsEvent_tryOnJobId_idx" ON "TryOnAnalyticsEvent"("tryOnJobId");
CREATE INDEX "TryOnAnalyticsEvent_visitorSessionId_idx" ON "TryOnAnalyticsEvent"("visitorSessionId");

ALTER TABLE "TryOnJob" ADD CONSTRAINT "TryOnJob_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TryOnJob" ADD CONSTRAINT "TryOnJob_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TryOnJob" ADD CONSTRAINT "TryOnJob_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AiCreditTransaction" ADD CONSTRAINT "AiCreditTransaction_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiCreditTransaction" ADD CONSTRAINT "AiCreditTransaction_tryOnJobId_fkey" FOREIGN KEY ("tryOnJobId") REFERENCES "TryOnJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TryOnAnalyticsEvent" ADD CONSTRAINT "TryOnAnalyticsEvent_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TryOnAnalyticsEvent" ADD CONSTRAINT "TryOnAnalyticsEvent_tryOnJobId_fkey" FOREIGN KEY ("tryOnJobId") REFERENCES "TryOnJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;
