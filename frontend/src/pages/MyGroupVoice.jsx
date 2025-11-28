import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import "../css/GroupVoice.css";

const SOCKET_URL = "[https://digitech-recovery-center.onrender.com](https://digitech-recovery-center.onrender.com)";
const socket = io(SOCKET_URL);

export default function MyGroupVoice({ roomId, nickname }) {
const localAudio = useRef(null);
const pcs = useRef({});
const localStreamRef = useRef(null);
const [participants, setParticipants] = useState({});
const [micOn, setMicOn] = useState(true);

useEffect(() => {
const setup = async () => {
await startLocalStream();

  socket.emit("join-room", { roomId, nickname });

  socket.on("room-users", (users) => {
    const list = {};
    users.forEach((u) => {  list[u.id] = u.nickname; });
    setParticipants(list);
  });

  socket.on("user-joined", ({ id, nickname }) => {
    setParticipants((prev) => ({ ...prev, [id]: nickname }));
  });

  socket.on("user-left", ({ id }) => {
    setParticipants((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  });

  // WebRTC signaling
  socket.on("offer", async ({ from, offer }) => {
    const pc = createPeerConnection(from);
    pcs.current[from] = pc;
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit("answer", { to: from, answer });
  });

  socket.on("answer", async ({ from, answer }) => {
    await pcs.current[from].setRemoteDescription(new RTCSessionDescription(answer));
  });

  socket.on("ice-candidate", ({ from, candidate }) => {
    pcs.current[from]?.addIceCandidate(new RTCIceCandidate(candidate));
  });
};

const startLocalStream = async () => {
  localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
  localAudio.current.srcObject = localStreamRef.current;
};

const createPeerConnection = (peerId) => {
  const pc = new RTCPeerConnection();
  pc.ontrack = (event) => {
    let audioEl = document.getElementById(`audio-${peerId}`);
    if (!audioEl) {
      audioEl = document.createElement("audio");
      audioEl.id = `audio-${peerId}`;
      audioEl.autoplay = true;
      document.body.appendChild(audioEl);
    }
    audioEl.srcObject = event.streams[0];
  };
  pc.onicecandidate = (e) => {
    if (e.candidate) socket.emit("ice-candidate", { to: peerId, candidate: e.candidate });
  };

  if (localStreamRef.current) {
    localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
  }
  return pc;
};

setup();

return () => {
  socket.emit("leave-room", roomId);
  socket.disconnect();
  Object.values(pcs.current).forEach(pc => pc.close());
  localStreamRef.current?.getTracks().forEach(t => t.stop());
};

}, [nickname, roomId]);

const toggleMic = async () => {
if (micOn) {
// 마이크 완전히 끄기
localStreamRef.current?.getTracks().forEach(t => t.stop());
localStreamRef.current = null;

  // PeerConnection에서 기존 오디오 트랙 제거
  Object.values(pcs.current).forEach(pc => {
    pc.getSenders().forEach(sender => {
      if (sender.track && sender.track.kind === "audio") pc.removeTrack(sender);
    });
  });
  setMicOn(false);
} else {
  // 마이크 다시 켜기
  localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
  localAudio.current.srcObject = localStreamRef.current;

  // 새 트랙을 각 PeerConnection에 추가
  Object.values(pcs.current).forEach(pc => {
    localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
  });
  setMicOn(true);
}

};

return ( <div className="voice-page"> <div className="voice-sidebar"> <h3>참여자</h3> <div className="voice-participants">
{Object.entries(participants).map(([id, name]) => ( <div className="member" key={id}> <div className="avatar" /> <div className="meta"> <span className="name">{name}</span> <span className="role">{id === socket.id ? "You" : "Member"}</span> </div>
{!micOn && id === socket.id && <span className="muted">Muted</span>} </div>
))} </div>
<button className="leave-btn" onClick={() => window.location.reload()}>나가기</button> </div>

  <div className="voice-main">
    <h2 className="title">그룹 음성 채팅</h2>
    <div className="voice-controls">
      <button className={`mic-btn ${!micOn ? "off" : ""}`} onClick={toggleMic}>
        {micOn ? "🎤 On" : "🎤 Off"}
      </button>
    </div>
    <audio ref={localAudio} autoPlay muted />
  </div>
</div>

);
}
