import React, { useState } from 'react';
import deleteIcon from '../../img/delete.png';
import addIcon from '../../img/mas.png';
import saveIcon from '../../img/mas.png';
import chevronLeftIcon from '../../img/derecha.png';

const ModalGestionarDirecciones = ({ 
  isOpen, 
  onClose, 
  direccionesForm, 
  setDireccionesForm, 
  isAuthenticated, 
  onSuccess 
}) => {
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (index, field, value) => {
    const updated = [...direccionesForm];
    updated[index][field] = value;
    
    if (field === 'predeterminada' && value === true) {
      updated.forEach((dir, i) => {
        if (i !== index) dir.predeterminada = false;
      });
    }
    
    setDireccionesForm(updated);
    if (errors[`${field}_${index}`]) {
      setErrors(prev => ({ ...prev, [`${field}_${index}`]: '' }));
    }
  };

  const handleAdd = () => {
    setDireccionesForm(prev => [...prev, {
      calle: '',
      numero_exterior: '',
      numero_interior: '',
      colonia: '',
      ciudad: '',
      estado: '',
      codigo_postal: '',
      referencias: '',
      tipo: 'casa',
      predeterminada: prev.length === 0
    }]);
  };

  const handleRemove = (index) => {
    if (direccionesForm.length > 1) {
      const updated = direccionesForm.filter((_, i) => i !== index);
      const removedWasPredeterminada = direccionesForm[index].predeterminada;
      if (removedWasPredeterminada && updated.length > 0) {
        updated[0].predeterminada = true;
      }
      setDireccionesForm(updated);
    }
  };

  const validate = () => {
    const newErrors = {};
    direccionesForm.forEach((dir, index) => {
      if (!dir.calle.trim()) newErrors[`calle_${index}`] = 'La calle es requerida';
      if (!dir.numero_exterior.trim()) newErrors[`numero_exterior_${index}`] = 'El número exterior es requerido';
      if (!dir.colonia.trim()) newErrors[`colonia_${index}`] = 'La colonia es requerida';
      if (!dir.ciudad.trim()) newErrors[`ciudad_${index}`] = 'La ciudad es requerida';
      if (!dir.estado.trim()) newErrors[`estado_${index}`] = 'El estado es requerido';
      if (!dir.codigo_postal.trim()) newErrors[`codigo_postal_${index}`] = 'El código postal es requerido';
      else if (!/^\d{5}$/.test(dir.codigo_postal)) newErrors[`codigo_postal_${index}`] = 'El código postal debe tener 5 dígitos';
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      let hasError = false;

      for (const dir of direccionesForm) {
        const url = dir.id 
          ? `http://127.0.0.1:5000/direcciones/${dir.id}`
          : 'http://127.0.0.1:5000/direcciones/me/add_direccion';
        
        const method = dir.id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dir)
        });

        if (!response.ok) {
          hasError = true;
          const errorData = await response.json();
          console.error('Error al guardar dirección:', errorData);
        }
      }

      if (!hasError) {
        onSuccess();
        onClose();
      } else {
        alert('❌ Hubo un error al guardar algunas direcciones');
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
      <div className="perfil-modal-content" style={{ maxWidth: '800px' }}>
        <div className="perfil-modal-header">
          <h3>Gestionar Direcciones</h3>
          <button className="perfil-close-modal" onClick={onClose}>✕</button>
        </div>
        <div className="perfil-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <form onSubmit={handleSubmit} className="perfil-profile-form">
            {direccionesForm.map((direccion, index) => (
              <div key={index} className="direccion-form-card">
                <div className="direccion-form-header">
                  <h4>Dirección {index + 1}</h4>
                  {direccionesForm.length > 1 && (
                    <button
                      type="button"
                      className="direccion-delete-btn"
                      onClick={() => handleRemove(index)}
                      disabled={direccion.predeterminada}
                      title={direccion.predeterminada ? "No se puede eliminar la dirección predeterminada" : "Eliminar dirección"}
                    >
                      <img src={deleteIcon} alt="Eliminar" className="direccion-icon" />
                    </button>
                  )}
                </div>
                
                <div className="direccion-form-grid">
                  <div className="perfil-form-group">
                    <label>Calle *</label>
                    <input
                      type="text"
                      value={direccion.calle}
                      onChange={(e) => handleChange(index, 'calle', e.target.value)}
                      disabled={!isAuthenticated}
                      className={`perfil-search-input ${errors[`calle_${index}`] ? 'perfil-input-error' : ''}`}
                      placeholder="Nombre de la calle"
                    />
                    {errors[`calle_${index}`] && <span className="perfil-error-message">{errors[`calle_${index}`]}</span>}
                  </div>
                  
                  <div className="perfil-form-group">
                    <label>Número Exterior *</label>
                    <input
                      type="text"
                      value={direccion.numero_exterior}
                      onChange={(e) => handleChange(index, 'numero_exterior', e.target.value)}
                      disabled={!isAuthenticated}
                      className={`perfil-search-input ${errors[`numero_exterior_${index}`] ? 'perfil-input-error' : ''}`}
                      placeholder="123"
                    />
                    {errors[`numero_exterior_${index}`] && <span className="perfil-error-message">{errors[`numero_exterior_${index}`]}</span>}
                  </div>
                  
                  <div className="perfil-form-group">
                    <label>Número Interior</label>
                    <input
                      type="text"
                      value={direccion.numero_interior}
                      onChange={(e) => handleChange(index, 'numero_interior', e.target.value)}
                      disabled={!isAuthenticated}
                      className="perfil-search-input"
                      placeholder="A"
                    />
                  </div>
                  
                  <div className="perfil-form-group">
                    <label>Colonia *</label>
                    <input
                      type="text"
                      value={direccion.colonia}
                      onChange={(e) => handleChange(index, 'colonia', e.target.value)}
                      disabled={!isAuthenticated}
                      className={`perfil-search-input ${errors[`colonia_${index}`] ? 'perfil-input-error' : ''}`}
                      placeholder="Nombre de la colonia"
                    />
                    {errors[`colonia_${index}`] && <span className="perfil-error-message">{errors[`colonia_${index}`]}</span>}
                  </div>
                  
                  <div className="perfil-form-group">
                    <label>Ciudad *</label>
                    <input
                      type="text"
                      value={direccion.ciudad}
                      onChange={(e) => handleChange(index, 'ciudad', e.target.value)}
                      disabled={!isAuthenticated}
                      className={`perfil-search-input ${errors[`ciudad_${index}`] ? 'perfil-input-error' : ''}`}
                      placeholder="Nombre de la ciudad"
                    />
                    {errors[`ciudad_${index}`] && <span className="perfil-error-message">{errors[`ciudad_${index}`]}</span>}
                  </div>
                  
                  <div className="perfil-form-group">
                    <label>Estado *</label>
                    <input
                      type="text"
                      value={direccion.estado}
                      onChange={(e) => handleChange(index, 'estado', e.target.value)}
                      disabled={!isAuthenticated}
                      className={`perfil-search-input ${errors[`estado_${index}`] ? 'perfil-input-error' : ''}`}
                      placeholder="Nombre del estado"
                    />
                    {errors[`estado_${index}`] && <span className="perfil-error-message">{errors[`estado_${index}`]}</span>}
                  </div>
                  
                  <div className="perfil-form-group">
                    <label>Código Postal *</label>
                    <input
                      type="text"
                      value={direccion.codigo_postal}
                      onChange={(e) => handleChange(index, 'codigo_postal', e.target.value)}
                      disabled={!isAuthenticated}
                      className={`perfil-search-input ${errors[`codigo_postal_${index}`] ? 'perfil-input-error' : ''}`}
                      placeholder="12345"
                      maxLength="5"
                    />
                    {errors[`codigo_postal_${index}`] && <span className="perfil-error-message">{errors[`codigo_postal_${index}`]}</span>}
                  </div>
                  
                  <div className="perfil-form-group">
                    <label>Tipo de Dirección</label>
                    <select
                      value={direccion.tipo}
                      onChange={(e) => handleChange(index, 'tipo', e.target.value)}
                      disabled={!isAuthenticated}
                      className="perfil-filter-select"
                    >
                      <option value="casa">Casa</option>
                      <option value="trabajo">Trabajo</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  
                  <div className="perfil-form-group full-width">
                    <label>Referencias</label>
                    <textarea
                      value={direccion.referencias}
                      onChange={(e) => handleChange(index, 'referencias', e.target.value)}
                      disabled={!isAuthenticated}
                      className="perfil-search-input"
                      placeholder="Entre calles, puntos de referencia, etc."
                      rows="3"
                    />
                  </div>
                  
                  <div className="perfil-form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={direccion.predeterminada}
                        onChange={(e) => handleChange(index, 'predeterminada', e.target.checked)}
                        disabled={!isAuthenticated}
                      />
                      <span className="checkbox-custom"></span>
                      Dirección predeterminada
                    </label>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="direcciones-actions">
              <button type="button" className="perfil-add-orden-btn" onClick={handleAdd} disabled={!isAuthenticated}>
                <img src={addIcon} alt="Agregar" className="perfil-btn-icon-img" />
                Agregar otra dirección
              </button>
              
              <div className="perfil-modal-footer">
                <button type="button" className="perfil-btn-cancel" onClick={onClose}>Cancelar</button>
                <button type="submit" className="perfil-btn-save" disabled={!isAuthenticated || loading}>
                  <img src={saveIcon} alt="Guardar" className="perfil-btn-icon-img" />
                  {loading ? 'Guardando...' : 'Guardar todas las direcciones'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalGestionarDirecciones;