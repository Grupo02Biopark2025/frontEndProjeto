import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/FormLogin.css";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/request-reset`, { email });
      localStorage.setItem("resetEmail", email);
      alert("Código enviado para seu e-mail.");
      navigate("/verify-code");
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao solicitar redefinição.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src="/logo.png" alt="CorpSync Logo" className="logo" />
        <h1>Redefinir Senha</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">Enviar código</button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
