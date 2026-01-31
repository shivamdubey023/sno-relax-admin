import React from "react";

export default function AdminProfile() {
  const adminId = localStorage.getItem("adminId") || "admin";
  // Password isn't stored client-side by default; fall back to default value
  const adminPassword = localStorage.getItem("adminPassword") || process.env.REACT_APP_ADMIN_PASSWORD || "pass";
  const adminEmail = localStorage.getItem("adminEmail") || "admin@snorelax.local";

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Profile</h1>
      <p className="text-muted" style={{ marginTop: 8 }}>Read-only admin credentials (for local admin use only).</p>

      <div style={{ marginTop: 16, maxWidth: 640 }}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Admin Name</label>
          <div>{localStorage.getItem("adminName") || "Administrator"}</div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Admin ID</label>
          <div>{adminId}</div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Admin Email</label>
          <div>{adminEmail}</div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Admin Password</label>
          <div style={{ fontFamily: "monospace", background: "#f3f4f6", padding: 8, borderRadius: 6 }}>{adminPassword}</div>
        </div>

        <p style={{ marginTop: 14, color: "#6b7280" }}><strong>Security note:</strong> This password is displayed for admin convenience only. Do not share it publicly.</p>
      </div>
    </div>
  );
}
