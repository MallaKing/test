import React, { useState } from 'react';

function TaskForm({ onAddTask }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // BUG: No validation that title is not empty
    if (!title.trim()) {
      // This check exists but could be bypassed with whitespace
      alert('Title is required');
      return;
    }

    // BUG: Priority validation exists but server doesn't enforce it
    onAddTask(title, description, parseInt(priority));
    
    // BUG: Form state not properly cleared
    setTitle('');
    setDescription('');
    setPriority(1);
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      ></textarea>
      <select value={priority} onChange={(e) => setPriority(e.target.value)}>
        <option value="1">Low</option>
        <option value="2">Medium</option>
        <option value="3">High</option>
        <option value="4">Urgent</option>
        <option value="5">Critical</option>
      </select>
      <button type="submit">Add Task</button>
    </form>
  );
}

export default TaskForm;
