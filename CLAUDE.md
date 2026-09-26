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

Session 7: ran a Nielsen 10-heuristic self-audit (`docs/USABILITY_HEURISTIC_REVIEW.md`) and turned the
findings into reference-backed proposals (`docs/UX_IMPROVEMENT_PROPOSAL.md`, Splitwise/Toss/카카오페이),
then implemented the fixes:
- **입력값 정제**: `NumberInput`을 `type="number"`에서 `type="text"`+`inputMode="numeric"`으로 바꾸고
  `sanitizeDigits()`(`src/lib/calc/format.ts`)로 숫자 이외 문자를 입력 시점에 제거 — 음수/소수/지수 표기가
  아예 입력되지 않는다. 빈 문자열은 `0`으로 스냅하지 않고 그대로 유지(`number | ""`).
- **납부액 검증 통일**: `ContributionCheck`에 `hasNegativeMember` 필드 추가, `checkContribution`이 개별
  참여자 납부액이 음수면 합계가 총액과 맞아도 무조건 `ok: false`. 자산 생성 화면(S2)의 검증 기준을
  `contributionCheck.ok`로 통일해 이후 화면(S3~S7)과 기준이 갈리던 문제를 없앴다.
- **헤더 나가기(X) 버튼**: `AppHeader`에 `closeHref` prop 추가, S4(비용)~S7(요약) 4개 화면에 적용.
  S3는 기존 하단 "자산 목록으로 나가기" 링크를 그대로 유지(중복 방지).
- **참여자 추가·삭제**: 자산 상세(S3)에 참여자 관리 섹션 추가(`addMember`/`removeMember` 리듀서,
  `AssetStoreProvider`). Splitwise식 가드레일 — 최소 2명 미만, 비용 발생 참여자, 정산 시작 후에는 삭제 차단.
- **상태 배지 재사용**: `StatusBadge` 컴포넌트로 분리해 정산 현황 탭과 자산 목록(S1)에 동일하게 적용,
  S1 제목에 `truncate` 추가.

전체 변경은 `vitest run`(40 tests) 및 `tsc --noEmit`/`eslint` 클린, Playwright로 실제 개발 서버에서
음수 입력 차단·검증 통일·나가기 버튼·참여자 관리 UI를 재확인 완료. 세부 근거는 위 두 문서 참고.
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
