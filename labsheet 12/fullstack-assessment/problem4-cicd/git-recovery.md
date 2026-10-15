# P4(b) Recover commits lost to a force-push on main

```bash
# 1. Find the old tip of main (before the force-push)
git fetch origin                       # note: this updates origin/main to the NEW (bad) history
git reflog show origin/main            # shows previous positions of origin/main, e.g. abc1234 origin/main@{1}
#    (or run `git reflog` on a teammate's machine whose local main still has the commits)

# 2. Inspect it to confirm the 3 missing commits are there
git log --oneline abc1234

# 3. Create a branch pointing at the old tip so the commits can't be garbage-collected
git branch recovery abc1234

# 4. Publish it safely (new branch, no force needed)
git push origin recovery

# 5. Restore into main through a normal merge (no history rewrite)
git switch main
git pull origin main
git merge recovery                     # resolve conflicts if any
git push origin main
```

**Prevention:** enable *branch protection* on `main` (GitHub: Settings -> Branches) to
block force pushes and deletions, and require pull requests with reviews before merging.
