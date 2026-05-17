import React from 'react';

function TaskList({ tasks, onUpdateStatus, onDeleteTask }) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return <div className="task-list empty">No tasks yet. Create one to get started!</div>;
  }

  // BUG: No error boundary - entire component crashes if task object is malformed
  return (
    <div className="task-list">
      {tasks.map((task) => (
        <div key={task.id} className={`task-item ${task.status || 'pending'}`}>
          <div className="task-header">
            <h3>{task.title}</h3>
            <span className={`priority-badge priority-${task.priority}`}>
              {/* BUG: Direct array indexing without bounds check */}
              {['Low', 'Medium', 'High', 'Urgent', 'Critical'][task.priority - 1]}
            </span>
          </div>
          
          {task.description && <p className="task-description">{task.description}</p>}
          
          <div className="task-controls">
            <select
              value={task.status || 'pending'}
              onChange={(e) => onUpdateStatus(task.id, e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <button
              className="delete-btn"
              onClick={() => {
                // BUG: No confirmation before delete
                if (confirm('Delete this task?')) {
                  onDeleteTask(task.id);
                }
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TaskList;
