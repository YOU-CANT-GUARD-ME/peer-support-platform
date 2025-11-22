import React, { useState } from "react";
import "../css/Diary.css";
import { motion } from "framer-motion";

export default function Diary() {
    const [entries, setEntries] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEntry, setCurrentEntry] = useState(null);

    const [emotion, setEmotion] = useState("");
    const [content, setContent] = useState("");
    const [selectedTheme, setSelectedTheme] = useState(null);

    const emotions = ["슬픔", "기쁨", "짜증남", "행복", "불안"];

    const themes = [
        { id: "default1", src: "themes/default1.jpg", label: "기본 테마 1" },
        { id: "default2", src: "themes/default2.jpg", label: "기본 테마 2" },
        { id: "joy", src: "themes/joy.jpg", label: "기쁨 테마" },
        { id: "sad", src: "themes/sad.jpg", label: "슬픔 테마" },
        { id: "angry", src: "themes/angry.jpg", label: "짜증 테마" },
        { id: "happy", src: "themes/happy.jpg", label: "행복 테마" },
        { id: "anxious", src: "themes/anxious.jpg", label: "불안 테마" },
    ];

    const formatDateTime = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const hour = String(d.getHours()).padStart(2, "0");
        const min = String(d.getMinutes()).padStart(2, "0");
        return `${year}.${month}.${day} ${hour}:${min}`;
    };

    const handleSubmit = () => {
        if (!emotion || !content.trim() || !selectedTheme) return;

        const newEntry = {
            id: Date.now(),
            emotion,
            content,
            theme: selectedTheme,
            dateTime: formatDateTime(new Date())
        };

        setEntries([newEntry, ...entries]);
        setEmotion("");
        setContent("");
        setSelectedTheme(null);
        setIsModalOpen(false);
    };

    return (
        <div className="diary-page">

            <div className="welcome-box">
                <motion.h1
                    className="welcome-text"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    Welcome to Diary page
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                >
                    기뻤던, 혹은 슬펐던 나만의 하루를 기록하세요.
                </motion.p>
            </div>

            <div className="post-btn" onClick={() => setIsModalOpen(true)}>+</div>

            <div className="diary-grid">
                {entries.map(entry => (
                    <div
                        key={entry.id}
                        className="diary-card"
                        style={{ backgroundImage: `url(${entry.theme.src})` }}
                        onClick={() => setCurrentEntry(entry)}
                    >
                        <div className="diary-emotion">{entry.emotion}</div>
                        <div className="diary-content">{entry.content}</div>
                        <div className="diary-date">{entry.dateTime}</div>
                    </div>
                ))}
            </div>

            {/* 작성 모달 */}
            {isModalOpen && (
                <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
                    <div className="modal">
                        <h3>새 일기 작성</h3>

                        <div className="emotion-selector">
                            {emotions.map(e => (
                                <button
                                    key={e}
                                    className={emotion === e ? "selected" : ""}
                                    onClick={() => setEmotion(e)}
                                >
                                    {e}
                                </button>
                            ))}
                        </div>

                        <h4>테마 선택</h4>
                        <div className="theme-selector">
                            {themes.map(theme => (
                                <div
                                    key={theme.id}
                                    className={`theme-option ${selectedTheme?.id === theme.id ? "selected-theme" : ""}`}
                                    onClick={() => setSelectedTheme(theme)}
                                >
                                    <img src={theme.src} alt={theme.label} />
                                </div>
                            ))}
                        </div>

                        <textarea
                            placeholder="오늘의 일기를 작성하세요..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />

                        <div className="modal-buttons">
                            <button onClick={() => setIsModalOpen(false)}>취소</button>
                            <button onClick={handleSubmit}>저장</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 상세 모달 */}
            {currentEntry && (
                <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
                    {currentEntry && (
                        <div
                            className="modal-backdrop themed"
                            onClick={(e) => e.stopPropagation()}
                            >
                                
                            
                            <div className="modal"
                            style={{
                                backgroundImage: `url(${currentEntry.theme.src})`
                            }}>
                                <h3>{currentEntry.emotion} - {currentEntry.dateTime}</h3>
                                <p>{currentEntry.content}</p>

                                <div className="modal-buttons">
                                    <button onClick={() => setCurrentEntry(null)}>닫기</button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}
