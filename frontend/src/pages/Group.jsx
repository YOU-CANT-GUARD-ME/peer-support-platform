import React, { useState } from "react";
import "../css/Group.css";
import { motion } from "framer-motion";

// 그룹 생성 모달 컴포넌트
function GroupModal({ setIsModalOpen, onGroupCreated }) {
  const [name, setName] = useState("");
  const [limit, setLimit] = useState("");
  const [category, setCategory] = useState("");
  const [desc, setDesc] = useState("");

  const handleCreate = () => {
    if (!name.trim() || !limit.trim() || !category.trim() || !desc.trim()) return;

    const newGroup = {
      id: Date.now(),
      name,
      limit,
      category,
      desc,
      members: 1,
    };

    onGroupCreated(newGroup);
    setName("");
    setLimit("");
    setCategory("");
    setDesc("");
  };

  return (
    <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>그룹 생성</h3>

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
        <input
          type="text"
          placeholder="카테고리"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <textarea
          placeholder="그룹 설명을 입력하세요"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        <div className="modal-buttons">
          <button onClick={() => setIsModalOpen(false)}>취소</button>
          <button onClick={handleCreate}>생성</button>
        </div>
      </div>
    </div>
  );
}

// 새 그룹 보기 컴포넌트
function NewGroups({ groups, setGroups, setIsModalOpen, setActiveTab }) {
  const handleGroupCreated = (newGroup) => {
    setGroups([newGroup, ...groups]);
    setIsModalOpen(false);
    setActiveTab("new"); // 생성 후 새 그룹 보기로 이동
  };

  return (
    <div className="group-list">
      {groups.map((g) => (
        <div className="group-card" key={g.id}>
          <h2>{g.name}</h2>
          <p className="g-desc">{g.desc}</p>
          <div className="g-info">
            <span>카테고리: {g.category}</span>
            <span>인원: {g.members} / {g.limit}</span>
          </div>
          <button className="join-btn">가입</button>
        </div>
      ))}
      {/** 그룹 생성 모달 */}
      {setIsModalOpen && (
        <GroupModal setIsModalOpen={setIsModalOpen} onGroupCreated={handleGroupCreated} />
      )}
    </div>
  );
}

// 마이 그룹 컴포넌트
function MyGroups({ myGroups }) {
  return (
    <div className="group-list">
      {myGroups.length === 0 ? (
        <p>가입한 그룹이 없습니다.</p>
      ) : (
        myGroups.map((g) => (
          <div className="group-card" key={g.id}>
            <h2>{g.name}</h2>
            <p className="g-desc">{g.desc}</p>
            <div className="g-info">
              <span>카테고리: {g.category}</span>
              <span>인원: {g.members} / {g.limit}</span>
            </div>
            <button className="join-btn joined">참여중</button>
          </div>
        ))
      )}
    </div>
  );
}

// Group 페이지
export default function Group() {
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [activeTab, setActiveTab] = useState("new"); // 'new' or 'my'
  const [isModalOpen, setIsModalOpen] = useState(false);

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

      {/* 탭 컨텐츠 */}
      <div className="tab-content">
        {activeTab === "new" ? (
          <NewGroups
            groups={groups}
            setGroups={setGroups}
            setIsModalOpen={setIsModalOpen}
            setActiveTab={setActiveTab}
          />
        ) : (
          <MyGroups myGroups={myGroups} />
        )}
      </div>

      {/* 그룹 생성 모달 (새 그룹 보기 / 마이 그룹 모두 클릭 가능) */}
      {isModalOpen && (
        <GroupModal
          setIsModalOpen={setIsModalOpen}
          onGroupCreated={(newGroup) => {
            setGroups([newGroup, ...groups]);
            setActiveTab("new"); // 생성 후 새 그룹 보기
          }}
        />
      )}
    </div>
  );
}
