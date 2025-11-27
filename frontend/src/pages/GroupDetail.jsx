import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import ProfileIcon from '../assets/profile.jpg';

const socket = io("http://localhost:3001"); // 서버 주소

export default function GroupDetailPage() {
  /* -----------------------------
      음성채팅 관련 상태
  ------------------------------ */
  const [joinedVoice, setJoinedVoice] = useState(false);
  const localAudioRef = useRef();
  const localStreamRef = useRef();
  const peersRef = useRef({}); // peerId -> { pc }

  const voiceRoomId = "group-" + "아프지말고햄보카자";

  /* -----------------------------
      로컬 마이크 가져오기
  ------------------------------ */
  const getLocalAudio = async () => {
    if (!localStreamRef.current) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      if (localAudioRef.current) localAudioRef.current.srcObject = stream;
    }
    return localStreamRef.current;
  };

  /* -----------------------------
      PeerConnection 생성
  ------------------------------ */
  const createPeerConnection = (peerId) => {
    if (peersRef.current[peerId]) return peersRef.current[peerId].pc;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          to: peerId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      let audioElem = document.getElementById(`audio-${peerId}`);
      if (!audioElem) {
        audioElem = document.createElement("audio");
        audioElem.id = `audio-${peerId}`;
        audioElem.autoplay = true;
        document.body.appendChild(audioElem);
      }
      audioElem.srcObject = event.streams[0];
    };

    localStreamRef.current.getTracks().forEach((track) =>
      pc.addTrack(track, localStreamRef.current)
    );

    peersRef.current[peerId] = { pc };
    return pc;
  };

  /* -----------------------------
      Offer 보내기
  ------------------------------ */
  const createOffer = async (peerId) => {
    await getLocalAudio();
    const pc = createPeerConnection(peerId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("offer", { to: peerId, offer });
  };

  /* -----------------------------
      음성채팅 입장
  ------------------------------ */
  const joinVoiceChat = async () => {
    await getLocalAudio();
    socket.emit("join-room", voiceRoomId);
    setJoinedVoice(true);
  };

  /* -----------------------------
      🔥 음성채팅 나가기 추가
  ------------------------------ */
  const leaveVoiceChat = () => {
    socket.emit("leave-room", voiceRoomId);

    // 모든 PeerConnection 종료
    Object.values(peersRef.current).forEach(({ pc }) => pc.close());
    peersRef.current = {};

    // 원격 오디오 요소 삭제
    document.querySelectorAll("audio[id^='audio-']").forEach((el) => el.remove());

    // 내 마이크 종료
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    setJoinedVoice(false);
  };

  /* -----------------------------
      Socket 이벤트 등록
  ------------------------------ */
  useEffect(() => {
    socket.on("room-users", async (users) => {
      for (const userId of users) {
        await createOffer(userId);
      }
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

    return () => socket.off();
  }, []);

  /* -----------------------------
      렌더링 UI
  ------------------------------ */
  return (
    <div className="group-detail-page">
      <h3>음성채팅</h3>

      {/* 음성 버튼 */}
      {!joinedVoice ? (
        <button onClick={joinVoiceChat}>음성채팅 들어가기</button>
      ) : (
        <button onClick={leaveVoiceChat} style={{ background: "red", color: "white" }}>
          음성채팅 나가기
        </button>
      )}

      {/* 내 로컬 오디오 */}
      <audio ref={localAudioRef} autoPlay muted />
    </div>
  );
}


// import React, { useState, useEffect } from "react";
// import '../css/GroupDetail.css';
// import ProfileIcon from '../assets/profile.jpg';

// export default function GroupDetailPage() {
//   const [posts, setPosts] = useState([]);
//   const [isPostModalOpen, setIsPostModalOpen] = useState(false);
//   const [editingPost, setEditingPost] = useState(null);
//   const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
//   const [currentPostId, setCurrentPostId] = useState(null);
//   const [editingComment, setEditingComment] = useState(null);
//   const [title, setTitle] = useState("");
//   const [content, setContent] = useState("");

//   const formatDate = (date) => {
//     const d = new Date(date);
//     const year = d.getFullYear();
//     const month = String(d.getMonth() + 1).padStart(2, "0");
//     const day = String(d.getDate()).padStart(2, "0");
//     return `${year}.${month}.${day}`;
//   };

//   const handleSubmitPost = () => {
//     if (!title.trim() || !content.trim()) return;
//     if (editingPost) {
//       setPosts(posts.map(p => p.id === editingPost.id ? {...p, title, content} : p));
//     } else {
//       setPosts([{ id: Date.now(), title, content, nickname: 'anonymous', date: formatDate(new Date()), comments: [] }, ...posts]);
//     }
//     setTitle("");
//     setContent("");
//     setEditingPost(null);
//     setIsPostModalOpen(false);
//   };

//   const handleDeletePost = (id) => setPosts(posts.filter(p => p.id !== id));

//   const openCommentModal = (postId) => {
//     setCurrentPostId(postId);
//     setIsCommentModalOpen(true);
//   };

//   const handleAddComment = (postId, commentText, editingComment = null) => {
//     if (!commentText.trim()) return;
//     setPosts(posts.map(post => {
//       if (post.id !== postId) return post;
//       if (editingComment) {
//         return { ...post, comments: post.comments.map(c => c.id === editingComment.id ? {...c, text: commentText} : c) };
//       } else {
//         return { ...post, comments: [...post.comments, { id: Date.now(), text: commentText, nickname: 'anonymous', date: formatDate(new Date()) }] };
//       }
//     }));
//   };

//   const handleDeleteComment = (postId, commentId) => {
//     setPosts(posts.map(post => post.id === postId ? {...post, comments: post.comments.filter(c => c.id !== commentId)} : post));
//   };

//   const currentPost = posts.find(p => p.id === currentPostId);

//   return (
//     <div className="group-detail-page">
//       <aside className="group-sidebar">
//         <h2>아프지말고햄보카자</h2>
//         <p>카테고리: 고민상담</p>
//         <p>멤버: 12명</p>
//         <p>고민상담을 합니다</p>
//         <button className="leave-btn">탈퇴</button>
//       </aside>

//       <main className="group-content">
//         <button className="create-post-btn btn" onClick={() => setIsPostModalOpen(true)}>+</button>
//         {posts.map(post => (
//           <div key={post.id} className="group-post">
//             <div className="group-post-header">
//               <img src={ProfileIcon} className="profile-icon" />
//               <strong>{post.nickname}</strong> - <span>{post.date}</span>
//             </div>
//             <h3>{post.title}</h3>
//             <p>{post.content}</p>
//             <div className="group-post-actions">
//               <button onClick={() => {
//                 setEditingPost(post);
//                 setTitle(post.title);
//                 setContent(post.content);
//                 setIsPostModalOpen(true);
//               }}>수정</button>
//               <button onClick={() => handleDeletePost(post.id)}>삭제</button>
//               <button onClick={() => openCommentModal(post.id)}>댓글 ({post.comments.length})</button>
//             </div>
//           </div>
//         ))}
//       </main>

//       {/* 글 작성/수정 모달 */}
//       {isPostModalOpen && (
//         <div className="modal-backdrop" onClick={() => setIsPostModalOpen(false)}>
//           <div className="modal" onClick={(e) => e.stopPropagation()}>
//             <input placeholder="제목" value={title} onChange={e => setTitle(e.target.value)} />
//             <textarea placeholder="내용" value={content} onChange={e => setContent(e.target.value)} />
//             <div className="modal-buttons">
//               <button onClick={() => { setIsPostModalOpen(false); setEditingPost(null); setTitle(""); setContent(""); }}>취소</button>
//               <button onClick={handleSubmitPost}>확인</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* 댓글 모달 */}
//       {isCommentModalOpen && currentPost && (
//         <div className="modal-backdrop" onClick={() => setIsCommentModalOpen(false)}>
//           <div className="modal comment-modal" onClick={(e) => e.stopPropagation()}>
//             <h3>댓글 - {currentPost.title}</h3>
//             <div className="comments-list">
//               {currentPost.comments.map(c => (
//                 <div key={c.id} className="comment">
//                   <strong>{c.nickname}</strong>: {c.text} <span>{c.date}</span>
//                   <div className="comment-actions">
//                     <button onClick={() => setEditingComment(c)}>수정</button>
//                     <button onClick={() => handleDeleteComment(currentPost.id, c.id)}>삭제</button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <CommentInput
//               postId={currentPost.id}
//               onAddComment={handleAddComment}
//               editingComment={editingComment}
//               setEditingComment={setEditingComment}
//             />
//             <div className="modal-buttons">
//               <button onClick={() => { setIsCommentModalOpen(false); setEditingComment(null); }}>닫기</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// function CommentInput({ postId, onAddComment, editingComment, setEditingComment }) {
//   const [commentText, setCommentText] = useState("");

//   useEffect(() => {
//     if (editingComment) setCommentText(editingComment.text);
//   }, [editingComment]);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onAddComment(postId, commentText, editingComment);
//     setCommentText("");
//     setEditingComment(null);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="comment-form">
//       <input
//         type="text"
//         placeholder="댓글 작성..."
//         value={commentText}
//         onChange={(e) => setCommentText(e.target.value)}
//       />
//       <button type="submit">{editingComment ? "수정" : "등록"}</button>
//     </form>
//   );
// }

