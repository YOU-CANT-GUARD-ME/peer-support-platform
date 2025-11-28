import React, { useEffect, useRef, useState } from "react";

/**

* VoiceChatPanel
*
* Props:
* * socket (optional): socket.io-client instance. If provided, component will use it.
* * roomId (optional): string room id
* * user (optional): { id: string, name: string, avatar: string }
*
* Behavior:
* * If socket provided: emits "join-room" and "leave-room", listens for "room-users", "user-joined", "user-left".
* * If socket NOT provided: works in mock mode with local sample participants so you can test UI.
*
* Integration notes:
* * Server should emit "room-users" with array of participants: [{ id, name, avatar }]
* * Server should emit "user-joined" with { id, name, avatar }
* * Server should emit "user-left" with id string
* * When user presses leave, component emits "leave-room" (socket) and cleans up local media & pc state.
    */

export default function VoiceChatPanel({ socket = null, roomId = "group-default", user = null }) {
  const defaultUser = user || { id: `u-${Math.random().toString(36).slice(2, 7)}`, name: "익명", avatar: "" };
  const [me] = useState(defaultUser);

  const [joined, setJoined] = useState(false);
  const [participants, setParticipants] = useState([]); // [{id, name, avatar}]
  const [muted, setMuted] = useState(false);

  // local audio stream for mute/unmute
  const localStreamRef = useRef(null);
  const localAudioRef = useRef(null);

  // utility: attach local stream to hidden audio for testing if needed
  useEffect(() => {
    if (localAudioRef.current && localStreamRef.current) {
      localAudioRef.current.srcObject = localStreamRef.current;
    }
  }, [localStreamRef.current]);

  // Mock mode: if no socket, preload some participants for UI testing
  useEffect(() => {
    if (!socket) {
      setParticipants([
        { id: "u-aaa", name: "철수", avatar: "" },
        { id: "u-bbb", name: "영희", avatar: "" },
      ]);
    }
  }, [socket]);

  // join logic: get mic and notify server (or mock update)
  const join = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      if (localAudioRef.current) localAudioRef.current.srcObject = stream;
      setMuted(false);

      if (socket) {
        socket.emit("join-room", { roomId, user: me }); // server expected signature can be adapted
      } else {
        // mock add me
        setParticipants((p) => {
          if (p.find((x) => x.id === me.id)) return p;
          return [...p, me];
        });
      }

      setJoined(true);
    } catch (err) {
      console.error("Mic access denied or failed:", err);
      alert("마이크 접근에 실패했습니다. 권한을 허용하고 다시 시도하세요.");
    }

  };

  // leave logic: stop mic and notify server
  const leave = () => {
    // stop local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    if (socket) {
      socket.emit("leave-room", { roomId, userId: me.id });
    } else {
      setParticipants((p) => p.filter((x) => x.id !== me.id));
    }

    setJoined(false);
    setMuted(false);

  };

  // toggle mute: simply disable/enable local audio tracks
  const toggleMute = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = muted)); // reverse current
    setMuted((m) => !m);
  };

  // socket listeners: room-users, user-joined, user-left
  useEffect(() => {
    if (!socket) return;

    const onRoomUsers = (users) => {
      // expect users: [{id, name, avatar}, ...]
      setParticipants(users || []);
    };

    const onUserJoined = (userObj) => {
      setParticipants((prev) => {
        if (prev.find((p) => p.id === userObj.id)) return prev;
        return [...prev, userObj];
      });
    };

    const onUserLeft = (userId) => {
      setParticipants((prev) => prev.filter((p) => p.id !== userId));
    };

    socket.on("room-users", onRoomUsers);
    socket.on("user-joined", onUserJoined);
    socket.on("user-left", onUserLeft);

    // cleanup
    return () => {
      socket.off("room-users", onRoomUsers);
      socket.off("user-joined", onUserJoined);
      socket.off("user-left", onUserLeft);
    };

  }, [socket, roomId]);

  // small helper for avatar (fallback circle)
  const Avatar = ({ avatar, name, size = 40 }) => {
    const style = {
      width: size,
      height: size,
      borderRadius: "50%",
      background: "#ddd",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 600,
      color: "#444",
      marginRight: 10,
      overflow: "hidden",
    };
    if (avatar) {
      return <img src={avatar} alt={name} style={style} />;
    }
    return <div style={style}>{(name || "?").slice(0, 1)}</div>;
  };

  return (
    <div style={{
      width: 320,
      border: "1px solid #eee",
      borderRadius: 10,
      padding: 12,
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      background: "#fff",
      fontFamily: "system-ui, sans-serif"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>그룹 음성 채팅</div>
          <div style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>{roomId}</div> </div>

        <div>
          {!joined ? (
            <button onClick={join} style={{ padding: "6px 10px", borderRadius: 6, cursor: "pointer" }}>들어가기</button>
          ) : (
            <>
              <button onClick={toggleMute} style={{ marginRight: 8, padding: "6px 10px", borderRadius: 6 }}>
                {muted ? "음소거 해제" : "음소거"}
              </button>
              <button onClick={leave} style={{ padding: "6px 10px", borderRadius: 6, background: "#ff6b6b", color: "#fff" }}>
                나가기
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ fontSize: 13, color: "#333", marginBottom: 8 }}>
        {joined ? "참여중인 멤버" : "아직 참여하지 않았습니다"}
      </div>

      <div style={{ maxHeight: 220, overflowY: "auto" }}>
        {participants.length === 0 ? (
          <div style={{ color: "#777", fontSize: 13 }}>참여자가 없습니다.</div>
        ) : (
          participants.map((p) => (
            <div key={p.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "6px 4px", borderRadius: 6, marginBottom: 6, background: "#fafafa"
            }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Avatar avatar={p.avatar} name={p.name} />
                <div>
                  <div style={{ fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>{p.id === me.id ? "나 (You)" : p.id}</div>
                </div>
              </div>

              {/* Show leave button only for current user row */}
              {p.id === me.id ? (
                <button onClick={leave} style={{ padding: "6px 8px", borderRadius: 6, background: "#ff6b6b", color: "#fff" }}>
                  나가기
                </button>
              ) : null}
            </div>
          ))
        )}
      </div>

      {/* hidden local audio element to keep stream alive in some browsers */}
      <audio ref={localAudioRef} autoPlay muted style={{ display: "none" }} />
    </div>

  );
}
