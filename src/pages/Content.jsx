// src/pages/Content.js
import React, { useEffect, useState } from "react";
import {
  getContent,
  createContent,
  updateContent,
  deleteContent,
} from "../services/api"; // Make sure this points to your API file
import ContentTable from "../components/ContentTable";

const Content = () => {
  const [contentList, setContentList] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await getContent();
      setContentList(res.data || []);
    } catch (err) {
      console.error("Error fetching content:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!title.trim() || !description.trim()) return;
    try {
      await createContent({ title, description });
      resetForm();
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
    if (!editingId) return;
    try {
      await updateContent(editingId, { title, description });
      resetForm();
      fetchContent();
    } catch (err) {
      console.error("Error updating content:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this content?")) return;
    try {
      await deleteContent(id);
      fetchContent();
    } catch (err) {
      console.error("Error deleting content:", err);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Content Management</h1>

      {/* Form */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {editingId ? (
          <button onClick={handleUpdate}>Update</button>
        ) : (
          <button onClick={handleAdd}>Add</button>
        )}
        {editingId && <button onClick={resetForm}>Cancel</button>}
      </div>

      {/* Content Table */}
      {loading ? (
        <p>Loading content...</p>
      ) : (
        <ContentTable
          contentList={contentList}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default Content;
