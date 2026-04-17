-- CreateEnum
CREATE TYPE "AiMemoryType" AS ENUM ('SUMMARY', 'RISK', 'PREFERENCE', 'PATTERN');

-- CreateEnum
CREATE TYPE "AiFeedbackSignalType" AS ENUM ('USEFUL', 'NOT_USEFUL', 'INCORRECT', 'TOO_GENERIC', 'TOO_TECHNICAL', 'MISSED_RISK');

-- CreateEnum
CREATE TYPE "AiPersonaEvalType" AS ENUM ('DOMAIN_UNDERSTANDING', 'DOCUMENT_READING', 'TONE', 'PERMISSION_PERSONA', 'ACTION_QUALITY');

-- CreateEnum
CREATE TYPE "AiPersonaEvalStatus" AS ENUM ('PERSONA_PASSED', 'PERSONA_FAILED', 'PERSONA_REVIEW');

-- CreateTable
CREATE TABLE "AiPersonalityProfile" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "tenantId" TEXT,
    "roleSimulated" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    "vocabularyJson" JSONB,
    "prohibitedPhrasesJson" JSONB,
    "reasoningStyle" TEXT,
    "outputStyle" TEXT,
    "escalationRulesJson" JSONB,
    "confidenceRulesJson" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiPersonalityProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiGlossaryTerm" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "domain" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "shortDefinition" TEXT NOT NULL,
    "longDefinition" TEXT,
    "synonymsJson" JSONB,
    "relatedEntitiesJson" JSONB,
    "businessLanguage" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiGlossaryTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiOntologyRelation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "sourceType" TEXT NOT NULL,
    "relationType" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiOntologyRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiContextPack" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "packType" TEXT NOT NULL,
    "summaryJson" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiContextPack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiDocumentReadingProfile" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "fieldsExpectedJson" JSONB,
    "ambiguityRulesJson" JSONB,
    "inconsistencyRulesJson" JSONB,
    "outputTemplateJson" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiDocumentReadingProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiEntityMemory" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "memoryType" "AiMemoryType" NOT NULL,
    "content" TEXT NOT NULL,
    "confidenceScore" INTEGER,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiEntityMemory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiFeedbackSignal" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conversationId" TEXT,
    "messageId" TEXT,
    "signalType" "AiFeedbackSignalType" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiFeedbackSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiPersonaEval" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "evalType" "AiPersonaEvalType" NOT NULL,
    "inputJson" JSONB,
    "expectedJson" JSONB,
    "actualJson" JSONB,
    "score" INTEGER,
    "status" "AiPersonaEvalStatus" NOT NULL DEFAULT 'PERSONA_REVIEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evaluatedAt" TIMESTAMP(3),

    CONSTRAINT "AiPersonaEval_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiPersonalityProfile_agentId_idx" ON "AiPersonalityProfile"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "AiPersonalityProfile_agentId_tenantId_key" ON "AiPersonalityProfile"("agentId", "tenantId");

-- CreateIndex
CREATE INDEX "AiGlossaryTerm_domain_idx" ON "AiGlossaryTerm"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "AiGlossaryTerm_domain_term_tenantId_key" ON "AiGlossaryTerm"("domain", "term", "tenantId");

-- CreateIndex
CREATE INDEX "AiOntologyRelation_sourceType_idx" ON "AiOntologyRelation"("sourceType");

-- CreateIndex
CREATE INDEX "AiOntologyRelation_targetType_idx" ON "AiOntologyRelation"("targetType");

-- CreateIndex
CREATE INDEX "AiContextPack_tenantId_agentId_packType_idx" ON "AiContextPack"("tenantId", "agentId", "packType");

-- CreateIndex
CREATE UNIQUE INDEX "AiDocumentReadingProfile_agentId_documentType_key" ON "AiDocumentReadingProfile"("agentId", "documentType");

-- CreateIndex
CREATE INDEX "AiEntityMemory_tenantId_agentId_idx" ON "AiEntityMemory"("tenantId", "agentId");

-- CreateIndex
CREATE INDEX "AiEntityMemory_entityType_entityId_idx" ON "AiEntityMemory"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AiFeedbackSignal_tenantId_agentId_idx" ON "AiFeedbackSignal"("tenantId", "agentId");

-- CreateIndex
CREATE INDEX "AiPersonaEval_agentId_idx" ON "AiPersonaEval"("agentId");
