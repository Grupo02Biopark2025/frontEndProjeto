import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft, Save, Camera, Trash2, User, Mail, Lock, 
  Eye, EyeOff, Shield, AlertTriangle, Info, Image, 
  Loader2, X, CheckCircle
} from "lucide-react";
import "../styles/EditUserPage.css";

function EditUserPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const userFromState = location.state?.user;
  const fileInputRef = useRef(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    isAdmin: false
  });
  
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [originalProfileImage, setOriginalProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [showImagePicker, setShowImagePicker] = useState(false);

  useEffect(() => {
    if (userFromState) {
      initializeForm(userFromState);
    } else if (id) {
      fetchUserData(id);
    }
  }, [userFromState, id]);

  const initializeForm = (user) => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      isAdmin: user.isAdmin || user.email?.toLowerCase().includes('admin') || false
    });
    
    if (user.profileImage) {
      setOriginalProfileImage(user.profileImage);
      setProfileImagePreview(`data:image/jpeg;base64,${user.profileImage}`);
    }
  };

  const fetchUserData = async (userId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4040/api/users/${userId}`);
      if (response.ok) {
        const user = await response.json();
        initializeForm(user);
      } else {
        throw new Error('Usuário não encontrado');
      }
    } catch (err) {
      console.error('Erro ao buscar usuário:', err);
      alert('Erro ao carregar dados do usuário');
      navigate('/users');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        alert('Imagem muito grande. Máximo 5MB.');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione um arquivo de imagem.');
        return;
      }

      setProfileImage(file);
      
      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
    setShowImagePicker(false);
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    setProfileImagePreview(null);
    setOriginalProfileImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Remove o prefixo "data:image/...;base64,"
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Preparar dados para envio
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        isAdmin: formData.isAdmin,
      };
      
      // Adicionar senha apenas se foi fornecida
      if (formData.password.trim()) {
        userData.password = formData.password;
      }
      
      // Processar imagem
      if (profileImage) {
        // Nova imagem selecionada
        userData.profileImage = await convertImageToBase64(profileImage);
      } else if (originalProfileImage && profileImagePreview) {
        // Manter imagem existente
        userData.profileImage = originalProfileImage;
      } else {
        // Remover imagem
        userData.profileImage = null;
      }
      
      console.log('Enviando dados:', userData);
      
      const response = await fetch(`http://localhost:4040/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (response.ok) {
        alert('Usuário atualizado com sucesso!');
        navigate(`/users/${id}`);
      } else {
        const errorData = await response.text();
        throw new Error(errorData || 'Erro ao atualizar usuário');
      }
    } catch (err) {
      console.error('Erro ao salvar usuário:', err);
      alert('Erro ao salvar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    } else {
      return parts[0].substring(0, Math.min(parts[0].length, 2)).toUpperCase();
    }
  };

  if (loading && !formData.name) {
    return (
      <div className="edit-user-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Carregando dados do usuário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-user-container">
      {/* Header */}
      <div className="edit-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          Voltar
        </button>
        <h1 className="page-title">Editar Usuário</h1>
        <button 
          className="save-button" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <Loader2 size={16} className="spinner-icon" /> : <Save size={16} />}
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      {/* Content */}
      <div className="edit-content">
        <form onSubmit={handleSubmit}>
          {/* Profile Image Section */}
          <div className="form-section">
            <h3 className="section-title">
              <Camera size={20} />
              Foto do Perfil
            </h3>
            <div className="profile-image-section">
              <div className="profile-image-container">
                <div className="profile-image-preview">
                  {profileImagePreview ? (
                    <img 
                      src={profileImagePreview} 
                      alt="Preview" 
                      className="profile-image"
                    />
                  ) : (
                    <div className="profile-initials">
                      {getInitials(formData.name)}
                    </div>
                  )}
                  
                  <button 
                    type="button"
                    className="camera-button"
                    onClick={() => setShowImagePicker(true)}
                  >
                    <Camera size={16} />
                  </button>
                </div>
                
                {(profileImagePreview || originalProfileImage) && (
                  <button 
                    type="button"
                    className="remove-image-btn"
                    onClick={removeProfileImage}
                  >
                    <Trash2 size={14} />
                    Remover Foto
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Basic Info Section */}
          <div className="form-section">
            <h3 className="section-title">
              <User size={20} />
              Informações Básicas
            </h3>
            
            <div className="form-group">
              <label htmlFor="name">Nome completo</label>
              <div className="input-container">
                <User className="input-icon" size={16} />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? 'error' : ''}
                  placeholder="Digite o nome completo"
                />
              </div>
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-container">
                <Mail className="input-icon" size={16} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="Digite o email"
                />
              </div>
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
          </div>

          {/* Permissions Section */}
          <div className="form-section">
            <h3 className="section-title">
              <Shield size={20} />
              Permissões
            </h3>
            
            <div className="permission-container">
              <div className="permission-toggle">
                <div className="permission-info">
                  <div className="permission-icon">
                    {formData.isAdmin ? (
                      <Shield size={20} style={{ color: '#f97316' }} />
                    ) : (
                      <User size={20} style={{ color: '#3b82f6' }} />
                    )}
                  </div>
                  <div className="permission-text">
                    <h4>Administrador</h4>
                    <p>
                      {formData.isAdmin 
                        ? 'Este usuário tem privilégios administrativos'
                        : 'Este usuário tem permissões padrão'
                      }
                    </p>
                  </div>
                </div>
                
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    name="isAdmin"
                    checked={formData.isAdmin}
                    onChange={handleInputChange}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              
              {formData.isAdmin && (
                <div className="admin-warning">
                  <AlertTriangle size={16} />
                  <span>Usuários administradores têm acesso total ao sistema</span>
                </div>
              )}
            </div>
          </div>

          {/* Security Section */}
          <div className="form-section">
            <h3 className="section-title">
              <Lock size={20} />
              Segurança
            </h3>
            
            <div className="form-group">
              <label htmlFor="password">Nova senha (opcional)</label>
              <div className="input-container">
                <Lock className="input-icon" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? 'error' : ''}
                  placeholder="Deixe em branco para manter a atual"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
            
            <div className="security-info">
              <Info size={16} />
              <span>A senha só será alterada se você digitar uma nova senha</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button 
              type="submit" 
              className="primary-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spinner-icon" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Salvar Alterações
                </>
              )}
            </button>
            
            <button 
              type="button" 
              className="secondary-btn"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              <X size={16} />
              Cancelar
            </button>
          </div>
        </form>
      </div>

      {/* Image Picker Modal */}
      {showImagePicker && (
        <div className="modal-overlay" onClick={() => setShowImagePicker(false)}>
          <div className="image-picker-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-handle"></div>
              <h3>Selecionar Foto</h3>
            </div>
            
            <div className="image-picker-options">
              <button 
                className="picker-option"
                onClick={() => {
                  fileInputRef.current?.click();
                  setShowImagePicker(false);
                }}
              >
                <div className="option-icon">
                  <Camera size={24} />
                </div>
                <span>Câmera</span>
              </button>
              
              <button 
                className="picker-option"
                onClick={() => {
                  fileInputRef.current?.click();
                  setShowImagePicker(false);
                }}
              >
                <div className="option-icon">
                  <Image size={24} />
                </div>
                <span>Galeria</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
}

export default EditUserPage;