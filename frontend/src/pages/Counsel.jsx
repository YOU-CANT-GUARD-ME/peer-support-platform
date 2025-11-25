import React, { useState } from "react";
import "../css/Counsel.css";
import { motion } from "framer-motion";

export default function Counsel() {
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const [form, setForm] = useState({
    name: "",
    studentId: "",
    time: "",
    reason: "",
  });

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = () => {
    if (!form.name || !form.studentId || !form.time || !form.reason.trim())
      return;

    // 서버 저장 가능
    setIsStudentModalOpen(false);
    setIsTeacherModalOpen(false);
    setIsDone(true);
  };

  return (
    <div className="ako-page">
      <div className="welcome-box">
        <motion.h1
          className="ako-title"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Welcome to Counsel page
        </motion.h1>
        <motion.p
          className="ako-sub"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
        >
          우리 학교 상담 동아리 및 멘토에게 도움을 요청하세요.
        </motion.p>
      </div>

      <div className="ako-container">
        <div className="ako-info-box">
          <div className="ako-info">
            <h3>AKO 학생 상담</h3>
            <p>AKO 상담 동아리 학생들이 진행하는 상담입니다.</p>
          </div>
          <button
            className="ako-btn"
            onClick={() => setIsStudentModalOpen(true)}
          >
            상담 신청하기
          </button>
        </div>

        <div className="ako-info-box">
          <div className="ako-info">
            <h3>AKO 선생님 상담</h3>
            <p>AKO 상담 동아리 담당 선생님들이 진행하는 상담입니다.</p>
          </div>
          <button
            className="ako-btn"
            onClick={() => setIsTeacherModalOpen(true)}
          >
            상담 신청하기
          </button>
        </div>
      </div>

      {/* 학생 상담 모달 */}
      {isStudentModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsStudentModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>학생 상담 신청</h2>
            <input
              type="text"
              placeholder="이름"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            <input
              type="text"
              placeholder="학번"
              value={form.studentId}
              onChange={(e) => handleChange("studentId", e.target.value)}
            />
            <label className="time-label">상담 가능한 시간</label>
            <select
              value={form.time}
              onChange={(e) => handleChange("time", e.target.value)}
            >
              <option value="">시간 선택</option>
              <option>점심시간 (11:20 - 12:20)</option>
              <option>방과후 1타임</option>
              <option>방과후 2타임</option>
              <option>주말 상담 요청</option>
            </select>
            <textarea
              placeholder="요즘 어떤 점이 힘든가요?"
              value={form.reason}
              onChange={(e) => handleChange("reason", e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={() => setIsStudentModalOpen(false)}>취소</button>
              <button onClick={handleSubmit}>신청하기</button>
            </div>
          </div>
        </div>
      )}

      {/* 선생님 상담 모달 */}
      {isTeacherModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsTeacherModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>선생님 상담 신청</h2>
            <input
              type="text"
              placeholder="이름"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            <input
              type="text"
              placeholder="학번"
              value={form.studentId}
              onChange={(e) => handleChange("studentId", e.target.value)}
            />
            <label className="time-label">상담 가능한 시간</label>
            <select
              value={form.time}
              onChange={(e) => handleChange("time", e.target.value)}
            >
              <option value="">시간 선택</option>
              <option>점심시간 (11:20 - 12:20)</option>
              <option>방과후 1타임</option>
              <option>방과후 2타임</option>
              <option>주말 상담 요청</option>
            </select>
            <textarea
              placeholder="요즘 어떤 점이 힘든가요?"
              value={form.reason}
              onChange={(e) => handleChange("reason", e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={() => setIsTeacherModalOpen(false)}>취소</button>
              <button onClick={handleSubmit}>신청하기</button>
            </div>
          </div>
        </div>
      )}

      {/* 신청 완료 모달 */}
      {isDone && (
        <div className="modal-backdrop" onClick={() => setIsDone(false)}>
          <div className="modal done-modal" onClick={(e) => e.stopPropagation()}>
            <h2>신청 완료!</h2>
            <p>Ako 상담 동아리가 빠르게 확인할게요.</p>
            <button className="close-done" onClick={() => setIsDone(false)}>
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
