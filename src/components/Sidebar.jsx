import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Users, FileText, MessageSquare, 
  Settings, MessageCircle, Users2, BarChart3, 
  TrendingUp, Shield, X, HelpCircle, LogOut
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const mainNavItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/users", label: "Users", icon: Users },
  { path: "/content", label: "Content", icon: FileText },
  { path: "/community", label: "Communities", icon: Users2 },
  { path: "/private-messages", label: "Messages", icon: MessageCircle },
  { path: "/reports", label: "Reports", icon: MessageSquare },
];

const secondaryNavItems = [
  { path: "/analytics", label: "Analytics", icon: TrendingUp },
  { path: "/settings", label: "Settings", icon: Settings },
];

const Sidebar = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const adminId = localStorage.getItem("adminId") || "admin";

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminId");
      localStorage.removeItem("adminName");
      navigate("/login");
    }
  };

  return (
    <aside className="sidebar">
      {/* Close button for mobile */}
      {onClose && (
        <button
          onClick={onClose}
          className="sidebar-close"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      )}

      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Shield size={24} />
        </div>
        <div className="logo-text">
          <h1>SnoRelax</h1>
          <p>Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section">
          <span className="nav-section-title">Overview</span>
          <ul>
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <li key={item.path}>
                  <Link 
                    to={item.path} 
                    onClick={() => onClose && onClose()} 
                    className={`nav-link ${active ? 'active' : ''}`}
                  >
                    <span className="nav-link-icon">
                      <Icon size={20} />
                    </span>
                    <span className="nav-link-text">{item.label}</span>
                    {active && <span className="active-indicator" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="nav-section">
          <span className="nav-section-title">System</span>
          <ul>
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <li key={item.path}>
                  <Link 
                    to={item.path} 
                    onClick={() => onClose && onClose()} 
                    className={`nav-link ${active ? 'active' : ''}`}
                  >
                    <span className="nav-link-icon">
                      <Icon size={20} />
                    </span>
                    <span className="nav-link-text">{item.label}</span>
                    {active && <span className="active-indicator" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="footer-stats">
          <div className="stat">
            <span className="stat-value">v1.0</span>
            <span className="stat-label">Version</span>
          </div>
          <div className="stat">
            <span className="stat-value">{new Date().getFullYear()}</span>
            <span className="stat-label">Year</span>
          </div>
        </div>
        
        <div className="footer-actions">
          <button className="footer-btn" title="Help">
            <HelpCircle size={16} />
            <span>Help</span>
          </button>
          <button className="footer-btn danger" onClick={handleLogout} title="Sign out">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <style>{`
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: var(--sidebar-width);
          height: 100vh;
          background: linear-gradient(180deg, #111827 0%, #0f172a 100%);
          color: white;
          display: flex;
          flex-direction: column;
          z-index: 100;
          overflow: hidden;
        }
        
        .sidebar::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 240px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%);
          pointer-events: none;
        }
        
        .sidebar-close {
          display: none;
          position: absolute;
          top: 16px;
          right: 16px;
          width: 32px;
          height: 32px;
          background: rgba(255,255,255,0.1);
          border: none;
          border-radius: var(--radius-md);
          color: white;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
          z-index: 10;
        }
        
        .sidebar-close:hover {
          background: rgba(255,255,255,0.2);
        }
        
        /* Logo */
        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-5);
          margin-bottom: var(--space-2);
          position: relative;
        }
        
        .logo-icon {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }
        
        .logo-text h1 {
          font-size: 18px;
          font-weight: 700;
          color: white;
          letter-spacing: -0.3px;
        }
        
        .logo-text p {
          font-size: 11px;
          font-weight: 500;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 2px;
        }
        
        /* Navigation */
        .sidebar-nav {
          flex: 1;
          padding: 0 var(--space-3);
          overflow-y: auto;
          overflow-x: hidden;
        }
        
        .sidebar-nav::-webkit-scrollbar {
          width: 4px;
        }
        
        .sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .sidebar-nav::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
        }
        
        .nav-section {
          margin-bottom: var(--space-4);
        }
        
        .nav-section-title {
          display: block;
          font-size: 10px;
          font-weight: 600;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          padding: var(--space-3) var(--space-3) var(--space-2);
        }
        
        .sidebar-nav ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .sidebar-nav li {
          margin-bottom: 2px;
        }
        
        .nav-link {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-3);
          border-radius: var(--radius-lg);
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: all var(--transition-fast);
          position: relative;
          overflow: hidden;
        }
        
        .nav-link:hover {
          color: white;
          background: rgba(255,255,255,0.05);
        }
        
        .nav-link.active {
          color: white;
          background: linear-gradient(90deg, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.1) 100%);
        }
        
        .nav-link-icon {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.05);
          transition: all var(--transition-fast);
        }
        
        .nav-link:hover .nav-link-icon {
          background: rgba(255,255,255,0.1);
        }
        
        .nav-link.active .nav-link-icon {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
        }
        
        .nav-link-text {
          flex: 1;
        }
        
        .active-indicator {
          width: 6px;
          height: 6px;
          background: #6366f1;
          border-radius: var(--radius-full);
          box-shadow: 0 0 8px rgba(99, 102, 241, 0.6);
        }
        
        /* Footer */
        .sidebar-footer {
          padding: var(--space-4);
          border-top: 1px solid rgba(255,255,255,0.08);
          background: rgba(0,0,0,0.2);
        }
        
        .footer-stats {
          display: flex;
          gap: var(--space-4);
          margin-bottom: var(--space-3);
        }
        
        .footer-stats .stat {
          display: flex;
          flex-direction: column;
        }
        
        .footer-stats .stat-value {
          font-size: 14px;
          font-weight: 600;
          color: rgba(255,255,255,0.8);
        }
        
        .footer-stats .stat-label {
          font-size: 10px;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .footer-actions {
          display: flex;
          gap: var(--space-2);
        }
        
        .footer-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          background: rgba(255,255,255,0.05);
          border: none;
          border-radius: var(--radius-md);
          color: rgba(255,255,255,0.6);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        
        .footer-btn:hover {
          background: rgba(255,255,255,0.1);
          color: white;
        }
        
        .footer-btn.danger:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
          .sidebar-container {
            transform: translateX(-100%);
          }
          
          .sidebar-container.open {
            transform: translateX(0);
          }
          
          .sidebar-close {
            display: flex;
          }
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;