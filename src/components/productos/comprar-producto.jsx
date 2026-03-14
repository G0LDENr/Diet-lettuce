import React, { useState, useEffect } from 'react';
import { useConfig } from '../../context/config';
import '../../css/Productos/comprar-producto.css';

// Importar íconos
import closeIcon from '../../img/cancelar.png';
import homeIcon from '../../img/casa.png';
import workIcon from '../../img/trabajo.png';
import otherIcon from '../../img/ubicacion.png';
import addIcon from '../../img/mas.png';
import visaIcon from '../../img/visa.png';
import mastercardIcon from '../../img/mastercard.png';
import amexIcon from '../../img/amex.png';
import defaultCardIcon from '../../img/tarjeta.png';
import estrellaIcon from '../../img/estrella.png';

const ComprarProductoModal = ({ producto, onClose, onOrderCreated }) => {
  const { darkMode } = useConfig();
  
  // Estados del modal
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingDirecciones, setLoadingDirecciones] = useState(false);
  const [loadingTarjetas, setLoadingTarjetas] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [ordenCreada, setOrdenCreada] = useState(null);
  
  // Verificar autenticación
  const isAuthenticated = localStorage.getItem('token') !== null;
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    telefono_usuario: '',
    tipo_pedido: 'suplemento',
    suplemento_id: producto.id,
    direccion_id: null,
    direccion_texto: '',
    metodo_pago: 'efectivo',
    precio: producto.precio,
    cantidad: 1
  });
  
  // Estados para direcciones
  const [direcciones, setDirecciones] = useState([]);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    calle: '',
    numero_exterior: '',
    numero_interior: '',
    colonia: '',
    ciudad: '',
    estado: '',
    codigo_postal: '',
    referencias: '',
    tipo: 'casa',
    predeterminada: false
  });

  // Estados para tarjetas guardadas
  const [userTarjetas, setUserTarjetas] = useState([]);
  const [selectedTarjetaId, setSelectedTarjetaId] = useState(null);
  const [useSavedCard, setUseSavedCard] = useState(true);
  const [showNewCardForm, setShowNewCardForm] = useState(false);

  // Estados para formulario de tarjeta
  const [tarjetaForm, setTarjetaForm] = useState({
    nombre_titular: '',
    numero_tarjeta: '',
    fecha_vencimiento: '',
    cvv: '',
    tipo_tarjeta: 'visa'
  });
  const [aceptoTerminos, setAceptoTerminos] = useState(false);

  // Función para obtener icono de tarjeta
  const getTarjetaIcon = (tipo) => {
    switch(tipo) {
      case 'visa': return visaIcon;
      case 'mastercard': return mastercardIcon;
      case 'amex': return amexIcon;
      default: return defaultCardIcon;
    }
  };

  // Formatear número de tarjeta
  const formatearNumeroTarjeta = (numero) => {
    if (!numero) return "**** **** **** 1234";
    if (numero.includes('*')) return numero;
    const ultimos4 = numero.slice(-4);
    return `**** **** **** ${ultimos4}`;
  };

  // Cargar datos iniciales
  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
      fetchDirecciones();
      fetchUserTarjetas();
    } else {
      setDirecciones([]);
      setUserTarjetas([]);
    }
  }, [isAuthenticated]);

  const loadUserData = () => {
    try {
      const userStr = localStorage.getItem('user') || localStorage.getItem('userData');
      if (userStr) {
        const user = JSON.parse(userStr);
        setFormData(prev => ({
          ...prev,
          nombre_usuario: user.nombre || '',
          telefono_usuario: user.telefono || ''
        }));
      }
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
    }
  };

  const fetchDirecciones = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoadingDirecciones(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://127.0.0.1:5000/direcciones/me/direcciones', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const direccionesData = data.direcciones || [];
        setDirecciones(direccionesData);
        
        const direccionPredeterminada = direccionesData.find(dir => dir.predeterminada);
        if (direccionPredeterminada) {
          handleDireccionSelect(direccionPredeterminada);
        }
      } else {
        console.error('Error al obtener direcciones:', response.status);
        setDirecciones([]);
      }
    } catch (error) {
      console.error('Error de conexión al obtener direcciones:', error);
      setDirecciones([]);
    } finally {
      setLoadingDirecciones(false);
    }
  };

  const fetchUserTarjetas = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      setLoadingTarjetas(true);
      const response = await fetch('http://127.0.0.1:5000/tarjetas/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const tarjetasData = data.tarjetas || [];
        setUserTarjetas(tarjetasData);
        
        if (tarjetasData.length > 0) {
          const predeterminada = tarjetasData.find(t => t.predeterminada);
          if (predeterminada) {
            setSelectedTarjetaId(predeterminada.id);
          } else {
            setSelectedTarjetaId(tarjetasData[0].id);
          }
          setUseSavedCard(true);
          setShowNewCardForm(false);
        }
      }
    } catch (error) {
      console.error('Error al obtener tarjetas:', error);
    } finally {
      setLoadingTarjetas(false);
    }
  };

  // ========== MANEJADORES DE EVENTOS ==========
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNewAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleTarjetaChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    
    if (name === 'numero_tarjeta') {
      newValue = value.replace(/\D/g, '').slice(0, 16);
      if (newValue.length > 0) {
        newValue = newValue.match(/.{1,4}/g).join(' ');
      }
      
      const firstDigit = newValue.charAt(0);
      if (firstDigit === '4') {
        setTarjetaForm(prev => ({ ...prev, tipo_tarjeta: 'visa' }));
      } else if (firstDigit === '5') {
        setTarjetaForm(prev => ({ ...prev, tipo_tarjeta: 'mastercard' }));
      } else if (firstDigit === '3') {
        setTarjetaForm(prev => ({ ...prev, tipo_tarjeta: 'amex' }));
      }
    } else if (name === 'fecha_vencimiento') {
      newValue = value.replace(/\D/g, '').slice(0, 4);
      if (newValue.length >= 2) {
        newValue = newValue.slice(0, 2) + '/' + newValue.slice(2);
      }
    } else if (name === 'cvv') {
      newValue = value.replace(/\D/g, '');
      const maxLength = tarjetaForm.tipo_tarjeta === 'amex' ? 4 : 3;
      newValue = newValue.slice(0, maxLength);
    }
    
    setTarjetaForm(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleDireccionSelect = (direccion) => {
    const direccionTexto = `${direccion.calle} #${direccion.numero_exterior}${direccion.numero_interior ? ` Int. ${direccion.numero_interior}` : ''}, ${direccion.colonia}, ${direccion.ciudad}, ${direccion.estado}, CP: ${direccion.codigo_postal}`;
    
    setFormData(prev => ({
      ...prev,
      direccion_id: direccion.id,
      direccion_texto: direccionTexto
    }));
    
    setShowNewAddressForm(false);
    
    if (errors.direccion) {
      setErrors(prev => ({ ...prev, direccion: '' }));
    }
  };

  const handleCardSelect = (tarjeta) => {
    setSelectedTarjetaId(tarjeta.id);
    setUseSavedCard(true);
    setShowNewCardForm(false);
  };

  const saveNewAddress = async () => {
    if (!isAuthenticated) {
      const direccionTexto = `${newAddress.calle} #${newAddress.numero_exterior}${newAddress.numero_interior ? ` Int. ${newAddress.numero_interior}` : ''}, ${newAddress.colonia}, ${newAddress.ciudad}, ${newAddress.estado}, CP: ${newAddress.codigo_postal}`;
      
      setFormData(prev => ({
        ...prev,
        direccion_id: null,
        direccion_texto: direccionTexto
      }));
      
      return true;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://127.0.0.1:5000/direcciones/me/direcciones', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAddress)
      });

      if (response.ok) {
        const data = await response.json();
        const direccionTexto = `${data.direccion.calle} #${data.direccion.numero_exterior}${data.direccion.numero_interior ? ` Int. ${data.direccion.numero_interior}` : ''}, ${data.direccion.colonia}, ${data.direccion.ciudad}, ${data.direccion.estado}, CP: ${data.direccion.codigo_postal}`;
        
        setFormData(prev => ({
          ...prev,
          direccion_id: data.direccion.id,
          direccion_texto: direccionTexto
        }));
        
        fetchDirecciones();
        return true;
      } else {
        const errorData = await response.json();
        alert(`Error al guardar dirección: ${errorData.msg || 'Error desconocido'}`);
        return false;
      }
    } catch (error) {
      console.error('Error al guardar dirección:', error);
      alert('Error de conexión al guardar dirección');
      return false;
    }
  };

  // ========== FUNCIONES DE VALIDACIÓN ==========
  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.nombre_usuario.trim()) {
      newErrors.nombre_usuario = 'El nombre es requerido';
    } else if (formData.nombre_usuario.trim().length < 2) {
      newErrors.nombre_usuario = 'El nombre debe tener al menos 2 caracteres';
    }
    
    if (!formData.telefono_usuario.trim()) {
      newErrors.telefono_usuario = 'El teléfono es requerido';
    } else {
      const telefono = formData.telefono_usuario.trim();
      const formatoValido = /^(\+52\d{10}|\d{10})$/.test(telefono);
      
      if (!formatoValido) {
        newErrors.telefono_usuario = 'Formato: 10 dígitos o +52 seguido de 10 dígitos';
      }
    }
    
    if (formData.cantidad < 1) {
      newErrors.cantidad = 'La cantidad debe ser al menos 1';
    } else if (formData.cantidad > 10) {
      newErrors.cantidad = 'La cantidad máxima es 10';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (isAuthenticated && direcciones.length > 0 && !showNewAddressForm) {
      if (!formData.direccion_id) {
        newErrors.direccion = 'Selecciona una dirección de tu lista';
      }
    }
    
    if (showNewAddressForm || !isAuthenticated || direcciones.length === 0) {
      if (!newAddress.calle.trim()) newErrors.calle = 'La calle es requerida';
      if (!newAddress.numero_exterior.trim()) newErrors.numero_exterior = 'El número exterior es requerido';
      if (!newAddress.colonia.trim()) newErrors.colonia = 'La colonia es requerida';
      if (!newAddress.ciudad.trim()) newErrors.ciudad = 'La ciudad es requerida';
      if (!newAddress.estado.trim()) newErrors.estado = 'El estado es requerido';
      if (!newAddress.codigo_postal.trim()) newErrors.codigo_postal = 'El código postal es requerido';
      else if (!/^\d{5}$/.test(newAddress.codigo_postal)) newErrors.codigo_postal = 'El código postal debe tener 5 dígitos';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateTarjeta = () => {
    const errors = {};
    
    const numeroLimpio = tarjetaForm.numero_tarjeta.replace(/\s/g, '');
    if (numeroLimpio.length !== 16) {
      errors.numero_tarjeta = 'El número de tarjeta debe tener 16 dígitos';
    } else if (!/^\d+$/.test(numeroLimpio)) {
      errors.numero_tarjeta = 'El número de tarjeta solo debe contener dígitos';
    }
    
    if (!tarjetaForm.nombre_titular.trim()) {
      errors.nombre_titular = 'El nombre del titular es requerido';
    } else if (tarjetaForm.nombre_titular.trim().length < 3) {
      errors.nombre_titular = 'El nombre debe tener al menos 3 caracteres';
    }
    
    const fechaRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
    if (!fechaRegex.test(tarjetaForm.fecha_vencimiento)) {
      errors.fecha_vencimiento = 'Formato inválido (MM/YY)';
    } else {
      const [mes, año] = tarjetaForm.fecha_vencimiento.split('/');
      const ahora = new Date();
      const añoActual = ahora.getFullYear() % 100;
      const mesActual = ahora.getMonth() + 1;
      
      const añoNum = parseInt(año, 10);
      const mesNum = parseInt(mes, 10);
      
      if (añoNum < añoActual || (añoNum === añoActual && mesNum < mesActual)) {
        errors.fecha_vencimiento = 'La tarjeta está vencida';
      }
    }
    
    const cvvLength = tarjetaForm.tipo_tarjeta === 'amex' ? 4 : 3;
    if (!tarjetaForm.cvv) {
      errors.cvv = 'El CVV es requerido';
    } else if (tarjetaForm.cvv.length !== cvvLength) {
      errors.cvv = tarjetaForm.tipo_tarjeta === 'amex' 
        ? 'El CVV de Amex tiene 4 dígitos' 
        : 'El CVV tiene 3 dígitos';
    } else if (!/^\d+$/.test(tarjetaForm.cvv)) {
      errors.cvv = 'El CVV solo debe contener dígitos';
    }
    
    if (!aceptoTerminos) {
      errors.terminos = 'Debes aceptar los términos y condiciones';
    }
    
    return errors;
  };

  const validateStep3 = () => {
    if (formData.metodo_pago === 'tarjeta') {
      if (isAuthenticated && useSavedCard && selectedTarjetaId) {
        return true;
      }
      const tarjetaErrors = validateTarjeta();
      if (Object.keys(tarjetaErrors).length > 0) {
        setErrors(tarjetaErrors);
        return false;
      }
    }
    return true;
  };

  // ========== FUNCIONES DE NAVEGACIÓN ==========
  const handleNextStep = async () => {
    if (step === 1) {
      if (!validateStep1()) return;
      setStep(2);
    } else if (step === 2) {
      if (!validateStep2()) return;
      
      if (showNewAddressForm || !isAuthenticated || direcciones.length === 0) {
        const saved = await saveNewAddress();
        if (!saved) return;
      }
      
      setStep(3);
    } else if (step === 3) {
      if (!validateStep3()) return;
      setStep(4);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // ========== FUNCIÓN PRINCIPAL CORREGIDA (CON NOTIFICACIONES) ==========
  const handleSubmitOrder = async () => {
    try {
      setLoading(true);
      
      let direccionTextoFinal = formData.direccion_texto;
      
      if (!direccionTextoFinal || direccionTextoFinal.trim() === '' || direccionTextoFinal === 'null') {
        if (showNewAddressForm || !isAuthenticated || direcciones.length === 0) {
          if (newAddress.calle && newAddress.numero_exterior && newAddress.colonia && newAddress.ciudad && newAddress.estado && newAddress.codigo_postal) {
            direccionTextoFinal = `${newAddress.calle} #${newAddress.numero_exterior}${newAddress.numero_interior ? ` Int. ${newAddress.numero_interior}` : ''}, ${newAddress.colonia}, ${newAddress.ciudad}, ${newAddress.estado}, CP: ${newAddress.codigo_postal}`;
          } else {
            direccionTextoFinal = 'Dirección no especificada';
          }
        } else if (formData.direccion_id && direcciones.length > 0) {
          const direccionSeleccionada = direcciones.find(d => d.id === formData.direccion_id);
          if (direccionSeleccionada) {
            direccionTextoFinal = `${direccionSeleccionada.calle} #${direccionSeleccionada.numero_exterior}${direccionSeleccionada.numero_interior ? ` Int. ${direccionSeleccionada.numero_interior}` : ''}, ${direccionSeleccionada.colonia}, ${direccionSeleccionada.ciudad}, ${direccionSeleccionada.estado}, CP: ${direccionSeleccionada.codigo_postal}`;
          } else {
            direccionTextoFinal = 'Dirección no especificada';
          }
        } else {
          direccionTextoFinal = 'Dirección no especificada';
        }
      }
      
      // Calcular total
      const totalCalculado = producto.precio * formData.cantidad;
      
      // Preparar datos para la orden - CON TODOS LOS CAMPOS NECESARIOS PARA NOTIFICACIONES
      const orderData = {
        // Campos requeridos por el modelo
        nombre_usuario: formData.nombre_usuario.trim(),
        telefono_usuario: formData.telefono_usuario.trim(),
        tipo_pedido: 'suplemento',
        suplemento_id: producto.id,
        cantidad: formData.cantidad,
        precio_unitario: producto.precio,
        precio_total: totalCalculado,
        metodo_pago: formData.metodo_pago,
        direccion_texto: direccionTextoFinal,
        
        // Campos opcionales
        direccion_id: formData.direccion_id || null,
        notas: `Pedido de ${producto.nombre} - Cantidad: ${formData.cantidad}`,
        
        // Información de pago para tarjeta (necesaria para notificaciones)
        info_pago: null
      };

      // Agregar información de pago con tarjeta si aplica
      if (formData.metodo_pago === 'tarjeta') {
        if (isAuthenticated && useSavedCard && selectedTarjetaId) {
          orderData.tarjeta_id = selectedTarjetaId;
        } else {
          const numeroLimpio = tarjetaForm.numero_tarjeta.replace(/\s/g, '');
          orderData.info_pago = {
            tipo: tarjetaForm.tipo_tarjeta,
            ultimos_4_digitos: numeroLimpio.slice(-4),
            titular: tarjetaForm.nombre_titular
          };
        }
      }
      
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      console.log('📦 DATOS ENVIADOS AL BACKEND:');
      console.log(JSON.stringify(orderData, null, 2));
      
      const response = await fetch('http://127.0.0.1:5000/ordenes/', {
        method: 'POST',
        headers,
        body: JSON.stringify(orderData)
      });
      
      if (response.ok) {
        const result = await response.json();
        
        console.log('✅ RESPUESTA DEL SERVIDOR:');
        console.log(JSON.stringify(result, null, 2));
        
        setOrdenCreada(result.orden);
        setSuccessMessage(`¡Pedido creado exitosamente! Código: ${result.orden?.codigo_unico || 'N/A'}`);
        
        setTimeout(() => {
          if (onOrderCreated) {
            onOrderCreated(result.orden);
          }
          onClose();
        }, 3000);
        
      } else {
        const errorData = await response.json();
        console.error('❌ ERROR DEL SERVIDOR:', errorData);
        alert(`❌ Error al crear el pedido: ${errorData.msg || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      alert('❌ Error de conexión. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price || 0);
  };

  const totalPrice = formData.precio * formData.cantidad;

  // ========== FUNCIONES DE RENDERIZADO ==========
  const renderStep1 = () => (
    <div className="comprar-checkout-paso">
      <div className="comprar-paso-header">
        <div className="comprar-paso-indicador">
          <span className={`comprar-paso-numero ${step >= 1 ? 'activo' : ''}`}>1</span>
          <span className={`comprar-paso-linea ${step >= 2 ? 'activo' : ''}`}></span>
          <span className={`comprar-paso-numero ${step >= 2 ? 'activo' : ''}`}>2</span>
          <span className={`comprar-paso-linea ${step >= 3 ? 'activo' : ''}`}></span>
          <span className={`comprar-paso-numero ${step >= 3 ? 'activo' : ''}`}>3</span>
          <span className={`comprar-paso-linea ${step >= 4 ? 'activo' : ''}`}></span>
          <span className={`comprar-paso-numero ${step >= 4 ? 'activo' : ''}`}>4</span>
        </div>
        <div className="comprar-paso-titulos">
          <span className={`comprar-paso-titulo ${step >= 1 ? 'activo' : ''}`}>Datos</span>
          <span className={`comprar-paso-titulo ${step >= 2 ? 'activo' : ''}`}>Dirección</span>
          <span className={`comprar-paso-titulo ${step >= 3 ? 'activo' : ''}`}>Pago</span>
          <span className={`comprar-paso-titulo ${step >= 4 ? 'activo' : ''}`}>Confirmar</span>
        </div>
      </div>

      <div className="comprar-info-container">
        <h3>Información personal</h3>
        <p className="comprar-info-subtitulo">Ingresa tus datos para la entrega del pedido</p>
        
        <div className="comprar-info-formulario">
          <div className="comprar-form-grid">
            <div className="comprar-form-group">
              <label>Nombre completo *</label>
              {isAuthenticated ? (
                <>
                  <input
                    type="text"
                    name="nombre_usuario"
                    value={formData.nombre_usuario}
                    readOnly
                    className="comprar-form-input comprar-readonly-input"
                  />
                  <div className="comprar-field-info">
                    <small>Obtenido de tu perfil (solo lectura)</small>
                  </div>
                </>
              ) : (
                <input
                  type="text"
                  name="nombre_usuario"
                  value={formData.nombre_usuario}
                  onChange={handleInputChange}
                  placeholder="Tu nombre completo"
                  className={`comprar-form-input ${errors.nombre_usuario ? 'comprar-input-error' : ''}`}
                />
              )}
              {errors.nombre_usuario && <span className="comprar-error-message">{errors.nombre_usuario}</span>}
            </div>
            
            <div className="comprar-form-group">
              <label>Teléfono *</label>
              {isAuthenticated ? (
                <>
                  <input
                    type="tel"
                    name="telefono_usuario"
                    value={formData.telefono_usuario}
                    readOnly
                    className="comprar-form-input comprar-readonly-input"
                  />
                  <div className="comprar-field-info">
                    <small>Obtenido de tu perfil (solo lectura)</small>
                  </div>
                </>
              ) : (
                <>
                  <input
                    type="tel"
                    name="telefono_usuario"
                    value={formData.telefono_usuario}
                    onChange={handleInputChange}
                    placeholder="10 dígitos o +521234567890"
                    className={`comprar-form-input ${errors.telefono_usuario ? 'comprar-input-error' : ''}`}
                  />
                  <small className="comprar-form-hint">Formato: 10 dígitos o +52 seguido de 10 dígitos</small>
                </>
              )}
              {errors.telefono_usuario && <span className="comprar-error-message">{errors.telefono_usuario}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="comprar-info-container" style={{ marginTop: '20px' }}>
        <h3>Cantidad</h3>
        <div className="comprar-form-group">
          <div className="comprar-cantidad-control">
            <label style={{ minWidth: '70px' }}>Cantidad:</label>
            <div className="comprar-cantidad-buttons">
              <button 
                type="button"
                className="comprar-cantidad-btn comprar-decrement"
                onClick={() => setFormData(prev => ({ ...prev, cantidad: Math.max(1, prev.cantidad - 1) }))}
                disabled={loading}
              >
                −
              </button>
              <span className="comprar-cantidad-value">{formData.cantidad}</span>
              <button 
                type="button"
                className="comprar-cantidad-btn comprar-increment"
                onClick={() => setFormData(prev => ({ ...prev, cantidad: Math.min(10, prev.cantidad + 1) }))}
                disabled={loading}
              >
                +
              </button>
            </div>
          </div>
          {errors.cantidad && <span className="comprar-error-message">{errors.cantidad}</span>}
        </div>
      </div>

      <div className="comprar-resumen-final">
        <div className="comprar-resumen-final-header">
          <h3>Resumen del Pedido</h3>
        </div>
        
        <div className="comprar-resumen-final-detalle">
          <div className="comprar-resumen-row">
            <span>{producto.nombre}</span>
            <span>{formatPrice(producto.precio)} c/u</span>
          </div>
          <div className="comprar-resumen-row">
            <span>Cantidad</span>
            <span>{formData.cantidad}</span>
          </div>
          <div className="comprar-resumen-separador"></div>
          <div className="comprar-resumen-row comprar-total">
            <strong>Total a pagar</strong>
            <strong className="comprar-total-precio">{formatPrice(totalPrice)}</strong>
          </div>
        </div>
      </div>

      <div className="comprar-checkout-navigation">
        <button 
          onClick={handlePrevStep}
          className="comprar-btn-nav comprar-prev-btn"
          disabled={step === 1}
        >
          <img src={require('../../img/izquierda.png')} alt="Anterior" className="comprar-btn-icon" />
          Volver
        </button>
        <button 
          onClick={handleNextStep}
          className="comprar-btn-nav comprar-next-btn"
        >
          Continuar al Pago
          <img src={require('../../img/derecha.png')} alt="Siguiente" className="comprar-btn-icon" />
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="comprar-checkout-paso">
      <div className="comprar-paso-header">
        <div className="comprar-paso-indicador">
          <span className="comprar-paso-numero completado">✓</span>
          <span className="comprar-paso-linea activo"></span>
          <span className={`comprar-paso-numero ${step >= 2 ? 'activo' : ''}`}>2</span>
          <span className={`comprar-paso-linea ${step >= 3 ? 'activo' : ''}`}></span>
          <span className={`comprar-paso-numero ${step >= 3 ? '' : ''}`}>3</span>
          <span className={`comprar-paso-linea ${step >= 4 ? 'activo' : ''}`}></span>
          <span className={`comprar-paso-numero ${step >= 4 ? '' : ''}`}>4</span>
        </div>
        <div className="comprar-paso-titulos">
          <span className="comprar-paso-titulo completado">Datos</span>
          <span className={`comprar-paso-titulo ${step >= 2 ? 'activo' : ''}`}>Dirección</span>
          <span className={`comprar-paso-titulo ${step >= 3 ? '' : ''}`}>Pago</span>
          <span className={`comprar-paso-titulo ${step >= 4 ? '' : ''}`}>Confirmar</span>
        </div>
      </div>

      <div className="comprar-direccion-container">
        <h3>Dirección de entrega</h3>
        <p className="comprar-direccion-subtitulo">Selecciona o ingresa la dirección donde quieres recibir tu pedido</p>
        
        {isAuthenticated && direcciones.length > 0 && !showNewAddressForm && (
          <div className="comprar-form-section">
            <h4>Tus direcciones guardadas</h4>
            {loadingDirecciones ? (
              <div className="comprar-loading-direcciones">
                <div className="comprar-spinner comprar-small"></div>
                <p>Cargando direcciones...</p>
              </div>
            ) : (
              <>
                <div className="comprar-direcciones-guardadas">
                  {direcciones.map((direccion) => (
                    <div 
                      key={direccion.id} 
                      className={`comprar-direccion-guardada ${formData.direccion_id === direccion.id ? 'seleccionada' : ''}`}
                      onClick={() => handleDireccionSelect(direccion)}
                    >
                      <div className="comprar-direccion-guardada-header">
                        <div className="comprar-direccion-tipo">
                          {direccion.tipo === 'casa' ? (
                            <img src={homeIcon} alt="Casa" className="comprar-direccion-icon" />
                          ) : direccion.tipo === 'trabajo' ? (
                            <img src={workIcon} alt="Trabajo" className="comprar-direccion-icon" />
                          ) : (
                            <img src={otherIcon} alt="Otro" className="comprar-direccion-icon" />
                          )}
                          <span>{direccion.tipo === 'casa' ? 'Casa' : direccion.tipo === 'trabajo' ? 'Trabajo' : 'Otro'}</span>
                          {direccion.predeterminada && (
                            <span className="comprar-direccion-pred">Predeterminada</span>
                          )}
                        </div>
                        <div className="comprar-direccion-radio">
                          <input 
                            type="radio" 
                            name="savedAddress" 
                            checked={formData.direccion_id === direccion.id}
                            onChange={() => handleDireccionSelect(direccion)}
                          />
                        </div>
                      </div>
                      <div className="comprar-direccion-info">
                        <p><strong>{direccion.calle} #{direccion.numero_exterior}</strong>{direccion.numero_interior ? ` Int. ${direccion.numero_interior}` : ''}</p>
                        <p>{direccion.colonia}, {direccion.ciudad}, {direccion.estado}</p>
                        <p>CP: {direccion.codigo_postal}</p>
                        {direccion.referencias && (
                          <p className="comprar-direccion-referencias">
                            <small>Referencias: {direccion.referencias}</small>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <button 
                  type="button"
                  className="comprar-btn-agregar-direccion"
                  onClick={() => {
                    setShowNewAddressForm(true);
                    setNewAddress({
                      calle: '',
                      numero_exterior: '',
                      numero_interior: '',
                      colonia: '',
                      ciudad: '',
                      estado: '',
                      codigo_postal: '',
                      referencias: '',
                      tipo: 'casa',
                      predeterminada: false
                    });
                  }}
                >
                  <img src={addIcon} alt="Agregar" className="comprar-btn-icon-left" />
                  Agregar nueva dirección
                </button>
              </>
            )}
          </div>
        )}

        {(showNewAddressForm || !isAuthenticated || direcciones.length === 0) && (
          <div className="comprar-form-section">
            <h4>{isAuthenticated ? 'Nueva dirección' : 'Dirección de entrega'}</h4>
            
            {isAuthenticated && direcciones.length > 0 && (
              <button 
                type="button"
                className="comprar-btn-volver-direcciones"
                onClick={() => setShowNewAddressForm(false)}
              >
                ← Volver a direcciones guardadas
              </button>
            )}
            
            <div className="comprar-direccion-formulario">
              <div className="comprar-form-grid">
                <div className="comprar-form-group">
                  <label>Calle *</label>
                  <input
                    type="text"
                    name="calle"
                    value={newAddress.calle}
                    onChange={handleNewAddressChange}
                    className={`comprar-form-input ${errors.calle ? 'comprar-input-error' : ''}`}
                    placeholder="Nombre de la calle"
                  />
                  {errors.calle && <span className="comprar-error-message">{errors.calle}</span>}
                </div>
                
                <div className="comprar-form-group">
                  <label>Número Exterior *</label>
                  <input
                    type="text"
                    name="numero_exterior"
                    value={newAddress.numero_exterior}
                    onChange={handleNewAddressChange}
                    className={`comprar-form-input ${errors.numero_exterior ? 'comprar-input-error' : ''}`}
                    placeholder="123"
                  />
                  {errors.numero_exterior && <span className="comprar-error-message">{errors.numero_exterior}</span>}
                </div>
                
                <div className="comprar-form-group">
                  <label>Número Interior</label>
                  <input
                    type="text"
                    name="numero_interior"
                    value={newAddress.numero_interior}
                    onChange={handleNewAddressChange}
                    className="comprar-form-input"
                    placeholder="A (opcional)"
                  />
                </div>
                
                <div className="comprar-form-group">
                  <label>Colonia *</label>
                  <input
                    type="text"
                    name="colonia"
                    value={newAddress.colonia}
                    onChange={handleNewAddressChange}
                    className={`comprar-form-input ${errors.colonia ? 'comprar-input-error' : ''}`}
                    placeholder="Nombre de la colonia"
                  />
                  {errors.colonia && <span className="comprar-error-message">{errors.colonia}</span>}
                </div>
                
                <div className="comprar-form-group">
                  <label>Ciudad *</label>
                  <input
                    type="text"
                    name="ciudad"
                    value={newAddress.ciudad}
                    onChange={handleNewAddressChange}
                    className={`comprar-form-input ${errors.ciudad ? 'comprar-input-error' : ''}`}
                    placeholder="Nombre de la ciudad"
                  />
                  {errors.ciudad && <span className="comprar-error-message">{errors.ciudad}</span>}
                </div>
                
                <div className="comprar-form-group">
                  <label>Estado *</label>
                  <input
                    type="text"
                    name="estado"
                    value={newAddress.estado}
                    onChange={handleNewAddressChange}
                    className={`comprar-form-input ${errors.estado ? 'comprar-input-error' : ''}`}
                    placeholder="Nombre del estado"
                  />
                  {errors.estado && <span className="comprar-error-message">{errors.estado}</span>}
                </div>
                
                <div className="comprar-form-group">
                  <label>Código Postal *</label>
                  <input
                    type="text"
                    name="codigo_postal"
                    value={newAddress.codigo_postal}
                    onChange={handleNewAddressChange}
                    className={`comprar-form-input ${errors.codigo_postal ? 'comprar-input-error' : ''}`}
                    placeholder="12345"
                    maxLength="5"
                  />
                  {errors.codigo_postal && <span className="comprar-error-message">{errors.codigo_postal}</span>}
                  <small className="comprar-form-hint">5 dígitos</small>
                </div>
                
                <div className="comprar-form-group">
                  <label>Tipo de Dirección</label>
                  <select
                    name="tipo"
                    value={newAddress.tipo}
                    onChange={handleNewAddressChange}
                    className="comprar-form-select"
                  >
                    <option value="casa">Casa</option>
                    <option value="trabajo">Trabajo</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                
                <div className="comprar-form-group comprar-full-width">
                  <label>Referencias (opcional)</label>
                  <textarea
                    name="referencias"
                    value={newAddress.referencias}
                    onChange={handleNewAddressChange}
                    placeholder="Entre calles, puntos de referencia, color de la casa, etc."
                    rows="3"
                    className="comprar-form-textarea"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {errors.direccion && (
          <div className="comprar-error-message" style={{ marginTop: '10px' }}>
            {errors.direccion}
          </div>
        )}
      </div>

      <div className="comprar-checkout-navigation">
        <button 
          onClick={handlePrevStep}
          className="comprar-btn-nav comprar-prev-btn"
        >
          <img src={require('../../img/izquierda.png')} alt="Anterior" className="comprar-btn-icon" />
          Volver a Datos
        </button>
        <button 
          onClick={handleNextStep}
          className="comprar-btn-nav comprar-next-btn"
        >
          Continuar al Pago
          <img src={require('../../img/derecha.png')} alt="Siguiente" className="comprar-btn-icon" />
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="comprar-checkout-paso">
      <div className="comprar-paso-header">
        <div className="comprar-paso-indicador">
          <span className="comprar-paso-numero completado">✓</span>
          <span className="comprar-paso-linea activo"></span>
          <span className="comprar-paso-numero completado">✓</span>
          <span className="comprar-paso-linea activo"></span>
          <span className={`comprar-paso-numero ${step >= 3 ? 'activo' : ''}`}>3</span>
          <span className={`comprar-paso-linea ${step >= 4 ? 'activo' : ''}`}></span>
          <span className={`comprar-paso-numero ${step >= 4 ? '' : ''}`}>4</span>
        </div>
        <div className="comprar-paso-titulos">
          <span className="comprar-paso-titulo completado">Datos</span>
          <span className="comprar-paso-titulo completado">Dirección</span>
          <span className={`comprar-paso-titulo ${step >= 3 ? 'activo' : ''}`}>Pago</span>
          <span className={`comprar-paso-titulo ${step >= 4 ? '' : ''}`}>Confirmar</span>
        </div>
      </div>

      <div className="comprar-pago-container">
        <div className="comprar-pago-metodos">
          <h3>Método de pago</h3>
          
          <div className="comprar-metodos-grid">
            <div 
              className={`comprar-metodo-pago-card ${formData.metodo_pago === 'efectivo' ? 'seleccionado' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, metodo_pago: 'efectivo' }))}
            >
              <div className="comprar-metodo-icon">💵</div>
              <div className="comprar-metodo-info">
                <h4>Pago en Efectivo</h4>
                <p>Paga cuando recibas tu pedido</p>
                <div className="comprar-metodo-desc">
                  Entrega el dinero al repartidor al momento de la entrega.
                </div>
              </div>
              <div className="comprar-metodo-radio">
                <input 
                  type="radio" 
                  name="metodoPago" 
                  checked={formData.metodo_pago === 'efectivo'}
                  onChange={() => setFormData(prev => ({ ...prev, metodo_pago: 'efectivo' }))}
                />
              </div>
            </div>
            
            <div 
              className={`comprar-metodo-pago-card ${formData.metodo_pago === 'tarjeta' ? 'seleccionado' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, metodo_pago: 'tarjeta' }))}
            >
              <div className="comprar-metodo-icon">💳</div>
              <div className="comprar-metodo-info">
                <h4>Pago con Tarjeta</h4>
                <p>Pago seguro en línea</p>
                <div className="comprar-metodo-desc">
                  Paga ahora con tarjeta de crédito o débito.
                </div>
              </div>
              <div className="comprar-metodo-radio">
                <input 
                  type="radio" 
                  name="metodoPago" 
                  checked={formData.metodo_pago === 'tarjeta'}
                  onChange={() => setFormData(prev => ({ ...prev, metodo_pago: 'tarjeta' }))}
                />
              </div>
            </div>
          </div>
        </div>

        {formData.metodo_pago === 'tarjeta' && (
          <div className="comprar-tarjeta-form-container">
            <h3>Información de pago con tarjeta</h3>
            
            {/* Tarjetas guardadas del usuario */}
            {isAuthenticated && userTarjetas.length > 0 && !showNewCardForm && (
              <div className="comprar-tarjetas-guardadas-section">
                <h4>Tus tarjetas guardadas</h4>
                {loadingTarjetas ? (
                  <div className="comprar-loading-tarjetas">
                    <div className="comprar-spinner comprar-small"></div>
                    <p>Cargando tarjetas...</p>
                  </div>
                ) : (
                  <>
                    <div className="comprar-tarjetas-guardadas">
                      {userTarjetas.map((tarjeta) => (
                        <div 
                          key={tarjeta.id} 
                          className={`comprar-tarjeta-guardada ${selectedTarjetaId === tarjeta.id ? 'seleccionada' : ''}`}
                          onClick={() => handleCardSelect(tarjeta)}
                        >
                          <div className="comprar-tarjeta-guardada-header">
                            <div className="comprar-tarjeta-tipo">
                              <img 
                                src={getTarjetaIcon(tarjeta.tipo_tarjeta)} 
                                alt={tarjeta.tipo_tarjeta} 
                                className="comprar-tarjeta-icon-small"
                              />
                              <span>
                                {tarjeta.tipo_tarjeta === 'visa' ? 'Visa' :
                                 tarjeta.tipo_tarjeta === 'mastercard' ? 'Mastercard' :
                                 tarjeta.tipo_tarjeta === 'amex' ? 'American Express' : 'Tarjeta'}
                              </span>
                              {tarjeta.predeterminada && (
                                <span className="comprar-tarjeta-predeterminada-badge">
                                  <img src={estrellaIcon} alt="Predeterminada" className="comprar-estrella-icon" />
                                  Principal
                                </span>
                              )}
                            </div>
                            <div className="comprar-tarjeta-radio">
                              <input 
                                type="radio" 
                                name="savedCard" 
                                checked={selectedTarjetaId === tarjeta.id}
                                onChange={() => handleCardSelect(tarjeta)}
                              />
                            </div>
                          </div>
                          <div className="comprar-tarjeta-info">
                            <p className="comprar-tarjeta-numero">
                              {formatearNumeroTarjeta(tarjeta.numero_enmascarado || tarjeta.ultimos_4_digitos)}
                            </p>
                            <p className="comprar-tarjeta-titular">{tarjeta.nombre_titular}</p>
                            <p className="comprar-tarjeta-expiracion">
                              Exp: {tarjeta.mes_expiracion}/{tarjeta.anio_expiracion}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <button 
                      type="button"
                      className="comprar-btn-agregar-tarjeta"
                      onClick={() => {
                        setShowNewCardForm(true);
                        setUseSavedCard(false);
                        setTarjetaForm({
                          nombre_titular: '',
                          numero_tarjeta: '',
                          fecha_vencimiento: '',
                          cvv: '',
                          tipo_tarjeta: 'visa'
                        });
                      }}
                    >
                      <img src={addIcon} alt="Agregar" className="comprar-btn-icon-left" />
                      Usar otra tarjeta
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Formulario para nueva tarjeta */}
            {(showNewCardForm || !isAuthenticated || (isAuthenticated && userTarjetas.length === 0)) && (
              <div className="comprar-nueva-tarjeta-section">
                <h4>{isAuthenticated ? 'Nueva tarjeta' : 'Datos de la tarjeta'}</h4>
                
                {isAuthenticated && userTarjetas.length > 0 && (
                  <button 
                    type="button"
                    className="comprar-btn-volver-tarjetas"
                    onClick={() => {
                      setShowNewCardForm(false);
                      setUseSavedCard(true);
                    }}
                  >
                    ← Volver a tarjetas guardadas
                  </button>
                )}
                
                <div className="comprar-form-grid">
                  <div className="comprar-form-group comprar-full-width">
                    <label>Nombre del titular *</label>
                    <input
                      type="text"
                      name="nombre_titular"
                      value={tarjetaForm.nombre_titular}
                      onChange={handleTarjetaChange}
                      placeholder="Como aparece en la tarjeta"
                      className={`comprar-form-input ${errors.nombre_titular ? 'comprar-input-error' : ''}`}
                    />
                    {errors.nombre_titular && <span className="comprar-error-message">{errors.nombre_titular}</span>}
                  </div>
                  
                  <div className="comprar-form-group comprar-full-width">
                    <label>Número de tarjeta *</label>
                    <div className="comprar-tarjeta-input-container">
                      <input
                        type="text"
                        name="numero_tarjeta"
                        value={tarjetaForm.numero_tarjeta}
                        onChange={handleTarjetaChange}
                        placeholder="1234 5678 9012 3456"
                        className={`comprar-form-input comprar-tarjeta-input ${errors.numero_tarjeta ? 'comprar-input-error' : ''}`}
                        maxLength="19"
                      />
                      <div className="comprar-tarjeta-icons">
                        {tarjetaForm.tipo_tarjeta === 'visa' && (
                          <img src={visaIcon} alt="Visa" className="comprar-tarjeta-icon" />
                        )}
                        {tarjetaForm.tipo_tarjeta === 'mastercard' && (
                          <img src={mastercardIcon} alt="Mastercard" className="comprar-tarjeta-icon" />
                        )}
                        {tarjetaForm.tipo_tarjeta === 'amex' && (
                          <img src={amexIcon} alt="American Express" className="comprar-tarjeta-icon" />
                        )}
                      </div>
                    </div>
                    {errors.numero_tarjeta && <span className="comprar-error-message">{errors.numero_tarjeta}</span>}
                    <small className="comprar-form-hint">Ingrese los 16 dígitos de su tarjeta</small>
                  </div>
                  
                  <div className="comprar-form-group">
                    <label>Fecha de vencimiento *</label>
                    <input
                      type="text"
                      name="fecha_vencimiento"
                      value={tarjetaForm.fecha_vencimiento}
                      onChange={handleTarjetaChange}
                      placeholder="MM/YY"
                      className={`comprar-form-input ${errors.fecha_vencimiento ? 'comprar-input-error' : ''}`}
                      maxLength="5"
                    />
                    {errors.fecha_vencimiento && <span className="comprar-error-message">{errors.fecha_vencimiento}</span>}
                    <small className="comprar-form-hint">Mes/Año</small>
                  </div>
                  
                  <div className="comprar-form-group">
                    <label>CVV *</label>
                    <div className="comprar-cvv-input-container">
                      <input
                        type="password"
                        name="cvv"
                        value={tarjetaForm.cvv}
                        onChange={handleTarjetaChange}
                        placeholder={tarjetaForm.tipo_tarjeta === 'amex' ? '1234' : '123'}
                        className={`comprar-form-input comprar-cvv-input ${errors.cvv ? 'comprar-input-error' : ''}`}
                        maxLength={tarjetaForm.tipo_tarjeta === 'amex' ? 4 : 3}
                      />
                    </div>
                    {errors.cvv && <span className="comprar-error-message">{errors.cvv}</span>}
                    <small className="comprar-form-hint">
                      {tarjetaForm.tipo_tarjeta === 'amex' ? '4 dígitos en el frente' : '3 dígitos en el reverso'}
                    </small>
                  </div>
                </div>
              </div>
            )}
            
            <div className="comprar-terminos-tarjeta">
              <div className="comprar-terminos-checkbox">
                <input
                  type="checkbox"
                  id="aceptoTerminos"
                  checked={aceptoTerminos}
                  onChange={(e) => setAceptoTerminos(e.target.checked)}
                  className="comprar-terminos-input"
                />
                <label htmlFor="aceptoTerminos" className="comprar-terminos-label">
                  Acepto los <a href="/terminos" target="_blank">Términos y Condiciones</a>
                </label>
              </div>
              {errors.terminos && <span className="comprar-error-message">{errors.terminos}</span>}
            </div>
            
            <div className="comprar-info-seguridad">
              <div className="comprar-seguridad-icon">🔒</div>
              <div className="comprar-seguridad-text">
                <p><strong>Pago 100% seguro</strong></p>
                <p>Tus datos están protegidos con encriptación SSL de 256 bits.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="comprar-checkout-navigation">
        <button 
          onClick={handlePrevStep}
          className="comprar-btn-nav comprar-prev-btn"
        >
          <img src={require('../../img/izquierda.png')} alt="Anterior" className="comprar-btn-icon" />
          Volver a Dirección
        </button>
        <button 
          onClick={handleNextStep}
          className="comprar-btn-nav comprar-next-btn"
        >
          Continuar a Confirmar
          <img src={require('../../img/derecha.png')} alt="Siguiente" className="comprar-btn-icon" />
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => {
    const totalCarrito = totalPrice;

    return (
      <div className="comprar-checkout-paso">
        <div className="comprar-paso-header">
          <div className="comprar-paso-indicador">
            <span className="comprar-paso-numero completado">✓</span>
            <span className="comprar-paso-linea activo"></span>
            <span className="comprar-paso-numero completado">✓</span>
            <span className="comprar-paso-linea activo"></span>
            <span className="comprar-paso-numero completado">✓</span>
            <span className="comprar-paso-linea activo"></span>
            <span className={`comprar-paso-numero ${step >= 4 ? 'activo' : ''}`}>4</span>
          </div>
          <div className="comprar-paso-titulos">
            <span className="comprar-paso-titulo completado">Datos</span>
            <span className="comprar-paso-titulo completado">Dirección</span>
            <span className="comprar-paso-titulo completado">Pago</span>
            <span className={`comprar-paso-titulo ${step >= 4 ? 'activo' : ''}`}>Confirmar</span>
          </div>
        </div>

        {successMessage ? (
          <div className="comprar-carrito-message success" style={{ marginTop: '30px' }}>
            <span className="comprar-message-icon">✓</span>
            {successMessage}
          </div>
        ) : (
          <>
            <div className="comprar-resumen-final">
              <div className="comprar-resumen-final-header">
                <h3>Resumen del Pedido</h3>
              </div>
              
              <div className="comprar-resumen-final-detalle">
                <div className="comprar-resumen-row">
                  <span>Producto</span>
                  <span>{producto.nombre}</span>
                </div>
                <div className="comprar-resumen-row">
                  <span>Cantidad</span>
                  <span>{formData.cantidad}</span>
                </div>
                <div className="comprar-resumen-row">
                  <span>Precio unitario</span>
                  <span>{formatPrice(producto.precio)}</span>
                </div>
                <div className="comprar-resumen-row">
                  <span>Método de pago</span>
                  <span className="comprar-metodo-pago-tag">
                    {formData.metodo_pago === 'efectivo' ? '💵 Efectivo' : '💳 Tarjeta'}
                  </span>
                </div>
                <div className="comprar-resumen-row">
                  <span>Dirección de entrega</span>
                  <span style={{ maxWidth: '300px', textAlign: 'right' }}>
                    {formData.direccion_texto || 'No especificada'}
                  </span>
                </div>
                <div className="comprar-resumen-separador"></div>
                <div className="comprar-resumen-row comprar-total">
                  <strong>Total a pagar</strong>
                  <strong className="comprar-total-precio">{formatPrice(totalCarrito)}</strong>
                </div>
              </div>
              
              <div className="comprar-resumen-final-acciones" style={{ justifyContent: 'center' }}>
                <button 
                  onClick={handleSubmitOrder}
                  disabled={loading}
                  className="comprar-btn-final comprar-confirm-btn"
                >
                  {loading ? (
                    <>
                      <span className="comprar-spinner-btn"></span>
                      Procesando...
                    </>
                  ) : (
                    `Confirmar Pedido - ${formatPrice(totalCarrito)}`
                  )}
                </button>
              </div>
              
              <div className="comprar-terminos-info">
                <p>
                  Al confirmar, aceptas nuestros <a href="/terminos" target="_blank">Términos y Condiciones</a>.
                </p>
              </div>
            </div>

            <div className="comprar-checkout-navigation" style={{ marginTop: '20px' }}>
              <button 
                onClick={handlePrevStep}
                className="comprar-btn-nav comprar-prev-btn"
              >
                <img src={require('../../img/izquierda.png')} alt="Anterior" className="comprar-btn-icon" />
                Volver a Pago
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  // ========== RENDER PRINCIPAL ==========
  return (
    <div className="comprar-modal-overlay" onClick={onClose}>
      <div className="comprar-modal-content comprar-producto-modal" onClick={(e) => e.stopPropagation()}>
        <button className="comprar-modal-close-btn" onClick={onClose}>×</button>
        
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>
    </div>
  );
};

export default ComprarProductoModal;