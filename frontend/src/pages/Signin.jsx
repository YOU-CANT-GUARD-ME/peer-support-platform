import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/sign.css";

export default function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();
        console.log("Login:", { email, password });
    };

    return (
        <div className="sign-container">
            <form className="signup-box" onSubmit={handleLogin}>
                <h2 className="signup-title">Sign In</h2>

                <div className="input-group">
                    <label>이메일</label>
                    <input
                        type="email"
                        placeholder="example@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <label>비밀번호</label>
                    <input
                        type="password"
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button type="submit" className="signup-btn">로그인</button>
                <Link className='have-account' to='/signup'>계정이 없으신가요?</Link>
            </form>
        </div>
    );
}