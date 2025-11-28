import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import '../css/GroupChat.css'

const socket = io("https://digitech-recovery-center.onrender.com"); // socket 서버 주소

export default function MyGroupChat() {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    socket.emit("join_group_chat");

    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off("receive_message");
  }, []);

  const sendMessage = () => {
    if (!msg.trim()) return;

    socket.emit("send_message", msg);
    setMsg("");
  };

  return (
    <div className="chat-page">
      <h2>그룹 채팅방</h2>

      <div className="chat-window">
        {messages.map((m, i) => (
          <p key={i}>{m}</p>
        ))}
      </div>

      <div className="chat-input">
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="메시지를 입력하세요..."
        />
        <button onClick={sendMessage}>전송</button>
      </div>
    </div>
  );
}