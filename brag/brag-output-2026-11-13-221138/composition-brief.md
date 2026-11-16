# Hyperframes Composition Brief: IncomeDesk — Production Financials

## Objective
Create a polished vertical video for independent filmmakers that shows how IncomeDesk tracks the finances behind a production: contract value, paid revenue, direct production costs, production budget, and take-home margin.

## Output
- Composition directory: `brag-output-2026-11-13-221138/composition/`
- Rendered video: `brag-output-2026-11-13-221138/brag.mp4`
- Format: vertical — 1080x1920
- Duration: 21 seconds

## Source Material
- Project root: `C:\Users\IT-HOME\Downloads\Projects\Program Files\IncomeDesk`
- Primary files read: `README.md`; `frontend/src/pages/Projects.jsx`, `Expenses.jsx`, and `Taxes.jsx`; IncomeDesk brand assets and previous composition assets.
- Product name: IncomeDesk
- Tagline / strongest claim: “Project Management & Production Financials.”
- Key UI or visual moment to recreate: Project Financials showing contract value, revenue realized, direct project costs, net take-home profit, margin, and a production-budget progress bar.
- Copy that must appear verbatim:
  - “The shoot wrapped. Did the project pay?”
  - “Project Financials”
  - “Contract Value”
  - “Direct Project Costs”
  - “Take-Home Profit”
  - “Production Budget”

## Creative Direction
- Tone preset: polished
- Creative direction: a filmmaker's wrap report, with a purposeful clapperboard cue and calm, legible finance UI
- Interpretation: acknowledge film-set culture while keeping the product's project economics and production costs at the center.
- Angle: follow the fictional short film *Afterlight* from wrap to project profitability and budget remaining.
- Hook: “The shoot wrapped. Did the project pay?”
- Outro / punchline: “IncomeDesk. Keep production finances in frame.”
- Avoid:
  - Generic SaaS language
  - Abstract filler visuals
  - Unrelated visual redesign
  - Suggesting IncomeDesk edits footage, manages call sheets, or schedules crews

## Visual Identity
- Background: `#000000`, `#0E0E11`
- Text: `#FFFFFF`, secondary `#D1D5DB`
- Accent: `#35C98A`, brand `#08764A`
- Display font: Inter
- Body font: Inter
- Visual references from the project: IncomeDesk Project Management & Production Financials page, project financial cards, Production Budget bar, direct cost rows, IncomeDesk icon.

## Storyboard
Use `brag-plan.md` as the creative contract.
1. Wrap report — 5.0s — slate cue introduces fictional *Afterlight* short film.
2. Project financials — 5.3s — contract/revenue $18,000, costs $12,600, take-home profit $5,400, 30% margin.
3. Production budget — 5.3s — $12,600 of a $13,500 budget, 93% spent, $900 remaining; show gear, crew, sound/permit cost rows.
4. The business behind the film — 6.3s — brand end card with actual project-finance fields.
Scene transitions overlap; full composition duration is 21 seconds.

## Audio
- Audio role: restrained, lightly cinematic business bed with sparse accents
- Audio arc: quiet slate snap, soft margin reveal, gentle close.
- Music: `assets/music/happy-beats-business-moves-vol-12-by-ende-dot-app.mp3`
- Music treatment: 0.28 volume, 0.35s fade-in, 1s fade-out.
- Music cue guidance: bundled Vol. 12 cue preset at about 109.96 BPM in `assets/music/cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.json`; strong cues at 8.74s and 17.47s.
- Audio-reactive treatment: subtle modulation of existing brand glows using the pre-extracted envelope.
- Audio-coupled moments: slate close, project-profit highlight, final brand line.
- SFX selection guidance: see `assets/sfx/sfx-analysis.md`; use quiet clicks and soft impacts.
- Audio files: copied into `composition/assets/`.

## Hyperframes Instructions
Build the composition locally from this brief and the plan. Show IncomeDesk's real Project Financials and Production Budget concepts with fictional demo figures. Use a clapperboard only as the filmmaking audience cue; do not imply it is app UI. Keep the dark-and-green identity, maintain legibility in 9:16, run `hyperframes check` before render, and store all outputs under this timestamped folder inside `brag/`.
