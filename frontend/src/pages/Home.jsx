import { useState } from "react";
import "../index.css"; // assuming your CSS is in src/index.css

export default function Home() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <section className="hero">
        <h1>A Safe Space for Teens to Talk</h1>
        <div className="hero-buttons">
          <button>Start Now</button>
          <button>Learn More</button>
        </div>
      </section>

      <section className="features">
        <div className="card">Anonymous Forum</div>
        <div className="card">Peer Mentors</div>
        <div className="card">Safe Chat</div>
      </section>

      <footer className="footer">
        <a href="#">Help</a>
        <a href="#">Terms</a>
        <a href="#">Privacy</a>
        <a href="#">Crisis Hotline</a>
      </footer>
    </div>
  );
}
