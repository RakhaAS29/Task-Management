import api from './axios';

export const getTasks = () => api.get('/tasks');

export const createTask = (task) => api.post('/tasks', task);

export const updateTask = (id, updates) => api.put(`/tasks/${id}`, updates);

export const deleteTask = (id) => api.delete(`/tasks/${id}`);