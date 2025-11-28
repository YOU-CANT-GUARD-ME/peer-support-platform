import React, { useState, useEffect } from "react";
import '../css/Community.css';
import ProfileIcon from '../assets/profile.jpg';
import { motion } from "framer-motion";
import { API_BASE_URL } from "../api";

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [currentPostId, setCurrentPostId] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // 실제 로그인 후 userId 가져와야 함
  const currentUser = { _id: "650a1f9c8b3e2a1d2f4a9b1c" };

  const formatDate = (date) => new Date(date).toLocaleDateString("ko-KR");

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch(`${API_BASE_URL}/api/posts`);
      const data = await res.json();
      setPosts(data);
    };
    fetchPosts();
  }, []);

  const handleSubmitPost = async () => {
    if (!title.trim() || !content.trim()) return;
    const res = await fetch(`${API_BASE_URL}/api/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, userId: currentUser._id }),
    });
    const newPost = await res.json();
    setPosts([newPost, ...posts]);
    setTitle(""); setContent(""); setIsPostModalOpen(false);
  };

  const handleDeletePost = async (id) => {
    await fetch(`${API_BASE_URL}/api/posts/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser._id }),
    });
    setPosts(posts.filter(p => p._id !== id));
  };

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

  const handleMeToo = async (postId) => {
    const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/me-too`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser._id }),
    });
    const updated = await res.json();
    if (res.status === 400) { alert(updated.message); return; }
    setPosts(posts.map(p => p._id === updated._id ? updated : p));
  };

  const openCommentModal = (postId) => {
    setCurrentPostId(postId);
    setIsCommentModalOpen(true);
  };

  const currentPost = posts.find(p => p._id === currentPostId);

  return (
    <div className="community-page">
      <motion.h1 initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{duration:1}}>Welcome to Community</motion.h1>
      <div className="post-btn" onClick={() => setIsPostModalOpen(true)}>+</div>

      <div className="posts">
        {posts.map(post => {
          const isAuthor = post.author?.toString() === currentUser._id;
          const hasMeToo = post.meTooUsers?.map(u=>u.toString()).includes(currentUser._id);

          return (
            <div key={post._id} className="post">
              <div className="post-header">
                <img src={ProfileIcon} className="profile-icon" />
                <strong>anonymous</strong> - <span>{formatDate(post.createdAt)}</span>
              </div>
              <h2>{post.title}</h2>
              <p>{post.content}</p>

              <div className="post-actions">
                <button disabled={hasMeToo} onClick={()=>handleMeToo(post._id)}>
                  {hasMeToo ? "Already Me Too" : `Me Too (${post.meTooCount||0})`}
                </button>

                {isAuthor && <button onClick={()=>handleDeletePost(post._id)}>삭제</button>}

                <button onClick={()=>openCommentModal(post._id)}>
                  댓글 ({post.comments.length})
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {isPostModalOpen && (
        <div className="modal-backdrop" onClick={()=>setIsPostModalOpen(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <input placeholder="제목" value={title} onChange={e=>setTitle(e.target.value)} />
            <textarea placeholder="내용" value={content} onChange={e=>setContent(e.target.value)} />
            <div className="modal-buttons">
              <button onClick={()=>setIsPostModalOpen(false)}>취소</button>
              <button onClick={handleSubmitPost}>확인</button>
            </div>
          </div>
        </div>
      )}

      {isCommentModalOpen && currentPost && (
        <div className="modal-backdrop" onClick={()=>setIsCommentModalOpen(false)}>
          <div className="modal coment-modal" onClick={e=>e.stopPropagation()}>
            <h3>댓글 - {currentPost.title}</h3>
            <div className="comments-list">
              {currentPost.comments.map(c=>(
                <div key={c._id}><strong>{c.username}</strong>: {c.content}</div>
              ))}
            </div>
            <CommentInput postId={currentPostId} onAddComment={handleAddComment} />
            <div className="modal-buttons">
              <button onClick={()=>setIsCommentModalOpen(false)}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CommentInput({ postId, onAddComment }) {
  const [commentText, setCommentText] = useState("");
  const handleSubmit = (e) => { e.preventDefault(); onAddComment(postId, commentText); setCommentText(""); };
  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <input type="text" placeholder="댓글 작성..." value={commentText} onChange={e=>setCommentText(e.target.value)} />
      <button type="submit">등록</button>
    </form>
  );
}
