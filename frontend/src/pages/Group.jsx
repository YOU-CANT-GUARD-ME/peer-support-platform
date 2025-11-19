import React, { useState } from "react";
import '../css/Group.css'
<<<<<<< HEAD
=======
import { motion } from "framer-motion";
>>>>>>> 5643ab6 (애니메이션 추가)
import { Link } from "react-router-dom";

export default function Group() {
    const [groups, setGroups] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
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
        setName("");
        setLimit("");
        setCategory("");
        setDesc("");
        setIsModalOpen(false);
    };

    return (
        <div className="groups-page">
            <div className="welcome-box">
<<<<<<< HEAD
                <h1 className="welcome-group-text">Welcome to Group Community</h1>
                <p>당신만의 그룹을 추가하고 가입해보세요.</p>
            </div>
            
=======
                <motion.h1
                    className="welcome-text"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    Welcome to Group Community
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                >
                    당신만의 그룹을 추가하고 가입해보세요.
                </motion.p>
            </div>

>>>>>>> 5643ab6 (애니메이션 추가)
            <div className="create-btn" onClick={() => setIsModalOpen(true)}>+</div>

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
            </div>

            {isModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal">
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
                        ></textarea>

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
