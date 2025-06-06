import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AddUserPage.css";

function AddUserPage({ showAppBar = true }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    isAdmin: false
  });
  
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [showImagePicker, setShowImagePicker] = useState(false);

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
    
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não conferem';
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
      console.log('🔄 Criando usuário...');
      
      // Preparar dados para envio
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        isAdmin: formData.isAdmin,
      };
      
      // Processar imagem
      if (profileImage) {
        console.log('Convertendo imagem para Base64...');
        userData.profileImage = await convertImageToBase64(profileImage);
        console.log(`Imagem convertida: ${userData.profileImage.substring(0, 50)}...`);
      }
      
      console.log('📦 Dados a serem enviados:');
      console.log('- Nome:', userData.name);
      console.log('- Email:', userData.email);
      console.log('- isAdmin:', userData.isAdmin);
      console.log('- Tem imagem:', !!userData.profileImage);
      
      const response = await fetch('http://localhost:8090/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      console.log('📊 Status da resposta:', response.status);
      
      if (response.ok || response.status === 201) {
        const result = await response.json();
        console.log('✅ Usuário criado:', result);
        alert('Usuário criado com sucesso!');
        navigate('/users');
      } else {
        const errorData = await response.text();
        console.error('❌ Erro da API:', errorData);
        throw new Error(errorData || 'Erro ao criar usuário');
      }
    } catch (err) {
      console.error('💥 Erro ao criar usuário:', err);
      
      let errorMessage = 'Erro ao criar usuário';
      if (err.message.includes('fetch')) {
        errorMessage = 'Erro de conexão: Verifique se o servidor está rodando';
      } else if (err.message.includes('timeout')) {
        errorMessage = 'Timeout: Servidor não respondeu';
      } else {
        errorMessage = err.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '+';
    
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    } else {
      return parts[0].substring(0, Math.min(parts[0].length, 2)).toUpperCase();
    }
  };

  // Renderização condicional baseada no showAppBar
  if (!showAppBar) {
    return (
      <div className="add-user-body">
        <div className="custom-header">
          {/* Header personalizado quando não há AppBar */}
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Voltar
          </button>
          <h1 className="header-title">Adicionar Usuário</h1>
          <button 
            className="save-btn" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
        
        <div className="add-user-content">
          {renderForm()}
        </div>
      </div>
    );
  }

  // Renderização com AppBar normal
  return (
    <div className="add-user-container">
      {/* Header */}
      <div className="add-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Voltar
        </button>
        <h1 className="page-title">Adicionar Usuário</h1>
        <button 
          className="save-button" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      {/* Content */}
      <div className="add-content">
        {renderForm()}
      </div>
    </div>
  );

  function renderForm() {
    return (
      <form onSubmit={handleSubmit}>
        {/* Profile Image Section */}
        <div className="form-section">
          <h3 className="section-title">Foto do Perfil (Opcional)</h3>
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
                  📷
                </button>
              </div>
              
              {profileImagePreview && (
                <button 
                  type="button"
                  className="remove-image-btn"
                  onClick={removeProfileImage}
                >
                  🗑️ Remover Foto
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Basic Info Section */}
        <div className="form-section">
          <h3 className="section-title">Informações Básicas</h3>
          
          <div className="form-group">
            <label htmlFor="name">Nome completo *</label>
            <div className="input-container">
              <span className="input-icon">👤</span>
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
            <label htmlFor="email">Email *</label>
            <div className="input-container">
              <span className="input-icon">📧</span>
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

        {/* Security Section */}
        <div className="form-section">
          <h3 className="section-title">Segurança</h3>
          
          <div className="form-group">
            <label htmlFor="password">Senha *</label>
            <div className="input-container">
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? 'error' : ''}
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar senha *</label>
            <div className="input-container">
              <span className="input-icon">🔓</span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? 'error' : ''}
                placeholder="Confirme a senha"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>
        </div>

        {/* Permissions Section */}
        <div className="form-section">
          <h3 className="section-title">Permissões</h3>
          
          <div className="permission-container">
            <div className="permission-toggle">
              <div className="permission-info">
                <div className="permission-icon">
                  {formData.isAdmin ? '🔑' : '👤'}
                </div>
                <div className="permission-text">
                  <h4>Administrador</h4>
                  <p>
                    {formData.isAdmin 
                      ? 'Este usuário terá privilégios administrativos'
                      : 'Este usuário terá permissões padrão'
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
                <span className="warning-icon">⚠️</span>
                <span>Usuários administradores têm acesso total ao sistema</span>
              </div>
            )}
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
                <span className="loading-spinner-small"></span>
                Criando usuário...
              </>
            ) : (
              <>
                👤 Criar Usuário
              </>
            )}
          </button>
          
          <button 
            type="button" 
            className="secondary-btn"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            ❌ Cancelar
          </button>
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
                  <div className="option-icon">📷</div>
                  <span>Câmera</span>
                </button>
                
                <button 
                  className="picker-option"
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowImagePicker(false);
                  }}
                >
                  <div className="option-icon">🖼️</div>
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
      </form>
    );
  }
}

export default AddUserPage;