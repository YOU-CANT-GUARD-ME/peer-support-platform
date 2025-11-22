import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/Group.css";

export default function NewGroups({ isModalOpen, setIsModalOpen }) {
    const [groups, setGroups] = useState([]);
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

        setGroups([newGroup, ...groups]);
        setName(""); setLimit(""); setCategory(""); setDesc("");
        setIsModalOpen(false);
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
                    <Link to='/group-detail' className="join-btn">가입</Link>
                </div>
            ))}

            {/* 모달 */}
            {isModalOpen && (
                <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3>그룹 생성</h3>
                        <input type="text" placeholder="그룹 이름" value={name} onChange={(e) => setName(e.target.value)} />
                        <input type="number" placeholder="인원 제한" value={limit} onChange={(e) => setLimit(e.target.value)} />
                        <input type="text" placeholder="카테고리" value={category} onChange={(e) => setCategory(e.target.value)} />
                        <textarea placeholder="그룹 설명" value={desc} onChange={(e) => setDesc(e.target.value)} />
                        <div className="modal-buttons">
                            <button onClick={() => setIsModalOpen(false)}>취소</button>
                            <button onClick={handleCreate}>생성</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
