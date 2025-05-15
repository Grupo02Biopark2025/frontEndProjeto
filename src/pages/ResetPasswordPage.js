import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/FormLogin.css";

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const email = localStorage.getItem("resetEmail");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/reset-password`, { email, password });
      alert("Senha redefinida com sucesso.");
      localStorage.removeItem("resetEmail");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao redefinir senha.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src="/logo.png" alt="CorpSync Logo" className="logo" />
        <h1>Nova Senha</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="password">Nova Senha</label>
            <input
              type="password"
              id="password"
              placeholder="Digite sua nova senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">Redefinir</button>
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
