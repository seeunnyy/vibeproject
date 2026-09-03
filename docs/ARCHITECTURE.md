# ARCHITECTURE.md
## Service Structure
User → Landing Page → App Page → UI Components → State → Data → Tests → Deploy

우리몫 flow: create asset → add participants and set shares → log shared costs → agree on a termination rule → enter current value → view settlement → share the summary. All values come from user input and basic arithmetic; there are no external APIs.
## Planned Routes
- `/`: Landing page
- `/app`: main app page (asset list)
- `/app/assets/new`: create a co-owned asset
- `/app/assets/[id]`: asset detail (shares, contributions, expected payout, 100% check)
- `/app/assets/[id]/costs`: shared cost log
- `/app/assets/[id]/termination`: termination rule (sale / buyout / disposal)
- `/app/assets/[id]/settlement`: settlement simulation and result
- `/app/assets/[id]/summary`: shareable read-only summary
## Source Structure
- `src/`: application source code (pages/routes, UI components, state, and calculation helpers for shares and settlement)
- `docs/`: project documents (PRD, DESIGN, ARCHITECTURE)
- `tests/`: test code (focused on the share and settlement calculations)
