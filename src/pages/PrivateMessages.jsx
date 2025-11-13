import React, { useEffect, useState } from "react";
import { getUsers, fetchPrivateMessages, sendPrivateMessageAdmin } from "../services/api";

export default function PrivateMessages() {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getUsers();
        setUsers(res.data || res);
      } catch (e) {
        console.error("Failed to load users", e.message);
      }
    };
    load();
  }, []);

  const openConversation = async (user) => {
    setSelected(user);
    try {
      const res = await fetchPrivateMessages(user.userId);
      setMessages(res.messages || []);
    } catch (e) {
      console.error("Failed to load messages for user", e.message);
    }
  };

  const sendReply = async () => {
    if (!reply.trim() || !selected) return;
    try {
      await sendPrivateMessageAdmin({ senderId: "admin", receiverId: selected.userId, message: reply.trim() });
      // append locally
      setMessages((s) => [...s, { senderId: "admin", receiverId: selected.userId, message: reply.trim(), createdAt: new Date().toISOString() }]);
      setReply("");
    } catch (e) {
      console.error("Failed to send reply", e.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Private Messages</h2>
      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ width: 300, borderRight: "1px solid #ddd", paddingRight: 16 }}>
          <h4>Users</h4>
          <div style={{ maxHeight: 520, overflowY: "auto" }}>
            {users.map((u) => (
              <div key={u._id} style={{ padding: 8, cursor: "pointer", borderBottom: "1px solid #f0f0f0" }} onClick={() => openConversation(u)}>
                <div><strong>{u.firstName} {u.lastName}</strong></div>
                <div style={{ fontSize: 12, color: "#666" }}>{u.userId}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          {selected ? (
            <div>
              <h3>Conversation with {selected.firstName} {selected.lastName}</h3>
              <div style={{ color: "#444", marginBottom: 8 }}><strong>User ID:</strong> {selected.userId} • <strong>About:</strong> {selected.history || "-"}</div>

              <div style={{ maxHeight: 420, overflowY: "auto", padding: 8, border: "1px solid #eee", borderRadius: 6, background: "#fff" }}>
                {messages.length === 0 ? <p style={{ color: "#666" }}>No messages yet.</p> : messages.map((m, i) => (
                  <div key={i} style={{ marginBottom: 10, padding: 8, borderRadius: 6, background: m.senderId === "admin" ? "#e6f7ef" : "#f7f7fb" }}>
                    <div style={{ fontSize: 14 }}>{m.message}</div>
                    <small style={{ color: "#666" }}>{new Date(m.createdAt || m.createdAt).toLocaleString()} • <strong>{m.senderId}</strong></small>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type reply..." style={{ flex: 1, minHeight: 80 }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button onClick={sendReply} className="btn">Send</button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: "#666" }}>Select a user to view private messages and reply.</div>
          )}
        </div>
      </div>
    </div>
  );
}
