import React, { useState, useEffect } from "react";
import "../css/Group.css";
<<<<<<< HEAD
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

// Change this to your local backend
const API_BASE_URL = "http://localhost:5000";

/* ---------------------------
그룹 생성 모달
---------------------------- */
=======
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";

>>>>>>> origin/main
function GroupModal({ setIsModalOpen, onGroupCreated }) {
  const [name, setName] = useState("");
  const [limit, setLimit] = useState("");
  const [category, setCategory] = useState("");
  const [desc, setDesc] = useState("");
<<<<<<< HEAD
  
  
  const categoryOptions = ["학업", "연애", "진로", "친구", "가족"];
  
  const handleCreate = async () => {
    if (!name.trim() || !limit.trim() || !category.trim() || !desc.trim()) return;
    
    const newGroup = { name, limit, category, desc };
    
=======

  const categoryOptions = ["학업", "연애", "진로", "친구", "가족"];

  const handleCreate = async () => {
    if (!name.trim() || !limit.trim() || !category.trim() || !desc.trim()) return;

    const newGroup = { name, limit, category, desc };

>>>>>>> origin/main
    try {
      const res = await fetch(`${API_BASE_URL}/api/groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGroup),
      });
<<<<<<< HEAD
      
      const data = await res.json();
      
      if (res.ok) {
        onGroupCreated(data);
        setIsModalOpen(false);
        
        setName("");
        setLimit("");
        setCategory("");
        setDesc("");
=======

      const data = await res.json();
      if (res.ok) {
        onGroupCreated(data);
        setIsModalOpen(false);
        setName(""); setLimit(""); setCategory(""); setDesc("");
>>>>>>> origin/main
      } else {
        console.error("Failed:", data.message);
      }
    } catch (err) {
      console.error("Error creating group:", err);
    }
  };
<<<<<<< HEAD
  
=======

>>>>>>> origin/main
  return (
    <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>그룹 생성</h3>

<<<<<<< HEAD
        <input
          type="text"
          placeholder="그룹 이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="number"
          placeholder="인원 제한"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          />
=======
        <input type="text" placeholder="그룹 이름" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="number" placeholder="인원 제한" value={limit} onChange={(e) => setLimit(e.target.value)} />
>>>>>>> origin/main

        <h4>카테고리 선택</h4>
        <div className="category-selector">
          {categoryOptions.map((c) => (
<<<<<<< HEAD
            <button
            key={c}
            className={category === c ? "selected-category" : ""}
            onClick={() => setCategory(c)}
            >
=======
            <button key={c} className={category === c ? "selected-category" : ""} onClick={() => setCategory(c)}>
>>>>>>> origin/main
              {c}
            </button>
          ))}
        </div>

<<<<<<< HEAD
        <textarea
          placeholder="그룹 설명을 입력하세요"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          />
=======
        <textarea placeholder="그룹 설명을 입력하세요" value={desc} onChange={(e) => setDesc(e.target.value)} />
>>>>>>> origin/main

        <div className="modal-buttons">
          <button onClick={() => setIsModalOpen(false)}>취소</button>
          <button onClick={handleCreate}>생성</button>
        </div>
      </div>
    </div>
  );
}

<<<<<<< HEAD
/* ---------------------------
그룹 목록 UI
---------------------------- */
=======
>>>>>>> origin/main
function GroupList({ groups, onDelete }) {
  return (
    <div className="group-list">
      {groups.length === 0 && <p>등록된 그룹이 없습니다.</p>}
<<<<<<< HEAD

      {groups.map((g) => (
        <div className="group-card" key={g._id || g.id}>
          <h2>{g.name}</h2>
          <p className="g-desc">{g.desc}</p>

          <div className="g-info">
            <span>카테고리: {g.category}</span>
            <span>인원: {g.members || 1} / {g.limit}</span>
          </div>

          <div className="group-buttons">
            <Link to="/my-group">
              <button className="join-btn">가입</button>
            </Link>

            <button className="delete-btn" onClick={() => onDelete(g._id)}>
              삭제
            </button>
=======
      {groups.map((g) => (
        <div className="group-card" key={g._id}>
          <h2>{g.name}</h2>
          <p className="g-desc">{g.desc}</p>
          <div className="g-info">
            <span>카테고리: {g.category}</span>
            <span>인원: {g.members || 0} / {g.limit}</span>
          </div>

          <div className="group-buttons">
            {/* 상세 페이지로 이동 */}
<Link to={`/my-group/${g._id}`}>
  <button className="join-btn">가입</button>
</Link>

            <button className="delete-btn" onClick={() => onDelete(g._id)}>삭제</button>
>>>>>>> origin/main
          </div>
        </div>
      ))}
    </div>
  );
}

<<<<<<< HEAD
/* ---------------------------
   메인 Group 페이지
   ---------------------------- */
export default function Group() {
  const [groups, setGroups] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 그룹 목록 가져오기
=======
export default function Group() {
  const [groups, setGroups] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

>>>>>>> origin/main
  const fetchGroups = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/groups`);
      const data = await res.json();
<<<<<<< HEAD

=======
>>>>>>> origin/main
      setGroups(data);
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };
<<<<<<< HEAD
  
  useEffect(() => {
    fetchGroups();
  }, []);
  
  const handleGroupCreated = (newGroup) => {
    setGroups([newGroup, ...groups]);
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    
    const res = await fetch(`${API_BASE_URL}/api/groups/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setGroups(groups.filter((g) => g._id !== id));
    }
=======

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleGroupCreated = (newGroup) => {
    setGroups([newGroup, ...groups]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    const res = await fetch(`${API_BASE_URL}/api/groups/${id}`, { method: "DELETE" });
    if (res.ok) setGroups(groups.filter((g) => g._id !== id));
>>>>>>> origin/main
  };

  return (
    <div className="groups-page">
<<<<<<< HEAD

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
=======
      <div className="welcome-box">
        <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut" }}>
          Welcome to Group Community
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}>
>>>>>>> origin/main
          원하는 그룹을 만들고 참여해보세요.
        </motion.p>
      </div>

<<<<<<< HEAD
      {/* 그룹 생성 버튼 */}
      <div className="create-btn" onClick={() => setIsModalOpen(true)}>+</div>

      {/* 그룹 목록 */}
      <GroupList groups={groups} onDelete={handleDelete} />

      {/* 그룹 생성 모달 */}
      {isModalOpen && (
        <GroupModal
          setIsModalOpen={setIsModalOpen}
          onGroupCreated={handleGroupCreated}
        />
      )}
=======
      <div className="create-btn" onClick={() => setIsModalOpen(true)}>+</div>

      <GroupList groups={groups} onDelete={handleDelete} />

      {isModalOpen && <GroupModal setIsModalOpen={setIsModalOpen} onGroupCreated={handleGroupCreated} />}
>>>>>>> origin/main
    </div>
  );
}
