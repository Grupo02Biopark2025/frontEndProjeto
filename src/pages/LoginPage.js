import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/FormLogin.js";

function LoginPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (email, password) => {
    if (email === "admin@corpsync.com" && password === "123456") {
      setIsAuthenticated(true);
      navigate("/home");
    } else {
      alert("Credenciais inválidas!");
    }
  };

  return <LoginForm onLogin={handleLogin} />;
}

export default LoginPage;