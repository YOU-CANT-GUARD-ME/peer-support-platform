// --- 기존 import 동일 ---
import React, { useState, useEffect } from "react";
import "../css/Diary.css";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../api";

export default function Diary() {
    const [entries, setEntries] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEntry, setCurrentEntry] = useState(null);

    const [emotion, setEmotion] = useState("");
    const [content, setContent] = useState("");
    const [selectedThemeId, setSelectedThemeId] = useState(null);

    const emotions = ["슬픔", "기쁨", "짜증남", "행복", "불안"];

    const colorThemes = [
        { id: "blue", color: "#3b82f6" },
        { id: "yellow", color: "#facc15" },
        { id: "red", color: "#ef4444" },
        { id: "pink", color: "#ec4899" },
        { id: "purple", color: "#8b5cf6" }
    ];

    // id → color 매핑
    const themeMap = colorThemes.reduce((acc, t) => {
        acc[t.id] = t.color;
        return acc;
    }, {});

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/diary`)
            .then(res => res.json())
            .then(data => setEntries(data))
            .catch(err => console.error("Error fetching diary entries:", err));
    }, []);

    const handleSubmit = async () => {
        if (!emotion || !content.trim() || !selectedThemeId) return;

        const newEntry = {
            emotion,
            content,
            themeId: selectedThemeId // 서버에는 id만 저장
        };

        try {
            const res = await fetch(`${API_BASE_URL}/api/diary`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newEntry),
            });

            if (!res.ok) throw new Error("Failed to save diary");

            const savedEntry = await res.json();
            // savedEntry.theme 객체로 직접 저장해서 삭제 시 사용 가능
            savedEntry.theme = colorThemes.find(t => t.id === savedEntry.themeId);

            setEntries([savedEntry, ...entries]);
            setEmotion("");
            setContent("");
            setSelectedThemeId(null);
            setIsModalOpen(false);
        } catch (err) {
            console.error(err);
            alert("일기 저장에 실패했습니다.");
        }
    };

    const handleDelete = async (id) => {
        await fetch(`${API_BASE_URL}/api/diary/${id}`, {
            method: "DELETE"
        });

        setEntries(entries.filter((item) => item._id !== id));
        setCurrentEntry(null);
    };

    return (
        <div className="diary-page">
            <div className="welcome-box">
                <motion.h1 className="welcome-text" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
                    Welcome to Diary page
                </motion.h1>
                <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3 }}>
                    기뻤던, 혹은 슬펐던 나만의 하루를 기록하세요.
                </motion.p>
            </div>

            <div className="post-btn" onClick={() => setIsModalOpen(true)}>+</div>

            <div className="diary-grid">
                {entries.map(entry => (
                    <div
                        key={entry._id}
                        className="diary-card"
                        style={{ backgroundColor: entry.theme?.color || "#fff9c4" }}
                        onClick={() => setCurrentEntry(entry)}
                    >
                        <div className="diary-emotion">{entry.emotion}</div>
                        <div className="diary-content">{entry.content}</div>
                        <div className="diary-date">{new Date(entry.createdAt).toLocaleString("ko-KR")}</div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>새 일기 작성</h3>
                        <div className="emotion-selector">
                            {emotions.map(e => (
                                <button key={e} className={emotion === e ? "selected" : ""} onClick={() => setEmotion(e)}>
                                    {e}
                                </button>
                            ))}
                        </div>
                        <h4>테마 선택</h4>
                        <div className="color-theme-selector">
                            {colorThemes.map(theme => (
                                <div
                                    key={theme.id}
                                    className={`color-theme ${selectedThemeId === theme.id ? "selected-color" : ""}`}
                                    style={{ backgroundColor: theme.color }}
                                    onClick={() => setSelectedThemeId(theme.id)}
                                ></div>
                            ))}
                        </div>
                        <textarea placeholder="오늘의 일기를 작성하세요..." value={content} onChange={e => setContent(e.target.value)} />
                        <div className="modal-buttons">
                            <button onClick={() => setIsModalOpen(false)}>취소</button>
                            <button onClick={handleSubmit}>저장</button>
                        </div>
                    </div>
                </div>
            )}

            {currentEntry && (
                <div className="modal-backdrop" onClick={() => setCurrentEntry(null)}>
                    <div className="modal themed" style={{ backgroundColor: currentEntry.theme?.color || "#fff" }} onClick={e => e.stopPropagation()}>
                        <h3>{currentEntry.emotion} - {new Date(currentEntry.createdAt).toLocaleString("ko-KR")}</h3>
                        <p>{currentEntry.content}</p>
                        <div className="modal-buttons">
                            <button onClick={() => handleDelete(currentEntry._id)} style={{ background: "red", color: "white" }}>삭제</button>
                            <button onClick={() => setCurrentEntry(null)}>닫기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
