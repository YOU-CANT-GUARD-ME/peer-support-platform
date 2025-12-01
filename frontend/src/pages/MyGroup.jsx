// 📌 src/pages/MyGroupPage.jsx

import React, { useState } from "react";
import "../css/MyGroup.css";
import ProfileIcon from "../assets/profile.jpg";
import { useNavigate } from "react-router-dom";

export default function MyGroup() {
  const navigate = useNavigate();

  const [nickname, setNickname] = useState("");
  const [tempNickname, setTempNickname] = useState("");
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(true);

  // 그룹 정보 (추후 DB에서 불러올 예정)
  const [groupInfo] = useState({
    name: "아프지말고햄보카자",
    category: "고민상담",
    members: 12,
    intro: "고민상담을 합니다",
  });

  // 멤버 목록
  const [members] = useState([
    { id: 1, name: "햄찌", profile: ProfileIcon },
    { id: 2, name: "초코송이", profile: ProfileIcon },
    { id: 3, name: "무지", profile: ProfileIcon },
    { id: 4, name: "시후", profile: ProfileIcon },
    { id: 5, name: "보라돌이", profile: ProfileIcon },
  ]);

  const handleSetNickname = () => {
    if (!tempNickname.trim()) return;
    setNickname(tempNickname.trim());
    setIsNicknameModalOpen(false);
  };

  return (
    <div className="group-page-container">
      {/* 닉네임 설정 모달 */}
      {isNicknameModalOpen && (
        <div className="modal-backdrop">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>그룹에 입장하려면 닉네임을 설정하세요</h3>
            <input
              placeholder="닉네임 입력"
              value={tempNickname}
              onChange={(e) => setTempNickname(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={handleSetNickname}>확인</button>
            </div>
          </div>
        </div>
      )}

      {/* 왼쪽 사이드바 */}
      <aside className="group-sidebar">
        <h2>{groupInfo.name}</h2>
        <p>카테고리: {groupInfo.category}</p>
        <p>멤버: {groupInfo.members}명</p>
        <p>내 닉네임: {nickname || "설정 필요"}</p>
        <p>{groupInfo.intro}</p>
        <button className="leave-btn">탈퇴</button>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="group-content">
        <h2>마이 그룹 페이지</h2>
        <p>이 그룹에서 활동을 시작해보세요!</p>

        <div className="mygroup-actions">
          <button
            className="goto-chat btn"
            disabled={!nickname}
            onClick={() => navigate("/my-group/chat")}
          >
            채팅방 가기
          </button>
{/* 
          <button
            className="goto-voice btn"
            disabled={!nickname}
            onClick={() => navigate("/my-group/voice")}
          >
            음성채팅방 가기
          </button> */}
        </div>

        <div className="mygroup-info-box">
          <h3>공지사항</h3>
          <p>그룹에 오신 것을 환영합니다. 규칙을 준수해 주세요!</p>
        </div>
      </main>

      {/* 🟦 오른쪽 멤버 사이드바 */}
      <aside className="member-sidebar">
        <h3>멤버 목록</h3>
        <div className="member-list">
          {members.map((m) => (
            <div key={m.id} className="member-item">
              <img src={m.profile} className="member-profile" />
              <span>{m.name}</span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
