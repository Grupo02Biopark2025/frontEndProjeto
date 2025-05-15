import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
    <div className="form-container">
      <h2>Verificar Código</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Digite o código recebido"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <button type="submit">Verificar</button>
      </form>
    </div>
  );
}

export default VerifyCodePage;
