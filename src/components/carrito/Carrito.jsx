// pages/Carrito.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../../context/config';
import '../../css/Productos/carrito.css';

// Íconos
import backIcon from '../../img/atras.png';
import deleteIcon from '../../img/delete.png';
import trashIcon from '../../img/delete.png';
import suplementoGenericoIcon from '../../img/DietLettuce.png';
import arrowRightIcon from '../../img/derecha.png';
import arrowLeftIcon from '../../img/izquierda.png';
import homeIcon from '../../img/casa.png';
import workIcon from '../../img/trabajo.png';
import otherIcon from '../../img/ubicacion.png';
import addIcon from '../../img/mas.png';

import visaIcon from '../../img/visa.png';
import mastercardIcon from '../../img/mastercard.png';
import amexIcon from '../../img/amex.png';
import defaultCardIcon from '../../img/tarjeta.png';
import estrellaIcon from '../../img/estrella.png';

const Carrito = () => {
  const navigate = useNavigate();
  const { t, darkMode } = useConfig();
  
  // Estados del carrito
  const [carritoItems, setCarritoItems] = useState([]);
  const [totalCarritoItems, setTotalCarritoItems] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Estados para los pasos del checkout
  const [currentStep, setCurrentStep] = useState(1);
  const [infoForm, setInfoForm] = useState({
    nombre_completo: '',
    telefono: ''
  });
  const [direccionForm, setDireccionForm] = useState({
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
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [notasPedido, setNotasPedido] = useState('');
  const [procesandoPedido, setProcesandoPedido] = useState(false);
  
  // Estados para direcciones guardadas
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userDirecciones, setUserDirecciones] = useState([]);
  const [loadingDirecciones, setLoadingDirecciones] = useState(false);
  const [useSavedAddress, setUseSavedAddress] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // Estados para tarjetas guardadas
  const [userTarjetas, setUserTarjetas] = useState([]);
  const [loadingTarjetas, setLoadingTarjetas] = useState(false);
  const [selectedTarjetaId, setSelectedTarjetaId] = useState(null);
  const [useSavedCard, setUseSavedCard] = useState(true);
  const [showNewCardForm, setShowNewCardForm] = useState(false);

  // Estados para formulario de tarjeta (nueva)
  const [tarjetaForm, setTarjetaForm] = useState({
    nombre_titular: '',
    numero_tarjeta: '',
    mes_expiracion: '',
    anio_expiracion: '',
    tipo_tarjeta: 'visa'
  });
  const [aceptoTerminos, setAceptoTerminos] = useState(false);
  const [showPoliticaSeguridad, setShowPoliticaSeguridad] = useState(false);
  const [showTarjetaNumber, setShowTarjetaNumber] = useState(false);

  // Clave para localStorage
  const carritoKey = 'carrito_suplementos';

  // ========== FUNCIONES DEL CARRITO ==========
  const getCarritoFromStorage = () => {
    try {
      const carritoStr = localStorage.getItem(carritoKey);
      return carritoStr ? JSON.parse(carritoStr) : [];
    } catch (error) {
      console.error('Error al cargar carrito:', error);
      return [];
    }
  };

  const saveCarritoToStorage = (carrito) => {
    try {
      localStorage.setItem(carritoKey, JSON.stringify(carrito));
    } catch (error) {
      console.error('Error al guardar carrito:', error);
    }
  };

  const loadCarrito = () => {
    setLoading(true);
    const carrito = getCarritoFromStorage();
    setCarritoItems(carrito);
    
    const total = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);
    setTotalCarritoItems(total);
    setLoading(false);
  };

  const eliminarDelCarrito = (id) => {
    const carrito = getCarritoFromStorage();
    const nuevoCarrito = carrito.filter(item => item.id !== id);
    saveCarritoToStorage(nuevoCarrito);
    loadCarrito();
    
    setSuccessMessage('Producto eliminado del carrito');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const actualizarCantidadCarrito = (id, cantidad) => {
    if (cantidad < 1) {
      setItemToDelete(id);
      setShowDeleteConfirm(true);
      return;
    }

    const carrito = getCarritoFromStorage();
    const producto = carrito.find(item => item.id === id);
    
    if (producto) {
      producto.cantidad = cantidad;
      saveCarritoToStorage(carrito);
      loadCarrito();
    }
  };

  const vaciarCarrito = () => {
    if (window.confirm('¿Estás seguro de que quieres vaciar todo el carrito?')) {
      saveCarritoToStorage([]);
      loadCarrito();
      setSuccessMessage('Carrito vaciado correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const calcularTotalCarrito = () => {
    return carritoItems.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  // ========== FUNCIONES PARA DATOS DE USUARIO ==========
  const loadUserData = () => {
    try {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
      
      if (token) {
        const userStr = localStorage.getItem('user') || localStorage.getItem('userData');
        if (userStr) {
          const user = JSON.parse(userStr);
          setInfoForm(prev => ({
            ...prev,
            nombre_completo: user.nombre || user.nombre_completo || '',
            telefono: user.telefono || ''
          }));
        }
      }
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
    }
  };

  const fetchUserDirecciones = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      setLoadingDirecciones(true);
      const response = await fetch('http://127.0.0.1:5000/direcciones/me/direcciones', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const direccionesData = data.direcciones || [];
        setUserDirecciones(direccionesData);
        
        if (direccionesData.length > 0) {
          const predeterminada = direccionesData.find(dir => dir.predeterminada);
          if (predeterminada) {
            setSelectedAddressId(predeterminada.id);
            setDireccionForm({
              calle: predeterminada.calle || '',
              numero_exterior: predeterminada.numero_exterior || '',
              numero_interior: predeterminada.numero_interior || '',
              colonia: predeterminada.colonia || '',
              ciudad: predeterminada.ciudad || '',
              estado: predeterminada.estado || '',
              codigo_postal: predeterminada.codigo_postal || '',
              referencias: predeterminada.referencias || '',
              tipo: predeterminada.tipo || 'casa'
            });
          } else {
            setSelectedAddressId(direccionesData[0].id);
          }
          setUseSavedAddress(true);
          setShowNewAddressForm(false);
        }
      }
    } catch (error) {
      console.error('Error al obtener direcciones:', error);
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

  // ========== MANEJADORES DE FORMULARIOS ==========
  const handleInfoChange = (e) => {
    if (!isAuthenticated) {
      const { name, value } = e.target;
      setInfoForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleDireccionChange = (e) => {
    const { name, value } = e.target;
    setDireccionForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressSelect = (direccion) => {
    setSelectedAddressId(direccion.id);
    setDireccionForm({
      calle: direccion.calle || '',
      numero_exterior: direccion.numero_exterior || '',
      numero_interior: direccion.numero_interior || '',
      colonia: direccion.colonia || '',
      ciudad: direccion.ciudad || '',
      estado: direccion.estado || '',
      codigo_postal: direccion.codigo_postal || '',
      referencias: direccion.referencias || '',
      tipo: direccion.tipo || 'casa'
    });
  };

  const handleCardSelect = (tarjeta) => {
    setSelectedTarjetaId(tarjeta.id);
  };

  const handleTarjetaChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'numero_tarjeta') {
      const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
      setTarjetaForm(prev => ({ ...prev, [name]: formatted }));
      
      const firstDigit = formatted.charAt(0);
      if (firstDigit === '4') {
        setTarjetaForm(prev => ({ ...prev, tipo_tarjeta: 'visa' }));
      } else if (firstDigit === '5') {
        setTarjetaForm(prev => ({ ...prev, tipo_tarjeta: 'mastercard' }));
      } else if (firstDigit === '3') {
        setTarjetaForm(prev => ({ ...prev, tipo_tarjeta: 'amex' }));
      }
    } else if (name === 'mes_expiracion') {
      const mes = value.replace(/[^0-9]/g, '').slice(0, 2);
      setTarjetaForm(prev => ({ ...prev, [name]: mes }));
    } else if (name === 'anio_expiracion') {
      const anio = value.replace(/[^0-9]/g, '').slice(0, 4);
      setTarjetaForm(prev => ({ ...prev, [name]: anio }));
    } else {
      setTarjetaForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // ========== FUNCIONES PARA PASOS ==========
  const validateTelefono = (telefono) => {
    const telefonoLimpio = telefono.replace(/\D/g, '');
    
    if (telefono.startsWith('+52')) {
      return telefonoLimpio.length === 12;
    }
    
    return telefonoLimpio.length === 10;
  };

  const validateTarjeta = () => {
    const errors = {};
    
    if (!tarjetaForm.nombre_titular.trim()) {
      errors.nombre_titular = 'El nombre del titular es requerido';
    }
    
    const numero = tarjetaForm.numero_tarjeta.replace(/\s/g, '');
    if (!numero) {
      errors.numero_tarjeta = 'El número de tarjeta es requerido';
    } else if (!/^\d{13,19}$/.test(numero)) {
      errors.numero_tarjeta = 'Número de tarjeta inválido';
    }
    
    if (!tarjetaForm.mes_expiracion) {
      errors.mes_expiracion = 'El mes es requerido';
    } else {
      const mes = parseInt(tarjetaForm.mes_expiracion);
      if (mes < 1 || mes > 12) {
        errors.mes_expiracion = 'Mes inválido';
      }
    }
    
    if (!tarjetaForm.anio_expiracion) {
      errors.anio_expiracion = 'El año es requerido';
    } else {
      const anio = parseInt(tarjetaForm.anio_expiracion);
      const fechaActual = new Date();
      const anioActual = fechaActual.getFullYear();
      const mesActual = fechaActual.getMonth() + 1;
      
      if (anio < anioActual || anio > anioActual + 10) {
        errors.anio_expiracion = 'Año inválido';
      } else if (anio === anioActual && parseInt(tarjetaForm.mes_expiracion) < mesActual) {
        errors.mes_expiracion = 'La tarjeta ha expirado';
      }
    }
    
    if (!aceptoTerminos) {
      errors.terminos = 'Debes aceptar los términos y condiciones';
    }
    
    return errors;
  };

  const handleSiguientePaso = () => {
    if (carritoItems.length === 0) {
      setErrorMessage('El carrito está vacío');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      const camposRequeridos = ['nombre_completo', 'telefono'];
      const camposFaltantes = camposRequeridos.filter(campo => !infoForm[campo].trim());
      
      if (camposFaltantes.length > 0) {
        setErrorMessage('Por favor completa todos los campos obligatorios');
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }
      
      if (!validateTelefono(infoForm.telefono)) {
        setErrorMessage('Formato de teléfono inválido. Use: 10 dígitos o +52 seguido de 10 dígitos (ej: +521234567890)');
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }
      
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (isAuthenticated && useSavedAddress && selectedAddressId) {
        setCurrentStep(4);
        return;
      }
      
      const camposRequeridos = ['calle', 'numero_exterior', 'colonia', 'ciudad', 'estado', 'codigo_postal'];
      const camposFaltantes = camposRequeridos.filter(campo => !direccionForm[campo].trim());
      
      if (camposFaltantes.length > 0) {
        setErrorMessage('Por favor completa todos los campos obligatorios de la dirección');
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }
      
      if (!/^\d{5}$/.test(direccionForm.codigo_postal)) {
        setErrorMessage('El código postal debe tener 5 dígitos');
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }
      
      setCurrentStep(4);
    }
  };

  const handlePasoAnterior = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinalizarPedido = async () => {
    if (carritoItems.length === 0) {
      setErrorMessage('El carrito está vacío');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (metodoPago === 'tarjeta') {
      if (isAuthenticated && useSavedCard && selectedTarjetaId) {
        // Usar tarjeta guardada
        const tarjetaSeleccionada = userTarjetas.find(t => t.id === selectedTarjetaId);
        if (!tarjetaSeleccionada) {
          setErrorMessage('Por favor selecciona una tarjeta');
          setTimeout(() => setErrorMessage(''), 3000);
          return;
        }
      } else {
        // Validar nueva tarjeta
        const tarjetaErrors = validateTarjeta();
        if (Object.keys(tarjetaErrors).length > 0) {
          setErrorMessage('Por favor completa correctamente todos los datos de la tarjeta');
          setTimeout(() => setErrorMessage(''), 3000);
          return;
        }
      }
    }

    setProcesandoPedido(true);
    
    try {
      let direccionTextoCompleta = '';

      if (isAuthenticated && useSavedAddress && selectedAddressId) {
        const direccionSeleccionada = userDirecciones.find(d => d.id === selectedAddressId);
        if (direccionSeleccionada) {
          direccionTextoCompleta = `${direccionSeleccionada.calle} #${direccionSeleccionada.numero_exterior}${direccionSeleccionada.numero_interior ? ` Int. ${direccionSeleccionada.numero_interior}` : ''}, ${direccionSeleccionada.colonia}, ${direccionSeleccionada.ciudad}, ${direccionSeleccionada.estado}, CP: ${direccionSeleccionada.codigo_postal}`;
          if (direccionSeleccionada.referencias) {
            direccionTextoCompleta += ` (Ref: ${direccionSeleccionada.referencias})`;
          }
        }
      } else {
        direccionTextoCompleta = `${direccionForm.calle} #${direccionForm.numero_exterior}${direccionForm.numero_interior ? ` Int. ${direccionForm.numero_interior}` : ''}, ${direccionForm.colonia}, ${direccionForm.ciudad}, ${direccionForm.estado}, CP: ${direccionForm.codigo_postal}`;
        if (direccionForm.referencias) {
          direccionTextoCompleta += ` (Ref: ${direccionForm.referencias})`;
        }
      }

      const pedido_json = {
        tipo: 'carrito',
        items: carritoItems.map(item => ({
          suplemento_id: item.id,
          nombre: item.nombre,
          cantidad: item.cantidad,
          precio_unitario: item.precio,
          subtotal: item.precio * item.cantidad
        })),
        total: calcularTotalCarrito(),
        direccion: direccionForm,
        cliente: {
          nombre: infoForm.nombre_completo,
          telefono: infoForm.telefono
        },
        direccion_texto_completa: direccionTextoCompleta
      };

      const totalCalculado = calcularTotalCarrito();
      console.log('💰 TOTAL CALCULADO:', totalCalculado);
      console.log('💰 TOTAL CALCULADO (número):', Number(totalCalculado));
      console.log('💰 TOTAL CALCULADO (tipo):', typeof totalCalculado);

      const pedidoData = {
        tipo_pedido: 'carrito',
        nombre_usuario: infoForm.nombre_completo,
        telefono_usuario: infoForm.telefono,
        metodo_pago: metodoPago,
        precio_total: Number(totalCalculado), // Asegurar que sea número
        notas: notasPedido.trim() || 'Pedido desde carrito de compras',
        pedido_json: JSON.stringify(pedido_json),
        direccion_texto: direccionTextoCompleta
      };

      console.log('='*60);
      console.log('📦 DATOS ENVIADOS AL BACKEND:');
      console.log(JSON.stringify(pedidoData, null, 2));
      console.log('='*60);

      if (isAuthenticated && useSavedAddress && selectedAddressId) {
        pedidoData.direccion_id = selectedAddressId;
      }

      if (metodoPago === 'tarjeta') {
        if (isAuthenticated && useSavedCard && selectedTarjetaId) {
          pedidoData.tarjeta_id = selectedTarjetaId;
        } else {
          const numeroLimpio = tarjetaForm.numero_tarjeta.replace(/\s/g, '');
          pedidoData.info_pago = {
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

      const response = await fetch('http://127.0.0.1:5000/ordenes/', {
        method: 'POST',
        headers,
        body: JSON.stringify(pedidoData)
      });

      if (response.ok) {
        const data = await response.json();
        
        console.log('✅ RESPUESTA DEL SERVIDOR:');
        console.log(JSON.stringify(data, null, 2));
        
        saveCarritoToStorage([]);
        setSuccessMessage(`¡Pedido realizado exitosamente! Código: ${data.orden?.codigo_unico || 'N/A'}`);
        
        setTimeout(() => {
          navigate('/productos');
        }, 2000);
      } else {
        const errorData = await response.json();
        console.log('❌ ERROR DEL SERVIDOR:');
        console.log(errorData);
        setErrorMessage(errorData.msg || 'Error al procesar el pedido');
      }
    } catch (error) {
      console.error('❌ ERROR DE CONEXIÓN:', error);
      setErrorMessage('Error de conexión. Intenta nuevamente.');
    } finally {
      setProcesandoPedido(false);
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  // ========== FUNCIONES DE NAVEGACIÓN ==========
  const handleSeguirComprando = () => {
    navigate('/productos');
  };

  const handleGoBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate(-1);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price || 0);
  };

  // Función para obtener el icono de la tarjeta
  const getTarjetaIcon = (tipo) => {
    switch(tipo) {
      case 'visa': return visaIcon;
      case 'mastercard': return mastercardIcon;
      case 'amex': return amexIcon;
      default: return defaultCardIcon;
    }
  };

  // Formatear número de tarjeta para mostrar
  const formatearNumeroTarjeta = (numeroEnmascarado) => {
    return numeroEnmascarado || "**** **** **** 1234";
  };

  // Cargar datos al iniciar
  useEffect(() => {
    loadCarrito();
    loadUserData();
    if (localStorage.getItem('token')) {
      fetchUserDirecciones();
      fetchUserTarjetas();
    }
  }, []);

  // ========== RENDERIZADO DE PASOS ==========
  const renderPasoCarrito = () => {
    const totalCarrito = calcularTotalCarrito();

    return (
      <>
        {/* Lista de Productos */}
        <div className="carrito-productos-section">
          <div className="section-header">
            <h3>Suplementos en el Carrito</h3>
            <button 
              onClick={vaciarCarrito}
              className="carrito-vaciar-btn"
            >
              <img src={trashIcon} alt="Vaciar" className="icon-img" />
              Vaciar Carrito
            </button>
          </div>
          
          <div className="carrito-productos-list">
            {carritoItems.map((item, index) => (
              <React.Fragment key={item.id}>
                <div className="carrito-producto-card">
                  <div className="producto-imagen">
                    <img 
                      src={item.imagen || suplementoGenericoIcon} 
                      alt={item.nombre}
                      onError={(e) => {
                        e.target.src = suplementoGenericoIcon;
                      }}
                    />
                  </div>
                  
                  <div className="producto-info">
                    <div className="producto-header">
                      <h4 className="producto-nombre">{item.nombre}</h4>
                      <button 
                        onClick={() => {
                          setItemToDelete(item.id);
                          setShowDeleteConfirm(true);
                        }}
                        className="producto-eliminar-btn"
                        title="Eliminar producto"
                      >
                        <img src={deleteIcon} alt="Eliminar" className="icon-img" />
                      </button>
                    </div>
                    
                    <div className="producto-controls">
                      <div className="cantidad-control">
                        <label>Cantidad:</label>
                        <div className="cantidad-buttons">
                          <button 
                            onClick={() => actualizarCantidadCarrito(item.id, item.cantidad - 1)}
                            className="cantidad-btn decrement"
                            disabled={item.cantidad <= 1}
                          >
                            −
                          </button>
                          <span className="cantidad-value">{item.cantidad}</span>
                          <button 
                            onClick={() => actualizarCantidadCarrito(item.id, item.cantidad + 1)}
                            className="cantidad-btn increment"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      <div className="producto-precios">
                        <div className="precio-unitario">
                          {formatPrice(item.precio)} c/u
                        </div>
                        <div className="precio-subtotal">
                          <strong>{formatPrice(item.precio * item.cantidad)}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {index < carritoItems.length - 1 && <hr className="producto-divisor" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Resumen del Pedido */}
        <div className="carrito-resumen-section">
          <div className="carrito-resumen-card">
            <div className="resumen-header">
              <h3>Resumen del Pedido</h3>
            </div>
            
            <div className="resumen-detalle">
              <div className="resumen-row">
                <span>Suplementos ({totalCarritoItems})</span>
                <span>{formatPrice(totalCarrito)}</span>
              </div>
              
              <div className="resumen-row envio">
                <span>Costo de envío</span>
                <span className="envio-gratis">Gratis</span>
              </div>
              
              <div className="resumen-separador"></div>
              
              <div className="resumen-row total">
                <strong>Total a pagar</strong>
                <strong className="total-precio">{formatPrice(totalCarrito)}</strong>
              </div>
            </div>
            
            <div className="resumen-acciones">
              <button 
                onClick={handleSiguientePaso}
                className="carrito-procesar-btn"
                disabled={carritoItems.length === 0}
              >
                Continuar con el Pedido
                <img src={arrowRightIcon} alt="Siguiente" className="btn-icon-right" />
              </button>
              
              <div className="beneficios-carrito">
                <p className="beneficio">
                  <span className="check-icon">✓</span> Envío gratis
                </p>
                <p className="beneficio">
                  <span className="check-icon">✓</span> Entrega garantizada en 48-72 horas
                </p>
                <p className="beneficio">
                  <span className="check-icon">✓</span> Paga en efectivo o tarjeta
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderPasoInformacion = () => {
    return (
      <div className="checkout-paso">
        <div className="paso-header">
          <div className="paso-indicador">
            <span className="paso-numero completado">✓</span>
            <span className="paso-linea activo"></span>
            <span className="paso-numero activo">2</span>
            <span className="paso-linea"></span>
            <span className="paso-numero">3</span>
            <span className="paso-linea"></span>
            <span className="paso-numero">4</span>
          </div>
          <div className="paso-titulos">
            <span className="paso-titulo completado">Carrito</span>
            <span className="paso-titulo activo">Información</span>
            <span className="paso-titulo">Dirección</span>
            <span className="paso-titulo">Pago</span>
          </div>
        </div>

        <div className="info-container">
          <h3>Información personal</h3>
          <p className="info-subtitulo">Ingresa tus datos para la entrega del pedido</p>
          
          <div className="info-formulario">
            <div className="form-grid">
              <div className="form-group">
                <label>Nombre completo *</label>
                {isAuthenticated ? (
                  <>
                    <input
                      type="text"
                      name="nombre_completo"
                      value={infoForm.nombre_completo}
                      readOnly
                      className="form-input readonly-input"
                      placeholder="Cargando información del perfil..."
                      disabled
                    />
                    <div className="field-info">
                      <small>Obtenido de tu perfil (solo lectura)</small>
                    </div>
                  </>
                ) : (
                  <input
                    type="text"
                    name="nombre_completo"
                    value={infoForm.nombre_completo}
                    onChange={handleInfoChange}
                    placeholder="Tu nombre completo"
                    className="form-input"
                    required
                  />
                )}
              </div>
              
              <div className="form-group">
                <label>Teléfono *</label>
                {isAuthenticated ? (
                  <>
                    <input
                      type="tel"
                      name="telefono"
                      value={infoForm.telefono}
                      readOnly
                      className="form-input readonly-input"
                      placeholder="Cargando información del perfil..."
                      disabled
                    />
                    <div className="field-info">
                      <small>Obtenido de tu perfil (solo lectura)</small>
                    </div>
                  </>
                ) : (
                  <>
                    <input
                      type="tel"
                      name="telefono"
                      value={infoForm.telefono}
                      onChange={handleInfoChange}
                      placeholder="10 dígitos o +521234567890"
                      className="form-input"
                      required
                    />
                    <small className="form-hint">Formato: 10 dígitos o +52 seguido de 10 dígitos</small>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Botones de navegación */}
        <div className="checkout-navigation">
          <button 
            onClick={handlePasoAnterior}
            className="btn-nav prev-btn"
          >
            <img src={arrowLeftIcon} alt="Anterior" className="btn-icon" />
            Volver al Carrito
          </button>
          <button 
            onClick={handleSiguientePaso}
            className="btn-nav next-btn"
          >
            Continuar a Dirección
            <img src={arrowRightIcon} alt="Siguiente" className="btn-icon" />
          </button>
        </div>
      </div>
    );
  };

  const renderPasoDireccion = () => {
    return (
      <div className="checkout-paso">
        <div className="paso-header">
          <div className="paso-indicador">
            <span className="paso-numero completado">✓</span>
            <span className="paso-linea activo"></span>
            <span className="paso-numero completado">✓</span>
            <span className="paso-linea activo"></span>
            <span className="paso-numero activo">3</span>
            <span className="paso-linea"></span>
            <span className="paso-numero">4</span>
          </div>
          <div className="paso-titulos">
            <span className="paso-titulo completado">Carrito</span>
            <span className="paso-titulo completado">Información</span>
            <span className="paso-titulo activo">Dirección</span>
            <span className="paso-titulo">Pago</span>
          </div>
        </div>

        <div className="direccion-container">
          <h3>Dirección de entrega</h3>
          <p className="direccion-subtitulo">Selecciona o ingresa la dirección donde quieres recibir tu pedido</p>
          
          {isAuthenticated && userDirecciones.length > 0 && !showNewAddressForm && (
            <div className="form-section">
              <h4>Tus direcciones guardadas</h4>
              {loadingDirecciones ? (
                <div className="loading-direcciones">
                  <div className="spinner small"></div>
                  <p>Cargando direcciones...</p>
                </div>
              ) : (
                <>
                  <div className="direcciones-guardadas">
                    {userDirecciones.map((direccion) => (
                      <div 
                        key={direccion.id} 
                        className={`direccion-guardada ${selectedAddressId === direccion.id ? 'seleccionada' : ''}`}
                        onClick={() => handleAddressSelect(direccion)}
                      >
                        <div className="direccion-guardada-header">
                          <div className="direccion-tipo">
                            {direccion.tipo === 'casa' ? (
                              <img src={homeIcon} alt="Casa" className="direccion-icon" />
                            ) : direccion.tipo === 'trabajo' ? (
                              <img src={workIcon} alt="Trabajo" className="direccion-icon" />
                            ) : (
                              <img src={otherIcon} alt="Otro" className="direccion-icon" />
                            )}
                            <span>{direccion.tipo === 'casa' ? 'Casa' : direccion.tipo === 'trabajo' ? 'Trabajo' : 'Otro'}</span>
                            {direccion.predeterminada && (
                              <span className="direccion-pred">Predeterminada</span>
                            )}
                          </div>
                          <div className="direccion-radio">
                            <input 
                              type="radio" 
                              name="savedAddress" 
                              checked={selectedAddressId === direccion.id}
                              onChange={() => handleAddressSelect(direccion)}
                            />
                          </div>
                        </div>
                        <div className="direccion-info">
                          <p><strong>{direccion.calle} #{direccion.numero_exterior}</strong>{direccion.numero_interior ? ` Int. ${direccion.numero_interior}` : ''}</p>
                          <p>{direccion.colonia}, {direccion.ciudad}, {direccion.estado}</p>
                          <p>CP: {direccion.codigo_postal}</p>
                          {direccion.referencias && (
                            <p className="direccion-referencias">
                              <small>Referencias: {direccion.referencias}</small>
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    type="button"
                    className="btn-agregar-direccion"
                    onClick={() => {
                      setShowNewAddressForm(true);
                      setUseSavedAddress(false);
                      setDireccionForm({
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
                    }}
                  >
                    <img src={addIcon} alt="Agregar" className="btn-icon-left" />
                    Agregar nueva dirección
                  </button>
                </>
              )}
            </div>
          )}

          {(showNewAddressForm || !isAuthenticated || userDirecciones.length === 0) && (
            <div className="form-section">
              <h4>{isAuthenticated ? 'Nueva dirección' : 'Dirección de entrega'}</h4>
              
              {isAuthenticated && userDirecciones.length > 0 && (
                <button 
                  type="button"
                  className="btn-volver-direcciones"
                  onClick={() => {
                    setShowNewAddressForm(false);
                    setUseSavedAddress(true);
                    if (selectedAddressId) {
                      const direccionSeleccionada = userDirecciones.find(dir => dir.id === selectedAddressId);
                      if (direccionSeleccionada) {
                        handleAddressSelect(direccionSeleccionada);
                      }
                    }
                  }}
                >
                  ← Volver a direcciones guardadas
                </button>
              )}
              
              <div className="direccion-formulario">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Calle *</label>
                    <input
                      type="text"
                      name="calle"
                      value={direccionForm.calle}
                      onChange={handleDireccionChange}
                      placeholder="Nombre de la calle"
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Número Exterior *</label>
                    <input
                      type="text"
                      name="numero_exterior"
                      value={direccionForm.numero_exterior}
                      onChange={handleDireccionChange}
                      placeholder="123"
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Número Interior</label>
                    <input
                      type="text"
                      name="numero_interior"
                      value={direccionForm.numero_interior}
                      onChange={handleDireccionChange}
                      placeholder="A"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Colonia *</label>
                    <input
                      type="text"
                      name="colonia"
                      value={direccionForm.colonia}
                      onChange={handleDireccionChange}
                      placeholder="Nombre de la colonia"
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Ciudad *</label>
                    <input
                      type="text"
                      name="ciudad"
                      value={direccionForm.ciudad}
                      onChange={handleDireccionChange}
                      placeholder="Nombre de la ciudad"
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Estado *</label>
                    <input
                      type="text"
                      name="estado"
                      value={direccionForm.estado}
                      onChange={handleDireccionChange}
                      placeholder="Nombre del estado"
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Código Postal *</label>
                    <input
                      type="text"
                      name="codigo_postal"
                      value={direccionForm.codigo_postal}
                      onChange={handleDireccionChange}
                      placeholder="12345"
                      maxLength="5"
                      className="form-input"
                      required
                    />
                    <small className="form-hint">5 dígitos</small>
                  </div>
                  
                  <div className="form-group">
                    <label>Tipo de Dirección</label>
                    <select
                      name="tipo"
                      value={direccionForm.tipo}
                      onChange={handleDireccionChange}
                      className="form-select"
                    >
                      <option value="casa">Casa</option>
                      <option value="trabajo">Trabajo</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Referencias (opcional)</label>
                    <textarea
                      name="referencias"
                      value={direccionForm.referencias}
                      onChange={handleDireccionChange}
                      placeholder="Entre calles, puntos de referencia, color de la casa, etc."
                      rows="3"
                      className="form-textarea"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botones de navegación */}
        <div className="checkout-navigation">
          <button 
            onClick={handlePasoAnterior}
            className="btn-nav prev-btn"
          >
            <img src={arrowLeftIcon} alt="Anterior" className="btn-icon" />
            Volver a Información
          </button>
          <button 
            onClick={handleSiguientePaso}
            className="btn-nav next-btn"
          >
            Continuar al Pago
            <img src={arrowRightIcon} alt="Siguiente" className="btn-icon" />
          </button>
        </div>
      </div>
    );
  };

  const renderPasoPago = () => {
    const totalCarrito = calcularTotalCarrito();

    return (
      <div className="checkout-paso">
        <div className="paso-header">
          <div className="paso-indicador">
            <span className="paso-numero completado">✓</span>
            <span className="paso-linea activo"></span>
            <span className="paso-numero completado">✓</span>
            <span className="paso-linea activo"></span>
            <span className="paso-numero completado">✓</span>
            <span className="paso-linea activo"></span>
            <span className="paso-numero activo">4</span>
          </div>
          <div className="paso-titulos">
            <span className="paso-titulo completado">Carrito</span>
            <span className="paso-titulo completado">Información</span>
            <span className="paso-titulo completado">Dirección</span>
            <span className="paso-titulo activo">Pago</span>
          </div>
        </div>

        <div className="pago-container">
          <div className="pago-metodos">
            <h3>Método de pago</h3>
            
            <div className="metodos-grid">
              <div 
                className={`metodo-pago-card ${metodoPago === 'efectivo' ? 'seleccionado' : ''}`}
                onClick={() => setMetodoPago('efectivo')}
              >
                <div className="metodo-icon">💵</div>
                <div className="metodo-info">
                  <h4>Pago en Efectivo</h4>
                  <p>Paga cuando recibas tu pedido</p>
                  <div className="metodo-desc">
                    Entrega el dinero al repartidor al momento de la entrega.
                  </div>
                </div>
                <div className="metodo-radio">
                  <input 
                    type="radio" 
                    name="metodoPago" 
                    checked={metodoPago === 'efectivo'}
                    onChange={() => setMetodoPago('efectivo')}
                  />
                </div>
              </div>
              
              <div 
                className={`metodo-pago-card ${metodoPago === 'tarjeta' ? 'seleccionado' : ''}`}
                onClick={() => setMetodoPago('tarjeta')}
              >
                <div className="metodo-icon">💳</div>
                <div className="metodo-info">
                  <h4>Pago con Tarjeta</h4>
                  <p>Pago seguro en línea</p>
                  <div className="metodo-desc">
                    Paga ahora con tarjeta de crédito o débito.
                  </div>
                </div>
                <div className="metodo-radio">
                  <input 
                    type="radio" 
                    name="metodoPago" 
                    checked={metodoPago === 'tarjeta'}
                    onChange={() => setMetodoPago('tarjeta')}
                  />
                </div>
              </div>
            </div>
          </div>

          {metodoPago === 'tarjeta' && (
            <div className="tarjeta-form-container">
              <h3>Información de pago con tarjeta</h3>
              
              {/* Tarjetas guardadas */}
              {isAuthenticated && userTarjetas.length > 0 && !showNewCardForm && (
                <div className="form-section">
                  <h4>Tus tarjetas guardadas</h4>
                  {loadingTarjetas ? (
                    <div className="loading-tarjetas">
                      <div className="spinner small"></div>
                      <p>Cargando tarjetas...</p>
                    </div>
                  ) : (
                    <>
                      <div className="tarjetas-guardadas">
                        {userTarjetas.map((tarjeta) => (
                          <div 
                            key={tarjeta.id} 
                            className={`tarjeta-guardada ${selectedTarjetaId === tarjeta.id ? 'seleccionada' : ''}`}
                            onClick={() => handleCardSelect(tarjeta)}
                          >
                            <div className="tarjeta-guardada-header">
                              <div className="tarjeta-tipo">
                                <img 
                                  src={getTarjetaIcon(tarjeta.tipo_tarjeta)} 
                                  alt={tarjeta.tipo_tarjeta} 
                                  className="tarjeta-icon-small"
                                />
                                <span>
                                  {tarjeta.tipo_tarjeta === 'visa' ? 'Visa' :
                                   tarjeta.tipo_tarjeta === 'mastercard' ? 'Mastercard' :
                                   tarjeta.tipo_tarjeta === 'amex' ? 'American Express' : 'Tarjeta'}
                                </span>
                                {tarjeta.predeterminada && (
                                  <span className="tarjeta-predeterminada-badge">
                                    <img src={estrellaIcon} alt="Predeterminada" className="estrella-icon" />
                                    Principal
                                  </span>
                                )}
                              </div>
                              <div className="tarjeta-radio">
                                <input 
                                  type="radio" 
                                  name="savedCard" 
                                  checked={selectedTarjetaId === tarjeta.id}
                                  onChange={() => handleCardSelect(tarjeta)}
                                />
                              </div>
                            </div>
                            <div className="tarjeta-info">
                              <p className="tarjeta-numero">{formatearNumeroTarjeta(tarjeta.numero_enmascarado)}</p>
                              <p className="tarjeta-titular">{tarjeta.nombre_titular}</p>
                              <p className="tarjeta-expiracion">Exp: {tarjeta.mes_expiracion}/{tarjeta.anio_expiracion}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <button 
                        type="button"
                        className="btn-agregar-tarjeta"
                        onClick={() => {
                          setShowNewCardForm(true);
                          setUseSavedCard(false);
                        }}
                      >
                        <img src={addIcon} alt="Agregar" className="btn-icon-left" />
                        Usar otra tarjeta
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Formulario para nueva tarjeta */}
              {(showNewCardForm || !isAuthenticated || userTarjetas.length === 0) && (
                <div className="form-section">
                  <h4>{isAuthenticated ? 'Nueva tarjeta' : 'Datos de la tarjeta'}</h4>
                  
                  {isAuthenticated && userTarjetas.length > 0 && (
                    <button 
                      type="button"
                      className="btn-volver-tarjetas"
                      onClick={() => {
                        setShowNewCardForm(false);
                        setUseSavedCard(true);
                      }}
                    >
                      ← Volver a tarjetas guardadas
                    </button>
                  )}
                  
                  <div className="tarjeta-form-grid">
                    <div className="form-group full-width">
                      <label>Nombre del titular *</label>
                      <input
                        type="text"
                        name="nombre_titular"
                        value={tarjetaForm.nombre_titular}
                        onChange={handleTarjetaChange}
                        placeholder="Como aparece en la tarjeta"
                        className="form-input"
                        required
                      />
                    </div>
                    
                    <div className="form-group full-width">
                      <label>Número de tarjeta *</label>
                      <div className="tarjeta-input-container">
                        <input
                          type={showTarjetaNumber ? "text" : "password"}
                          name="numero_tarjeta"
                          value={tarjetaForm.numero_tarjeta}
                          onChange={handleTarjetaChange}
                          placeholder="1234 5678 9012 3456"
                          className="form-input tarjeta-input"
                          maxLength="19"
                          required
                        />
                        <button 
                          type="button" 
                          className="toggle-visibility-btn"
                          onClick={() => setShowTarjetaNumber(!showTarjetaNumber)}
                        >
                          {showTarjetaNumber ? '👁️' : '👁️‍🗨️'}
                        </button>
                        <div className="tarjeta-icons">
                          {tarjetaForm.tipo_tarjeta === 'visa' && (
                            <img src={visaIcon} alt="Visa" className="tarjeta-icon" />
                          )}
                          {tarjetaForm.tipo_tarjeta === 'mastercard' && (
                            <img src={mastercardIcon} alt="Mastercard" className="tarjeta-icon" />
                          )}
                          {tarjetaForm.tipo_tarjeta === 'amex' && (
                            <img src={amexIcon} alt="American Express" className="tarjeta-icon" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Mes *</label>
                      <input
                        type="text"
                        name="mes_expiracion"
                        value={tarjetaForm.mes_expiracion}
                        onChange={handleTarjetaChange}
                        placeholder="MM"
                        className="form-input"
                        maxLength="2"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Año *</label>
                      <input
                        type="text"
                        name="anio_expiracion"
                        value={tarjetaForm.anio_expiracion}
                        onChange={handleTarjetaChange}
                        placeholder="AAAA"
                        className="form-input"
                        maxLength="4"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="terminos-tarjeta">
                <div className="terminos-checkbox">
                  <input
                    type="checkbox"
                    id="aceptoTerminos"
                    checked={aceptoTerminos}
                    onChange={(e) => setAceptoTerminos(e.target.checked)}
                    className="terminos-input"
                  />
                  <label htmlFor="aceptoTerminos" className="terminos-label">
                    Acepto los <a href="/terminos" target="_blank">Términos y Condiciones</a> y 
                    la <button 
                      type="button" 
                      className="politica-link"
                      onClick={() => setShowPoliticaSeguridad(!showPoliticaSeguridad)}
                    >
                      Política de Seguridad
                    </button>
                  </label>
                </div>
                
                {showPoliticaSeguridad && (
                  <div className="politica-seguridad-popup">
                    <div className="politica-header">
                      <h4>🔒 Política de Seguridad de Pagos</h4>
                      <button 
                        className="close-politica"
                        onClick={() => setShowPoliticaSeguridad(false)}
                      >
                        ×
                      </button>
                    </div>
                    <div className="politica-content">
                      <p><strong>Tu seguridad es nuestra prioridad:</strong></p>
                      <ul>
                        <li>Encriptación SSL 256-bit de grado bancario</li>
                        <li>Cumplimiento PCI DSS - Estándar de seguridad más alto</li>
                        <li>Nunca almacenamos números completos de tarjetas</li>
                        <li>No guardamos códigos CVV en nuestros servidores</li>
                        <li>Procesamiento seguro con proveedores certificados</li>
                        <li>Monitoreo anti-fraude 24/7</li>
                        <li>Autenticación 3D Secure para mayor protección</li>
                      </ul>
                      <p className="politica-nota">
                        Los datos de pago son procesados directamente por nuestro proveedor de pagos certificado PCI DSS Nivel 1.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="info-seguridad">
                <div className="seguridad-icon">🔒</div>
                <div className="seguridad-text">
                  <p><strong>Pago 100% seguro</strong></p>
                  <p>Tus datos están protegidos con encriptación SSL de 256 bits. Nunca almacenamos información sensible de tu tarjeta.</p>
                </div>
              </div>
            </div>
          )}

          <div className="notas-container">
            <h3>Notas adicionales (opcional)</h3>
            <textarea
              value={notasPedido}
              onChange={(e) => setNotasPedido(e.target.value)}
              placeholder="Ej: Entregar en recepción, tocar timbre, instrucciones especiales..."
              rows="4"
              className="notas-textarea"
            />
            <p className="notas-hint">Estas notas serán enviadas para la preparación de tu pedido.</p>
          </div>
        </div>

        {/* Resumen final */}
        <div className="resumen-final">
          <div className="resumen-final-header">
            <h3>Resumen del Pedido</h3>
          </div>
          
          <div className="resumen-final-detalle">
            <div className="resumen-row">
              <span>Suplementos ({totalCarritoItems})</span>
              <span>{formatPrice(totalCarrito)}</span>
            </div>
            
            <div className="resumen-row envio">
              <span>Envío</span>
              <span className="envio-gratis">Gratis</span>
            </div>
            
            <div className="resumen-row">
              <span>Método de pago</span>
              <span className="metodo-pago-tag">
                {metodoPago === 'efectivo' ? '💵 Efectivo' : '💳 Tarjeta'}
              </span>
            </div>
            
            <div className="resumen-separador"></div>
            
            <div className="resumen-row total">
              <strong>Total</strong>
              <strong className="total-final">{formatPrice(totalCarrito)}</strong>
            </div>
          </div>
          
          <div className="resumen-final-acciones">
            <button 
              onClick={handlePasoAnterior}
              className="btn-final prev-btn"
            >
              <img src={arrowLeftIcon} alt="Anterior" className="btn-icon" />
              Volver a Dirección
            </button>
            <button 
              onClick={handleFinalizarPedido}
              disabled={procesandoPedido}
              className="btn-final confirm-btn"
            >
              {procesandoPedido ? (
                <>
                  <span className="spinner-btn"></span>
                  Procesando...
                </>
              ) : (
                `Finalizar Pedido - ${formatPrice(totalCarrito)}`
              )}
            </button>
          </div>
          
          <div className="terminos-info">
            <p>
              Al finalizar, aceptas nuestros <a href="/terminos" target="_blank">Términos y Condiciones</a> y nuestra <a href="/privacidad" target="_blank">Política de Privacidad</a>.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // ========== RENDER PRINCIPAL ==========
  if (loading) {
    return (
      <div className={`carrito-page-container ${darkMode ? 'dark-mode' : ''}`}>
        <div className="carrito-loading">
          <div className="spinner"></div>
          <p>Cargando carrito...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`carrito-page-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Header */}
      <header className="carrito-header">
        <div className="carrito-header-content">
          <div className="carrito-header-left">
            <button 
              onClick={handleGoBack}
              className="carrito-back-btn"
              title="Regresar"
            >
              <img src={backIcon} alt="Regresar" className="icon-img" />
            </button>
            <div className="carrito-header-title">
              <h2>
                {currentStep === 1 ? 'Mi Carrito' : 
                 currentStep === 2 ? 'Información' : 
                 currentStep === 3 ? 'Dirección' : 
                 'Confirmar Pedido'}
              </h2>
              {currentStep === 1 && totalCarritoItems > 0 && (
                <span className="carrito-count-badge">
                  {totalCarritoItems} {totalCarritoItems === 1 ? 'suplemento' : 'suplementos'}
                </span>
              )}
            </div>
          </div>
          
          <div className="carrito-header-right">
            <button 
              onClick={handleSeguirComprando}
              className="carrito-secondary-btn"
            >
              Seguir Comprando
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="carrito-main-content">
        {/* Mensajes */}
        {successMessage && (
          <div className="carrito-message success">
            <span className="message-icon">✓</span>
            {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className="carrito-message error">
            <span className="message-icon">⚠️</span>
            {errorMessage}
          </div>
        )}

        {/* Carrito Vacío */}
        {carritoItems.length === 0 ? (
          <div className="carrito-vacio-container">
            <div className="carrito-vacio-content">
              <img 
                src={suplementoGenericoIcon} 
                alt="Carrito vacío" 
                className="carrito-vacio-img"
              />
              <h3>Tu carrito está vacío</h3>
              <p>¡Agrega algunos suplementos para comenzar!</p>
              <button 
                onClick={handleSeguirComprando}
                className="carrito-primary-btn"
              >
                Ver Suplementos
              </button>
            </div>
          </div>
        ) : (
          <>
            {currentStep === 1 && renderPasoCarrito()}
            {currentStep === 2 && renderPasoInformacion()}
            {currentStep === 3 && renderPasoDireccion()}
            {currentStep === 4 && renderPasoPago()}
          </>
        )}
      </main>

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteConfirm && (
        <div className="carrito-modal-overlay">
          <div className="carrito-modal">
            <div className="modal-header">
              <h3>¿Eliminar suplemento?</h3>
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setItemToDelete(null);
                }}
                className="modal-close-btn"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <p>¿Estás seguro de que quieres eliminar este suplemento del carrito?</p>
            </div>
            
            <div className="modal-footer">
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setItemToDelete(null);
                }}
                className="modal-cancel-btn"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  if (itemToDelete) {
                    eliminarDelCarrito(itemToDelete);
                  }
                  setShowDeleteConfirm(false);
                  setItemToDelete(null);
                }}
                className="modal-confirm-btn"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Carrito;