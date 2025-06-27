import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft, Edit, MoreVertical, RefreshCw, Trash2, AlertTriangle,
  User, Mail, Hash, CheckCircle, Shield, Lock, LogIn, Clock,
  Camera, MousePointer, Calendar, Key, Eye, EyeOff
} from "lucide-react";
import "../styles/UserDetailPage.css";

function UserDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const userFromState = location.state?.user;
  
  const [user, setUser] = useState(userFromState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (!user && id) {
      fetchUserDetails(id);
    } else if (user?.id && user.id.toString() !== id) {
      fetchUserDetails(id);
    }
  }, [user, id]);

  const fetchUserDetails = async (userId) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Buscando detalhes do usuário:', userId);
      const response = await fetch(`http://localhost:4040/api/users/${userId}`);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('Usuário recebido:', userData);
        setUser(userData);
      } else {
        throw new Error('Usuário não encontrado');
      }
    } catch (err) {
      console.error('Erro ao buscar usuário:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    if (user?.id || id) {
      fetchUserDetails(user?.id || id);
    }
  };

  const handleEdit = () => {
    navigate(`/users/${user.id}/edit`, { state: { user } });
  };

  const handleDelete = async () => {
    if (!user?.id) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`http://localhost:4040/api/users/${user.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Usuário excluído com sucesso');
        navigate('/users');
      } else {
        throw new Error('Erro ao excluir usuário');
      }
    } catch (err) {
      console.error('Erro ao excluir usuário:', err);
      alert('Erro ao excluir usuário: ' + err.message);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
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

  const isAdmin = (email) => {
    return email?.toLowerCase().includes('admin') || user?.isAdmin === true;
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    
    try {
      const date = new Date(dateTimeString);
      const now = new Date();
      const difference = now - date;
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      
      if (days === 0) {
        return `Hoje às ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      } else if (days === 1) {
        return `Ontem às ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      } else if (days < 7) {
        return `Há ${days} dias`;
      } else if (days < 30) {
        const weeks = Math.floor(days / 7);
        return `Há ${weeks} semana${weeks > 1 ? 's' : ''}`;
      } else if (days < 365) {
        const months = Math.floor(days / 30);
        return `Há ${months} ${months > 1 ? 'meses' : 'mês'}`;
      } else {
        const years = Math.floor(days / 365);
        return `Há ${years} ano${years > 1 ? 's' : ''}`;
      }
    } catch (e) {
      return dateTimeString;
    }
  };

  if (loading) {
    return (
      <div className="user-detail-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Carregando detalhes do usuário...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="user-detail-container">
        <div className="error-state">
          <div className="error-icon">
            <AlertTriangle size={64} />
          </div>
          <h3>Erro ao carregar usuário</h3>
          <p>{error || "Usuário não encontrado"}</p>
          <button className="retry-btn" onClick={refreshData}>
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  const userIsAdmin = isAdmin(user.email);
  const initials = getInitials(user.name);

  return (
    <div className="user-detail-container">
      {/* Header com gradiente */}
      <div className="user-header">
        <div className="header-background">
          <button className="back-button" onClick={() => navigate('/users')}>
            <ArrowLeft size={20} />
          </button>
          
          <div className="header-actions">
            <button className="header-action-btn" onClick={handleEdit}>
              <Edit size={16} />
            </button>
            <div className="dropdown">
              <button 
                className="header-action-btn dropdown-toggle"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <MoreVertical size={16} />
              </button>
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <button onClick={() => { refreshData(); setDropdownOpen(false); }}>
                    <RefreshCw size={14} />
                    Atualizar
                  </button>
                  <button 
                    onClick={() => { setShowDeleteModal(true); setDropdownOpen(false); }} 
                    className="delete-option"
                  >
                    <Trash2 size={14} />
                    Excluir
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="user-profile">
          <div className="user-avatar-large">
            {user.profileImage ? (
              <img
                src={`data:image/jpeg;base64,${user.profileImage}`}
                alt={user.name}
                className="avatar-image-large"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="avatar-initials-large"
              style={{ display: user.profileImage ? 'none' : 'flex' }}
            >
              {initials}
            </div>
            <div className="camera-badge">
              <Camera size={16} />
            </div>
          </div>
          
          <h1 className="user-name-large">{user.name || "Usuário"}</h1>
          
          {userIsAdmin && (
            <div className="admin-badge-large">
              <Shield size={16} />
              <span>Administrador</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="user-content">
        {/* Informações Básicas */}
        <div className="info-section">
          <h3 className="section-title">Informações Básicas</h3>
          <div className="info-items">
            <div className="info-item">
              <div className="info-icon" style={{ backgroundColor: 'rgba(42, 157, 143, 0.1)' }}>
                <User size={20} style={{ color: '#2a9d8f' }} />
              </div>
              <div className="info-content">
                <span className="info-label">Nome</span>
                <span className="info-value">{user.name || "N/A"}</span>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon" style={{ backgroundColor: 'rgba(42, 157, 143, 0.1)' }}>
                <Mail size={20} style={{ color: '#2a9d8f' }} />
              </div>
              <div className="info-content">
                <span className="info-label">Email</span>
                <span className="info-value">{user.email || "N/A"}</span>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon" style={{ backgroundColor: 'rgba(42, 157, 143, 0.1)' }}>
                <Hash size={20} style={{ color: '#2a9d8f' }} />
              </div>
              <div className="info-content">
                <span className="info-label">ID do Usuário</span>
                <span className="info-value">{user.id || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status e Permissões */}
        <div className="info-section">
          <h3 className="section-title">Status e Permissões</h3>
          <div className="info-items">
            <div className="info-item">
              <div className="info-icon" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                <CheckCircle size={20} style={{ color: '#22c55e' }} />
              </div>
              <div className="info-content">
                <span className="info-label">Status da Conta</span>
                <div className="status-badge active">Ativo</div>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon" style={{ backgroundColor: userIsAdmin ? 'rgba(249, 115, 22, 0.1)' : 'rgba(59, 130, 246, 0.1)' }}>
                {userIsAdmin ? (
                  <Shield size={20} style={{ color: '#f97316' }} />
                ) : (
                  <User size={20} style={{ color: '#3b82f6' }} />
                )}
              </div>
              <div className="info-content">
                <span className="info-label">Tipo de Usuário</span>
                <div className={`status-badge ${userIsAdmin ? 'admin' : 'user'}`}>
                  {userIsAdmin ? 'Administrador' : 'Usuário Padrão'}
                </div>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon" style={{ backgroundColor: 'rgba(107, 114, 128, 0.1)' }}>
                <Lock size={20} style={{ color: '#6b7280' }} />
              </div>
              <div className="info-content">
                <span className="info-label">Últimas Permissões</span>
                <div className="status-badge neutral">Há 2 dias</div>
              </div>
            </div>
          </div>
        </div>

        {/* Atividade Recente */}
        <div className="info-section">
          <h3 className="section-title">Atividade Recente</h3>
          <div className="info-items">
            <div className="activity-item">
              <div className="activity-icon">
                <LogIn size={20} />
              </div>
              <div className="activity-content">
                <span className="activity-label">Último Login</span>
                <span className="activity-value">{formatDateTime(user.ultimoLogin)}</span>
              </div>
            </div>

            <div className="activity-item">
              <div className="activity-icon">
                <Clock size={20} />
              </div>
              <div className="activity-content">
                <span className="activity-label">Última Atualização</span>
                <span className="activity-value">{formatDateTime(user.ultimaAtualizacao)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas de Uso */}
        <div className="info-section">
          <h3 className="section-title">Estatísticas de Uso</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ color: '#3b82f6' }}>
                <LogIn size={24} />
              </div>
              <div className="stat-value" style={{ color: '#3b82f6' }}>
                {user.qtdLogins || 0}
              </div>
              <div className="stat-label">Logins</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ color: '#22c55e' }}>
                <MousePointer size={24} />
              </div>
              <div className="stat-value" style={{ color: '#22c55e' }}>
                {user.qtdClicks || 0}
              </div>
              <div className="stat-label">Clicks</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ color: '#f97316' }}>
                <Calendar size={24} />
              </div>
              <div className="stat-value" style={{ color: '#f97316' }}>
                {user.diasNoSistema || 0}
              </div>
              <div className="stat-label">Dias</div>
            </div>
          </div>

          <div className="stats-info">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="bottom-actions">
        <button className="action-btn secondary" onClick={handleEdit}>
          <Edit size={16} />
          Editar
        </button>
        <button 
          className="action-btn danger" 
          onClick={() => setShowDeleteModal(true)}
          disabled={deleting}
        >
          {deleting ? (
            <RefreshCw size={16} className="spinner-icon" />
          ) : (
            <Trash2 size={16} />
          )}
          {deleting ? 'Excluindo...' : 'Excluir'}
        </button>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <AlertTriangle className="modal-icon" size={24} />
              <h3>Confirmar Exclusão</h3>
            </div>
            <div className="modal-body">
              <p>
                Tem certeza que deseja excluir o usuário "{user.name}"?
              </p>
              <p>Esta ação não pode ser desfeita.</p>
            </div>
            <div className="modal-actions">
              <button 
                className="modal-btn cancel" 
                onClick={() => setShowDeleteModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="modal-btn confirm" 
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDetailPage;