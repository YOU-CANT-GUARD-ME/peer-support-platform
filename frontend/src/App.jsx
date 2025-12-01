import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

<<<<<<< HEAD

// 기존 페이지들
import { ThemeProvider } from "./contexts/ThemeContext";
import { UserProvider } from "./contexts/UserContext";

import DarkMode from "./components/DarkMode";
import Navbar from "./components/Navbar";

=======
// Context
import { ThemeProvider } from "./contexts/ThemeContext";
import { UserProvider } from "./contexts/UserContext";

// Components
import DarkMode from "./components/DarkMode";
import Navbar from "./components/Navbar";

// Pages
>>>>>>> origin/main
import Home from "./pages/Home";
import Community from "./pages/Community";
import SignUp from "./pages/Signup";
import SignIn from "./pages/Signin";
import Group from "./pages/Group";
import MyGroup from "./pages/MyGroup";
import Diary from "./pages/Diary";
import Counsel from "./pages/Counsel";
import MyGroupChat from "./pages/MyGroupChat";
// import MyGroupVoicePage from "./pages/MyGroupVoice";

import './DarkMode.css'

export default function App() {
<<<<<<< HEAD
  return (
    <ThemeProvider>
      <UserProvider>
        <DarkMode>
          <Router>
            <Navbar />
            <Routes>
              {/* 메인 */}
              <Route path="/" element={<Home />} />

              {/* 커뮤니티 */}
              <Route path="/community" element={<Community />} />

              {/* 회원가입 / 로그인 */}
              <Route path="/signup" element={<SignUp />} />
              <Route path="/signin" element={<SignIn />} />

              {/* 🔹 그룹 관련 */}
              {/* 가입 전: 그룹 목록 */}
              <Route path="/group" element={<Group />} />

              {/* 가입 후: 마이 그룹 */}
              <Route path="/my-group" element={<MyGroup />} />

              {/* 🔹 마이그룹 > 텍스트 채팅 */}
              <Route path="/my-group/chat" element={<MyGroupChat />} />

              {/* 🔹 마이그룹 > 음성 채팅 */}
              {/* <Route path="/my-group/voice" element={<MyGroupVoicePage />} /> */}

              {/* 다이어리 / 상담 */}
              <Route path="/diary" element={<Diary />} />
              <Route path="/counsel" element={<Counsel />} />
            </Routes>
          </Router>
        </DarkMode>
      </UserProvider>
    </ThemeProvider>
  );
=======
return ( <ThemeProvider> <UserProvider> <DarkMode> <Router> <Navbar /> <Routes>
{/* 메인 */}
<Route path="/" element={<Home />} />

          {/* 커뮤니티 */}
          <Route path="/community" element={<Community />} />

          {/* 회원가입 / 로그인 */}
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />

          {/* 🔹 그룹 관련 */}
          {/* 그룹 목록 페이지 */}
          <Route path="/group" element={<Group />} />

          {/* 그룹 상세 페이지 (가입 전/후) */}
          <Route path="/my-group/:groupId" element={<MyGroup />} />

          {/* 마이그룹 > 텍스트 채팅 */}
          <Route path="/my-group/chat/:groupId" element={<MyGroupChat />} />

          {/* 마이그룹 > 음성 채팅 */}
          {/* <Route path="/my-group/voice/:groupId" element={<MyGroupVoicePage />} /> */}

          {/* 다이어리 / 상담 */}
          <Route path="/diary" element={<Diary />} />
          <Route path="/counsel" element={<Counsel />} />
        </Routes>
      </Router>
    </DarkMode>
  </UserProvider>
</ThemeProvider>

);
>>>>>>> origin/main
}
