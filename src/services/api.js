import axios from "axios";

// Hardcoded backend URL
const API_URL = "https://sno-relax-server.onrender.com";
const COMMUNITY_URL = "https://sno-relax-server.onrender.com/api/community";

// ------------------ USERS ------------------
export const getUsers = () => axios.get(`${API_URL}/users`);
export const getUser = (id) => axios.get(`${API_URL}/users/${id}`);
export const createUser = (userData) => axios.post(`${API_URL}/users`, userData);
export const updateUser = (id, updatedData) => axios.put(`${API_URL}/users/${id}`, updatedData);
export const deleteUser = (id) => axios.delete(`${API_URL}/users/${id}`);

// Admin login
export const loginAdmin = (credentials) => axios.post(`${API_URL}/login`, credentials);

// Chat stats
export const getChatStats = () => axios.get(`${API_URL}/stats/chats`);

// ------------------ CONTENT ------------------
export const getContent = () => axios.get(`${API_URL}/content`);
export const getContentById = (id) => axios.get(`${API_URL}/content/${id}`);
export const createContent = (data) => axios.post(`${API_URL}/content`, data);
export const updateContent = (id, data) => axios.put(`${API_URL}/content/${id}`, data);
export const deleteContent = (id) => axios.delete(`${API_URL}/content/${id}`);

// ------------------ STATS ------------------
export const getStats = () => axios.get(`${API_URL}/stats`);

// ------------------ COMMUNITY ------------------
export const fetchGroups = () => axios.get(`${COMMUNITY_URL}/groups`).then(res => res.data);
export const createGroup = (data) => axios.post(`${COMMUNITY_URL}/create`, data).then(res => res.data);
export const deleteGroup = (groupId) => axios.delete(`${COMMUNITY_URL}/${groupId}`).then(res => res.data);
