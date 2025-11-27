import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import ProfileIcon from '../assets/profile.jpg';

const socket = io("http://localhost:3001"); // 서버 주소

export default function GroupDetailPage() {
  // 기존 코드 ...
  
  // --------------------
  // 음성채팅 관련 상태
  const [joinedVoice, setJoinedVoice] = useState(false);
  const localAudioRef = useRef();
  const localStreamRef = useRef();
  const peersRef = useRef({}); // peerId -> { pc, audioElem }

  // 방(roomId)을 기존 groupId처럼 사용할 수 있음
  const voiceRoomId = "group-" + "아프지말고햄보카자"; 

  // --------------------
  // 로컬 마이크 스트림 가져오기
  const getLocalAudio = async () => {
    if (!localStreamRef.current) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      if (localAudioRef.current) localAudioRef.current.srcObject = stream;
    }
    return localStreamRef.current;
  };

  // --------------------
  // PeerConnection 생성
  const createPeerConnection = (peerId) => {
    if (peersRef.current[peerId]) return peersRef.current[peerId].pc;

    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { to: peerId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      let audioElem = document.getElementById(`audio-${peerId}`);
      if (!audioElem) {
        audioElem = document.createElement("audio");
        audioElem.id = `audio-${peerId}`;
        audioElem.autoplay = true;
        audioElem.controls = true;
        document.body.appendChild(audioElem);
      }
      audioElem.srcObject = event.streams[0];
    };

    localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
    peersRef.current[peerId] = { pc };
    return pc;
  };

  // --------------------
  // Offer 보내기
  const createOffer = async (peerId) => {
    await getLocalAudio();
    const pc = createPeerConnection(peerId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("offer", { to: peerId, offer });
  };

  // --------------------
  // Voice 채팅 join
  const joinVoiceChat = async () => {
    await getLocalAudio();
    socket.emit("join-room", voiceRoomId);
    setJoinedVoice(true);
  };

  // --------------------
  // Socket 이벤트
  useEffect(() => {
    socket.on("room-users", async (users) => {
      for (const userId of users) {
        await createOffer(userId);
      }
    });

    socket.on("user-joined", async (userId) => {
      console.log("Voice user joined:", userId);
    });

    socket.on("offer", async ({ from, offer }) => {
      await getLocalAudio();
      const pc = createPeerConnection(from);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", { to: from, answer });
    });

    socket.on("answer", async ({ from, answer }) => {
      const pc = peersRef.current[from]?.pc;
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("ice-candidate", ({ from, candidate }) => {
      const pc = peersRef.current[from]?.pc;
      if (pc && candidate) pc.addIceCandidate(candidate);
    });

    socket.on("user-left", (peerId) => {
      const entry = peersRef.current[peerId];
      if (entry) {
        entry.pc.close();
        delete peersRef.current[peerId];
        const audioElem = document.getElementById(`audio-${peerId}`);
        if (audioElem) audioElem.remove();
      }
    });

    return () => {
      socket.off();
    };
  }, []);

  // --------------------
  // 기존 render return 내부 적절 위치에 버튼 추가
  return (
    <div className="group-detail-page">
      {/* 기존 UI 코드 유지 */}
      
      <div style={{ marginTop: "20px" }}>
        <h3>음성채팅</h3>
        {!joinedVoice && <button onClick={joinVoiceChat}>Join Voice Chat</button>}
        <audio ref={localAudioRef} autoPlay muted />
      </div>

      {/* 나머지 기존 게시글/댓글 UI */}
    </div>
  );
}
