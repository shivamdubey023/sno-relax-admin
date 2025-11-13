// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Content from "./pages/Content";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import CommunityAdmin from "./pages/CommunityAdmin";
import PrivateMessages from "./pages/PrivateMessages";
import ProtectedRoute from "./components/ProtectedRoute";

// ---------------- Layout ----------------
function AppLayout({ children }) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Topbar />
        {children}
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
          path="/settings" 
          element={
            <ProtectedRoute>
              <LayoutRoute element={Settings} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/community-admin" 
          element={
            <ProtectedRoute>
              <LayoutRoute element={CommunityAdmin} />
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
