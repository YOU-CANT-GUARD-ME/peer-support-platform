import React, { useState } from "react";
import "../css/sign.css";

export default function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    const handleLogin = (e) => {
        e.preventDefault();
        console.log("Login:", { email, password });
    };


    return (
        <div className="signup-container">
            <form className="signup-box" onSubmit={handleLogin}>
                <h2 className="signup-title">LOGIN</h2>


                <div className="input-group">
                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="이메일 입력"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>


                <div className="input-group">
                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="비밀번호 입력"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>


                <button type="submit" className="signup-btn">로그인</button>
                <Link className='have-accont' to='/signup'>계정이 없으신가요?</Link>
            </form>
        </div>
    );
}