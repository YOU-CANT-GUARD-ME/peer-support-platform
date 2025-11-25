import React, { useState, useEffect } from "react";
import "../css/Group.css";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../api";

// --- 그룹 생성 모달 ---
function GroupModal({ setIsModalOpen, onGroupCreated }) {
  const [name, setName] = useState("");
  const [limit, setLimit] = useState("");
  const [category, setCategory] = useState("");
  const [desc, setDesc] = useState("");

  const categoryOptions = ["학업", "연애", "진로", "친구", "가족"];

  const handleCreate = async () => {
    if (!name.trim() || !limit.trim() || !category.trim() || !desc.trim()) return;

    const newGroup = { name, limit, category, desc };

    try {
      const res = await fetch(`${API_BASE_URL}/api/groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGroup),
      });

      const data = await res.json();
      if (res.ok) {
        onGroupCreated(data);
        setIsModalOpen(false);
        setName("");
        setLimit("");
        setCategory("");
        setDesc("");
      } else {
        console.error("Failed:", data.message);
      }
    } catch (err) {
      console.error("Error creating group:", err);
    }
  };

  return (
    <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>그룹 생성</h3>

        <input type="text" placeholder="그룹 이름"
          value={name} onChange={(e) => setName(e.target.value)} />
        <input type="number" placeholder="인원 제한"
          value={limit} onChange={(e) => setLimit(e.target.value)} />

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

        <textarea placeholder="그룹 설명을 입력하세요"
          value={desc} onChange={(e) => setDesc(e.target.value)} />

        <div className="modal-buttons">
          <button onClick={() => setIsModalOpen(false)}>취소</button>
          <button onClick={handleCreate}>생성</button>
        </div>
      </div>
    </div>
  );
}

// --- 새 그룹 보기 ---
function NewGroups({ groups, onDelete }) {
  return (
    <div className="group-list">
      {groups.length === 0 && <p>새로운 그룹이 없습니다.</p>}
      {groups.map((g) => (
        <div className="group-card" key={g._id || g.id}>
          <h2>{g.name}</h2>
          <p className="g-desc">{g.desc}</p>
          <div className="g-info">
            <span>카테고리: {g.category}</span>
            <span>인원: {g.members || 1} / {g.limit}</span>
          </div>

          <div className="group-buttons">
            <button className="join-btn">가입</button>
            <button className="delete-btn" onClick={() => onDelete(g._id)}>
              삭제
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- 마이 그룹 보기 ---
function MyGroups({ myGroups }) {
  return (
    <div className="group-list">
      {myGroups.length === 0 ? (
        <p>가입한 그룹이 없습니다.</p>
      ) : (
        myGroups.map((g) => (
          <div className="group-card" key={g._id || g.id}>
            <h2>{g.name}</h2>
            <p className="g-desc">{g.desc}</p>
            <div className="g-info">
              <span>카테고리: {g.category}</span>
              <span>인원: {g.members || 1} / {g.limit}</span>
            </div>
            <button className="join-btn joined">참여중</button>
          </div>
        ))
      )}
    </div>
  );
}

// --- Group 페이지 ---
export default function Group() {
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [activeTab, setActiveTab] = useState("new");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchGroups = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/groups`);
      const data = await res.json();
      setGroups(data);
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  const fetchMyGroups = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/groups/my`);
      const data = await res.json();
      setMyGroups(data);
    } catch (err) {
      console.error("Error fetching my groups:", err);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchMyGroups();
  }, []);

  const handleGroupCreated = (newGroup) => {
    setGroups([newGroup, ...groups]);
    setActiveTab("new");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    const res = await fetch(`${API_BASE_URL}/api/groups/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setGroups(groups.filter((g) => g._id !== id));
    }
  };

  return (
    <div className="groups-page">
      {/* 웰컴 박스 */}
      <div className="welcome-box">
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          Welcome to Group Community
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        >
          당신만의 그룹을 만들고 가입하세요.
        </motion.p>
      </div>

      {/* 그룹 생성 버튼 */}
      <div className="create-btn" onClick={() => setIsModalOpen(true)}>+</div>

      {/* 탭 버튼 */}
      <div className="group-tabs">
        <button
          className={activeTab === "new" ? "active-tab" : ""}
          onClick={() => setActiveTab("new")}
        >
          새 그룹 보기
        </button>
        <button
          className={activeTab === "my" ? "active-tab" : ""}
          onClick={() => setActiveTab("my")}
        >
          마이 그룹
        </button>
      </div>

      {/* 탭 내용 */}
      <div className="tab-content">
        {activeTab === "new" ? (
          <NewGroups groups={groups} onDelete={handleDelete} />
        ) : (
          <MyGroups myGroups={myGroups} />
        )}
      </div>

      {/* 모달 */}
      {isModalOpen && (
        <GroupModal
          setIsModalOpen={setIsModalOpen}
          onGroupCreated={handleGroupCreated}
        />
      )}
    </div>
  );
}
