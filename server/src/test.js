const request = require('supertest');
const app = require('../src/index');
const { createUser, getUserById, createTask, getTasksByUser } = require('../src/database');

describe('Server API Tests', () => {
  describe('User Endpoints', () => {
    test('POST /api/users should create a user with valid data', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.username).toBe('testuser');
    });

    test('POST /api/users should reject missing fields', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({
          username: 'testuser'
        });

      expect(res.statusCode).toBe(400);
    });

    test('GET /api/users/:id should return user by id', async () => {
      const userRes = await request(app)
        .post('/api/users')
        .send({
          username: 'getuser',
          email: 'getuser@example.com',
          password: 'password123'
        });

      const userId = userRes.body.id;
      const getRes = await request(app)
        .get(`/api/users/${userId}`);

      expect(getRes.statusCode).toBe(200);
      expect(getRes.body.username).toBe('getuser');
    });

    test('GET /api/users/:id should return 404 with response body for non-existent user', async () => {
      const res = await request(app)
        .get('/api/users/nonexistent-id');

      // BUG TEST: This should fail because endpoint returns 404 without body
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error');
    });

    test('Email validation should check for @ symbol', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({
          username: 'invaliduser',
          email: 'invalid-email-no-at',
          password: 'password123'
        });

      // BUG TEST: This should fail - no email validation
      expect(res.statusCode).toBe(400);
    });
  });

  describe('Task Endpoints', () => {
    let userId;

    beforeEach(async () => {
      const userRes = await request(app)
        .post('/api/users')
        .send({
          username: 'taskuser' + Date.now(),
          email: `taskuser${Date.now()}@example.com`,
          password: 'password123'
        });
      userId = userRes.body.id;
    });

    test('POST /api/tasks should create a task and return 201', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({
          userId,
          title: 'Test Task',
          description: 'Test Description',
          priority: 1
        });

      // BUG TEST: Returns 200 instead of 201
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('Test Task');
    });

    test('POST /api/tasks should reject invalid userId', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({
          userId: 'invalid-user-id',
          title: 'Test Task',
          description: 'Test Description',
          priority: 1
        });

      // BUG TEST: No validation for userId existence
      expect(res.statusCode).toBe(400);
    });

    test('GET /api/tasks/:userId should return empty array if no tasks', async () => {
      const res = await request(app)
        .get(`/api/tasks/${userId}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    test('PUT /api/tasks/:id/status should update task status', async () => {
      const taskRes = await request(app)
        .post('/api/tasks')
        .send({
          userId,
          title: 'Status Test',
          description: 'Testing status',
          priority: 2
        });

      const taskId = taskRes.body.id;

      const updateRes = await request(app)
        .put(`/api/tasks/${taskId}/status`)
        .send({ status: 'completed' });

      expect(updateRes.statusCode).toBe(200);
      expect(updateRes.body.status).toBe('completed');
    });

    test('PUT /api/tasks/:id/status should validate status values', async () => {
      const taskRes = await request(app)
        .post('/api/tasks')
        .send({
          userId,
          title: 'Invalid Status Test',
          priority: 1
        });

      const taskId = taskRes.body.id;

      const updateRes = await request(app)
        .put(`/api/tasks/${taskId}/status`)
        .send({ status: 'invalid_status' });

      // BUG TEST: No server-side status validation
      expect(updateRes.statusCode).toBe(400);
    });

    test('POST /api/tasks should validate priority range', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({
          userId,
          title: 'Priority Test',
          description: 'Testing priority',
          priority: 999 // Invalid priority
        });

      // BUG TEST: No priority validation
      expect(res.statusCode).toBe(400);
    });

    test('DELETE /api/tasks/:id should return response with deleted task info', async () => {
      const taskRes = await request(app)
        .post('/api/tasks')
        .send({
          userId,
          title: 'Delete Test',
          priority: 1
        });

      const taskId = taskRes.body.id;

      const deleteRes = await request(app)
        .delete(`/api/tasks/${taskId}`);

      expect(deleteRes.statusCode).toBe(204);
      // BUG TEST: No response body returned
      expect(deleteRes.body).toHaveProperty('id');
    });
  });

  describe('Analytics Endpoint', () => {
    let userId;

    beforeEach(async () => {
      const userRes = await request(app)
        .post('/api/users')
        .send({
          username: 'analyticsuser' + Date.now(),
          email: `analyticsuser${Date.now()}@example.com`,
          password: 'password123'
        });
      userId = userRes.body.id;
    });

    test('GET /api/analytics/:userId should calculate completion rate correctly', async () => {
      // Create 5 tasks
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/tasks')
          .send({
            userId,
            title: `Task ${i}`,
            priority: 1
          });
      }

      // Get all tasks and complete 2 of them
      const tasksRes = await request(app)
        .get(`/api/tasks/${userId}`);
      
      const tasks = tasksRes.body;
      if (tasks.length >= 2) {
        await request(app)
          .put(`/api/tasks/${tasks[0].id}/status`)
          .send({ status: 'completed' });
        
        await request(app)
          .put(`/api/tasks/${tasks[1].id}/status`)
          .send({ status: 'completed' });
      }

      const analyticsRes = await request(app)
        .get(`/api/analytics/${userId}`);

      expect(analyticsRes.statusCode).toBe(200);
      expect(analyticsRes.body.total).toBe(5);
      expect(analyticsRes.body.completed).toBe(2);
      
      // BUG TEST: Completion rate calculation is wrong (off-by-one error)
      // 2/5 = 40%, but bug calculates 2/4 = 50%
      expect(analyticsRes.body.completion_rate).toBe('40.00');
    });
  });

  describe('Health Check', () => {
    test('GET /health should return ok status', async () => {
      const res = await request(app)
        .get('/health');

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
    });

    test('Health check should use GET method, not POST', async () => {
      const res = await request(app)
        .post('/health');

      // BUG TEST: Endpoint only accepts POST, should accept GET
      expect(res.statusCode).toBe(200);
    });
  });

  describe('External Data', () => {
    test('GET /api/external-data should fetch from HTTPS endpoint', async () => {
      const res = await request(app)
        .get('/api/external-data');

      // BUG TEST: Using HTTP instead of HTTPS and timeout too short
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id');
    });
  });

  describe('Notification Endpoints', () => {
    let userId;

    beforeEach(async () => {
      const userRes = await request(app)
        .post('/api/users')
        .send({
          username: 'notifyuser' + Date.now(),
          email: `notifyuser${Date.now()}@example.com`,
          password: 'password123'
        });
      userId = userRes.body.id;
    });

    test('POST /api/notifications should create notification', async () => {
      const res = await request(app)
        .post('/api/notifications')
        .send({
          userId,
          message: 'Test notification'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.message).toBe('Test notification');
    });

    test('GET /api/notifications/:userId should return user notifications', async () => {
      await request(app)
        .post('/api/notifications')
        .send({
          userId,
          message: 'Test notification 1'
        });

      const res = await request(app)
        .get(`/api/notifications/${userId}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('Malformed JSON should return 400', async () => {
      const res = await request(app)
        .post('/api/users')
        .send('{invalid json');

      expect(res.statusCode).toBe(400);
    });

    test('Unknown route should return 404', async () => {
      const res = await request(app)
        .get('/api/unknown-route');

      expect(res.statusCode).toBe(404);
    });
  });
});
