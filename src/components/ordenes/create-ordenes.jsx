import React, { useState, useEffect } from 'react';
import { useConfig } from '../../context/config';
import '../../css/Ordenes/create-ordenes.css';

// Importar ícono de ubicación
import locationIcon from '../../img/ubicacion.png';

const CreateOrdenes = ({ onClose, onOrdenCreated }) => {
  const { darkMode } = useConfig();
  
  // ========== ESTADO PARA PASOS ==========
  const [step, setStep] = useState(1); // 1: Pedido, 2: Pago
  
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    telefono_usuario: '',
    tipo_pedido: 'especial',
    especial_id: '',
    ingredientes_personalizados: '',
    direccion_texto: '',
    direccion_id: null,
    metodo_pago: 'efectivo',
    precio: 0
  });
  
  // NUEVOS ESTADOS PARA PAGO CON TARJETA
  const [tarjetaForm, setTarjetaForm] = useState({
    nombre_titular: '',
    numero_tarjeta: '',
    fecha_vencimiento: '',
    cvv: '',
    tipo_tarjeta: 'visa'
  });
  const [aceptoTerminos, setAceptoTerminos] = useState(false);
  const [showPoliticaSeguridad, setShowPoliticaSeguridad] = useState(false);
  
  const [especiales, setEspeciales] = useState([]);
  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState([]);
  const [ingredientesDisponibles, setIngredientesDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingIngredientes, setLoadingIngredientes] = useState(true);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [precioCalculado, setPrecioCalculado] = useState(0);
  
  // Estados para el autocompletado
  const [clientes, setClientes] = useState([]);
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [cargandoClientes, setCargandoClientes] = useState(false);
  
  // Estados para modal de dirección
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');

  // ========== FUNCIÓN PARA CARGAR INGREDIENTES ==========
  const fetchIngredientesDisponibles = async () => {
    try {
      setLoadingIngredientes(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://127.0.0.1:5000/ingredientes/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const ingredientesActivos = data
          .filter(ing => ing.activo)
          .map(ing => ing.nombre)
          .sort();
        
        setIngredientesDisponibles(ingredientesActivos);
        console.log('✅ Ingredientes cargados:', ingredientesActivos.length);
      } else {
        console.error('Error al obtener ingredientes:', response.status);
        setIngredientesDisponibles([
          'Limon',
          'Chile en Polvo',
          'Sal',
          'Gomita Picante',
          'Gomita Dulce',
          'Gomitas Aciditas',
          'Chamoy',
          'salsa',
          'cacahuate',
          'Miguelito',
        ]);
      }
    } catch (error) {
      console.error('Error de conexión al obtener ingredientes:', error);
      setIngredientesDisponibles([
        'Limon',
        'Chile en Polvo',
        'Sal',
        'Gomita Picante',
        'Gomita Dulce',
        'Gomitas Aciditas',
        'Chamoy',
        'salsa',
        'cacahuate',
        'Miguelito',
      ]);
    } finally {
      setLoadingIngredientes(false);
    }
  };

  // ========== EFECTOS INICIALES ==========
  useEffect(() => {
    fetchEspecialesActivos();
    fetchClientes();
    fetchIngredientesDisponibles();
  }, []);

  useEffect(() => {
    calcularPrecio();
  }, [formData.tipo_pedido, formData.especial_id, ingredientesSeleccionados]);

  // ========== FUNCIÓN PARA CARGAR ESPECIALES ==========
  const fetchEspecialesActivos = async () => {
    try {
      console.log('🔍 Cargando especiales activos...');
      const response = await fetch('http://127.0.0.1:5000/ordenes/especiales-activos');
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Especiales cargados:', data);
        console.log('   Total:', data.length);
        data.forEach((esp, i) => {
          console.log(`   ${i+1}. ID: ${esp.id} - ${esp.nombre} - $${esp.precio} - Ingredientes: ${esp.ingredientes}`);
        });
        setEspeciales(data);
      } else {
        console.error('Error al obtener especiales activos:', response.status);
      }
    } catch (error) {
      console.error('Error al obtener especiales activos:', error);
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
            direccion_id: user.direccion_id || null
          }));
        
        setClientes(clientesData);
        console.log('✅ Clientes cargados:', clientesData.length);
      } else {
        console.error('Error al obtener clientes:', response.status);
      }
    } catch (error) {
      console.error('Error al obtener clientes:', error);
    } finally {
      setCargandoClientes(false);
    }
  };

  // ========== FUNCIONES DE AUTOCOMPLETADO ==========
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
      (cliente.email && cliente.email.toLowerCase().includes(textoLower)) ||
      (cliente.direccion && cliente.direccion.toLowerCase().includes(textoLower))
    );

    setSugerencias(sugerenciasFiltradas.slice(0, 15));
    setMostrarSugerencias(sugerenciasFiltradas.length > 0);
  };

  const seleccionarCliente = (cliente) => {
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
  };

  const handleFocusNombre = () => {
    setSugerencias(clientes.slice(0, 20));
    setMostrarSugerencias(clientes.length > 0);
  };

  const handleBlurNombre = () => {
    setTimeout(() => {
      setMostrarSugerencias(false);
    }, 200);
  };

  // ========== FUNCIÓN PARA MANEJAR CAMBIO DE NOMBRE ==========
  const handleNombreChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      nombre_usuario: value,
      telefono_usuario: '',
      direccion_texto: '',
      direccion_id: null
    }));
    
    buscarSugerencias(value);
    
    if (errors.nombre_usuario) {
      setErrors(prev => ({ ...prev, nombre_usuario: '' }));
    }
    if (errors.telefono_usuario) {
      setErrors(prev => ({ ...prev, telefono_usuario: '' }));
    }
    if (errors.direccion_texto) {
      setErrors(prev => ({ ...prev, direccion_texto: '' }));
    }
    
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  // ========== FUNCIÓN calcularPrecio (soporta MongoDB) ==========
  const calcularPrecio = () => {
    console.log('💰 Calculando precio...');
    console.log('   Tipo pedido:', formData.tipo_pedido);
    console.log('   Especial ID:', formData.especial_id);
    
    if (formData.tipo_pedido === 'especial') {
      if (formData.especial_id) {
        const especial = especiales.find(esp => 
          esp.id.toString() === formData.especial_id.toString()
        );
        
        if (especial) {
          console.log('   ✅ Especial encontrado:', especial.nombre, especial.precio);
          setPrecioCalculado(especial.precio);
        } else {
          console.log('   ⚠️ No se encontró especial con ID:', formData.especial_id);
          console.log('   IDs disponibles:', especiales.map(e => e.id.toString()));
          setPrecioCalculado(0);
        }
      } else {
        setPrecioCalculado(0);
      }
    } else {
      const numIngredientes = ingredientesSeleccionados.length;
      if (numIngredientes <= 3) {
        setPrecioCalculado(30);
      } else if (numIngredientes <= 5) {
        setPrecioCalculado(35);
      } else {
        setPrecioCalculado(40);
      }
    }
  };

  // ========== FUNCIÓN handleChange (soporta MongoDB) ==========
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'especial_id') {
      console.log(`🔍 Seleccionado especial ID: ${value}`);
      
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      if (value) {
        const especialSeleccionado = especiales.find(esp => 
          esp.id.toString() === value.toString()
        );
        
        if (especialSeleccionado) {
          console.log('📦 Especial seleccionado:', especialSeleccionado);
          setPrecioCalculado(especialSeleccionado.precio);
        } else {
          console.log('⚠️ No se encontró el especial con ID:', value);
          console.log('IDs disponibles:', especiales.map(e => e.id.toString()));
        }
      } else {
        setPrecioCalculado(0);
      }
      
      return;
    }
    
    if (name === 'telefono_usuario') {
      const soloNumeros = value.replace(/\D/g, '');
      const telefonoLimpio = soloNumeros.slice(0, 10);
      
      setFormData(prev => ({
        ...prev,
        [name]: telefonoLimpio
      }));
      
      if (errors.telefono_usuario) {
        setErrors(prev => ({
          ...prev,
          telefono_usuario: ''
        }));
      }
      return;
    }
    
    if (name === 'direccion_texto') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        direccion_id: null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  // ========== FUNCIÓN PARA CAMBIO DE TIPO DE PEDIDO ==========
  const handleTipoPedidoChange = (e) => {
    const tipo = e.target.value;
    console.log(`Cambiando tipo de pedido a: ${tipo}`);
    
    setFormData(prev => ({
      ...prev,
      tipo_pedido: tipo,
      especial_id: tipo === 'especial' ? prev.especial_id : '',
      ingredientes_personalizados: tipo === 'personalizado' ? prev.ingredientes_personalizados : ''
    }));
    
    if (tipo === 'especial') {
      setIngredientesSeleccionados([]);
    }
  };

  // ========== FUNCIÓN PARA SELECCIONAR INGREDIENTES ==========
  const handleIngredienteToggle = (ingrediente) => {
    setIngredientesSeleccionados(prev => {
      const nuevosIngredientes = prev.includes(ingrediente)
        ? prev.filter(ing => ing !== ingrediente)
        : [...prev, ingrediente];
      
      setFormData(prevData => ({
        ...prevData,
        ingredientes_personalizados: nuevosIngredientes.join(', ')
      }));
      
      return nuevosIngredientes;
    });
  };

  // ========== FUNCIONES DE VALIDACIÓN DE TARJETA ==========
  const validateTarjeta = () => {
    const tarjetaErrors = {};
    
    const numeroLimpio = tarjetaForm.numero_tarjeta.replace(/\s/g, '');
    if (numeroLimpio.length !== 16) {
      tarjetaErrors.numero_tarjeta = 'El número de tarjeta debe tener 16 dígitos';
    } else if (!/^\d+$/.test(numeroLimpio)) {
      tarjetaErrors.numero_tarjeta = 'El número de tarjeta solo debe contener dígitos';
    }
    
    if (!tarjetaForm.nombre_titular.trim()) {
      tarjetaErrors.nombre_titular = 'El nombre del titular es requerido';
    } else if (tarjetaForm.nombre_titular.trim().length < 3) {
      tarjetaErrors.nombre_titular = 'El nombre debe tener al menos 3 caracteres';
    }
    
    const fechaRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
    if (!fechaRegex.test(tarjetaForm.fecha_vencimiento)) {
      tarjetaErrors.fecha_vencimiento = 'Formato inválido (MM/YY)';
    } else {
      const [mes, año] = tarjetaForm.fecha_vencimiento.split('/');
      const ahora = new Date();
      const añoActual = ahora.getFullYear() % 100;
      const mesActual = ahora.getMonth() + 1;
      
      const añoNum = parseInt(año, 10);
      const mesNum = parseInt(mes, 10);
      
      if (añoNum < añoActual || (añoNum === añoActual && mesNum < mesActual)) {
        tarjetaErrors.fecha_vencimiento = 'La tarjeta está vencida';
      }
    }
    
    const cvvLength = tarjetaForm.tipo_tarjeta === 'amex' ? 4 : 3;
    if (!tarjetaForm.cvv) {
      tarjetaErrors.cvv = 'El CVV es requerido';
    } else if (tarjetaForm.cvv.length !== cvvLength) {
      tarjetaErrors.cvv = tarjetaForm.tipo_tarjeta === 'amex' 
        ? 'El CVV de Amex tiene 4 dígitos' 
        : 'El CVV tiene 3 dígitos';
    } else if (!/^\d+$/.test(tarjetaForm.cvv)) {
      tarjetaErrors.cvv = 'El CVV solo debe contener dígitos';
    }
    
    if (!aceptoTerminos) {
      tarjetaErrors.terminos = 'Debes aceptar los términos y condiciones';
    }
    
    return tarjetaErrors;
  };

  // ========== FUNCIÓN PARA MANEJAR CAMBIOS EN TARJETA ==========
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
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // ========== FUNCIONES DE VALIDACIÓN DE PASOS ==========
  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.nombre_usuario.trim()) {
      newErrors.nombre_usuario = 'El nombre del cliente es obligatorio';
    } else if (formData.nombre_usuario.trim().length < 2) {
      newErrors.nombre_usuario = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.telefono_usuario.trim()) {
      newErrors.telefono_usuario = 'El teléfono es obligatorio';
    } else {
      const telefonoLimpio = formData.telefono_usuario.replace(/\D/g, '');
      if (!/^\d{10}$/.test(telefonoLimpio)) {
        newErrors.telefono_usuario = 'El teléfono debe tener exactamente 10 dígitos';
      }
    }

    if (!formData.direccion_texto.trim()) {
      newErrors.direccion_texto = 'La dirección de entrega es recomendada';
    } else if (formData.direccion_texto.trim().length < 10) {
      newErrors.direccion_texto = 'Por favor, proporciona una dirección más detallada';
    }

    if (formData.tipo_pedido === 'especial' && !formData.especial_id) {
      newErrors.especial_id = 'Debe seleccionar un especial';
    }

    if (formData.tipo_pedido === 'personalizado' && ingredientesSeleccionados.length === 0) {
      newErrors.ingredientes_personalizados = 'Debe seleccionar al menos un ingrediente';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    if (formData.metodo_pago === 'tarjeta') {
      const tarjetaErrors = validateTarjeta();
      if (Object.keys(tarjetaErrors).length > 0) {
        setErrors(tarjetaErrors);
        return false;
      }
    }
    return true;
  };

  // ========== FUNCIONES DE NAVEGACIÓN ==========
  const handleNextStep = () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
        setErrors({});
        window.scrollTo(0, 0);
      }
    }
  };

  const handlePrevStep = () => {
    setStep(1);
    setErrors({});
    window.scrollTo(0, 0);
  };

  // ========== FUNCIÓN PARA ENVIAR ORDEN ==========
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      return;
    }

    setLoading(true);
    try {
      const telefonoLimpio = formData.telefono_usuario.replace(/\D/g, '');
      
      let especialIdParaEnviar = formData.especial_id;
      if (especialIdParaEnviar && !isNaN(especialIdParaEnviar)) {
        especialIdParaEnviar = parseInt(especialIdParaEnviar);
      }
      
      const especialSeleccionado = especiales.find(esp => 
        esp.id.toString() === formData.especial_id.toString()
      );
      
      const pedidoJson = {
        tipo: formData.tipo_pedido,
        especial: formData.tipo_pedido === 'especial' && especialSeleccionado ? 
          especialSeleccionado.nombre : null,
        ingredientes: formData.tipo_pedido === 'personalizado' ? 
          ingredientesSeleccionados : [],
        cantidad: 1,
        metodo_pago: formData.metodo_pago
      };

      const ordenData = {
        nombre_usuario: formData.nombre_usuario.trim(),
        telefono_usuario: telefonoLimpio,
        tipo_pedido: formData.tipo_pedido,
        especial_id: formData.tipo_pedido === 'especial' ? especialIdParaEnviar : null,
        ingredientes_personalizados: formData.tipo_pedido === 'personalizado' ? formData.ingredientes_personalizados : null,
        direccion_texto: formData.direccion_texto.trim(),
        direccion_id: formData.direccion_id,
        pedido_json: JSON.stringify(pedidoJson),
        precio: precioCalculado,
        metodo_pago: formData.metodo_pago
      };

      if (formData.metodo_pago === 'tarjeta') {
        const numeroLimpio = tarjetaForm.numero_tarjeta.replace(/\s/g, '');
        ordenData.info_pago = {
          tipo: tarjetaForm.tipo_tarjeta,
          ultimos_4_digitos: numeroLimpio.slice(-4),
          titular: tarjetaForm.nombre_titular
        };
      }

      console.log('Enviando datos de la orden:', ordenData);

      const response = await fetch('http://127.0.0.1:5000/ordenes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ordenData)
      });

      console.log('Respuesta status:', response.status);
      
      const responseText = await response.text();
      console.log('Respuesta texto:', responseText);

      if (response.ok) {
        try {
          const result = JSON.parse(responseText);
          setSuccessMessage(`Orden creada exitosamente. Código: ${result.orden.codigo_unico}`);
          
          setFormData({
            nombre_usuario: '',
            telefono_usuario: '',
            tipo_pedido: 'especial',
            especial_id: '',
            ingredientes_personalizados: '',
            direccion_texto: '',
            direccion_id: null,
            metodo_pago: 'efectivo'
          });
          setIngredientesSeleccionados([]);
          setTarjetaForm({
            nombre_titular: '',
            numero_tarjeta: '',
            fecha_vencimiento: '',
            cvv: '',
            tipo_tarjeta: 'visa'
          });
          setAceptoTerminos(false);
          setSugerencias([]);
          setMostrarSugerencias(false);
          
          setTimeout(() => {
            if (onOrdenCreated) {
              onOrdenCreated(result.orden);
            }
            onClose();
          }, 3000);
          
        } catch (parseError) {
          console.error('Error parseando JSON:', parseError);
          alert('Orden creada, pero hubo un error procesando la respuesta');
          onClose();
          if (onOrdenCreated) {
            onOrdenCreated();
          }
        }
      } else {
        let errorMsg = `Error ${response.status}: ${response.statusText}`;
        try {
          if (responseText.trim()) {
            const errorData = JSON.parse(responseText);
            errorMsg = errorData.msg || errorMsg;
          }
        } catch (e) {
          errorMsg = responseText || errorMsg;
        }
        alert(`Error al crear orden: ${errorMsg}`);
      }

    } catch (error) {
      console.error('Error de conexión:', error);
      alert('Error de conexión al crear orden: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  // ========== FUNCIONES PARA MODAL DE DIRECCIÓN ==========
  const handleShowAddressModal = () => {
    if (formData.direccion_texto && formData.direccion_texto.trim() !== '') {
      setSelectedAddress(formData.direccion_texto);
      setShowAddressModal(true);
    }
  };

  const handleCloseAddressModal = () => {
    setShowAddressModal(false);
    setSelectedAddress('');
  };

  const handleCopyAddress = () => {
    if (selectedAddress && selectedAddress.trim() !== '') {
      navigator.clipboard.writeText(selectedAddress)
        .then(() => {
          alert('Dirección copiada al portapapeles');
        })
        .catch(err => {
          console.error('Error al copiar:', err);
        });
    }
  };

  const handleOpenInMaps = () => {
    if (selectedAddress && selectedAddress.trim() !== '') {
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedAddress)}`;
      window.open(mapsUrl, '_blank');
    }
  };

  // ========== RENDERIZADO ==========
  return (
    <>
      <div className={`create-orden-form ${darkMode ? 'create-orden-form-dark-mode' : ''}`}>
        <div className="create-orden-form-scroll-container">
          <form className="create-orden-form-form" onSubmit={handleSubmit}>
            
            {/* ========== INDICADOR DE PASOS ========== */}
            <div className="create-orden-pasos">
              <div className={`create-orden-paso-indicador ${step >= 1 ? 'active' : ''}`}>
                <div className="create-orden-paso-numero">1</div>
                <div className="create-orden-paso-label">Pedido</div>
              </div>
              <div className="create-orden-paso-linea"></div>
              <div className={`create-orden-paso-indicador ${step >= 2 ? 'active' : ''}`}>
                <div className="create-orden-paso-numero">2</div>
                <div className="create-orden-paso-label">Pago</div>
              </div>
            </div>

            {successMessage && (
              <div className="create-orden-success-message">
                {successMessage}
              </div>
            )}

            {/* ========== PASO 1: PEDIDO ========== */}
            {step === 1 && (
              <>
                {/* Información del cliente */}
                <div className="create-orden-section">
                  <h4>Información del Cliente</h4>
                  <div className="create-orden-row">
                    <div className="create-orden-group create-orden-group-full-width">
                      <label htmlFor="create-orden-nombre-usuario">Nombre del cliente *</label>
                      <div className="create-orden-autocomplete-container">
                        <input
                          type="text"
                          id="create-orden-nombre-usuario"
                          name="nombre_usuario"
                          value={formData.nombre_usuario}
                          onChange={handleNombreChange}
                          onFocus={handleFocusNombre}
                          onBlur={handleBlurNombre}
                          className={`create-orden-input ${errors.nombre_usuario ? 'create-orden-input-error' : ''}`}
                          placeholder="Escribe para buscar o haz clic para ver todos los clientes"
                          maxLength="100"
                          autoComplete="off"
                        />
                        {cargandoClientes && (
                          <div className="create-orden-autocomplete-loading">Cargando clientes...</div>
                        )}
                        
                        {mostrarSugerencias && sugerencias.length > 0 && (
                          <div className="create-orden-autocomplete-suggestions">
                            <div className="create-orden-suggestions-header">
                              {formData.nombre_usuario.trim() === '' 
                                ? `Todos los clientes (${sugerencias.length})`
                                : `Coincidencias encontradas (${sugerencias.length})`
                              }
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
                                  {cliente.telefono && <span>{cliente.telefono.replace('+52', '')}</span>}
                                  {cliente.email && <span>{cliente.email}</span>}
                                  {cliente.direccion && <span>{cliente.direccion.substring(0, 30)}...</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {mostrarSugerencias && sugerencias.length === 0 && formData.nombre_usuario.length >= 2 && (
                          <div className="create-orden-autocomplete-suggestions">
                            <div className="create-orden-suggestion-item create-orden-no-results">
                              No se encontraron clientes que coincidan con "{formData.nombre_usuario}"
                            </div>
                          </div>
                        )}
                      </div>
                      {errors.nombre_usuario && <span className="create-orden-error-message">{errors.nombre_usuario}</span>}
                    </div>
                  </div>

                  <div className="create-orden-row">
                    <div className="create-orden-group create-orden-group-half">
                      <label htmlFor="create-orden-telefono-usuario">Teléfono *</label>
                      <div className="create-orden-telefono-input-container">
                        <input
                          type="tel"
                          id="create-orden-telefono-usuario"
                          name="telefono_usuario"
                          value={formData.telefono_usuario}
                          onChange={handleChange}
                          className={`create-orden-input ${errors.telefono_usuario ? 'create-orden-input-error' : ''}`}
                          placeholder="10 dígitos"
                          maxLength="10"
                        />
                      </div>
                      {errors.telefono_usuario && <span className="create-orden-error-message">{errors.telefono_usuario}</span>}
                    </div>
                  </div>

                  {/* Campo de dirección */}
                  <div className="create-orden-row">
                    <div className="create-orden-group create-orden-group-full-width">
                      <div className="create-orden-direccion-header">
                        <label htmlFor="create-orden-direccion-texto">Dirección de entrega *</label>
                        {formData.direccion_texto && formData.direccion_texto.trim() !== '' && (
                          <button 
                            type="button"
                            className="create-orden-ver-direccion-btn"
                            onClick={handleShowAddressModal}
                            title="Ver dirección completa"
                          >
                            <img src={locationIcon} alt="Ver dirección" className="create-orden-address-icon-small" />
                          </button>
                        )}
                      </div>
                      <textarea
                        id="create-orden-direccion-texto"
                        name="direccion_texto"
                        value={formData.direccion_texto}
                        onChange={handleChange}
                        className={`create-orden-textarea ${errors.direccion_texto ? 'create-orden-input-error' : ''}`}
                        placeholder="Ej: Calle Principal #123, Colonia Centro, Ciudad, Estado"
                        rows="3"
                        maxLength="255"
                      />
                      {errors.direccion_texto && <span className="create-orden-error-message">{errors.direccion_texto}</span>}
                      <div className="create-orden-direccion-hint">
                        <small>Proporciona una dirección detallada para facilitar la entrega</small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ========== SELECT ÚNICO PARA TIPO DE PEDIDO ========== */}
                <div className="create-orden-section">
                  <h4>Tipo de Pedido</h4>
                  <div className="create-orden-row">
                    <div className="create-orden-group create-orden-group-full-width">
                      <select
                        name="tipo_pedido"
                        value={formData.tipo_pedido}
                        onChange={handleTipoPedidoChange}
                        className="create-orden-select"
                      >
                        <option value="especial">Pedir un Especial (Combo)</option>
                        <option value="personalizado">Armar mi propio pedido</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* ========== CONTENIDO CONDICIONAL SEGÚN TIPO DE PEDIDO ========== */}
                
                {/* Si seleccionó ESPECIAL */}
                {formData.tipo_pedido === 'especial' && (
                  <div className="create-orden-section">
                    <h4>Seleccionar Especial</h4>
                    <div className="create-orden-row">
                      <div className="create-orden-group create-orden-group-full-width">
                        <select
                          name="especial_id"
                          value={formData.especial_id}
                          onChange={handleChange}
                          className={`create-orden-select ${errors.especial_id ? 'create-orden-select-error' : ''}`}
                        >
                          <option value="">Selecciona un especial</option>
                          {especiales.map(especial => (
                            <option key={especial.id} value={especial.id.toString()}>
                              {especial.nombre} - ${typeof especial.precio === 'number' ? especial.precio.toFixed(2) : especial.precio}
                            </option>
                          ))}
                        </select>
                        {errors.especial_id && <span className="create-orden-error-message">{errors.especial_id}</span>}
                      </div>
                    </div>

                    {formData.especial_id && (
                      <div className="create-orden-especial-info">
                        <div className="create-orden-especial-details">
                          <strong>Especial seleccionado:</strong>
                          <span>
                            {(() => {
                              const esp = especiales.find(e => e.id.toString() === formData.especial_id.toString());
                              return esp ? esp.nombre : 'Cargando...';
                            })()}
                          </span>
                        </div>
                        <div className="create-orden-especial-details">
                          <strong>Ingredientes:</strong>
                          <span>
                            {(() => {
                              const esp = especiales.find(e => e.id.toString() === formData.especial_id.toString());
                              return esp ? esp.ingredientes : 'Cargando...';
                            })()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Si seleccionó PERSONALIZADO */}
                {formData.tipo_pedido === 'personalizado' && (
                  <div className="create-orden-section">
                    <h4>Seleccionar Ingredientes</h4>
                    <div className="create-orden-row">
                      <div className="create-orden-group create-orden-group-full-width">
                        <label>
                          Selecciona los ingredientes *
                          {loadingIngredientes && (
                            <span className="create-orden-loading-ingredientes-text"> (Cargando ingredientes...)</span>
                          )}
                        </label>
                        {loadingIngredientes ? (
                          <div className="create-orden-loading-ingredientes">
                            <div className="create-orden-spinner-small"></div>
                            <span>Cargando lista de ingredientes...</span>
                          </div>
                        ) : (
                          <>
                            <div className="create-orden-ingredientes-grid-container">
                              <div className="create-orden-ingredientes-grid">
                                {ingredientesDisponibles.map((ingrediente, index) => (
                                  <label key={index} className="create-orden-ingrediente-checkbox">
                                    <input
                                      type="checkbox"
                                      checked={ingredientesSeleccionados.includes(ingrediente)}
                                      onChange={() => handleIngredienteToggle(ingrediente)}
                                    />
                                    <span className="create-orden-checkbox-custom"></span>
                                    {ingrediente}
                                  </label>
                                ))}
                              </div>
                            </div>
                            {errors.ingredientes_personalizados && (
                              <span className="create-orden-error-message">{errors.ingredientes_personalizados}</span>
                            )}
                            <div className="create-orden-ingredientes-count">
                              {ingredientesSeleccionados.length} ingrediente(s) seleccionado(s)
                            </div>
                          </>
                        )}

                        {ingredientesSeleccionados.length > 0 && (
                          <div className="create-orden-ingredientes-preview">
                            <strong>Ingredientes seleccionados:</strong>
                            <div className="create-orden-ingredientes-list">
                              {ingredientesSeleccionados.join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ========== RESUMEN DEL PEDIDO CON INGREDIENTES ========== */}
                <div className="create-orden-price-summary">
                  {formData.tipo_pedido === 'especial' && formData.especial_id && (
                    <div className="create-orden-price-item">
                      <span>Especial seleccionado:</span>
                      <span>
                        {(() => {
                          const esp = especiales.find(e => e.id.toString() === formData.especial_id.toString());
                          return esp ? esp.nombre : 'Cargando...';
                        })()}
                      </span>
                    </div>
                  )}
                  
                  {formData.tipo_pedido === 'personalizado' && (
                    <>
                      <div className="create-orden-price-item">
                        <span>Ingredientes seleccionados:</span>
                        <span>{ingredientesSeleccionados.length}</span>
                      </div>
                      {ingredientesSeleccionados.length > 0 && (
                        <div className="create-orden-price-item create-orden-price-ingredientes-lista">
                          <span>Lista:</span>
                          <span className="create-orden-ingredientes-lista-texto">
                            {ingredientesSeleccionados.join(', ')}
                          </span>
                        </div>
                      )}
                      <div className="create-orden-price-item">
                        <span>Precio por {ingredientesSeleccionados.length} ingrediente(s):</span>
                        <span>
                          {ingredientesSeleccionados.length <= 3 ? '$30' : 
                           ingredientesSeleccionados.length <= 5 ? '$35' : '$40'}
                        </span>
                      </div>
                    </>
                  )}
                  
                  <div className="create-orden-price-total">
                    <strong>Total a pagar:</strong>
                    <span className="create-orden-total-price">
                      ${typeof precioCalculado === 'number' ? precioCalculado.toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* ========== PASO 2: MÉTODO DE PAGO ========== */}
            {step === 2 && (
              <div className="create-orden-paso-pago">
                <h3 className="create-orden-paso-titulo">Método de Pago</h3>
                
                <div className="create-orden-metodos-grid">
                  {/* Opción Efectivo */}
                  <div 
                    className={`create-orden-metodo-card ${formData.metodo_pago === 'efectivo' ? 'seleccionado' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, metodo_pago: 'efectivo' }))}
                  >
                    <div className="create-orden-metodo-icono">💵</div>
                    <div className="create-orden-metodo-contenido">
                      <div className="create-orden-metodo-titulo">Efectivo</div>
                      <div className="create-orden-metodo-descripcion">Paga al recibir tu pedido</div>
                      <div className="create-orden-metodo-detalle">Entrega el dinero al repartidor</div>
                    </div>
                    <div className="create-orden-metodo-radio"></div>
                  </div>

                  {/* Opción Tarjeta */}
                  <div 
                    className={`create-orden-metodo-card ${formData.metodo_pago === 'tarjeta' ? 'seleccionado' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, metodo_pago: 'tarjeta' }))}
                  >
                    <div className="create-orden-metodo-icono">💳</div>
                    <div className="create-orden-metodo-contenido">
                      <div className="create-orden-metodo-titulo">Tarjeta</div>
                      <div className="create-orden-metodo-descripcion">Pago seguro en línea</div>
                      <div className="create-orden-metodo-detalle">Visa, Mastercard, Amex</div>
                    </div>
                    <div className="create-orden-metodo-radio"></div>
                  </div>
                </div>

                {/* Formulario de tarjeta (solo si se selecciona tarjeta) */}
                {formData.metodo_pago === 'tarjeta' && (
                  <div className="create-orden-tarjeta-formulario">
                    <h4 className="create-orden-tarjeta-titulo">Información de pago</h4>
                    
                    <div className="create-orden-tarjeta-grid">
                      <div className="create-orden-group create-orden-group-full-width">
                        <label className="create-orden-label">Nombre del titular</label>
                        <input
                          type="text"
                          name="nombre_titular"
                          value={tarjetaForm.nombre_titular}
                          onChange={handleTarjetaChange}
                          placeholder="Como aparece en la tarjeta"
                          className={`create-orden-input ${errors.nombre_titular ? 'create-orden-input-error' : ''}`}
                        />
                        {errors.nombre_titular && <span className="create-orden-error-message">{errors.nombre_titular}</span>}
                      </div>

                      <div className="create-orden-group create-orden-group-full-width">
                        <label className="create-orden-label">Número de tarjeta</label>
                        <div className="create-orden-tarjeta-input-wrapper">
                          <input
                            type="text"
                            name="numero_tarjeta"
                            value={tarjetaForm.numero_tarjeta}
                            onChange={handleTarjetaChange}
                            placeholder="1234 5678 9012 3456"
                            className={`create-orden-input create-orden-tarjeta-input ${errors.numero_tarjeta ? 'create-orden-input-error' : ''}`}
                            maxLength="19"
                          />
                          <div className="create-orden-tarjeta-iconos">
                            {tarjetaForm.tipo_tarjeta === 'visa' && <span className="create-orden-tarjeta-badge">Visa</span>}
                            {tarjetaForm.tipo_tarjeta === 'mastercard' && <span className="create-orden-tarjeta-badge">Mastercard</span>}
                            {tarjetaForm.tipo_tarjeta === 'amex' && <span className="create-orden-tarjeta-badge">Amex</span>}
                          </div>
                        </div>
                        {errors.numero_tarjeta && <span className="create-orden-error-message">{errors.numero_tarjeta}</span>}
                      </div>

                      <div className="create-orden-group">
                        <label className="create-orden-label">Fecha vencimiento</label>
                        <input
                          type="text"
                          name="fecha_vencimiento"
                          value={tarjetaForm.fecha_vencimiento}
                          onChange={handleTarjetaChange}
                          placeholder="MM/YY"
                          className={`create-orden-input ${errors.fecha_vencimiento ? 'create-orden-input-error' : ''}`}
                          maxLength="5"
                        />
                        {errors.fecha_vencimiento && <span className="create-orden-error-message">{errors.fecha_vencimiento}</span>}
                      </div>

                      <div className="create-orden-group">
                        <label className="create-orden-label">CVV</label>
                        <div className="create-orden-cvv-wrapper">
                          <input
                            type="password"
                            name="cvv"
                            value={tarjetaForm.cvv}
                            onChange={handleTarjetaChange}
                            placeholder={tarjetaForm.tipo_tarjeta === 'amex' ? '1234' : '123'}
                            className={`create-orden-input create-orden-cvv-input ${errors.cvv ? 'create-orden-input-error' : ''}`}
                            maxLength={tarjetaForm.tipo_tarjeta === 'amex' ? 4 : 3}
                          />
                          <button 
                            type="button" 
                            className="create-orden-cvv-ayuda"
                            title="Código de seguridad de 3 o 4 dígitos"
                          >
                            ?
                          </button>
                        </div>
                        {errors.cvv && <span className="create-orden-error-message">{errors.cvv}</span>}
                      </div>
                    </div>

                    {/* Términos y condiciones */}
                    <div className="create-orden-terminos">
                      <label className="create-orden-terminos-checkbox">
                        <input
                          type="checkbox"
                          checked={aceptoTerminos}
                          onChange={(e) => setAceptoTerminos(e.target.checked)}
                        />
                        <span className="create-orden-terminos-custom"></span>
                        <span className="create-orden-terminos-texto">
                          Acepto los <button 
                            type="button"
                            className="create-orden-terminos-link"
                            onClick={() => setShowPoliticaSeguridad(!showPoliticaSeguridad)}
                          >
                            términos y condiciones
                          </button>
                        </span>
                      </label>
                      {errors.terminos && <span className="create-orden-error-message">{errors.terminos}</span>}
                    </div>

                    {/* Popup de política de seguridad */}
                    {showPoliticaSeguridad && (
                      <div className="create-orden-politica-popup">
                        <div className="create-orden-politica-header">
                          <h5 className="create-orden-politica-titulo">Seguridad de Pagos</h5>
                          <button 
                            className="create-orden-politica-cerrar"
                            onClick={() => setShowPoliticaSeguridad(false)}
                          >
                            ×
                          </button>
                        </div>
                        <div className="create-orden-politica-contenido">
                          <p>Tus datos están protegidos con encriptación SSL de 256 bits. No almacenamos información sensible de tu tarjeta.</p>
                          <ul>
                            <li>Encriptación de grado bancario</li>
                            <li>Cumplimiento PCI DSS</li>
                            <li>Monitoreo anti-fraude</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Info de seguridad */}
                    <div className="create-orden-seguridad-info">
                      <span className="create-orden-seguridad-icono"></span>
                      <div className="create-orden-seguridad-texto">
                        <strong>Pago 100% seguro</strong>
                        <p>Tus datos están protegidos con encriptación SSL</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Resumen del pedido en paso 2 */}
                <div className="create-orden-price-summary" style={{ marginTop: '2rem' }}>
                  {formData.tipo_pedido === 'especial' && formData.especial_id && (
                    <div className="create-orden-price-item">
                      <span>Especial:</span>
                      <span>
                        {(() => {
                          const esp = especiales.find(e => e.id.toString() === formData.especial_id.toString());
                          return esp ? esp.nombre : '';
                        })()}
                      </span>
                    </div>
                  )}
                  
                  {formData.tipo_pedido === 'personalizado' && (
                    <div className="create-orden-price-item">
                      <span>Ingredientes:</span>
                      <span>{ingredientesSeleccionados.length}</span>
                    </div>
                  )}
                  
                  <div className="create-orden-price-total">
                    <strong>Total a pagar:</strong>
                    <span className="create-orden-total-price">
                      ${typeof precioCalculado === 'number' ? precioCalculado.toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* ========== BOTONES DE NAVEGACIÓN ========== */}
        <div className="create-orden-form-actions">
          {step === 1 ? (
            <>
              <button 
                type="button" 
                className="create-orden-btn-cancel"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className="create-orden-btn-submit"
                onClick={handleNextStep}
                disabled={loading}
              >
                Continuar con Pago →
              </button>
            </>
          ) : (
            <>
              <button 
                type="button" 
                className="create-orden-btn-cancel"
                onClick={handlePrevStep}
                disabled={loading}
              >
                ← Atrás
              </button>
              <button 
                type="submit" 
                className="create-orden-btn-submit"
                onClick={handleSubmit}
                disabled={loading || successMessage}
              >
                {loading ? 'Procesando...' : 'Confirmar y Pagar'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Modal para ver dirección completa */}
      {showAddressModal && (
        <div className="create-orden-modal-overlay">
          <div className="create-orden-modal-content create-orden-address-modal">
            <div className="create-orden-modal-header">
              <h3 className="create-orden-modal-title">Dirección de Entrega</h3>
              <button className="create-orden-close-modal" onClick={handleCloseAddressModal}>✕</button>
            </div>
            <div className="create-orden-modal-body">
              <div className="create-orden-address-content">
                <p className="create-orden-address-title">Dirección registrada:</p>
                <div className="create-orden-address-display">
                  {selectedAddress}
                </div>
                {selectedAddress && selectedAddress.trim() !== '' && (
                  <div className="create-orden-address-actions">
                    <button 
                      className="create-orden-btn create-orden-btn-secondary"
                      onClick={handleCopyAddress}
                    >
                      Copiar Dirección
                    </button>
                    <button 
                      className="create-orden-btn create-orden-btn-primary"
                      onClick={handleOpenInMaps}
                    >
                      <img src={locationIcon} alt="Mapa" className="create-orden-btn-icon-img" style={{marginRight: '8px'}} />
                      Abrir en Google Maps
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="create-orden-modal-footer">
              <button 
                className="create-orden-btn create-orden-btn-close"
                onClick={handleCloseAddressModal}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateOrdenes;