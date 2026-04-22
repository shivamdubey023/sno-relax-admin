import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Search, Bell, Settings, LogOut, User, ChevronDown,
  Menu, TrendingUp, Users, FileText, MessageSquare, 
  MessageCircle, Users2, BarChart3, Moon, Sun, AlertCircle
} from "lucide-react";

const navItems = [
  { path: "/", label: "Dashboard", icon: BarChart3 },
  { path: "/users", label: "Users", icon: Users },
  { path: "/content", label: "Content", icon: FileText },
  { path: "/community", label: "Communities", icon: Users2 },
  { path: "/private-messages", label: "Messages", icon: MessageCircle },
  { path: "/reports", label: "Reports", icon: MessageSquare },
  { path: "/analytics", label: "Analytics", icon: TrendingUp },
  { path: "/settings", label: "Settings", icon: Settings },
  { path: "/admin-profile", label: "Admin Profile", icon: User }
];

const Topbar = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications] = useState([
    { id: 1, title: "New user registered", time: "2 min ago", read: false, type: "user" },
    { id: 2, title: "Report uploaded successfully", time: "15 min ago", read: false, type: "report" },
    { id: 3, title: "Community post flagged for review", time: "1 hour ago", read: true, type: "alert" },
    { id: 4, title: "System backup completed", time: "2 hours ago", read: true, type: "system" },
  ]);

  const currentPage = navItems.find(item => item.path === location.pathname);
  const adminName = localStorage.getItem("adminName") || "Admin";
  const adminId = localStorage.getItem("adminId") || "admin";

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminId");
      localStorage.removeItem("adminName");
      navigate("/login");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching:", searchQuery);
    }
  };

  const getPageTitle = () => {
    const titles = {
      "/": "Dashboard",
      "/users": "Users Management",
      "/content": "Content Management",
      "/community": "Communities",
      "/private-messages": "Messages",
      "/reports": "Reports",
      "/analytics": "Analytics",
      "/settings": "Settings",
      "/admin-profile": "Profile"
    };
    return titles[location.pathname] || "Dashboard";
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "user": return <Users size={16} />;
      case "report": return <FileText size={16} />;
      case "alert": return <AlertCircle size={16} />;
      default: return <BarChart3 size={16} />;
    }
  };

  return (
    <header className="topbar">
      {/* Left Section */}
      <div className="topbar-left">
        <button className="topbar-menu-btn" onClick={onMenuClick}>
          <Menu size={20} />
        </button>
        
        <div className="topbar-title">
          <h2>{getPageTitle()}</h2>
          <span className="topbar-breadcrumb">
            <span>SnoRelax</span>
            <span className="breadcrumb-sep">/</span>
            <span>{currentPage?.label || "Dashboard"}</span>
          </span>
        </div>
      </div>

      {/* Center - Search */}
      <form className="topbar-search" onSubmit={handleSearch}>
        <Search size={18} />
        <input 
          type="text" 
          placeholder="Search users, content, reports..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <kbd>⌘K</kbd>
      </form>

      {/* Right Section */}
      <div className="topbar-right">
        {/* Dark Mode Toggle */}
        <button className="topbar-icon-btn" title={darkMode ? "Light mode" : "Dark mode"}>
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="topbar-dropdown">
          <button 
            className="topbar-icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>
          
          {showNotifications && (
            <>
              <div className="dropdown-backdrop" onClick={() => setShowNotifications(false)} />
              <div className="dropdown-menu notifications-menu">
                <div className="dropdown-header">
                  <h4>Notifications</h4>
                  <button className="mark-read-btn">Mark all read</button>
                </div>
                <div className="notifications-list">
                  {notifications.map(notif => (
                    <div key={notif.id} className={`notification-item ${notif.read ? 'read' : 'unread'}`}>
                      <div className="notification-icon">{getNotificationIcon(notif.type)}</div>
                      <div className="notification-content">
                        <p>{notif.title}</p>
                        <span>{notif.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/notifications" className="dropdown-footer" onClick={() => setShowNotifications(false)}>
                  View all notifications
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Settings */}
        <Link to="/settings" className="topbar-icon-btn" title="Settings">
          <Settings size={20} />
        </Link>

        {/* User Menu */}
        <div className="topbar-dropdown user-dropdown">
          <button 
            className="topbar-user"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="topbar-user-avatar">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="topbar-user-info">
              <span className="topbar-user-name">{adminName}</span>
              <span className="topbar-user-role">Administrator</span>
            </div>
            <ChevronDown size={16} className="user-chevron" />
          </button>

          {showUserMenu && (
            <>
              <div className="dropdown-backdrop" onClick={() => setShowUserMenu(false)} />
              <div className="dropdown-menu user-menu">
                <Link to="/admin-profile" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                  <User size={16} />
                  <span>My Profile</span>
                </Link>
                <Link to="/settings" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                  <Settings size={16} />
                  <span>Settings</span>
                </Link>
                <div className="dropdown-divider" />
                <button className="dropdown-item danger" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .topbar-menu-btn {
          display: none;
          width: 40px;
          height: 40px;
          border: none;
          background: var(--gray-50);
          border-radius: var(--radius-lg);
          cursor: pointer;
          align-items: center;
          justify-content: center;
          color: var(--gray-600);
          transition: all var(--transition-fast);
        }
        
        .topbar-menu-btn:hover {
          background: var(--gray-100);
          color: var(--gray-900);
        }
        
        .topbar-title {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .topbar-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--gray-400);
          font-weight: 500;
        }
        
        .breadcrumb-sep {
          color: var(--gray-300);
        }
        
        .topbar-dropdown {
          position: relative;
        }
        
        .dropdown-backdrop {
          position: fixed;
          inset: 0;
          z-index: 99;
        }
        
        .dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: white;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-xl);
          border: 1px solid var(--gray-100);
          min-width: 280px;
          overflow: hidden;
          z-index: 100;
          animation: dropdownIn 0.15s ease;
        }
        
        .dropdown-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4);
          border-bottom: 1px solid var(--gray-100);
        }
        
        .dropdown-header h4 {
          font-size: 14px;
          font-weight: 600;
          margin: 0;
        }
        
        .mark-read-btn {
          font-size: 12px;
          color: var(--primary-500);
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 500;
        }
        
        .notifications-list {
          max-height: 320px;
          overflow-y: auto;
        }
        
        .notification-item {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          transition: background var(--transition-fast);
        }
        
        .notification-item:hover {
          background: var(--gray-50);
        }
        
        .notification-item.unread {
          background: var(--primary-50);
        }
        
        .notification-icon {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-md);
          background: var(--gray-100);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gray-500);
          flex-shrink: 0;
        }
        
        .notification-item.unread .notification-icon {
          background: var(--primary-100);
          color: var(--primary-600);
        }
        
        .notification-content {
          flex: 1;
          min-width: 0;
        }
        
        .notification-content p {
          font-size: 13px;
          color: var(--gray-700);
          margin: 0 0 2px;
          font-weight: 500;
        }
        
        .notification-content span {
          font-size: 11px;
          color: var(--gray-400);
        }
        
        .dropdown-footer {
          display: block;
          padding: var(--space-3) var(--space-4);
          text-align: center;
          font-size: 13px;
          color: var(--primary-500);
          border-top: 1px solid var(--gray-100);
          background: var(--gray-50);
          font-weight: 500;
        }
        
        .user-menu {
          min-width: 200px;
        }
        
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          font-size: 14px;
          color: var(--gray-700);
          text-decoration: none;
          transition: all var(--transition-fast);
          width: 100%;
          border: none;
          background: none;
          cursor: pointer;
          text-align: left;
        }
        
        .dropdown-item:hover {
          background: var(--gray-50);
        }
        
        .dropdown-item.danger {
          color: var(--danger-500);
        }
        
        .dropdown-item.danger:hover {
          background: var(--danger-50);
        }
        
        .dropdown-divider {
          height: 1px;
          background: var(--gray-100);
          margin: var(--space-2) 0;
        }
        
        .notification-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          min-width: 18px;
          height: 18px;
          background: var(--danger-500);
          color: white;
          font-size: 10px;
          font-weight: 600;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          padding: 0 4px;
        }
        
        .user-chevron {
          color: var(--gray-400);
          transition: transform var(--transition-fast);
        }
        
        .user-dropdown:hover .user-chevron {
          transform: rotate(180deg);
        }
        
        @keyframes dropdownIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes AlertCircle {
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .topbar-menu-btn {
            display: flex;
          }
          
          .topbar-search {
            display: none;
          }
          
          .topbar-user-info {
            display: none;
          }
          
          .topbar {
            padding: 0 var(--space-4);
          }
        }
      `}</style>
    </header>
  );
};

export default Topbar;