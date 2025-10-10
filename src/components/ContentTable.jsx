import React from "react";

const ContentTable = ({ contentList, onEdit, onDelete }) => {
  return (
    <table
      border="1"
      cellPadding="10"
      style={{ width: "100%", borderCollapse: "collapse" }}
    >
      <thead>
        <tr>
          <th>Title</th>
          <th>Description</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {contentList.map((item) => (
          <tr key={item._id}>
            <td>{item.title}</td>
            <td>{item.description}</td>
            <td>
              <button onClick={() => onEdit(item)}>Edit</button>
              <button onClick={() => onDelete(item._id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ContentTable;
