import React, { useState, useEffect } from "react";
import "../css/MyGroup.css";
import ProfileIcon from "../assets/profile.jpg";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function MyGroup() {
  const navigate = useNavigate();
  const { groupId } = useParams();

  const API_URL = import.meta.env.VITE_APP_API_URL;

  const [nickname, setNickname] = useState("");
  const [tempNickname, setTempNickname] = useState("");
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(true);

  const [groupInfo, setGroupInfo] = useState(null);
  const [members, setMembers] = useState([]);

  // --------------------------
  // 1) 그룹 정보 불러오기
  // --------------------------
  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/groups/${groupId}`, { withCredentials: true });
        setGroupInfo(res.data);

        // 서버에서 멤버 목록 가져오기 (예: group.members 배열)
        setMembers(res.data.members || []);

        // 이미 가입했으면 닉네임 모달 안 열기
        if (res.data.userNickname) {
          setNickname(res.data.userNickname);
          setIsNicknameModalOpen(false);
        }
      } catch (err) {
        console.error("그룹 정보를 불러오지 못했습니다:", err);
      }
    };
    fetchGroup();
  }, [groupId]);

  // --------------------------
  // 2) 닉네임 설정 및 그룹 참여
  // --------------------------
  const handleSetNickname = async () => {
    const nicknameTrimmed = tempNickname.trim();
    if (!nicknameTrimmed) return;

    try {
      const res = await axios.post(
        `${API_URL}/api/groups/${groupId}/join`,
        { nickname: nicknameTrimmed },
        { withCredentials: true }
      );

      setNickname(nicknameTrimmed);

      // 서버에서 반환한 멤버 정보 업데이트
      if (res.data.group) {
        setMembers(res.data.group.membersList || []);
        setGroupInfo(prev => ({
          ...prev,
          members: res.data.group.membersCount || res.data.group.members || 1,
        }));
      }

      setIsNicknameModalOpen(false);
    } catch (err) {
      console.error("그룹 참여 실패:", err);
      alert(err.response?.data?.message || "그룹 참여에 실패했습니다.");
    }
  };

  // --------------------------
  // 3) 그룹 탈퇴
  // --------------------------
  const handleLeaveGroup = async () => {
    if (!window.confirm("정말 그룹에서 탈퇴하시겠습니까?")) return;

    try {
      await axios.post(`${API_URL}/api/groups/${groupId}/leave`, {}, { withCredentials: true });
      alert("그룹에서 탈퇴했습니다.");
      navigate("/groups"); // 그룹 목록 페이지로 이동
    } catch (err) {
      console.error("그룹 탈퇴 실패:", err);
      alert(err.response?.data?.message || "그룹 탈퇴에 실패했습니다.");
    }
  };

  if (!groupInfo) return <div>로딩중...</div>;

  return (
    <div className="group-page-container">
      {/* 닉네임 모달 */}
      {isNicknameModalOpen && (
        <div className="modal-backdrop">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>그룹에 입장하려면 닉네임을 설정하세요</h3>
            <input
              placeholder="닉네임 입력"
              value={tempNickname}
              onChange={(e) => setTempNickname(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={handleSetNickname}>확인</button>
            </div>
          </div>
        </div>
      )}

      {/* 왼쪽 사이드바 */}
      <aside className="group-sidebar">
        <h2>{groupInfo.name}</h2>
        <p>카테고리: {groupInfo.category}</p>
        <p>멤버: {members.length}명</p>
        <p>내 닉네임: {nickname || "설정 필요"}</p>
        <p>{groupInfo.desc}</p>
        <button className="leave-btn" onClick={handleLeaveGroup}>탈퇴</button>
      </aside>

      {/* 메인 영역 */}
      <main className="group-content">
        <h2>마이 그룹 페이지</h2>
        <div className="mygroup-actions">
          <button
            className="goto-chat btn"
            disabled={!nickname}
            onClick={() =>
              navigate(`/my-group/chat/${groupId}?nickname=${nickname}`)
            }
          >
            채팅방 가기
          </button>
        </div>
      </main>

      {/* 멤버 목록 */}
      <aside className="member-sidebar">
        <h3>멤버 목록</h3>
        <div className="member-list">
          {members.map((m, idx) => (
            <div key={idx} className="member-item">
              <img src={ProfileIcon} className="member-profile" />
              <span>{m.nickname || m.name}</span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
