import React, { useState, useEffect } from 'react';
import * as api from './api';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import './App.css';

function App() {
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [showLoginForm, setShowLoginForm] = useState(!userId);

  // BUG: Missing dependency in useEffect - stale closure
  useEffect(() => {
    if (userId) {
      loadTasks();
    }
  }, []); // Should include userId in dependency array

  const loadTasks = async () => {
    setLoading(true);
    setError('');
    try {
      // BUG: No error handling for network failures
      const tasksData = await api.getTasks(userId);
      setTasks(tasksData || []);
    } catch (err) {
      // BUG: Error swallowed, not properly logged
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (user, pass) => {
    try {
      setLoading(true);
      // BUG: No actual authentication check, just creates user
      const user = await api.createUser(user, pass + '@example.com', pass);
      setUserId(user.id);
      setUsername(user.username);
      localStorage.setItem('userId', user.id);
      setShowLoginForm(false);
      loadTasks();
    } catch (err) {
      // BUG: Shows generic error message instead of specific error from server
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (title, description, priority) => {
    try {
      // BUG: Priority validation happens here but not on server
      if (priority < 1 || priority > 5) {
        // This check exists but server doesn't validate
        setError('Priority must be 1-5');
        return;
      }
      
      const newTask = await api.createTask(userId, title, description, priority);
      // BUG: Direct array mutation instead of proper state update
      setTasks([...tasks, newTask]);
      setError('');
    } catch (err) {
      setError('Failed to create task');
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      // BUG: No validation of status values on client
      await api.updateTaskStatus(taskId, newStatus);
      setTasks(tasks.map(t =>
        t.id === taskId ? { ...t, status: newStatus } : t
      ));
    } catch (err) {
      setError('Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      // BUG: DELETE returns 204 No Content, but code tries to use response.data
      await api.deleteTask(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  const handleLogout = () => {
    setUserId('');
    setUsername('');
    setTasks([]);
    localStorage.removeItem('userId');
    setShowLoginForm(true);
  };

  if (showLoginForm) {
    return (
      <div className="app">
        <LoginForm onLogin={handleLogin} loading={loading} error={error} />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Task Manager</h1>
        <div className="user-info">
          <span>User: {username}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading">Loading...</div>}

      <main className="app-main">
        <TaskForm onAddTask={handleAddTask} />
        <TaskList
          tasks={tasks}
          onUpdateStatus={handleUpdateTaskStatus}
          onDeleteTask={handleDeleteTask}
        />
      </main>
    </div>
  );
}

// Login form component
function LoginForm({ onLogin, loading, error }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // BUG: No input validation
    onLogin(username, password);
    // BUG: Form doesn't reset after submit
  };

  return (
    <div className="login-form">
      <h2>Login / Register</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default App;
