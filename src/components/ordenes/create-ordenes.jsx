import React, { useState, useEffect } from 'react';
import { useConfig } from '../../context/config';
import '../../css/Ordenes/create-ordenes.css';

// Importar íconos
import closeIcon from '../../img/cancelar.png';
import homeIcon from '../../img/casa.png';
import workIcon from '../../img/trabajo.png';
import otherIcon from '../../img/ubicacion.png';
import addIcon from '../../img/mas.png';
import deleteIcon from '../../img/delete.png';
import visaIcon from '../../img/visa.png';
import mastercardIcon from '../../img/mastercard.png';
import amexIcon from '../../img/amex.png';
import defaultCardIcon from '../../img/tarjeta.png';
import estrellaIcon from '../../img/estrella.png';

const CreateOrdenes = ({ onClose, onOrdenCreated }) => {
  const { darkMode } = useConfig();
  
  // ========== ESTADO PARA PASOS ==========
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingDirecciones, setLoadingDirecciones] = useState(false);
  const [loadingTarjetas, setLoadingTarjetas] = useState(false);
  const [loadingSuplementos, setLoadingSuplementos] = useState(true);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [ordenCreada, setOrdenCreada] = useState(null);
  
  // ========== ESTADO PARA PRODUCTOS DEL CARRITO ==========
  const [carritoItems, setCarritoItems] = useState([]);
  const [suplementosDisponibles, setSuplementosDisponibles] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState(1);
  
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    telefono_usuario: '',
    tipo_pedido: 'carrito',
    direccion_texto: '',
    direccion_id: null,
    metodo_pago: 'efectivo'
  });
  
  // Estados para pago con tarjeta
  const [tarjetaForm, setTarjetaForm] = useState({
    nombre_titular: '',
    numero_tarjeta: '',
    fecha_vencimiento: '',
    cvv: '',
    tipo_tarjeta: 'visa'
  });
  const [aceptoTerminos, setAceptoTerminos] = useState(false);
  
  // Estados para el autocompletado de clientes
  const [clientes, setClientes] = useState([]);
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [cargandoClientes, setCargandoClientes] = useState(false);
  
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
  
  const isAuthenticated = localStorage.getItem('token') !== null;

  // ========== FUNCIONES AUXILIARES ==========
  const formatPrice = (price) => new Intl.NumberFormat('es-MX', {
    style: 'currency', currency: 'MXN'
  }).format(price || 0);

  // Función para normalizar IDs (funciona para MySQL y MongoDB)
  const normalizarId = (id) => {
    if (!id) return '';
    return String(id);
  };

  const getTarjetaIcon = (tipo) => {
    switch(tipo) {
      case 'visa': return visaIcon;
      case 'mastercard': return mastercardIcon;
      case 'amex': return amexIcon;
      default: return defaultCardIcon;
    }
  };

  const formatearNumeroTarjeta = (numero) => {
    if (!numero) return "**** **** **** 1234";
    if (numero.includes('*')) return numero;
    const ultimos4 = numero.slice(-4);
    return `**** **** **** ${ultimos4}`;
  };

  // Calcular total del carrito
  const calcularTotal = () => {
    return carritoItems.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  // ========== FUNCIÓN PARA CARGAR SUPLEMENTOS ==========
  const fetchSuplementos = async () => {
    try {
      setLoadingSuplementos(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/suplementos/?only_active=true', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuplementosDisponibles(data);
        console.log('Suplementos cargados:', data);
      }
    } catch (error) {
      console.error('Error al obtener suplementos:', error);
    } finally {
      setLoadingSuplementos(false);
    }
  };

  // ========== FUNCIÓN PARA CARGAR CLIENTES ==========
  const fetchClientes = async () => {
    try {
      setCargandoClientes(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://127.0.0.1:5000/user/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const clientesData = data
          .filter(user => user.rol === 2)
          .map(user => ({
            id: user.id,
            nombre: user.nombre,
            telefono: user.telefono || '',
            email: user.correo,
            direccion: user.direccion || '',
            direccion_id: user.direccion_id || null,
            direcciones: user.direcciones || []
          }));
        setClientes(clientesData);
      }
    } catch (error) {
      console.error('Error al obtener clientes:', error);
    } finally {
      setCargandoClientes(false);
    }
  };

  // ========== FUNCIÓN PARA CARGAR DIRECCIONES ==========
  const fetchDirecciones = async () => {
    if (!isAuthenticated) return;
    try {
      setLoadingDirecciones(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://127.0.0.1:5000/direcciones/me/direcciones', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        const direccionesData = data.direcciones || data;
        setDirecciones(Array.isArray(direccionesData) ? direccionesData : []);
        
        const direccionPredeterminada = direccionesData.find(dir => dir.predeterminada);
        if (direccionPredeterminada) {
          handleDireccionSelect(direccionPredeterminada);
        }
      } else {
        setDirecciones([]);
      }
    } catch (error) {
      console.error('Error al obtener direcciones:', error);
      setDirecciones([]);
    } finally {
      setLoadingDirecciones(false);
    }
  };

  // ========== FUNCIÓN PARA CARGAR TARJETAS ==========
  const fetchUserTarjetas = async () => {
    if (!isAuthenticated) return;
    try {
      setLoadingTarjetas(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/tarjetas/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUserTarjetas(data.tarjetas || []);
        if (data.tarjetas && data.tarjetas.length > 0) {
          const predeterminada = data.tarjetas.find(t => t.predeterminada);
          setSelectedTarjetaId(predeterminada?.id || data.tarjetas[0].id);
        }
      }
    } catch (error) {
      console.error('Error al obtener tarjetas:', error);
    } finally {
      setLoadingTarjetas(false);
    }
  };

  // ========== EFECTOS INICIALES ==========
  useEffect(() => {
    fetchSuplementos();
    fetchClientes();
    if (isAuthenticated) {
      fetchDirecciones();
      fetchUserTarjetas();
    }
  }, []);

  // ========== FUNCIONES DE AUTOCOMPLETADO DE CLIENTES ==========
  const buscarSugerencias = (texto) => {
    if (!texto || texto.trim() === '') {
      setSugerencias(clientes.slice(0, 20));
      setMostrarSugerencias(clientes.length > 0);
      return;
    }

    if (texto.length < 2) {
      setSugerencias([]);
      setMostrarSugerencias(false);
      return;
    }

    const textoLower = texto.toLowerCase().trim();
    const sugerenciasFiltradas = clientes.filter(cliente =>
      cliente.nombre.toLowerCase().includes(textoLower) ||
      (cliente.telefono && cliente.telefono.includes(texto)) ||
      (cliente.email && cliente.email.toLowerCase().includes(textoLower))
    );

    setSugerencias(sugerenciasFiltradas.slice(0, 15));
    setMostrarSugerencias(sugerenciasFiltradas.length > 0);
  };

  const seleccionarCliente = async (cliente) => {
    const telefonoLimpio = cliente.telefono ? 
      cliente.telefono.replace('+52', '').replace(/\s/g, '') : '';
    
    setFormData(prev => ({
      ...prev,
      nombre_usuario: cliente.nombre,
      telefono_usuario: telefonoLimpio,
      direccion_texto: cliente.direccion || '',
      direccion_id: cliente.direccion_id || null
    }));
    setMostrarSugerencias(false);
    setSugerencias([]);
    
    if (cliente.id) {
      await fetchDireccionesPorCliente(cliente.id);
    }
  };

  const fetchDireccionesPorCliente = async (clienteId) => {
    try {
      setLoadingDirecciones(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://127.0.0.1:5000/direcciones/user/${clienteId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        const direccionesData = data.direcciones || data;
        const direccionesArray = Array.isArray(direccionesData) ? direccionesData : [];
        setDirecciones(direccionesArray);
        
        const direccionPredeterminada = direccionesArray.find(dir => dir.predeterminada);
        if (direccionPredeterminada) {
          handleDireccionSelect(direccionPredeterminada);
        } else if (direccionesArray.length > 0) {
          handleDireccionSelect(direccionesArray[0]);
        }
      } else {
        setDirecciones([]);
      }
    } catch (error) {
      console.error('Error al obtener direcciones del cliente:', error);
      setDirecciones([]);
    } finally {
      setLoadingDirecciones(false);
    }
  };

  // ========== FUNCIONES DE DIRECCIÓN ==========
  const handleDireccionSelect = (direccion) => {
    const direccionTexto = `${direccion.calle} #${direccion.numero_exterior}${direccion.numero_interior ? ` Int. ${direccion.numero_interior}` : ''}, ${direccion.colonia}, ${direccion.ciudad}, ${direccion.estado}, CP: ${direccion.codigo_postal}`;
    setFormData(prev => ({ ...prev, direccion_id: direccion.id, direccion_texto: direccionTexto }));
    setShowNewAddressForm(false);
    if (errors.direccion) setErrors(prev => ({ ...prev, direccion: '' }));
  };

  const handleNewAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const saveNewAddress = async () => {
    if (!isAuthenticated) {
      const direccionTexto = `${newAddress.calle} #${newAddress.numero_exterior}${newAddress.numero_interior ? ` Int. ${newAddress.numero_interior}` : ''}, ${newAddress.colonia}, ${newAddress.ciudad}, ${newAddress.estado}, CP: ${newAddress.codigo_postal}`;
      setFormData(prev => ({ ...prev, direccion_id: null, direccion_texto: direccionTexto }));
      return true;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/direcciones/me/add_direccion', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          calle: newAddress.calle,
          numero_exterior: newAddress.numero_exterior,
          numero_interior: newAddress.numero_interior,
          colonia: newAddress.colonia,
          ciudad: newAddress.ciudad,
          estado: newAddress.estado,
          codigo_postal: newAddress.codigo_postal,
          referencias: newAddress.referencias,
          tipo: newAddress.tipo,
          predeterminada: newAddress.predeterminada
        })
      });

      if (response.ok) {
        const data = await response.json();
        const direccionGuardada = data.direccion || data;
        const direccionTexto = `${direccionGuardada.calle} #${direccionGuardada.numero_exterior}${direccionGuardada.numero_interior ? ` Int. ${direccionGuardada.numero_interior}` : ''}, ${direccionGuardada.colonia}, ${direccionGuardada.ciudad}, ${direccionGuardada.estado}, CP: ${direccionGuardada.codigo_postal}`;
        
        setFormData(prev => ({
          ...prev,
          direccion_id: direccionGuardada.id,
          direccion_texto: direccionTexto
        }));
        
        await fetchDirecciones();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al guardar dirección:', error);
      return false;
    }
  };

  // ========== FUNCIONES DE TARJETA ==========
  const handleCardSelect = (tarjeta) => {
    setSelectedTarjetaId(tarjeta.id);
    setUseSavedCard(true);
    setShowNewCardForm(false);
  };

  const handleTarjetaChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    
    if (name === 'numero_tarjeta') {
      newValue = value.replace(/\D/g, '').slice(0, 16);
      if (newValue.length > 0) newValue = newValue.match(/.{1,4}/g).join(' ');
      const firstDigit = newValue.charAt(0);
      if (firstDigit === '4') setTarjetaForm(prev => ({ ...prev, tipo_tarjeta: 'visa' }));
      else if (firstDigit === '5') setTarjetaForm(prev => ({ ...prev, tipo_tarjeta: 'mastercard' }));
      else if (firstDigit === '3') setTarjetaForm(prev => ({ ...prev, tipo_tarjeta: 'amex' }));
    } else if (name === 'fecha_vencimiento') {
      newValue = value.replace(/\D/g, '').slice(0, 4);
      if (newValue.length >= 2) newValue = newValue.slice(0, 2) + '/' + newValue.slice(2);
    } else if (name === 'cvv') {
      newValue = value.replace(/\D/g, '');
      const maxLength = tarjetaForm.tipo_tarjeta === 'amex' ? 4 : 3;
      newValue = newValue.slice(0, maxLength);
    }
    
    setTarjetaForm(prev => ({ ...prev, [name]: newValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateTarjeta = () => {
    const tarjetaErrors = {};
    const numeroLimpio = tarjetaForm.numero_tarjeta.replace(/\s/g, '');
    
    if (numeroLimpio.length !== 16) tarjetaErrors.numero_tarjeta = 'El número de tarjeta debe tener 16 dígitos';
    if (!tarjetaForm.nombre_titular.trim()) tarjetaErrors.nombre_titular = 'El nombre del titular es requerido';
    
    const fechaRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
    if (!fechaRegex.test(tarjetaForm.fecha_vencimiento)) tarjetaErrors.fecha_vencimiento = 'Formato inválido (MM/YY)';
    
    const cvvLength = tarjetaForm.tipo_tarjeta === 'amex' ? 4 : 3;
    if (!tarjetaForm.cvv) tarjetaErrors.cvv = 'El CVV es requerido';
    else if (tarjetaForm.cvv.length !== cvvLength) tarjetaErrors.cvv = tarjetaForm.tipo_tarjeta === 'amex' ? 'El CVV de Amex tiene 4 dígitos' : 'El CVV tiene 3 dígitos';
    
    if (!aceptoTerminos) tarjetaErrors.terminos = 'Debes aceptar los términos y condiciones';
    return tarjetaErrors;
  };

  // ========== VALIDACIONES ==========
  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.nombre_usuario.trim()) newErrors.nombre_usuario = 'El nombre es requerido';
    if (!formData.telefono_usuario.trim()) newErrors.telefono_usuario = 'El teléfono es requerido';
    if (carritoItems.length === 0) newErrors.carrito = 'Debes agregar al menos un producto';
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

  const validateStep3 = () => {
    if (formData.metodo_pago === 'tarjeta') {
      if (isAuthenticated && useSavedCard && selectedTarjetaId) return true;
      const tarjetaErrors = validateTarjeta();
      if (Object.keys(tarjetaErrors).length > 0) {
        setErrors(tarjetaErrors);
        return false;
      }
    }
    return true;
  };

  // ========== NAVEGACIÓN ==========
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
    if (step > 1) setStep(step - 1);
  };

  // ========== ENVIAR ORDEN ==========
  const handleSubmitOrder = async () => {
    setLoading(true);
    try {
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
          }
        }
      }
      
      const telefonoLimpio = formData.telefono_usuario.replace(/\D/g, '');
      const totalCalculado = calcularTotal();
      
      // Preparar pedido_json para el carrito
      const pedidoJson = carritoItems.map(item => ({
        suplemento_id: item.suplemento_id,
        nombre: item.nombre,
        cantidad: item.cantidad,
        precio_unitario: item.precio
      }));
      
      const orderData = {
        nombre_usuario: formData.nombre_usuario.trim(),
        telefono_usuario: telefonoLimpio,
        tipo_pedido: 'carrito',
        pedido_json: JSON.stringify(pedidoJson),
        precio_total: totalCalculado,
        metodo_pago: formData.metodo_pago,
        direccion_texto: direccionTextoFinal,
        direccion_id: formData.direccion_id || null,
        notas: `Pedido con ${carritoItems.length} producto(s)`,
        info_pago: null
      };

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
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('http://127.0.0.1:5000/ordenes/', {
        method: 'POST',
        headers,
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const result = await response.json();
        setSuccessMessage(`¡Orden creada exitosamente! Código: ${result.orden?.codigo_unico || 'N/A'}`);
        setTimeout(() => {
          if (onOrdenCreated) onOrdenCreated(result.orden);
          onClose();
        }, 3000);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.msg || 'Error al crear la orden'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = calcularTotal();

  // ========== RENDERIZADO DE PASOS ==========
  
  // PASO 1: DATOS DEL CLIENTE Y PRODUCTOS
  const renderStep1 = () => (
    <>
      <div className="create-orden-section">
        <h4>Información del Cliente</h4>
        <div className="create-orden-row">
          <div className="create-orden-group create-orden-group-full-width">
            <label>Nombre del cliente *</label>
            <div className="create-orden-autocomplete-container">
              <input
                type="text"
                name="nombre_usuario"
                value={formData.nombre_usuario}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, nombre_usuario: e.target.value, telefono_usuario: '', direccion_texto: '', direccion_id: null }));
                  buscarSugerencias(e.target.value);
                }}
                onFocus={() => {
                  if (clientes.length > 0) {
                    setSugerencias(clientes.slice(0, 20));
                    setMostrarSugerencias(true);
                  }
                }}
                onBlur={() => setTimeout(() => setMostrarSugerencias(false), 200)}
                className={`create-orden-input ${errors.nombre_usuario ? 'create-orden-input-error' : ''}`}
                placeholder="Escribe para buscar o haz clic para ver todos los clientes"
                autoComplete="off"
              />
              {mostrarSugerencias && sugerencias.length > 0 && (
                <div className="create-orden-autocomplete-suggestions">
                  <div className="create-orden-suggestions-header">
                    {formData.nombre_usuario.trim() === '' 
                      ? `Todos los clientes (${sugerencias.length})`
                      : `Coincidencias encontradas (${sugerencias.length})`}
                  </div>
                  {sugerencias.map((cliente) => (
                    <div
                      key={cliente.id}
                      className="create-orden-suggestion-item"
                      onClick={() => seleccionarCliente(cliente)}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <div className="create-orden-suggestion-name">{cliente.nombre}</div>
                      <div className="create-orden-suggestion-details">
                        {cliente.telefono && <span>{cliente.telefono}</span>}
                        {cliente.email && <span>{cliente.email}</span>}
                        {cliente.direcciones && cliente.direcciones.length > 0 && (
                          <span className="create-orden-suggestion-badge">
                            {cliente.direcciones.length} dirección(es) guardada(s)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.nombre_usuario && <span className="create-orden-error-message">{errors.nombre_usuario}</span>}
          </div>
        </div>

        <div className="create-orden-row">
          <div className="create-orden-group create-orden-group-half">
            <label>Teléfono *</label>
            <input
              type="tel"
              name="telefono_usuario"
              value={formData.telefono_usuario}
              onChange={(e) => setFormData(prev => ({ ...prev, telefono_usuario: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
              className={`create-orden-input ${errors.telefono_usuario ? 'create-orden-input-error' : ''}`}
              placeholder="10 dígitos"
              maxLength="10"
            />
            {errors.telefono_usuario && <span className="create-orden-error-message">{errors.telefono_usuario}</span>}
          </div>
        </div>
      </div>

      <div className="create-orden-section">
        <h4>Seleccionar Productos</h4>
        
        {/* Selector de productos */}
        <div className="create-orden-producto-selector">
          <div className="create-orden-selector-header">
            <h5>Seleccionar productos</h5>
            <p className="create-orden-selector-hint">Selecciona un producto y se agregará automáticamente (1 unidad)</p>
          </div>
          <div className="create-orden-selector-form">
            <div className="create-orden-form-group create-orden-group-full-width">
              <label>Seleccionar producto</label>
              <select
                value={productoSeleccionado?.id ? normalizarId(productoSeleccionado.id) : ''}
                onChange={(e) => {
                  const valor = e.target.value;
                  if (valor && valor !== '') {
                    const producto = suplementosDisponibles.find(p => normalizarId(p.id) === normalizarId(valor));
                    if (producto) {
                      // Agregar con cantidad 1
                      const existingItem = carritoItems.find(item => normalizarId(item.id) === normalizarId(producto.id));
                      
                      if (existingItem) {
                        setCarritoItems(carritoItems.map(item => 
                          normalizarId(item.id) === normalizarId(producto.id) 
                            ? { ...item, cantidad: item.cantidad + 1 }
                            : item
                        ));
                      } else {
                        setCarritoItems([...carritoItems, {
                          id: producto.id,
                          nombre: producto.nombre,
                          precio: producto.precio,
                          cantidad: 1,
                          suplemento_id: producto.id
                        }]);
                      }
                      
                      setProductoSeleccionado(null);
                      e.target.value = '';
                    }
                  }
                }}
                className="create-orden-select"
                disabled={loadingSuplementos}
              >
                <option value="">-- Selecciona un producto --</option>
                {suplementosDisponibles.map(sup => (
                  <option key={normalizarId(sup.id)} value={normalizarId(sup.id)}>
                    {sup.nombre} - {formatPrice(sup.precio)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Lista de productos en el carrito */}
        {carritoItems.length > 0 && (
          <div className="create-orden-carrito-items">
            <h5>Productos agregados al pedido ({carritoItems.length}):</h5>
            {carritoItems.map((item, index) => (
              <div key={index} className="create-orden-carrito-item">
                <div className="create-orden-item-info">
                  <span className="create-orden-item-nombre">{item.nombre}</span>
                  <span className="create-orden-item-precio">{formatPrice(item.precio)} c/u</span>
                  <div className="create-orden-item-cantidad">
                    <button
                      type="button"
                      onClick={() => {
                        const nuevosItems = [...carritoItems];
                        if (nuevosItems[index].cantidad > 1) {
                          nuevosItems[index].cantidad = nuevosItems[index].cantidad - 1;
                          setCarritoItems(nuevosItems);
                        }
                      }}
                    >−</button>
                    <span>{item.cantidad}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const nuevosItems = [...carritoItems];
                        nuevosItems[index].cantidad = nuevosItems[index].cantidad + 1;
                        setCarritoItems(nuevosItems);
                      }}
                    >+</button>
                  </div>
                  <span className="create-orden-item-subtotal">
                    {formatPrice(item.precio * item.cantidad)}
                  </span>
                </div>
                <button 
                  type="button"
                  className="create-orden-item-eliminar"
                  onClick={() => {
                    const nuevosItems = [...carritoItems];
                    nuevosItems.splice(index, 1);
                    setCarritoItems(nuevosItems);
                  }}
                >
                  <img src={deleteIcon} alt="Eliminar" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {errors.carrito && <span className="create-orden-error-message">{errors.carrito}</span>}
      </div>

      <div className="create-orden-price-summary">
        <div className="create-orden-price-total">
          <strong>Total a pagar:</strong>
          <span className="create-orden-total-price">{formatPrice(totalPrice)}</span>
        </div>
      </div>
    </>
  );

  // PASO 2: DIRECCIÓN DE ENTREGA
  const renderStep2 = () => (
    <div className="create-orden-direccion-container">
      <h3>Dirección de entrega</h3>
      
      {isAuthenticated && direcciones.length > 0 && !showNewAddressForm && (
        <div className="create-orden-form-section">
          <h4>Tus direcciones guardadas</h4>
          {loadingDirecciones ? (
            <div className="create-orden-loading-direcciones">
              <div className="create-orden-spinner create-orden-small"></div>
              <p>Cargando direcciones...</p>
            </div>
          ) : (
            <>
              <div className="create-orden-direcciones-guardadas">
                {direcciones.map((direccion) => (
                  <div 
                    key={direccion.id} 
                    className={`create-orden-direccion-guardada ${formData.direccion_id === direccion.id ? 'seleccionada' : ''}`}
                    onClick={() => handleDireccionSelect(direccion)}
                  >
                    <div className="create-orden-direccion-guardada-header">
                      <div className="create-orden-direccion-tipo">
                        {direccion.tipo === 'casa' ? (
                          <img src={homeIcon} alt="Casa" className="create-orden-direccion-icon" />
                        ) : direccion.tipo === 'trabajo' ? (
                          <img src={workIcon} alt="Trabajo" className="create-orden-direccion-icon" />
                        ) : (
                          <img src={otherIcon} alt="Otro" className="create-orden-direccion-icon" />
                        )}
                        <span>{direccion.tipo === 'casa' ? 'Casa' : direccion.tipo === 'trabajo' ? 'Trabajo' : 'Otro'}</span>
                        {direccion.predeterminada && (
                          <span className="create-orden-direccion-pred">Predeterminada</span>
                        )}
                      </div>
                      <div className="create-orden-direccion-radio">
                        <input 
                          type="radio" 
                          name="savedAddress" 
                          checked={formData.direccion_id === direccion.id}
                          onChange={() => handleDireccionSelect(direccion)}
                        />
                      </div>
                    </div>
                    <div className="create-orden-direccion-info">
                      <p><strong>{direccion.calle} #{direccion.numero_exterior}</strong>{direccion.numero_interior ? ` Int. ${direccion.numero_interior}` : ''}</p>
                      <p>{direccion.colonia}, {direccion.ciudad}, {direccion.estado}</p>
                      <p>CP: {direccion.codigo_postal}</p>
                      {direccion.referencias && (
                        <p className="create-orden-direccion-referencias">
                          <small>Referencias: {direccion.referencias}</small>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                type="button"
                className="create-orden-btn-agregar-direccion"
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
                <img src={addIcon} alt="Agregar" className="create-orden-btn-icon-left" />
                Agregar nueva dirección
              </button>
            </>
          )}
        </div>
      )}

      {(showNewAddressForm || !isAuthenticated || direcciones.length === 0) && (
        <div className="create-orden-form-section">
          <h4>{isAuthenticated ? 'Nueva dirección' : 'Dirección de entrega'}</h4>
          
          {isAuthenticated && direcciones.length > 0 && (
            <button 
              type="button"
              className="create-orden-btn-volver-direcciones"
              onClick={() => setShowNewAddressForm(false)}
            >
              ← Volver a direcciones guardadas
            </button>
          )}
          
          <div className="create-orden-direccion-formulario">
            <div className="create-orden-form-grid">
              <div className="create-orden-form-group">
                <label>Calle *</label>
                <input
                  type="text"
                  name="calle"
                  value={newAddress.calle}
                  onChange={handleNewAddressChange}
                  className={`create-orden-form-input ${errors.calle ? 'create-orden-input-error' : ''}`}
                  placeholder="Nombre de la calle"
                />
                {errors.calle && <span className="create-orden-error-message">{errors.calle}</span>}
              </div>
              
              <div className="create-orden-form-group">
                <label>Número Exterior *</label>
                <input
                  type="text"
                  name="numero_exterior"
                  value={newAddress.numero_exterior}
                  onChange={handleNewAddressChange}
                  className={`create-orden-form-input ${errors.numero_exterior ? 'create-orden-input-error' : ''}`}
                  placeholder="123"
                />
                {errors.numero_exterior && <span className="create-orden-error-message">{errors.numero_exterior}</span>}
              </div>
              
              <div className="create-orden-form-group">
                <label>Número Interior</label>
                <input
                  type="text"
                  name="numero_interior"
                  value={newAddress.numero_interior}
                  onChange={handleNewAddressChange}
                  className="create-orden-form-input"
                  placeholder="A (opcional)"
                />
              </div>
              
              <div className="create-orden-form-group">
                <label>Colonia *</label>
                <input
                  type="text"
                  name="colonia"
                  value={newAddress.colonia}
                  onChange={handleNewAddressChange}
                  className={`create-orden-form-input ${errors.colonia ? 'create-orden-input-error' : ''}`}
                  placeholder="Nombre de la colonia"
                />
                {errors.colonia && <span className="create-orden-error-message">{errors.colonia}</span>}
              </div>
              
              <div className="create-orden-form-group">
                <label>Ciudad *</label>
                <input
                  type="text"
                  name="ciudad"
                  value={newAddress.ciudad}
                  onChange={handleNewAddressChange}
                  className={`create-orden-form-input ${errors.ciudad ? 'create-orden-input-error' : ''}`}
                  placeholder="Nombre de la ciudad"
                />
                {errors.ciudad && <span className="create-orden-error-message">{errors.ciudad}</span>}
              </div>
              
              <div className="create-orden-form-group">
                <label>Estado *</label>
                <input
                  type="text"
                  name="estado"
                  value={newAddress.estado}
                  onChange={handleNewAddressChange}
                  className={`create-orden-form-input ${errors.estado ? 'create-orden-input-error' : ''}`}
                  placeholder="Nombre del estado"
                />
                {errors.estado && <span className="create-orden-error-message">{errors.estado}</span>}
              </div>
              
              <div className="create-orden-form-group">
                <label>Código Postal *</label>
                <input
                  type="text"
                  name="codigo_postal"
                  value={newAddress.codigo_postal}
                  onChange={handleNewAddressChange}
                  className={`create-orden-form-input ${errors.codigo_postal ? 'create-orden-input-error' : ''}`}
                  placeholder="12345"
                  maxLength="5"
                />
                {errors.codigo_postal && <span className="create-orden-error-message">{errors.codigo_postal}</span>}
                <small className="create-orden-form-hint">5 dígitos</small>
              </div>
              
              <div className="create-orden-form-group">
                <label>Tipo de Dirección</label>
                <select
                  name="tipo"
                  value={newAddress.tipo}
                  onChange={handleNewAddressChange}
                  className="create-orden-form-select"
                >
                  <option value="casa">Casa</option>
                  <option value="trabajo">Trabajo</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              
              <div className="create-orden-form-group create-orden-full-width">
                <label>Referencias (opcional)</label>
                <textarea
                  name="referencias"
                  value={newAddress.referencias}
                  onChange={handleNewAddressChange}
                  placeholder="Entre calles, puntos de referencia, color de la casa, etc."
                  rows="3"
                  className="create-orden-form-textarea"
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {errors.direccion && (
        <div className="create-orden-error-message" style={{ marginTop: '10px' }}>
          {errors.direccion}
        </div>
      )}
    </div>
  );

  // PASO 3: MÉTODO DE PAGO
  const renderStep3 = () => (
    <div className="create-orden-pago-container">
      <div className="create-orden-pago-metodos">
        <h3>Método de pago</h3>
        
        <div className="create-orden-metodos-grid">
          <div 
            className={`create-orden-metodo-pago-card ${formData.metodo_pago === 'efectivo' ? 'seleccionado' : ''}`}
            onClick={() => setFormData(prev => ({ ...prev, metodo_pago: 'efectivo' }))}
          >
            <div className="create-orden-metodo-icon">💵</div>
            <div className="create-orden-metodo-info">
              <h4>Pago en Efectivo</h4>
              <p>Paga cuando recibas tu pedido</p>
              <div className="create-orden-metodo-desc">
                Entrega el dinero al repartidor al momento de la entrega.
              </div>
            </div>
            <div className="create-orden-metodo-radio">
              <input 
                type="radio" 
                name="metodoPago" 
                checked={formData.metodo_pago === 'efectivo'}
                onChange={() => setFormData(prev => ({ ...prev, metodo_pago: 'efectivo' }))}
              />
            </div>
          </div>
          
          <div 
            className={`create-orden-metodo-pago-card ${formData.metodo_pago === 'tarjeta' ? 'seleccionado' : ''}`}
            onClick={() => setFormData(prev => ({ ...prev, metodo_pago: 'tarjeta' }))}
          >
            <div className="create-orden-metodo-icon">💳</div>
            <div className="create-orden-metodo-info">
              <h4>Pago con Tarjeta</h4>
              <p>Pago seguro en línea</p>
              <div className="create-orden-metodo-desc">
                Paga ahora con tarjeta de crédito o débito.
              </div>
            </div>
            <div className="create-orden-metodo-radio">
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
        <div className="create-orden-tarjeta-form-container">
          <h3>Información de pago con tarjeta</h3>
          
          {isAuthenticated && userTarjetas.length > 0 && !showNewCardForm && (
            <div className="create-orden-tarjetas-guardadas-section">
              <h4>Tus tarjetas guardadas</h4>
              {loadingTarjetas ? (
                <div className="create-orden-loading-tarjetas">
                  <div className="create-orden-spinner create-orden-small"></div>
                  <p>Cargando tarjetas...</p>
                </div>
              ) : (
                <>
                  <div className="create-orden-tarjetas-guardadas">
                    {userTarjetas.map((tarjeta) => (
                      <div 
                        key={tarjeta.id} 
                        className={`create-orden-tarjeta-guardada ${selectedTarjetaId === tarjeta.id ? 'seleccionada' : ''}`}
                        onClick={() => handleCardSelect(tarjeta)}
                      >
                        <div className="create-orden-tarjeta-guardada-header">
                          <div className="create-orden-tarjeta-tipo">
                            <img 
                              src={getTarjetaIcon(tarjeta.tipo_tarjeta)} 
                              alt={tarjeta.tipo_tarjeta} 
                              className="create-orden-tarjeta-icon-small"
                            />
                            <span>
                              {tarjeta.tipo_tarjeta === 'visa' ? 'Visa' :
                               tarjeta.tipo_tarjeta === 'mastercard' ? 'Mastercard' :
                               tarjeta.tipo_tarjeta === 'amex' ? 'American Express' : 'Tarjeta'}
                            </span>
                            {tarjeta.predeterminada && (
                              <span className="create-orden-tarjeta-predeterminada-badge">
                                <img src={estrellaIcon} alt="Predeterminada" className="create-orden-estrella-icon" />
                                Principal
                              </span>
                            )}
                          </div>
                          <div className="create-orden-tarjeta-radio">
                            <input 
                              type="radio" 
                              name="savedCard" 
                              checked={selectedTarjetaId === tarjeta.id}
                              onChange={() => handleCardSelect(tarjeta)}
                            />
                          </div>
                        </div>
                        <div className="create-orden-tarjeta-info">
                          <p className="create-orden-tarjeta-numero">
                            {formatearNumeroTarjeta(tarjeta.numero_enmascarado || tarjeta.ultimos_4_digitos)}
                          </p>
                          <p className="create-orden-tarjeta-titular">{tarjeta.nombre_titular}</p>
                          <p className="create-orden-tarjeta-expiracion">
                            Exp: {tarjeta.mes_expiracion}/{tarjeta.anio_expiracion}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    type="button"
                    className="create-orden-btn-agregar-tarjeta"
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
                    <img src={addIcon} alt="Agregar" className="create-orden-btn-icon-left" />
                    Usar otra tarjeta
                  </button>
                </>
              )}
            </div>
          )}

          {(showNewCardForm || !isAuthenticated || (isAuthenticated && userTarjetas.length === 0)) && (
            <div className="create-orden-nueva-tarjeta-section">
              <h4>{isAuthenticated ? 'Nueva tarjeta' : 'Datos de la tarjeta'}</h4>
              
              {isAuthenticated && userTarjetas.length > 0 && (
                <button 
                  type="button"
                  className="create-orden-btn-volver-tarjetas"
                  onClick={() => {
                    setShowNewCardForm(false);
                    setUseSavedCard(true);
                  }}
                >
                  ← Volver a tarjetas guardadas
                </button>
              )}
              
              <div className="create-orden-form-grid">
                <div className="create-orden-form-group create-orden-full-width">
                  <label>Nombre del titular *</label>
                  <input
                    type="text"
                    name="nombre_titular"
                    value={tarjetaForm.nombre_titular}
                    onChange={handleTarjetaChange}
                    placeholder="Como aparece en la tarjeta"
                    className={`create-orden-form-input ${errors.nombre_titular ? 'create-orden-input-error' : ''}`}
                  />
                  {errors.nombre_titular && <span className="create-orden-error-message">{errors.nombre_titular}</span>}
                </div>
                
                <div className="create-orden-form-group create-orden-full-width">
                  <label>Número de tarjeta *</label>
                  <div className="create-orden-tarjeta-input-container">
                    <input
                      type="text"
                      name="numero_tarjeta"
                      value={tarjetaForm.numero_tarjeta}
                      onChange={handleTarjetaChange}
                      placeholder="1234 5678 9012 3456"
                      className={`create-orden-form-input create-orden-tarjeta-input ${errors.numero_tarjeta ? 'create-orden-input-error' : ''}`}
                      maxLength="19"
                    />
                    <div className="create-orden-tarjeta-icons">
                      {tarjetaForm.tipo_tarjeta === 'visa' && (
                        <img src={visaIcon} alt="Visa" className="create-orden-tarjeta-icon" />
                      )}
                      {tarjetaForm.tipo_tarjeta === 'mastercard' && (
                        <img src={mastercardIcon} alt="Mastercard" className="create-orden-tarjeta-icon" />
                      )}
                      {tarjetaForm.tipo_tarjeta === 'amex' && (
                        <img src={amexIcon} alt="American Express" className="create-orden-tarjeta-icon" />
                      )}
                    </div>
                  </div>
                  {errors.numero_tarjeta && <span className="create-orden-error-message">{errors.numero_tarjeta}</span>}
                  <small className="create-orden-form-hint">Ingrese los 16 dígitos de su tarjeta</small>
                </div>
                
                <div className="create-orden-form-group">
                  <label>Fecha de vencimiento *</label>
                  <input
                    type="text"
                    name="fecha_vencimiento"
                    value={tarjetaForm.fecha_vencimiento}
                    onChange={handleTarjetaChange}
                    placeholder="MM/YY"
                    className={`create-orden-form-input ${errors.fecha_vencimiento ? 'create-orden-input-error' : ''}`}
                    maxLength="5"
                  />
                  {errors.fecha_vencimiento && <span className="create-orden-error-message">{errors.fecha_vencimiento}</span>}
                  <small className="create-orden-form-hint">Mes/Año</small>
                </div>
                
                <div className="create-orden-form-group">
                  <label>CVV *</label>
                  <div className="create-orden-cvv-input-container">
                    <input
                      type="password"
                      name="cvv"
                      value={tarjetaForm.cvv}
                      onChange={handleTarjetaChange}
                      placeholder={tarjetaForm.tipo_tarjeta === 'amex' ? '1234' : '123'}
                      className={`create-orden-form-input create-orden-cvv-input ${errors.cvv ? 'create-orden-input-error' : ''}`}
                      maxLength={tarjetaForm.tipo_tarjeta === 'amex' ? 4 : 3}
                    />
                  </div>
                  {errors.cvv && <span className="create-orden-error-message">{errors.cvv}</span>}
                  <small className="create-orden-form-hint">
                    {tarjetaForm.tipo_tarjeta === 'amex' ? '4 dígitos en el frente' : '3 dígitos en el reverso'}
                  </small>
                </div>
              </div>
            </div>
          )}
          
          <div className="create-orden-terminos-tarjeta">
            <div className="create-orden-terminos-checkbox">
              <input
                type="checkbox"
                id="aceptoTerminos"
                checked={aceptoTerminos}
                onChange={(e) => setAceptoTerminos(e.target.checked)}
                className="create-orden-terminos-input"
              />
              <label htmlFor="aceptoTerminos" className="create-orden-terminos-label">
                Acepto los <a href="/terminos" target="_blank">Términos y Condiciones</a>
              </label>
            </div>
            {errors.terminos && <span className="create-orden-error-message">{errors.terminos}</span>}
          </div>
          
          <div className="create-orden-info-seguridad">
            <div className="create-orden-seguridad-icon">🔒</div>
            <div className="create-orden-seguridad-text">
              <p><strong>Pago 100% seguro</strong></p>
              <p>Tus datos están protegidos con encriptación SSL de 256 bits.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // PASO 4: CONFIRMAR PEDIDO
  const renderStep4 = () => (
    <div className="create-orden-resumen-final">
      <div className="create-orden-resumen-final-header">
        <h3>Resumen del Pedido</h3>
      </div>
      
      <div className="create-orden-resumen-final-detalle">
        <div className="create-orden-resumen-row">
          <span>Cliente</span>
          <span>{formData.nombre_usuario}</span>
        </div>
        <div className="create-orden-resumen-row">
          <span>Teléfono</span>
          <span>{formData.telefono_usuario}</span>
        </div>
        <div className="create-orden-resumen-row">
          <span>Productos</span>
          <span>{carritoItems.length} producto(s)</span>
        </div>
        
        {/* Lista de productos */}
        {carritoItems.map((item, index) => (
          <div key={index} className="create-orden-resumen-producto">
            <div className="create-orden-producto-nombre">{item.nombre}</div>
            <div className="create-orden-producto-detalle">
              <span>{item.cantidad} x {formatPrice(item.precio)}</span>
              <span>= {formatPrice(item.precio * item.cantidad)}</span>
            </div>
          </div>
        ))}
        
        <div className="create-orden-resumen-row">
          <span>Método de pago</span>
          <span className="create-orden-metodo-pago-tag">
            {formData.metodo_pago === 'efectivo' ? '💵 Efectivo' : '💳 Tarjeta'}
          </span>
        </div>
        <div className="create-orden-resumen-row">
          <span>Dirección de entrega</span>
          <span style={{ maxWidth: '300px', textAlign: 'right' }}>
            {formData.direccion_texto || 'No especificada'}
          </span>
        </div>
        <div className="create-orden-resumen-separador"></div>
        <div className="create-orden-resumen-row create-orden-total">
          <strong>Total a pagar</strong>
          <strong className="create-orden-total-precio">{formatPrice(totalPrice)}</strong>
        </div>
      </div>
      
      <div className="create-orden-terminos-info">
        <p>
          Al confirmar, aceptas nuestros <a href="/terminos" target="_blank">Términos y Condiciones</a>.
        </p>
      </div>
    </div>
  );

  // ========== RENDER PRINCIPAL ==========
  return (
    <div className={`create-orden-form ${darkMode ? 'create-orden-form-dark-mode' : ''}`}>
      <div className="create-orden-form-scroll-container">
        <form className="create-orden-form-form">
          
          {/* Indicador de pasos */}
          <div className="create-orden-pasos">
            <div className={`create-orden-paso-indicador ${step >= 1 ? 'active' : ''}`}>
              <div className="create-orden-paso-numero">{step > 1 ? '✓' : '1'}</div>
              <div className="create-orden-paso-label">Datos</div>
            </div>
            <div className="create-orden-paso-linea"></div>
            <div className={`create-orden-paso-indicador ${step >= 2 ? 'active' : ''}`}>
              <div className="create-orden-paso-numero">{step > 2 ? '✓' : '2'}</div>
              <div className="create-orden-paso-label">Dirección</div>
            </div>
            <div className="create-orden-paso-linea"></div>
            <div className={`create-orden-paso-indicador ${step >= 3 ? 'active' : ''}`}>
              <div className="create-orden-paso-numero">{step > 3 ? '✓' : '3'}</div>
              <div className="create-orden-paso-label">Pago</div>
            </div>
            <div className="create-orden-paso-linea"></div>
            <div className={`create-orden-paso-indicador ${step >= 4 ? 'active' : ''}`}>
              <div className="create-orden-paso-numero">4</div>
              <div className="create-orden-paso-label">Confirmar</div>
            </div>
          </div>

          {successMessage && (
            <div className="create-orden-success-message">
              ✓ {successMessage}
            </div>
          )}

          {!successMessage && (
            <>
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
            </>
          )}

          {/* Botones de navegación */}
          {!successMessage && (
            <div className="create-orden-form-actions">
              {step > 1 && (
                <button type="button" className="create-orden-btn-cancel" onClick={handlePrevStep} disabled={loading}>
                  ← Atrás
                </button>
              )}
              {step < 4 ? (
                <button type="button" className="create-orden-btn-submit" onClick={handleNextStep} disabled={loading}>
                  Continuar →
                </button>
              ) : (
                <button type="button" className="create-orden-btn-submit" onClick={handleSubmitOrder} disabled={loading}>
                  {loading ? 'Procesando...' : `Confirmar Pedido - ${formatPrice(totalPrice)}`}
                </button>
              )}
              {step === 1 && (
                <button type="button" className="create-orden-btn-cancel" onClick={onClose} disabled={loading}>
                  Cancelar
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateOrdenes;