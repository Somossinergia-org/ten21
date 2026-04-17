# AUDITORIA INTEGRAL DEL SISTEMA DE AGENTES IA — Informe Real

**Fecha**: 2026-04-17
**Metodo**: Lectura directa de codigo, rutas y servicios.
**Principio**: Evidencia de file:line. Sin humo.

---

## VEREDICTO GENERAL (1 linea)
**Arquitectura multiagente completa construida — UI ejecuta un unico chatbot legacy con prompt estatico. El 90% de la capa cognitiva es codigo muerto.**

---

## 1. COCKPIT IA (/ai/cockpit)

### Lo que existe (CONFIRMADO)
- `src/app/(app)/ai/cockpit/page.tsx`: server component que llama `getInsights()`, `getActionSuggestions()`, `getDailyBrief()`
- `src/app/(app)/ai/cockpit/ai-cockpit-client.tsx`: renderiza briefing + insights + actions + grid de 12 tarjetas de "equipo de agentes"
- Las consultas a `db.aiInsight`, `db.aiActionSuggestion`, `db.aiDailyBrief` son **REALES** (ai-agent.service.ts:37-70)

### Lo que NO existe
- **Las 12 tarjetas de "Equipo de Agentes"** (ai-cockpit-client.tsx:84-98) son **decoracion estatica**. Sin `onClick`, sin navegacion, sin estado.
- No hay forma de iniciar conversacion con un agente desde el cockpit.
- La lista visible de 12 agentes no coincide con los 8 del registry: Rentabilidad, Facturacion, Posventa, Automatizaciones siguen apareciendo visualmente aunque fueron eliminados del backend en V7.95.
- No hay filtrado de insights/actions por rol o tenant — todos los insights se muestran a cualquier JEFE que los tenga.

### Veredicto: **PARCIAL**
Datos reales, UI decorativa, sin interaccion.

---

## 2. CHAT FLOTANTE (FloatingAgent)

### Lo que existe
- `src/components/agent/floating-agent.tsx`: widget visible en layout
- `/api/agent/route.ts`: endpoint POST que maneja actions `chat`, `briefing`, `anomalies`
- Llama a `lib/gemini.ts:chat()` — un **prompt estatico hardcoded** con texto "Agente TodoMueble" (gemini.ts:5-32)

### Lo que NO existe
- **NO usa `askAgentCognitive()`** (el sistema V7.8 con personalidades, context packs, glosario, ontologia)
- **NO persiste conversacion**. Estado solo en `useState` del cliente. Refresh = historial perdido.
- **NO hay agentCode**. El chat es un unico chatbot generico, no un multi-agente.
- **Las 4 "acciones rapidas" (briefing, status, urgencias, incidencias)** son texto hardcoded que se envia como mensaje. No hay backend que sepa que el usuario hizo clic en "urgencias" vs "status".
- **NO respeta personalidades** de V7.8. Todos los usuarios hablan con el mismo prompt estatico.

### Veredicto: **DEAD LEGACY**
Conectado a Gemini directamente, pero sin ninguna capa del V7.7-V7.8. Podrias borrar todo `src/lib/ai/personalities/`, `src/lib/ai/glossary/`, `src/lib/ai/ontology/` y el chat seguiria funcionando igual.

---

## 3. AGENTES POR CODIGO (Matriz Real)

| Agent | Registry | Personality | Context Pack | UI Invocation | Veredicto |
|-------|----------|-------------|--------------|---------------|-----------|
| orchestrator | ✅ INTERNAL | ✅ | ❌ generico | ❌ nunca llamado | SCAFFOLDING |
| executive | ✅ | ✅ | ✅ 7 queries reales | ❌ dashboard/executive no le llama | DATOS REALES, UI NO LO USA |
| sales | ✅ | ✅ | ✅ 5 queries | ❌ | IDEM |
| purchase | ✅ | ⚠️ **BUG**: personality dice "purchases" | ✅ 4 queries | ❌ | BUG DE NOMBRE |
| warehouse | ✅ | ✅ | ✅ 4 queries | ❌ | IDEM |
| delivery | ✅ | ⚠️ **BUG**: personality dice "deliveries" | ✅ 5 queries | ❌ | BUG DE NOMBRE |
| treasury | ✅ | ✅ | ✅ 4 queries | ❌ | IDEM |
| billing | ✅ INTERNAL | ✅ | ✅ 4 queries | ❌ | IDEM |
| security | ✅ INTERNAL | ✅ | ✅ 4 queries | ❌ | IDEM |

### Bugs confirmados
1. **Name mismatch** (`src/lib/ai/personalities/registry.ts:78, 117`): personalidades registradas como `"purchases"` y `"deliveries"` (plural viejo), mientras que registry usa `"purchase"` y `"delivery"` (singular V7.95). **`getPersonality("purchase")` devuelve `undefined`**. El fallback es prompt generico.
2. **Ghost personalities**: 9 personalidades de agentes eliminados siguen definidas en `src/lib/ai/personalities/registry.ts` lineas 65, 104, 130, 156, 169, 182, 195, 221, 247: `customers`, `inventory`, `finance`, `invoices`, `profitability`, `postsales`, `automations`, `compliance`, `support`. 200+ lineas de codigo muerto.

---

## 4. CAPA COGNITIVA (Codigo Muerto)

### Funciones DEFINIDAS pero NUNCA INVOCADAS desde UI
- `askAgent()` (ai-agent.service.ts:96) — prompts personality-aware → **0 invocaciones**
- `askAgentCognitive()` (ai-cognitive.service.ts:10) — version completa con glosario + ontologia → **0 invocaciones**
- `readDocument()` (ai-cognitive.service.ts:54) — lectura documental con Gemini Vision → **0 invocaciones**
- `buildContextPack()` (ai-cognitive.service.ts:110) — context packs con 5 min cache → **0 invocaciones en UI** (solo en tests)
- `remember()`, `recallMemory()` (ai-cognitive.service.ts:195) — **0 invocaciones**
- `recordFeedback()` (ai-cognitive.service.ts:176) — **0 invocaciones**

