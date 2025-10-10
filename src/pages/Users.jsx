import React, { useEffect, useState } from "react";
import { getUsers, updateUser, deleteUser } from "../services/api";
import UserTable from "../components/UserTable";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
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
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Users Management</h1>
      <UserTable users={users} onBan={handleBan} onDelete={handleDelete} />
    </div>
  );
};

export default Users;
