import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
    <div className="form-container">
      <h2>Nova Senha</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Nova senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Redefinir senha</button>
      </form>
    </div>
  );
}

export default ResetPasswordPage;
