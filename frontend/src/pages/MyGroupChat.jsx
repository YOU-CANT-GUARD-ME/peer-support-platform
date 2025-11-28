import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import "../css/GroupChat.css";
import ProfileIcon from "../assets/profile.jpg";

const socket = io("https://digitech-recovery-center.onrender.com"); // 서버 URL

export default function MyGroupChat({ nickname, roomId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    // 방 입장
    socket.emit("join-room", roomId);

    // 기존 참가자 목록 받기
    socket.on("room-users", (users) => {
      setParticipants(users);
    });

    // 새 메시지 수신
    socket.on("chat-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // 사용자 입장/퇴장
    socket.on("user-joined", (userId) => {
      setParticipants((prev) => [...prev, userId]);
    });
    socket.on("user-left", (userId) => {
      setParticipants((prev) => prev.filter((id) => id !== userId));
    });

    return () => {
      socket.emit("leave-room", roomId);
      socket.off();
    };
  }, [roomId]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const msg = { text: input, nickname };
    socket.emit("chat-message", { roomId, message: msg });
    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  return (
    <div className="chat-page">
      <aside className="chat-sidebar">
        <h3>참여자</h3>
        <div className="chat-participants">
          {participants.map((p, idx) => (
            <div key={idx} className="participant">
              <img src={ProfileIcon} alt="avatar" className="avatar" />
              <span className="name">{p}</span>
            </div>
          ))}
        </div>
      </aside>

      <main className="chat-main">
        <div className="messages">
          {messages.map((m, idx) => (
            <div key={idx} className="message">
              <strong>{m.nickname}</strong>: {m.text}
            </div>
          ))}
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
