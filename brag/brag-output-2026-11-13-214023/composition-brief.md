# Hyperframes Composition Brief: IncomeDesk

## Objective
Create a polished vertical launch video that opens with the freelancer's “money came in and went somewhere” problem, then introduces IncomeDesk as the solution for understanding income, expenses, cash flow, and estimated tax reserves.

## Output
- Composition directory: `brag-output-2026-11-13-214023/composition/`
- Rendered video: `brag-output-2026-11-13-214023/brag.mp4`
- Format: vertical — 1080x1920
- Duration: 21 seconds

## Source Material
- Project root: `C:\Users\IT-HOME\Downloads\Projects\Program Files\IncomeDesk`
- Primary files read: `README.md`; dashboard, expense, invoice settlement, and tax planning UI copy; `brag/composition/index.html` and visual assets from the earlier IncomeDesk video.
- Product name: IncomeDesk
- Tagline / strongest claim: “Financial workspace for freelancers.”
- Key UI or visual moment to recreate: Financial Overview with Net Cash Received, Total Expenses, and Net Cash Flow, followed by an estimated tax reserve.
- Copy that must appear verbatim:
  - “Money came in. Money went out.”
  - “Financial Overview”
  - “Net Cash Received”
  - “Total Expenses”
  - “Net Cash Flow”
  - “Planning Estimates Only.”

## Creative Direction
- Tone preset: polished
- Creative direction: empathetic “where did it go?” opening that resolves into calm financial clarity
- Interpretation: let the hook read, then use orderly card reveals and smooth transitions to make the finances feel understandable.
- Angle: money is coming in and going out, but the freelancer cannot see the full picture; IncomeDesk organizes that activity into an overview and an estimated reserve.
- Hook: “Money came in. Money went out. No idea where it went.”
- Outro / punchline: “IncomeDesk. Put freelance money in focus.”
- Avoid:
  - Generic SaaS language
  - Abstract filler visuals
  - Unrelated visual redesign
  - Presenting fictional figures as real customer data or tax advice

## Visual Identity
- Background: `#000000`, `#0E0E11`
- Text: `#FFFFFF`, secondary `#D1D5DB`
- Accent: `#35C98A`, brand `#08764A`
- Display font: Inter
- Body font: Inter
- Visual references from the project: IncomeDesk wordmark and icon, the dark financial dashboard, status chips, metric cards, and tax reserve panel.

## Storyboard
Use `brag-plan.md` as the creative contract. Scene summary:
1. The mystery — 5.0s — hook plus unaggregated, fictional freelance activity.
2. Meet IncomeDesk — 5.2s — income and expenses placed together in a monthly view.
3. See the month clearly — 5.9s — Financial Overview with $6,200 in, $2,860 out, and $3,340 net cash flow.
4. Plan the reserve — 6.3s — $668 estimated reserve at a 20% demo target, then the brand lockup.
Scene transitions overlap; total composition duration is 21 seconds.

## Audio
- Audio role: warm, polished bed with sparse motion-matched accents
- Audio arc: light activity ticks, confident product reveal, restrained confirmation on the reserve, gentle brand fade.
- Music: `assets/music/happy-beats-business-moves-vol-12-by-ende-dot-app.mp3`
- Music treatment: 0.30 volume, short fade-in, fade out under the final brand frame.
- Music cue guidance: bundled cue preset at 109.96 BPM in `assets/music/cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.json`; strong cues 8.74s and 17.47s.
- Audio-reactive treatment: subtle breathing on existing brand glows, using the pre-extracted envelope.
- Audio-coupled moments: list rows, product overview reveal, dashboard metrics, reserve amount.
- SFX selection guidance: see `assets/sfx/sfx-analysis.md`; use soft clicks/impacts, sparingly.
- Audio files: copied into `composition/assets/`.

## Hyperframes Instructions
Build a local, seek-safe composition from the supplied plan and this brief. Show the actual IncomeDesk Financial Overview and estimated-reserve language, keep the sample values labeled, and use the existing dark-and-green identity. Keep all text legible in 9:16, use audio reactivity only on existing brand elements, run `hyperframes check` before rendering, and keep all deliverables under this timestamped folder inside `brag/`.
