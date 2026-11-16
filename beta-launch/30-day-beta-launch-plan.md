# IncomeDesk: 30-Day Beta Launch Plan

## Outcome

Run a controlled beta that tells us whether independent freelancers can use IncomeDesk to understand and manage day-to-day business finances, while finding high-impact correctness, privacy, onboarding, and usability problems before a wider release.

**Beta format:** Invite-only, staged cohorts  
**Duration:** 30 days from the chosen Day 1  
**Suggested first-month cap:** Up to 20 testers, subject to support capacity  
**Launch owner:** `[name]`  
**Day 1 date:** `[YYYY-MM-DD]`  
**Beta URL / build:** `[confirm before invitations]`

## Goals and boundaries

### Learn

- Can a freelancer set up an account and understand the dashboard without guided help?
- Can they record income and expenses and explain what the totals mean?
- Do invoices, projects, budgets, accounts, tax estimates, and reports make sense to the people who need them?
- Which errors or missing steps block repeat use?
- Do users trust the product's handling of financial data and its explanations of estimates?

### Keep the beta bounded

- Start with freelancers who track business income and expenses today, including a mix of professions and comfort levels with finance tools.
- Describe only features confirmed in the beta build. Do not promise bank sync, payment processing, tax filing, or features that are not enabled.
- Do not use beta data as a source for tax filing or as a substitute for users' existing records.
- Expand invitations only after the release owner reviews the prior cohort's open issues and support load.

## Owners

Assign names on Day 1. One person may hold more than one role.

| Role | Responsibility |
|---|---|
| Launch lead | Owns schedule, go/no-go decisions, cohort size, and daily status |
| Engineering lead | Owns deployment, access controls, backups, monitoring, and fixes |
| Product/research lead | Owns participant selection, interviews, onboarding, and synthesis |
| Support owner | Monitors the published support channel and routes urgent reports |

## Release gates

### Before the first external invitation

All critical items in the [readiness checklist](readiness-checklist.md) must be complete. In particular, confirm the correct production environment, account isolation, backup recovery path, core financial workflows, privacy/contact details, and a way to pause invitations or disable an affected feature.

### Before each cohort expands

- No unresolved critical financial correctness, data-loss, account-access, or privacy issue.
- The team can keep up with reports and respond to participants.
- The previous cohort has completed at least one core workflow or supplied a clear blocker.
- The owner records the decision and any cohort-size limit in the scorecard.

If a gate fails, pause new invitations, tell current participants what action to take, and resume only after the owner records that the issue is contained and corrected.

## Day-by-day schedule

