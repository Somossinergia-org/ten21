# Component Inventory V7.6

## Reusable View Components (src/components/views/)

| Component | Props | Usage |
|-----------|-------|-------|
| `StatusChip` | status, size(xs/sm) | Universal status badge with preset colors |
| `KpiCard` | label, value, icon, accent | KPI metric card for dashboards |
| `EmptyState` | icon, title, description | Empty list placeholder |
| `ViewSwitcher` | current, options, onChange | Toggle between cards/table/kanban |
| `KanbanColumn` | status, count, children | Kanban lane header + container |
| `KanbanCard` | children, onClick | Draggable-style card in kanban |

## Module-Specific View Components

| Component | Module | Pattern |
|-----------|--------|---------|
| `SalesViews` | Sales | Kanban (primary), Cards, Table |
| `PostSalesViews` | Post-Sales | Kanban (primary), Table |

## Existing Components Reused

| Component | Location | Usage |
|-----------|----------|-------|
| `PageHeader` | layout/ | Consistent page titles |
| `ActivityTimeline` | timeline/ | History on detail pages |
| `AttachmentsSection` | attachments/ | File attachments |
| `FloatingAgent` | agent/ | AI chat widget |
| `GlobalSearch` | layout/ | Ctrl+K search |
| `Header` | layout/ | Top bar with notifications |
| `Sidebar` | layout/ | V7.5 redesigned navigation |

## Design System Constants

| Token | Value | Usage |
|-------|-------|-------|
| Background | #050a14 | Main app background |
| Surface | #0a1628 | Cards, panels |
| Border | #1a2d4a | Borders, dividers |
| Accent | cyan-400/500 | Active states, links |
| Text Primary | slate-200 | Main text |
| Text Secondary | slate-400/500 | Supporting text |
| Text Muted | slate-600 | Hints, disabled |
| Success | emerald-400 | Positive states |
| Warning | amber-400 | Attention states |
| Error | red-400 | Negative states |
