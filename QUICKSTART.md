# Quick Start Guide

## Project Overview

This is a **deliberately buggy full-stack application** designed to:
- Trigger CI/CD pipeline failures
- Send webhook notifications to an AI debug server
- Allow AI to detect and fix bugs automatically

### Project Structure
```
testgit/
├── server/              # Node.js/Express backend (port 3001)
├── client/              # React frontend (port 3000)
├── .github/workflows/   # GitHub Actions CI/CD with webhook integration
├── README.md            # Complete bug documentation
├── BUGS.md              # Detailed bug inventory
└── WEBHOOK_INTEGRATION.md   # AI server setup guide
```

## Quick Start

### 1. Setup

```bash
# Navigate to project
cd c:\Desktop\testgit

# Install all dependencies
npm install
npm install --workspace=server
npm install --workspace=client

# Install nodemon globally for development (optional)
npm install -g nodemon
```

### 2. Run Tests (to see failures)

```bash
# Run server tests - WILL FAIL due to bugs
npm run test --workspace=server

# Expected failures:
# ✗ Health check GET vs POST
# ✗ User registration email validation
# ✗ Task creation status code (201 vs 200)
# ✗ Task deletion response body
# ✗ Analytics off-by-one error
# ✗ External API protocol (HTTP vs HTTPS)
# ✗ Task status validation
```

### 3. Run Application (optional)

```bash
# In one terminal - start backend
npm run server:dev
# Server runs on http://localhost:3001

# In another terminal - start frontend
npm run client:dev
# Client runs on http://localhost:3000
```

### 4. Push to GitHub

```bash
# Create GitHub repo and add remote
git remote add origin https://github.com/YOUR_USERNAME/testgit.git

# Create main branch (if needed)
git branch -M main

# Push code
git push -u origin main
```

### 5. Configure GitHub Webhook Secret

1. Go to repository Settings → Secrets and variables → Actions
2. Create new secret: `AI_SERVER_WEBHOOK`
3. Value: `https://your-ai-server.com/api/webhook/github`
4. Click Add secret

### 6. Verify CI/CD Triggers

- Push code to GitHub
- Go to Actions tab
- Watch workflows run and fail
- Check webhook notifications (if AI server is running)

## Bug Categories at a Glance

### Backend Bugs (server/src/)
| Bug | File | Line | Impact |
|-----|------|------|--------|
| Plain text passwords | database.js | 40 | CRITICAL - Security |
| Missing validation | routes.js | 21, 60 | HIGH - Data integrity |
| Wrong HTTP methods | index.js | 20 | MEDIUM - REST violation |
| Wrong status codes | routes.js | 44, 85 | MEDIUM - REST violation |
| Off-by-one error | routes.js | 120 | MEDIUM - Logic error |
| HTTP vs HTTPS | routes.js | 130 | HIGH - Security |
| Short timeout | routes.js | 132 | MEDIUM - Networking |
| Race conditions | database.js | 105 | HIGH - Concurrency |

### Frontend Bugs (client/src/)
| Bug | File | Impact |
|-----|------|--------|
| Missing useEffect dependency | App.jsx | Stale closure |
| No error handling | api.js, App.jsx | Silent failures |
| No timeout set | api.js | Can hang indefinitely |
| Array bounds issue | TaskList.jsx | Potential crash |
| Wrong HTTP status handling | api.js | 204 response parsing |

### Workflow Bugs (.github/workflows/)
| Bug | File | Impact |
|-----|------|--------|
| Tests continue on error | ci.yml | Failures masked |
| No threshold checks | quality.yml | Quality issues ignored |

## Testing Scenarios

### Scenario 1: User Registration
```bash
# Should fail: Email validation incomplete (no @ check)
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"invalid-no-at","password":"pass123"}'
# Result: Success (wrong!) - should reject invalid email
```

### Scenario 2: Task Creation
```bash
# Test 1: Wrong status code (returns 200 instead of 201)
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"userId":"u1","title":"Task","priority":1}'
# Result: Status 200 (wrong! should be 201)

# Test 2: Invalid priority accepted (should be 1-5)
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"userId":"u1","title":"Task","priority":999}'
# Result: Success (wrong! should reject)
```

### Scenario 3: Health Check
```bash
# Should fail: Health check endpoint only accepts POST, not GET
curl -X GET http://localhost:3001/health
# Result: 404 (wrong! should return 200)

curl -X POST http://localhost:3001/health
# Result: 200 OK (wrong! should be GET)
```

