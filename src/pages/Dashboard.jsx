import React, { useEffect, useState } from "react";
import AnalyticsChart from "../components/AnalyticsChart";
import { getStats } from "../services/api";

const Dashboard = () => {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const res = await getStats();
    setStats(res.data);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Dashboard</h1>
      <AnalyticsChart data={stats} dataKey="activeUsers" title="Active Users Trend" />
    </div>
  );
};

export default Dashboard;
