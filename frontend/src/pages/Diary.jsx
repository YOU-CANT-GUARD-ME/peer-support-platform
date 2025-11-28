import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../api";
import "../css/Diary.css";

export default function Diary() {
  const [entries, setEntries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState(null);

  const [emotion, setEmotion] = useState("");
  const [content, setContent] = useState("");
  const [selectedThemeId, setSelectedThemeId] = useState("yellow");

  const emotions = ["행복", "슬픔", "분노", "불안", "평온"];

  const colorThemes = [
    { id: "yellow", color: "#fff9c4" },
    { id: "pink", color: "#f8bbd0" },
    { id: "blue", color: "#bbdefb" },
    { id: "purple", color: "#e1bee7" },
    { id: "red", color: "#ffcdd2" }
  ];

  const themeMap = colorThemes.reduce((acc, t) => {
    acc[t.id] = t.color;
    return acc;
  }, {});

  // Fetch diary entries
  useEffect(() => {
    const fetchDiary = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/diary`);
        if (!res.ok) throw new Error("Failed to fetch diary entries");
        const data = await res.json();

        const fixedData = data.map(entry => ({
          ...entry,
          theme: entry.theme?.id ? themeMap[entry.theme.id] : themeMap["yellow"]
        }));

        setEntries(fixedData);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDiary();
  }, []);

  // Submit new diary entry
  const handleSubmit = async () => {
    if (!emotion || !content.trim()) return;

    const newEntry = {
      emotion,
      content,
      theme: { id: selectedThemeId }
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/diary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry),
      });

      if (!res.ok) throw new Error("Failed to save diary");

      const saved = await res.json();
      saved.theme = themeMap[saved.theme.id] || themeMap["yellow"];

      setEntries([saved, ...entries]);
      setEmotion("");
      setContent("");
      setSelectedThemeId("yellow");
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("일기 저장에 실패했습니다.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/diary/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete entry");
      setEntries(entries.filter(e => e._id !== id));
      setCurrentEntry(null);
    } catch (err) {
      console.error(err);
      alert("삭제 실패");
    }
  };

  return (
    <div className="diary-page">
      <div className="welcome-box">
        <motion.h1
          className="welcome-text"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Welcome to Diary page
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          기뻤던, 혹은 슬펐던 나만의 하루를 기록하세요.
        </motion.p>
      </div>

      <div className="post-btn" onClick={() => setIsModalOpen(true)}>+</div>

      <div className="diary-grid">
        {entries.map(entry => (
          <motion.div
            key={entry._id}
            className="diary-card"
            style={{ backgroundColor: entry.theme }}
            whileHover={{ scale: 1.05, rotate: 0 }}
            onClick={() => setCurrentEntry(entry)}
          >
            <div className="diary-emotion">{entry.emotion}</div>
            <div className="diary-content">{entry.content}</div>
            <div className="diary-date">{new Date(entry.createdAt).toLocaleString("ko-KR")}</div>
          </motion.div>
        ))}
      </div>

      {/* New Diary Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
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
            <div className="color-theme-selector">
              {colorThemes.map(theme => (
                <div
                  key={theme.id}
                  className={`color-theme ${selectedThemeId === theme.id ? "selected-color" : ""}`}
                  style={{ backgroundColor: theme.color }}
                  onClick={() => setSelectedThemeId(theme.id)}
                />
              ))}
            </div>

            <textarea
              placeholder="오늘의 일기를 작성하세요..."
              value={content}
              onChange={e => setContent(e.target.value)}
            />

            <div className="modal-buttons">
              <button onClick={() => setIsModalOpen(false)}>취소</button>
              <button onClick={handleSubmit}>저장</button>
            </div>
          </div>
        </div>
      )}

      {/* View Diary Modal */}
      {currentEntry && (
        <div className="modal-backdrop" onClick={() => setCurrentEntry(null)}>
          <div className="modal themed" style={{ backgroundColor: currentEntry.theme }} onClick={e => e.stopPropagation()}>
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
