# Contributing Guide

This project uses a lightweight team workflow to keep contribution history clear and consistent.

## Branching Convention

- `main`: stable integration branch
- `feature/<module>-<short-task>`: new features
- `fix/<module>-<short-task>`: bug fixes
- `docs/<topic>`: documentation updates

Examples:

- `feature/auth-token-session`
- `feature/student-form-validation`
- `fix/session-time-window`

## Commit Message Convention

Use clear, action-based commit messages:

- `feat(auth): add persisted token session restore`
- `fix(validation): prevent signup password mismatch`
- `refactor(api): centralize endpoint fallback requests`
- `docs(readme): add routing and workflow documentation`

Avoid generic commit messages such as:

- `changes`
- `updated code`
- `done`

## Pull Request Checklist

Before opening a PR:

1. Rebase or merge latest `main`
2. Run `npm run lint`
3. Run `npm run build`
4. Add a short PR summary:
   - What changed
   - Why it changed
   - How to test

## Suggested Team Coordination Model

- Assign one owner per module:
  - Auth/Routing
  - Student flows
  - Counselor flows
  - Admin/Resources
  - API utilities
- Use short daily sync notes:
  - Done
  - In progress
  - Blockers
- Use PR reviews to ensure cross-module visibility and balanced contribution.
