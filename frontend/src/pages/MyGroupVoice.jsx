import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import "../css/GroupVoice.css";

// Backend URL
const SOCKET_URL = "https://peer-support-platform.onrender.com";

// Use polling fallback for Render
const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],  upgrade: true// websocket first, fallback to polling
});

export default function MyGroupVoice({ roomId, nickname }) {
  const localAudio = useRef(null);
  const [participants, setParticipants] = useState({});
  const [micOn, setMicOn] = useState(true);
  const pcs = useRef({});

  useEffect(() => {
    let localStream;

    const setup = async () => {
      // Get user mic
      localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localAudio.current.srcObject = localStream;

      // Join room
      socket.emit("join-room", { roomId, nickname });

      // Existing users in room
      socket.on("room-users", (users) => {
        const formatted = {};
        users.forEach((u) => {
          formatted[u.id] = u.nickname || "Member";
        });
        setParticipants(formatted);
      });

      // New user joined
      socket.on("user-joined", ({ id, nickname }) => {
        setParticipants((prev) => ({ ...prev, [id]: nickname || "Member" }));
      });

      // User left
      socket.on("user-left", ({ id }) => {
        setParticipants((prev) => {
          const copy = { ...prev };
          delete copy[id];
          return copy;
        });
      });

      // WebRTC signaling
      socket.on("offer", async ({ from, offer }) => {
        const pc = createPeerConnection(from, localStream);
        pcs.current[from] = pc;

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("answer", { to: from, answer });
      });

      socket.on("answer", async ({ from, answer }) => {
        await pcs.current[from]?.setRemoteDescription(new RTCSessionDescription(answer));
      });

      socket.on("ice-candidate", ({ from, candidate }) => {
        pcs.current[from]?.addIceCandidate(new RTCIceCandidate(candidate));
      });
    };

    setup();

    // Cleanup on unmount
    return () => {
      socket.emit("leave-room", { roomId, nickname });
      Object.values(pcs.current).forEach((pc) => pc.close());
      localStream?.getTracks().forEach((track) => track.stop());
    };
  }, [roomId, nickname]);

  // Create peer connection
  const createPeerConnection = (peerId, localStream) => {
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

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { to: peerId, candidate: event.candidate });
      }
    };

    // Send local audio to remote peers
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

    return pc;
  };

  const toggleMic = () => {
    const stream = localAudio.current.srcObject;
    if (stream) {
      stream.getAudioTracks()[0].enabled = !micOn;
      setMicOn(!micOn);
    }
  };

  return (
    <div className="voice-page">
      <div className="voice-sidebar">
        <h3>참여자</h3>
        <div className="voice-participants">
          {Object.entries(participants).map(([id, name]) => (
            <div className="member" key={id}>
              <div className="avatar" />
              <div className="meta">
                <span className="name">{name}</span>
                <span className="role">{id === socket.id ? "You" : "Member"}</span>
              </div>
            </div>
          ))}
        </div>
        <button className="leave-btn" onClick={() => window.location.reload()}>
          나가기
        </button>
      </div>

      <div className="voice-main">
        <h2>그룹 음성 채팅</h2>
        <button className={`mic-btn ${!micOn ? "muted" : ""}`} onClick={toggleMic}>
          {micOn ? "🎤 Mic On" : "🔇 Mic Off"}
        </button>
        <audio ref={localAudio} autoPlay muted />
      </div>
    </div>
  );
}
