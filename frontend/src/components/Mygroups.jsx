import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/Group.css";

export default function MyGroups() {
    const [myGroups, setMyGroups] = useState([
        { id: 1, name: "우울 치료", category: "고민 상담", desc: "우울한 일은 털어놓으쇼", members: 5, limit: 10 },
        { id: 2, name: "귀여운 거 보자", category: "힐링", desc: "고냐니가나디기니피그", members: 8, limit: 12 },
    ]);

    return (
        <div className="group-list">
            {myGroups.map((g) => (
                <div className="group-card" key={g.id}>
                    <h2>{g.name}</h2>
                    <p className="g-desc">{g.desc}</p>
                    <div className="g-info">
                        <span>카테고리: {g.category}</span>
                        <span>인원: {g.members} / {g.limit}</span>
                    </div>
                    <Link to='/group-detail' className="join-btn joined">이미 가입됨</Link>
                </div>
            ))}
        </div>
    );
}
