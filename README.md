# Problem 4: Git and CI/CD Pipeline

## Part (a) Solution

The GitHub Actions workflow:

- Runs on pushes to main.
- Runs on pull requests to main.
- Tests Node.js 18 and Node.js 20.
- Uses npm dependency caching.
- Runs lint before tests.
- Runs a separate deploy job.
- Deploy runs only on pushes to main.
- Deploy runs only when the test job passes.

Workflow file:

.github/workflows/ci.yml

## Part (b) Solution

If a teammate force-pushes main and commits disappear, first fetch all references:

git fetch --all --prune

Check the history:

git log --oneline --graph --all

Check the reflog:

git reflog --all

Find the missing commit hashes and verify them:

git show <commit1>
git show <commit2>
git show <commit3>

Create a recovery branch:

git checkout -b recover-lost-commits

Restore the commits:

git cherry-pick <commit1> <commit2> <commit3>

Push the recovery branch:

git push origin recover-lost-commits

Then create a Pull Request from recover-lost-commits to main.

## Prevention

Enable branch protection/rulesets on main and disable force pushes.

## Expected CI/CD Result

Node 18 -> Lint -> Test -> PASS
Node 20 -> Lint -> Test -> PASS
Deploy -> PASS
