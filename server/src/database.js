const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const db = new sqlite3.Database(':memory:');

function initializeDatabase() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        priority INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
  });
}

function createUser(username, email, password) {
  return new Promise((resolve, reject) => {
    const id = uuidv4();
    // BUG: No password hashing - major security issue
    db.run(
      'INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)',
      [id, username, email, password],
      function(err) {
        if (err) reject(err);
        resolve({ id, username, email });
      }
    );
  });
}

function getUserById(id) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM users WHERE id = ?',
      [id],
      (err, row) => {
        if (err) reject(err);
        resolve(row);
      }
    );
  });
}

function getUserByUsername(username) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM users WHERE username = ?',
      [username],
      (err, row) => {
        if (err) reject(err);
        resolve(row);
      }
    );
  });
}

function createTask(userId, title, description, priority) {
  return new Promise((resolve, reject) => {
    const id = uuidv4();
    // BUG: Priority validation is missing - accepts any value
    db.run(
      'INSERT INTO tasks (id, user_id, title, description, priority) VALUES (?, ?, ?, ?, ?)',
      [id, userId, title, description, priority],
      function(err) {
        if (err) reject(err);
        resolve({ id, userId, title, description, priority });
      }
    );
  });
}

function getTasksByUser(userId) {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY priority',
      [userId],
      (err, rows) => {
        if (err) reject(err);
        // BUG: Returns undefined if no tasks found instead of empty array
        resolve(rows);
      }
    );
  });
}

function updateTaskStatus(taskId, status) {
  return new Promise((resolve, reject) => {
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    // BUG: Status validation only runs on client side, not server side
    db.run(
      'UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, taskId],
      function(err) {
        if (err) reject(err);
        resolve({ taskId, status });
      }
    );
  });
}

function createNotification(userId, message) {
  return new Promise((resolve, reject) => {
    const id = uuidv4();
    db.run(
      'INSERT INTO notifications (id, user_id, message) VALUES (?, ?, ?)',
      [id, userId, message],
      function(err) {
        if (err) reject(err);
        resolve({ id, userId, message });
      }
    );
  });
}

function getUserNotifications(userId) {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [userId],
      (err, rows) => {
        if (err) reject(err);
        resolve(rows || []);
      }
    );
  });
}

// BUG: Missing transaction support - concurrent requests can cause data inconsistency
function deleteTask(taskId) {
  return new Promise((resolve, reject) => {
    db.run(
      'DELETE FROM tasks WHERE id = ?',
      [taskId],
      function(err) {
        if (err) reject(err);
        resolve({ taskId });
      }
    );
  });
}

module.exports = {
  db,
  initializeDatabase,
  createUser,
  getUserById,
  getUserByUsername,
  createTask,
  getTasksByUser,
  updateTaskStatus,
  createNotification,
  getUserNotifications,
  deleteTask
};
