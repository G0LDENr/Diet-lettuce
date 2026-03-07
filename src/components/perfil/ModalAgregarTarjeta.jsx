import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import defaultCardIcon from '../../img/tarjeta.png';
import saveIcon from '../../img/mas.png';

const ModalAgregarTarjeta = ({ isOpen, onClose, userData, tarjetas, onSuccess }) => {
  const [tarjetaForm, setTarjetaForm] = useState({
    nombre_titular: userData?.nombre || '',
    numero_tarjeta: '',
    mes_expiracion: '',
    anio_expiracion: '',
    predeterminada: false
  });
  const [showTarjetaNumber, setShowTarjetaNumber] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'numero_tarjeta') {
      const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
      setTarjetaForm(prev => ({ ...prev, [name]: formatted }));
    } else if (name === 'mes_expiracion') {
      const mes = value.replace(/[^0-9]/g, '').slice(0, 2);
      if (mes === '' || (parseInt(mes) >= 1 && parseInt(mes) <= 12)) {
        setTarjetaForm(prev => ({ ...prev, [name]: mes }));
      }
    } else if (name === 'anio_expiracion') {
      const anio = value.replace(/[^0-9]/g, '').slice(0, 4);
      setTarjetaForm(prev => ({ ...prev, [name]: anio }));
    } else {
      setTarjetaForm(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!tarjetaForm.nombre_titular.trim()) newErrors.nombre_titular = 'El nombre del titular es requerido';
    if (!tarjetaForm.numero_tarjeta.trim()) newErrors.numero_tarjeta = 'El número de tarjeta es requerido';
    else {
      const numero = tarjetaForm.numero_tarjeta.replace(/\s/g, '');
      if (!/^\d{13,19}$/.test(numero)) newErrors.numero_tarjeta = 'Número de tarjeta inválido';
    }
    if (!tarjetaForm.mes_expiracion) newErrors.mes_expiracion = 'El mes es requerido';
    if (!tarjetaForm.anio_expiracion) newErrors.anio_expiracion = 'El año es requerido';
    else {
      const mes = parseInt(tarjetaForm.mes_expiracion);
      const anio = parseInt(tarjetaForm.anio_expiracion);
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
      const response = await fetch('http://127.0.0.1:5000/tarjetas/me', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre_titular: tarjetaForm.nombre_titular,
          numero_tarjeta: tarjetaForm.numero_tarjeta.replace(/\s/g, ''),
          mes_expiracion: tarjetaForm.mes_expiracion,
          anio_expiracion: tarjetaForm.anio_expiracion,
          predeterminada: tarjetaForm.predeterminada || tarjetas.length === 0
        })
      });

      if (response.ok) {
        onSuccess();
        onClose();
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
    <div className="perfil-modal-overlay">
      <div className="perfil-modal-content" style={{
        backgroundColor: 'white',
        borderRadius: '15px',
        maxWidth: '500px',
        border: '1px solid #e0e0e0'
      }}>
        <div className="perfil-modal-header" style={{
          padding: '20px',
          borderBottom: '2px solid #96bd44',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ color: '#2d6a4f', margin: 0 }}>Agregar Tarjeta</h3>
          <button className="perfil-close-modal" onClick={onClose} style={{
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#6b7280'
          }}>✕</button>
        </div>

        <div className="perfil-modal-body" style={{ padding: '25px' }}>
          <form onSubmit={handleSubmit}>
            <div className="perfil-form-group" style={{ marginBottom: '20px' }}>
              <label htmlFor="nombre_titular" style={{ color: '#2d6a4f', fontWeight: '500', marginBottom: '8px', display: 'block' }}>
                Nombre del Titular *
              </label>
              <input
                type="text"
                id="nombre_titular"
                name="nombre_titular"
                value={tarjetaForm.nombre_titular}
                onChange={handleChange}
                className={`perfil-search-input ${errors.nombre_titular ? 'perfil-input-error' : ''}`}
                placeholder="Como aparece en la tarjeta"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${errors.nombre_titular ? '#e53e3e' : '#e0e0e0'}`,
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
              {errors.nombre_titular && <span style={{ color: '#e53e3e', fontSize: '0.85rem', marginTop: '5px', display: 'block' }}>{errors.nombre_titular}</span>}
            </div>

            <div className="perfil-form-group" style={{ marginBottom: '20px' }}>
              <label htmlFor="numero_tarjeta" style={{ color: '#2d6a4f', fontWeight: '500', marginBottom: '8px', display: 'block' }}>
                Número de Tarjeta *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showTarjetaNumber ? "text" : "password"}
                  id="numero_tarjeta"
                  name="numero_tarjeta"
                  value={tarjetaForm.numero_tarjeta}
                  onChange={handleChange}
                  className={`perfil-search-input ${errors.numero_tarjeta ? 'perfil-input-error' : ''}`}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${errors.numero_tarjeta ? '#e53e3e' : '#e0e0e0'}`,
                    borderRadius: '8px',
                    fontSize: '1rem',
                    paddingRight: '40px'
                  }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowTarjetaNumber(!showTarjetaNumber)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280'
                  }}
                >
                  <FontAwesomeIcon icon={showTarjetaNumber ? faEyeSlash : faEye} />
                </button>
              </div>
              {errors.numero_tarjeta && <span style={{ color: '#e53e3e', fontSize: '0.85rem', marginTop: '5px', display: 'block' }}>{errors.numero_tarjeta}</span>}
            </div>

            <div className="perfil-form-row" style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
              <div className="perfil-form-group" style={{ flex: 1 }}>
                <label htmlFor="mes_expiracion" style={{ color: '#2d6a4f', fontWeight: '500', marginBottom: '8px', display: 'block' }}>
                  Mes *
                </label>
                <input
                  type="text"
                  id="mes_expiracion"
                  name="mes_expiracion"
                  value={tarjetaForm.mes_expiracion}
                  onChange={handleChange}
                  className={`perfil-search-input ${errors.mes_expiracion ? 'perfil-input-error' : ''}`}
                  placeholder="MM"
                  maxLength="2"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${errors.mes_expiracion ? '#e53e3e' : '#e0e0e0'}`,
                    borderRadius: '8px'
                  }}
                />
                {errors.mes_expiracion && <span style={{ color: '#e53e3e', fontSize: '0.85rem', marginTop: '5px', display: 'block' }}>{errors.mes_expiracion}</span>}
              </div>
              <div className="perfil-form-group" style={{ flex: 1 }}>
                <label htmlFor="anio_expiracion" style={{ color: '#2d6a4f', fontWeight: '500', marginBottom: '8px', display: 'block' }}>
                  Año *
                </label>
                <input
                  type="text"
                  id="anio_expiracion"
                  name="anio_expiracion"
                  value={tarjetaForm.anio_expiracion}
                  onChange={handleChange}
                  className={`perfil-search-input ${errors.anio_expiracion ? 'perfil-input-error' : ''}`}
                  placeholder="AAAA"
                  maxLength="4"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${errors.anio_expiracion ? '#e53e3e' : '#e0e0e0'}`,
                    borderRadius: '8px'
                  }}
                />
                {errors.anio_expiracion && <span style={{ color: '#e53e3e', fontSize: '0.85rem', marginTop: '5px', display: 'block' }}>{errors.anio_expiracion}</span>}
              </div>
            </div>

            <div className="perfil-form-group checkbox-group" style={{ marginBottom: '25px' }}>
              <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="predeterminada"
                  checked={tarjetaForm.predeterminada}
                  onChange={(e) => setTarjetaForm(prev => ({ ...prev, predeterminada: e.target.checked }))}
                  style={{ display: 'none' }}
                />
                <span className="checkbox-custom" style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #96bd44',
                  borderRadius: '4px',
                  display: 'inline-block',
                  position: 'relative',
                  backgroundColor: tarjetaForm.predeterminada ? '#96bd44' : 'transparent'
                }}>
                  {tarjetaForm.predeterminada && (
                    <span style={{ color: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>✓</span>
                  )}
                </span>
                <span style={{ color: '#2d6a4f' }}>Establecer como método de pago predeterminado</span>
              </label>
            </div>

            <div className="perfil-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                type="button" 
                className="perfil-btn-cancel" 
                onClick={onClose}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '12px 25px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="perfil-btn-save" 
                disabled={loading}
                style={{
                  backgroundColor: '#2d6a4f',
                  color: 'white',
                  border: 'none',
                  padding: '12px 25px',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <img src={saveIcon} alt="Agregar" style={{ width: '16px', height: '16px', filter: 'brightness(0) invert(1)' }} />
                {loading ? 'Agregando...' : 'Agregar Tarjeta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalAgregarTarjeta;