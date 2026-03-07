import React, { useState } from 'react';

const ModalCambiarPassword = ({ isOpen, onClose, isAuthenticated, navigate }) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
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
        alert('✅ Contraseña cambiada exitosamente');
        onClose();
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
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
    <div className="perfil-modal-overlay">
      <div className="perfil-modal-content">
        <div className="perfil-modal-header">
          <h3>Cambiar Contraseña</h3>
          <button className="perfil-close-modal" onClick={onClose}>✕</button>
        </div>
        <div className="perfil-modal-body">
          <form onSubmit={handleSubmit} className="perfil-password-form">
            <div className="perfil-form-group">
              <label htmlFor="currentPassword">Contraseña Actual *</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handleChange}
                className={`perfil-search-input ${errors.currentPassword ? 'perfil-input-error' : ''}`}
                placeholder="Ingresa tu contraseña actual"
              />
              {errors.currentPassword && <span className="perfil-error-message">{errors.currentPassword}</span>}
            </div>

            <div className="perfil-form-group">
              <label htmlFor="newPassword">Nueva Contraseña *</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handleChange}
                className={`perfil-search-input ${errors.newPassword ? 'perfil-input-error' : ''}`}
                placeholder="Mínimo 6 caracteres"
              />
              {errors.newPassword && <span className="perfil-error-message">{errors.newPassword}</span>}
            </div>

            <div className="perfil-form-group">
              <label htmlFor="confirmPassword">Confirmar Nueva Contraseña *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handleChange}
                className={`perfil-search-input ${errors.confirmPassword ? 'perfil-input-error' : ''}`}
                placeholder="Repite la nueva contraseña"
              />
              {errors.confirmPassword && <span className="perfil-error-message">{errors.confirmPassword}</span>}
            </div>

            <div className="perfil-modal-footer">
              <button type="button" className="perfil-btn-cancel" onClick={onClose}>Cancelar</button>
              <button type="submit" className="perfil-btn-save" disabled={loading}>
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