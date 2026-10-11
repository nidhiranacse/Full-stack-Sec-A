# P4(b) Recovering commits lost to a force-push on main

```bash
# 1. Update remote-tracking info (do NOT pull/reset yet)
git fetch origin

# 2. Find the old tip of main. Your local reflog of the remote branch
#    still remembers where origin/main pointed before the force-push.
git reflog show origin/main
#    e.g.  a1b2c3d origin/main@{0}: fetch: forced-update   <- rewritten history
#          9f8e7d6 origin/main@{1}: fetch: fast-forward     <- old tip (has the 3 lost commits)

# 3. Inspect it to confirm the three commits are there
git log --oneline origin/main@{1}
#    (If your own clone never saw the old history, ask a teammate who has it
#     to run:  git reflog   or   git log --oneline origin/main   and send the SHA.)

# 4. Pin the lost commits to a safe branch so they cannot be garbage-collected
git branch recovery 9f8e7d6

# 5. Restore safely WITHOUT another force-push: merge them back into main
git switch main
git pull origin main
git merge recovery          # or: git cherry-pick <sha1> <sha2> <sha3>
git push origin main

# (Only if the team agrees to restore the exact old history:)
# git push --force-with-lease origin recovery:main
```

**Prevention:** enable **branch protection** on `main` (GitHub: Settings -> Branches -> Add rule)
with *"Do not allow force pushes"* and *"Require a pull request before merging"*.
