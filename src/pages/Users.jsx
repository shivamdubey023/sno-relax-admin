import React, { useEffect, useState } from "react";
import { getUsers, updateUser, deleteUser } from "../services/api";
import UserTable from "../components/UserTable";

const Users = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await getUsers();
    setUsers(res.data);
  };

  const handleBan = async (id, status) => {
    await updateUser(id, { banned: status });
    fetchUsers();
  };

  const handleDelete = async (id) => {
    await deleteUser(id);
    fetchUsers();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Users Management</h1>
      <UserTable users={users} onBan={handleBan} onDelete={handleDelete} />
    </div>
  );
};

export default Users;
