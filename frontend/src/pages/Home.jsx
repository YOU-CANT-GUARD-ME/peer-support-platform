import React from "react";
import { motion } from "framer-motion";
import "../css/Home.css";

export default function Home() {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          Welcome to Your Safe Space
        </motion.h1>
        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        >
          Connect, share, and find support whenever you need it.
        </motion.p>
        <motion.div
          className="hero-buttons"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <button className="primary-btn">Get Started</button>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="features">
        <motion.div
          className="feature-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Anonymous Forums
        </motion.div>
        <motion.div
          className="feature-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Peer Mentorship
        </motion.div>
        <motion.div
          className="feature-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Safe Chat Rooms
        </motion.div>
      </section>
    </div>
  );
}
