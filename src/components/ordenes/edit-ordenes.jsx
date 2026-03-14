import React, { useState, useEffect } from 'react';
import { useConfig } from '../../context/config';
import '../../css/Ordenes/edit-ordenes.css';

// Importar íconos
import locationIcon from '../../img/ubicacion.png';

const EditOrdenForm = ({ orden, onClose, onOrdenUpdated }) => {
  const { darkMode } = useConfig();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showDireccionForm, setShowDireccionForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    tipo_pedido: 'especial',
    especial_id: '',
    ingredientes_personalizados: '',
    estado: 'pendiente'
  });
  
  // Lista de direcciones
  const [direcciones, setDirecciones] = useState([]);
  
  // Datos de la dirección actual (para el formulario)
  const [direccionActual, setDireccionActual] = useState({
    id: null,
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

  const [especiales, setEspeciales] = useState([]);
  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState([]);
  const [ingredientesDisponibles, setIngredientesDisponibles] = useState([]);
  const [loadingIngredientes, setLoadingIngredientes] = useState(false);
  const [errors, setErrors] = useState({});
  const [precioCalculado, setPrecioCalculado] = useState(0);
  const [editingDireccionIndex, setEditingDireccionIndex] = useState(null);

  // Estados disponibles
  const estadosDisponibles = ['pendiente', 'preparando', 'listo', 'entregado', 'cancelado'];

  // Estado original de la orden para comparar cambios
  const [estadoOriginal, setEstadoOriginal] = useState('pendiente');

  // Cargar ingredientes desde el backend
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

  useEffect(() => {
    if (orden) {
      console.log('Orden recibida:', orden);
      
      // Obtener el especial_id del objeto especial si no viene directamente
      const especialId = orden.especial_id || (orden.especial ? orden.especial.id : '');

      setFormData({
        tipo_pedido: orden.tipo_pedido || 'especial',
        especial_id: especialId ? especialId.toString() : '',
        ingredientes_personalizados: orden.ingredientes_personalizados || '',
        estado: orden.estado || 'pendiente'
      });

      const ingredientesArray = orden.ingredientes_personalizados 
        ? orden.ingredientes_personalizados.split(',').map(ing => ing.trim()).filter(ing => ing)
        : [];

      // Guardar el estado original
      setEstadoOriginal(orden.estado || 'pendiente');

      setIngredientesSeleccionados(ingredientesArray);
      setPrecioCalculado(orden.precio || 0);

      // Cargar direcciones si existen
      if (orden.direccion_texto) {
        // Si hay una dirección simple, crear una dirección a partir de ella
        setDirecciones([{
          id: orden.direccion_id || null,
          calle: orden.direccion_texto.split(',')[0] || '',
          numero_exterior: '',
          numero_interior: '',
          colonia: orden.direccion_texto.split(',')[1] || '',
          ciudad: orden.direccion_texto.split(',')[2] || '',
          estado: orden.direccion_texto.split(',')[3] || '',
          codigo_postal: '',
          referencias: '',
          tipo: 'casa',
          predeterminada: true
        }]);
      }
    }
    
    fetchEspecialesActivos();
    fetchIngredientesDisponibles();
  }, [orden]);

  useEffect(() => {
    calcularPrecio();
  }, [formData.tipo_pedido, formData.especial_id, ingredientesSeleccionados]);

  // Función para verificar si hubo cambios en el pedido
  const huboCambiosEnPedido = () => {
    if (formData.tipo_pedido !== (orden?.tipo_pedido || 'especial')) {
      return true;
    }

    if (formData.tipo_pedido === 'especial') {
      const especialOriginal = orden?.especial_id || (orden?.especial ? orden.especial.id : '');
      if (formData.especial_id !== (especialOriginal ? especialOriginal.toString() : '')) {
        return true;
      }
    }

    if (formData.tipo_pedido === 'personalizado') {
      const ingredientesOriginales = orden?.ingredientes_personalizados 
        ? orden.ingredientes_personalizados.split(',').map(ing => ing.trim()).filter(ing => ing)
        : [];
      
      if (ingredientesSeleccionados.length !== ingredientesOriginales.length) {
        return true;
      }
      
      const ingredientesCambiados = ingredientesSeleccionados.some(ing => !ingredientesOriginales.includes(ing)) ||
                                   ingredientesOriginales.some(ing => !ingredientesSeleccionados.includes(ing));
      if (ingredientesCambiados) {
        return true;
      }
    }

    return false;
  };

  // Efecto para actualizar el estado automáticamente cuando hay cambios en el pedido
  useEffect(() => {
    if (huboCambiosEnPedido() && formData.estado !== 'pendiente') {
      console.log('Cambios detectados en el pedido, actualizando estado a "pendiente"');
      setFormData(prev => ({
        ...prev,
        estado: 'pendiente'
      }));
    }
  }, [formData.tipo_pedido, formData.especial_id, ingredientesSeleccionados]);

  const fetchEspecialesActivos = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/ordenes/especiales-activos');
      if (response.ok) {
        const data = await response.json();
        console.log('Especiales cargados:', data);
        
        if (orden && orden.especial) {
          const especialExistente = data.find(esp => esp.id === orden.especial.id);
          if (!especialExistente) {
            data.push(orden.especial);
          }
        }
        
        setEspeciales(data);
      }
    } catch (error) {
      console.error('Error al obtener especiales activos:', error);
    }
  };

  const calcularPrecio = () => {
    if (formData.tipo_pedido === 'especial') {
      if (!formData.especial_id && orden) {
        setPrecioCalculado(orden.precio || 0);
      } else {
        const especial = especiales.find(esp => esp.id === parseInt(formData.especial_id));
        setPrecioCalculado(especial ? especial.precio : 0);
      }
    } else {
      if (ingredientesSeleccionados.length === 0 && orden) {
        setPrecioCalculado(orden.precio || 0);
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
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    console.log(`Campo cambiado: ${name} = ${value}`);
    
    if (name === 'especial_id') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      return;
    }
    
    if (name === 'estado') {
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

  const handleTipoPedidoChange = (e) => {
    const tipo = e.target.value;
    console.log(`Cambiando tipo de pedido a: ${tipo}`);
    
    setFormData(prev => ({
      ...prev,
      tipo_pedido: tipo,
      especial_id: tipo === 'especial' ? prev.especial_id : '',
      ingredientes_personalizados: tipo === 'personalizado' ? prev.ingredientes_personalizados : ''
    }));
  };

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

  // ========== FUNCIONES PARA DIRECCIONES ==========
  const validateDireccion = () => {
    const newErrors = {};

    if (!direccionActual.calle.trim()) {
      newErrors.calle = 'La calle es requerida';
    }
    if (!direccionActual.numero_exterior.trim()) {
      newErrors.numero_exterior = 'El número exterior es requerido';
    }
    if (!direccionActual.colonia.trim()) {
      newErrors.colonia = 'La colonia es requerida';
    }
    if (!direccionActual.ciudad.trim()) {
      newErrors.ciudad = 'La ciudad es requerida';
    }
    if (!direccionActual.estado.trim()) {
      newErrors.estado = 'El estado es requerido';
    }
    if (!direccionActual.codigo_postal.trim()) {
      newErrors.codigo_postal = 'El código postal es requerido';
    } else if (!/^\d{5}$/.test(direccionActual.codigo_postal)) {
      newErrors.codigo_postal = 'Código postal inválido (5 dígitos)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddDireccion = () => {
    if (validateDireccion()) {
      const nuevaDireccion = {
        ...direccionActual,
        predeterminada: direcciones.length === 0 ? true : direccionActual.predeterminada
      };

      let direccionesActualizadas = [...direcciones];
      
      if (editingDireccionIndex !== null) {
        direccionesActualizadas[editingDireccionIndex] = nuevaDireccion;
        setEditingDireccionIndex(null);
      } else {
        direccionesActualizadas = [...direcciones, nuevaDireccion];
      }

      if (nuevaDireccion.predeterminada) {
        direccionesActualizadas = direccionesActualizadas.map((dir, idx) => ({
          ...dir,
          predeterminada: idx === (editingDireccionIndex !== null ? editingDireccionIndex : direcciones.length)
        }));
      }

      setDirecciones(direccionesActualizadas);
      setShowDireccionForm(false);
      
      setDireccionActual({
        id: null,
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
      setErrors({});
    }
  };

  const handleRemoveDireccion = (index) => {
    const nuevasDirecciones = direcciones.filter((_, i) => i !== index);
    
    if (direcciones[index].predeterminada && nuevasDirecciones.length > 0) {
      nuevasDirecciones[0].predeterminada = true;
    }
    
    setDirecciones(nuevasDirecciones);
  };

  const handleSetPredeterminada = (index) => {
    const nuevasDirecciones = direcciones.map((dir, i) => ({
      ...dir,
      predeterminada: i === index
    }));
    setDirecciones(nuevasDirecciones);
  };

  const handleEditDireccion = (index) => {
    setDireccionActual(direcciones[index]);
    setEditingDireccionIndex(index);
    setShowDireccionForm(true);
  };

  // Limpiar mensajes
  const clearMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  // Validar datos del pedido
  const validatePedidoData = () => {
    const newErrors = {};

    if (!formData.estado) {
      newErrors.estado = 'El estado es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Continuar al paso 2 (direcciones)
  const handleNextStep = () => {
    setErrorMessage('');
    if (validatePedidoData()) {
      setStep(2);
      setErrors({});
    }
  };

  // Volver al paso 1
  const handlePrevStep = () => {
    setStep(1);
    setErrorMessage('');
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (direcciones.length === 0) {
      setErrorMessage('⚠️ Debes agregar al menos una dirección');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      let especialIdNumero = null;
      let ingredientesPersonalizados = null;

      console.log('Datos del formulario:', formData);
      console.log('Orden original:', orden);

      if (formData.tipo_pedido === 'especial') {
        if (formData.especial_id) {
          especialIdNumero = parseInt(formData.especial_id);
          console.log('Usando nuevo especial:', especialIdNumero);
        } else {
          const especialActualId = orden?.especial?.id || orden?.especial_id;
          if (especialActualId) {
            especialIdNumero = especialActualId;
            console.log('Manteniendo especial actual:', especialIdNumero);
          }
        }
      } else if (formData.tipo_pedido === 'personalizado') {
        if (ingredientesSeleccionados.length > 0) {
          ingredientesPersonalizados = ingredientesSeleccionados.join(', ');
        } else {
          ingredientesPersonalizados = orden?.ingredientes_personalizados || null;
        }
      }

      // Encontrar la dirección predeterminada
      const direccionPredeterminada = direcciones.find(d => d.predeterminada) || direcciones[0];

      const ordenData = {
        tipo_pedido: formData.tipo_pedido,
        especial_id: formData.tipo_pedido === 'especial' ? especialIdNumero : null,
        ingredientes_personalizados: formData.tipo_pedido === 'personalizado' ? ingredientesPersonalizados : null,
        estado: formData.estado,
        direccion_texto: `${direccionPredeterminada.calle} #${direccionPredeterminada.numero_exterior}${direccionPredeterminada.numero_interior ? ` Int. ${direccionPredeterminada.numero_interior}` : ''}, ${direccionPredeterminada.colonia}, ${direccionPredeterminada.ciudad}, ${direccionPredeterminada.estado}, CP: ${direccionPredeterminada.codigo_postal}`,
        direccion_id: direccionPredeterminada.id || null
      };

      console.log('Enviando datos al backend:', ordenData);

      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:5000/ordenes/${orden.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ordenData)
      });

      console.log('Respuesta status:', response.status);
      
      const responseText = await response.text();
      console.log('Respuesta texto:', responseText);

      if (response.ok) {
        try {
          const result = JSON.parse(responseText);
          setSuccessMessage(`✅ Orden actualizada exitosamente. Estado: ${result.orden.estado}`);
          
          setTimeout(() => {
            if (onOrdenUpdated) {
              onOrdenUpdated(result.orden);
            }
            onClose();
          }, 2000);
          
        } catch (parseError) {
          console.error('Error parseando JSON:', parseError);
          setErrorMessage('Orden actualizada, pero hubo un error procesando la respuesta');
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
        setErrorMessage(`❌ Error al actualizar orden: ${errorMsg}`);
      }

    } catch (error) {
      console.error('Error de conexión:', error);
      setErrorMessage('❌ Error de conexión al actualizar orden: ' + error.message);
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

  const getStatusBadge = (estado) => {
    const statusConfig = {
      pendiente: { class: 'editOrd-pending', text: 'Pendiente' },
      preparando: { class: 'editOrd-preparing', text: 'Preparando' },
      listo: { class: 'editOrd-ready', text: 'Listo' },
      entregado: { class: 'editOrd-delivered', text: 'Entregado' },
      cancelado: { class: 'editOrd-cancelled', text: 'Cancelado' }
    };
    
    const config = statusConfig[estado] || { class: 'editOrd-pending', text: estado };
    
    return <span className={`editOrd-status-badge ${config.class}`}>{config.text}</span>;
  };

  // Obtener el especial actual de la orden
  const getEspecialActual = () => {
    if (!orden || !orden.especial) return null;
    return especiales.find(esp => esp.id === orden.especial.id) || orden.especial;
  };

  const especialActual = getEspecialActual();
  const especialActualId = especialActual?.id?.toString() || '';

  if (!orden) {
    return null;
  }

  return (
    <div className={`editOrd-form ${darkMode ? 'editOrd-form-dark-mode' : ''}`}>
      {/* Mensajes de éxito/error */}
      {successMessage && (
        <div className="editOrd-success-message">
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="editOrd-error-message-box">
          {errorMessage}
        </div>
      )}

      {/* Indicador de pasos (solo visible si no hay mensaje de éxito) */}
      {!successMessage && (
        <div className="editOrd-form-steps">
          <div className={`editOrd-step-indicator ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <span className="editOrd-step-number">1</span>
            <span className="editOrd-step-label">Detalles del Pedido</span>
          </div>
          <div className="editOrd-step-line"></div>
          <div className={`editOrd-step-indicator ${step >= 2 ? 'active' : ''}`}>
            <span className="editOrd-step-number">2</span>
            <span className="editOrd-step-label">Dirección</span>
          </div>
        </div>
      )}

      {/* PASO 1: DETALLES DEL PEDIDO */}
      {step === 1 && !successMessage && (
        <div className="editOrd-form-container">
          <div className="editOrd-scroll-container">
            <form className="editOrd-form-form" onSubmit={(e) => e.preventDefault()}>
              {/* Información del cliente (solo lectura) */}
              <div className="editOrd-section">
                <h4>Información del Cliente</h4>
                <div className="editOrd-info-existing">
                  <div className="editOrd-info-row">
                    <strong>Nombre:</strong>
                    <span>{orden?.nombre_usuario || 'N/A'}</span>
                  </div>
                  <div className="editOrd-info-row">
                    <strong>Teléfono:</strong>
                    <span>{orden?.telefono_usuario || 'N/A'}</span>
                  </div>
                  <div className="editOrd-info-row">
                    <strong>Código de orden:</strong>
                    <span className="editOrd-codigo">{orden?.codigo_unico}</span>
                  </div>
                </div>
              </div>

              {/* Estado de la orden */}
              <div className="editOrd-section">
                <h4>Estado de la Orden</h4>
                <div className="editOrd-form-row">
                  <div className="editOrd-form-group editOrd-form-group-full-width">
                    <label htmlFor="editOrd-estado">Estado *</label>
                    <select
                      id="editOrd-estado"
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      className={errors.estado ? 'editOrd-select-error editOrd-select' : 'editOrd-select'}
                    >
                      <option value="">Selecciona un estado</option>
                      {estadosDisponibles.map(estado => (
                        <option key={estado} value={estado}>
                          {estado.charAt(0).toUpperCase() + estado.slice(1)}
                        </option>
                      ))}
                    </select>
                    {errors.estado && <span className="editOrd-error-message">{errors.estado}</span>}
                    
                    {huboCambiosEnPedido() && estadoOriginal !== 'pendiente' && (
                      <div className="editOrd-info-message">
                        <small>El estado se cambió a "pendiente" automáticamente porque modificaste el pedido.</small>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tipo de pedido */}
              <div className="editOrd-section">
                <h4>Cambiar Tipo de Pedido (Opcional)</h4>
                <div className="editOrd-form-row">
                  <div className="editOrd-form-group editOrd-form-group-full-width">
                    <div className="editOrd-tipo-pedido-options">
                      <label className="editOrd-radio-option">
                        <input
                          type="radio"
                          name="tipo_pedido"
                          value="especial"
                          checked={formData.tipo_pedido === 'especial'}
                          onChange={handleTipoPedidoChange}
                        />
                        <span className="editOrd-radio-custom"></span>
                        Pedir un Especial (Combo)
                      </label>
                      <label className="editOrd-radio-option">
                        <input
                          type="radio"
                          name="tipo_pedido"
                          value="personalizado"
                          checked={formData.tipo_pedido === 'personalizado'}
                          onChange={handleTipoPedidoChange}
                        />
                        <span className="editOrd-radio-custom"></span>
                        Armar mi propio pedido
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selección de especial */}
              {formData.tipo_pedido === 'especial' && (
                <div className="editOrd-section">
                  <h4>Seleccionar Especial (Opcional)</h4>
                  <div className="editOrd-form-row">
                    <div className="editOrd-form-group editOrd-form-group-full-width">
                      <select
                        name="especial_id"
                        value={formData.especial_id}
                        onChange={handleChange}
                        className="editOrd-select"
                      >
                        {especialActual && (
                          <option value={especialActualId}>
                            {especialActual.nombre}
                          </option>
                        )}
                        {especiales
                          .filter(esp => esp.id !== (orden?.especial?.id || orden?.especial_id))
                          .map(especial => (
                            <option key={especial.id} value={especial.id.toString()}>
                              {especial.nombre}
                            </option>
                          ))
                        }
                      </select>
                    </div>
                  </div>

                  {formData.especial_id && formData.especial_id !== especialActualId && (
                    <div className="editOrd-especial-info">
                      <div className="editOrd-especial-details">
                        <strong>Nuevo especial seleccionado:</strong>
                        <span>
                          {especiales.find(esp => esp.id === parseInt(formData.especial_id))?.nombre}
                        </span>
                      </div>
                      <div className="editOrd-especial-details">
                        <strong>Ingredientes:</strong>
                        <span>
                          {especiales.find(esp => esp.id === parseInt(formData.especial_id))?.ingredientes}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Selección de ingredientes personalizados */}
              {formData.tipo_pedido === 'personalizado' && (
                <div className="editOrd-section">
                  <h4>Seleccionar Ingredientes (Opcional)</h4>
                  <div className="editOrd-form-row">
                    <div className="editOrd-form-group editOrd-form-group-full-width">
                      <label>
                        Selecciona los ingredientes
                        {loadingIngredientes && (
                          <span className="loading-ingredientes-text"> (Cargando ingredientes...)</span>
                        )}
                      </label>
                      {loadingIngredientes ? (
                        <div className="loading-ingredientes">
                          <div className="spinner-small"></div>
                          <span>Cargando lista de ingredientes...</span>
                        </div>
                      ) : (
                        <>
                          <div className="editOrd-ingredientes-grid-container">
                            <div className="editOrd-ingredientes-grid">
                              {ingredientesDisponibles.map((ingrediente, index) => (
                                <label key={index} className="editOrd-ingrediente-checkbox">
                                  <input
                                    type="checkbox"
                                    checked={ingredientesSeleccionados.includes(ingrediente)}
                                    onChange={() => handleIngredienteToggle(ingrediente)}
                                  />
                                  <span className="editOrd-checkbox-custom"></span>
                                  {ingrediente}
                                </label>
                              ))}
                            </div>
                          </div>
                          <div className="editOrd-ingredientes-count">
                            {ingredientesSeleccionados.length} ingrediente(s) seleccionado(s)
                          </div>
                        </>
                      )}

                      {ingredientesSeleccionados.length > 0 && (
                        <div className="editOrd-ingredientes-preview">
                          <strong>Nuevos ingredientes seleccionados:</strong>
                          <div className="editOrd-ingredientes-list">
                            {ingredientesSeleccionados.join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Resumen del pedido */}
              <div className="editOrd-section">
                <h4>Resumen</h4>
                <div className="editOrd-resumen-pedido">
                  <div className="editOrd-resumen-item">
                    <strong>Tipo:</strong>
                    <span>{formData.tipo_pedido === 'especial' ? 'Especial' : 'Personalizado'}</span>
                  </div>
                  
                  {formData.tipo_pedido === 'especial' && (
                    <div className="editOrd-resumen-item">
                      <strong>Especial:</strong>
                      <span>
                        {formData.especial_id && formData.especial_id !== especialActualId 
                          ? especiales.find(esp => esp.id === parseInt(formData.especial_id))?.nombre
                          : especialActual?.nombre || 'Especial actual'
                        }
                      </span>
                    </div>
                  )}
                  
                  {formData.tipo_pedido === 'personalizado' && (
                    <div className="editOrd-resumen-item">
                      <strong>Ingredientes:</strong>
                      <span>
                        {ingredientesSeleccionados.length > 0 
                          ? ingredientesSeleccionados.join(', ')
                          : orden?.ingredientes_personalizados || 'Ingredientes actuales'
                        }
                      </span>
                    </div>
                  )}
                  
                  <div className="editOrd-resumen-precio">
                    <strong>Precio total:</strong>
                    <span className="editOrd-precio-final">{formatPrice(precioCalculado)}</span>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Botones de navegación */}
          <div className="editOrd-form-actions-step">
            <button 
              type="button" 
              className="editOrd-btn-cancel"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="button" 
              className="editOrd-btn-next"
              onClick={handleNextStep}
            >
              Siguiente: Dirección →
            </button>
          </div>
        </div>
      )}

      {/* PASO 2: DIRECCIÓN */}
      {step === 2 && !successMessage && (
        <div className="editOrd-form-container">
          <div className="editOrd-scroll-container">
            <div className="editOrd-direcciones-section">
              <div className="editOrd-direcciones-header">
                <h4 className="editOrd-direcciones-title">Dirección de Entrega</h4>
                {!showDireccionForm && (
                  <button 
                    type="button"
                    className="editOrd-btn-add-direccion"
                    onClick={() => {
                      setEditingDireccionIndex(null);
                      setDireccionActual({
                        id: null,
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
                      setShowDireccionForm(true);
                      clearMessages();
                    }}
                  >
                    + Agregar dirección
                  </button>
                )}
              </div>

              {/* Lista de direcciones agregadas */}
              {direcciones.length > 0 && (
                <div className="editOrd-direcciones-list">
                  {direcciones.map((dir, index) => (
                    <div key={index} className={`editOrd-direccion-item ${dir.predeterminada ? 'predeterminada' : ''}`}>
                      <div className="editOrd-direccion-header">
                        <span className="editOrd-direccion-tipo">{dir.tipo}</span>
                        {dir.predeterminada && (
                          <span className="editOrd-predeterminada-badge">Predeterminada</span>
                        )}
                      </div>
                      <div className="editOrd-direccion-contenido">
                        <p><strong>{dir.calle} #{dir.numero_exterior}</strong></p>
                        {dir.numero_interior && <p>Int. {dir.numero_interior}</p>}
                        <p>{dir.colonia}, {dir.ciudad}, {dir.estado}</p>
                        <p>CP: {dir.codigo_postal}</p>
                        {dir.referencias && <p className="editOrd-referencias">{dir.referencias}</p>}
                      </div>
                      <div className="editOrd-direccion-acciones">
                        <button
                          type="button"
                          className="editOrd-btn-edit-direccion"
                          onClick={() => handleEditDireccion(index)}
                          title="Editar dirección"
                        >
                          ✎
                        </button>
                        {!dir.predeterminada && direcciones.length > 1 && (
                          <button
                            type="button"
                            className="editOrd-btn-set-predeterminada"
                            onClick={() => handleSetPredeterminada(index)}
                            title="Marcar como predeterminada"
                          >
                            ★
                          </button>
                        )}
                        <button
                          type="button"
                          className="editOrd-btn-remove-direccion"
                          onClick={() => handleRemoveDireccion(index)}
                          title="Eliminar dirección"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Formulario para agregar nueva dirección */}
              {showDireccionForm && (
                <div className="editOrd-direccion-form">
                  <h5 className="editOrd-form-subtitle">
                    {editingDireccionIndex !== null ? 'Editar dirección' : 'Nueva dirección'}
                  </h5>
                  
                  <div className="editOrd-form-group">
                    <label className="editOrd-form-label">
                      Tipo de dirección <span className="editOrd-required">*</span>
                    </label>
                    <select
                      className="editOrd-select"
                      value={direccionActual.tipo}
                      onChange={(e) => setDireccionActual({...direccionActual, tipo: e.target.value})}
                    >
                      <option value="casa">Casa</option>
                      <option value="trabajo">Trabajo</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  <div className="editOrd-form-group">
                    <label className="editOrd-form-label">
                      Calle <span className="editOrd-required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`editOrd-form-control ${errors.calle ? 'editOrd-input-error' : ''}`}
                      value={direccionActual.calle}
                      onChange={(e) => setDireccionActual({...direccionActual, calle: e.target.value})}
                      placeholder="Ej: Av. Principal"
                    />
                    {errors.calle && <span className="editOrd-error-message">{errors.calle}</span>}
                  </div>

                  <div className="editOrd-form-row">
                    <div className="editOrd-form-group editOrd-half">
                      <label className="editOrd-form-label">
                        Número exterior <span className="editOrd-required">*</span>
                      </label>
                      <input
                        type="text"
                        className={`editOrd-form-control ${errors.numero_exterior ? 'editOrd-input-error' : ''}`}
                        value={direccionActual.numero_exterior}
                        onChange={(e) => setDireccionActual({...direccionActual, numero_exterior: e.target.value})}
                        placeholder="Ej: 123"
                      />
                      {errors.numero_exterior && <span className="editOrd-error-message">{errors.numero_exterior}</span>}
                    </div>

                    <div className="editOrd-form-group editOrd-half">
                      <label className="editOrd-form-label">Número interior</label>
                      <input
                        type="text"
                        className="editOrd-form-control"
                        value={direccionActual.numero_interior}
                        onChange={(e) => setDireccionActual({...direccionActual, numero_interior: e.target.value})}
                        placeholder="Ej: A, 2B (opcional)"
                      />
                    </div>
                  </div>

                  <div className="editOrd-form-group">
                    <label className="editOrd-form-label">
                      Colonia <span className="editOrd-required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`editOrd-form-control ${errors.colonia ? 'editOrd-input-error' : ''}`}
                      value={direccionActual.colonia}
                      onChange={(e) => setDireccionActual({...direccionActual, colonia: e.target.value})}
                      placeholder="Ej: Centro"
                    />
                    {errors.colonia && <span className="editOrd-error-message">{errors.colonia}</span>}
                  </div>

                  <div className="editOrd-form-row">
                    <div className="editOrd-form-group editOrd-half">
                      <label className="editOrd-form-label">
                        Ciudad <span className="editOrd-required">*</span>
                      </label>
                      <input
                        type="text"
                        className={`editOrd-form-control ${errors.ciudad ? 'editOrd-input-error' : ''}`}
                        value={direccionActual.ciudad}
                        onChange={(e) => setDireccionActual({...direccionActual, ciudad: e.target.value})}
                        placeholder="Ej: Ciudad de México"
                      />
                      {errors.ciudad && <span className="editOrd-error-message">{errors.ciudad}</span>}
                    </div>

                    <div className="editOrd-form-group editOrd-half">
                      <label className="editOrd-form-label">
                        Estado <span className="editOrd-required">*</span>
                      </label>
                      <input
                        type="text"
                        className={`editOrd-form-control ${errors.estado ? 'editOrd-input-error' : ''}`}
                        value={direccionActual.estado}
                        onChange={(e) => setDireccionActual({...direccionActual, estado: e.target.value})}
                        placeholder="Ej: CDMX"
                      />
                      {errors.estado && <span className="editOrd-error-message">{errors.estado}</span>}
                    </div>
                  </div>

                  <div className="editOrd-form-group">
                    <label className="editOrd-form-label">
                      Código postal <span className="editOrd-required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`editOrd-form-control ${errors.codigo_postal ? 'editOrd-input-error' : ''}`}
                      value={direccionActual.codigo_postal}
                      onChange={(e) => setDireccionActual({...direccionActual, codigo_postal: e.target.value.replace(/\D/g, '').slice(0, 5)})}
                      placeholder="5 dígitos"
                      maxLength="5"
                    />
                    {errors.codigo_postal && <span className="editOrd-error-message">{errors.codigo_postal}</span>}
                  </div>

                  <div className="editOrd-form-group">
                    <label className="editOrd-form-label">Referencias</label>
                    <textarea
                      className="editOrd-form-control"
                      value={direccionActual.referencias}
                      onChange={(e) => setDireccionActual({...direccionActual, referencias: e.target.value})}
                      placeholder="Ej: Entre calles, puntos de referencia, etc."
                      rows="3"
                    />
                  </div>

                  <div className="editOrd-checkbox-group">
                    <label className="editOrd-checkbox-label">
                      <input
                        type="checkbox"
                        checked={direccionActual.predeterminada}
                        onChange={(e) => setDireccionActual({...direccionActual, predeterminada: e.target.checked})}
                        disabled={direcciones.length === 0 && editingDireccionIndex === null}
                      />
                      <span>Marcar como dirección predeterminada</span>
                    </label>
                  </div>

                  <div className="editOrd-direccion-form-actions">
                    <button
                      type="button"
                      className="editOrd-btn-cancel-small"
                      onClick={() => {
                        setShowDireccionForm(false);
                        setEditingDireccionIndex(null);
                        setDireccionActual({
                          id: null,
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
                        setErrors({});
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="editOrd-btn-save-direccion"
                      onClick={handleAddDireccion}
                    >
                      {editingDireccionIndex !== null ? 'Actualizar dirección' : 'Guardar dirección'}
                    </button>
                  </div>
                </div>
              )}

              {direcciones.length === 0 && !showDireccionForm && (
                <div className="editOrd-no-direcciones">
                  <p>No hay direcciones agregadas</p>
                  <p className="editOrd-no-direcciones-sub">Haz clic en "Agregar dirección" para comenzar</p>
                </div>
              )}
            </div>
          </div>

          {/* Botones de navegación */}
          <div className="editOrd-form-actions-step">
            <button 
              type="button" 
              className="editOrd-btn-back"
              onClick={handlePrevStep}
              disabled={loading}
            >
              ← Atrás
            </button>
            <button 
              type="button" 
              className="editOrd-btn-submit"
              onClick={handleSubmit}
              disabled={loading || direcciones.length === 0}
            >
              {loading ? 'Actualizando...' : 'Actualizar Orden'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditOrdenForm;