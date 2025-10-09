import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div style={{ width: "200px", background: "#1f2937", color: "white", minHeight: "100vh", padding: "20px" }}>
      <h2>SnoRelax Admin</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <li><Link to="/" style={{ color: "white" }}>Dashboard</Link></li>
        <li><Link to="/users" style={{ color: "white" }}>Users</Link></li>
        <li><Link to="/content" style={{ color: "white" }}>Content</Link></li>
        <li><Link to="/reports" style={{ color: "white" }}>Reports</Link></li>
        <li><Link to="/settings" style={{ color: "white" }}>Settings</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar;
