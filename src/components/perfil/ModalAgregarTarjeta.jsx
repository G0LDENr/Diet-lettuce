import React, { useState, useEffect } from 'react';
import { FaCreditCard } from 'react-icons/fa';
import '../../css/Perfil/create-tarjeta.css';

const ModalAgregarTarjeta = ({ 
  isOpen, 
  onClose, 
  userData, 
  tarjetas, 
  onSuccess,
  tarjetaToEdit = null
}) => {
  const [formData, setFormData] = useState({
    nombre_titular: '',
    numero_tarjeta: '',
    mes_expiracion: '',
    anio_expiracion: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isEditing = !!tarjetaToEdit;

  // ===== FUNCIÓN PARA FORMATEAR NÚMERO DE TARJETA CON ESPACIOS =====
  const formatCardNumber = (value) => {
    if (!value) return '';
    const clean = value.replace(/\s/g, '');
    const formatted = clean.replace(/(\d{4})/g, '$1 ').trim();
    return formatted;
  };

  // ===== RESETEAR EL FORMULARIO CUANDO SE ABRE EL MODAL =====
  useEffect(() => {
    if (isOpen) {
      if (isEditing && tarjetaToEdit) {
        let numeroMostrar = tarjetaToEdit.numero_completo || '';
        if (!numeroMostrar) {
          numeroMostrar = tarjetaToEdit.numero_enmascarado || '';
        }
        const numeroFormateado = formatCardNumber(numeroMostrar);
        
        setFormData({
          nombre_titular: tarjetaToEdit.nombre_titular || '',
          numero_tarjeta: numeroFormateado,
          mes_expiracion: tarjetaToEdit.mes_expiracion || '',
          anio_expiracion: tarjetaToEdit.anio_expiracion || ''
        });
      } else {
        setFormData({
          nombre_titular: userData?.nombre || '',
          numero_tarjeta: '',
          mes_expiracion: '',
          anio_expiracion: ''
        });
      }
      setErrors({});
      setLoading(false);
    }
  }, [isOpen, userData, tarjetaToEdit, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'numero_tarjeta') {
      const formatted = formatCardNumber(value);
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else if (name === 'mes_expiracion') {
      const mes = value.replace(/[^0-9]/g, '').slice(0, 2);
      if (mes === '' || (parseInt(mes) >= 1 && parseInt(mes) <= 12)) {
        setFormData(prev => ({ ...prev, [name]: mes }));
      }
    } else if (name === 'anio_expiracion') {
      const anio = value.replace(/[^0-9]/g, '').slice(0, 4);
      setFormData(prev => ({ ...prev, [name]: anio }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre_titular.trim()) newErrors.nombre_titular = 'El nombre del titular es requerido';
    if (!formData.numero_tarjeta.trim()) newErrors.numero_tarjeta = 'El número de tarjeta es requerido';
    else {
      const numero = formData.numero_tarjeta.replace(/\s/g, '');
      if (!/^\d{13,19}$/.test(numero)) newErrors.numero_tarjeta = 'Número de tarjeta inválido (13-19 dígitos)';
    }
    if (!formData.mes_expiracion) newErrors.mes_expiracion = 'El mes es requerido';
    if (!formData.anio_expiracion) newErrors.anio_expiracion = 'El año es requerido';
    else {
      const mes = parseInt(formData.mes_expiracion);
      const anio = parseInt(formData.anio_expiracion);
      const fechaActual = new Date();
      const anioActual = fechaActual.getFullYear();
      const mesActual = fechaActual.getMonth() + 1;

      if (anio < anioActual || anio > anioActual + 10) newErrors.anio_expiracion = 'Año inválido';
      else if (anio === anioActual && mes < mesActual) newErrors.mes_expiracion = 'La tarjeta ha expirado';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id || userData?.id;
      
      const numeroCompleto = formData.numero_tarjeta.replace(/\s/g, '');
      const ultimosDigitos = numeroCompleto.slice(-4);
      
      const url = isEditing 
        ? `http://127.0.0.1:5000/tarjetas/${tarjetaToEdit.id}`
        : `http://127.0.0.1:5000/tarjetas/user/${userId}`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre_titular: formData.nombre_titular,
          numero_tarjeta: numeroCompleto,
          mes_expiracion: formData.mes_expiracion,
          anio_expiracion: formData.anio_expiracion
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        const tarjetaConNumero = {
          ...(data.tarjeta || data),
          numero_completo: numeroCompleto,
          ultimos_digitos: ultimosDigitos
        };
        
        // ELIMINADO: setSuccessMessage
        // ELIMINADO: setTimeout con mensaje de éxito
        onSuccess(tarjetaConNumero);
        onClose();
      } else {
        const errorData = await response.json();
        alert(`❌ Error: ${errorData.msg || 'Error al guardar la tarjeta'}`);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error de conexión');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="add-tarjeta-modal-overlay" onClick={onClose}>
      <div className="add-tarjeta-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="add-tarjeta-modal-header">
          <div className="add-tarjeta-modal-logo">
            <FaCreditCard />
          </div>
          <div className="add-tarjeta-modal-header-info">
            <h3>{isEditing ? 'Editar Tarjeta' : 'Agregar Tarjeta'}</h3>
            <div className="add-tarjeta-modal-header-subtitle">
              {isEditing ? 'Actualiza los datos de tu tarjeta' : 'Ingresa los datos de tu nueva tarjeta'}
            </div>
          </div>
          <button className="add-tarjeta-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* ===== ELIMINADO: Mensaje de éxito ===== */}

        <div className="add-tarjeta-modal-body">
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="add-tarjeta-form-group">
              <label htmlFor="nombre_titular">Nombre del Titular</label>
              <div className="add-tarjeta-input-wrapper">
                <div className="add-tarjeta-input-icon">
                  <FaCreditCard />
                </div>
                <input
                  type="text"
                  id="nombre_titular"
                  name="nombre_titular"
                  value={formData.nombre_titular}
                  onChange={handleChange}
                  className={errors.nombre_titular ? 'input-error' : ''}
                  placeholder="Como aparece en la tarjeta"
                  disabled={loading}
                  autoComplete="off"
                />
              </div>
              {errors.nombre_titular && <span className="add-tarjeta-error-message">{errors.nombre_titular}</span>}
            </div>

            <div className="add-tarjeta-form-group">
              <label htmlFor="numero_tarjeta">Número de Tarjeta</label>
              <div className="add-tarjeta-input-wrapper">
                <div className="add-tarjeta-input-icon">
                  <FaCreditCard />
                </div>
                <input
                  type="text"
                  id="numero_tarjeta"
                  name="numero_tarjeta"
                  value={formData.numero_tarjeta}
                  onChange={handleChange}
                  className={errors.numero_tarjeta ? 'input-error' : ''}
                  placeholder="1234 5678 9012 3456"
                  maxLength="23"
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>
              {errors.numero_tarjeta && <span className="add-tarjeta-error-message">{errors.numero_tarjeta}</span>}
            </div>

            <div className="add-tarjeta-form-row">
              <div className="add-tarjeta-form-group">
                <label htmlFor="mes_expiracion">Mes</label>
                <div className="add-tarjeta-input-wrapper">
                  <div className="add-tarjeta-input-icon">
                    <FaCreditCard />
                  </div>
                  <input
                    type="text"
                    id="mes_expiracion"
                    name="mes_expiracion"
                    value={formData.mes_expiracion}
                    onChange={handleChange}
                    className={errors.mes_expiracion ? 'input-error' : ''}
                    placeholder="MM"
                    maxLength="2"
                    disabled={loading}
                    autoComplete="off"
                  />
                </div>
                {errors.mes_expiracion && <span className="add-tarjeta-error-message">{errors.mes_expiracion}</span>}
              </div>

              <div className="add-tarjeta-form-group">
                <label htmlFor="anio_expiracion">Año</label>
                <div className="add-tarjeta-input-wrapper">
                  <div className="add-tarjeta-input-icon">
                    <FaCreditCard />
                  </div>
                  <input
                    type="text"
                    id="anio_expiracion"
                    name="anio_expiracion"
                    value={formData.anio_expiracion}
                    onChange={handleChange}
                    className={errors.anio_expiracion ? 'input-error' : ''}
                    placeholder="AAAA"
                    maxLength="4"
                    disabled={loading}
                    autoComplete="off"
                  />
                </div>
                {errors.anio_expiracion && <span className="add-tarjeta-error-message">{errors.anio_expiracion}</span>}
              </div>
            </div>

            <div className="add-tarjeta-modal-footer">
              <button type="button" className="add-tarjeta-btn-cancel" onClick={onClose} disabled={loading}>
                Cancelar
              </button>
              <button type="submit" className="add-tarjeta-btn-save" disabled={loading}>
                {loading ? 'Guardando...' : (isEditing ? 'Actualizar Tarjeta' : 'Agregar Tarjeta')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalAgregarTarjeta;