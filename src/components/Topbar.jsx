import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, Bell, User, Menu } from "lucide-react";

const Topbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminId, setAdminId] = useState("");
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setAdminId(localStorage.getItem("adminId") || "Admin");
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminId");
      navigate("/login");
    }
  };

  const getPageTitle = () => {
    const titles = {
      "/": "Dashboard",
      "/users": "Users Management",
      "/content": "Content Management",
      "/community": "Communities",
      "/private-messages": "Private Messages",
      "/reports": "Reports & Analytics",
      "/settings": "Settings",
      "/profile-changes": "Profile Changes"
    };
    return titles[location.pathname] || "Dashboard";
  };

  return (
    <div style={{
      background: "linear-gradient(90deg, #ffffff 0%, #f9fafb 100%)",
      padding: "clamp(12px, 3vw, 16px) clamp(16px, 4vw, 24px)",
      borderBottom: "1px solid #e5e7eb",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      flexWrap: "wrap",
      gap: "16px"
    }}>
      {/* Menu button for mobile */}
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          style={{
            background: "transparent",
            border: "1px solid #e5e7eb",
            padding: "8px 12px",
            borderRadius: 6,
            cursor: "pointer",
            color: "#6b7280"
          }}
          className="menu-button-mobile"
        >
          <Menu size={20} />
        </button>
      )} 

      {/* Left Side - Page Title */}
      <div style={{ minWidth: "200px" }}>
        <h2 style={{ margin: 0, fontSize: "clamp(16px, 5vw, 20px)", fontWeight: 700, color: "#111827" }}>{getPageTitle()}</h2>
        <p style={{ margin: "4px 0 0 0", fontSize: "clamp(11px, 2vw, 12px)", color: "#6b7280" }}>
          {time.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })} · {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      {/* Right Side - Actions */}
      <div className="topbar-right" style={{ display: "flex", alignItems: "center", gap: "clamp(8px, 2vw, 16px)", flexWrap: "wrap" }}>
        {/* Notification Bell */}
        <button style={{
          background: "transparent",
          border: "1px solid #e5e7eb",
          padding: "clamp(6px, 2vw, 8px) clamp(10px, 2vw, 12px)",
          borderRadius: 6,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: "#6b7280",
          transition: "all 0.2s",
          minHeight: "44px"
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f3f4f6";
            e.currentTarget.style.color = "#111827";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#6b7280";
          }}
        >
          <Bell size={18} />
        </button>

        {/* User Info */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "clamp(6px, 2vw, 8px)",
          padding: "clamp(6px, 2vw, 8px) clamp(10px, 2vw, 12px)",
          background: "#f3f4f6",
          borderRadius: 6,
          minHeight: "44px"
        }}>
          <User size={18} style={{ color: "#6b7280", flexShrink: 0 }} />
          <div style={{ fontSize: "clamp(11px, 2vw, 12px)", minWidth: "80px" }}>
            <p style={{ margin: 0, fontWeight: 600, color: "#111827" }}>Admin</p>
            <p style={{ margin: 0, fontSize: "clamp(10px, 1.5vw, 11px)", color: "#6b7280", wordBreak: "break-word" }}>{adminId}</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            background: "#ef4444",
            color: "white",
            border: "none",
            padding: "clamp(6px, 2vw, 8px) clamp(12px, 2vw, 14px)",
            borderRadius: 6,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: "clamp(12px, 2vw, 13px)",
            fontWeight: 500,
            transition: "all 0.2s",
            minHeight: "44px",
            whiteSpace: "nowrap"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#dc2626";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#ef4444";
          }}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Topbar;
