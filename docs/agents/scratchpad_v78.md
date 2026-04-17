# V7.8 Scratchpad — Agent Personalities + Ontology + Document Reading

## Objective
Transform V7.7 agents from generic chatbots into professional specialists with:
1. Distinct personality (tone, vocabulary, decision style)
2. Business ontology (what each term means in context)
3. Document reading profiles (how to interpret invoices, orders, deliveries)
4. Operational memory (summaries, risks, patterns)

## Approach
- Keep existing AiAgent registry from V7.7
- Layer on top: personality profiles (static defaults), glossary (static), ontology (static), context packs (dynamic)
- Extend askAgent() to use personality + context pack instead of generic prompt
- Add feedback signals for continuous improvement
- Store personalities as TypeScript constants seeded into DB via bootstrap

## Key Decisions
1. **Personalities as code + DB**: TS constants for defaults, DB for tenant overrides
2. **Glossary as TS**: ~40-60 terms, no DB overhead for lookup, just seeded
3. **Document reading**: one profile per entity type with expected fields + output template
4. **Memory**: SUMMARY/RISK/PREFERENCE/PATTERN types, linked to entities, tenant-scoped
5. **Feedback**: simple thumbs + dropdown reason, no over-engineering

## Priority Agents for Personality (high impact first)
1. Executive (daily brief tone)
2. Sales (jefe comercial)
3. Purchases (responsable compras)
4. Treasury (controller)
5. Invoices (administrativo)
6. Profitability (analista margen)
7. Warehouse (jefe almacen)
8. Security (responsable seguridad)
9. Rest: default personality with domain-specific vocab
