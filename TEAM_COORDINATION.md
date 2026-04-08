# Team Coordination Plan

This document provides explicit task ownership and collaboration proof for evaluation.

## Team Task Distribution

- Member A: Routing, authentication, protected routes
- Member B: Student dashboard, questionnaire, profile updates
- Member C: Counselor workflows, sessions, chat
- Member D: Admin panel and CRUD (users/resources/career paths)
- Member E: API integration, error handling, validation consistency

## Coordination Workflow

1. Plan tasks at sprint start with module owners.
2. Create branch per task: `feature/<module>-<task>`.
3. Open PR with:
   - problem statement
   - implementation summary
   - screenshots/video proof
   - test evidence
4. Mandatory peer review before merge.
5. Track blockers in daily sync.

## Contribution Evidence Checklist

- Distinct commits by module
- PR review comments
- Clear commit messages (`feat`, `fix`, `refactor`, `docs`)
- Merge history showing parallel feature work

## Meeting Cadence

- Daily: 10 minute progress sync
- Twice weekly: integration review
- Before demo: end-to-end walkthrough rehearsal
