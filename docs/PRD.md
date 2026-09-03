# PRD.md
## Problem
- The ownership share and cost burden for jointly bought items are not clearly recorded. Agreements are made verbally or scattered across messenger chats.
- Over time, extra purchases, repair fees, and shipping costs go unrecorded, so it is hard to recompute each member's real burden and ownership ratio.
- When co-living or a club activity ends, the group has not decided whether to sell, let one member buy out, or dispose of the asset, which leads to disputes over sale price and residual value.
## Target User
- Primary — Roommates: students and early-career workers in their 20s–30s who jointly buy fridges, vacuums, furniture, and shared kitchenware, and who may contribute different amounts.
- Primary — Club members: people who manage shared assets such as cameras, audio gear, event supplies, and tools.
- Secondary — Beginners who want to learn the basics of co-ownership and asset tokenization.
- Common traits: no professional accounting or finance knowledge, prefer quick input on mobile, find messenger-only agreements inconvenient, and want a written baseline before disputes arise.
## Core Value
우리몫 connects the whole life of a co-owned asset in one flow: the agreement at purchase, cost tracking while it is held, and settlement at the end. Unlike household-expense or bill-splitting apps that only divide spending, it centers on the asset itself, its shares, and its termination rules. It lets beginners experience the core ideas of asset tokenization (issuing shares, valuation, liquidation) through an everyday co-ownership case, with no financial jargon and no real tokens. Because the first version runs on user input and basic arithmetic with no external price or transaction APIs, a stable 4-week build and demo are feasible.
## Core Features
- Register a co-owned asset (name, purchase date, total amount, participants) and auto-calculate each member's share from contributions or an equal split; verify the shares sum to 100%.
- Record agreements and cost entries (repair, extra purchase, shipping) with the person who paid, and show cumulative burden separately from the initial share.
- Provide termination scenarios (sale, one member's buyout, disposal) with a valuation basis and settlement method.
- Enter the current value to compute each member's payout, the buyer's payment, and any shortfall or extra payment.
- Provide a shareable read-only summary of all calculation results and agreements.
## Non-goals
- Payment or transfer / settlement execution.
- Complex authentication and user accounts.
- Real-time collaboration.
- Large file upload.
- Multiple external API integrations (no market-price or transaction APIs).
- Automatic depreciation or resale-price estimation.
## Success Criteria
- For a single asset, a user can go from create → verify shares → log 2 costs → view all 3 termination scenarios with no calculation error.
- Shares always verify to 100%, and each settlement total matches the amount being distributed (sale price, current value, or salvage value minus disposal cost).
- A first-time user completes the core flow on mobile without help and can share the result summary.
