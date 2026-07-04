import React, { useState } from 'react';
import { FaKey, FaLock, FaCheckCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import '../../css/Perfil/cambiar-password.css';

const ModalCambiarPassword = ({ isOpen, onClose, isAuthenticated, navigate }) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (successMessage) setSuccessMessage('');
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'current') setShowCurrentPassword(!showCurrentPassword);
    if (field === 'new') setShowNewPassword(!showNewPassword);
    if (field === 'confirm') setShowConfirmPassword(!showConfirmPassword);
  };

  const validate = () => {
    const newErrors = {};
    if (!passwordData.currentPassword.trim()) newErrors.currentPassword = 'La contraseña actual es requerida';
    if (!passwordData.newPassword.trim()) newErrors.newPassword = 'La nueva contraseña es requerida';
    else if (passwordData.newPassword.length < 6) newErrors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
    if (!passwordData.confirmPassword.trim()) newErrors.confirmPassword = 'Confirma la nueva contraseña';
    else if (passwordData.newPassword !== passwordData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/user/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword
        })
      });

      if (response.ok) {
        setSuccessMessage('¡Contraseña cambiada exitosamente!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => {
          setSuccessMessage('');
          onClose();
        }, 3000);
      } else {
        const errorData = await response.json();
        alert(`❌ Error: ${errorData.msg || 'Error al cambiar la contraseña'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="password-modal-overlay" onClick={onClose}>
      <div className="password-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="password-modal-header">
          <div className="password-modal-logo">
            <FaKey />
          </div>
          <div className="password-modal-header-info">
            <h3>Cambiar Contraseña</h3>
            <div className="password-modal-header-subtitle">Actualiza tu contraseña de acceso</div>
          </div>
          <button className="password-modal-close" onClick={onClose}>✕</button>
        </div>

        {successMessage && (
          <div className="password-modal-success-message">
            <FaCheckCircle className="success-icon" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="password-modal-body">
          <form onSubmit={handleSubmit}>
            {/* Contraseña Actual */}
            <div className="password-form-group">
              <label htmlFor="currentPassword">Contraseña Actual</label>
              <div className="password-input-wrapper">
                <div className="password-input-icon">
                  <FaLock />
                </div>
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handleChange}
                  className={errors.currentPassword ? 'input-error' : ''}
                  placeholder="Ingresa tu contraseña actual"
                  disabled={loading}
                />
                <button 
                  type="button" 
                  className="password-eye-btn"
                  onClick={() => togglePasswordVisibility('current')}
                >
                  {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.currentPassword && <span className="password-error-message">{errors.currentPassword}</span>}
            </div>

            {/* Nueva Contraseña */}
            <div className="password-form-group">
              <label htmlFor="newPassword">Nueva Contraseña</label>
              <div className="password-input-wrapper">
                <div className="password-input-icon">
                  <FaLock />
                </div>
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handleChange}
                  className={errors.newPassword ? 'input-error' : ''}
                  placeholder="Mínimo 6 caracteres"
                  disabled={loading}
                />
                <button 
                  type="button" 
                  className="password-eye-btn"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.newPassword && <span className="password-error-message">{errors.newPassword}</span>}
            </div>

            {/* Confirmar Nueva Contraseña */}
            <div className="password-form-group">
              <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
              <div className="password-input-wrapper">
                <div className="password-input-icon">
                  <FaCheckCircle />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'input-error' : ''}
                  placeholder="Repite la nueva contraseña"
                  disabled={loading}
                />
                <button 
                  type="button" 
                  className="password-eye-btn"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && <span className="password-error-message">{errors.confirmPassword}</span>}
            </div>

            <div className="password-modal-footer">
              <button type="button" className="password-btn-cancel" onClick={onClose} disabled={loading}>
                Cancelar
              </button>
              <button type="submit" className="password-btn-save" disabled={loading}>
                {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalCambiarPassword;