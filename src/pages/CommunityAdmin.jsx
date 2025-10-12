// src/pages/AdminCommunityChat.js
import React, { useEffect, useState, useRef } from "react";
import { fetchGroups } from "../api/admin";
import axios from "axios";

export default function AdminCommunityChat() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  const adminId = "ADMIN123"; // replace with actual admin auth ID
  const API_BASE = process.env.REACT_APP_API_URL;

  // Load groups
  useEffect(() => {
    async function loadGroups() {
      try {
        const res = await fetchGroups();
        if (res.ok) setGroups(res.groups);
      } catch (err) {
        console.error("Error fetching groups:", err);
      }
    }
    loadGroups();
  }, []);

  // Load messages for selected group
  useEffect(() => {
    if (!selectedGroup) return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API_BASE}/${selectedGroup.id}/messages`);
        if (res.data.ok) setMessages(res.data.messages);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    }, 3000); // poll every 3s

    return () => clearInterval(interval);
  }, [selectedGroup]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      await axios.post(`${API_BASE}/${selectedGroup.id}/message`, {
        userId: adminId,
        text: newMessage,
      });
      setNewMessage("");
      // Optionally reload messages immediately
      const res = await axios.get(`${API_BASE}/${selectedGroup.id}/messages`);
      if (res.data.ok) setMessages(res.data.messages);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="flex h-screen bg-white text-black">
      {/* Sidebar */}
      <div className="w-1/4 p-4 border-r border-gray-300">
        <h2 className="text-xl font-bold mb-4">Groups</h2>
        <ul className="space-y-2">
          {groups.map((g) => (
            <li
              key={g.id}
              className={`p-2 rounded cursor-pointer ${
                selectedGroup?.id === g.id ? "bg-gray-200 font-bold" : "hover:bg-gray-100"
              }`}
              onClick={() => setSelectedGroup(g)}
            >
              {g.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedGroup ? (
          <>
            <div className="p-4 border-b border-gray-300 font-semibold text-lg">
              {selectedGroup.name} - Admin Chat
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-xs p-2 rounded ${
                    m.userId === adminId ? "ml-auto bg-blue-200" : "mr-auto bg-gray-200"
                  }`}
                >
                  <span className="text-xs font-bold">
                    {m.userId === adminId ? "Admin" : m.userId}
                  </span>
                  <p>{m.text}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-300 flex gap-2">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded px-3 py-2"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleSend}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a group to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
