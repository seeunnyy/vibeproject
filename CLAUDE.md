# CLAUDE.md
## Project
Micro SaaS MVP project for a Vibe Coding class. The product is 우리몫 (working title): a mobile web service that records the ownership shares and costs of a co-owned asset and ends the co-ownership by an agreed rule. Goal is a 4-week MVP that can be demoed.
## Product Idea
This app helps roommates and club members solve unclear ownership shares and cost-sharing for jointly bought items by recording each person's share and cost burden and simulating the settlement (sale / one member's buyout / disposal) when the co-ownership ends.
## Tech Stack
- Next.js
- React
- TypeScript
- Tailwind CSS
- Claude Code
- GitHub

MVP runs on user input and basic arithmetic only. No external price or transaction APIs. Data is stored locally in the browser.
## Current Stage
Session 5: full MVP flow implemented per `planning/md-design/02~04` and `openspec/changes/add-asset-core-flow/specs/`.
All 7 app screens (S1 자산 목록 ~ S7 공유 요약) are built: asset creation with contribution/equal split,
share calculation, contribution validation, cost tracking, sale-only termination + settlement, and a
copyable summary. `Asset.status` (draft/agreed/settled) from the OpenSpec track is now part of the core
`Asset` type (`AssetWithStatus` kept as an alias for backward compatibility) but is not yet surfaced as a
manual status/filter UI — that OpenSpec-track UI (asset-list filters, status transition buttons) was left
out as out of scope for this pass; revisit if that track is picked back up.

Session 6: added bottom tab-bar navigation (자산 목록 / 정산 현황 / 설정), decided with the user because
the single flat list screen no longer covered a settlement overview or app settings. A Next.js route
group (`src/app/app/(tabs)/`) was tried first but abandoned: it requires deleting the old
`src/app/app/page.tsx`, and this project is edited over a device bridge with no shell access on the
user's machine, so files can be delivered/overwritten but not deleted. Shipped instead as flat routes
(`/app`, `/app/settlements`, `/app/settings`) with `src/components/TabBar.tsx` rendered unconditionally
from the shared `src/app/app/layout.tsx`; the component itself checks `usePathname()` and renders `null`
outside those three exact paths, so it's hidden on the asset-detail drill-down (`assets/[id]` and its
`costs/termination/settlement/summary` sub-routes), which keeps its header back-button + "자산 목록으로
나가기" exit link as the only navigation there. `/app/settlements` is aggregate and view-only — editing
always routes into that asset's own S6 정산 화면, never inline. `/app/settings` also got a data-overview
stats strip and a 5-step "이용 방법" guide so it wouldn't read as empty.

Also in Session 6: the outer document (`html`/`body` in `src/app/layout.tsx`) is pinned to `h-dvh` with
`overflow-hidden`, and the inner 430px "phone card" scrolls internally (`overflow-y-auto`) instead —
fixes a layout shift where a tab taller than the viewport (설정) made the document itself scroll while
shorter tabs didn't, so the centered card shifted sideways when the browser's scrollbar toggled on/off
between tabs. Do not revert this to `min-h-screen`/`min-h-full` on body without re-checking that shift.
## Working Rules
- Read relevant files before suggesting changes.
- Explain the plan before editing files.
- Keep changes small.
- Do not add unnecessary dependencies.
- Update docs when project direction changes.
- Summarize changed files before commit.
## Boundaries
Do not add:
- payment
- complex authentication
- real-time collaboration
- large file upload
- multiple external API integrations
## References
- Follow docs/DESIGN.md for UI direction.
- Follow docs/ARCHITECTURE.md for project structure.
