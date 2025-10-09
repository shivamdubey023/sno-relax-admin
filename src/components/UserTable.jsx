import React from "react";

const UserTable = ({ users, onBan, onDelete }) => {
  return (
    <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user._id}>
            <td>{user._id}</td>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.banned ? "Banned" : "Active"}</td>
            <td>
              <button onClick={() => onBan(user._id, !user.banned)}>
                {user.banned ? "Unban" : "Ban"}
              </button>
              <button onClick={() => onDelete(user._id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UserTable;
