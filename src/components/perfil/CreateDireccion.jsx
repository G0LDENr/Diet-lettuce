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
  const [successMessage, setSuccessMessage] = useState('');
  const [coloniasSugerencias, setColoniasSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [inputColonia, setInputColonia] = useState('');
  const [cargandoColonias, setCargandoColonias] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  
  const isEditing = !!direccionToEdit;

  useEffect(() => {
    if (direccionToEdit) {
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
      setInputColonia(direccionToEdit.colonia || '');
    } else {
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
      setInputColonia('');
    }
  }, [direccionToEdit]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, onClose]);

  const buscarInfoPorCP = async (cp) => {
    if (!cp || cp.length !== 5 || !/^\d{5}$/.test(cp)) {
      setColoniasSugerencias([]);
      setMostrarSugerencias(false);
      return;
    }

    setCargandoColonias(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/direcciones/codigo_postal/${cp}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        if (data.ciudad && data.ciudad !== '') {
          setFormData(prev => ({ ...prev, ciudad: data.ciudad }));
        }
        if (data.estado && data.estado !== '') {
          setFormData(prev => ({ ...prev, estado: data.estado }));
        }
        
        if (data.colonias && data.colonias.length > 0) {
          setColoniasSugerencias(data.colonias);
          setMostrarSugerencias(true);
        } else {
          setColoniasSugerencias([]);
          setMostrarSugerencias(false);
        }
      } else {
        setColoniasSugerencias([]);
        setMostrarSugerencias(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setColoniasSugerencias([]);
      setMostrarSugerencias(false);
    } finally {
      setCargandoColonias(false);
    }
  };

  const handleCodigoPostalChange = (e) => {
    const cp = e.target.value;
    setFormData(prev => ({ ...prev, codigo_postal: cp }));
    
    if (errors.codigo_postal) {
      setErrors(prev => ({ ...prev, codigo_postal: '' }));
    }

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      if (cp.length === 5 && /^\d{5}$/.test(cp)) {
        buscarInfoPorCP(cp);
      } else {
        setColoniasSugerencias([]);
        setMostrarSugerencias(false);
      }
    }, 500);
    
    setTimeoutId(newTimeoutId);
  };

  const seleccionarColonia = (colonia) => {
    setFormData(prev => ({ ...prev, colonia: colonia }));
    setInputColonia(colonia);
    setMostrarSugerencias(false);
    if (errors.colonia) {
      setErrors(prev => ({ ...prev, colonia: '' }));
    }
  };

  const handleColoniaChange = (e) => {
    const value = e.target.value;
    setInputColonia(value);
    setFormData(prev => ({ ...prev, colonia: value }));
    
    if (coloniasSugerencias.length > 0 && value) {
      const filtradas = coloniasSugerencias.filter(c => 
        c.toLowerCase().includes(value.toLowerCase())
      );
      setColoniasSugerencias(filtradas);
      setMostrarSugerencias(filtradas.length > 0);
    } else if (coloniasSugerencias.length > 0 && !value) {
      setMostrarSugerencias(true);
    } else {
      setMostrarSugerencias(false);
    }
    
    if (errors.colonia) {
      setErrors(prev => ({ ...prev, colonia: '' }));
    }
  };

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
    if (!validate()) return;
    
    setIsSaving(true);
    try {
      await onSave(formData);
      setSuccessMessage(isEditing ? '¡Dirección actualizada correctamente!' : '¡Dirección agregada correctamente!');
    } catch (error) {
      console.error('Error al guardar:', error);
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="add-dir-modal-overlay" onClick={onClose}>
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
          <button className="add-dir-modal-close" onClick={onClose}>✕</button>
        </div>

        {successMessage && (
          <div className="add-dir-modal-success-message">
            <FaCheckCircle className="success-icon" />
            <span>{successMessage}</span>
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
                  onChange={handleCodigoPostalChange}
                  onKeyDown={(e) => handleKeyDown(e, 'colonia_input')}
                  className={errors.codigo_postal ? 'input-error' : ''}
                  placeholder="12345"
                  maxLength="5"
                  disabled={isSaving}
                />
                {errors.codigo_postal && <span className="add-dir-error-message">{errors.codigo_postal}</span>}
              </div>
            </div>

            <div className="add-dir-form-row">
              <div className="add-dir-form-group add-dir-colonia-group">
                <label htmlFor="colonia_input">Colonia</label>
                <div className="add-dir-colonia-container">
                  <input
                    type="text"
                    id="colonia_input"
                    value={inputColonia}
                    onChange={handleColoniaChange}
                    onKeyDown={(e) => handleKeyDown(e, 'ciudad')}
                    className={errors.colonia ? 'input-error' : ''}
                    placeholder="Nombre de la colonia"
                    disabled={isSaving}
                    autoComplete="off"
                  />
                  {cargandoColonias && (
                    <div className="add-dir-cargando">
                      <FaSpinner className="spinner-icon" />
                      <span>Buscando colonias...</span>
                    </div>
                  )}
                  {mostrarSugerencias && coloniasSugerencias.length > 0 && !cargandoColonias && (
                    <div className="add-dir-sugerencias">
                      {coloniasSugerencias.map((colonia, index) => (
                        <div
                          key={index}
                          className="add-dir-sugerencia-item"
                          onClick={() => seleccionarColonia(colonia)}
                        >
                          <FaSearch className="sugerencia-icon" />
                          <span>{colonia}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
              <button type="button" className="add-dir-btn-cancel" onClick={onClose} disabled={isSaving}>
                Cancelar
              </button>
              <button type="submit" className="add-dir-btn-save" disabled={isSaving}>
                {isSaving ? 'Guardando...' : (isEditing ? 'Actualizar Dirección' : 'Agregar Dirección')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalAgregarDireccion;