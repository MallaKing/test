# Full-Stack Application with Intentional Bugs

This is a carefully crafted full-stack application containing subtle bugs in multiple layers, designed to trigger CI/CD pipeline failures and webhook notifications to an AI-enabled debug server.

## Architecture

```
testgit/
├── server/              # Node.js/Express backend
├── client/              # React frontend
├── .github/workflows/   # GitHub Actions CI/CD
└── package.json         # Monorepo configuration
```

## Intentional Bugs by Category

### 1. Backend Application Layer Bugs

#### `server/src/index.js`
- **Line 20**: Health check endpoint uses `POST` instead of `GET` (should be REST-compliant)

#### `server/src/database.js`
- **Line 40**: No password hashing - passwords stored in plain text (CRITICAL security issue)
- **Line 48**: Priority validation missing - accepts any value, no bounds checking
- **Line 74**: Returns `undefined` instead of empty array when no tasks found (inconsistent API)
- **Line 105**: Missing transaction support causes race conditions in concurrent requests

#### `server/src/routes.js`
- **Line 23**: Email validation incomplete - doesn't check for `@` symbol
- **Line 36**: 404 response doesn't include response body (violates REST conventions)
- **Line 44**: Returns 200 instead of 201 Created for new resource
- **Line 60**: No userId existence validation before creating tasks (data integrity issue)
- **Line 85**: DELETE endpoint returns 204 with no body but should include deleted resource info
- **Line 120**: Completion rate calculation error: `(completed / (tasks.length - 1)) * 100` causes off-by-one error
- **Line 130**: External API uses `http://` instead of `https://` (security downgrade)
- **Line 132**: API timeout set to 100ms (too short for real APIs)

#### `server/src/middleware/errorHandler.js`
- **Line 7**: Always returns 500 regardless of error type (doesn't distinguish error codes)
- **Line 12**: Exposes error stack trace in responses (information disclosure)

### 2. Frontend/Client Layer Bugs

#### `client/src/api.js`
- **Line 12**: No request timeout set (can hang indefinitely)
- **Line 28**: No null check on response data
- **Line 45**: Expects JSON response from DELETE endpoint that returns 204 No Content

#### `client/src/App.jsx`
- **Line 22**: Missing `userId` in useEffect dependency array (stale closure bug)
- **Line 35**: No error handling for network failures in catch block (error swallowed)
- **Line 44**: Creates user instead of authenticating (no actual login logic)
- **Line 65**: Generic error message instead of showing server-specific errors
- **Line 71**: No server-side priority validation (only client-side)
- **Line 76**: Form doesn't reset after successful submission
- **Line 121**: Variable shadowing - `user` parameter overwritten by response

#### `client/src/components/TaskForm.jsx`
- **Line 17**: Whitespace-only titles not properly validated (trim check exists but incomplete)
- **Line 21**: Server doesn't enforce priority validation (client check insufficient)

#### `client/src/components/TaskList.jsx`
- **Line 13**: No error boundary - malformed task object crashes entire component
- **Line 25**: Array indexing without bounds check on priority levels

### 3. Networking & Protocol Issues

- Backend returns wrong HTTP status codes (200 vs 201, 204 without body)
- External API calls use HTTP instead of HTTPS
- CORS configuration hardcoded for localhost (not suitable for production)
- Client proxy configuration hardcoded
- No connection retry logic on network failures
- Missing timeout configurations leading to potential hangs

### 4. Git Workflow & CI/CD Issues

#### `.github/workflows/ci.yml`
- Webhook URL stored as secret but not validated before use
- Tests continue on error (failures silently pass)
- Coverage reports uploaded but not checked against thresholds
- No notification on successful builds

#### `.github/workflows/quality.yml`
- Code quality metrics not enforced
- BUG comments detected but not failed
- Security scan failures don't block merge

### 5. Data Integrity Issues

- No database transactions
- Race conditions in concurrent task updates
- No input sanitization for database queries
- Missing foreign key validations
- No audit logging of changes

### 6. Missing Security Features

- No authentication/authorization
- Passwords stored plaintext
- No HTTPS enforcement
- No input validation on backend
- No rate limiting
- No CORS validation
- Security stack trace exposure

## Running the Application

```bash
# Install all dependencies
npm install
npm install --workspace=server
npm install --workspace=client

# Development
npm run dev  # Starts both server and client

# Server only
npm run server:dev

# Client only
npm run client:dev

# Testing
npm run test  # Runs all tests

# Tests will fail due to intentional bugs
```

## Expected Test Failures

When running `npm run test --workspace=server`, you should see failures in:

1. **User Registration Tests**
   - Email validation test (no @ check)
   - User 404 response format test

2. **Task Management Tests**
   - Task creation status code (201 vs 200)
   - Task deletion response body
   - Priority validation test
   - Status validation test

3. **Analytics Tests**
   - Completion rate calculation (off-by-one error)

4. **Health Check Tests**
   - HTTP method validation

5. **External API Tests**
   - HTTPS enforcement
   - Timeout configuration

## Webhook Integration

The GitHub Actions workflows are configured to send webhook notifications to an AI-enabled debug server on failure:

```json
{
  "repository": "owner/testgit",
  "branch": "main",
  "commit": "abc123...",
  "author": "developer",
  "workflow_run_id": "12345",
  "failure_type": "ci_test_failure",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Webhook Configuration

Set the following GitHub secret:
- `AI_SERVER_WEBHOOK`: Your AI debug server endpoint

Example: `https://your-ai-server.com/api/webhook/github`

## Bug Detection Strategy

The bugs are designed to be subtle:

1. **Logic Errors**: Off-by-one, race conditions, inconsistent state
2. **Validation Gaps**: Missing server-side validation duplicating client checks
3. **Protocol Misuse**: Wrong HTTP methods, missing status codes, incorrect response formats
4. **Security Issues**: Plaintext passwords, HTTP instead of HTTPS, exposed stacks
5. **Error Handling**: Silent failures, wrong error codes, missing context
6. **Concurrency Issues**: Missing transactions, race conditions
7. **Configuration Issues**: Hardcoded values, missing environment variables

## AI Server Integration

The AI debug server should:

1. **Receive webhook** from failed CI pipeline
2. **Clone repository** to analyze code
3. **Parse test failures** and error logs
4. **Identify bug patterns**:
   - Incorrect HTTP status codes
   - Missing validation layers
   - Protocol misuse
   - Data integrity issues
   - Security vulnerabilities
5. **Generate patches** to fix each bug
6. **Run verification** tests to confirm fixes
7. **Create PR** or commit fixes back

## Testing Against AI Server

Example AI server workflow:

```bash
# AI server receives webhook
POST /api/webhook/github {
  repository: "owner/testgit",
  failure_type: "ci_test_failure"
}

# AI server:
1. Clones repo
2. Runs tests to see failures
3. Analyzes code for:
   - Wrong status codes → Fix to 201/204
   - Missing validation → Add server-side checks
   - Protocol issues → Enforce HTTPS
   - Logic errors → Fix calculation
4. Creates comprehensive fixes
5. Verifies fixes pass all tests
6. Pushes back to repo
```

## Subtle Bug Examples

### Example 1: Off-by-One Error
```javascript
// Bug: Division by tasks.length - 1 instead of tasks.length
const completionRate = (completed / (tasks.length - 1)) * 100;
// With 5 tasks and 2 completed: 2/4 = 50% (wrong! should be 2/5 = 40%)
```

### Example 2: Missing Validation Layer
```javascript
// Client validates priority
if (priority < 1 || priority > 5) throw Error;

// But server DOESN'T validate - accepts any value
db.run('INSERT INTO tasks ... priority = ?', [priority]);
```

### Example 3: Wrong HTTP Protocol
```javascript
// Hardcoded HTTP instead of HTTPS
axios.get('http://jsonplaceholder.typicode.com/posts/1');
```

### Example 4: Race Condition
```javascript
// No transaction - concurrent deletes can cause corruption
db.run('DELETE FROM tasks WHERE id = ?', [taskId]);
```

## Verification Checklist

- [ ] Clone repository
- [ ] Install dependencies
- [ ] Run test suite (should fail)
- [ ] Document failures
- [ ] Push to GitHub
- [ ] Verify CI/CD triggers
- [ ] Confirm webhook sends to AI server
- [ ] AI server detects and fixes bugs
- [ ] Verify all tests pass after fixes

## License

This project is intentionally buggy for educational/testing purposes.
