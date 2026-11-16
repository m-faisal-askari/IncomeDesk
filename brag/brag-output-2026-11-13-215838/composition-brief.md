# Hyperframes Composition Brief: IncomeDesk — One Payment, Full Picture

## Objective
Create a polished vertical explainer that follows one fictional client payment through expenses, net cash flow, and an estimated tax reserve.

## Output
- Composition directory: `brag-output-2026-11-13-215838/composition/`
- Rendered video: `brag-output-2026-11-13-215838/brag.mp4`
- Format: vertical — 1080x1920
- Duration: 21 seconds

## Source Material
- Project root: `C:\Users\IT-HOME\Downloads\Projects\Program Files\IncomeDesk`
- Primary files read: project README and dashboard, invoice settlement, expenses, and tax-planning copy; prior IncomeDesk composition and brand assets.
- Product name: IncomeDesk
- Tagline / strongest claim: “Financial workspace for freelancers.”
- Key UI or visual moment to recreate: Financial Overview with Net Cash Received, Total Expenses, and Net Cash Flow, leading into Estimated Tax Reserve.
- Copy that must appear verbatim:
  - “A client pays $6,200.”
  - “Financial Overview”
  - “Net Cash Received”
  - “Total Expenses”
  - “Net Cash Flow”
  - “Planning Estimates Only.”

## Creative Direction
- Tone preset: polished
- Creative direction: worked example / financial explainer — one payment becomes a complete cash-flow picture
- Interpretation: use restrained number movement and clean cards; keep each figure readable, with the tax reserve explicitly identified as an estimate.
- Angle: follow a $6,200 sample payment through $2,860 in costs, $3,340 net cash flow, and a $668 estimated reserve at a 20% demo target.
- Hook: “A client pays $6,200. But that's only the first number.”
- Outro / punchline: “IncomeDesk. See the whole picture.”
- Avoid:
  - Generic SaaS language
  - Abstract filler visuals
  - Unrelated visual redesign
  - Calling net cash flow take-home pay or presenting a planning estimate as a tax calculation

## Visual Identity
- Background: `#000000`, `#0E0E11`
- Text: `#FFFFFF`, secondary `#D1D5DB`
- Accent: `#35C98A`, brand `#08764A`
- Display font: Inter
- Body font: Inter
- Visual references from the project: dark overview dashboard, paid invoice state, expense cards, estimated-reserve card, IncomeDesk icon.

## Storyboard
Use `brag-plan.md` as the creative contract.
1. First number — 5.0s — settled $6,200 sample payment.
2. Count the costs — 5.3s — three expenses total $2,860.
3. Read the cash flow — 5.96s — Financial Overview shows $3,340 net cash flow.
4. Plan a reserve — 6.3s — $668 estimated reserve at a 20% demo target, with the planning disclaimer.
Transitions overlap; full composition duration is 21 seconds.

## Audio
- Audio role: warm, steady music bed with soft motion-matched accents
- Audio arc: payment confirmation, cost-row ticks, confident dashboard resolve, gentle reserve/brand close.
- Music: `assets/music/happy-beats-business-moves-vol-12-by-ende-dot-app.mp3`
- Music treatment: 0.30 volume, 0.35s fade-in, 1s fade-out.
- Music cue guidance: bundled Vol. 12 cue preset at 109.96 BPM in `assets/music/cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.json`; target strong cues at 8.74s and 17.47s.
- Audio-reactive treatment: subtle modulation of existing brand glows using the pre-extracted envelope.
- Audio-coupled moments: settled payment, expense total, net cash-flow result, estimated reserve.
- SFX selection guidance: see `assets/sfx/sfx-analysis.md`; use quiet clicks and soft impacts.
- Audio files: copied into `composition/assets/`.

## Hyperframes Instructions
Build the composition locally from this brief and the plan. Show the IncomeDesk payment state, actual Financial Overview labels, and estimated-reserve disclaimer; keep all example amounts labeled as sample/demo data. Use the existing dark-and-green identity, preserve legibility in 9:16, run `hyperframes check` before render, and keep all deliverables under this timestamped folder inside `brag/`.
