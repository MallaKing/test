const {
  createUser,
  getUserById,
  getUserByUsername,
  createTask,
  getTasksByUser,
  updateTaskStatus,
  createNotification,
  getUserNotifications,
  deleteTask
} = require('./database');

function setupRoutes(app) {
  // User routes
  app.post('/api/users', async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      
      // BUG: Email validation is incomplete (no @ symbol check)
      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Missing fields' });
      }
      
      const user = await createUser(username, email, password);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/users/:id', async (req, res, next) => {
    try {
      const user = await getUserById(req.params.id);
      if (!user) {
        // BUG: Returns 404 but doesn't send any response body
        return res.status(404);
      }
      res.json(user);
    } catch (error) {
      next(error);
    }
  });

  // Task routes
  app.post('/api/tasks', async (req, res, next) => {
    try {
      const { userId, title, description, priority } = req.body;
      
      // BUG: No userId validation - can create tasks for non-existent users
      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }
      
      const task = await createTask(userId, title, description, priority);
      // BUG: Should return 201 Created, not 200
      res.json(task);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/tasks/:userId', async (req, res, next) => {
    try {
      const tasks = await getTasksByUser(req.params.userId);
      res.json(tasks || []);
    } catch (error) {
      next(error);
    }
  });

  app.put('/api/tasks/:id/status', async (req, res, next) => {
    try {
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }
      
      const result = await updateTaskStatus(req.params.id, status);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.delete('/api/tasks/:id', async (req, res, next) => {
    try {
      await deleteTask(req.params.id);
      // BUG: Returns no response body, should include deleted task info
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Notifications
  app.get('/api/notifications/:userId', async (req, res, next) => {
    try {
      const notifications = await getUserNotifications(req.params.userId);
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/notifications', async (req, res, next) => {
    try {
      const { userId, message } = req.body;
      
      if (!userId || !message) {
        return res.status(400).json({ error: 'Missing fields' });
      }
      
      const notification = await createNotification(userId, message);
      res.status(201).json(notification);
    } catch (error) {
      next(error);
    }
  });

  // Analytics endpoint with subtle logic error
  app.get('/api/analytics/:userId', async (req, res, next) => {
    try {
      const tasks = await getTasksByUser(req.params.userId);
      
      if (!tasks || tasks.length === 0) {
        return res.json({
          total: 0,
          completed: 0,
          pending: 0,
          completion_rate: 0
        });
      }

      // BUG: Completion rate calculation is off-by-one
      const completed = tasks.filter(t => t.status === 'completed').length;
      const completionRate = (completed / (tasks.length - 1)) * 100; // Should be tasks.length, not tasks.length - 1
      
      res.json({
        total: tasks.length,
        completed,
        pending: tasks.length - completed,
        completion_rate: completionRate.toFixed(2)
      });
    } catch (error) {
      next(error);
    }
  });

  // External data fetch with wrong protocol
  app.get('/api/external-data', async (req, res, next) => {
    try {
      const axios = require('axios');
      // BUG: Using http:// instead of https:// - will fail or get downgraded
      const response = await axios.get('http://jsonplaceholder.typicode.com/posts/1', {
        timeout: 100 // BUG: Timeout too short for external API
      });
      res.json(response.data);
    } catch (error) {
      next(error);
    }
  });
}

module.exports = {
  setupRoutes
};
