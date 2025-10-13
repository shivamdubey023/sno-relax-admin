import React, { useEffect, useState, useRef } from "react";
import { fetchGroups } from "../services/api";
import { io } from "socket.io-client";

export default function CommunityAdmin() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  const adminId = "ADMIN123"; // replace with actual admin ID
  const SOCKET_URL = process.env.REACT_APP_API_URL; // e.g., http://localhost:5000
  const [socket, setSocket] = useState(null);

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

  // Initialize Socket.IO
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on("connect", () => console.log("Connected to socket:", newSocket.id));

    // Receive new messages
    newSocket.on("newMessage", (msg) => {
      if (msg.groupId === selectedGroup?.id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => newSocket.disconnect();
  }, [SOCKET_URL, selectedGroup]);

  // Join selected group
  useEffect(() => {
    if (!socket || !selectedGroup) return;

    socket.emit("joinGroup", selectedGroup.id);
    setMessages([]); // reset messages when switching groups

    return () => socket.emit("leaveGroup", selectedGroup.id);
  }, [socket, selectedGroup]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSend = () => {
    if (!newMessage.trim() || !socket || !selectedGroup) return;

    const message = {
      id: Date.now(),
      userId: adminId,
      text: newMessage,
      groupId: selectedGroup.id,
      timestamp: new Date().toISOString(),
    };

    socket.emit("sendMessage", { groupId: selectedGroup.id, message });
    setMessages((prev) => [...prev, message]);
    setNewMessage("");
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
