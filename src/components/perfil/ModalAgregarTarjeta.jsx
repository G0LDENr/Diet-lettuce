import React, { useState } from 'react';
import { FaCreditCard, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';
import '../../css/Perfil/create-tarjeta.css';

const ModalAgregarTarjeta = ({ isOpen, onClose, userData, tarjetas, onSuccess }) => {
  const [formData, setFormData] = useState({
    nombre_titular: userData?.nombre || '',
    numero_tarjeta: '',
    mes_expiracion: '',
    anio_expiracion: ''
  });
  const [showTarjetaNumber, setShowTarjetaNumber] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'numero_tarjeta') {
      const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
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
      
      const response = await fetch(`http://127.0.0.1:5000/tarjetas/user/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre_titular: formData.nombre_titular,
          numero_tarjeta: formData.numero_tarjeta.replace(/\s/g, ''),
          mes_expiracion: formData.mes_expiracion,
          anio_expiracion: formData.anio_expiracion
        })
      });

      if (response.ok) {
        setSuccessMessage('¡Tarjeta agregada correctamente!');
        setTimeout(() => {
          setSuccessMessage('');
          onSuccess();
          onClose();
        }, 2000);
      } else {
        const errorData = await response.json();
        alert(`❌ Error: ${errorData.msg || 'Error al agregar tarjeta'}`);
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
    <div className="add-tarjeta-modal-overlay" onClick={onClose}>
      <div className="add-tarjeta-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="add-tarjeta-modal-header">
          <div className="add-tarjeta-modal-logo">
            <FaCreditCard />
          </div>
          <div className="add-tarjeta-modal-header-info">
            <h3>Agregar Tarjeta</h3>
            <div className="add-tarjeta-modal-header-subtitle">Ingresa los datos de tu nueva tarjeta</div>
          </div>
          <button className="add-tarjeta-modal-close" onClick={onClose}>✕</button>
        </div>

        {successMessage && (
          <div className="add-tarjeta-modal-success-message">
            <FaCheckCircle className="success-icon" />
            <span>{successMessage}</span>
          </div>
        )}

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
                  maxLength="19"
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button 
                  type="button" 
                  className="add-tarjeta-eye-btn"
                  onClick={() => setShowTarjetaNumber(!showTarjetaNumber)}
                >
                  {showTarjetaNumber ? <FaEyeSlash /> : <FaEye />}
                </button>
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
                {loading ? 'Guardando...' : 'Agregar Tarjeta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalAgregarTarjeta;