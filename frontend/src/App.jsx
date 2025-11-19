import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Community from "./pages/Community";
import SignUp from "./pages/Signup";
import SignIn from "./pages/signIn";
import Group from "./pages/Group";
import GroupDetail from "./pages/GroupDetail";
import Diary from "./pages/Diary";

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/community" element={<Community />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/group" element={<Group />} />
        <Route path="/group-detail" element={<GroupDetail />} />
        <Route path="/diary" element={<Diary />} />
      </Routes>
    </Router>
  );
}
