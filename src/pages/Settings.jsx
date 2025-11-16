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
    </div>
  );
};

export default Settings;
