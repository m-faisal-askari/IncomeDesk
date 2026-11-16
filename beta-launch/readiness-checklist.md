# Beta Readiness Checklist

Use this checklist before the first invitation and repeat the rollout section before each new cohort. Record the owner and evidence for each critical item; a checked box without evidence is not a release decision.

## Product and scope

- [ ] The beta build and URL are confirmed; the team knows which environment is production.
- [ ] The enabled features and known limitations match the participant materials.
- [ ] A visible way to report a problem is available from the product or onboarding materials.
- [ ] The beta cohort limit matches the team's support capacity.
- [ ] Participants know this is a beta and should keep their existing financial records.
- [ ] Tax numbers are described as estimates; the beta is not tax filing or professional advice.

## Privacy and access

- [ ] Authentication and account recovery work in the intended environment.
- [ ] Authorization and user-level data isolation have been reviewed against the release build.
- [ ] Secrets, credentials, debug endpoints, and development-only authentication are not exposed in production.
- [ ] Privacy policy, terms, data retention/deletion process, and contact details are current and reachable.
- [ ] Analytics and logs avoid transaction descriptions, amounts, account identifiers, and other unnecessary sensitive content.
- [ ] Feedback instructions tell participants not to send passwords, bank credentials, card details, or unredacted statements/receipts.
- [ ] The team knows how to restrict access and contact affected users if data exposure is suspected.

## Financial correctness and reliability

- [ ] Income, expense, account balance, dashboard, and report totals reconcile for representative scenarios.
- [ ] Transfers between owned accounts do not inflate income or expenses.
- [ ] An invoice is not counted as received income until payment is recorded.
- [ ] Payment recording does not create duplicate income and updates the invoice balance consistently.
- [ ] Currency conversions, rounding, and historical-rate behavior are checked for enabled currency workflows.
- [ ] Tax estimates explain their inputs and limitations and can be distinguished from actual tax liability.
- [ ] Database backup status and a recovery/restore path are confirmed by the responsible owner.
- [ ] Error monitoring, support routing, deployment rollback, and pause/disable steps are documented.

## Participant experience and support

- [ ] Signup, first account setup, and the core first-use task have been completed from a fresh user account.
- [ ] Empty, loading, validation, and failure states provide understandable next steps.
- [ ] The participant kit has the correct URL, support channel, known limitations, and response expectations.
- [ ] At least one person unfamiliar with the build has completed the onboarding dry run.
- [ ] Interview/survey questions avoid collecting financial values or other data not needed for the learning goal.
- [ ] A support owner is scheduled to monitor reports during the beta.

## Go/no-go record

| Field | Record |
|---|---|
| Review date | `[date]` |
| Build / environment | `[version and URL]` |
| Launch lead | `[name]` |
| Critical items complete | `[yes/no; link to evidence]` |
| Open risks | `[risk, owner, mitigation]` |
| First cohort size | `[number]` |
| Decision | `[Go / No-go]` |
| Next review date | `[date]` |

**No-go rule:** Any unresolved issue that could expose another user's records, lose or corrupt financial records, materially misstate core financial totals, or leave the team unable to respond to an incident blocks new invitations until contained and reviewed.

## Before each cohort expansion

- [ ] Review all high-severity and repeated reports from the current cohort.
- [ ] Confirm no unresolved critical issue is present.
- [ ] Confirm support coverage and remaining cohort capacity.
- [ ] Confirm any new build has been reviewed for the workflows it changes.
- [ ] Record the expansion decision, cohort size, build, and owner in the scorecard.

