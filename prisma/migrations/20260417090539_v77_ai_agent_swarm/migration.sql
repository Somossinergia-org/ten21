-- CreateEnum
CREATE TYPE "AiVisibilityScope" AS ENUM ('TENANT', 'INTERNAL', 'GLOBAL');

-- CreateEnum
CREATE TYPE "AiConversationScope" AS ENUM ('MODULE', 'EXECUTIVE', 'ALERT', 'SUPPORT');

-- CreateEnum
CREATE TYPE "AiConversationStatus" AS ENUM ('OPEN_CONV', 'CLOSED_CONV', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AiMessageRole" AS ENUM ('SYSTEM_MSG', 'USER_MSG', 'AGENT_MSG', 'TOOL_MSG', 'SUMMARY_MSG');

-- CreateEnum
CREATE TYPE "AiInsightSeverity" AS ENUM ('AI_INFO', 'AI_WARNING', 'AI_HIGH', 'AI_CRITICAL');

-- CreateEnum
CREATE TYPE "AiInsightStatus" AS ENUM ('NEW', 'ACKNOWLEDGED', 'DISMISSED', 'CONVERTED_TO_ACTION');

-- CreateEnum
CREATE TYPE "AiActionPriority" AS ENUM ('AI_LOW', 'AI_NORMAL', 'AI_HIGH', 'AI_URGENT');

-- CreateEnum
CREATE TYPE "AiActionStatus" AS ENUM ('AI_OPEN', 'ACCEPTED', 'REJECTED', 'EXECUTED', 'AI_EXPIRED');

-- CreateEnum
CREATE TYPE "AiHandoffUrgency" AS ENUM ('HANDOFF_LOW', 'HANDOFF_NORMAL', 'HANDOFF_HIGH', 'HANDOFF_URGENT');

-- CreateEnum
CREATE TYPE "AiHandoffStatus" AS ENUM ('HANDOFF_CREATED', 'HANDOFF_ACCEPTED', 'HANDOFF_COMPLETED', 'HANDOFF_REJECTED');

-- CreateEnum
CREATE TYPE "AiEvalType" AS ENUM ('PROMPT_EVAL', 'CLASSIFICATION_EVAL', 'HALLUCINATION_EVAL', 'PERMISSION_EVAL', 'ROUTING_EVAL', 'QUALITY_EVAL');

-- CreateEnum
CREATE TYPE "AiEvalStatus" AS ENUM ('EVAL_QUEUED', 'EVAL_RUNNING', 'EVAL_PASSED', 'EVAL_FAILED');

-- CreateTable
CREATE TABLE "AiAgent" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "visibilityScope" "AiVisibilityScope" NOT NULL DEFAULT 'TENANT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiAgent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiAgentConfig" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "agentId" TEXT NOT NULL,
    "modelProvider" TEXT NOT NULL DEFAULT 'gemini',
    "modelName" TEXT NOT NULL DEFAULT 'gemini-2.5-flash',
    "systemPromptVersion" TEXT NOT NULL DEFAULT 'v1',
    "thresholdsJson" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiAgentConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiConversation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scopeType" "AiConversationScope" NOT NULL DEFAULT 'MODULE',
    "scopeId" TEXT,
    "status" "AiConversationStatus" NOT NULL DEFAULT 'OPEN_CONV',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "AiMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiInsight" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "severity" "AiInsightSeverity" NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "evidenceJson" JSONB,
    "confidenceScore" INTEGER,
    "status" "AiInsightStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiActionSuggestion" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "priority" "AiActionPriority" NOT NULL DEFAULT 'AI_NORMAL',
    "title" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "evidenceJson" JSONB,
    "requiresConfirmation" BOOLEAN NOT NULL DEFAULT true,
    "status" "AiActionStatus" NOT NULL DEFAULT 'AI_OPEN',
    "createdByInsightId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiActionSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiHandoff" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "fromAgentId" TEXT NOT NULL,
    "toAgentId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "payloadJson" JSONB,
    "urgency" "AiHandoffUrgency" NOT NULL DEFAULT 'HANDOFF_NORMAL',
    "status" "AiHandoffStatus" NOT NULL DEFAULT 'HANDOFF_CREATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiHandoff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiEvaluationRun" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "agentId" TEXT,
    "evaluationType" "AiEvalType" NOT NULL,
    "status" "AiEvalStatus" NOT NULL DEFAULT 'EVAL_QUEUED',
    "resultJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "AiEvaluationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiDailyBrief" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "generatedForDate" TIMESTAMP(3) NOT NULL,
    "executiveSummary" TEXT NOT NULL,
    "prioritiesJson" JSONB,
    "risksJson" JSONB,
    "actionsJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiDailyBrief_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiToolPolicy" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "allowedToolsJson" JSONB,
    "forbiddenToolsJson" JSONB,
    "allowedActionsJson" JSONB,
    "forbiddenActionsJson" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiToolPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiAgent_code_key" ON "AiAgent"("code");

-- CreateIndex
CREATE INDEX "AiAgentConfig_agentId_idx" ON "AiAgentConfig"("agentId");

-- CreateIndex
CREATE INDEX "AiConversation_tenantId_userId_idx" ON "AiConversation"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "AiConversation_agentId_idx" ON "AiConversation"("agentId");

-- CreateIndex
CREATE INDEX "AiMessage_conversationId_idx" ON "AiMessage"("conversationId");

-- CreateIndex
CREATE INDEX "AiInsight_tenantId_idx" ON "AiInsight"("tenantId");

-- CreateIndex
CREATE INDEX "AiInsight_tenantId_status_idx" ON "AiInsight"("tenantId", "status");

-- CreateIndex
CREATE INDEX "AiInsight_agentId_idx" ON "AiInsight"("agentId");

-- CreateIndex
CREATE INDEX "AiActionSuggestion_tenantId_idx" ON "AiActionSuggestion"("tenantId");

-- CreateIndex
CREATE INDEX "AiActionSuggestion_tenantId_status_idx" ON "AiActionSuggestion"("tenantId", "status");

-- CreateIndex
CREATE INDEX "AiHandoff_tenantId_idx" ON "AiHandoff"("tenantId");

-- CreateIndex
CREATE INDEX "AiEvaluationRun_agentId_idx" ON "AiEvaluationRun"("agentId");

-- CreateIndex
CREATE INDEX "AiDailyBrief_tenantId_idx" ON "AiDailyBrief"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "AiDailyBrief_tenantId_generatedForDate_key" ON "AiDailyBrief"("tenantId", "generatedForDate");

-- CreateIndex
CREATE INDEX "AiToolPolicy_agentId_idx" ON "AiToolPolicy"("agentId");

-- AddForeignKey
ALTER TABLE "AiAgentConfig" ADD CONSTRAINT "AiAgentConfig_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AiAgent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiConversation" ADD CONSTRAINT "AiConversation_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AiAgent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiMessage" ADD CONSTRAINT "AiMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AiConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiInsight" ADD CONSTRAINT "AiInsight_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AiAgent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiActionSuggestion" ADD CONSTRAINT "AiActionSuggestion_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AiAgent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiActionSuggestion" ADD CONSTRAINT "AiActionSuggestion_createdByInsightId_fkey" FOREIGN KEY ("createdByInsightId") REFERENCES "AiInsight"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiHandoff" ADD CONSTRAINT "AiHandoff_fromAgentId_fkey" FOREIGN KEY ("fromAgentId") REFERENCES "AiAgent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiHandoff" ADD CONSTRAINT "AiHandoff_toAgentId_fkey" FOREIGN KEY ("toAgentId") REFERENCES "AiAgent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiEvaluationRun" ADD CONSTRAINT "AiEvaluationRun_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AiAgent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiToolPolicy" ADD CONSTRAINT "AiToolPolicy_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AiAgent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
