import React from "react";

const UserTable = ({ users, onBan, onDelete }) => {
  return (
    <table
      border="1"
      cellPadding="10"
      style={{
        width: "100%",
        borderCollapse: "collapse",
        textAlign: "left",
        backgroundColor: "#fff",
      }}
    >
      <thead style={{ backgroundColor: "#f3f3f3" }}>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>City</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.length > 0 ? (
          users.map((user) => (
            <tr key={user._id}>
              <td>{user.userId || user._id}</td>
              <td>{`${user.firstName || ""} ${user.lastName || ""}`}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>{user.city}</td>
              <td style={{ color: user.banned ? "red" : "green" }}>
                {user.banned ? "Banned" : "Active"}
              </td>
              <td>
                <button
                  onClick={() => onBan(user._id, !user.banned)}
                  style={{
                    backgroundColor: user.banned ? "#4caf50" : "#f44336",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    marginRight: "5px",
                    cursor: "pointer",
                  }}
                >
                  {user.banned ? "Unban" : "Ban"}
                </button>
                <button
                  onClick={() => onDelete(user._id)}
                  style={{
                    backgroundColor: "#555",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="7" style={{ textAlign: "center", padding: "10px" }}>
              No users found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default UserTable;
