import React from "react";
import "../styles/Sidebar.css";
import { Link, useNavigate } from "react-router-dom";

function Sidebar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <button className="toggle-button" onClick={toggleSidebar}>
          {isOpen ? "←" : "☰"}
        </button>
        <div className="logo-container">
          <img src="/logo.png" alt="CorpSync Logo" className="logo" />
          {isOpen && (
            <li className="sidebar-title">
              <Link to="/home">CorpSync</Link>
            </li>
          )}
        </div>
      </div>
      {isOpen && (
        <>
          <ul className="menu">
            <li>Dashboard</li>
            <li><Link to="/devices">Dispositivos</Link></li>
            <li>Histórico</li>
            <li>Configurações</li>
          </ul>
          <div className="sidebar-footer">
            <ul>
              <li>Perfil</li>
              <li onClick={handleLogout} style={{ cursor: "pointer" }}>
                Sair
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default Sidebar;
