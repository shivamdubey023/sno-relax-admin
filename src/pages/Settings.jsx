import React, { useEffect, useState } from "react";
import { getThemeSetting, updateThemeSetting } from "../services/api";

const themes = [
  { id: "dark", name: "Dark" },
  { id: "light", name: "Light" },
  { id: "therapist", name: "Therapist" },
];

const Settings = () => {
  const [current, setCurrent] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getThemeSetting();
        if (res && res.ok) setCurrent(res.theme || null);
      } catch (e) {
        console.warn('Failed to load theme setting', e);
      }
    })();
  }, []);

  const handleSetTheme = async (theme) => {
    setSaving(true);
    try {
      const res = await updateThemeSetting(theme);
      if (res && res.ok) {
        setCurrent(res.theme);
        alert(`Global theme updated to '${res.theme}'. Clients will load this on next visit (or immediately if connected).`);
      } else {
        alert('Failed to update theme');
      }
    } catch (e) {
      console.error('Failed to update theme', e);
      alert('Failed to update theme');
    } finally { setSaving(false); }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Settings</h1>
      <p>Admin settings and preferences.</p>

      <section style={{ marginTop: 12 }}>
        <h3>Global Theme</h3>
        <p className="text-sm text-gray-600">Set the global theme that will be applied to clients. Allowed: dark, light, therapist.</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSetTheme(t.id)}
              disabled={saving}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: current === t.id ? '2px solid #111' : '1px solid #ddd',
                background: current === t.id ? '#111' : '#fff',
                color: current === t.id ? '#fff' : '#111',
                cursor: 'pointer'
              }}
            >
              {t.name}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 8 }}>
          <strong>Current:</strong> {current || 'not set'}
        </div>
      </section>
    </div>
  );
};

export default Settings;
