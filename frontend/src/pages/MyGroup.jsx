// src/pages/MyGroup.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/MyGroup.css";
import ProfileIcon from "../assets/profile.jpg";

export default function MyGroup() {
  const navigate = useNavigate();
  const API = "http://localhost:5000/api";
  const token = localStorage.getItem("token");

  const [nickname, setNickname] = useState("");
  const [tempNickname, setTempNickname] = useState("");
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
  const [groupInfo, setGroupInfo] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (!token) return;
    loadUserAndGroup();
  }, []);

  const loadUserAndGroup = async () => {
    try {
      const res = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;

      const data = await res.json();
      const userNick = data.user.nickname || "";
      const userGroup = data.user.currentGroupId || "";

      setNickname(userNick);

      if (!userNick) {
        setIsNicknameModalOpen(true);
        return;
      }

      if (userGroup) {
        await loadGroup(userGroup);
        await loadMembers(userGroup);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- TEMP: Log raw text instead of JSON ---
  const loadGroup = async (groupId) => {
    try {
      const res = await fetch(`${API}/groups/${groupId}`, { headers: { Authorization: `Bearer ${token}` } });
      const text = await res.text();
      console.log("Raw group response:", text);

      try {
        const data = JSON.parse(text);
        setGroupInfo(data);
      } catch (err) {
        console.error("Failed to parse group JSON:", err);
        setGroupInfo(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadMembers = async (groupId) => {
    try {
      const res = await fetch(`${API}/groups/${groupId}/members`, { headers: { Authorization: `Bearer ${token}` } });
      const text = await res.text();
      console.log("Raw members response:", text);

      try {
        const data = JSON.parse(text);
        setMembers(data.map((m) => ({ id: m.id, name: m.name, profile: ProfileIcon })));
      } catch (err) {
        console.error("Failed to parse members JSON:", err);
        setMembers([]);
      }
    } catch (err) {
      console.error(err);
    }
  };
  // --- END TEMP ---

  const joinGroup = async (nick) => {
    if (!groupInfo?._id) return;

    try {
      const res = await fetch(`${API}/groups/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ groupId: groupInfo._id, nickname: nick }),
      });
      if (!res.ok) return;
      await loadGroup(groupInfo._id);
      await loadMembers(groupInfo._id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetNickname = async () => {
    const newNick = tempNickname.trim();
    if (!newNick) return;
    setNickname(newNick);
    setIsNicknameModalOpen(false);
    await joinGroup(newNick);
  };

  const handleLeaveGroup = async () => {
    if (!groupInfo?._id) return;
    if (!window.confirm("정말 그룹에서 탈퇴하시겠습니까?")) return;

    try {
      const res = await fetch(`${API}/groups/leave`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        setGroupInfo(null);
        setMembers([]);
        setNickname("");
        navigate("/groups");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="group-page-container">
      {isNicknameModalOpen && (
        <div className="modal-backdrop">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>그룹 입장에 필요한 닉네임을 설정하세요</h3>
            <input value={tempNickname} onChange={(e) => setTempNickname(e.target.value)} placeholder="닉네임 입력" />
            <button onClick={handleSetNickname}>확인</button>
          </div>
        </div>
      )}

      <aside className="group-sidebar">
        <h2>{groupInfo?.name || "그룹 정보 불러오는 중..."}</h2>
        <p>카테고리: {groupInfo?.category}</p>
        <p>멤버 수: {members.length}명</p>
        <p>내 닉네임: {nickname || "닉네임 없음"}</p>
        <p>{groupInfo?.desc}</p>
        {groupInfo && <button onClick={handleLeaveGroup}>그룹 탈퇴</button>}
      </aside>

      <main className="group-content">
        <h2>마이 그룹</h2>
        <button disabled={!nickname} onClick={() => navigate("/my-group/chat")}>채팅방 가기</button>
      </main>

      <aside className="member-sidebar">
        <h3>멤버 목록</h3>
        <div className="member-list">
          {members.length === 0 && <p>멤버 없음</p>}
          {members.map((m) => (
            <div key={m.id} className="member-item">
              <img src={m.profile} alt="" className="member-profile" />
              <span>{m.name}</span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
