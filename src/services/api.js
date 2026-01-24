import axios from "axios";
import { API_BASE } from "../config/api.config";

const API_URL = `${API_BASE}/api/admin`;
const COMMUNITY_URL = `${API_URL}/community`;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ------------------ USERS ------------------
export const getUsers = () => apiClient.get(`${API_URL}/users`);
export const getUser = (id) => apiClient.get(`${API_URL}/users/${id}`);
export const createUser = (userData) => apiClient.post(`${API_URL}/users`, userData);
export const updateUser = (id, updatedData) => apiClient.put(`${API_URL}/users/${id}`, updatedData);
export const deleteUser = (id) => apiClient.delete(`${API_URL}/users/${id}`);

// ------------------ ADMIN LOGIN ------------------
export const loginAdmin = (credentials) => apiClient.post(`${API_URL}/login`, credentials);

// ------------------ STATS ------------------
export const getStats = () => apiClient.get(`${API_URL}/stats`);
export const getChatStats = () => apiClient.get(`${API_URL}/stats/chats`);

// ------------------ CONTENT ------------------
export const getContent = () => apiClient.get(`${API_URL}/content`);
export const getContentById = (id) => apiClient.get(`${API_URL}/content/${id}`);
export const createContent = (data) => apiClient.post(`${API_URL}/content`, data);
export const updateContent = (id, data) => apiClient.put(`${API_URL}/content/${id}`, data);
export const deleteContent = (id) => apiClient.delete(`${API_URL}/content/${id}`);

// ------------------ COMMUNITY ------------------
export const fetchGroups = () => apiClient.get(COMMUNITY_URL).then(res => res.data);
export const createGroup = (data) => apiClient.post(COMMUNITY_URL, data).then(res => res.data);
export const deleteGroup = (groupId) => apiClient.delete(`${COMMUNITY_URL}/${groupId}`).then(res => res.data);
// Mongo-backed admin community endpoints
export const fetchGroupsMongo = () => apiClient.get(`${COMMUNITY_URL}/groups`).then(res => res.data);
export const createGroupMongo = (data) => apiClient.post(`${COMMUNITY_URL}/group`, data).then(res => res.data);
export const deleteGroupMongo = (id) => apiClient.delete(`${COMMUNITY_URL}/group/mongo/${id}`).then(res => res.data);

// Group messages (admin)
export const fetchGroupMessages = (groupId) => apiClient.get(`${COMMUNITY_URL}/group/${groupId}/messages`).then(res => res.data);
export const deleteGroupMessage = (groupId, messageId) => apiClient.delete(`${COMMUNITY_URL}/group/${groupId}/message/${messageId}`).then(res => res.data);
export const fetchGroupMembers = (groupId) => apiClient.get(`${COMMUNITY_URL}/group/${groupId}/members`).then(res => res.data);
export const removeGroupMember = (groupId, userId) => apiClient.delete(`${COMMUNITY_URL}/group/${groupId}/leave`, { data: { userId } }).then(res => res.data);
export const updateGroupMongo = (groupId, data) => apiClient.put(`${COMMUNITY_URL}/group/${groupId}`, data).then(res => res.data);
export const clearGroupMessages = (groupId) => apiClient.delete(`${COMMUNITY_URL}/group/${groupId}/messages`).then(res => res.data);

// Announcements
export const fetchAnnouncements = () => apiClient.get(`${API_URL}/announcements`).then(res => res.data);
export const createAnnouncement = (data) => apiClient.post(`${API_URL}/announcement`, data).then(res => res.data);
export const deleteAnnouncement = (id) => apiClient.delete(`${API_URL}/announcement/${id}`).then(res => res.data);

// ------------------ SETTINGS ------------------
export const getThemeSetting = () => apiClient.get(`${API_URL}/settings/theme`).then(res => res.data);
export const updateThemeSetting = (theme) => apiClient.put(`${API_URL}/settings/theme`, { theme }).then(res => res.data);

// ------------------ REPORTS ------------------
export const getReports = () => apiClient.get(`${API_URL}/reports`).then(res => res.data);
export const createReport = (data) => apiClient.post(`${API_URL}/report`, data).then(res => res.data);
export const deleteReport = (id) => apiClient.delete(`${API_URL}/report/${id}`).then(res => res.data);

// ------------------ RELATIONSHIPS / ANALYTICS ------------------
export const getRelationshipsSummary = () => apiClient.get(`${API_URL}/relationships/summary`).then(res => res.data);

// ------------------ USER PROFILE CHANGES (Audit Log) ------------------
export const getProfileChanges = (userId, limit = 100) => 
  apiClient.get(`${API_URL}/profile-changes`, { params: { userId, limit } }).then(res => res.data);

export const logProfileChange = (userId, fieldName, oldValue, newValue, changedBy = 'user') =>
  apiClient.post(`${API_URL}/profile-change`, { userId, fieldName, oldValue, newValue, changedBy }).then(res => res.data);

// ------------------ PRIVATE MESSAGES (admin) ------------------
export const fetchPrivateMessages = (userId) => apiClient.get(`${API_URL}/private-messages`, { params: { userId } }).then(res => res.data);
export const sendPrivateMessageAdmin = (payload) => apiClient.post(`${API_URL}/private-message`, payload).then(res => res.data);
