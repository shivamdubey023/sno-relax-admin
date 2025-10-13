// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { getStats, getUsers, getContent, getChatStats } from "../services/api";
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
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A"];

const Dashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalChats: 0, totalContent: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentContent, setRecentContent] = useState([]);
  const [contentTypesData, setContentTypesData] = useState([]);
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

      // Stats cards
      setStats({
        totalUsers: statsRes.data.totalUsers,
        totalChats: statsRes.data.totalChats,
        totalContent: contentRes.data.length,
      });

      // Recent users & content (last 5)
      setRecentUsers(usersRes.data.slice(-5).reverse());
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
    <div style={{ padding: "20px" }}>
      <h1>Dashboard</h1>

      {/* Stats Cards */}
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        {["Users", "Chats", "Content"].map((type, index) => (
          <div
            key={index}
            style={{ flex: 1, padding: "20px", background: "#f5f5f5", borderRadius: "10px" }}
          >
            <h2>Total {type}</h2>
            <p style={{ fontSize: "24px", fontWeight: "bold" }}>{stats[`total${type}`]}</p>
          </div>
        ))}
      </div>

      {/* Recent Users Table */}
      <Section title="Recent Users" data={recentUsers} columns={["name", "email", "createdAt"]} />

      {/* Recent Content Table */}
      <Section title="Recent Content" data={recentContent} columns={["title", "type", "createdAt"]} />

      {/* Charts */}
      <div style={{ display: "flex", gap: "40px", marginTop: "40px", flexWrap: "wrap" }}>
        <ChartCard title="Content Types Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={contentTypesData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {contentTypesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Chat Activity (Last 7 Days)">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chatActivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="chats" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

// Reusable section component for tables
const Section = ({ title, data, columns }) => (
  <div style={{ marginTop: "40px" }}>
    <h2>{title}</h2>
    <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col}>{col.charAt(0).toUpperCase() + col.slice(1)}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item._id}>
            {columns.map((col) => (
              <td key={col}>
                {col === "createdAt"
                  ? new Date(item[col]).toLocaleDateString()
                  : item[col]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Chart card wrapper for consistent styling
const ChartCard = ({ title, children }) => (
  <div style={{ flex: 1, minWidth: "300px" }}>
    <h3>{title}</h3>
    {children}
  </div>
);

export default Dashboard;
