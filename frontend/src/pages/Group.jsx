import React, { useState, useEffect } from "react";
import "../css/Group.css";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const API_BASE_URL = "http://localhost:5000";

/* ---------------------------
   그룹 생성 모달
---------------------------- */
function GroupModal({ setIsModalOpen, onGroupCreated }) {
  const [name, setName] = useState("");
  const [limit, setLimit] = useState("");
  const [category, setCategory] = useState("");
  const [desc, setDesc] = useState("");

  const categoryOptions = ["학업", "연애", "진로", "친구", "가족"];
  const token = localStorage.getItem("token");

  const handleCreate = async () => {
    if (!name.trim() || !limit.trim() || !category.trim() || !desc.trim()) return;

    const newGroup = { name, limit, category, desc };

    try {
      const res = await fetch(`${API_BASE_URL}/api/groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(newGroup),
      });

      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      }

      if (res.ok) {
        onGroupCreated(data);
        setIsModalOpen(false);
        setName("");
        setLimit("");
        setCategory("");
        setDesc("");
      } else {
        alert(data?.message || "그룹 생성 실패");
      }
    } catch (err) {
      console.error("Error creating group:", err);
    }
  };

  return (
    <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>그룹 생성</h3>
        <input type="text" placeholder="그룹 이름" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="number" placeholder="인원 제한" value={limit} onChange={(e) => setLimit(e.target.value)} />

        <h4>카테고리 선택</h4>
        <div className="category-selector">
          {categoryOptions.map((c) => (
            <button
              key={c}
              className={category === c ? "selected-category" : ""}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <textarea placeholder="그룹 설명" value={desc} onChange={(e) => setDesc(e.target.value)} />

        <div className="modal-buttons">
          <button onClick={() => setIsModalOpen(false)}>취소</button>
          <button onClick={handleCreate}>생성</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------
   그룹 리스트
---------------------------- */
function GroupList({ groups, onDelete, onLeave }) {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  const handleJoin = async (group) => {
    const isMember = group.members?.some((m) => m.userId === userId);

    if (isMember) {
      navigate("/my-group");
      return;
    }

    try {
      const resCheck = await fetch(`${API_BASE_URL}/api/groups/my-group`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataCheck = await resCheck.json();

      if (dataCheck.currentGroupId) {
        alert("이미 다른 그룹에 가입되어 있습니다!");
        navigate("/my-group");
        return;
      }
    } catch (err) {
      console.error("my-group check error:", err);
      return;
    }

    const nickname = prompt("그룹에서 사용할 닉네임을 입력하세요");
    if (!nickname || !nickname.trim()) return alert("닉네임을 입력해주세요!");

    try {
      const res = await fetch(`${API_BASE_URL}/api/groups/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ groupId: group._id, nickname }),
      });

      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      }

      if (res.ok) {
        alert("가입 완료!");
        navigate("/my-group");
      } else {
        alert(data?.message || "가입 실패");
      }
    } catch (err) {
      console.error("Join group error:", err);
    }
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/groups/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      }

      if (res.ok) onDelete(id);
      else alert(data?.message || "삭제 실패");
    } catch (err) {
      console.error("Error deleting group:", err);
    }
  };

  const handleLeaveClick = async () => {
    if (!window.confirm("정말 탈퇴하시겠습니까?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/groups/leave`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      }

      if (res.ok) onLeave();
      else alert(data?.message || "탈퇴 실패");
    } catch (err) {
      console.error("Leave error:", err);
    }
  };

  return (
    <div className="group-list">
      {groups.length === 0 && <p>등록된 그룹이 없습니다.</p>}

      {groups.map((g) => (
        <div className="group-card" key={g._id}>
          <h2>{g.name}</h2>
          <p className="g-desc">{g.desc}</p>

          <div className="g-info">
            <span>카테고리: {g.category}</span>
            <span>
              인원: {g.members ? g.members.length : 0} / {g.limit}
            </span>
          </div>

          {g.members?.length > 0 && (
            <div className="member-names">
              <strong>멤버: </strong>
              {g.members.map((m) => m.nickname).join(", ")}
            </div>
          )}

          <div className="group-buttons">
            {g.members?.some((m) => m.userId === userId) ? (
              <button className="leave-btn" onClick={handleLeaveClick}>
                탈퇴
              </button>
            ) : (
              <button className="join-btn" onClick={() => handleJoin(g)}>
                가입
              </button>
            )}

            <button className="delete-btn" onClick={() => handleDeleteClick(g._id)}>
              삭제
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------
   메인 Group 페이지
---------------------------- */
export default function Group() {
  const [groups, setGroups] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkMyGroup = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/api/groups/my-group`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;

        const data = await res.json();

        if (data.currentGroupId) navigate("/my-group");
      } catch (err) {
        console.error("Error checking my group:", err);
      }
    };

    checkMyGroup();
  }, [navigate]);

  const fetchGroups = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/groups`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const data = await res.json();
      setGroups(data);
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleGroupCreated = (newGroup) => {
    setGroups([newGroup, ...groups]);
  };

  const handleDelete = (id) => {
    setGroups(groups.filter((g) => g._id !== id));
  };

  const handleLeave = () => {
    setGroups(groups.filter((g) => g.members?.some((m) => m.userId !== localStorage.getItem("userId"))));
  };

  return (
    <div className="groups-page">
      <div className="welcome-box">
        <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          Welcome to Group Community
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3 }}>
          원하는 그룹을 만들고 참여해보세요.
        </motion.p>
      </div>

      <div className="create-btn" onClick={() => setIsModalOpen(true)}>
        +
      </div>

      <GroupList groups={groups} onDelete={handleDelete} onLeave={handleLeave} />

      {isModalOpen && <GroupModal setIsModalOpen={setIsModalOpen} onGroupCreated={handleGroupCreated} />}
    </div>
  );
}
