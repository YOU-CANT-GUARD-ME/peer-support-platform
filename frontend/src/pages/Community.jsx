import React, { useState } from "react";
import './Community.css';
import PostIcon from '../assets/post-icon.png'; // 글쓰기 이미지
import ProfileIcon from '../assets/profile.jpg'


export default function Community() {
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;

    const newPost = {
      id: Date.now(),
      title,
      content,
      nickname: "anonymous",
      date: formatDate(new Date()),
    };

    setPosts([newPost, ...posts]);
    setTitle("");
    setContent("");
    setIsModalOpen(false);
  };

  return (
    <div className="community-page">
      {/* 글쓰기 버튼 */}
      <div className="post-btn" onClick={() => setIsModalOpen(true)}>
        <img src={PostIcon} alt="post icon" />
      </div>

      {/* 포스트가 있을 때만 보여주기 */}
      {posts.length > 0 && (
        <div className="posts">
          {posts.map((post) => (
            <div key={post.id} className="post">
              <div className="post-header">
                <img src={ProfileIcon} alt="profile" className="profile-icon" />
                <strong>{post.nickname}</strong> - <span>{post.date}</span>
              </div>
              <h2>{post.title}</h2>
              <p>{post.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* 모달 */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <input
              placeholder="제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              placeholder="내용"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={() => setIsModalOpen(false)}>취소</button>
              <button onClick={handleSubmit}>확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
