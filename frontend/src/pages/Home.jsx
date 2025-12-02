import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "../css/Home.css";

const MotionLink = motion(Link);

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay }
  })
};

const fade = {
  hidden: { opacity: 0 },
  visible: (delay = 0) => ({
    opacity: 1,
    transition: { duration: 0.8, delay }
  })
};

export default function Home() {
  return (
    <div className="landing-page">
      <section className="hero">
        <motion.h1 className="hero-title" variants={fadeUp} initial="hidden" animate="visible" custom={0}>
          Welcome to Your Safe Space
        </motion.h1>

        <motion.p className="hero-subtitle" variants={fadeUp} initial="hidden" animate="visible" custom={0.3}>
          지친 마음이 잠시 쉬어갈 수 있는 디지털 회복 공간, DRC.
        </motion.p>

        <motion.div className="hero-buttons" variants={fade} initial="hidden" animate="visible" custom={0.6}>
          <MotionLink to="/community" className="primary-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            Get Started
          </MotionLink>
        </motion.div>
      </section>

      <div className="introduce">
        <motion.p className="title" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}>
          DRC Introduce
        </motion.p>

        <div className="intro-box-container">
          <motion.div className="intro-box glass-card" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0.2}>
            <h3>DRC란?</h3>
            <p>
              Digetch Recovery Center의 줄임말로, 디지털 환경 속에서 지친 사람들에게 안전한 회복 공간을 제공하는 온라인 커뮤니티입니다.
              <br /> 사용자는 고민을 나누고, 경험을 공유하며, 서로에게 실질적인 도움을 줄 수 있는 다양한 그룹에 참여할 수 있습니다.
              <br /> DRC는 단순한 커뮤니티를 넘어, 각자의 속도에 맞춰 회복하고 성장할 수 있도록 돕는 맞춤형 소셜 플랫폼을 목표로 합니다.
            </p>
          </motion.div>

          <motion.div className="intro-box glass-card" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0.4}>
            <h3>이런 분들에게 추천드려요</h3>
            <ul>
              <li>학교·직장 등 가까운 관계에서는 말하기 어려운 고민을 가지고 있는 분</li>
              <li>비슷한 경험을 가진 사람들과 공감하고 교류하고 싶은 분</li>
              <li>소규모 그룹에서 안전하게 대화를 나누고 싶은 분</li>
              <li>규칙 있는 커뮤니티에서 존중 기반의 상호작용을 원하시는 분</li>
            </ul>
          </motion.div>

          <motion.div className="intro-box glass-card" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0.6}>
            <h3>DRC의 핵심 가치</h3>
            <p>
              DRC는 ‘안전한 온라인 회복 공간’을 목표로, 익명성과 존중을 기반으로 운영됩니다.
              <br /> 사용자가 있는 그대로 머물 수 있도록 돕고, 서로의 이야기를 통해 건강한 지지와 성장을 만들어가는 환경을 지향합니다.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="functions">
        <motion.p className="title" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}>
          DRC Functions
        </motion.p>

        <div className="grid-box">
          {[
            { title: "커뮤니티", desc: "고민과 정보를 자유롭게 공유하는 열린 소통 공간" },
            { title: "그룹 커뮤니티", desc: "관심사별 소규모 그룹을 만들어 함께 대화하는 공간" },
            { title: "다이어리", desc: "하루의 감정과 생각을 기록하는 개인 일기장" },
            { title: "상담 신청", desc: "상담 동아리 또는 상담자에게 온라인 상담을 요청하는 기능" }
          ].map((f, i) => (
            <motion.div
              className="function glass-card"
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i * 0.2}
              whileHover={{ scale: 1.03 }}
            >
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="why">
        <motion.h3 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}>
          Why DRC?
        </motion.h3>

        <div className="why-box">
          {[
            "익명 기반 안전한 환경",
            "신고·차단·필터링 시스템",
            "전문가 가이드 기반 운영",
            "심리적 부담 없이 접근 가능한 UI"
          ].map((text, i) => (
            <motion.div
              className="w-box glass-card"
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i * 0.2}
              whileHover={{ scale: 1.05 }}
            >
              <p>{text}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div className="footer" variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}>
        <p>DRC의 상담 기능은 전문 의료 서비스를 대체하지 않습니다. 긴급한 도움이 필요하다면 가까운 상담센터 또는 도움 기관에 연락하세요.</p>

        <div className="ft-box">
          <p>Developer: 폴 해리슨, 박시후</p>
          <p>Designer: 허지애</p>
        </div>

        <p>GitHub: github.com/YOU-CANT-GUARD-ME/peer-support-platform</p>
        <p>© 2025 Digetch Recovery Center. All rights reserved.</p>
      </motion.div>
    </div>
  );
}