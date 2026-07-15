import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../../context/config';
import CarritoProductos from './CarritoProductos';
import CarritoDetallePedido from './CarritoDetallePedido';
import DireccionesList from '../perfil/DireccionesList';
import ModalAgregarDireccion from '../perfil/CreateDireccion';
import ModalGestionarTarjetas from '../perfil/TarjetasList';
import ModalAgregarTarjeta from '../perfil/ModalAgregarTarjeta';
import '../../css/Carrito/carrito.css';

// Íconos
import backIcon from '../../img/atras.png';
import suplementoGenericoIcon from '../../img/Icon-Shop.png';

const Carrito = () => {
  const navigate = useNavigate();
  const { t, darkMode } = useConfig();
  
  // ========== ESTADOS ==========
  const [carritoItems, setCarritoItems] = useState([]);
  const [totalCarritoItems, setTotalCarritoItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showCheckoutPage, setShowCheckoutPage] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState(null);
  
  // Estados para el detalle del pedido
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userDirecciones, setUserDirecciones] = useState([]);
  const [loadingDirecciones, setLoadingDirecciones] = useState(false);
  const [useSavedAddress, setUseSavedAddress] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [userTarjetas, setUserTarjetas] = useState([]);
  const [loadingTarjetas, setLoadingTarjetas] = useState(false);
  const [selectedTarjetaId, setSelectedTarjetaId] = useState(null);
  const [useSavedCard, setUseSavedCard] = useState(true);
  const [showNewCardForm, setShowNewCardForm] = useState(false);
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
  
  // Estados para los modales
  const [showModalDirecciones, setShowModalDirecciones] = useState(false);
  const [showAgregarDireccionModal, setShowAgregarDireccionModal] = useState(false);
  const [direccionToEdit, setDireccionToEdit] = useState(null);
  const [showModalTarjetas, setShowModalTarjetas] = useState(false);
  const [showAgregarTarjetaModal, setShowAgregarTarjetaModal] = useState(false);
  const [tarjetaToEdit, setTarjetaToEdit] = useState(null);
  
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

  const actualizarCantidad = (id, cantidad) => {
    if (cantidad < 1) {
      eliminarDelCarrito(id);
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

  const calcularTotal = () => {
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
          setUserData(user);
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
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
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
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
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

  // ========== FUNCIONES DEL MODAL DE DIRECCIONES ==========
  const handleAbrirModalDirecciones = () => {
    setShowModalDirecciones(true);
  };

  const handleCerrarModalDirecciones = () => {
    setShowModalDirecciones(false);
  };

  const handleDeleteDireccion = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`http://127.0.0.1:5000/direcciones/me/direcciones/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        await fetchUserDirecciones();
        setSuccessMessage('Dirección eliminada correctamente');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage('Error al eliminar la dirección');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error al eliminar dirección:', error);
      setErrorMessage('Error de conexión');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleSetPredeterminada = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`http://127.0.0.1:5000/direcciones/me/direcciones/${id}/predeterminada`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        await fetchUserDirecciones();
        setSuccessMessage('Dirección predeterminada actualizada');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage('Error al establecer dirección predeterminada');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error al establecer predeterminada:', error);
      setErrorMessage('Error de conexión');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleAddDireccion = () => {
    setShowModalDirecciones(false);
    setShowAgregarDireccionModal(true);
    setDireccionToEdit(null);
  };

  const handleEditDireccion = (direccion) => {
    setShowModalDirecciones(false);
    setDireccionToEdit(direccion);
    setShowAgregarDireccionModal(true);
  };

  const handleSaveDireccion = async (direccionData) => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const dataToSend = {
        ...direccionData,
        user_id: user.id || userData?.id || user?.id
      };
      
      const url = direccionToEdit 
        ? `http://127.0.0.1:5000/direcciones/${direccionToEdit.id}`
        : 'http://127.0.0.1:5000/direcciones/me/add_direccion';
        
      const method = direccionToEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        await fetchUserDirecciones();
        setShowAgregarDireccionModal(false);
        setDireccionToEdit(null);
        setShowModalDirecciones(true);
        setSuccessMessage(direccionToEdit ? 'Dirección actualizada correctamente' : 'Dirección agregada correctamente');
        setTimeout(() => setSuccessMessage(''), 3000);
        return Promise.resolve();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.msg || 'No se pudo guardar la dirección'}`);
        return Promise.reject(errorData);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
      return Promise.reject(error);
    }
  };

  // ========== FUNCIONES DEL MODAL DE TARJETAS ==========
  const handleAbrirModalTarjetas = () => {
    setShowModalTarjetas(true);
  };

  const handleCerrarModalTarjetas = () => {
    setShowModalTarjetas(false);
  };

  const handleAbrirModalAgregarTarjeta = () => {
    setShowModalTarjetas(false);
    setShowAgregarTarjetaModal(true);
    setTarjetaToEdit(null);
  };

  const handleCerrarModalAgregarTarjeta = () => {
    setShowAgregarTarjetaModal(false);
    setTarjetaToEdit(null);
    setShowModalTarjetas(true);
  };

  const handleDeleteTarjeta = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`http://127.0.0.1:5000/tarjetas/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        await fetchUserTarjetas();
        setSuccessMessage('Tarjeta eliminada correctamente');
        setTimeout(() => setSuccessMessage(''), 3000);
        return true;
      } else {
        alert('Error al eliminar la tarjeta');
        return false;
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
      return false;
    }
  };

  const handleSetTarjetaPredeterminada = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`http://127.0.0.1:5000/tarjetas/${id}/predeterminada`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        await fetchUserTarjetas();
        setSuccessMessage('Tarjeta predeterminada actualizada');
        setTimeout(() => setSuccessMessage(''), 3000);
        return true;
      } else {
        alert('Error al actualizar tarjeta predeterminada');
        return false;
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
      return false;
    }
  };

  const handleEditTarjeta = (tarjeta) => {
    setShowModalTarjetas(false);
    setTarjetaToEdit(tarjeta);
    setShowAgregarTarjetaModal(true);
  };

  const handleSaveTarjeta = async (tarjetaData) => {
    try {
      const token = localStorage.getItem('token');
      const url = tarjetaToEdit 
        ? `http://127.0.0.1:5000/tarjetas/${tarjetaToEdit.id}`
        : 'http://127.0.0.1:5000/tarjetas/me/add_tarjeta';
      const method = tarjetaToEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tarjetaData)
      });

      if (response.ok) {
        await fetchUserTarjetas();
        setShowAgregarTarjetaModal(false);
        setTarjetaToEdit(null);
        setShowModalTarjetas(true);
        setSuccessMessage(tarjetaToEdit ? 'Tarjeta actualizada correctamente' : 'Tarjeta agregada correctamente');
        setTimeout(() => setSuccessMessage(''), 3000);
        return Promise.resolve();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.msg || 'No se pudo guardar la tarjeta'}`);
        return Promise.reject(errorData);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
      return Promise.reject(error);
    }
  };

  // ========== MANEJADORES ==========
  const handleInfoChange = (e) => {
    if (!isAuthenticated) {
      const { name, value } = e.target;
      setInfoForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDireccionChange = (e) => {
    const { name, value } = e.target;
    setDireccionForm(prev => ({ ...prev, [name]: value }));
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

  // ========== VALIDACIONES ==========
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

  // ========== NAVEGACIÓN DE PASOS ==========
  const handleSiguientePaso = () => {
    if (carritoItems.length === 0) {
      setErrorMessage('El carrito está vacío');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    
    if (currentStep === 1) {
      setCurrentStep(2);
      setShowCheckoutPage(true);
      return;
    }
    
    if (currentStep === 2) {
      const camposRequeridos = ['nombre_completo', 'telefono'];
      const camposFaltantes = camposRequeridos.filter(campo => !infoForm[campo]?.trim());
      if (camposFaltantes.length > 0) {
        setErrorMessage('Por favor completa todos los campos obligatorios');
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }
      if (!validateTelefono(infoForm.telefono)) {
        setErrorMessage('Formato de teléfono inválido. Use: 10 dígitos o +52 seguido de 10 dígitos');
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }
      setCurrentStep(3);
      return;
    }
    
    if (currentStep === 3) {
      if (isAuthenticated && useSavedAddress && selectedAddressId) {
        setCurrentStep(4);
        return;
      }
      const camposRequeridos = ['calle', 'numero_exterior', 'colonia', 'ciudad', 'estado', 'codigo_postal'];
      const camposFaltantes = camposRequeridos.filter(campo => !direccionForm[campo]?.trim());
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
      return;
    }
    
    if (currentStep === 4) {
      if (metodoPago === 'tarjeta') {
        if (isAuthenticated && useSavedCard && selectedTarjetaId) {
          const tarjetaSeleccionada = userTarjetas.find(t => t.id === selectedTarjetaId);
          if (!tarjetaSeleccionada) {
            setErrorMessage('Por favor selecciona una tarjeta');
            setTimeout(() => setErrorMessage(''), 3000);
            return;
          }
        } else {
          const tarjetaErrors = validateTarjeta();
          if (Object.keys(tarjetaErrors).length > 0) {
            setErrorMessage('Por favor completa correctamente todos los datos de la tarjeta');
            setTimeout(() => setErrorMessage(''), 3000);
            return;
          }
        }
      }
      setCurrentStep(5);
      return;
    }
    
    if (currentStep === 5) {
      handleFinalizarPedido();
    }
  };

  const handlePasoAnterior = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      setShowCheckoutPage(false);
      return;
    }
    
    if (currentStep > 2) {
      setCurrentStep(currentStep - 1);
      return;
    }
    
    if (currentStep === 1 && showCheckoutPage) {
      setShowCheckoutPage(false);
    }
  };

  // ===== FUNCIÓN PARA EL BOTÓN DE REGRESO DEL MENÚ (CORREGIDA) =====
  const handleGoBack = () => {
    // Si estamos en checkout (pasos 2-5)
    if (showCheckoutPage) {
      // Si estamos en el paso 2 (Información), volvemos al carrito
      if (currentStep === 2) {
        setShowCheckoutPage(false);
        setCurrentStep(1);
        return;
      }
      // Si estamos en el paso 3 o superior, retrocedemos un paso
      if (currentStep > 2) {
        setCurrentStep(currentStep - 1);
        return;
      }
      // Si estamos en el paso 1 pero con checkout visible (caso raro)
      if (currentStep === 1) {
        setShowCheckoutPage(false);
        return;
      }
    }
    
    // Si no estamos en checkout, navegamos a la página de productos
    navigate('/productos');
  };

  const handleSeguirComprando = () => {
    navigate('/productos');
  };

  // ========== FINALIZAR PEDIDO ==========
  const handleFinalizarPedido = async () => {
    if (carritoItems.length === 0) {
      setErrorMessage('El carrito está vacío');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (metodoPago === 'tarjeta') {
      if (isAuthenticated && useSavedCard && selectedTarjetaId) {
        const tarjetaSeleccionada = userTarjetas.find(t => t.id === selectedTarjetaId);
        if (!tarjetaSeleccionada) {
          setErrorMessage('Por favor selecciona una tarjeta');
          setTimeout(() => setErrorMessage(''), 3000);
          return;
        }
      } else {
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

      const totalCalculado = calcularTotal();
      const pedidoData = {
        tipo_pedido: 'carrito',
        nombre_usuario: infoForm.nombre_completo,
        telefono_usuario: infoForm.telefono,
        metodo_pago: metodoPago,
        precio_total: Number(totalCalculado),
        notas: notasPedido.trim() || 'Pedido desde carrito de compras',
        pedido_json: JSON.stringify({
          tipo: 'carrito',
          items: carritoItems.map(item => ({
            suplemento_id: item.id,
            nombre: item.nombre,
            cantidad: item.cantidad,
            precio_unitario: item.precio,
            subtotal: item.precio * item.cantidad
          })),
          total: totalCalculado,
          direccion: direccionForm,
          cliente: {
            nombre: infoForm.nombre_completo,
            telefono: infoForm.telefono
          },
          direccion_texto_completa: direccionTextoCompleta
        }),
        direccion_texto: direccionTextoCompleta
      };

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
      const headers = { 'Content-Type': 'application/json' };
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
        saveCarritoToStorage([]);
        setSuccessMessage(`¡Pedido realizado exitosamente! Código: ${data.orden?.codigo_unico || 'N/A'}`);
        setTimeout(() => {
          navigate('/productos');
        }, 2000);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.msg || 'Error al procesar el pedido');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      setErrorMessage('Error de conexión. Intenta nuevamente.');
    } finally {
      setProcesandoPedido(false);
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  // ========== FORMATO DE PRECIOS ==========
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price || 0);
  };

  // ========== EFECTOS ==========
  useEffect(() => {
    loadCarrito();
    loadUserData();
    if (localStorage.getItem('token')) {
      fetchUserDirecciones();
      fetchUserTarjetas();
    }
  }, []);

  // ========== RENDER ==========
  if (loading) {
    return (
      <div className={`carrito-shop-page-container ${darkMode ? 'dark-mode' : ''}`}>
        <div className="carrito-shop-loading">
          <div className="carrito-shop-spinner"></div>
          <p>Cargando carrito...</p>
        </div>
      </div>
    );
  }

  const getTitle = () => {
    if (showCheckoutPage) {
      switch(currentStep) {
        case 2: return 'Información Personal';
        case 3: return 'Dirección de Envío';
        case 4: return 'Método de Pago';
        case 5: return 'Resumen del Pedido';
        default: return 'Checkout';
      }
    }
    return 'Mi Carrito';
  };

  return (
    <div className={`carrito-shop-page-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* ===== HEADER ===== */}
      <header className="carrito-shop-header">
        <div className="carrito-shop-header-content">
          <div className="carrito-shop-header-left">
            <button 
              onClick={handleGoBack}
              className="carrito-shop-back-btn"
              title="Regresar"
            >
              <img src={backIcon} alt="Regresar" className="carrito-shop-icon-img" />
            </button>
            <div className="carrito-shop-header-title">
              <h2>{getTitle()}</h2>
            </div>
          </div>
          <div className="carrito-shop-header-right">
            <button 
              onClick={handleSeguirComprando}
              className="carrito-shop-secondary-btn"
            >
              Seguir Comprando
            </button>
          </div>
        </div>
      </header>

      {/* ===== CONTENIDO PRINCIPAL ===== */}
      <main className="carrito-shop-main-content">
        {successMessage && (
          <div className="carrito-shop-message success">
            <span className="carrito-shop-message-icon">✓</span>
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="carrito-shop-message error">
            <span className="carrito-shop-message-icon">⚠️</span>
            {errorMessage}
          </div>
        )}

        {!showCheckoutPage && (
          <>
            {carritoItems.length === 0 ? (
              <div className="carrito-shop-vacio-container">
                <div className="carrito-shop-vacio-content">
                  <img 
                    src={suplementoGenericoIcon} 
                    alt="Carrito vacío" 
                    className="carrito-shop-vacio-img"
                  />
                  <h3>Tu carrito está vacío</h3>
                  <p>¡Agrega algunos suplementos para comenzar!</p>
                  <button 
                    onClick={handleSeguirComprando}
                    className="carrito-shop-primary-btn"
                  >
                    Ver Suplementos
                  </button>
                </div>
              </div>
            ) : (
              <div className="carrito-shop-two-columns">
                <div className="carrito-productos-scroll">
                  <CarritoProductos 
                    carritoItems={carritoItems}
                    actualizarCantidad={actualizarCantidad}
                    eliminarDelCarrito={eliminarDelCarrito}
                    vaciarCarrito={vaciarCarrito}
                    calcularTotal={calcularTotal}
                    formatPrice={formatPrice}
                    handleSiguientePaso={handleSiguientePaso}
                  />
                </div>
                
                <div className="carrito-resumen-fijo">
                  <CarritoDetallePedido 
                    currentStep={currentStep}
                    handleSiguientePaso={handleSiguientePaso}
                    totalCarritoItems={totalCarritoItems}
                    calcularTotal={calcularTotal}
                    formatPrice={formatPrice}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {showCheckoutPage && (
          <div className="carrito-checkout-page">
            <CarritoDetallePedido 
              currentStep={currentStep}
              handlePasoAnterior={handlePasoAnterior}
              handleSiguientePaso={handleSiguientePaso}
              handleFinalizarPedido={handleFinalizarPedido}
              carritoItems={carritoItems}
              totalCarritoItems={totalCarritoItems}
              calcularTotal={calcularTotal}
              formatPrice={formatPrice}
              infoForm={infoForm}
              handleInfoChange={handleInfoChange}
              isAuthenticated={isAuthenticated}
              direccionForm={direccionForm}
              handleDireccionChange={handleDireccionChange}
              userDirecciones={userDirecciones}
              loadingDirecciones={loadingDirecciones}
              useSavedAddress={useSavedAddress}
              selectedAddressId={selectedAddressId}
              showNewAddressForm={showNewAddressForm}
              handleAddressSelect={handleAddressSelect}
              setShowNewAddressForm={setShowNewAddressForm}
              setUseSavedAddress={setUseSavedAddress}
              metodoPago={metodoPago}
              setMetodoPago={setMetodoPago}
              userTarjetas={userTarjetas}
              loadingTarjetas={loadingTarjetas}
              selectedTarjetaId={selectedTarjetaId}
              useSavedCard={useSavedCard}
              showNewCardForm={showNewCardForm}
              tarjetaForm={tarjetaForm}
              aceptoTerminos={aceptoTerminos}
              showPoliticaSeguridad={showPoliticaSeguridad}
              showTarjetaNumber={showTarjetaNumber}
              notasPedido={notasPedido}
              procesandoPedido={procesandoPedido}
              handleCardSelect={handleCardSelect}
              handleTarjetaChange={handleTarjetaChange}
              setShowNewCardForm={setShowNewCardForm}
              setUseSavedCard={setUseSavedCard}
              setAceptoTerminos={setAceptoTerminos}
              setShowPoliticaSeguridad={setShowPoliticaSeguridad}
              setShowTarjetaNumber={setShowTarjetaNumber}
              setNotasPedido={setNotasPedido}
              onAbrirModalDirecciones={handleAbrirModalDirecciones}
              onAbrirModalTarjetas={handleAbrirModalTarjetas}
            />
          </div>
        )}
      </main>

      {/* ===== MODAL DE GESTIONAR DIRECCIONES ===== */}
      <DireccionesList
        isOpen={showModalDirecciones}
        onClose={handleCerrarModalDirecciones}
        direcciones={userDirecciones}
        onDelete={handleDeleteDireccion}
        onSetPredeterminada={handleSetPredeterminada}
        onAdd={handleAddDireccion}
        onEdit={handleEditDireccion}
        onSelect={handleAddressSelect}
        darkMode={darkMode}
        showAddButton={true}
        showSetDefaultButton={false}
        isCheckout={true}
      />

      {/* ===== MODAL DE AGREGAR/EDITAR DIRECCIÓN ===== */}
      <ModalAgregarDireccion 
        isOpen={showAgregarDireccionModal}
        onClose={() => {
          setShowAgregarDireccionModal(false);
          setDireccionToEdit(null);
          setShowModalDirecciones(true);
        }}
        onSave={handleSaveDireccion}
        direccionToEdit={direccionToEdit}
      />

      {/* ===== MODAL DE GESTIONAR TARJETAS ===== */}
      <ModalGestionarTarjetas
        isOpen={showModalTarjetas}
        onClose={handleCerrarModalTarjetas}
        tarjetas={userTarjetas}
        onDelete={handleDeleteTarjeta}
        onSetPredeterminada={handleSetTarjetaPredeterminada}
        onAdd={handleAbrirModalAgregarTarjeta}
        onEdit={handleEditTarjeta}
        onSelect={handleCardSelect}
        selectedTarjetaId={selectedTarjetaId}
        userData={userData}
        showAddButton={true}
        isCheckout={true}
      />

      {/* ===== MODAL DE AGREGAR/EDITAR TARJETA ===== */}
      <ModalAgregarTarjeta 
        isOpen={showAgregarTarjetaModal}
        onClose={handleCerrarModalAgregarTarjeta}
        userData={userData}
        tarjetas={userTarjetas}
        onSuccess={() => {
          fetchUserTarjetas();
          setShowAgregarTarjetaModal(false);
          setShowModalTarjetas(true);
        }}
        tarjetaToEdit={tarjetaToEdit}
        onSave={handleSaveTarjeta}
      />
    </div>
  );
};

export default Carrito;