# Git Usage Evidence Checklist

Use this checklist before submission to maximize rubric score for repository management.

## Repository Hygiene

- [ ] `main` branch is stable and buildable
- [ ] Feature branches are used instead of direct commits to `main`
- [ ] Commit messages are descriptive and scoped

## Commit Quality

- [ ] No generic messages like `changes` or `done`
- [ ] Commits grouped by logical unit (routing, validation, CRUD, API)
- [ ] Bug fixes and features are separated

## Collaboration Signals

- [ ] At least one reviewed pull request per feature area
- [ ] Team members commit to their owned modules
- [ ] Merge commits show coordinated integration timeline

## Verification Commands

```bash
git log --oneline --decorate --graph --all
git shortlog -sne
git branch --all
```

## Submission Attachments

- [ ] Commit history screenshot
- [ ] Branch/PR screenshot
- [ ] Contributor summary screenshot
- [ ] README + CONTRIBUTING + TEAM_COORDINATION docs included
