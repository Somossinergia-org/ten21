-- CreateEnum
CREATE TYPE "MissionStatus" AS ENUM ('DRAFT_MISSION', 'PLANNING', 'PLANNED', 'EXECUTING', 'COMPLETED_MISSION', 'FAILED_MISSION', 'CANCELLED_MISSION');

-- CreateEnum
CREATE TYPE "MissionStepStatus" AS ENUM ('PENDING_STEP', 'DRY_RUN_STEP', 'DRY_RUN_DONE', 'PENDING_CONFIRMATION', 'EXECUTING_STEP', 'COMPLETED_STEP', 'FAILED_STEP', 'SKIPPED_STEP', 'DENIED_STEP');

-- CreateEnum
CREATE TYPE "ActionRiskLevel" AS ENUM ('ACTION_LOW', 'ACTION_MEDIUM', 'ACTION_HIGH', 'ACTION_CRITICAL');

-- CreateTable
CREATE TABLE "AiMission" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "orderText" TEXT NOT NULL,
    "parsedIntent" TEXT,
    "status" "MissionStatus" NOT NULL DEFAULT 'DRAFT_MISSION',
    "initiatedById" TEXT NOT NULL,
    "totalSteps" INTEGER NOT NULL DEFAULT 0,
    "completedSteps" INTEGER NOT NULL DEFAULT 0,
    "failedSteps" INTEGER NOT NULL DEFAULT 0,
    "summaryJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiMission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiMissionStep" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "agentCode" TEXT NOT NULL,
    "actionCode" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "inputJson" JSONB,
    "dryRunResultJson" JSONB,
    "executeResultJson" JSONB,
    "status" "MissionStepStatus" NOT NULL DEFAULT 'PENDING_STEP',
    "riskLevel" TEXT NOT NULL DEFAULT 'LOW',
    "requiresConfirm" BOOLEAN NOT NULL DEFAULT false,
    "confirmedById" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiMissionStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionRegistryEntry" (
    "id" TEXT NOT NULL,
    "actionCode" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "riskLevel" "ActionRiskLevel" NOT NULL DEFAULT 'ACTION_LOW',
    "requiresConfirmation" BOOLEAN NOT NULL DEFAULT false,
    "allowedRolesJson" JSONB,
    "allowedAgentsJson" JSONB,
    "tenantScoped" BOOLEAN NOT NULL DEFAULT true,
    "idempotent" BOOLEAN NOT NULL DEFAULT true,
    "dryRunSupported" BOOLEAN NOT NULL DEFAULT true,
    "auditRequired" BOOLEAN NOT NULL DEFAULT true,
    "forbiddenInRestrictedMode" BOOLEAN NOT NULL DEFAULT false,
    "featureFlag" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActionRegistryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentExecutionPolicy" (
    "id" TEXT NOT NULL,
    "agentCode" TEXT NOT NULL,
    "actionCode" TEXT NOT NULL,
    "allowed" BOOLEAN NOT NULL DEFAULT true,
    "autoExecute" BOOLEAN NOT NULL DEFAULT false,
    "requiresDryRun" BOOLEAN NOT NULL DEFAULT true,
    "maxExecutionsPerHour" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentExecutionPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentExecutionLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "missionId" TEXT,
    "missionStepId" TEXT,
    "agentCode" TEXT NOT NULL,
    "actionCode" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'dry-run',
    "inputJson" JSONB,
    "outputJson" JSONB,
    "success" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "durationMs" INTEGER,
    "affectedEntities" JSONB,
    "evidenceSummary" TEXT,
    "rollbackPossible" BOOLEAN NOT NULL DEFAULT false,
    "initiatedById" TEXT,
    "confirmedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentExecutionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiMission_tenantId_idx" ON "AiMission"("tenantId");

-- CreateIndex
CREATE INDEX "AiMission_tenantId_status_idx" ON "AiMission"("tenantId", "status");

-- CreateIndex
CREATE INDEX "AiMissionStep_missionId_idx" ON "AiMissionStep"("missionId");

-- CreateIndex
CREATE INDEX "AiMissionStep_tenantId_idx" ON "AiMissionStep"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ActionRegistryEntry_actionCode_key" ON "ActionRegistryEntry"("actionCode");

-- CreateIndex
CREATE INDEX "AgentExecutionPolicy_agentCode_idx" ON "AgentExecutionPolicy"("agentCode");

-- CreateIndex
CREATE UNIQUE INDEX "AgentExecutionPolicy_agentCode_actionCode_key" ON "AgentExecutionPolicy"("agentCode", "actionCode");

-- CreateIndex
CREATE INDEX "AgentExecutionLog_tenantId_idx" ON "AgentExecutionLog"("tenantId");

-- CreateIndex
CREATE INDEX "AgentExecutionLog_tenantId_agentCode_idx" ON "AgentExecutionLog"("tenantId", "agentCode");

-- CreateIndex
CREATE INDEX "AgentExecutionLog_missionId_idx" ON "AgentExecutionLog"("missionId");

-- CreateIndex
CREATE INDEX "AgentExecutionLog_createdAt_idx" ON "AgentExecutionLog"("createdAt");

-- AddForeignKey
ALTER TABLE "AiMissionStep" ADD CONSTRAINT "AiMissionStep_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "AiMission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
