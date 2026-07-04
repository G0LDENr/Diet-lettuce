import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaVenusMars, FaCheckCircle } from 'react-icons/fa';
import { MdOutlineModeEdit } from "react-icons/md";

import saveIcon from '../../img/hoja-config.png';
import '../../css/Perfil/perfil-form.css';

const ModalEditarPerfil = ({ isOpen, onClose, userData, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    sexo: '',
    correo: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userData) {
      setFormData({
        nombre: userData.nombre || '',
        telefono: userData.telefono || '',
        sexo: userData.sexo || '',
        correo: userData.correo || ''
      });
    }
  }, [userData]);

  // Limpiar mensaje de éxito después de 3 segundos
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        onClose(); // Cerrar el modal después del mensaje
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (successMessage) setSuccessMessage('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    else if (formData.nombre.trim().length < 2) newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
    else if (!/^\d{10}$/.test(formData.telefono.trim())) newErrors.telefono = 'El teléfono debe tener 10 dígitos';
    if (!formData.correo.trim()) newErrors.correo = 'El correo es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.correo)) newErrors.correo = 'Correo electrónico inválido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSaving(true);
    try {
      await onSave(formData);
      setSuccessMessage('¡Perfil actualizado correctamente!');
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-logo">
            <MdOutlineModeEdit />
          </div>
          <div className="modal-header-info">
            <h3>Editar Perfil</h3>
            <div className="modal-header-subtitle">Actualiza tu información personal</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        {/* Mensaje de éxito */}
        {successMessage && (
          <div className="modal-success-message">
            <FaCheckCircle className="success-icon" />
            <span>{successMessage}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Campo Nombre Completo */}
            <div className="modal-form-group">
              <label htmlFor="nombre">Nombre Completo</label>
              <div className="modal-input-wrapper">
                <div className="modal-input-icon">
                  <FaUser />
                </div>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={errors.nombre ? 'input-error' : ''}
                  placeholder="Tu nombre completo"
                  disabled={isSaving}
                />
              </div>
              {errors.nombre && <span className="modal-error-message">{errors.nombre}</span>}
            </div>

            {/* Campo Correo Electrónico */}
            <div className="modal-form-group">
              <label htmlFor="correo">Correo Electrónico</label>
              <div className="modal-input-wrapper">
                <div className="modal-input-icon">
                  <FaEnvelope />
                </div>
                <input
                  type="email"
                  id="correo"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  className={errors.correo ? 'input-error' : ''}
                  placeholder="correo@ejemplo.com"
                  disabled={isSaving}
                />
              </div>
              {errors.correo && <span className="modal-error-message">{errors.correo}</span>}
            </div>

            {/* Campo Teléfono */}
            <div className="modal-form-group">
              <label htmlFor="telefono">Teléfono</label>
              <div className="modal-input-wrapper">
                <div className="modal-input-icon">
                  <FaPhone />
                </div>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className={errors.telefono ? 'input-error' : ''}
                  placeholder="10 dígitos"
                  disabled={isSaving}
                />
              </div>
              {errors.telefono && <span className="modal-error-message">{errors.telefono}</span>}
            </div>

            {/* Campo Sexo */}
            <div className="modal-form-group">
              <label htmlFor="sexo">Sexo</label>
              <div className="modal-input-wrapper">
                <div className="modal-input-icon">
                  <FaVenusMars />
                </div>
                <select
                  id="sexo"
                  name="sexo"
                  value={formData.sexo}
                  onChange={handleChange}
                  disabled={isSaving}
                >
                  <option value="">Seleccionar</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="modal-btn-cancel" onClick={onClose} disabled={isSaving}>
              Cancelar
            </button>
            <button type="submit" className="modal-btn-save" disabled={isSaving}>
              <img src={saveIcon} alt="Guardar" className="btn-save-icon" />
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEditarPerfil;