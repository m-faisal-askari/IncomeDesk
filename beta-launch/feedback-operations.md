# Feedback and Beta Operations

## One intake path

Use one controlled issue log with access limited to the beta team. Keep user identity separate from issue details where possible. Do not paste sensitive financial records into ordinary chat, analytics, or issue trackers.

Ask for: report ID, date/time and timezone, build, page/workflow, expected result, observed result, frequency, browser/device, whether the participant is blocked, and permission to follow up. Ask participants to redact names, amounts, account numbers, invoice details, and screenshots before submitting.

Copy this template for each report:

```text
Report ID:
Date/time and timezone:
Build/version:
Page or workflow:
What I was trying to do:
What I expected:
What happened:
Can I reproduce it? (always / sometimes / once / unsure)
How blocked am I? (blocked / workaround / cosmetic)
Browser and device:
Redacted screenshot or steps (optional):
May we follow up? (yes/no)
```

## Severity and response

Use severity to decide containment, not to judge the participant's report.

| Severity | Examples | Action |
|---|---|---|
| S0 — Critical | Suspected cross-user access or exposure; lost/corrupted financial records; materially incorrect core totals affecting multiple users; active account compromise | Stop invitations and affected workflow immediately. Notify the engineering and launch leads through the incident channel. Preserve relevant logs safely, assess scope, and contact affected users using the incident process. Resume only after containment and a recorded go/no-go review. |
| S1 — High | Core task blocked; invoice payment or balance mismatch; repeatable calculation error; authentication failure affecting a cohort | Acknowledge promptly during staffed hours. Assign an owner the same day, assess affected users, and pause cohort expansion until a workaround or fix is reviewed. |
| S2 — Normal | Confusing copy, non-critical display issue, or a task with a reasonable workaround | Log and acknowledge within two working days when possible. Prioritize against participant impact and repetition. |
| S3 — Suggestion | Enhancement idea or low-impact polish | Log for synthesis. Do not promise delivery during the beta. |

Any suspected data exposure or financial mismatch is at least S1 until reviewed. Increase severity when scope or impact is uncertain. The support owner should not attempt to diagnose or request sensitive values in an open channel.

## Daily triage routine

1. Check the support channel and issue log at the start and end of each working day.
2. Acknowledge the report, assign an ID, classify severity, and tell the participant whether they should stop using the affected workflow.
3. Route correctness, access, data-loss, or privacy reports to engineering immediately.
4. Record affected build, user scope, reproduction status, containment, and owner. Keep sensitive evidence in an approved restricted location only.
5. Tell the participant when the issue is contained or when more information is needed. Never promise an unconfirmed fix date.
6. At each cohort gate, review open S0/S1 items and repeated reports before sending more invitations.

## Interview and feedback handling

- Ask users to show the path they took, not to reveal financial records.
- Separate observation from interpretation: write down what the participant did/said, then add the team's hypothesis separately.
- Record consent for interviews and future updates separately.
- Summarize findings with anonymized IDs; remove personal and financial details from shareable notes.
- Close the loop with a short status message. Acknowledge the report even when it will not be addressed in this beta.

## Incident message template

**Subject:** IncomeDesk beta: action needed for [workflow]

We are investigating an issue affecting [brief, confirmed scope]. Please stop using [specific workflow] until we send an update. Your existing records should remain available only if confirmed by engineering; do not make decisions from the affected beta output. We will update you through [channel] by [next update time]. For urgent concerns, contact [support contact].

Only send this after the incident owner confirms the scope and participant action. If scope is unknown, say that it is under investigation rather than making assurances.

