// 📌 src/pages/MyGroupPage.jsx

import React, { useState, useEffect } from "react";
import "../css/MyGroup.css";
import ProfileIcon from "../assets/profile.jpg";
import { useNavigate } from "react-router-dom";

export default function MyGroup() {
  const navigate = useNavigate();

  const [nickname, setNickname] = useState("");
  const [tempNickname, setTempNickname] = useState("");
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);

  const [groupInfo, setGroupInfo] = useState(null);
  const [members, setMembers] = useState([]);

  const GROUP_ID = "67a112233bcd001122334455"; // ⭐ Replace with real group ID
  const API = "http://localhost:5000/api";

  const token = localStorage.getItem("token");

  // -------------------------------
  // 1️⃣ Load user profile (nickname + currentGroup)
  // -------------------------------
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        console.error("No token found. Please login first.");
        return;
      }

      try {
        const res = await fetch(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Check if response is JSON
        const contentType = res.headers.get("content-type");
        if (!res.ok || !contentType?.includes("application/json")) {
          const text = await res.text();
          console.error("Failed to load user:", text);
          return;
        }

        const data = await res.json();
        if (!data || !data.user) return;

        setNickname(data.user.nickname || "");

        if (!data.user.nickname) {
          setIsNicknameModalOpen(true);
        } else {
          // Auto join group
          joinGroup(data.user.nickname);
        }
      } catch (err) {
        console.error("Failed to load user:", err);
      }
    }

    loadUser();
  }, []);

  // -------------------------------
  // 2️⃣ Join group
  // -------------------------------
  async function joinGroup(nick) {
    if (!token) return;

    try {
      const res = await fetch(`${API}/groups/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ groupId: GROUP_ID, nickname: nick }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Join group failed:", text);
        return;
      }

      await loadGroup();
      await loadMembers();
    } catch (err) {
      console.error("Join group failed:", err);
    }
  }

  // -------------------------------
  // 3️⃣ Load group info
  // -------------------------------
  async function loadGroup() {
    try {
      const res = await fetch(`${API}/groups/${GROUP_ID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to load group info:", text);
        return;
      }

      const data = await res.json();
      setGroupInfo(data);
    } catch (err) {
      console.error("Failed to load group info:", err);
    }
  }

  // -------------------------------
  // 4️⃣ Load members
  // -------------------------------
  async function loadMembers() {
    try {
      const res = await fetch(`${API}/groups/${GROUP_ID}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to load members:", text);
        return;
      }

      const data = await res.json();
      setMembers(
        data.map((u) => ({
          id: u._id,
          name: u.nickname || u.name,
          profile: ProfileIcon,
        }))
      );
    } catch (err) {
      console.error("Failed to load members:", err);
    }
  }

  // -------------------------------
  // 5️⃣ Nickname confirm button
  // -------------------------------
  const handleSetNickname = async () => {
    if (!tempNickname.trim()) return;

    const newNick = tempNickname.trim();
    setNickname(newNick);
    setIsNicknameModalOpen(false);

    await joinGroup(newNick);
  };

  return (
    <div className="group-page-container">
      {/* ⭐ Nickname Popup */}
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

      {/* Left Sidebar */}
      <aside className="group-sidebar">
        <h2>{groupInfo?.name || "그룹"}</h2>
        <p>카테고리: {groupInfo?.category}</p>
        <p>멤버: {members.length}명</p>
        <p>내 닉네임: {nickname || "설정 필요"}</p>
        <p>{groupInfo?.intro}</p>
        <button className="leave-btn">탈퇴</button>
      </aside>

      {/* Main */}
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
        </div>

        <div className="mygroup-info-box">
          <h3>공지사항</h3>
          <p>그룹에 오신 것을 환영합니다. 규칙을 준수해 주세요!</p>
        </div>
      </main>

      {/* Right Sidebar - MEMBERS */}
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
