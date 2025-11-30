import React, { useState } from "react";
import "../css/MyGroup.css";
import ProfileIcon from "../assets/profile.jpg";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function MyGroup() {
const navigate = useNavigate();

const [nickname, setNickname] = useState("");
const [tempNickname, setTempNickname] = useState("");
const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(true);

const [groupInfo, setGroupInfo] = useState({
id: "group123",
name: "아프지말고햄보카자",
category: "고민상담",
members: 12,
intro: "고민상담을 합니다",
});

const [members, setMembers] = useState([
{ id: 1, name: "햄찌", profile: ProfileIcon },
{ id: 2, name: "초코송이", profile: ProfileIcon },
]);

const handleSetNickname = async () => {
const nicknameTrimmed = tempNickname.trim();
if (!nicknameTrimmed) return;

try {
  // 브라우저 환경에서 바로 URL 사용
  const API_URL = process.env.VITE_APP_API_URL;

const res = await axios.post(
  `${API_URL}/api/groups/join`,
  { groupId: groupInfo.id, nickname: nicknameTrimmed },
  { withCredentials: true }
);

  // 닉네임 등록
  setNickname(nicknameTrimmed);

  // 서버에서 받은 멤버 정보로 업데이트
  if (res.data?.members) {
    setMembers(res.data.members);
    setGroupInfo(prev => ({ ...prev, members: res.data.members.length }));
  }

  setIsNicknameModalOpen(false);
} catch (err) {
  console.error("Failed to join group:", err);
  alert("그룹 참여에 실패했습니다. 다시 시도해주세요.");
}

};

return ( <div className="group-page-container">
{isNicknameModalOpen && ( <div className="modal-backdrop">
<div className="modal" onClick={(e) => e.stopPropagation()}> <h3>그룹에 입장하려면 닉네임을 설정하세요</h3>
<input
placeholder="닉네임 입력"
value={tempNickname}
onChange={(e) => setTempNickname(e.target.value)}
/> <div className="modal-buttons"> <button onClick={handleSetNickname}>확인</button> </div> </div> </div>
)}

  <aside className="group-sidebar">
    <h2>{groupInfo.name}</h2>
    <p>카테고리: {groupInfo.category}</p>
    <p>멤버: {groupInfo.members}명</p>
    <p>내 닉네임: {nickname || "설정 필요"}</p>
    <p>{groupInfo.intro}</p>
    <button className="leave-btn">탈퇴</button>
  </aside>

  <main className="group-content">
    <h2>마이 그룹 페이지</h2>
    <div className="mygroup-actions">
      <button
        className="goto-chat btn"
        disabled={!nickname}
        onClick={() =>
          navigate(`/my-group/chat/${groupInfo.id}?nickname=${nickname}`)
        }
      >
        채팅방 가기
      </button>
    </div>
  </main>

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
