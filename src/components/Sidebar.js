import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu, X, BarChart3, Smartphone, Users, Settings,
  User, LogOut, ChevronRight
} from "lucide-react";
import "../styles/Sidebar.css";

function Sidebar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const menuItems = [
    {
      path: "/dashboard",
      icon: BarChart3,
      label: "Dashboard",
      active: location.pathname === "/dashboard"
    },
    {
      path: "/devices",
      icon: Smartphone,
      label: "Dispositivos",
      active: location.pathname.startsWith("/devices")
    },
    {
      path: "/users",
      icon: Users,
      label: "Usuários",
      active: location.pathname.startsWith("/users")
    },
    {
      path: "/settings",
      icon: Settings,
      label: "Configurações",
      active: location.pathname === "/settings"
    }
  ];

  const footerItems = [
    {
      icon: User,
      label: "Perfil",
      action: () => navigate("/profile")
    },
    {
      icon: LogOut,
      label: "Sair",
      action: handleLogout,
      danger: true
    }
  ];

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      {/* Header */}
      <div className="sidebar-header">
        <button className="toggle-button" onClick={toggleSidebar}>
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        
        <div className="logo-container">
          <div className="logo-wrapper">
            <img src="./logo.png" alt="CorpSync Logo" className="logo" />
          </div>
          {isOpen && (
            <div className="brand-text">
              <Link to="/dashboard" className="brand-link">
                <span className="brand-name">CorpSync</span>
                <span className="brand-subtitle">Sistema de Gestão</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <ul className="menu">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.path} className={`menu-item ${item.active ? 'active' : ''}`}>
                <Link to={item.path} className="menu-link">
                  <div className="menu-icon">
                    <IconComponent size={20} />
                  </div>
                  {isOpen && (
                    <>
                      <span className="menu-label">{item.label}</span>
                      <ChevronRight className="menu-arrow" size={16} />
                    </>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      {isOpen && (
        <div className="sidebar-footer">
          <div className="footer-divider"></div>
          <ul className="footer-menu">
            {footerItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <li 
                  key={index} 
                  className={`footer-item ${item.danger ? 'danger' : ''}`}
                  onClick={item.action}
                >
                  <div className="footer-icon">
                    <IconComponent size={18} />
                  </div>
                  <span className="footer-label">{item.label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Collapsed Footer */}
      {!isOpen && (
        <div className="sidebar-footer-collapsed">
          {footerItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <button
                key={index}
                className={`footer-icon-btn ${item.danger ? 'danger' : ''}`}
                onClick={item.action}
                title={item.label}
              >
                <IconComponent size={18} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Sidebar;