### Tablas Prisma con 0 escrituras
- `AiConversation`, `AiMessage`
- `AiHandoff`
- `AiEvaluationRun`
- `AiContextPack` (se escribe desde buildContextPack, pero nadie lo llama)
- `AiEntityMemory`
- `AiFeedbackSignal`
- `AiPersonaEval`
- `AiPersonalityProfile`, `AiGlossaryTerm`, `AiOntologyRelation`, `AiDocumentReadingProfile` — datos viven en TypeScript, tablas vacias

**Total: 11 tablas y 7 funciones de la capa V7.7-V7.8 estan muertas.**

---

## 5. VISIBILIDAD POR ROL

### Cockpit (page.tsx:8)
- `requireRole(["JEFE"])` — solo JEFE
- No filtra por `isSuperAdmin` (los agentes INTERNAL billing/security se ven igual por cualquier JEFE en la grid decorativa — pero no estan conectados igualmente)

### Chat flotante
- Aparece en layout — visible a cualquier usuario autenticado
- `/api/agent/route.ts` probablemente sin check de rol (pendiente verificar)

### Agent Panel (src/components/ai/agent-panel.tsx)
- Componente existe pero **no se usa en ninguna ruta**

---

## 6. LO QUE HAY QUE ARREGLAR (orden de impacto)

### CRITICO
1. **Conectar el chat flotante a `askAgentCognitive`** o eliminar la capa cognitiva si no se va a usar.
2. **Arreglar name mismatch** `purchases`→`purchase`, `deliveries`→`delivery` en personalities/registry.ts.
3. **Borrar 9 personalidades ghost** de personalities/registry.ts (~200 lineas).

### ALTO
4. Actualizar el grid de "Equipo de Agentes" en ai-cockpit-client.tsx para mostrar solo los 8 reales con link al detalle.
5. Hacer las tarjetas clickeables → abrir drawer o redirigir a /ai/agents/[code].
6. Conectar "acciones rapidas" del chat con endpoints reales de briefing/anomalies por agente.

### MEDIO
7. Eliminar codigo muerto: askAgent o askAgentCognitive (mantener uno). readDocument. remember/recallMemory si no se van a usar.
8. Eliminar tablas vacias o empezar a usarlas.
9. Mover personalidades de TypeScript → DB o consolidar.

### BAJO
10. Agent Panel component: conectar o eliminar.
11. Orchestrator: decidir si se mantiene scaffolding o se elimina.

---

## 7. RUTAS Y PANTALLAS DE DEMO REAL

| Ruta | Demuestra | Estado |
|------|-----------|--------|
| `/dashboard` | KPIs operativos, alertas | FUNCIONAL |
| `/executive` | Cockpit ejecutivo con forecast | FUNCIONAL (datos reales) |
| `/ai/cockpit` | Briefing IA + insights + actions | PARCIAL (solo lectura) |
| `/ai/missions` | Mission engine con dry-run | FUNCIONAL |
| FloatingAgent (cualquier ruta) | Chat generico | FUNCIONAL pero legacy |

Las tarjetas de agentes en `/ai/cockpit` **NO sirven para demo** porque no hacen nada.

---

## 8. CONTEXTO CONSOLIDADO PARA OTRO ARQUITECTO

```
SISTEMA DE AGENTES IA — ESTADO REAL (post-V8.5)

RESUMEN
- 8 agentes + 1 orchestrator en registry
- 18 personalidades en TypeScript (9 son ghosts)
- 8 context packs con queries reales a BD
- Cockpit muestra datos reales de insights/actions/brief
- Chat flotante usa SOLO lib/gemini.ts con prompt estatico

PROBLEMAS CRITICOS
1. askAgent y askAgentCognitive son codigo muerto (0 invocaciones desde UI)
2. Chat flotante NO usa la capa cognitiva V7.7-V7.8
3. 11 tablas Prisma vacias por desuso
4. Bug: personalities/registry.ts usa "purchases"/"deliveries" pero agents/registry.ts usa "purchase"/"delivery" — getPersonality() devuelve undefined
5. 9 personalidades ghost siguen definidas (~200 lineas codigo muerto)
6. Grid de agentes en cockpit es estatico, muestra 12 agentes falsos
7. Acciones rapidas del chat son texto hardcoded sin backend dedicado

ARQUITECTURA CORRECTA QUE EXISTE PERO NO SE USA
- AGENT_REGISTRY con 9 agentes (V7.95)
- PERSONALITIES con personajes profesionales
- GLOSSARY con 25+ terminos de negocio
- ONTOLOGY con 15+ relaciones
- DOCUMENT_READING_PROFILES con 8 tipos
- buildContextPack() con queries DB reales para los 8 agentes

PARA HACERLO FUNCIONAL
1. Reemplazar /api/agent/route.ts:chat() con invocacion a askAgentCognitive(tenantId, agentCode, question, await buildContextPack())
2. Aceptar agentCode en el chat flotante (selector o routing por URL)
3. Persistir AiConversation/AiMessage en cada mensaje
4. Eliminar codigo muerto identificado
5. Arreglar name mismatches
6. Conectar tarjetas del cockpit a /ai/agents/[code] con panel real

VEREDICTO
El sistema tiene la maquina completa construida pero desenchufada.
Conectarlo costaria ~2 dias de trabajo real, no una reescritura.
```
