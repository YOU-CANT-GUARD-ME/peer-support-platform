import React, { useState, useEffect } from "react";
import "../css/Community.css";
import ProfileIcon from "../assets/profile.jpg";
import { motion } from "framer-motion";

// Local API for development — set to your backend URL
export const API_BASE_URL = "http://localhost:5000";

// Helper: parse JWT payload to get current user id (works with standard JWT)
function parseJwt(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return decoded;
  } catch (err) {
    return null;
  }
}

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [currentPostId, setCurrentPostId] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Read token + userId from localStorage (SignIn should set token)
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const tokenPayload = token ? parseJwt(token) : null;
  // The login token in your auth.js signs { id: user._id, email: ... } — adjust 'id' key if necessary
  const currentUserId = tokenPayload ? (tokenPayload.id || tokenPayload._id || tokenPayload.userId) : null;

  const formatDate = (date) => new Date(date).toLocaleDateString("ko-KR");

  // Load posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/posts`);
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error("Failed to load posts:", err);
      }
    };
    fetchPosts();
  }, []);

  // Create post
  const handleSubmitPost = async () => {
    if (!title.trim() || !content.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      const newPost = await res.json();
      setPosts([newPost, ...posts]);
      setTitle("");
      setContent("");
      setIsPostModalOpen(false);
    } catch (err) {
      console.error("Failed to create post:", err);
    }
  };

  // Delete post
  const handleDeletePost = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/posts/${id}`, { method: "DELETE" });
      setPosts(posts.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  // Add comment
  const handleAddComment = async (postId, commentText) => {
    if (!commentText.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "anonymous", content: commentText }),
      });

      const updatedPost = await res.json();
      setPosts(posts.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  // Me Too — requires token (authenticated user)
  const handleMeToo = async (postId) => {
    if (!token) {
      alert("로그인이 필요합니다. Please sign in to Me Too.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/me-too`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}), // server reads userId from token
      });

      const payload = await res.json();

      if (!res.ok) {
        // server returns 400 for already clicked
        alert(payload.message || "Error");
        return;
      }

      const updated = payload;
      setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
    } catch (err) {
      console.error("Me Too error:", err);
    }
  };

  const openCommentModal = (postId) => {
    setCurrentPostId(postId);
    setIsCommentModalOpen(true);
  };

  const currentPost = posts.find((p) => p._id === currentPostId);

  return (
    <div className="community-page">
      <div className="welcome-box">
        <motion.h1
          className="welcome-text"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          Welcome to Community
        </motion.h1>
      </div>

      <div className="post-btn" onClick={() => setIsPostModalOpen(true)}>+</div>

      {posts.length > 0 && (
        <div className="posts">
          {posts.map((post) => {
            const users = Array.isArray(post.meTooUsers)
              ? post.meTooUsers.map(u => (typeof u === "object" && u._id ? u._id : String(u)))
              : [];

            const hasMeToo = currentUserId ? users.includes(String(currentUserId)) : false;

            return (
              <div key={post._id} className="post">
                <div className="post-header">
                  <img src={ProfileIcon} alt="profile" className="profile-icon" />
                  <strong>anonymous</strong> - <span>{formatDate(post.createdAt)}</span>
                </div>
                <h2>{post.title}</h2>
                <p>{post.content}</p>
                <div className="post-actions">
                  <button disabled={hasMeToo} onClick={() => handleMeToo(post._id)}>
                    {hasMeToo ? "Already Me Too" : `Me Too (${post.meTooCount || 0})`}
                  </button>
                  <button onClick={() => handleDeletePost(post._id)}>삭제</button>
                  <button onClick={() => openCommentModal(post._id)}>
                    댓글 ({post.comments.length})
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post Modal */}
      {isPostModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsPostModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <input placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea placeholder="내용" value={content} onChange={(e) => setContent(e.target.value)} />
            <div className="modal-buttons">
              <button onClick={() => setIsPostModalOpen(false)}>취소</button>
              <button onClick={handleSubmitPost}>확인</button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {isCommentModalOpen && currentPost && (
        <div className="modal-backdrop" onClick={() => setIsCommentModalOpen(false)}>
          <div className="modal coment-modal" onClick={(e) => e.stopPropagation()}>
            <h3>댓글 - {currentPost.title}</h3>
            <div className="comments-list">
              {currentPost.comments.map((c, idx) => (
                <div key={idx} className="comment">
                  <strong>{c.username}</strong>: {c.content}
                </div>
              ))}
            </div>
            <CommentInput postId={currentPostId} onAddComment={handleAddComment} />
            <div className="modal-buttons">
              <button onClick={() => setIsCommentModalOpen(false)}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Comment Input Component
function CommentInput({ postId, onAddComment }) {
  const [commentText, setCommentText] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    onAddComment(postId, commentText);
    setCommentText("");
  };
  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <input type="text" placeholder="댓글 작성..." value={commentText} onChange={(e) => setCommentText(e.target.value)} />
      <button type="submit">등록</button>
    </form>
  );
}
