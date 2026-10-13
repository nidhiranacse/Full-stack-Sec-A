# Lab Sheet 12 Problem 4: Git Disaster Recovery & Merge Conflict Resolution

**Student Name:** Pulkit Goyal  
**CUID:** CU24250263  
**Roll Number:** 40  
**Section:** A  
**Course:** Full Stack Web Development (B.Tech CSE)  

---

## 1. Scenario 1: Recovering from an Accidental `git reset --hard`

### The Problem:
A developer ran `git reset --hard HEAD~2` and accidentally obliterated the last two commits that had unpushed work.

### Step-by-Step Resolution:
1. **Inspect reference logs:**
   ```bash
   git reflog
   ```
   *Output shows previous HEAD pointers:*
   ```text
   b3a1f9e HEAD@{0}: reset: moving to HEAD~2
   7c28d1a HEAD@{1}: commit: Add JWT authentication middleware
   9d45e02 HEAD@{2}: commit: Create User model and migration
   ```

2. **Recover the lost commit:**
   Point a new recovery branch to the lost commit `7c28d1a`:
   ```bash
   git branch recovery-branch 7c28d1a
   git checkout recovery-branch
   ```

3. **Verify state:**
   Check that all files and commit history are completely restored:
   ```bash
   git log --oneline -n 3
   ```

---

## 2. Scenario 2: Resolving a Complex Git Merge Conflict

### The Problem:
Merging feature branch `feature/events-api` into `main` resulted in conflict markers in `routes/events.js`.

### Step-by-Step Resolution:
1. **Identify conflicted files:**
   ```bash
   git status
   # Shows: both modified: routes/events.js
   ```

2. **Inspect conflict markers:**
   ```javascript
   <<<<<<< HEAD (current change on main)
   const eventRoutes = require('./routes/event.routes');
   app.use('/api/v1/events', eventRoutes);
   =======
   const eventRoutes = require('./routes/events');
   const { verifyToken } = require('./middleware/auth');
   app.use('/api/v2/events', verifyToken, eventRoutes);
   >>>>>>> feature/events-api (incoming change)
   ```

3. **Manually reconcile the code:**
   Combine the authentication requirement with standard routing:
   ```javascript
   const eventRoutes = require('./routes/event.routes');
   const { verifyToken } = require('./middleware/auth');
   app.use('/api/v1/events', verifyToken, eventRoutes);
   ```

4. **Stage and commit resolution:**
   ```bash
   git add routes/events.js
   git commit -m "Merge: resolve conflict in routes/events.js with auth middleware"
   ```

---

## 3. Scenario 3: Escaping a Detached HEAD State

### The Problem:
Checking out a commit hash directly (`git checkout 8f4e21a`) leaves HEAD detached from any branch. New commits made here are vulnerable to garbage collection.

### Step-by-Step Resolution:
```bash
# Save commits made in detached HEAD to a designated new branch:
git branch fix-detached-head

# Switch to the new branch:
git checkout fix-detached-head

# Safely merge back into main:
git checkout main
git merge fix-detached-head
```
