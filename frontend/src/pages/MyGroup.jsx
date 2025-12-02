// 📌 src/pages/MyGroupPage.jsx

import React, { useState, useEffect } from "react";
import "../css/MyGroup.css";
import ProfileIcon from "../assets/profile.jpg";
import { useNavigate } from "react-router-dom";

export default function MyGroup() {
  const navigate = useNavigate();

  const API = "http://localhost:5000/api";
  const token = localStorage.getItem("token");

  // ⭐ YOUR REAL GROUP ID (replace with actual ID)
  const GROUP_ID = "67a112233bcd001122334455";

  const [nickname, setNickname] = useState("");
  const [tempNickname, setTempNickname] = useState("");
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);

  const [groupInfo, setGroupInfo] = useState(null);
  const [members, setMembers] = useState([]);

  // ---------------------------------------------------
  // 1️⃣ Load user (nickname + auto-join)
  // ---------------------------------------------------
  useEffect(() => {
    if (!token) {
      console.error("No token found. Login required.");
      return;
    }

    loadUser();
  }, []);

  async function loadUser() {
    try {
      const res = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("Failed to load user:", await res.text());
        return;
      }

      const data = await res.json();
      if (!data?.user) return;

      const userNick = data.user.nickname || "";

      setNickname(userNick);

      // If no nickname → ask user to set one
      if (!userNick) {
        setIsNicknameModalOpen(true);
        return;
      }

      // If nickname exists → auto join group
      await joinGroup(userNick);
    } catch (err) {
      console.error("Failed to load user:", err);
    }
  }

  // ---------------------------------------------------
  // 2️⃣ Join the group
  // ---------------------------------------------------
  async function joinGroup(nick) {
    try {
      const res = await fetch(`${API}/groups/join/${GROUP_ID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nickname: nick }),
      });

      if (!res.ok) {
        console.error("Join group failed:", await res.text());
        return;
      }

      await loadGroup();
      await loadMembers();
    } catch (err) {
      console.error("Join group failed:", err);
    }
  }

  // ---------------------------------------------------
  // 3️⃣ Load group info
  // ---------------------------------------------------
  async function loadGroup() {
    try {
      const res = await fetch(`${API}/groups/${GROUP_ID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("Failed to load group info:", await res.text());
        return;
      }

      const data = await res.json();
      setGroupInfo(data);
    } catch (err) {
      console.error("Group load error:", err);
    }
  }

  // ---------------------------------------------------
  // 4️⃣ Load members
  // ---------------------------------------------------
  async function loadMembers() {
    try {
      const res = await fetch(`${API}/groups/${GROUP_ID}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("Failed to load members:", await res.text());
        return;
      }

      const data = await res.json();

      setMembers(
        data.map((m) => ({
          id: m._id,
          name: m.nickname || m.name,
          profile: ProfileIcon,
        }))
      );
    } catch (err) {
      console.error("Failed to load members:", err);
    }
  }

  // ---------------------------------------------------
  // 5️⃣ Handle nickname modal
  // ---------------------------------------------------
  const handleSetNickname = async () => {
    const newNick = tempNickname.trim();
    if (!newNick) return;

    setNickname(newNick);
    setIsNicknameModalOpen(false);

    await joinGroup(newNick);
  };

  return (
    <div className="group-page-container">
      {/* ⭐ Nickname Modal */}
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

      {/* LEFT SIDEBAR */}
      <aside className="group-sidebar">
        <h2>{groupInfo?.name || "그룹 정보 불러오는 중..."}</h2>
        <p>카테고리: {groupInfo?.category}</p>
        <p>멤버 수: {members.length}명</p>
        <p>내 닉네임: {nickname || "닉네임 없음"}</p>
        <p>{groupInfo?.desc}</p>
        <button className="leave-btn">그룹 탈퇴</button>
      </aside>

      {/* MAIN */}
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

      {/* RIGHT SIDEBAR — MEMBERS */}
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
