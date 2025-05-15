import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/FormLogin.css";

function VerifyCodePage() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();
  const email = localStorage.getItem("resetEmail");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/verify-code`, { email, code });
      navigate("/reset-password");
    } catch (err) {
      alert(err.response?.data?.error || "Código inválido ou expirado.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src="/logo.png" alt="CorpSync Logo" className="logo" />
        <h1>Verificar Código</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="code">Código</label>
            <input
              type="text"
              id="code"
              placeholder="Digite o código"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">Verificar</button>
        </form>
      </div>
    </div>
  );
}

export default VerifyCodePage;
