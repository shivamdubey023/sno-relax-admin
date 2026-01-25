import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { API_BASE } from "../config/api.config";

const Community = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [groupIsPrivate, setGroupIsPrivate] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [activeTab, setActiveTab] = useState("groups");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingMessageText, setEditingMessageText] = useState("");
  const [socket, setSocket] = useState(null);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupDesc, setEditGroupDesc] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [messagesMaxHeight, setMessagesMaxHeight] = useState("auto");

  const adminId = localStorage.getItem("adminId") || "admin";

  useEffect(() => {
    loadGroups();
    loadAllUsers();
    // do not set an unconditional interval here — groups refresh will be controlled
    // by a separate effect that respects the active tab to avoid interfering with typing
    return () => {};
  }, []);

  // Refresh groups periodically only when not viewing messages (so typing isn't interrupted)
  useEffect(() => {
    if (activeTab === 'messages') return; // skip polling while viewing messages
    const interval = setInterval(() => {
      // Only refresh groups when admin is not on messages tab
      if (activeTab !== 'messages') loadGroups();
    }, 5000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Request notification permission for admin UI
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Notification && Notification.permission === 'default') {
      try { Notification.requestPermission(); } catch (e) { /* ignore */ }
    }
  }, []);

  // Initialize Socket.IO for real-time messages
  useEffect(() => {
    const newSocket = io(API_BASE || "http://localhost:5000");
    setSocket(newSocket);

    newSocket.on("connect", () => console.log("Connected to socket:", newSocket.id));

    newSocket.on("receiveGroupMessage", (msg) => {
      if (selectedGroup && String(msg.groupId) === String(selectedGroup._id || selectedGroup.id)) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some(m => String(m._id || m.id) === String(msg._id || msg.id))) return prev;
          return [...prev, msg];
        });
        // show desktop notification for messages not from admin
        try {
          const isFromMe = String(msg.senderId) === String(adminId);
          if (!isFromMe && typeof window !== 'undefined' && window.Notification && Notification.permission === 'granted') {
            const title = `${selectedGroup?.name || 'Group'} — ${msg.senderNickname || 'Anonymous'}`;
            const body = (msg.message || '').slice(0, 140);
            const n = new Notification(title, { body });
            setTimeout(() => n.close(), 5000);
          }
        } catch (e) {}
      }
    });

    newSocket.on("messageDeleted", ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => String(m._id || m.id) !== String(messageId)));
    });

    return () => newSocket.disconnect();
  }, []); // Remove selectedGroup dependency

  // Handle joining/leaving groups
  useEffect(() => {
    if (!socket || !selectedGroup) return;

    socket.emit("joinGroup", selectedGroup._id || selectedGroup.id);

    return () => {
      if (socket) {
        socket.emit("leaveGroup", selectedGroup._id || selectedGroup.id);
      }
    };
  }, [socket, selectedGroup]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // compute messages area height based on input height
  useEffect(() => {
    const updateHeight = () => {
      try {
        const inputH = inputRef.current ? inputRef.current.offsetHeight : 0;
        const newH = window.innerHeight - inputH - 24; // small padding
        setMessagesMaxHeight(newH > 200 ? `${newH}px` : "200px");
      } catch (e) {
        setMessagesMaxHeight("auto");
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [selectedGroup]);

  // Load selected group data via socket
  useEffect(() => {
    if (!socket || !selectedGroup) return;

    socket.emit("joinGroup", selectedGroup._id || selectedGroup.id);
    setMessages([]);
    
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/community/group/${selectedGroup._id || selectedGroup.id}/messages`, {
          credentials: "include"
        });
        const data = await res.json();
        setMessages(data.messages || data || []);

        const mres = await fetch(`${API_BASE}/api/community/group/${selectedGroup._id || selectedGroup.id}/members`, {
          credentials: "include"
        });
        const memberData = await mres.json();
        setMembers(Array.isArray(memberData) ? memberData : []);
      } catch (err) {
        console.error("Error loading group data:", err);
      }
    })();

    return () => socket.emit("leaveGroup", selectedGroup._id || selectedGroup.id);
  }, [socket, selectedGroup]);

  const loadGroups = async () => {
    try {
      console.log("🔄 [loadGroups] Starting to load groups...");
      const url = `${API_BASE}/api/community/groups`;
      console.log("📍 [loadGroups] Fetching from URL:", url);
      
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include"
      });
      
      console.log("📥 [loadGroups] Response received. Status:", res.status, "OK?", res.ok);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ [loadGroups] API Error. Status:", res.status, "Body:", errorText);
        alert(`Failed to load groups: ${res.status} - ${errorText.substring(0, 100)}`);
        setGroups([]);
        return;
      }
      
      const data = await res.json();
      console.log("📦 [loadGroups] Raw data from API:", data);
      console.log("📦 [loadGroups] Data type:", typeof data, "Is array?", Array.isArray(data));
      
      // Handle different response formats
      let groupsArray = [];
      
      if (Array.isArray(data)) {
        console.log("✅ [loadGroups] Data is array with", data.length, "items");
        groupsArray = data;
      } else if (data && data.groups && Array.isArray(data.groups)) {
        console.log("✅ [loadGroups] Data.groups is array with", data.groups.length, "items");
        groupsArray = data.groups;
      } else if (data && data.ok && data.data && Array.isArray(data.data)) {
        console.log("✅ [loadGroups] Data.data is array with", data.data.length, "items");
        groupsArray = data.data;
      } else {
        console.warn("⚠️ [loadGroups] Unexpected data format. Keys:", Object.keys(data || {}));
        groupsArray = [];
      }
      
      console.log(`✅ [loadGroups] Final result: ${groupsArray.length} groups loaded`);
      console.table(groupsArray);
      setGroups(groupsArray);
      
      if (groupsArray.length === 0) {
        console.warn("⚠️ [loadGroups] No groups loaded. Array is empty.");
      }
    } catch (err) {
      console.error("❌ [loadGroups] Exception caught:", err.message, err);
      alert(`Error: ${err.message}`);
      setGroups([]);
    }
  };

  const loadAllUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        credentials: "include"
      });
      const data = await res.json();
      setAllUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading users:", err);
      setAllUsers([]);
    }
  };

  const createGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/community/group`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: groupName,
          description: groupDesc,
          createdBy: adminId,
          isPrivate: !!groupIsPrivate
        })
      });
      const newGroup = await res.json();
      setGroups(p => [...p, newGroup]);
      setGroupName("");
      setGroupDesc("");
      setGroupIsPrivate(false);
      setShowCreateModal(false);
      setSelectedGroup(newGroup);
      if (newGroup.isPrivate && newGroup.inviteCode) {
        alert(`Private group created. Invite code: ${newGroup.inviteCode}`);
      } else {
        alert("Group created successfully");
      }
    } catch (err) {
      console.error("Error creating group:", err);
      alert("Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  const deleteGroup = async (groupId) => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/community/group/${groupId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: adminId })
      });
      if (res.ok) {
        setGroups(p => p.filter(g => g._id !== groupId));
        setSelectedGroup(null);
        alert("Group deleted successfully");
      }
    } catch (err) {
      console.error("Error deleting group:", err);
      alert("Failed to delete group");
    }
  };

  const editGroup = async () => {
    if (!selectedGroup) return;
    try {
      const res = await fetch(`${API_BASE}/api/community/group/${selectedGroup._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: editGroupName, description: editGroupDesc })
      });
      if (res.ok) {
        const updated = await res.json();
        setGroups(prev => prev.map(g => g._id === selectedGroup._id ? updated : g));
        setSelectedGroup(updated);
        setEditingGroupId(null);
        alert("Group updated successfully");
      }
    } catch (err) {
      console.error("Error updating group:", err);
      alert("Failed to update group");
    }
  };

  const clearGroupMessages = async () => {
    if (!selectedGroup) return;
    if (!window.confirm("Clear all messages in this group?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/community/group/${selectedGroup._id}/messages`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: adminId })
      });
      if (res.ok) {
        setMessages([]);
        alert("All messages cleared");
      }
    } catch (err) {
      console.error("Error clearing messages:", err);
      alert("Failed to clear messages");
    }
  };

  const deleteMessage = async (msgId) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/community/message/${msgId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: adminId })
      });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m._id !== msgId));
        alert("Message deleted successfully");
      }
    } catch (err) {
      console.error("Error deleting message:", err);
      alert("Failed to delete message");
    }
  };

  const startEditMessage = (msgId, currentText) => {
    setEditingMessageId(msgId);
    setEditingMessageText(currentText);
  };

  const editMessage = async (msgId) => {
    if (!editingMessageText.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/community/message/${msgId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: editingMessageText })
      });
      if (res.ok) {
        setEditingMessageId(null);
        setEditingMessageText("");
        setMessages(prev => prev.map(m => m._id === msgId ? { ...m, message: editingMessageText } : m));
        alert("Message updated successfully");
      } else {
        alert("Failed to update message");
      }
    } catch (err) {
      console.error("Error editing message:", err);
      alert("Error updating message");
    }
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditingMessageText("");
  };

  const removeMember = async (memberUserId) => {
    if (!selectedGroup) return;
    if (!window.confirm("Remove this member from the group?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/community/group/${selectedGroup._id}/member/remove`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: memberUserId })
      });
      if (res.ok) {
        setMembers(prev => prev.filter(m => m.userId !== memberUserId));
        alert("Member removed successfully");
      }
    } catch (err) {
      console.error("Error removing member:", err);
      alert("Failed to remove member");
    }
  };

  const addMember = async (userIdToAdd) => {
    if (!selectedGroup) return;
    try {
      const user = allUsers.find(u => u.userId === userIdToAdd);
      const nickname = user?.communityNickname || user?.firstName || "Anonymous";
      
      const res = await fetch(`${API_BASE}/api/community/group/${selectedGroup._id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: userIdToAdd, nickname })
      });
      
      if (res.ok) {
        const newMember = await res.json();
        setMembers(prev => [...prev, newMember]);
        setShowAddMemberModal(false);
        alert("Member added successfully");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to add member");
      }
    } catch (err) {
      console.error("Error adding member:", err);
      alert("Error adding member");
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedGroup || !socket) return;

    try {
      setLoading(true);
      
      // Send via socket for real-time update and persistence
      socket.emit("sendGroupMessage", { 
        groupId: selectedGroup._id, 
        senderId: adminId, 
        senderNickname: "Admin",
        message: messageInput,
        isAdmin: true,
      });
      
      setMessageInput("");
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 150px)" }}>
      <h1>Community Management</h1>
      
      {/* Debug Section */}
      <div style={{ background: "#fee2e2", padding: "10px 15px", borderRadius: "6px", marginBottom: "15px", fontSize: "12px", color: "#991b1b" }}>
        <strong>Status:</strong> Groups loaded: {groups.length} | Socket connected: {socket ? "Yes" : "No"}
        <button 
          onClick={() => { console.log("Manual refresh triggered"); loadGroups(); }}
          style={{ marginLeft: "10px", padding: "4px 8px", background: "#ef4444", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}
        >
          🔍 Debug Reload
        </button>
      </div>

      {/* Statistics Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "20px" }}>
        <div style={{ background: "#dbeafe", padding: "15px", borderRadius: "8px", border: "1px solid #93c5fd" }}>
          <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#1e40af", fontWeight: "600" }}>TOTAL GROUPS</p>
          <p style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: "#1e40af" }}>{groups.length}</p>
        </div>
        <div style={{ background: "#dcfce7", padding: "15px", borderRadius: "8px", border: "1px solid #86efac" }}>
          <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#166534", fontWeight: "600" }}>TOTAL MEMBERS</p>
          <p style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: "#166534" }}>
            {groups.reduce((sum, g) => sum + (g.members?.length || 0), 0)}
          </p>
        </div>
        <div style={{ background: "#fef3c7", padding: "15px", borderRadius: "8px", border: "1px solid #fcd34d" }}>
          <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#92400e", fontWeight: "600" }}>TOTAL MESSAGES</p>
          <p style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: "#92400e" }}>{messages.length}</p>
        </div>
        <div style={{ background: "#f3e8ff", padding: "15px", borderRadius: "8px", border: "1px solid #e9d5ff" }}>
          <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#6b21a8", fontWeight: "600" }}>ACTIVE GROUPS</p>
          <p style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: "#6b21a8" }}>
            {groups.filter(g => g.isActive).length}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={() => setActiveTab("groups")}
          style={{
            padding: "10px 20px",
            background: activeTab === "groups" ? "#667eea" : "#e5e7eb",
            color: activeTab === "groups" ? "white" : "#333",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          Groups ({groups.length})
        </button>
        {selectedGroup && (
          <>
            <button
              onClick={() => setActiveTab("messages")}
              style={{
                padding: "10px 20px",
                background: activeTab === "messages" ? "#667eea" : "#e5e7eb",
                color: activeTab === "messages" ? "white" : "#333",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              Messages
            </button>
            <button
              onClick={() => setActiveTab("members")}
              style={{
                padding: "10px 20px",
                background: activeTab === "members" ? "#667eea" : "#e5e7eb",
                color: activeTab === "members" ? "white" : "#333",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              Members ({members.length})
            </button>
          </>
        )}
      </div>

      {activeTab === "groups" && (
        <div className="admin-card" style={{ flex: 1, overflow: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2>Community Groups ({groups.length})</h2>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={loadGroups}
                style={{
                  padding: "10px 16px",
                  background: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "12px"
                }}
              >
                🔄 Refresh
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  padding: "10px 20px",
                  background: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600"
                }}
              >
                ➕ Create Group
              </button>
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f3f4f6", borderBottom: "2px solid #e5e7eb" }}>
                <th style={{ padding: "12px 8px", textAlign: "left", fontWeight: "600" }}>Group Name</th>
                <th style={{ padding: "12px 8px", textAlign: "left", fontWeight: "600" }}>Description</th>
                <th style={{ padding: "12px 8px", textAlign: "left", fontWeight: "600" }}>Members</th>
                <th style={{ padding: "12px 8px", textAlign: "left", fontWeight: "600" }}>Created By</th>
                <th style={{ padding: "12px 8px", textAlign: "left", fontWeight: "600" }}>Created Date</th>
                <th style={{ padding: "12px 8px", textAlign: "left", fontWeight: "600" }}>Status</th>
                <th style={{ padding: "12px 8px", textAlign: "left", fontWeight: "600" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {groups.map(group => (
                <tr key={group._id} style={{ borderTop: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "12px 8px", fontWeight: "600", color: "#333" }}>{group.name}</td>
                  <td style={{ padding: "12px 8px", color: "#666", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={group.description || "-"}>{group.description || "-"}</td>
                  <td style={{ padding: "12px 8px", color: "#666", fontWeight: "500" }}>
                    <span style={{ background: "#dbeafe", color: "#1e40af", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "600" }}>
                      {group.members?.length || group.memberCount || 0}/{group.maxMembers || 50}
                    </span>
                  </td>
                  <td style={{ padding: "12px 8px", color: "#666" }}>{group.createdBy}</td>
                  <td style={{ padding: "12px 8px", color: "#666", fontSize: "12px" }}>
                    {new Date(group.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    <span style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "600",
                      background: group.isActive ? "#dcfce7" : "#fee2e2",
                      color: group.isActive ? "#166534" : "#991b1b"
                    }}>
                      {group.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    <button
                      onClick={() => {
                        console.log("Setting selected group:", group);
                        setSelectedGroup(group);
                        setActiveTab("messages");
                      }}
                      style={{
                        marginRight: "8px",
                        padding: "6px 12px",
                        background: "#3b82f6",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px"
                      }}
                    >
                      View
                    </button>
                    <button
                      onClick={() => deleteGroup(group._id)}
                      style={{
                        padding: "6px 12px",
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px"
                      }}
                    >
                      Delete
                    </button>
                    {group.isPrivate && group.inviteCode && (
                      <button
                        onClick={() => {
                          try {
                            navigator.clipboard.writeText(group.inviteCode);
                            alert('Invite code copied to clipboard');
                          } catch (e) {
                            prompt('Invite code:', group.inviteCode);
                          }
                        }}
                        title="Copy invite code"
                        style={{
                          marginLeft: 8,
                          padding: "6px 10px",
                          background: "#a78bfa",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px"
                        }}
                      >
                        🔒 Invite
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {groups.length === 0 && (
            <p style={{ textAlign: "center", color: "#999", padding: "40px" }}>No groups yet. Create one to get started!</p>
          )}
        </div>
      )}

      {activeTab === "messages" && selectedGroup && (
        <div className="admin-card" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <h2 style={{ margin: 0 }}>{selectedGroup.name} - Messages</h2>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => {
                  setEditGroupName(selectedGroup.name);
                  setEditGroupDesc(selectedGroup.description);
                  setEditingGroupId(selectedGroup._id);
                }}
                style={{
                  padding: "8px 16px",
                  background: "#f59e0b",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "600"
                }}
              >
                ✏️ Edit Group
              </button>
              <button
                onClick={clearGroupMessages}
                style={{
                  padding: "8px 16px",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "600"
                }}
              >
                🗑️ Clear All Messages
              </button>
            </div>
          </div>

          {/* Edit Group Modal */}
          {editingGroupId === selectedGroup._id && (
            <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: "6px", padding: "15px", marginBottom: "15px" }}>
              <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
                <input
                  type="text"
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
                  placeholder="Group name"
                  style={{ padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                />
                <input
                  type="text"
                  value={editGroupDesc}
                  onChange={(e) => setEditGroupDesc(e.target.value)}
                  placeholder="Description"
                  style={{ padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                />
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={editGroup}
                    style={{
                      padding: "8px 16px",
                      background: "#10b981",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "600"
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingGroupId(null)}
                    style={{
                      padding: "8px 16px",
                      background: "#999",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "600"
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div style={{ overflow: "auto", marginBottom: "20px", padding: "15px", background: "#f9fafb", borderRadius: "6px", maxHeight: messagesMaxHeight }}>
            {messages.length === 0 ? (
              <p style={{ textAlign: "center", color: "#999" }}>No messages yet</p>
            ) : (
              messages.map(msg => (
                <div key={msg._id} style={{ marginBottom: "12px", padding: "10px", background: "white", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
                  {editingMessageId === msg._id ? (
                    <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
                      <input
                        type="text"
                        value={editingMessageText}
                        onChange={(e) => setEditingMessageText(e.target.value)}
                        style={{
                          padding: "8px",
                          border: "1px solid #667eea",
                          borderRadius: "4px",
                          fontSize: "14px",
                          width: "100%"
                        }}
                      />
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => editMessage(msg._id)}
                          style={{
                            padding: "6px 12px",
                            background: "#10b981",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600"
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          style={{
                            padding: "6px 12px",
                            background: "#999",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px"
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: "0 0 4px 0", fontWeight: "600", color: "#667eea" }}>
                                {msg.senderNickname || "Anonymous"}
                                {msg.isAdmin && (
                                  <span style={{ marginLeft: 8, fontSize: 12, padding: '2px 6px', background: '#fef3c7', borderRadius: 6, color: '#92400e', fontWeight: 700 }}>
                                    Official
                                  </span>
                                )}
                          </p>
                          <p style={{ margin: "0 0 6px 0", color: "#333", wordWrap: "break-word" }}>{msg.message}</p>
                          <p style={{ margin: "0", fontSize: "11px", color: "#999" }}>
                            {new Date(msg.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div style={{ display: "flex", gap: "6px", marginLeft: "10px" }}>
                          <button
                            onClick={() => startEditMessage(msg._id, msg.message)}
                            style={{
                              padding: "4px 8px",
                              background: "#f59e0b",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "12px"
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteMessage(msg._id)}
                            style={{
                              padding: "4px 8px",
                              background: "#ef4444",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "12px"
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          <form onSubmit={sendMessage} style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              ref={inputRef}
              placeholder="Type message..."
              style={{
                flex: 1,
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "14px"
              }}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !messageInput.trim()}
              style={{
                padding: "10px 20px",
                background: "#667eea",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600",
                opacity: loading || !messageInput.trim() ? 0.5 : 1
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}

      {activeTab === "members" && selectedGroup && (
        <div className="admin-card" style={{ flex: 1, overflow: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h2 style={{ margin: "0 0 4px 0" }}>Group Members</h2>
              <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>Total: {members.length} / {selectedGroup.maxMembers || 50}</p>
            </div>
            <button
              onClick={() => setShowAddMemberModal(true)}
              style={{
                padding: "10px 20px",
                background: "#667eea",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              ➕ Add Member
            </button>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f3f4f6", borderBottom: "2px solid #e5e7eb" }}>
                <th style={{ padding: "12px 8px", textAlign: "left", fontWeight: "600" }}>#</th>
                <th style={{ padding: "12px 8px", textAlign: "left", fontWeight: "600" }}>Nickname</th>
                <th style={{ padding: "12px 8px", textAlign: "left", fontWeight: "600" }}>User ID</th>
                <th style={{ padding: "12px 8px", textAlign: "left", fontWeight: "600" }}>Joined Date</th>
                <th style={{ padding: "12px 8px", textAlign: "left", fontWeight: "600" }}>Days in Group</th>
                <th style={{ padding: "12px 8px", textAlign: "left", fontWeight: "600" }}>Role</th>
                <th style={{ padding: "12px 8px", textAlign: "left", fontWeight: "600" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, idx) => {
                const joinedDate = new Date(member.joinedAt);
                const daysInGroup = Math.floor((Date.now() - joinedDate) / (1000 * 60 * 60 * 24));
                return (
                <tr key={member.userId} style={{ borderTop: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "12px 8px", fontSize: "12px", color: "#999", fontWeight: "600" }}>{idx + 1}</td>
                  <td style={{ padding: "12px 8px", fontWeight: "600", color: "#333" }}>{member.nickname}</td>
                  <td style={{ padding: "12px 8px", color: "#666", fontSize: "12px" }}>{member.userId}</td>
                  <td style={{ padding: "12px 8px", color: "#666", fontSize: "12px" }}>
                    {joinedDate.toLocaleDateString()}
                  </td>
                  <td style={{ padding: "12px 8px", color: "#666", fontSize: "12px", fontWeight: "500" }}>
                    <span style={{ background: "#f0fdf4", color: "#166534", padding: "2px 6px", borderRadius: "3px", fontSize: "11px", fontWeight: "600" }}>
                      {daysInGroup} {daysInGroup === 1 ? "day" : "days"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    {selectedGroup.adminId === member.userId ? (
                      <span style={{
                        padding: "4px 8px",
                        background: "#667eea",
                        color: "white",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "600"
                      }}>
                        👑 Admin
                      </span>
                    ) : (
                      <span style={{
                        padding: "4px 8px",
                        background: "#e5e7eb",
                        color: "#333",
                        borderRadius: "4px",
                        fontSize: "12px"
                      }}>
                        Member
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    {selectedGroup.adminId !== member.userId && (
                      <button
                        onClick={() => removeMember(member.userId)}
                        style={{
                          padding: "6px 12px",
                          background: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px"
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }} onClick={() => setShowCreateModal(false)}>
          <div style={{
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            maxWidth: "500px",
            width: "90%",
            boxShadow: "0 20px 25px rgba(0,0,0,0.15)"
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: "16px", fontSize: "20px" }}>Create New Group</h3>
            <form onSubmit={createGroup}>
              <input
                type="text"
                placeholder="Group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  marginBottom: "12px",
                  fontSize: "14px",
                  boxSizing: "border-box"
                }}
              />
              <textarea
                placeholder="Group description (optional)"
                value={groupDesc}
                onChange={(e) => setGroupDesc(e.target.value)}
                rows="3"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  marginBottom: "16px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  fontFamily: "inherit"
                }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <input type="checkbox" checked={groupIsPrivate} onChange={(e) => setGroupIsPrivate(e.target.checked)} />
                <span style={{ fontSize: 13 }}>Private group (requires invite code to join)</span>
              </label>
              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{
                  padding: "10px 20px",
                  background: "#e5e7eb",
                  color: "#333",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600"
                }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} style={{
                  padding: "10px 20px",
                  background: "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  opacity: loading ? 0.5 : 1
                }}>
                  {loading ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }} onClick={() => setShowAddMemberModal(false)}>
          <div style={{
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            maxWidth: "500px",
            width: "90%",
            maxHeight: "80vh",
            overflow: "auto",
            boxShadow: "0 20px 25px rgba(0,0,0,0.15)"
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: "16px", fontSize: "20px" }}>Add Member to Group</h3>
            <div style={{ maxHeight: "400px", overflow: "auto" }}>
              {allUsers
                .filter(u => !members.some(m => m.userId === u.userId))
                .map(user => (
                  <div key={user._id} style={{
                    padding: "12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    marginBottom: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <div>
                      <p style={{ margin: "0", fontWeight: "600", color: "#333" }}>
                        {user.communityNickname || `${user.firstName} ${user.lastName}`.trim()}
                      </p>
                      <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#666" }}>{user.userId}</p>
                    </div>
                    <button
                      onClick={() => addMember(user.userId)}
                      style={{
                        padding: "6px 16px",
                        background: "#667eea",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "12px"
                      }}
                    >
                      Add
                    </button>
                  </div>
                ))}
            </div>
            <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setShowAddMemberModal(false)} style={{
                padding: "10px 20px",
                background: "#e5e7eb",
                color: "#333",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600"
              }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
