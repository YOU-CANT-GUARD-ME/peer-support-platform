import React, { useState, useEffect } from "react";
import '../css/GroupDetail.css';
import ProfileIcon from '../assets/profile.jpg';

export default function GroupDetailPage() {
const [posts, setPosts] = useState([]);
const [isPostModalOpen, setIsPostModalOpen] = useState(false);
const [editingPost, setEditingPost] = useState(null);
const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
const [currentPostId, setCurrentPostId] = useState(null);
const [editingComment, setEditingComment] = useState(null);
const [title, setTitle] = useState("");
const [content, setContent] = useState("");

// 🟢 닉네임 관련
const [nickname, setNickname] = useState("");
const [tempNickname, setTempNickname] = useState("");
const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(true);

const formatDate = (date) => {
const d = new Date(date);
const year = d.getFullYear();
const month = String(d.getMonth() + 1).padStart(2, "0");
const day = String(d.getDate()).padStart(2, "0");
return `${year}.${month}.${day}`;
};

const handleSubmitPost = () => {
if (!title.trim() || !content.trim()) return;
if (editingPost) {
setPosts(posts.map(p => p.id === editingPost.id ? {...p, title, content} : p));
} else {
setPosts([{ id: Date.now(), title, content, nickname, date: formatDate(new Date()), comments: [] }, ...posts]);
}
setTitle("");
setContent("");
setEditingPost(null);
setIsPostModalOpen(false);
};

const handleDeletePost = (id) => setPosts(posts.filter(p => p.id !== id));

const openCommentModal = (postId) => {
setCurrentPostId(postId);
setIsCommentModalOpen(true);
};

const handleAddComment = (postId, commentText, editingComment = null) => {
if (!commentText.trim()) return;
setPosts(posts.map(post => {
if (post.id !== postId) return post;
if (editingComment) {
return { ...post, comments: post.comments.map(c => c.id === editingComment.id ? {...c, text: commentText} : c) };
} else {
return { ...post, comments: [...post.comments, { id: Date.now(), text: commentText, nickname, date: formatDate(new Date()) }] };
}
}));
};

const handleDeleteComment = (postId, commentId) => {
setPosts(posts.map(post => post.id === postId ? {...post, comments: post.comments.filter(c => c.id !== commentId)} : post));
};

const currentPost = posts.find(p => p.id === currentPostId);

// 🟢 닉네임 설정 모달 제출
const handleSetNickname = () => {
if (!tempNickname.trim()) return;
setNickname(tempNickname.trim());
setIsNicknameModalOpen(false);
};

return ( <div className="group-detail-page">
{/* 닉네임 모달 */}
{isNicknameModalOpen && ( <div className="modal-backdrop">
<div className="modal" onClick={(e) => e.stopPropagation()}> <h3>그룹에 입장하려면 닉네임을 설정하세요</h3>
<input placeholder="닉네임 입력" value={tempNickname} onChange={e => setTempNickname(e.target.value)} /> <div className="modal-buttons"> <button onClick={handleSetNickname}>확인</button> </div> </div> </div>
)}

  <aside className="group-sidebar">
    <h2>아프지말고햄보카자</h2>
    <p>카테고리: 고민상담</p>
    <p>멤버: 12명</p>
    <p>닉네임: {nickname || "설정 필요"}</p>
    <p>고민상담을 합니다</p>
    <button className="leave-btn">탈퇴</button>
  </aside>

  <main className="group-content">
    <button className="create-post-btn btn" onClick={() => setIsPostModalOpen(true)} disabled={!nickname}>+</button>
    {posts.map(post => (
      <div key={post.id} className="group-post">
        <div className="group-post-header">
          <img src={ProfileIcon} className="profile-icon" />
          <strong>{post.nickname}</strong> - <span>{post.date}</span>
        </div>
        <h3>{post.title}</h3>
        <p>{post.content}</p>
        <div className="group-post-actions">
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
  </main>

  {/* 글 작성/수정 모달 */}
  {isPostModalOpen && (
    <div className="modal-backdrop" onClick={() => setIsPostModalOpen(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <input placeholder="제목" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea placeholder="내용" value={content} onChange={e => setContent(e.target.value)} />
        <div className="modal-buttons">
          <button onClick={() => { setIsPostModalOpen(false); setEditingPost(null); setTitle(""); setContent(""); }}>취소</button>
          <button onClick={handleSubmitPost} disabled={!nickname}>확인</button>
        </div>
      </div>
    </div>
  )}

  {/* 댓글 모달 */}
  {isCommentModalOpen && currentPost && (
    <div className="modal-backdrop" onClick={() => setIsCommentModalOpen(false)}>
      <div className="modal comment-modal" onClick={(e) => e.stopPropagation()}>
        <h3>댓글 - {currentPost.title}</h3>
        <div className="comments-list">
          {currentPost.comments.map(c => (
            <div key={c.id} className="comment">
              <strong>{c.nickname}</strong>: {c.text} <span>{c.date}</span>
              <div className="comment-actions">
                <button onClick={() => setEditingComment(c)}>수정</button>
                <button onClick={() => handleDeleteComment(currentPost.id, c.id)}>삭제</button>
              </div>
            </div>
          ))}
        </div>
        <CommentInput
          postId={currentPost.id}
          onAddComment={handleAddComment}
          editingComment={editingComment}
          setEditingComment={setEditingComment}
          nickname={nickname}
        />
        <div className="modal-buttons">
          <button onClick={() => { setIsCommentModalOpen(false); setEditingComment(null); }}>닫기</button>
        </div>
      </div>
    </div>
  )}
</div>


);
}

function CommentInput({ postId, onAddComment, editingComment, setEditingComment, nickname }) {
const [commentText, setCommentText] = useState("");

useEffect(() => {
if (editingComment) setCommentText(editingComment.text);
}, [editingComment]);

const handleSubmit = (e) => {
e.preventDefault();
if (!nickname) return;
onAddComment(postId, commentText, editingComment);
setCommentText("");
setEditingComment(null);
};

return ( <form onSubmit={handleSubmit} className="comment-form">
<input
type="text"
placeholder="댓글 작성..."
value={commentText}
onChange={(e) => setCommentText(e.target.value)}
/> <button type="submit">{editingComment ? "수정" : "등록"}</button> </form>
);
}
