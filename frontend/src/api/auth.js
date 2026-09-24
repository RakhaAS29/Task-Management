import api from './axios';

export const registerUser = (username, password) =>
  api.post('/auth/register', { username, password });

export const loginUser = (username, password) =>
  api.post('/auth/login', { username, password });