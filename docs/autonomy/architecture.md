# Autonomy Layer V7.9 — Design

## Architecture

```
Human Order → Mission → Orchestrator Planning → Subtasks
  → Agent Assignment → Dry-Run → Confirmation Gate → Execute → Audit
```

## Flow
1. JEFE types order: "Reintenta webhooks fallidos recuperables"
2. System creates Mission (status: PLANNING)
3. Orchestrator parses intent → creates MissionSteps
4. Each step maps to an ActionRegistryEntry
5. Each step runs DRY_RUN first
6. If risk=LOW and auto-allowed → execute
7. If risk=MEDIUM+ or requires confirmation → PENDING_CONFIRMATION
8. On confirmation → execute
9. All results logged in MissionStepExecution

## Action Risk Levels
- LOW: read, notify, acknowledge, refresh → auto-execute
- MEDIUM: requeue, retry, update status → auto with dry-run
- HIGH: create entries, assign, export → dry-run + optional confirm
- CRITICAL: billing, security, compliance, stock → ALWAYS confirm

## Agent Policy Matrix
| Agent | Read | LOW actions | MEDIUM actions | HIGH actions | CRITICAL |
|-------|------|-------------|----------------|-------------|----------|
| Orchestrator | all | route only | route only | route only | deny |
| SupportOps | all | auto | auto | dry-run+confirm | deny |
| Automation | all | auto | auto | dry-run | deny |
| Security | all | auto | dry-run | dry-run+confirm | deny |
| Billing | all | auto | dry-run | dry-run+confirm | deny |
| Sales/Purchase | own | auto | dry-run | deny | deny |
| Warehouse/Delivery | own | auto | dry-run | deny | deny |
| Compliance | own | deny | deny | deny | deny |
| Executive | all | auto | deny | deny | deny |
| Finance | all | auto | deny | deny | deny |
