import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw, AlertTriangle, Users, UserPlus, Key, CheckCircle,
  Mail, ArrowRight, Plus, User, Shield
} from "lucide-react";
import "../styles/UserList.css";

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:4040/api/users');
      
      if (response.ok) {
        const data = await response.json();
        console.log('Usuários recebidos:', data);
        setUsers(data || []);
      } else {
        throw new Error('Falha ao carregar usuários');
      }
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchUsers();
  };

  const navigateToAddUser = () => {
    navigate('/users/add');
  };

  const navigateToUserDetail = (user) => {
    navigate(`/users/${user.id}`, { state: { user } });
  };

  // Funções auxiliares
  const getInitials = (name) => {
    if (!name) return 'U';
    
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    } else {
      return parts[0].substring(0, Math.min(parts[0].length, 2)).toUpperCase();
    }
  };

  const getAvatarColor = (index) => {
    const colors = [
      '#2a9d8f',
      '#3b82f6',
      '#8b5cf6',
      '#f97316',
      '#14b8a6',
      '#6366f1',
    ];
    return colors[index % colors.length];
  };

  // Calcular estatísticas
  const calculateStats = () => {
    const totalUsers = users.length;
    const adminUsers = users.filter(user => user.isAdmin === true).length;
    const activeUsers = users.filter(user => user.name && user.name.trim() !== '').length;
    
    return { totalUsers, adminUsers, activeUsers };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="user-list-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Carregando usuários...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-list-container">
        <div className="error-state">
          <div className="error-icon">
            <AlertTriangle size={64} />
          </div>
          <h3>Erro ao carregar usuários</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={refreshData}>
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-list-container">
      {/* Header */}
      <div className="user-header">
        <div className="header-content">
          <div className="header-top">
            <h1 className="page-title">Usuários</h1>
            <button className="refresh-button" onClick={refreshData}>
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="users-content">
        {users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Users size={64} />
            </div>
            <h3>Nenhum usuário encontrado</h3>
            <p>Adicione o primeiro usuário ao sistema</p>
            <button className="add-user-btn" onClick={navigateToAddUser}>
              <UserPlus size={18} />
              Adicionar Usuário
            </button>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="stats-section">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon-container" style={{ backgroundColor: 'rgba(42, 157, 143, 0.1)' }}>
                    <Users size={24} style={{ color: '#2a9d8f' }} />
                  </div>
                  <div className="stat-info">
                    <div className="stat-value" style={{ color: '#2a9d8f' }}>
                      {stats.totalUsers}
                    </div>
                    <div className="stat-label">Total</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon-container" style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)' }}>
                    <Shield size={24} style={{ color: '#f97316' }} />
                  </div>
                  <div className="stat-info">
                    <div className="stat-value" style={{ color: '#f97316' }}>
                      {stats.adminUsers}
                    </div>
                    <div className="stat-label">Admins</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon-container" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                    <CheckCircle size={24} style={{ color: '#3b82f6' }} />
                  </div>
                  <div className="stat-info">
                    <div className="stat-value" style={{ color: '#3b82f6' }}>
                      {stats.activeUsers}
                    </div>
                    <div className="stat-label">Ativos</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Users List */}
            <div className="users-list">
              {users.map((user, index) => {
                const initials = getInitials(user.name);
                const avatarColor = getAvatarColor(index);
                const isAdmin = user.isAdmin === true;

                return (
                  <div
                    key={user.id}
                    className="user-card"
                    onClick={() => navigateToUserDetail(user)}
                  >
                    <div className="user-card-content">
                      {/* Avatar */}
                      <div className="user-avatar">
                        {user.profileImage ? (
                          <img
                            src={`data:image/jpeg;base64,${user.profileImage}`}
                            alt={user.name}
                            className="avatar-image"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="avatar-initials"
                          style={{ 
                            backgroundColor: `${avatarColor}20`,
                            color: avatarColor,
                            display: user.profileImage ? 'none' : 'flex'
                          }}
                        >
                          {initials}
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="user-info">
                        <div className="user-header-row">
                          <h3 className="user-name">{user.name || "Usuário"}</h3>
                          {isAdmin && (
                            <div className="admin-badge">
                              <Shield size={12} />
                              <span className="admin-text">Admin</span>
                            </div>
                          )}
                        </div>

                        <div className="user-email">
                          <Mail size={16} />
                          <span className="email-text">
                            {user.email || "email@exemplo.com"}
                          </span>
                        </div>

                        <div className="user-footer">
                          <div className="status-badge active">
                            <div className="status-dot"></div>
                            <span>Ativo</span>
                          </div>
                          <span className="user-id">ID: {user.id || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="arrow-icon">
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Floating Action Button */}
      {users.length > 0 && (
        <button className="fab" onClick={navigateToAddUser}>
          <Plus size={24} />
        </button>
      )}
    </div>
  );
}

export default UserList;