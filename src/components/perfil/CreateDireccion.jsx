import React, { useState, useEffect, useRef } from 'react';
import { FaMapMarkerAlt, FaCheckCircle, FaSearch, FaSpinner } from 'react-icons/fa';
import '../../css/Perfil/create-direcciones.css';

const ModalAgregarDireccion = ({ isOpen, onClose, onSave, direccionToEdit = null }) => {
  const [formData, setFormData] = useState({
    calle: '',
    numero_exterior: '',
    numero_interior: '',
    colonia: '',
    ciudad: '',
    estado: '',
    codigo_postal: '',
    referencias: '',
    tipo: 'casa'
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  const isEditing = !!direccionToEdit;

  // Resetear todos los estados cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setIsSaving(false);
      setSubmitError('');
      setErrors({});
    }
  }, [isOpen]);

  // Cargar datos de edición cuando se abre el modal
  useEffect(() => {
    if (direccionToEdit && isOpen) {
      setFormData({
        calle: direccionToEdit.calle || '',
        numero_exterior: direccionToEdit.numero_exterior || '',
        numero_interior: direccionToEdit.numero_interior || '',
        colonia: direccionToEdit.colonia || '',
        ciudad: direccionToEdit.ciudad || '',
        estado: direccionToEdit.estado || '',
        codigo_postal: direccionToEdit.codigo_postal || '',
        referencias: direccionToEdit.referencias || '',
        tipo: direccionToEdit.tipo || 'casa'
      });
      setSubmitError('');
      setErrors({});
    } else if (!direccionToEdit && isOpen) {
      setFormData({
        calle: '',
        numero_exterior: '',
        numero_interior: '',
        colonia: '',
        ciudad: '',
        estado: '',
        codigo_postal: '',
        referencias: '',
        tipo: 'casa'
      });
      setSubmitError('');
      setErrors({});
    }
  }, [direccionToEdit, isOpen]);

  const handleKeyDown = (e, nextFieldId) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextFieldId) {
        const nextField = document.getElementById(nextFieldId);
        if (nextField) {
          nextField.focus();
        }
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSubmitError('');
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.calle.trim()) newErrors.calle = 'La calle es requerida';
    if (!formData.numero_exterior.trim()) newErrors.numero_exterior = 'El número exterior es requerido';
    if (!formData.colonia.trim()) newErrors.colonia = 'La colonia es requerida';
    if (!formData.ciudad.trim()) newErrors.ciudad = 'La ciudad es requerida';
    if (!formData.estado.trim()) newErrors.estado = 'El estado es requerido';
    if (!formData.codigo_postal.trim()) newErrors.codigo_postal = 'El código postal es requerido';
    else if (!/^\d{5}$/.test(formData.codigo_postal.trim())) newErrors.codigo_postal = 'El código postal debe tener 5 dígitos';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!validate()) {
      const firstErrorField = document.querySelector('.input-error');
      if (firstErrorField) {
        firstErrorField.focus();
      }
      return;
    }
    
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error al guardar:', error);
      setSubmitError(error.message || 'Error al guardar la dirección. Intenta nuevamente.');
      setIsSaving(false);
    }
  };

  // Función para cerrar el modal de forma segura
  const handleClose = () => {
    if (!isSaving) {
      setIsSaving(false);
      setSubmitError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="add-dir-modal-overlay" onClick={handleClose}>
      <div className="add-dir-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="add-dir-modal-header">
          <div className="add-dir-modal-logo">
            <FaMapMarkerAlt />
          </div>
          <div className="add-dir-modal-header-info">
            <h3>{isEditing ? 'Editar Dirección' : 'Agregar Dirección'}</h3>
            <div className="add-dir-modal-header-subtitle">
              {isEditing ? 'Actualiza los datos de tu dirección' : 'Ingresa los datos de tu nueva dirección'}
            </div>
          </div>
          <button 
            className="add-dir-modal-close" 
            onClick={handleClose}
            disabled={isSaving}
          >
            ✕
          </button>
        </div>

        {submitError && (
          <div className="add-dir-modal-error-message">
            <span className="error-icon">⚠️</span>
            <span>{submitError}</span>
          </div>
        )}

        <div className="add-dir-modal-body">
          <form onSubmit={handleSubmit}>
            <div className="add-dir-form-row">
              <div className="add-dir-form-group add-dir-flex-2">
                <label htmlFor="calle">Calle</label>
                <input
                  type="text"
                  id="calle"
                  name="calle"
                  value={formData.calle}
                  onChange={handleChange}
                  onKeyDown={(e) => handleKeyDown(e, 'numero_exterior')}
                  className={errors.calle ? 'input-error' : ''}
                  placeholder="Nombre de la calle"
                  disabled={isSaving}
                />
                {errors.calle && <span className="add-dir-error-message">{errors.calle}</span>}
              </div>

              <div className="add-dir-form-group">
                <label htmlFor="numero_exterior">Número exterior</label>
                <input
                  type="text"
                  id="numero_exterior"
                  name="numero_exterior"
                  value={formData.numero_exterior}
                  onChange={handleChange}
                  onKeyDown={(e) => handleKeyDown(e, 'numero_interior')}
                  className={errors.numero_exterior ? 'input-error' : ''}
                  placeholder="123"
                  disabled={isSaving}
                />
                {errors.numero_exterior && <span className="add-dir-error-message">{errors.numero_exterior}</span>}
              </div>

              <div className="add-dir-form-group">
                <label htmlFor="numero_interior">Número interior</label>
                <input
                  type="text"
                  id="numero_interior"
                  name="numero_interior"
                  value={formData.numero_interior}
                  onChange={handleChange}
                  onKeyDown={(e) => handleKeyDown(e, 'codigo_postal')}
                  placeholder="A, 1B, etc."
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="add-dir-form-row">
              <div className="add-dir-form-group">
                <label htmlFor="codigo_postal">Código postal</label>
                <input
                  type="text"
                  id="codigo_postal"
                  name="codigo_postal"
                  value={formData.codigo_postal}
                  onChange={handleChange}
                  onKeyDown={(e) => handleKeyDown(e, 'colonia')}
                  className={errors.codigo_postal ? 'input-error' : ''}
                  placeholder="12345"
                  maxLength="5"
                  disabled={isSaving}
                />
                {errors.codigo_postal && <span className="add-dir-error-message">{errors.codigo_postal}</span>}
              </div>
            </div>

            <div className="add-dir-form-row">
              <div className="add-dir-form-group">
                <label htmlFor="colonia">Colonia</label>
                <input
                  type="text"
                  id="colonia"
                  name="colonia"
                  value={formData.colonia}
                  onChange={handleChange}
                  onKeyDown={(e) => handleKeyDown(e, 'ciudad')}
                  className={errors.colonia ? 'input-error' : ''}
                  placeholder="Nombre de la colonia"
                  disabled={isSaving}
                />
                {errors.colonia && <span className="add-dir-error-message">{errors.colonia}</span>}
              </div>
            </div>

            <div className="add-dir-form-row">
              <div className="add-dir-form-group">
                <label htmlFor="ciudad">Ciudad / Municipio</label>
                <input
                  type="text"
                  id="ciudad"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  onKeyDown={(e) => handleKeyDown(e, 'estado')}
                  className={errors.ciudad ? 'input-error' : ''}
                  placeholder="Ciudad o municipio"
                  disabled={isSaving}
                />
                {errors.ciudad && <span className="add-dir-error-message">{errors.ciudad}</span>}
              </div>

              <div className="add-dir-form-group">
                <label htmlFor="estado">Estado</label>
                <input
                  type="text"
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  onKeyDown={(e) => handleKeyDown(e, 'referencias')}
                  className={errors.estado ? 'input-error' : ''}
                  placeholder="Estado"
                  disabled={isSaving}
                />
                {errors.estado && <span className="add-dir-error-message">{errors.estado}</span>}
              </div>
            </div>

            <div className="add-dir-form-group">
              <label htmlFor="referencias">Referencias</label>
              <textarea
                id="referencias"
                name="referencias"
                value={formData.referencias}
                onChange={handleChange}
                placeholder="Entre calles, puntos de referencia, etc."
                rows="3"
                disabled={isSaving}
              />
            </div>

            <div className="add-dir-form-row">
              <div className="add-dir-form-group">
                <label htmlFor="tipo">Tipo de dirección</label>
                <select
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  disabled={isSaving}
                >
                  <option value="casa">Casa</option>
                  <option value="trabajo">Trabajo</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>

            <div className="add-dir-modal-footer">
              <button 
                type="button" 
                className="add-dir-btn-cancel" 
                onClick={handleClose}
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="add-dir-btn-save" 
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <FaSpinner className="spinner-icon" />
                    Guardando...
                  </>
                ) : (
                  isEditing ? 'Actualizar Dirección' : 'Agregar Dirección'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalAgregarDireccion;