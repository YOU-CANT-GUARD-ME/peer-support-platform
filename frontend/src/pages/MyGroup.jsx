// 📌 src/pages/MyGroupPage.jsx

import React, { useState, useEffect } from "react";
import "../css/MyGroup.css";
import ProfileIcon from "../assets/profile.jpg";
import { useNavigate } from "react-router-dom";

export default function MyGroup() {
  const navigate = useNavigate();

  const API = "http://localhost:5000/api";
  const token = localStorage.getItem("token");

  const [nickname, setNickname] = useState("");
  const [tempNickname, setTempNickname] = useState("");
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);

  const [groupInfo, setGroupInfo] = useState(null);
  const [members, setMembers] = useState([]);

  // 1️⃣ Load user info
  useEffect(() => {
    if (!token) return;
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const res = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;

      const data = await res.json();
      const userNick = data.user.nickname || "";
      const currentGroupId = data.user.currentGroupId || "";

      setNickname(userNick);

      if (!userNick) {
        setIsNicknameModalOpen(true);
        return;
      }

      if (currentGroupId) {
        // 그룹 이미 속해있으면 joinGroup 대신 정보만 로드
        await loadGroup(currentGroupId);
        await loadMembers(currentGroupId);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // 2️⃣ Join group
  async function joinGroup(nick, groupId = groupInfo?._id) {
    if (!groupId) return;
    try {
      const res = await fetch(`${API}/groups/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ groupId, nickname: nick }),
      });

      const data = await res.json();

      // 이미 그룹 속한 경우도 load
      if (!res.ok && data.message === "Already in a group") {
        await loadGroup(groupId);
        await loadMembers(groupId);
        return;
      }

      if (!res.ok) return;

      await loadGroup(groupId);
      await loadMembers(groupId);
    } catch (err) {
      console.error(err);
    }
  }

  // 3️⃣ Load group info
  async function loadGroup(groupId) {
    if (!groupId) return;
    try {
      const res = await fetch(`${API}/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setGroupInfo(data);
    } catch (err) {
      console.error(err);
    }
  }

  // 4️⃣ Load members
  async function loadMembers(groupId) {
    if (!groupId) return;
    try {
      const res = await fetch(`${API}/groups/${groupId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();

      setMembers(
        data.map((m) => ({
          id: m.id,
          name: m.name,
          profile: ProfileIcon,
        }))
      );
    } catch (err) {
      console.error(err);
    }
  }

  // 5️⃣ Handle nickname modal
  const handleSetNickname = async () => {
    const newNick = tempNickname.trim();
    if (!newNick) return;

    setNickname(newNick);
    setIsNicknameModalOpen(false);

    if (groupInfo?._id) {
      await joinGroup(newNick);
    }
  };

  // 6️⃣ Leave group
  const handleLeaveGroup = async () => {
    if (!groupInfo?._id) return;
    if (!window.confirm("정말 그룹에서 탈퇴하시겠습니까?")) return;

    try {
      const res = await fetch(`${API}/groups/leave`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        setGroupInfo(null);
        setMembers([]);
        setNickname("");
        navigate("/groups");
      } else {
        alert(data.message);
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
            <input
              placeholder="닉네임 입력"
              value={tempNickname}
              onChange={(e) => setTempNickname(e.target.value)}
            />
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
        {groupInfo && (
          <button className="leave-btn" onClick={handleLeaveGroup}>
            그룹 탈퇴
          </button>
        )}
      </aside>

      <main className="group-content">
        <h2>마이 그룹</h2>
        <p>이 그룹에서 소통을 시작해보세요!</p>
        <button
          disabled={!nickname}
          className="goto-chat btn"
          onClick={() => navigate("/my-group/chat")}
        >
          채팅방 가기
        </button>
        <div className="mygroup-info-box">
          <h3>공지사항</h3>
          <p>그룹 규칙을 준수해 주세요.</p>
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
