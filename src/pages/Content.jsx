import React, { useEffect, useState } from "react";
import {
  getContent,
  createContent,
  updateContent,
  deleteContent,
} from "../services/api";

const Content = () => {
  const [contentList, setContentList] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await getContent();
      setContentList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = async () => {
    if (!title || !description) return;
    await createContent({ title, description });
    setTitle("");
    setDescription("");
    fetchContent();
  };

  const handleEdit = (content) => {
    setEditingId(content._id);
    setTitle(content.title);
    setDescription(content.description);
  };

  const handleUpdate = async () => {
    await updateContent(editingId, { title, description });
    setEditingId(null);
    setTitle("");
    setDescription("");
    fetchContent();
  };

  const handleDelete = async (id) => {
    await deleteContent(id);
    fetchContent();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Content Management</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        {editingId ? (
          <button onClick={handleUpdate}>Update</button>
        ) : (
          <button onClick={handleAdd}>Add</button>
        )}
      </div>

      <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
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
                <button onClick={() => handleEdit(item)}>Edit</button>
                <button onClick={() => handleDelete(item._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Content;
