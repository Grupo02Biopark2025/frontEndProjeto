import React from "react";
import "../styles/Sidebar.css";

function Sidebar({ isOpen, toggleSidebar }) {
  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <button className="toggle-button" onClick={toggleSidebar}>
          {isOpen ? "←" : "☰"}
        </button>
        <div className="logo-container">
          <img src="/logo.png" alt="CorpSync Logo" className="logo" />
          {isOpen && <h2 className="sidebar-title">CorpSync</h2>}
        </div>
      </div>
      {isOpen && (
        <>
          <ul className="menu">
            <li>Dashboard</li>
            <li>Dispositivos</li>
            <li>Histórico</li>
            <li>Configurações</li>
          </ul>
          <div className="sidebar-footer">
            <ul>
              <li>Perfil</li>
              <li>Sair</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default Sidebar;