| Day | Focus | Actions and concrete output |
|---:|---|---|
| 1 | Kickoff | Name owners; set the Day 1 date, beta URL, support channel, time budget, and proposed cohort cap. Create a shared issue/feedback log. |
| 2 | Audience | Choose 2–3 freelancer profiles to recruit. Write the problem statement and the three questions this beta must answer. |
| 3 | Scope | List enabled features, known limitations, and excluded capabilities. Agree on the exact onboarding task that counts as activation. |
| 4 | Success measures | Fill in the baseline and targets in the scorecard. Confirm how usage will be counted without collecting transaction amounts or other unnecessary financial details. |
| 5 | Risk review | Review privacy, authentication, account ownership, backups, recovery, retention/deletion, incident contacts, and support capacity with the responsible owners. Record gaps. |
| 6 | Core journeys | Walk through signup, account setup, income, expense, dashboard, and the enabled invoice/report flows in the beta environment. Capture blockers and expected results. |
| 7 | Financial integrity | Reconcile representative cases for received income, expenses, transfers, invoice payment, currency handling where enabled, and tax estimates. Record the expected outcome and evidence. |
| 8 | Release operations | Confirm production/staging separation, deployment rollback or pause path, error monitoring, database backup status, and who can act during an incident. |
| 9 | Onboarding | Prepare the participant kit, support contact, known-limitations note, privacy-safe feedback instructions, and a short first-session checklist. |
| 10 | Dry run | Have someone unfamiliar with the build follow onboarding and report confusing language, dead ends, and missing guidance. Fix release-blocking issues. |
| 11 | Go/no-go | Review readiness checklist. Launch lead records **Go** or **No-go**, outstanding risks, and the allowed first cohort size. No-go means no external invitations. |
| 12 | Invite wave 1 | Invite 5–8 carefully selected freelancers. Track delivery and consent/acceptance; avoid adding people to marketing lists without permission. |
| 13 | Observe onboarding | Offer short, optional onboarding sessions. Ask participants to narrate what they expect; do not steer them through the product unless they are stuck. |
| 14 | First-use check | Send a brief check-in to non-activated participants. Ask what blocked them; offer help without requesting account credentials or sensitive records. |
| 15 | Wave 1 review | Review activation, support load, and all high-impact reports. Decide whether to hold, fix, or invite the next small wave. Update the scorecard. |
| 16 | Fix and explain | Prioritize wave 1 issues. Update known limitations and onboarding copy. Tell affected participants about any action they need to take. |
| 17 | Invite wave 2 | If the expansion gate passes, invite up to 5–7 additional testers with a different freelancer profile or workflow. Otherwise keep the cohort closed. |
| 18 | Workflow sessions | Run 2–3 short interviews or observed sessions. Focus on one task each: recording a transaction, reviewing a dashboard, or an enabled invoice/report workflow. |
| 19 | Support review | Check unresolved reports, response time, and repeated questions. Convert repeated support answers into product copy or onboarding improvements. |
| 20 | Midpoint decision | Review open risks and cohort capacity. Keep the cap, pause, or approve a final wave. Record why. |
| 21 | Product iteration | Ship only changes that can be safely reviewed and rolled back. Note the build/version and tell affected testers what changed. |
| 22 | Regression pass | Recheck the changed workflow and adjacent financial totals in the beta environment. Hold new invites if results do not reconcile. |
| 23 | Invite final wave | If gates pass and support is available, invite remaining places up to the 20-person suggested cap. Do not exceed capacity to hit a metric. |
| 24 | Repeat-use check | Ask active testers what they returned to do and what they still rely on another tool for. Track the answer without asking for exact balances. |
| 25 | Accessibility and clarity | Review mobile browser use, form validation, empty states, loading/errors, and plain-language descriptions of balances and estimates. |
| 26 | Follow-up interviews | Interview 3–5 participants across active, inactive, and blocked groups. Record themes and anonymized examples. |
| 27 | Cohort pulse | Send the short closing survey in the participant kit. Ask whether they want to remain in the beta and separately ask permission for future updates. |
| 28 | Synthesis | Group findings into correctness/security, onboarding, usability, missing capability, and support. Rank each by user impact and evidence. |
| 29 | Decision review | Review scorecard, open issues, support burden, and user evidence. Draft the decision: extend beta, fix then continue, broaden access, or stop/pause. |
| 30 | Close the loop | Record the decision and next owner/date. Thank participants, explain what happens to beta access and data, and share only commitments the team can meet. |

## Daily operating rhythm during external beta

- Check the support channel at the start and end of each working day.
- Triage any suspected financial mismatch, missing data, cross-account access, or privacy exposure immediately using the [feedback and operations guide](feedback-operations.md).
- Keep a short changelog with date, build, change, known issue, and participant impact.
- Update the scorecard at Days 15, 20, 27, and 30; record qualitative evidence alongside counts.

## Day 30 decision options

1. **Continue closed beta:** Evidence is useful, but high-priority fixes or additional workflow coverage remain.
2. **Broaden access gradually:** Release gates remain satisfied, support capacity is sufficient, and the evidence supports a larger cohort.
3. **Pause:** A serious correctness, security, reliability, or support issue needs containment.
4. **End this beta:** The learning objective is met or the product direction needs revision. Tell participants what happens next and follow the stated data-retention policy.

