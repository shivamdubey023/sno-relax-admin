import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BarChart3, Users, FileText, MessageSquare, Settings, MessageCircle, Users2, X, User } from "lucide-react";

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
    { path: "/admin-profile", label: "Admin Profile", icon: User }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar">
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
      <div className="sidebar-logo">
        <h1>🛡️ SnoRelax</h1>
        <p>ADMIN PANEL</p>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-title">Main Menu</div>
        <ul>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <li key={item.path}>
                <Link to={item.path} onClick={() => onClose && onClose()} className={`nav-link ${active ? 'active' : ''}`}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Info */}
      <div className="sidebar-footer">
        <p className="footer-admin">Admin ID: <strong>{localStorage.getItem("adminId") || "unknown"}</strong></p>
        <p className="footer-meta">v1.0 • {new Date().getFullYear()}</p>
      </div>
    </div>
  );
};

export default Sidebar;
