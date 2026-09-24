import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks';
import TaskForm from '../components/TaskForm';
import ConfirmModal from '../components/ConfirmModal';

const PAGE_SIZE = 5;

export default function Dashboard() {
  const { user, logout } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null); // null = "add" mode

  const [deleteTarget, setDeleteTarget] = useState(null); // task pending delete
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getTasks();
      setTasks(res.data.tasks);
    } catch (err) {
      setError(
        err.response?.data?.error || 'Failed to load tasks. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Client-side search — filters what's already fetched.
  const filteredTasks = useMemo(() => {
    if (!search.trim()) return tasks;
    const q = search.trim().toLowerCase();
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
    );
  }, [tasks, search]);

  // Client-side pagination over the filtered results.
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / PAGE_SIZE));
  const paginatedTasks = filteredTasks.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1); // reset to first page on new search
  };

  const openAddForm = () => {
    setEditingTask(null);
    setActionError('');
    setFormOpen(true);
  };

  const openEditForm = (task) => {
    setEditingTask(task);
    setActionError('');
    setFormOpen(true);
  };

const handleFormSubmit = async (values) => {
  setActionError('');
  try {
    if (editingTask) {
      const res = await updateTask(editingTask.id, values);
      const updated = res.data.task; // unwrap
      setTasks((prev) =>
        prev.map((t) => (t.id === editingTask.id ? updated : t))
      );
    } else {
      const res = await createTask(values);
      const created = res.data.task; // unwrap
      setTasks((prev) => [created, ...prev]);
    }
    setFormOpen(false);
  } catch (err) {
    setActionError(
      err.response?.data?.error || 'Failed to save task. Please try again.'
    );
  }
};

const handleToggleStatus = async (task) => {
  const newStatus = task.status === 'TODO' ? 'DONE' : 'TODO';
  try {
    const res = await updateTask(task.id, { status: newStatus });
    const updated = res.data.task; // unwrap
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
  } catch (err) {
    setError(err.response?.data?.error || 'Failed to update status.');
  }
};

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTask(deleteTarget.id);
      setTasks((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete task.');
      setDeleteTarget(null);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Task Management</h1>
        <div className="dashboard-header-right">
          <span>Hi, {user?.username}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="dashboard-toolbar">
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        <button onClick={openAddForm}>+ Add Task</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="empty-state">
          {search ? 'No tasks match your search.' : 'No tasks yet. Add one!'}
        </div>
      ) : (
        <>
          <ul className="task-list">
            {paginatedTasks.map((task) => (
              <li key={task.id} className={`task-item ${task.status.toLowerCase()}`}>
                <div className="task-info">
                  <h3>{task.title}</h3>
                  {task.description && <p>{task.description}</p>}
                  <span className="task-status-badge">{task.status}</span>
                </div>
                <div className="task-actions">
                  <button onClick={() => handleToggleStatus(task)}>
                    Mark as {task.status === 'TODO' ? 'Done' : 'Todo'}
                  </button>
                  <button onClick={() => openEditForm(task)}>Edit</button>
                  <button onClick={() => setDeleteTarget(task)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {formOpen && (
        <TaskForm
          initialTask={editingTask}
          error={actionError}
          onSubmit={handleFormSubmit}
          onCancel={() => setFormOpen(false)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          message={`Delete task "${deleteTarget.title}"? This cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}