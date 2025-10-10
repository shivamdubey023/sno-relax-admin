import axios from "axios";

// ✅ Always point to your backend server
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/admin";


// ------------------ USERS ------------------

// Get all users
export const getUsers = () => axios.get(`${API_URL}/users`);

// Get a single user by ID
export const getUser = (id) => axios.get(`${API_URL}/users/${id}`);

// Create a new user
export const createUser = (userData) => axios.post(`${API_URL}/users`, userData);

// Update user (e.g., edit or block)
export const updateUser = (id, updatedData) =>
  axios.put(`${API_URL}/users/${id}`, updatedData);

// Delete a user
export const deleteUser = (id) => axios.delete(`${API_URL}/users/${id}`);

// ------------------ CONTENT ------------------

export const getContent = () => axios.get(`${API_URL}/content`);
export const getContentById = (id) => axios.get(`${API_URL}/content/${id}`);
export const createContent = (data) => axios.post(`${API_URL}/content`, data);
export const updateContent = (id, data) =>
  axios.put(`${API_URL}/content/${id}`, data);
export const deleteContent = (id) => axios.delete(`${API_URL}/content/${id}`);

// ------------------ ANALYTICS / STATS ------------------

export const getStats = () => axios.get(`${API_URL}/stats`);
