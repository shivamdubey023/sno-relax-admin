import React from "react";

const Settings = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Settings</h1>
      <p>Admin settings and preferences.</p>

      <section style={{ marginTop: 12 }}>
        <h3>Appearance</h3>
        <p className="text-sm text-gray-600">The global theme option has been removed. Clients will use their local preferences or the application default.</p>
      </section>

      <section style={{ marginTop: 18 }}>
        <h3>Admin Credentials</h3>
        <p className="text-sm text-gray-600">Read-only admin credentials (for convenience).</p>

        <div style={{ marginTop: 12, maxWidth: 560 }}>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: 'block', fontWeight: 700 }}>Admin ID</label>
            <input readOnly value={localStorage.getItem('adminId') || 'admin'} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }} />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={{ display: 'block', fontWeight: 700 }}>Admin Password</label>
            <input readOnly value={localStorage.getItem('adminPassword') || process.env.REACT_APP_ADMIN_PASSWORD || 'pass'} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e5e7eb', fontFamily: 'monospace' }} />
          </div>

        </div>
      </section>
    </div>
  );
};

export default Settings;
