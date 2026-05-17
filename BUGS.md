# Bug Documentation

## Complete Bug Inventory

### Critical Bugs (Security)

1. **Plain Text Passwords**
   - File: `server/src/database.js:40`
   - Severity: CRITICAL
   - Description: Passwords stored without hashing
   - Fix: Use bcrypt.hash() before storing

2. **HTTP Protocol Usage**
   - File: `client/src/api.js:130`, `server/src/routes.js:130`
   - Severity: HIGH
   - Description: External APIs called via HTTP instead of HTTPS
   - Fix: Change to https://

3. **Error Stack Exposure**
   - File: `server/src/middleware/errorHandler.js:12`
   - Severity: HIGH
   - Description: Stack traces exposed to clients
   - Fix: Only show stack in development environment

### High Priority Bugs (Data Integrity)

4. **Missing Validation Layers**
   - File: `server/src/routes.js:21, :60`
   - Severity: HIGH
   - Description: Server doesn't validate priority, email, userId
   - Fix: Add validation before database operations

5. **Race Conditions**
   - File: `server/src/database.js:105`
   - Severity: HIGH
   - Description: No transaction support for concurrent operations
   - Fix: Use database transactions or mutex locks

6. **Off-by-One Error**
   - File: `server/src/routes.js:120`
   - Severity: MEDIUM
   - Description: `(completed / (tasks.length - 1)) * 100` formula
   - Fix: Change to `(completed / tasks.length) * 100`

### Medium Priority Bugs (REST Violations)

7. **Wrong HTTP Methods**
   - File: `server/src/index.js:20`
   - Severity: MEDIUM
   - Description: Health check uses POST instead of GET
   - Fix: Change to GET

8. **Wrong Status Codes**
   - File: `server/src/routes.js:44, :85`
   - Severity: MEDIUM
   - Description: Returns 200 instead of 201 for creation, 204 without body for delete
   - Fix: Use correct HTTP status codes

9. **Missing Response Bodies**
   - File: `server/src/routes.js:36, :85`
   - Severity: MEDIUM
   - Description: 404 and 204 responses don't include proper bodies
   - Fix: Include appropriate JSON response bodies

### Low Priority Bugs (Code Quality)

10. **Stale Closure**
    - File: `client/src/App.jsx:22`
    - Severity: LOW
    - Description: Missing userId in useEffect dependency
    - Fix: Add userId to dependency array

11. **Missing Error Handling**
    - File: `client/src/api.js:12, :35`
    - Severity: LOW
    - Description: No timeout, no error interceptor
    - Fix: Add timeout and error handling middleware

12. **Array Bounds Issues**
    - File: `client/src/components/TaskList.jsx:25`
    - Severity: LOW
    - Description: Priority level array access without bounds check
    - Fix: Add bounds validation

## Bug Detection Test Cases

Each bug should trigger at least one test failure:

```
✗ User Registration - Email validation test fails
✗ Task Creation - Returns 200 instead of 201
✗ Task Deletion - No response body
✗ Task Analytics - Completion rate off-by-one
✗ Task Status - Invalid status accepted
✗ Health Check - POST method instead of GET
✗ User Not Found - 404 without response body
✗ Priority Validation - Server accepts invalid values
✗ External API - HTTP instead of HTTPS, timeout too short
```

## Testing Priority

Run tests in this order to reveal bugs:

1. Health check endpoint tests
2. User registration and validation tests
3. Task CRUD operation tests
4. Analytics calculation tests
5. External API tests
6. Error handling tests
