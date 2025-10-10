import React, { useEffect, useState } from "react";
import {
  getContent,
  createContent,
  updateContent,
  deleteContent,
} from "../services/api";
import ContentTable from "../components/ContentTable";

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
      console.error("Error fetching content:", err);
    }
  };

  const handleAdd = async () => {
    if (!title || !description) return;
    try {
      await createContent({ title, description });
      setTitle("");
      setDescription("");
      fetchContent();
    } catch (err) {
      console.error("Error adding content:", err);
    }
  };

  const handleEdit = (content) => {
    setEditingId(content._id);
    setTitle(content.title);
    setDescription(content.description);
  };

  const handleUpdate = async () => {
    try {
      await updateContent(editingId, { title, description });
      setEditingId(null);
      setTitle("");
      setDescription("");
      fetchContent();
    } catch (err) {
      console.error("Error updating content:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteContent(id);
      fetchContent();
    } catch (err) {
      console.error("Error deleting content:", err);
    }
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

      <ContentTable
        contentList={contentList}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Content;
