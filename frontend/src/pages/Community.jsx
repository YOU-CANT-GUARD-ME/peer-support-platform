import React, { useState, useEffect } from "react";
import '../css/Community.css';
import ProfileIcon from '../assets/profile.jpg';
import { motion } from "framer-motion"
import { API_BASE_URL } from "../api";

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [currentPostId, setCurrentPostId] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("ko-KR");
  };

  // Load posts from backend
  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch(`${API_BASE_URL}/api/posts`);
      const data = await res.json();
      setPosts(data);
    };
    fetchPosts();
  }, []);

  // Create new post (backend)
  const handleSubmitPost = async () => {
    if (!title.trim() || !content.trim()) return;

    const res = await fetch(`${API_BASE_URL}/api/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    const newPost = await res.json();
    setPosts([newPost, ...posts]);

    setTitle("");
    setContent("");
    setEditingPost(null);
    setIsPostModalOpen(false);
  };

  // Delete post
  const handleDeletePost = async (id) => {
    await fetch(`${API_BASE_URL}/api/posts/${id}`, { method: "DELETE" });
    setPosts(posts.filter(p => p._id !== id));
  };

  // Add comment
  const handleAddComment = async (postId, commentText) => {
    if (!commentText.trim()) return;

    const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "anonymous", content: commentText }),
    });

    const updatedPost = await res.json();
    setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
  };

  const openCommentModal = (postId) => {
    setCurrentPostId(postId);
    setIsCommentModalOpen(true);
  };

  const currentPost = posts.find(p => p._id === currentPostId);

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
          {posts.map(post => (
            <div key={post._id} className="post">
              <div className="post-header">
                <img src={ProfileIcon} alt="profile" className="profile-icon" />
                <strong>anonymous</strong> - <span>{formatDate(post.createdAt)}</span>
              </div>
              <h2>{post.title}</h2>
              <p>{post.content}</p>

              <div className="post-actions">
                <button onClick={() => handleDeletePost(post._id)}>삭제</button>
                <button onClick={() => openCommentModal(post._id)}>
                  댓글 ({post.comments.length})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isPostModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsPostModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <input
              placeholder="제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              placeholder="내용을 입력하세요."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={() => setIsPostModalOpen(false)}>취소</button>
              <button onClick={handleSubmitPost}>확인</button>
            </div>
          </div>
        </div>
      )}

      {isCommentModalOpen && currentPost && (
        <div className="modal-backdrop" onClick={() => setIsCommentModalOpen(false)}>
          <div className="modal coment-modal" onClick={(e) => e.stopPropagation()}>
            <h3>댓글 - {currentPost.title}</h3>

            <div className="comments-list">
              {currentPost.comments.map(c => (
                <div key={c._id} className="comment">
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

function CommentInput({ postId, onAddComment }) {
  const [commentText, setCommentText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddComment(postId, commentText);
    setCommentText("");
  };

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <input
        type="text"
        placeholder="댓글 작성..."
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
      />
      <button type="submit">등록</button>
    </form>
  );
}
