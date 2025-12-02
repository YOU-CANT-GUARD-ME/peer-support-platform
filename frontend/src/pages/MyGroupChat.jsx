import React, { useEffect, useState, useRef } from "react";
import "../css/GroupChat.css";
import ProfileIcon from "../assets/profile.jpg";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  transports: ["websocket", "polling"],
});

export default function MyGroupChat({ nickname, roomId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [participants, setParticipants] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    socket.emit("join-room", { roomId, nickname });

    return () => {
      socket.emit("leave-room", roomId);
    };
  }, [roomId, nickname]);

  useEffect(() => {
    // 메시지 히스토리
    const handleHistory = (msgs) => {
      setMessages(msgs.map(m => ({ nickname: m.nickname, text: m.text, time: m.time })));
    };
    socket.on("chat-message-history", handleHistory);

    // 참여자 목록 (중복 제거)
    const handleRoomUsers = (users) => {
      setParticipants([...new Set(users)]);
    };
    socket.on("room-users", handleRoomUsers);

    // 새 메시지
    const handleMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
    };
    socket.on("chat-message", handleMessage);

    // 유저 참여/퇴장
    const handleUserJoined = (userId) => {
      setParticipants(prev => (prev.includes(userId) ? prev : [...prev, userId]));
    };
    const handleUserLeft = (userId) => {
      setParticipants(prev => prev.filter(id => id !== userId));
    };
    socket.on("user-joined", handleUserJoined);
    socket.on("user-left", handleUserLeft);

    // 언마운트 시 이벤트 제거
    return () => {
      socket.off("chat-message-history", handleHistory);
      socket.off("room-users", handleRoomUsers);
      socket.off("chat-message", handleMessage);
      socket.off("user-joined", handleUserJoined);
      socket.off("user-left", handleUserLeft);
    };
  }, []); // 빈 배열 → 한 번만 실행


  useEffect(() => {
    scrollToBottom();
  }, [messages]);

const sendMessage = (e) => {
  e.preventDefault();
  if (!input.trim()) return;

  const msg = { text: input, nickname, time: new Date().toLocaleTimeString() };
  socket.emit("chat-message", { roomId, message: msg });
  setInput(""); // 메시지 입력창만 초기화
};


  return (
    <div className="chat-page">
      <aside className="chat-sidebar">
        <h3>참여자</h3>
        <div className="chat-participants">
          {participants.map((p, idx) => (
            <div key={idx} className="participant">
              <img src={ProfileIcon} alt="avatar" className="avatar" />
              <span className="name">{p === nickname ? p : p}</span>
            </div>
          ))}
        </div>
      </aside>

      <main className="chat-main">
        <div className="messages">
          {messages.map((m, idx) => (
            <div key={idx} className="message">
              <strong>{m.nickname}</strong> [{m.time}]: {m.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form className="chat-input" onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="메시지를 입력하세요..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit">전송</button>
        </form>
      </main>
    </div>
  );
}