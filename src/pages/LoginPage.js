import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/FormLogin";
import axios from "axios";

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/login`,
        {
          email,
          password,
        }
      );

      const { token, user } = response.data;

      // Salva o token e usuário no localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      

      // Redireciona para home
      navigate("/dashboard");
    } catch (error) {
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert("Erro ao conectar com o servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  return <LoginForm onLogin={handleLogin} />;
}

export default LoginPage;
