import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BarChart3, Users, FileText, MessageSquare, Settings, MessageCircle, Users2, X } from "lucide-react";

const Sidebar = ({ onClose }) => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: BarChart3 },
    { path: "/users", label: "Users", icon: Users },
    { path: "/content", label: "Content", icon: FileText },
    { path: "/community", label: "Communities", icon: Users2 },
    { path: "/private-messages", label: "Messages", icon: MessageCircle },
    { path: "/reports", label: "Reports", icon: MessageSquare },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar-container" style={{
      width: "240px",
      height: "100vh",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
      color: "white",
      padding: "24px 16px",
      boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
      display: "flex",
      flexDirection: "column",
      position: "relative"
    }}>
      {/* Close button for mobile */}
      {onClose && (
        <button
          onClick={onClose}
          className="sidebar-close"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "transparent",
            border: "none",
            color: "white",
            cursor: "pointer"
          }}
        >
          <X size={24} />
        </button>
      )}

      {/* Logo */}
      <div style={{ marginBottom: "32px", paddingBottom: "16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <h1 style={{ margin: 0, fontSize: "clamp(16px, 5vw, 20px)", fontWeight: 700, letterSpacing: 0.5 }}>🛡️ SnoRelax</h1>
        <p style={{ margin: "4px 0 0 0", fontSize: "clamp(10px, 3vw, 11px)", color: "#9ca3af", fontWeight: 500 }}>ADMIN PANEL</p>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1 }}>
        <div style={{ fontSize: "clamp(10px, 2vw, 10px)", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", marginBottom: 12, letterSpacing: 0.5 }}>Main Menu</div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <li key={item.path} style={{ marginBottom: 8 }}>
                <Link
                  to={item.path}
                  onClick={() => onClose && onClose()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "clamp(8px, 2vw, 10px) clamp(10px, 2vw, 12px)",
                    borderRadius: "6px",
                    textDecoration: "none",
                    color: active ? "#ffffff" : "#d1d5db",
                    background: active ? "rgba(59, 130, 246, 0.2)" : "transparent",
                    borderLeft: active ? "3px solid #3b82f6" : "3px solid transparent",
                    paddingLeft: active ? "calc(clamp(10px, 2vw, 12px) - 3px)" : "clamp(10px, 2vw, 12px)",
                    transition: "all 0.2s ease",
                    fontSize: "clamp(12px, 3vw, 13px)",
                    fontWeight: active ? 600 : 500
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "rgba(75, 85, 99, 0.3)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Info */}
      <div style={{ paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.1)", fontSize: "clamp(10px, 2vw, 11px)", color: "#9ca3af" }}>
        <p style={{ margin: 0, marginBottom: 8, wordBreak: "break-all" }}>Admin ID: {localStorage.getItem("adminId") || "unknown"}</p>
        <p style={{ margin: 0, fontSize: "clamp(10px, 2vw, 10px)", color: "#6b7280" }}>v1.0 • {new Date().getFullYear()}</p>
      </div>
    </div>
  );
};

export default Sidebar;
