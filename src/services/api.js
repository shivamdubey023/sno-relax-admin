import axios from "axios";

const API_URL = "https://sno-relax-server.onrender.com/api/admin";
const COMMUNITY_URL = `${API_URL}/community`;

// ------------------ USERS ------------------
export const getUsers = () => axios.get(`${API_URL}/users`);
export const getUser = (id) => axios.get(`${API_URL}/users/${id}`);
export const createUser = (userData) => axios.post(`${API_URL}/users`, userData);
export const updateUser = (id, updatedData) => axios.put(`${API_URL}/users/${id}`, updatedData);
export const deleteUser = (id) => axios.delete(`${API_URL}/users/${id}`);

// ------------------ ADMIN LOGIN ------------------
export const loginAdmin = (credentials) => axios.post(`${API_URL}/login`, credentials);

// ------------------ STATS ------------------
export const getStats = () => axios.get(`${API_URL}/stats`);
export const getChatStats = () => axios.get(`${API_URL}/stats/chats`);

// ------------------ CONTENT ------------------
export const getContent = () => axios.get(`${API_URL}/content`);
export const getContentById = (id) => axios.get(`${API_URL}/content/${id}`);
export const createContent = (data) => axios.post(`${API_URL}/content`, data);
export const updateContent = (id, data) => axios.put(`${API_URL}/content/${id}`, data);
export const deleteContent = (id) => axios.delete(`${API_URL}/content/${id}`);

// ------------------ COMMUNITY ------------------
export const fetchGroups = () => axios.get(COMMUNITY_URL).then(res => res.data);
export const createGroup = (data) => axios.post(COMMUNITY_URL, data).then(res => res.data);
export const deleteGroup = (groupId) => axios.delete(`${COMMUNITY_URL}/${groupId}`).then(res => res.data);
// Mongo-backed admin community endpoints
export const fetchGroupsMongo = () => axios.get(`${COMMUNITY_URL}/groups`).then(res => res.data);
export const createGroupMongo = (data) => axios.post(`${COMMUNITY_URL}/group`, data).then(res => res.data);
export const deleteGroupMongo = (id) => axios.delete(`${COMMUNITY_URL}/group/mongo/${id}`).then(res => res.data);

// Group messages (admin)
export const fetchGroupMessages = (groupId) => axios.get(`${COMMUNITY_URL}/group/${groupId}/messages`).then(res => res.data);
export const deleteGroupMessage = (groupId, messageId) => axios.delete(`${COMMUNITY_URL}/group/${groupId}/message/${messageId}`).then(res => res.data);

// Announcements
export const fetchAnnouncements = () => axios.get(`${API_URL}/announcements`).then(res => res.data);
export const createAnnouncement = (data) => axios.post(`${API_URL}/announcement`, data).then(res => res.data);
export const deleteAnnouncement = (id) => axios.delete(`${API_URL}/announcement/${id}`).then(res => res.data);
