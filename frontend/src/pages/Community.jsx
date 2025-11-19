import React, { useState, useEffect } from "react";
import axios from "axios";
import '../css/Community.css';
import PostIcon from '../assets/post-icon.png';
import ProfileIcon from '../assets/profile.jpg';

const API_BASE_URL = "http://localhost:5000/api"; // make sure backend is running

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [currentPostId, setCurrentPostId] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  // --- Fetch posts from backend ---
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/posts`);
      const mapped = res.data.map(p => ({
        id: p._id,
        title: p.title,
        content: p.content,
        nickname: "anonymous",
        date: formatDate(p.createdAt),
        comments: p.comments.map(c => ({
          id: c._id,
          text: c.content,
          nickname: c.username,
          date: formatDate(c.createdAt),
        }))
      }));
      setPosts(mapped);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  };

  // --- Create or Edit Post ---
  const handleSubmitPost = async () => {
    if (!title.trim() || !content.trim()) return;

    try {
      if (editingPost) {
        await axios.patch(`${API_BASE_URL}/posts/${editingPost.id}`, {
          title,
          content
        });
      } else {
        await axios.post(`${API_BASE_URL}/posts`, { title, content });
      }

      setTitle("");
      setContent("");
      setEditingPost(null);
      setIsPostModalOpen(false);
      fetchPosts();
    } catch (err) {
      console.error("Failed to submit post:", err);
    }
  };

  // --- Delete Post ---
  const handleDeletePost = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/posts/${id}`);
      fetchPosts();
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  // --- Add Comment ---
  const handleAddComment = async (postId, commentText) => {
    if (!commentText.trim()) return;

    try {
      await axios.post(`${API_BASE_URL}/posts/${postId}/comments`, {
        username: "anonymous",
        content: commentText
      });
      fetchPosts();
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  const openCommentModal = (postId) => {
    setCurrentPostId(postId);
    setIsCommentModalOpen(true);
  };

  const currentPost = posts.find(p => p.id === currentPostId);

  return (
    <div className="community-page">
      
      {/* 글쓰기 버튼 */}
      <div className="post-btn" onClick={() => setIsPostModalOpen(true)}>
        <img src={PostIcon} alt="post icon" />
      </div>

      {/* 게시글 리스트 */}
      {posts.length > 0 && (
        <div className="posts">
          {posts.map(post => (
            <div key={post.id} className="post">
              <div className="post-header">
                <img src={ProfileIcon} alt="profile" className="profile-icon" />
                <strong>{post.nickname}</strong> - <span>{post.date}</span>
              </div>

              <h2>{post.title}</h2>
              <p>{post.content}</p>

              <div className="post-actions">
                <button onClick={() => {
                  setEditingPost(post);
                  setTitle(post.title);
                  setContent(post.content);
                  setIsPostModalOpen(true);
                }}>수정</button>

                <button onClick={() => handleDeletePost(post.id)}>삭제</button>

                <button onClick={() => openCommentModal(post.id)}>
                  댓글 ({post.comments.length})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 글 작성 모달 */}
      {isPostModalOpen && (
        <div className="modal-backdrop">
          <div className="modal">
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
              <button onClick={() => {
                setIsPostModalOpen(false);
                setEditingPost(null);
                setTitle("");
                setContent("");
              }}>취소</button>

              <button onClick={handleSubmitPost}>확인</button>
            </div>
          </div>
        </div>
      )}

      {/* 댓글 모달 */}
      {isCommentModalOpen && currentPost && (
        <div className="modal-backdrop">
          <div className="modal coment-modal">
            <h3>댓글 - {currentPost.title}</h3>

            <div className="comments-list">
              {currentPost.comments.map(c => (
                <div key={c.id} className="comment">
                  <strong>{c.nickname}</strong>: {c.text} <span>{c.date}</span>
                </div>
              ))}
            </div>

            <CommentInput
              postId={currentPost.id}
              onAddComment={handleAddComment}
            />

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
