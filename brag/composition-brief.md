# Hyperframes Composition Brief: IncomeDesk

## Objective
Create a polished vertical launch video focused on financial management for freelancers. Show IncomeDesk handling the money flow from invoice settlement through cash-flow visibility to estimated tax planning.

## Output
- Composition directory: `brag/composition/`
- Rendered video: `brag/brag.mp4`
- Format: vertical — 1080x1920
- Duration: 21 seconds
- Deliver all generated project files and media beneath the existing `brag/` folder.

## Source Material
- Project root: `C:\Users\IT-HOME\Downloads\Projects\Program Files\IncomeDesk`
- Primary files read: `README.md`, `frontend/src/index.css`, `frontend/src/pages/Dashboard.jsx`, `frontend/src/pages/Invoices.jsx`, `frontend/src/pages/Taxes.jsx`, `frontend/public/IncomeDesk_Logo_Transparent.svg`
- Product name: IncomeDesk
- Strongest claim: an issued invoice is receivable, not received income; recording a payment settles the invoice and posts confirmed income.
- Key UI moments: **Record Payment**, the **Payment recorded.** confirmation, **Financial Overview**, **Net Cash Received**, **Total Expenses**, **Net Cash Flow**, and **Estimated Tax Reserve**.
- Copy that must appear verbatim: `Invoice sent ≠ cash received.`; `Payment recorded.`; `Financial Overview`; `Net Cash Received`; `Total Expenses`; `Net Cash Flow`; `Estimated Tax Reserve`; `Planning Estimates Only`; `Designed for independent freelancers.`
- Reuse the supplied SVG logo. Do not redraw it.
- Use only invented demo figures: $2,500 received, $740 expenses, $1,760 net cash flow, and $352 reserve at a fictional 20% configured demo target. Mark sample screens `DEMO DATA`; do not use any real account or personal data.

## Creative Direction
- Tone preset: polished
- Creative direction: calm, confident mobile-first money clarity for freelancers
- Interpretation: high-contrast product UI, deliberate holds, clear numbers, gentle transitions, and restrained sound.
- Angle: follow the real distinction between a sent invoice and cash received. Show payment settlement creating confirmed income, then reveal the financial overview and the estimated tax reserve.
- Hook: a sample invoice marked **OUTSTANDING** beside the line **“Invoice sent ≠ cash received.”**
- Outro: IncomeDesk logo with **“Designed for independent freelancers.”**
- Avoid: generic SaaS claims, invented performance claims, abstract filler, customer information, tiny dashboard copy, and a full-screen linear gradient.

## Visual Identity
- Background: `#000000`; deep surface: `#0E0E11`; raised surface: `#1E1E24`
- Text: `#FFFFFF`, secondary `#D1D5DB`, muted `#9CA3AF`
- Accent: analytics `#35C98A`; brand `#08764A`; border `#26262D`
- Display font: Inter, a bundled sans-serif match for the project's Tailwind system sans stack
- Body font: Inter, the same closest bundled match
- Use the actual supplied IncomeDesk SVG logo.
- **LOOK:** 1080×1920 portrait; black canvas `#000000`; near-black panels `#0E0E11` / `#1E1E24`; IncomeDesk green `#08764A`; analytics highlight `#35C98A`; white ink `#FFFFFF`; Inter; 72px safe edge; dashboard UI scaled for phone viewing; localized radial green glow only; avoid linear gradients, generic chart patterns, and small text.

## Storyboard
Use `brag/brag-plan.md` as the creative contract.

1. **The invoice gap — 4.4s** — `OUTSTANDING` demo invoice, $2,500.00, hook line.
2. **Payment becomes income — 5.2s** — simulated **Record Payment** tap, paid status, **Payment recorded.**, confirmed ledger income.
3. **Cash flow at a glance — 5.1s** — three readable dashboard rows: $2,500 received, $740 expenses, $1,760 net cash flow.
4. **Plan the reserve — 6.3s** — $352 estimated reserve on fictional sample figures, then logo and final line held for at least 2s.

## Audio
- Audio role: warm polished bed with sparse interface accents; no voiceover.
- Music: `happy-beats-business-moves-vol-12-by-ende-dot-app.mp3` from the bundled `/brag` assets.
- Music treatment: start at 0s near 0.30 volume, gentle fade-in and one-second fade-out.
- Music cue guidance: copy `happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.json` into `composition/assets/music/cues/`. The bundled preset reports 109.96 BPM. Favor 8.74s for the payment confirmation and 17.47s for the reserve reveal. Place dashboard rows at 10.37s, 11.46s, and 12.55s, holding text for readability.
- Audio-reactive treatment: subtle; use the locally measured music envelope to vary the existing green halo by only a few percent. No waveform, equalizer, or text pulsing.
- SFX posture: sparse and quiet. Match the simulated payment click and two key confirmations to their on-screen events. The bundled SFX analysis is at `composition/assets/sfx/sfx-analysis.md`; favor low-risk files.
- Audio files: keep every chosen track and sound under `composition/assets/`.

## Hyperframes Instructions
- Use the current Hyperframes composition contract and CLI; keep HTML as the composition source of truth.
- Build a seek-safe paused GSAP timeline registered as `window.__timelines.main`.
- Use a 1080×1920 canvas and the look above. Establish all scene layouts before adding motion.
- Every scene element needs a readable entrance; use three caused screen transitions so one complete screen covers the previous one. Do not animate earlier scenes out before their transition.
- All factual copy must match the source project; keep fictional example values labeled `DEMO DATA`.
- Run `npx hyperframes check` and fix errors before rendering to `../brag.mp4` from the composition directory.
- Render locally only; do not publish or upload the video.
