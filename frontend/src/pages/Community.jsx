import React, { useState } from "react";
import '../css/Community.css';
import ProfileIcon from '../assets/profile.jpg';

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [currentPostId, setCurrentPostId] = useState(null); // 댓글 모달용
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  // 글 작성 / 수정
  const handleSubmitPost = () => {
    if (!title.trim() || !content.trim()) return;

    if (editingPost) {
      setPosts(posts.map(p =>
        p.id === editingPost.id ? { ...p, title, content } : p
      ));
    } else {
      const newPost = {
        id: Date.now(),
        title,
        content,
        nickname: "anonymous",
        date: formatDate(new Date()),
        comments: [],
      };
      setPosts([newPost, ...posts]);
    }

    setTitle("");
    setContent("");
    setEditingPost(null);
    setIsPostModalOpen(false);
  };

  // 글 삭제
  const handleDeletePost = (id) => {
    setPosts(posts.filter(post => post.id !== id));
  };

  // 댓글 추가
  const handleAddComment = (postId, commentText) => {
    if (!commentText.trim()) return;
    setPosts(posts.map(post =>
      post.id === postId
        ? {
            ...post,
            comments: [
              ...post.comments,
              { id: Date.now(), text: commentText, nickname: "anonymous", date: formatDate(new Date()) }
            ]
          }
        : post
    ));
  };

  // 댓글 모달 열기
  const openCommentModal = (postId) => {
    setCurrentPostId(postId);
    setIsCommentModalOpen(true);
  };

  const currentPost = posts.find(p => p.id === currentPostId);

  return (
    <div className="community-page">
     <div className="welcome-box">
       <h1 className="welcome-text">Welcome to Community</h1>
      <p>언제든 위로받고 싶을 땐 여기로 찾아오세요.</p>
     </div>
      {/* 글쓰기 버튼 */}
      <div className="post-btn" onClick={() => setIsPostModalOpen(true)}>+</div>

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
                <button onClick={() => openCommentModal(post.id)}>댓글 ({post.comments.length})</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 글 작성 / 수정 모달 */}
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
            <CommentInput postId={currentPost.id} onAddComment={handleAddComment} />
            <div className="modal-buttons">
              <button onClick={() => setIsCommentModalOpen(false)}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 댓글 입력 컴포넌트
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
