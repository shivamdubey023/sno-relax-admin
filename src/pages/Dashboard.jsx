// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { getStats, getUsers, getContent, getChatStats } from "../services/api";
import { API_BASE } from "../config/api.config";
import "./Dashboard.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A"];

const Dashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalChats: 0, totalContent: 0, totalCommunityGroups: 0, totalCommunityMembers: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentContent, setRecentContent] = useState([]);
  const [contentTypesData, setContentTypesData] = useState([]);
  const [contentChartType, setContentChartType] = useState('pie');
  const [chatActivityData, setChatActivityData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, contentRes, chatStatsRes] = await Promise.all([
        getStats(),
        getUsers(),
        getContent(),
        getChatStats(),
      ]);

      // Fetch community groups data (use centralized API_BASE and handle multiple response shapes)
      let communityGroups = [];
      try {
        const communityRes = await fetch(`${API_BASE}/api/community/groups`, {
          credentials: "include",
        });

        if (!communityRes.ok) {
          const body = await communityRes.text().catch(() => "");
          console.warn("Failed to fetch community groups: status", communityRes.status, body);
        } else {
          const cgData = await communityRes.json().catch(() => null);
          if (Array.isArray(cgData)) {
            communityGroups = cgData;
          } else if (cgData && Array.isArray(cgData.groups)) {
            communityGroups = cgData.groups;
          } else if (cgData && Array.isArray(cgData.data)) {
            communityGroups = cgData.data;
          } else if (cgData && cgData.ok && Array.isArray(cgData.data)) {
            communityGroups = cgData.data;
          } else {
            // Fallback: try to locate any array in the response object
            const arr = Object.values(cgData || {}).find(v => Array.isArray(v));
            communityGroups = Array.isArray(arr) ? arr : [];
          }
        }
      } catch (err) {
        console.warn("Failed to fetch community groups:", err);
        communityGroups = [];
      }

      // Stats cards
      const totalCommunityMembers = Array.isArray(communityGroups) 
        ? communityGroups.reduce((sum, g) => sum + (g.members?.length || 0), 0)
        : 0;

      setStats({
        totalUsers: statsRes.data.totalUsers,
        totalChats: statsRes.data.totalChats,
        totalContent: contentRes.data.length,
        totalCommunityGroups: Array.isArray(communityGroups) ? communityGroups.length : 0,
        totalCommunityMembers: totalCommunityMembers,
      });

      // Recent users & content (last 5). Ensure each user has a 'name' property for display.
      setRecentUsers(usersRes.data.map(u => ({
        ...u,
        name: u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : (u.communityNickname || u.userId)
      })).slice(-5).reverse());
      setRecentContent(contentRes.data.slice(-5).reverse());

      // Prepare content types pie chart
      const typesCount = contentRes.data.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {});
      setContentTypesData(Object.entries(typesCount).map(([name, value]) => ({ name, value })));

      // Chat activity line chart
      setChatActivityData(chatStatsRes.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="admin-dashboard">
      <h1>Dashboard</h1>

      {/* Stats Cards */}
      <div className="stats-grid">
        {["Users", "Chats", "Content"].map((type, index) => (
          <div key={index} className="stat-card">
            <h2>Total {type}</h2>
            <div className="stat-value">{stats[`total${type}`]}</div>
          </div>
        ))}
        <div className="stat-card" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
          <h2 style={{ color: "white" }}>Community Groups</h2>
          <div className="stat-value" style={{ color: "white" }}>{stats.totalCommunityGroups}</div>
        </div>
        <div className="stat-card" style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white" }}>
          <h2 style={{ color: "white" }}>Community Members</h2>
          <div className="stat-value" style={{ color: "white" }}>{stats.totalCommunityMembers}</div>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="section">
        <Section title="Recent Users" data={recentUsers} columns={["name", "email", "createdAt"]} />
      </div>

      {/* Recent Content Table */}
      <div className="section">
        <Section title="Recent Content" data={recentContent} columns={["title", "type", "createdAt"]} />
      </div>

      {/* Charts */}
      <div className="chart-grid">
        <div className="chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Content Types Distribution</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <label style={{ fontSize: 12 }}>Chart:</label>
              <select value={contentChartType} onChange={(e) => setContentChartType(e.target.value)}>
                <option value="pie">Pie</option>
                <option value="donut">Donut</option>
                <option value="bar">Bar</option>
              </select>
            </div>
          </div>
          {contentTypesData && contentTypesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              {contentChartType === 'bar' ? (
                // horizontal bar-like layout using BarChart
                <BarChart data={contentTypesData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Bar dataKey="value">{contentTypesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}</Bar>
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={contentTypesData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={contentChartType === 'donut' ? 80 : 100}
                    innerRadius={contentChartType === 'donut' ? 40 : 0}
                    label
                  >
                    {contentTypesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="table-wrap">
              <p>No content distribution available to plot. Showing recent content instead.</p>
              <table>
                <thead>
                  <tr><th>Title</th><th>Type</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {recentContent.length > 0 ? recentContent.map((c) => (
                    <tr key={c._id || c.title}><td>{c.title}</td><td>{c.type}</td><td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}</td></tr>
                  )) : <tr><td colSpan={3}>No content available</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="chart-card">
          <h3>Chat Activity (Last 7 Days)</h3>
          {chatActivityData && chatActivityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chatActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="chats" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="table-wrap">
              <p>No chat activity data available to plot. Showing top recent users instead.</p>
              <table>
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Joined</th></tr>
                </thead>
                <tbody>
                  {recentUsers.length > 0 ? recentUsers.map((u) => (
                    <tr key={u._id || u.email}><td>{u.name}</td><td>{u.email}</td><td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ''}</td></tr>
                  )) : <tr><td colSpan={3}>No users available</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Reusable section component for tables (uses CSS classes)
const Section = ({ title, data, columns }) => (
  <div className="section">
    <h2>{title}</h2>
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{col.charAt(0).toUpperCase() + col.slice(1)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item._id || JSON.stringify(item)}>
              {columns.map((col) => (
                <td key={col}>
                  {col === "createdAt" && item[col]
                    ? new Date(item[col]).toLocaleDateString()
                    : item[col]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// (ChartCard removed — charts are rendered with .chart-card elements)

export default Dashboard;