### Scenario 4: Analytics Calculation
```bash
# Create 5 tasks, complete 2, check analytics
# Expected: 2/5 = 40%
# Actual: 2/4 = 50% (off-by-one error)
curl http://localhost:3001/api/analytics/USER_ID
```

## Expected Test Output

When you run `npm run test --workspace=server`, expect:

```
FAIL  src/test.js
  User Endpoints
    ✓ POST /api/users should create a user with valid data
    ✓ POST /api/users should reject missing fields
    ✓ GET /api/users/:id should return user by id
    ✗ GET /api/users/:id should return 404 with response body
    ✗ Email validation should check for @ symbol
    ...
  Task Endpoints
    ✗ POST /api/tasks should create a task and return 201
    ✗ POST /api/tasks should reject invalid userId
    ✗ POST /api/tasks should validate priority range
    ✗ PUT /api/tasks/:id/status should validate status values
    ...
  Analytics Endpoint
    ✗ GET /api/analytics/:userId should calculate completion rate correctly
    ...
  Health Check
    ✗ Health check should use GET method, not POST
    ...

Test Suites: 1 failed, 0 passed
Tests:       12 failed, 15 passed
```

## How AI Server Should Detect Bugs

### Pattern 1: Status Code Mismatch
```
Test: expect(res.statusCode).toBe(201)
Failure: Expected 201 but got 200
Location: POST /api/tasks
Fix: Change res.json(task) to res.status(201).json(task)
```

### Pattern 2: Missing Validation
```
Test: Email validation should check for @ symbol
Failure: Invalid email accepted
Code: No @ check in createUser()
Fix: Add email.includes('@') validation
```

### Pattern 3: Logic Error
```
Test: Completion rate should be 40% (2/5)
Failure: Got 50% instead
Code: (completed / (tasks.length - 1)) * 100
Fix: Change to (completed / tasks.length) * 100
```

## Files Reference

| File | Purpose |
|------|---------|
| README.md | Comprehensive bug documentation |
| BUGS.md | Detailed inventory with severity levels |
| WEBHOOK_INTEGRATION.md | How to set up AI server integration |
| .github/workflows/ci.yml | Main test and webhook trigger workflow |
| .github/workflows/quality.yml | Code quality checks |
| server/src/ | Backend with bugs |
| server/src/test.js | Comprehensive test suite |
| client/src/ | Frontend with bugs |

## Helpful Commands

```bash
# Run tests with verbose output
npm run test --workspace=server -- --verbose

# Run specific test file
npm run test --workspace=server -- src/test.js

# Run tests in watch mode
npm run test:watch --workspace=server

# Check test coverage
npm run test --workspace=server -- --coverage

# Lint code (if configured)
npm run lint --workspace=server

# View git log
git log --oneline --graph --all

# See uncommitted changes
git status
git diff
```

## Push to GitHub

```bash
# Set up GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/testgit.git
git branch -M main

# First push (with --force if needed)
git push -u origin main

# Subsequent pushes
git push

# Create and push feature branch
git checkout -b feature/new-feature
git push -u origin feature/new-feature
```

## Monitoring CI/CD

1. **GitHub Actions** → See workflow runs and logs
2. **Webhook calls** → Check your AI server logs
3. **Test artifacts** → Download test results from Actions
4. **PR comments** → AI server can comment with fixes

## Next Steps

1. ✅ Code is ready with intentional bugs
2. ✅ Tests are comprehensive and will fail
3. ✅ Workflows configured with webhook triggers
4. 📝 Push to GitHub
5. 🔧 Set up AI server webhook endpoint
6. 🚀 Configure GitHub secret with webhook URL
7. 🔄 Push changes to trigger CI/CD
8. 📊 Monitor webhook notifications
9. 🤖 AI server detects and fixes bugs
10. ✨ Automated PRs with corrections

## Troubleshooting

### npm install fails
```bash
# Clear npm cache
npm cache clean --force

# Install with legacy peer deps
npm install --legacy-peer-deps
```

### Port already in use
```bash
# Kill process on port 3001
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Or use different ports
PORT=3002 npm run server:dev
```

### Git issues
```bash
# Check git config
git config --list --local

# Reset to clean state
git reset --hard HEAD
git clean -fd
```

## Support

For detailed bug information, see:
- **README.md** - Full documentation
- **BUGS.md** - Bug inventory with severity
- **WEBHOOK_INTEGRATION.md** - AI server setup

---

**Ready to test?** Push to GitHub and watch the magic happen! 🎉
