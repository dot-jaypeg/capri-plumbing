# Git workflow

Auto-commit and auto-push changes after completing a task — do not stop to ask for
confirmation first. This site auto-deploys (Railway) on push to `main`, so pushing
is how a fix actually reaches the live site the user is checking against.

- Commit only the files relevant to the task just completed. Don't sweep up
  unrelated untracked/modified files sitting in the working tree.
- Use a concise commit message describing the change, same style as existing
  history (`git log --oneline`).
- Push to `origin main` right after committing.
- Still avoid destructive git operations (force-push, reset --hard, etc.)
  without explicit confirmation — this instruction covers normal commit/push only.
