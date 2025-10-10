import React, { useEffect, useState } from "react";
import { getCommunityPosts, updateCommunityPost, deleteCommunityPost } from "../services/api";

const CommunityAdmin = () => {
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [content, setContent] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await getCommunityPosts();
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post._id);
    setContent(post.content);
  };

  const handleUpdate = async () => {
    await updateCommunityPost(editingPost, { content });
    setEditingPost(null);
    setContent("");
    fetchPosts();
  };

  const handleDelete = async (id) => {
    await deleteCommunityPost(id);
    fetchPosts();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Community Management</h1>

      {editingPost && (
        <div>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} />
          <button onClick={handleUpdate}>Update Post</button>
        </div>
      )}

      <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr>
            <th>User</th>
            <th>Content</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post._id}>
              <td>{post.userName || "Anonymous"}</td>
              <td>{post.content}</td>
              <td>{new Date(post.createdAt).toLocaleDateString()}</td>
              <td>
                <button onClick={() => handleEdit(post)}>Edit</button>
                <button onClick={() => handleDelete(post._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CommunityAdmin;
