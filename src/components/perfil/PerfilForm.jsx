import React, { useState } from 'react';
import editIcon from '../../img/edit.png';
import cancelIcon from '../../img/cancelar.png';
import saveIcon from '../../img/mas.png';

const PerfilForm = ({ 
  profileForm, 
  setProfileForm, 
  editingProfile, 
  setEditingProfile, 
  isAuthenticated, 
  onSave, 
  userData 
}) => {
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!profileForm.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    else if (profileForm.nombre.trim().length < 2) newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    if (!profileForm.telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
    else if (!/^\d{10}$/.test(profileForm.telefono.trim())) newErrors.telefono = 'El teléfono debe tener 10 dígitos';
    if (!profileForm.correo.trim()) newErrors.correo = 'El correo es requerido';
    else if (!/\S+@\S+\.\S+/.test(profileForm.correo)) newErrors.correo = 'Correo electrónico inválido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(profileForm);
  };

  return (
    <div className="perfil-form-section" style={{
      backgroundColor: 'white',
      borderRadius: '15px',
      padding: '25px',
      marginBottom: '30px',
      border: '1px solid #e0e0e0'
    }}>
      <div className="perfil-section-header" style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#2d6a4f', margin: 0 }}>Información Personal</h3>
        <div className="perfil-header-buttons">
          {isAuthenticated ? (
            !editingProfile ? (
              <button 
                className="perfil-add-orden-btn"
                onClick={() => setEditingProfile(true)}
                style={{
                  backgroundColor: '#96bd44',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <img src={editIcon} alt="Editar" style={{ width: '16px', height: '16px', filter: 'brightness(0) invert(1)' }} />
                Editar Perfil
              </button>
            ) : (
              <button 
                className="perfil-verify-code-btn"
                onClick={() => {
                  setEditingProfile(false);
                  if (userData) {
                    setProfileForm({
                      nombre: userData.nombre || '',
                      telefono: userData.telefono || '',
                      sexo: userData.sexo || '',
                      correo: userData.correo || ''
                    });
                  }
                  setErrors({});
                }}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <img src={cancelIcon} alt="Cancelar" style={{ width: '16px', height: '16px', filter: 'brightness(0) invert(1)' }} />
                Cancelar
              </button>
            )
          ) : (
            <button 
              className="perfil-verify-code-btn"
              onClick={() => window.location.href = '/login'}
              style={{
                backgroundColor: '#96bd44',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <img src={editIcon} alt="Iniciar sesión" style={{ width: '16px', height: '16px', filter: 'brightness(0) invert(1)' }} />
              Iniciar Sesión
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="perfil-profile-form">
        <div className="perfil-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          <div className="perfil-form-group">
            <label htmlFor="nombre" style={{ color: '#2d6a4f', fontWeight: '500' }}>Nombre Completo *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={profileForm.nombre}
              onChange={handleChange}
              disabled={!editingProfile || !isAuthenticated}
              className={`perfil-search-input ${errors.nombre ? 'perfil-input-error' : ''}`}
              placeholder={isAuthenticated ? "Tu nombre completo" : "Inicia sesión para editar"}
              style={{
                border: `1px solid ${errors.nombre ? '#e53e3e' : '#e0e0e0'}`,
                borderRadius: '8px',
                padding: '12px',
                width: '100%',
                backgroundColor: !editingProfile || !isAuthenticated ? '#f5f5f5' : 'white'
              }}
            />
            {errors.nombre && <span className="perfil-error-message" style={{ color: '#e53e3e' }}>{errors.nombre}</span>}
          </div>

          <div className="perfil-form-group">
            <label htmlFor="correo" style={{ color: '#2d6a4f', fontWeight: '500' }}>Correo Electrónico *</label>
            <input
              type="email"
              id="correo"
              name="correo"
              value={profileForm.correo}
              onChange={handleChange}
              disabled={!editingProfile || !isAuthenticated}
              className={`perfil-search-input ${errors.correo ? 'perfil-input-error' : ''}`}
              placeholder={isAuthenticated ? "correo@ejemplo.com" : "Inicia sesión para editar"}
              style={{
                border: `1px solid ${errors.correo ? '#e53e3e' : '#e0e0e0'}`,
                borderRadius: '8px',
                padding: '12px',
                width: '100%',
                backgroundColor: !editingProfile || !isAuthenticated ? '#f5f5f5' : 'white'
              }}
            />
            {errors.correo && <span className="perfil-error-message" style={{ color: '#e53e3e' }}>{errors.correo}</span>}
          </div>

          <div className="perfil-form-group">
            <label htmlFor="telefono" style={{ color: '#2d6a4f', fontWeight: '500' }}>Teléfono *</label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={profileForm.telefono}
              onChange={handleChange}
              disabled={!editingProfile || !isAuthenticated}
              className={`perfil-search-input ${errors.telefono ? 'perfil-input-error' : ''}`}
              placeholder={isAuthenticated ? "10 dígitos" : "Inicia sesión para editar"}
              style={{
                border: `1px solid ${errors.telefono ? '#e53e3e' : '#e0e0e0'}`,
                borderRadius: '8px',
                padding: '12px',
                width: '100%',
                backgroundColor: !editingProfile || !isAuthenticated ? '#f5f5f5' : 'white'
              }}
            />
            {errors.telefono && <span className="perfil-error-message" style={{ color: '#e53e3e' }}>{errors.telefono}</span>}
          </div>

          <div className="perfil-form-group">
            <label htmlFor="sexo" style={{ color: '#2d6a4f', fontWeight: '500' }}>Sexo</label>
            <select
              id="sexo"
              name="sexo"
              value={profileForm.sexo}
              onChange={handleChange}
              disabled={!editingProfile || !isAuthenticated}
              className="perfil-filter-select"
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '12px',
                width: '100%',
                backgroundColor: !editingProfile || !isAuthenticated ? '#f5f5f5' : 'white'
              }}
            >
              <option value="">Seleccionar</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
        </div>

        {editingProfile && isAuthenticated && (
          <div className="perfil-modal-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="perfil-btn-save" style={{
              backgroundColor: '#2d6a4f',
              color: 'white',
              border: 'none',
              padding: '12px 30px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}>
              <img src={saveIcon} alt="Guardar" style={{ width: '16px', height: '16px', filter: 'brightness(0) invert(1)' }} />
              Guardar Cambios
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default PerfilForm;