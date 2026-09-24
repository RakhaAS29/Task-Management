import { useState } from 'react';

export default function TaskForm({ initialTask, error, onSubmit, onCancel }) {
  const isEditing = !!initialTask;

  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(
    initialTask?.description || ''
  );
  const [status, setStatus] = useState(initialTask?.status || 'TODO');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!title.trim()) {
      setLocalError('Title is required.');
      return;
    }

    setSubmitting(true);
    await onSubmit({ title: title.trim(), description: description.trim(), status });
    setSubmitting(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{isEditing ? 'Edit Task' : 'Add Task'}</h2>

        <form onSubmit={handleSubmit}>
          {(error || localError) && (
            <div className="error-message">{error || localError}</div>
          )}

          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={submitting}
            autoFocus
          />

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={submitting}
            rows={4}
          />

          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={submitting}
          >
            <option value="TODO">TODO</option>
            <option value="DONE">DONE</option>
          </select>

          <div className="modal-actions">
            <button type="button" onClick={onCancel} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}