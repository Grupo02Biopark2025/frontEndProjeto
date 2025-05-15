import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
    <div className="form-container">
      <h2>Esqueci minha senha</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Digite seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Enviar código</button>
      </form>
    </div>
  );
}

export default ForgotPasswordPage;
