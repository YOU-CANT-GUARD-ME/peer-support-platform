import React, { useState } from "react";
import '../css/group.css'

// GroupModal.jsx
export default function GroupModal({ setIsModalOpen, onGroupCreated }) {
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

    onGroupCreated(newGroup); // 상위로 전달
    setName("");
    setLimit("");
    setCategory("");
    setDesc("");
  };

  return (
    <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>그룹 생성</h3>

        <input type="text" placeholder="그룹 이름" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="number" placeholder="인원 제한" value={limit} onChange={(e) => setLimit(e.target.value)} />
        <input type="text" placeholder="카테고리" value={category} onChange={(e) => setCategory(e.target.value)} />
        <textarea placeholder="그룹 설명을 입력하세요" value={desc} onChange={(e) => setDesc(e.target.value)} />

        <div className="modal-buttons">
          <button onClick={() => setIsModalOpen(false)}>취소</button>
          <button onClick={handleCreate}>생성</button>
        </div>
      </div>
    </div>
  );
}
