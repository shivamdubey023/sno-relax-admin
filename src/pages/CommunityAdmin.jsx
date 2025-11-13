import React, { useEffect, useState, useRef } from "react";
import { fetchGroupsMongo, fetchGroupMessages, deleteGroupMessage, createGroupMongo, deleteGroupMongo, fetchGroupMembers, removeGroupMember, updateGroupMongo, clearGroupMessages } from "../services/api";
import { io } from "socket.io-client";

export default function CommunityAdmin() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  // announcements removed from CommunityAdmin UI
  const messagesEndRef = useRef(null);

  const adminId = "ADMIN123"; // replace with actual admin ID
  const SOCKET_URL = process.env.REACT_APP_API_URL; // e.g., http://localhost:5000
  const [socket, setSocket] = useState(null);

  // Load groups
  useEffect(() => {
    async function loadGroups() {
      try {
        const res = await fetchGroupsMongo();
        if (res.ok) setGroups(res.groups);
      } catch (err) {
        console.error("Error fetching groups:", err);
      }
    }
    loadGroups();
  }, []);

  // Note: admin-only UI theme chooser removed — global theme control moved to Settings.

  // Initialize Socket.IO
  useEffect(() => {
  const newSocket = io(process.env.REACT_APP_API_BASE || SOCKET_URL || "");
    setSocket(newSocket);

    newSocket.on("connect", () => console.log("Connected to socket:", newSocket.id));

    // Receive new messages (server emits receiveGroupMessage)
    newSocket.on("receiveGroupMessage", (msg) => {
      if (String(msg.groupId) === String(selectedGroup?._id || selectedGroup?.id)) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    // react to messageDeleted events
    newSocket.on("messageDeleted", ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => String(m._id || m.id) !== String(messageId)));
    });

    // announcements pushed by server (no local UI rendered now)
    // kept listener in case other parts of the app use it
    newSocket.on("announcementCreated", (announcement) => {
      // no-op or could be used for notifications
      // setAnnouncements((prev) => [announcement, ...prev]);
    });

    return () => newSocket.disconnect();
  }, [SOCKET_URL, selectedGroup]);

  // Join selected group
  useEffect(() => {
    if (!socket || !selectedGroup) return;

  socket.emit("joinGroup", selectedGroup._id || selectedGroup.id);
    setMessages([]); // reset messages when switching groups
    // load group messages via admin API
    (async () => {
      try {
        const res = await fetchGroupMessages(selectedGroup._id || selectedGroup.id);
        if (res.ok) setMessages(res.messages || []);
        // load members for admin view
        try {
          const mres = await fetchGroupMembers(selectedGroup._id || selectedGroup.id);
          if (Array.isArray(mres)) setMembers(mres);
          else if (mres && mres.ok) setMembers(mres.members || []);
          else setMembers(mres.members || []);
        } catch (e) { console.warn('Failed to load members', e); }
      } catch (e) {
        console.error("Failed to load group messages:", e);
      }
    })();

    return () => socket.emit("leaveGroup", selectedGroup._id || selectedGroup.id);
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
      groupId: selectedGroup._id || selectedGroup.id,
      timestamp: new Date().toISOString(),
    };

    // send via socket using server's expected event
    socket.emit("sendGroupMessage", { groupId: selectedGroup._id || selectedGroup.id, senderId: adminId, message: message.text ? message.text : message });
    setMessages((prev) => [...prev, message]);
    setNewMessage("");
  };

  const handleDeleteMessage = async (messageId) => {
    if (!selectedGroup) return;
    try {
      await deleteGroupMessage(selectedGroup._id || selectedGroup.id, messageId);
      // server will emit messageDeleted to all clients; also prune locally
      setMessages((prev) => prev.filter((m) => String(m._id || m.id) !== String(messageId)));
    } catch (e) {
      console.error("Failed to delete message:", e);
      alert("Failed to delete message");
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!selectedGroup) return;
    if (!window.confirm('Remove this user from group?')) return;
    try {
      await removeGroupMember(selectedGroup._id || selectedGroup.id, userId);
      setMembers((prev) => prev.filter(m => m.userId !== userId));
      // also update groups list memberCount
      setGroups(prev => prev.map(g => g._id === selectedGroup._id ? { ...g, memberCount: Math.max(0, (g.memberCount||g.members?.length||0) - 1) } : g));
    } catch (e) {
      console.error('Failed to remove member', e);
      alert('Failed to remove member');
    }
  };

  const handleEditGroup = () => {
    if (!selectedGroup) return;
    setEditing(true);
    setEditName(selectedGroup.name || '');
    setEditDesc(selectedGroup.description || '');
  };

  const handleSaveEdit = async () => {
    if (!selectedGroup) return;
    try {
      const res = await updateGroupMongo(selectedGroup._id || selectedGroup.id, { name: editName, description: editDesc });
      const updated = res.group || res;
      if (updated) {
        setGroups(prev => prev.map(g => (String(g._id||g.id) === String(selectedGroup._id||selectedGroup.id) ? updated : g)));
        setSelectedGroup(updated);
        setEditing(false);
      }
    } catch (e) {
      console.error('Failed to update group', e);
      alert('Failed to update group');
    }
  };

  const handleClearMessages = async () => {
    if (!selectedGroup) return;
    if (!window.confirm('Clear all messages in this group?')) return;
    try {
      const res = await clearGroupMessages(selectedGroup._id || selectedGroup.id);
      if (res.ok) setMessages([]);
    } catch (e) {
      console.error('Failed to clear messages', e);
      alert('Failed to clear messages');
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    setCreating(true);
    try {
      const res = await createGroupMongo({ name: newGroupName, description: newGroupDesc, createdBy: adminId });
      if (res.ok) {
        setGroups((prev) => [res.group, ...prev]);
        setNewGroupName("");
        setNewGroupDesc("");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to create group");
    } finally { setCreating(false); }
  };

  const handleDeleteGroup = async (id) => {
  if (!window.confirm("Delete this group?")) return;
    try {
      await deleteGroupMongo(id);
      setGroups((prev) => prev.filter((g) => String(g._id || g.id) !== String(id)));
      if (selectedGroup && (String(selectedGroup._id||selectedGroup.id)===String(id))) setSelectedGroup(null);
    } catch (e) {
      console.error(e);
      alert("Failed to delete group");
    }
  };

  // announcement creation/deletion UI removed per request; server listeners kept.

  return (
    <div className="flex h-screen bg-white text-black">
      {/* Sidebar */}
      <div className="w-1/4 p-4 border-r border-gray-300">
        <h2 className="text-xl font-bold mb-4">Groups</h2>
        {/* Admin Settings removed — global theme now controlled in Settings page */}
              <div className="mb-4">
                <input className="w-full mb-2 p-2 border rounded" placeholder="New group name" value={newGroupName} onChange={(e)=>setNewGroupName(e.target.value)} />
                <input className="w-full mb-2 p-2 border rounded" placeholder="Description" value={newGroupDesc} onChange={(e)=>setNewGroupDesc(e.target.value)} />
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-green-500 text-white rounded" onClick={handleCreateGroup} disabled={creating}>Create</button>
                </div>
              </div>

        {/* Announcement creation removed from CommunityAdmin (handled elsewhere) */}
        <ul className="space-y-2">
          {groups.map((g) => (
            <li
              key={g._id || g.id}
              className={`p-2 rounded cursor-pointer ${
                String(selectedGroup?._id) === String(g._id || g.id) ? "bg-gray-200 font-bold" : "hover:bg-gray-100"
              }`}
              onClick={() => setSelectedGroup(g)}
            >
              {g.name}
                    <button className="ml-2 text-red-600" onClick={(e)=>{e.stopPropagation(); handleDeleteGroup(g._id||g.id)}}>Delete</button>
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedGroup ? (
          <>
            <div className="p-4 border-b border-gray-300 font-semibold text-lg flex items-center justify-between">
              <div>
                {editing ? (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input className="border p-1 rounded" value={editName} onChange={(e)=>setEditName(e.target.value)} />
                    <input className="border p-1 rounded" value={editDesc} onChange={(e)=>setEditDesc(e.target.value)} />
                    <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={handleSaveEdit}>Save</button>
                    <button className="px-2 py-1 bg-gray-300 rounded" onClick={()=>setEditing(false)}>Cancel</button>
                  </div>
                ) : (
                  <div>{selectedGroup.name} - Admin Chat</div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="px-2 py-1 bg-yellow-400 text-black rounded" onClick={handleEditGroup}>Edit</button>
                <button className="px-2 py-1 bg-red-400 text-white rounded" onClick={handleClearMessages}>Clear Messages</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
              {/* members list for admin */}
              {members && members.length > 0 && (
                <div className="mb-4 p-3 bg-white rounded shadow-sm">
                  <div className="font-semibold mb-2">Members</div>
                  <ul>
                    {members.map((m) => (
                      <li key={m.userId} className="flex items-center justify-between mb-1">
                        <span>{m.nickname || m.userId}</span>
                        <button className="text-red-600 text-sm" onClick={()=>handleRemoveMember(m.userId)}>Remove</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {messages.map((m) => (
                <div
                  key={m._id || m.id}
                  className={`max-w-xs p-2 rounded ${
                    (m.userId === adminId || m.senderId?.toString() === adminId) ? "ml-auto bg-blue-200" : "mr-auto bg-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{m.senderId?.name || m.userId || (m.senderId && m.senderId._id) || "User"}</span>
                    <button className="text-red-600 text-sm ml-2" onClick={()=>handleDeleteMessage(m._id || m.id)}>Delete</button>
                  </div>
                  <p>{m.message || m.text}</p>
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

      {/* Announcements panel removed from CommunityAdmin */}
    </div>
  );
}
