# P4(b) Recovering commits lost to a force-push

1. Find the lost commits. Your local clone still remembers where origin/main pointed before the push:
   git fetch origin            # (skip if you have not fetched since the force-push; the old tip is only in your reflog)
   git reflog show origin/main # look for the entry just before "forced-update"; note its <sha>
   # or: git reflog  (local branch)  /  ask a teammate who still has the old main to run: git log -1 --format=%H main
2. Verify the sha holds the missing work:
   git log --oneline <sha> -10
3. Pin it to a branch so it cannot be garbage-collected, and publish it:
   git branch recovery <sha>
   git push origin recovery
4. Restore main (after the team agrees):
   git switch main && git merge recovery       # or: git push --force-with-lease origin recovery:main

Prevention: enable branch protection on main (GitHub: Settings > Branches) to block force pushes and
require pull requests with review.
