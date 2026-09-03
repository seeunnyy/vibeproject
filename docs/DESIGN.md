# DESIGN.md
## Design Goal
A clean and simple mobile web app that lets roommates and club members record co-owned asset shares and costs and see a fair settlement without accounting knowledge. Every calculated amount shows how it was derived.
## Visual Tone
- Calm
- Minimal
- Easy to scan
- Card-based when useful
- Trustworthy and neutral, like a shared ledger (no participant looks privileged)
## Main Screens
- Landing Page
  - One-line definition of 우리몫 and the problem it solves (unclear shares, disputes at move-out / graduation / club disband)
  - Call to action to open the app
- App Page
  - Asset list and "add asset"
  - Create asset: name, purchase date, total amount, participants, contributions or equal shares
  - Asset detail: share %, contribution, expected payout, live check that shares sum to 100%
  - Cost log: repair / extra purchase / shipping and who paid; cumulative burden shown separately from the initial share
  - Termination rule: sale / one member's buyout / disposal, with valuation basis and settlement method
  - Settlement result: enter current value, then each member's payout, the buyer's payment, and any shortfall or extra payment
  - Shareable read-only summary of the calculations and agreements
## UI Rules
- Use clear button text.
- Use labels for inputs.
- Use semantic headings.
- Avoid icon-only actions.
- Avoid random design changes.
- Show the formula behind every calculated amount.
- Always show whether shares add up to 100%.
- Use a sign or label, not color alone, to mark amounts to receive versus amounts to pay.
