// src/App.js
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Content from "./pages/Content";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Community from "./pages/Community";
import PrivateMessages from "./pages/PrivateMessages";
import ProfileChanges from "./pages/ProfileChanges";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";
import "./responsive.css";

// ---------------- Layout ----------------
function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout" style={{ display: "flex", height: "100vh", background: "#f9fafb" }}>
      <div className={`sidebar-container ${sidebarOpen ? "open" : ""}`} aria-hidden={!sidebarOpen}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Backdrop for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          role="button"
          aria-label="Close sidebar"
        />
      )}

      <div className="main-wrapper" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="main-content" style={{ flex: 1, overflow: "auto", padding: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}

// ---------------- Layout Wrapper ----------------
function LayoutRoute({ element: Element }) {
  return <AppLayout><Element /></AppLayout>;
}

// ---------------- App ----------------
function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route 
          path="/login" 
          element={
            localStorage.getItem("adminToken") ? <Navigate to="/" /> : <Login />
          } 
        />

        {/* Protected Routes with Layout */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <LayoutRoute element={Dashboard} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/users" 
          element={
            <ProtectedRoute>
              <LayoutRoute element={Users} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/content" 
          element={
            <ProtectedRoute>
              <LayoutRoute element={Content} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute>
              <LayoutRoute element={Reports} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile-changes" 
          element={
            <ProtectedRoute>
              <LayoutRoute element={ProfileChanges} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <LayoutRoute element={Settings} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/community" 
          element={
            <ProtectedRoute>
              <LayoutRoute element={Community} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/private-messages" 
          element={
            <ProtectedRoute>
              <LayoutRoute element={PrivateMessages} />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
