# Problem 4(b): Recovering Force-Pushed Commits

## Scenario
A teammate force-pushed to `main` and three commits from other developers have disappeared from the remote history.

## Recovery Commands

```bash
# 1. Use git reflog to find the lost commits.
#    The reflog records every position HEAD has been at locally.
#    Look for the last known good commit before the force-push.
git reflog show origin/main

# 2. Identify the SHA of the commit that was the tip of main
#    BEFORE the force-push (e.g., abc1234).

# 3. Create a recovery branch pointing to that commit.
git branch recovery abc1234

# 4. Verify the recovery branch has the missing commits.
git log recovery --oneline

# 5. Push the recovery branch to the remote to preserve the commits.
git push origin recovery

# 6. Now merge the recovery branch back into main, or reset main
#    to the correct commit.
git checkout main
git merge recovery

# 7. Force-push main back to the correct state (with team agreement).
git push origin main

# Alternative: If no local copy has the reflog, ask a teammate who
# still has the old main in their local repo to push the recovery
# branch from their machine.
```

## Prevention: Team-Level Rule

**Enable branch protection on `main`:**
- Go to **Settings → Branches → Branch protection rules** in GitHub.
- Enable **"Require pull request reviews before merging"**.
- Enable **"Do not allow force pushes"** (blocks `git push --force`).
- Optionally enable **"Require status checks to pass before merging"**.

This ensures no one can force-push to `main`, and all changes must go through reviewed pull requests. This is the single most effective rule to prevent this class of issue.
