import axios from "axios";

// Replace this with your actual backend URL
const API_URL = "https://sno-relax-server.onrender.com/";

// ------------------ USERS ------------------

// Get all users
export const getUsers = () => axios.get(`${API_URL}/users`);

// Get a single user by ID
export const getUser = (id) => axios.get(`${API_URL}/users/${id}`);

// Create a new user
export const createUser = (userData) => axios.post(`${API_URL}/users`, userData);

// Update user (e.g., ban/unban, edit info)
export const updateUser = (id, updatedData) =>
  axios.put(`${API_URL}/users/${id}`, updatedData);

// Delete a user
export const deleteUser = (id) => axios.delete(`${API_URL}/users/${id}`);

// ------------------ CONTENT ------------------

// Get all content (articles, exercises, etc.)
export const getContent = () => axios.get(`${API_URL}/content`);

// Get single content item by ID
export const getContentById = (id) => axios.get(`${API_URL}/content/${id}`);

// Create new content
export const createContent = (contentData) => axios.post(`${API_URL}/content`, contentData);

// Update content
export const updateContent = (id, updatedData) =>
  axios.put(`${API_URL}/content/${id}`, updatedData);

// Delete content
export const deleteContent = (id) => axios.delete(`${API_URL}/content/${id}`);

// ------------------ ANALYTICS / STATS ------------------

// Get dashboard statistics
export const getStats = () => axios.get(`${API_URL}/stats`);
