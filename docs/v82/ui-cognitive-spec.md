# V8.2 — Especificación UI Cognitiva

## Objetivo

Que el usuario vea con un golpe de vista qué es dato verificado del sistema,
qué es lectura del agente y qué es propuesta de acción.

## Convención de prompt

Los system prompts de las personalidades ya incluyen en `baseRules`:
> "Distingue claramente: HECHO (dato del sistema), INFERENCIA (tu lectura),
>  RECOMENDACION (qué harías)."

V8.2 refuerza el formato obligando en el prompt a usar estos prefijos por línea:

```
HECHO: ...
HECHO: ...
INFERENCIA: ...
RECOMENDACION: ...
```

Si el LLM no respeta el formato, se renderiza como texto plano (fallback).

## Parser

`src/lib/ai/cognitive-parser.ts` expone:

```ts
type CognitiveBlocks = {
  facts: string[];
  inferences: string[];
  recommendations: string[];
  other: string;
};
export function parseCognitive(text: string): CognitiveBlocks;
```

Normaliza acentos y mayúsculas. Acepta variantes: `HECHO:`, `HECHOS:`, `• HECHO:`,
`1. HECHO:`, `**HECHO:**`, `INFERENCIA:`, `RECOMENDACION:`, `RECOMENDACIÓN:`.

## Componente

`src/components/ai/cognitive-response.tsx`

```tsx
<CognitiveResponse text={agentText} />
```

Renderiza hasta 4 secciones, ocultando las vacías:

1. **HECHOS** — icono ✓, color cyan-400, borde izq. 2px cyan.
2. **INFERENCIAS** — icono 🔍, color amber-400, borde amber.
3. **RECOMENDACIONES** — icono ⚡, color emerald-400, borde emerald.
4. **Texto libre restante** — sin etiqueta, color slate-300.

## Tokens de estilo

- fondo bloque: `bg-[#050a14]/50`
- borde: `border-[#1a2d4a]`
- borde lateral:
  - HECHOS: `border-l-cyan-500/70`
  - INFERENCIAS: `border-l-amber-500/70`
  - RECOMENDACIONES: `border-l-emerald-500/70`
- padding: `px-3 py-2`
- gap entre bloques: `space-y-2`

## Donde se usa

- `src/components/agent/floating-agent.tsx` → cada mensaje agente.
- `src/app/(app)/ai/cockpit/ai-cockpit-client.tsx` → drawer de respuesta del agente.
- `src/app/(app)/ai/brief/*` (si lo activamos) — futura iteración.

## Badges de feedback

Debajo de cada bloque cognitivo, chip row:

```
[✓ Útil]  [✗ No útil]  [! Incorrecto]
```

Al pulsar uno, pasa a estado activo (bg-cyan-500/20) y llama `recordFeedbackAction`.
Si es "No útil" o "Incorrecto", despliega textarea opcional ("¿Qué faltó?") antes
de enviar.

## Estados de carga

- Loader sobre el CognitiveResponse mientras espera.
- Si falla, mostrar texto plano + chip "⚠ Respuesta sin formato cognitivo".

## Accesibilidad

- Cada bloque con `role="region"` + `aria-label`.
- Botones de feedback con `aria-pressed`.
