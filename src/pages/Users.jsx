import React, { useEffect, useState } from "react";
import { getUsers, updateUser, deleteUser } from "../services/api";
import UserTable from "../components/UserTable";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getUsers();
      setUsers(res.data || []); // fallback if no data
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please check your server connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async (id, status) => {
    try {
      await updateUser(id, { banned: status });
      fetchUsers();
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Failed to update user.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user.");
    }
  };

  if (loading) return <p style={{ padding: "20px" }}>Loading users...</p>;
  if (error) return <p style={{ color: "red", padding: "20px" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Users Management</h1>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <UserTable users={users} onBan={handleBan} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default Users;
