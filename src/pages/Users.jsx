import React, { useEffect, useState, useCallback } from "react";
import { getUsers, updateUser, deleteUser, getProfileChanges } from "../services/api";
import UserTable from "../components/UserTable";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [profileChanges, setProfileChanges] = useState({}); // Map of userId -> [changes]
  const [loading, setLoading] = useState(true);
  const [duplicates, setDuplicates] = useState([]);
  const [showDuplicates, setShowDuplicates] = useState(false);

  const findDuplicates = useCallback((userList) => {
    const emailMap = {};
    const phoneMap = {};
    const dups = [];

    userList.forEach(user => {
      if (user.email) {
        if (emailMap[user.email]) {
          dups.push({ type: "email", value: user.email, users: [emailMap[user.email]._id, user._id] });
        } else {
          emailMap[user.email] = user;
        }
      }
      if (user.phone) {
        if (phoneMap[user.phone]) {
          dups.push({ type: "phone", value: user.phone, users: [phoneMap[user.phone]._id, user._id] });
        } else {
          phoneMap[user.phone] = user;
        }
      }
    });

    return dups;
  }, []);

  const fetchUsersAndChanges = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getUsers();
      setUsers(res.data);

      // Find duplicates
      const dups = findDuplicates(res.data);
      setDuplicates(dups);

      // Fetch profile changes for all users to highlight recent edits
      try {
        const changesRes = await getProfileChanges(null, 500);
        const changesMap = {};
        if (changesRes.changes && Array.isArray(changesRes.changes)) {
          changesRes.changes.forEach(change => {
            if (!changesMap[change.userId]) {
              changesMap[change.userId] = [];
            }
            changesMap[change.userId].push(change);
          });
        }
        setProfileChanges(changesMap);
      } catch (err) {
        console.warn('Failed to fetch profile changes:', err);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, [findDuplicates]);

  useEffect(() => {
    fetchUsersAndChanges();
  }, [fetchUsersAndChanges]);

  const handleBan = async (id, status) => {
    try {
      await updateUser(id, { banned: status });
      fetchUsersAndChanges();
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      fetchUsersAndChanges();
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1>Users Management</h1>
          <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#666" }}>Total: {users.length} users</p>
        </div>
        {duplicates.length > 0 && (
          <button
            onClick={() => setShowDuplicates(!showDuplicates)}
            style={{
              padding: "10px 20px",
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            ⚠️ {duplicates.length} Duplicate(s)
          </button>
        )}
      </div>

      {showDuplicates && duplicates.length > 0 && (
        <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "8px", padding: "15px", marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#991b1b" }}>Duplicate Data Found</h3>
          {duplicates.map((dup, idx) => (
            <div key={idx} style={{ margin: "8px 0", padding: "10px", background: "white", borderRadius: "4px" }}>
              <p style={{ margin: "0 0 6px 0", fontWeight: "600", color: "#333" }}>
                {dup.type === "email" ? "📧 Duplicate Email" : "📱 Duplicate Phone"}: {dup.value}
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>User IDs: {dup.users.join(", ")}</p>
            </div>
          ))}
        </div>
      )}

      <UserTable users={users} onBan={handleBan} onDelete={handleDelete} profileChanges={profileChanges} />
    </div>
  );
};

export default Users;
