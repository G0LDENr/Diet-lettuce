import React from 'react';
import '../../css/Carrito/carrito-detalle-pedido.css';
import '../../css/Carrito/pasos/paso2-informacion.css';
import '../../css/Carrito/pasos/paso3-direccion.css';
import '../../css/Carrito/pasos/paso4-pago.css';
import '../../css/Carrito/pasos/paso5-resumen.css';
import '../../css/Carrito/pasos/responsive.css';
import { FaArrowRight, FaLock,FaPlus } from 'react-icons/fa';
import { BsCreditCard, BsLockFill, BsShieldCheck, BsShieldLockFill, BsPerson, BsTelephone, BsMap, BsPin } from 'react-icons/bs';
import { IoLocationSharp } from "react-icons/io5";
import { GoShieldCheck } from "react-icons/go";
import { LuLockKeyhole } from "react-icons/lu";
import { PiShoppingCart } from "react-icons/pi";
import { LiaShippingFastSolid } from "react-icons/lia";

// Íconos
import efectivoIcon from '../../img/money.png';
import tarjetaIcon from '../../img/tarjet-card.png';

import homeIcon from '../../img/casa.png';
import workIcon from '../../img/trabajo.png';
import otherIcon from '../../img/ubicacion.png';
import visaIcon from '../../img/visa.png';
import mastercardIcon from '../../img/mastercard.png';
import amexIcon from '../../img/amex.png';
import defaultCardIcon from '../../img/tarjeta.png';
import estrellaIcon from '../../img/estrella.png';

const CarritoDetallePedido = ({
  currentStep,
  handlePasoAnterior,
  handleSiguientePaso,
  handleFinalizarPedido,
  carritoItems,
  totalCarritoItems,
  calcularTotal,
  formatPrice,
  infoForm,
  handleInfoChange,
  isAuthenticated,
  direccionForm,
  handleDireccionChange,
  userDirecciones,
  loadingDirecciones,
  useSavedAddress,
  selectedAddressId,
  showNewAddressForm,
  handleAddressSelect,
  setShowNewAddressForm,
  setUseSavedAddress,
  metodoPago,
  setMetodoPago,
  userTarjetas,
  loadingTarjetas,
  selectedTarjetaId,
  useSavedCard,
  showNewCardForm,
  tarjetaForm,
  aceptoTerminos,
  showPoliticaSeguridad,
  showTarjetaNumber,
  notasPedido,
  procesandoPedido,
  handleCardSelect,
  handleTarjetaChange,
  setShowNewCardForm,
  setUseSavedCard,
  setAceptoTerminos,
  setShowPoliticaSeguridad,
  setShowTarjetaNumber,
  setNotasPedido,
  onAbrirModalDirecciones,
  onAbrirModalTarjetas
}) => {
  const total = calcularTotal();
  const totalProductos = carritoItems ? carritoItems.reduce((sum, item) => sum + item.cantidad, 0) : 0;

  // ========== FUNCIONES AUXILIARES ==========
  const getTarjetaIcon = (tipo) => {
    switch(tipo) {
      case 'visa': return visaIcon;
      case 'mastercard': return mastercardIcon;
      case 'amex': return amexIcon;
      default: return defaultCardIcon;
    }
  };

  const formatearNumeroTarjeta = (numeroEnmascarado) => {
    return numeroEnmascarado || "**** **** **** 1234";
  };

  const getTipoDireccionIcon = (tipo) => {
    switch(tipo) {
      case 'casa': return homeIcon;
      case 'trabajo': return workIcon;
      default: return otherIcon;
    }
  };

  const getTipoDireccionLabel = (tipo) => {
    switch(tipo) {
      case 'casa': return 'Casa';
      case 'trabajo': return 'Trabajo';
      default: return 'Otro';
    }
  };

  const getTipoTarjetaLabel = (tipo) => {
    switch(tipo) {
      case 'visa': return 'Visa';
      case 'mastercard': return 'Mastercard';
      case 'amex': return 'American Express';
      default: return 'Tarjeta';
    }
  };

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

  // ========== INDICADOR DE PASOS ==========
  const renderSteps = () => {
    if (currentStep <= 1) return null;
    
    const steps = [
      { number: 1, label: 'Carrito' },
      { number: 2, label: 'Información' },
      { number: 3, label: 'Dirección' },
      { number: 4, label: 'Pago' },
      { number: 5, label: 'Resumen' }
    ];

    return (
      <div className="carrito-detal-paso-header">
        <div className="carrito-detal-paso-indicador">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="carrito-detal-paso-item">
                <span className={`carrito-detal-paso-numero ${
                  step.number < currentStep ? 'completado' : 
                  step.number === currentStep ? 'activo' : ''
                }`}>
                  {step.number < currentStep ? '✓' : step.number}
                </span>
                <span className={`carrito-detal-paso-titulo ${
                  step.number < currentStep ? 'completado' : 
                  step.number === currentStep ? 'activo' : ''
                }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <span className={`carrito-detal-paso-linea ${
                  step.number < currentStep ? 'activo' : ''
                }`}></span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // ========== RENDER DEL RESUMEN (PASO 1) ==========
  const renderResumen = () => {
    return (
      <div className="carrito-product-resumen-section">
        <div className="carrito-product-resumen-card">
          <div className="carrito-product-resumen-header">
            <h3>
              <PiShoppingCart  className="carrito-resumen-icon" />
              Resumen del Pedido
            </h3>
            <p className="carrito-resumen-subtotal-text">
              Suplementos ({totalProductos})
            </p>
          </div>
          
          <div className="carrito-product-resumen-separador"></div>
          
          <div className="carrito-product-resumen-detalle">
            <div className="carrito-product-resumen-row envio">
              <span>
                <LiaShippingFastSolid className="carrito-resumen-icon-verde" />
                Costo de envío
              </span>
              <span className="carrito-product-envio-gratis">Gratis</span>
            </div>
            
            <div className="carrito-product-resumen-separador-gris"></div>
            
            <div className="carrito-product-resumen-row total">
              <span className="carrito-total-label">Total a pagar</span>
              <span className="carrito-product-total-precio">{formatPrice(total)}</span>
            </div>
          </div>
          
          <div className="carrito-product-resumen-acciones">
            <button 
              onClick={handleSiguientePaso}
              className="carrito-product-procesar-btn"
              disabled={carritoItems?.length === 0}
            >
              Continuar con el Pedido
              <FaArrowRight className="carrito-product-btn-icon-right" />
            </button>
            
            <div className="carrito-product-beneficios">
              <div className="carrito-product-beneficio-item">
                <div className="carrito-product-beneficio-icon">
                  <LiaShippingFastSolid />
                </div>
                <div className="carrito-product-beneficio-texto">
                  <span className="carrito-product-beneficio-titulo">Envío gratis</span>
                  <span className="carrito-product-beneficio-sub">en pedidos mayores a $499</span>
                </div>
              </div>
              
              <div className="carrito-product-beneficio-item">
                <div className="carrito-product-beneficio-icon">
                  <LiaShippingFastSolid />
                </div>
                <div className="carrito-product-beneficio-texto">
                  <span className="carrito-product-beneficio-titulo">Entrega garantizada en 48 - 72 horas</span>
                  <span className="carrito-product-beneficio-sub">en zonas seleccionadas</span>
                </div>
              </div>
              
              <div className="carrito-product-beneficio-item">
                <div className="carrito-product-beneficio-icon">
                  <BsCreditCard />
                </div>
                <div className="carrito-product-beneficio-texto">
                  <span className="carrito-product-beneficio-titulo">Paga en efectivo o tarjeta</span>
                  <span className="carrito-product-beneficio-sub">múltiples métodos de pago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ========== PASO 2: INFORMACIÓN ==========
  const renderPasoInformacion = () => {
    const nombreCompleto = infoForm.nombre_completo?.trim() || '';
    const telefono = infoForm.telefono?.trim() || '';
    const nombreValido = nombreCompleto.length > 0;
    const telefonoValido = telefono.length > 0;

    return (
      <div className="carrito-detal-info-container">
        <div className="carrito-detal-info-grid">
          {/* Columna Izquierda - Formulario */}
          <div className="carrito-detal-info-left">
            <h3>Información personal</h3>
            <p className="carrito-detal-info-subtitulo">
              Ingresa tus datos para la entrega del pedido
            </p>

            <div className="carrito-detal-info-formulario">
              {/* Campo: Nombre completo */}
              <div className="carrito-detal-form-group">
                <label htmlFor="nombre_completo">Nombre completo *</label>
                <div className="carrito-detal-field-hint">
                  <span className="carrito-detal-field-hint-text">
                    Como aparece en tu perfil
                  </span>
                </div>
                <div className="carrito-detal-input-wrapper">
                  <div className="carrito-detal-input-prefix">
                    <BsPerson className="carrito-detal-prefix-icon" />
                  </div>
                  <input
                    type="text"
                    id="nombre_completo"
                    name="nombre_completo"
                    value={infoForm.nombre_completo}
                    onChange={handleInfoChange}
                    placeholder="Tu nombre completo"
                    className={`carrito-detal-form-input ${nombreValido ? 'valid' : ''}`}
                    required
                    readOnly={isAuthenticated}
                    disabled={isAuthenticated}
                  />
                  {nombreValido && (
                    <span className="carrito-detal-input-check-right">✓</span>
                  )}
                </div>
              </div>

              {/* Campo: Teléfono */}
              <div className="carrito-detal-form-group">
                <label htmlFor="telefono">Teléfono *</label>
                <div className="carrito-detal-field-hint">
                  <span className="carrito-detal-field-hint-text">
                    Como aparece en tu perfil
                  </span>
                </div>
                <div className="carrito-detal-input-wrapper">
                  <div className="carrito-detal-input-prefix">
                    <BsTelephone className="carrito-detal-prefix-icon" />
                  </div>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={infoForm.telefono}
                    onChange={handleInfoChange}
                    placeholder="10 dígitos o +521234567890"
                    className={`carrito-detal-form-input ${telefonoValido ? 'valid' : ''}`}
                    required
                    readOnly={isAuthenticated}
                    disabled={isAuthenticated}
                  />
                  {telefonoValido && (
                    <span className="carrito-detal-input-check-right">✓</span>
                  )}
                </div>
                {!isAuthenticated && (
                  <small className="carrito-detal-form-hint">
                    Formato: 10 dígitos o +52 seguido de 10 dígitos
                  </small>
                )}
              </div>
            </div>
          </div>

          {/* Columna Derecha - Tarjeta de Seguridad */}
          <div className="carrito-detal-info-right">
            <div className="carrito-detal-security-card">
              <div className="carrito-detal-security-header">
                <div className="carrito-detal-security-icon-wrapper">
                  <BsShieldLockFill className="carrito-detal-security-icon-main" />
                </div>
                <div className="carrito-detal-security-title">
                  <strong>Tus datos están seguros</strong>
                  <p>Tu información está protegida con encriptación de grado bancario.</p>
                </div>
              </div>

              <div className="carrito-detal-security-features">
                <div className="carrito-detal-security-feature">
                  <div className="carrito-detal-security-feature-icon">
                    <BsLockFill />
                  </div>
                  <span>Información encriptada</span>
                </div>
                <div className="carrito-detal-security-feature">
                  <div className="carrito-detal-security-feature-icon">
                    <BsShieldCheck />
                  </div>
                  <span>No compartimos tus datos</span>
                </div>
                <div className="carrito-detal-security-feature">
                  <div className="carrito-detal-security-feature-icon">
                    <BsCreditCard />
                  </div>
                  <span>Compra 100% segura</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ========== PASO 3: DIRECCIÓN ==========
  const renderPasoDireccion = () => {
    // Buscar la dirección seleccionada primero
    const direccionSeleccionada = userDirecciones.find(dir => dir.id === selectedAddressId);
    // Si no hay seleccionada, usar la predeterminada
    const direccionDefault = userDirecciones.find(dir => dir.predeterminada);
    // Mostrar la seleccionada si existe, si no la predeterminada, si no la primera
    const direccionMostrar = direccionSeleccionada || direccionDefault || userDirecciones[0];

    return (
      <div className="carrito-detal-direccion-container">
        <div className="carrito-detal-direccion-grid">
          {/* Columna Izquierda - Dirección */}
          <div className="carrito-detal-direccion-left">
            <h3>Dirección de entrega</h3>
            <p className="carrito-detal-direccion-subtitulo">
              Selecciona o ingresa la dirección donde quieres recibir tu pedido
            </p>

            {isAuthenticated && userDirecciones.length > 0 && !showNewAddressForm ? (
              <>
                {/* Tarjeta de Dirección */}
                <div className="carrito-detal-direccion-card">
                  {/* Cabecera con círculo + icono + texto */}
                  <div className="carrito-detal-direccion-card-header">
                    <div className="carrito-detal-direccion-card-icon-wrapper">
                      <img 
                        src={getTipoDireccionIcon(direccionMostrar?.tipo || 'casa')} 
                        alt={getTipoDireccionLabel(direccionMostrar?.tipo || 'casa')} 
                        className="carrito-detal-direccion-card-icon"
                      />
                    </div>
                    <div className="carrito-detal-direccion-card-tipo-text">
                      <span className="carrito-detal-direccion-card-tipo-label">
                        {getTipoDireccionLabel(direccionMostrar?.tipo || 'casa')}
                      </span>
                      {direccionMostrar?.predeterminada && (
                        <span className="carrito-detal-direccion-card-pred">Predeterminada</span>
                      )}
                    </div>
                  </div>

                  {/* Detalles de la dirección */}
                  <div className="carrito-detal-direccion-card-detalle">
                    <p className="carrito-detal-direccion-card-calle">
                      <strong>{direccionMostrar?.calle} #{direccionMostrar?.numero_exterior}</strong>
                      {direccionMostrar?.numero_interior && ` Int. ${direccionMostrar.numero_interior}`}
                    </p>
                    <p className="carrito-detal-direccion-card-colonia">
                      {direccionMostrar?.colonia}, {direccionMostrar?.ciudad}, {direccionMostrar?.estado}
                    </p>
                    <p className="carrito-detal-direccion-card-cp">
                      CP: {direccionMostrar?.codigo_postal}
                    </p>
                    {direccionMostrar?.referencias && (
                      <div className="carrito-detal-direccion-card-referencias">
                        <IoLocationSharp className="carrito-detal-direccion-referencia-icon" />
                        <span>{direccionMostrar.referencias}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botón FUERA de la tarjeta */}
                <div className="carrito-detal-direccion-card-actions">
                  <button 
                    className="carrito-detal-direccion-card-btn"
                    onClick={onAbrirModalDirecciones}
                  >
                    <div className="carrito-detal-direccion-card-btn-icon">
                      <BsMap className="carrito-detal-direccion-btn-icon" />
                    </div>
                    <div className="carrito-detal-direccion-card-btn-texto">
                      <span className="carrito-detal-direccion-card-btn-titulo">
                        Seleccionar una dirección diferente
                      </span>
                      <span className="carrito-detal-direccion-card-btn-sub">
                        Elige entre tus direcciones guardadas o agrega una nueva
                      </span>
                    </div>
                  </button>
                </div>
              </>
            ) : (
              <div className="carrito-detal-direccion-formulario-container">
                <div className="carrito-detal-direccion-formulario">
                  <div className="carrito-detal-form-grid">
                    <div className="carrito-detal-form-group">
                      <label>Calle *</label>
                      <input
                        type="text"
                        name="calle"
                        value={direccionForm.calle}
                        onChange={handleDireccionChange}
                        placeholder="Nombre de la calle"
                        className="carrito-detal-form-input"
                        required
                      />
                    </div>
                    
                    <div className="carrito-detal-form-group">
                      <label>Número Exterior *</label>
                      <input
                        type="text"
                        name="numero_exterior"
                        value={direccionForm.numero_exterior}
                        onChange={handleDireccionChange}
                        placeholder="123"
                        className="carrito-detal-form-input"
                        required
                      />
                    </div>
                    
                    <div className="carrito-detal-form-group">
                      <label>Número Interior</label>
                      <input
                        type="text"
                        name="numero_interior"
                        value={direccionForm.numero_interior}
                        onChange={handleDireccionChange}
                        placeholder="A"
                        className="carrito-detal-form-input"
                      />
                    </div>
                    
                    <div className="carrito-detal-form-group">
                      <label>Colonia *</label>
                      <input
                        type="text"
                        name="colonia"
                        value={direccionForm.colonia}
                        onChange={handleDireccionChange}
                        placeholder="Nombre de la colonia"
                        className="carrito-detal-form-input"
                        required
                      />
                    </div>
                    
                    <div className="carrito-detal-form-group">
                      <label>Ciudad *</label>
                      <input
                        type="text"
                        name="ciudad"
                        value={direccionForm.ciudad}
                        onChange={handleDireccionChange}
                        placeholder="Nombre de la ciudad"
                        className="carrito-detal-form-input"
                        required
                      />
                    </div>
                    
                    <div className="carrito-detal-form-group">
                      <label>Estado *</label>
                      <input
                        type="text"
                        name="estado"
                        value={direccionForm.estado}
                        onChange={handleDireccionChange}
                        placeholder="Nombre del estado"
                        className="carrito-detal-form-input"
                        required
                      />
                    </div>
                    
                    <div className="carrito-detal-form-group">
                      <label>Código Postal *</label>
                      <input
                        type="text"
                        name="codigo_postal"
                        value={direccionForm.codigo_postal}
                        onChange={handleDireccionChange}
                        placeholder="12345"
                        maxLength="5"
                        className="carrito-detal-form-input"
                        required
                      />
                      <small className="carrito-detal-form-hint">5 dígitos</small>
                    </div>
                    
                    <div className="carrito-detal-form-group">
                      <label>Tipo de Dirección</label>
                      <select
                        name="tipo"
                        value={direccionForm.tipo}
                        onChange={handleDireccionChange}
                        className="carrito-detal-form-select"
                      >
                        <option value="casa">Casa</option>
                        <option value="trabajo">Trabajo</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                    
                    <div className="carrito-detal-form-group full-width">
                      <label>Referencias (opcional)</label>
                      <textarea
                        name="referencias"
                        value={direccionForm.referencias}
                        onChange={handleDireccionChange}
                        placeholder="Entre calles, puntos de referencia, color de la casa, etc."
                        rows="3"
                        className="carrito-detal-form-textarea"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Columna Derecha - Tarjeta de Seguridad de Entrega */}
          <div className="carrito-detal-direccion-right">
            <div className="carrito-detal-security-card">
              <div className="carrito-detal-security-header">
                <div className="carrito-detal-security-icon-wrapper">
                  <BsShieldLockFill className="carrito-detal-security-icon-main" />
                </div>
                <div className="carrito-detal-security-title">
                  <strong>Entrega segura</strong>
                  <p>Tu pedido será entregado de forma confiable y protegida.</p>
                </div>
              </div>

              <div className="carrito-detal-security-features">
                <div className="carrito-detal-security-feature">
                  <div className="carrito-detal-security-feature-icon">
                    <BsLockFill />
                  </div>
                  <span>Información protegida</span>
                </div>
                <div className="carrito-detal-security-feature">
                  <div className="carrito-detal-security-feature-icon">
                    <BsShieldCheck />
                  </div>
                  <span>Entrega confiable</span>
                </div>
                <div className="carrito-detal-security-feature">
                  <div className="carrito-detal-security-feature-icon">
                    <BsCreditCard />
                  </div>
                  <span>Compra 100% segura</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ========== PASO 4: PAGO ==========
  const renderPasoPago = () => {
    // Encontrar la tarjeta seleccionada
    const tarjetaSeleccionada = userTarjetas.find(t => t.id === selectedTarjetaId);

    return (
      <div className="carrito-detal-pago-container">
        <div className="carrito-detal-pago-metodos">
          <h3>Método de pago</h3>
          <p className="carrito-detal-pago-subtitulo">
            Selecciona cómo quieres realizar tu pago
          </p>
          
          <div className="carrito-detal-metodos-grid">
            {/* Pago en Efectivo */}
            <div 
              className={`carrito-detal-metodo-pago-card ${metodoPago === 'efectivo' ? 'seleccionado' : ''}`}
              onClick={() => setMetodoPago('efectivo')}
            >
              <div className="carrito-detal-metodo-radio">
                <input 
                  type="radio" 
                  name="metodoPago" 
                  checked={metodoPago === 'efectivo'}
                  onChange={() => setMetodoPago('efectivo')}
                />
              </div>
              <div className="carrito-detal-metodo-header">
                <div className="carrito-detal-metodo-icon-wrapper">
                  <div className="carrito-detal-metodo-icon-circle">
                    <img 
                      src={efectivoIcon} 
                      alt="Pago en efectivo" 
                      className="carrito-detal-metodo-icon-img"
                    />
                  </div>
                </div>
                <div className="carrito-detal-metodo-info">
                  <h4>Pago en Efectivo</h4>
                  <p>Paga cuando recibas tu pedido</p>
                  <div className="carrito-detal-metodo-desc">
                    Entrega el dinero al repartidor al momento de la entrega.
                  </div>
                </div>
              </div>
              <div className="carrito-detal-metodo-badge">
                <div className="carrito-detal-metodo-badge-icon">
                  <GoShieldCheck />
                </div>
                <div className="carrito-detal-metodo-badge-text">
                  <span className="carrito-detal-metodo-badge-title">Seguro y Confiable</span>
                  <span className="carrito-detal-metodo-badge-sub">sin cargos adicionales ni comisiones</span>
                </div>
              </div>
            </div>
            
            {/* Pago con Tarjeta */}
            <div 
              className={`carrito-detal-metodo-pago-card ${metodoPago === 'tarjeta' ? 'seleccionado' : ''}`}
              onClick={() => setMetodoPago('tarjeta')}
            >
              <div className="carrito-detal-metodo-radio">
                <input 
                  type="radio" 
                  name="metodoPago" 
                  checked={metodoPago === 'tarjeta'}
                  onChange={() => setMetodoPago('tarjeta')}
                />
              </div>
              <div className="carrito-detal-metodo-header">
                <div className="carrito-detal-metodo-icon-wrapper">
                  <div className="carrito-detal-metodo-icon-circle">
                    <img 
                      src={tarjetaIcon} 
                      alt="Pago con tarjeta" 
                      className="carrito-detal-metodo-icon-img"
                    />
                  </div>
                </div>
                <div className="carrito-detal-metodo-info">
                  <h4>Pago con Tarjeta</h4>
                  <p>Pago seguro en línea</p>
                  <div className="carrito-detal-metodo-desc">
                    Paga ahora con tarjeta de crédito o débito.
                  </div>
                </div>
              </div>
              <div className="carrito-detal-metodo-badge">
                <div className="carrito-detal-metodo-badge-icon">
                  <LuLockKeyhole />
                </div>
                <div className="carrito-detal-metodo-badge-text">
                  <span className="carrito-detal-metodo-badge-title">Transferencias 100% seguras</span>
                  <span className="carrito-detal-metodo-badge-sub">tus datos están protegidos con encriptación</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {metodoPago === 'tarjeta' && (
          <div className="carrito-detal-tarjeta-container">
            <div className="carrito-detal-tarjeta-header">
              <h3>Información de tarjeta</h3>
              <p className="carrito-detal-tarjeta-subtitulo">
                Selecciona o agrega una tarjeta para el pedido
              </p>
            </div>

            {isAuthenticated && userTarjetas.length > 0 && !showNewCardForm ? (
              <>
                {/* Tarjeta seleccionada */}
                <div className="carrito-detal-tarjeta-card">
                  <div className="carrito-detal-tarjeta-card-header">
                    <div className="carrito-detal-tarjeta-card-tipo">
                      <img 
                        src={getTarjetaIcon(tarjetaSeleccionada?.tipo_tarjeta || 'visa')} 
                        alt="Tarjeta" 
                        className="carrito-detal-tarjeta-card-icon"
                      />
                      <span>
                        {getTipoTarjetaLabel(tarjetaSeleccionada?.tipo_tarjeta || 'visa')}
                      </span>
                      {tarjetaSeleccionada?.predeterminada && (
                        <span className="carrito-detal-tarjeta-card-pred">Predeterminada</span>
                      )}
                    </div>
                  </div>
                  <div className="carrito-detal-tarjeta-card-detalle">
                    <p className="carrito-detal-tarjeta-card-numero">
                      {formatearNumeroTarjeta(tarjetaSeleccionada?.numero_enmascarado)}
                    </p>
                    <p className="carrito-detal-tarjeta-card-titular">
                      {tarjetaSeleccionada?.nombre_titular}
                    </p>
                    <p className="carrito-detal-tarjeta-card-expiracion">
                      Exp: {tarjetaSeleccionada?.mes_expiracion}/{tarjetaSeleccionada?.anio_expiracion}
                    </p>
                  </div>
                </div>

                {/* Botón para seleccionar una tarjeta diferente */}
                <div className="carrito-detal-tarjeta-card-actions-bottom">
                  <button 
                    className="carrito-detal-tarjeta-card-btn"
                    onClick={onAbrirModalTarjetas}
                  >
                    <div className="carrito-detal-tarjeta-card-btn-icon">
                      <FaPlus className="carrito-detal-tarjeta-btn-icon" />
                    </div>
                    <div className="carrito-detal-tarjeta-card-btn-texto">
                      <span className="carrito-detal-tarjeta-card-btn-titulo">
                        Seleccionar una tarjeta diferente
                      </span>
                      <span className="carrito-detal-tarjeta-card-btn-sub">
                        Elige entre tus tarjetas guardadas o agrega una nueva
                      </span>
                    </div>
                  </button>
                </div>
              </>
            ) : (
              <div className="carrito-detal-tarjeta-formulario-container">
                <div className="carrito-detal-tarjeta-formulario">
                  {isAuthenticated && userTarjetas.length > 0 && (
                    <button 
                      type="button"
                      className="carrito-detal-btn-volver-tarjetas"
                      onClick={() => {
                        setShowNewCardForm(false);
                        setUseSavedCard(true);
                      }}
                    >
                      ← Volver a tarjetas guardadas
                    </button>
                  )}
                  
                  <div className="carrito-detal-tarjeta-form-grid">
                    <div className="carrito-detal-form-group full-width">
                      <label>Nombre del titular *</label>
                      <input
                        type="text"
                        name="nombre_titular"
                        value={tarjetaForm.nombre_titular}
                        onChange={handleTarjetaChange}
                        placeholder="Como aparece en la tarjeta"
                        className="carrito-detal-form-input"
                        required
                      />
                    </div>
                    
                    <div className="carrito-detal-form-group full-width">
                      <label>Número de tarjeta *</label>
                      <div className="carrito-detal-tarjeta-input-container">
                        <input
                          type={showTarjetaNumber ? "text" : "password"}
                          name="numero_tarjeta"
                          value={tarjetaForm.numero_tarjeta}
                          onChange={handleTarjetaChange}
                          placeholder="1234 5678 9012 3456"
                          className="carrito-detal-form-input carrito-detal-tarjeta-input"
                          maxLength="19"
                          required
                        />
                        <button 
                          type="button" 
                          className="carrito-detal-toggle-visibility-btn"
                          onClick={() => setShowTarjetaNumber(!showTarjetaNumber)}
                        >
                          {showTarjetaNumber ? '👁️' : '👁️‍🗨️'}
                        </button>
                        <div className="carrito-detal-tarjeta-icons">
                          {tarjetaForm.tipo_tarjeta === 'visa' && (
                            <img src={visaIcon} alt="Visa" className="carrito-detal-tarjeta-icon" />
                          )}
                          {tarjetaForm.tipo_tarjeta === 'mastercard' && (
                            <img src={mastercardIcon} alt="Mastercard" className="carrito-detal-tarjeta-icon" />
                          )}
                          {tarjetaForm.tipo_tarjeta === 'amex' && (
                            <img src={amexIcon} alt="American Express" className="carrito-detal-tarjeta-icon" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="carrito-detal-form-group">
                      <label>Mes *</label>
                      <input
                        type="text"
                        name="mes_expiracion"
                        value={tarjetaForm.mes_expiracion}
                        onChange={handleTarjetaChange}
                        placeholder="MM"
                        className="carrito-detal-form-input"
                        maxLength="2"
                        required
                      />
                    </div>
                    
                    <div className="carrito-detal-form-group">
                      <label>Año *</label>
                      <input
                        type="text"
                        name="anio_expiracion"
                        value={tarjetaForm.anio_expiracion}
                        onChange={handleTarjetaChange}
                        placeholder="AAAA"
                        className="carrito-detal-form-input"
                        maxLength="4"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="carrito-detal-terminos-tarjeta">
              <div className="carrito-detal-terminos-checkbox">
                <input
                  type="checkbox"
                  id="aceptoTerminos"
                  checked={aceptoTerminos}
                  onChange={(e) => setAceptoTerminos(e.target.checked)}
                  className="carrito-detal-terminos-input"
                />
                <label htmlFor="aceptoTerminos" className="carrito-detal-terminos-label">
                  Acepto los <a href="/terminos" target="_blank">Términos y Condiciones</a> y 
                  la <button 
                    type="button" 
                    className="carrito-detal-politica-link"
                    onClick={() => setShowPoliticaSeguridad(!showPoliticaSeguridad)}
                  >
                    Política de Seguridad
                  </button>
                </label>
              </div>
              
              {showPoliticaSeguridad && (
                <div className="carrito-detal-politica-seguridad-popup">
                  <div className="carrito-detal-politica-header">
                    <h4>🔒 Política de Seguridad de Pagos</h4>
                    <button 
                      className="carrito-detal-close-politica"
                      onClick={() => setShowPoliticaSeguridad(false)}
                    >
                      ×
                    </button>
                  </div>
                  <div className="carrito-detal-politica-content">
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
                    <p className="carrito-detal-politica-nota">
                      Los datos de pago son procesados directamente por nuestro proveedor de pagos certificado PCI DSS Nivel 1.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="carrito-detal-notas-container">
          <h3>Notas adicionales (opcional)</h3>
          <textarea
            value={notasPedido}
            onChange={(e) => setNotasPedido(e.target.value)}
            placeholder="Ej: Entregar en recepción, tocar timbre, instrucciones especiales..."
            rows="4"
            className="carrito-detal-notas-textarea"
          />
          <p className="carrito-detal-notas-hint">Estas notas serán enviadas para la preparación de tu pedido.</p>
        </div>
      </div>
    );
  };

  // ========== PASO 5: RESUMEN FINAL (REDISEÑADO) ==========
  const renderResumenFinal = () => {
    const direccionMostrada = isAuthenticated && useSavedAddress && selectedAddressId 
      ? userDirecciones.find(d => d.id === selectedAddressId)
      : direccionForm;

    const tarjetaMostrada = isAuthenticated && useSavedCard && selectedTarjetaId
      ? userTarjetas.find(t => t.id === selectedTarjetaId)
      : tarjetaForm;

    return (
      <div className="carrito-detal-resumen-final">
        <div className="carrito-detal-resumen-grid">
          {/* Columna Izquierda - Detalle del Pedido */}
          <div className="carrito-detal-resumen-left">
            <div className="carrito-detal-resumen-card">
              {/* Productos */}
              <div className="carrito-detal-resumen-seccion">
                <div className="carrito-detal-resumen-seccion-header">
                  <div className="carrito-detal-resumen-icon-circle">
                    <PiShoppingCart  className="carrito-detal-resumen-section-icon" />
                  </div>
                  <h4>Productos</h4>
                </div>
                <div className="carrito-detal-resumen-productos-list">
                  {carritoItems?.map((item, index) => (
                    <div key={index} className="carrito-detal-resumen-producto">
                      <span>{item.nombre} × {item.cantidad}</span>
                      <span>{formatPrice(item.precio * item.cantidad)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="carrito-detal-resumen-division"></div>

              {/* Información de contacto */}
              <div className="carrito-detal-resumen-seccion">
                <div className="carrito-detal-resumen-seccion-header">
                  <div className="carrito-detal-resumen-icon-circle">
                    <BsPerson className="carrito-detal-resumen-section-icon" />
                  </div>
                  <h4>Información de contacto</h4>
                </div>
                <div className="carrito-detal-resumen-contacto">
                  <p><span className="carrito-detal-resumen-label">Nombre:</span> {infoForm.nombre_completo}</p>
                  <p><span className="carrito-detal-resumen-label">Teléfono:</span> {infoForm.telefono}</p>
                </div>
              </div>

              <div className="carrito-detal-resumen-division"></div>

              {/* Dirección */}
              <div className="carrito-detal-resumen-seccion">
                <div className="carrito-detal-resumen-seccion-header">
                  <div className="carrito-detal-resumen-icon-circle">
                    <BsMap className="carrito-detal-resumen-section-icon" />
                  </div>
                  <h4>Dirección de entrega</h4>
                </div>
                {direccionMostrada && (
                  <div className="carrito-detal-resumen-direccion-info">
                    <p className="carrito-detal-resumen-direccion-calle">
                      {direccionMostrada.calle} #{direccionMostrada.numero_exterior}
                      {direccionMostrada.numero_interior && ` Int. ${direccionMostrada.numero_interior}`}
                    </p>
                    <p>{direccionMostrada.colonia}, {direccionMostrada.ciudad}, {direccionMostrada.estado}</p>
                    <p>CP: {direccionMostrada.codigo_postal}</p>
                    {direccionMostrada.referencias && <p className="carrito-detal-resumen-referencias">Ref: {direccionMostrada.referencias}</p>}
                  </div>
                )}
              </div>

              <div className="carrito-detal-resumen-division"></div>

              {/* Método de pago */}
              <div className="carrito-detal-resumen-seccion">
                <div className="carrito-detal-resumen-seccion-header">
                  <div className="carrito-detal-resumen-icon-circle">
                    <BsCreditCard className="carrito-detal-resumen-section-icon" />
                  </div>
                  <h4>Método de pago</h4>
                </div>
                <div className="carrito-detal-resumen-pago-info">
                  <p>{metodoPago === 'efectivo' ? 'Pago en efectivo' : 'Pago con tarjeta'}</p>
                  {metodoPago === 'tarjeta' && tarjetaMostrada && (
                    <p className="carrito-detal-resumen-tarjeta-info">
                      {getTipoTarjetaLabel(tarjetaMostrada.tipo_tarjeta || tarjetaForm.tipo_tarjeta)} - 
                      {tarjetaMostrada.numero_enmascarado || `**** **** **** ${tarjetaForm.numero_tarjeta?.replace(/\s/g, '').slice(-4) || '1234'}`}
                    </p>
                  )}
                </div>
              </div>

              <div className="carrito-detal-resumen-division"></div>

              {/* Todo Listo */}
              <div className="carrito-detal-resumen-todo-listo">
                <GoShieldCheck  className="carrito-detal-resumen-todo-listo-icon" />
                <div className="carrito-detal-resumen-todo-listo-text">
                  <span className="carrito-detal-resumen-todo-listo-title">¡Todo Listo!</span>
                  <span className="carrito-detal-resumen-todo-listo-sub">Revisa tu información antes de finalizar</span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha */}
          <div className="carrito-detal-resumen-right">
            {/* Cuadro 1: Resumen del pedido */}
            <div className="carrito-detal-resumen-right-card">
              <div className="carrito-detal-resumen-right-card-header">
                <h4>Resumen del pedido</h4>
              </div>
              <div className="carrito-detal-resumen-right-productos">
                {carritoItems?.map((item, index) => (
                  <div key={index} className="carrito-detal-resumen-right-producto">
                    <span>{item.nombre} × {item.cantidad}</span>
                    <span>{formatPrice(item.precio * item.cantidad)}</span>
                  </div>
                ))}
              </div>
              <div className="carrito-detal-resumen-right-division"></div>
              <div className="carrito-detal-resumen-right-envio">
                <span>Envío</span>
                <span className="carrito-detal-resumen-right-envio-gratis">Gratis</span>
              </div>
              <div className="carrito-detal-resumen-right-division"></div>
              <div className="carrito-detal-resumen-right-total-box">
                <span className="carrito-detal-resumen-right-total-label">Total a pagar</span>
                <span className="carrito-detal-resumen-right-total-price">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Cuadro 2: Beneficios */}
            <div className="carrito-detal-resumen-right-card">
              <div className="carrito-detal-resumen-right-beneficio">
                <div className="carrito-detal-resumen-right-beneficio-icon">
                  <BsShieldLockFill />
                </div>
                <div className="carrito-detal-resumen-right-beneficio-text">
                  <span className="carrito-detal-resumen-right-beneficio-title">Compra 100% segura</span>
                  <span className="carrito-detal-resumen-right-beneficio-sub">Tus datos están protegidos con encriptación SSL</span>
                </div>
              </div>
              <div className="carrito-detal-resumen-right-beneficio">
                <div className="carrito-detal-resumen-right-beneficio-icon">
                  <BsLockFill />
                </div>
                <div className="carrito-detal-resumen-right-beneficio-text">
                  <span className="carrito-detal-resumen-right-beneficio-title">Pago protegido</span>
                  <span className="carrito-detal-resumen-right-beneficio-sub">Transacciones seguras con certificación PCI</span>
                </div>
              </div>
              <div className="carrito-detal-resumen-right-beneficio">
                <div className="carrito-detal-resumen-right-beneficio-icon">
                  <BsShieldCheck />
                </div>
                <div className="carrito-detal-resumen-right-beneficio-text">
                  <span className="carrito-detal-resumen-right-beneficio-title">Satisfacción garantizada</span>
                  <span className="carrito-detal-resumen-right-beneficio-sub">Calidad y servicio que respaldan tu compra</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ========== BOTONES DE NAVEGACIÓN ==========
  const handleSiguientePasoLocal = () => {
    if (currentStep === 1) {
      handleSiguientePaso();
      return;
    }
    
    if (currentStep === 2) {
      const camposRequeridos = ['nombre_completo', 'telefono'];
      const camposFaltantes = camposRequeridos.filter(campo => !infoForm[campo]?.trim());
      if (camposFaltantes.length > 0) {
        alert('Por favor completa todos los campos obligatorios');
        return;
      }
      if (!validateTelefono(infoForm.telefono)) {
        alert('Formato de teléfono inválido. Use: 10 dígitos o +52 seguido de 10 dígitos');
        return;
      }
      handleSiguientePaso();
      return;
    }
    
    if (currentStep === 3) {
      if (isAuthenticated && useSavedAddress && selectedAddressId) {
        handleSiguientePaso();
        return;
      }
      const camposRequeridos = ['calle', 'numero_exterior', 'colonia', 'ciudad', 'estado', 'codigo_postal'];
      const camposFaltantes = camposRequeridos.filter(campo => !direccionForm[campo]?.trim());
      if (camposFaltantes.length > 0) {
        alert('Por favor completa todos los campos obligatorios de la dirección');
        return;
      }
      if (!/^\d{5}$/.test(direccionForm.codigo_postal)) {
        alert('El código postal debe tener 5 dígitos');
        return;
      }
      handleSiguientePaso();
      return;
    }
    
    if (currentStep === 4) {
      if (metodoPago === 'tarjeta') {
        if (isAuthenticated && useSavedCard && selectedTarjetaId) {
          const tarjetaSeleccionada = userTarjetas.find(t => t.id === selectedTarjetaId);
          if (!tarjetaSeleccionada) {
            alert('Por favor selecciona una tarjeta');
            return;
          }
        } else {
          const tarjetaErrors = validateTarjeta();
          if (Object.keys(tarjetaErrors).length > 0) {
            alert('Por favor completa correctamente todos los datos de la tarjeta');
            return;
          }
        }
      }
      handleSiguientePaso();
      return;
    }
  };

  const renderNavigation = () => {
    const isLastStep = currentStep === 5;
    const isFirstStep = currentStep === 2;
    const nextLabel = isLastStep ? 'Finalizar Pedido' : 'Continuar';

    if (currentStep === 1) return null;

    return (
      <div className="carrito-detal-checkout-navigation">
        {!isFirstStep && (
          <button 
            onClick={handlePasoAnterior}
            className="carrito-detal-btn-nav back-btn"
          >
            ← Atrás
          </button>
        )}
        
        <button 
          onClick={isLastStep ? handleFinalizarPedido : handleSiguientePasoLocal}
          disabled={isLastStep && procesandoPedido}
          className="carrito-detal-btn-nav next-btn"
          style={{ marginLeft: isFirstStep ? 'auto' : '0' }}
        >
          {isLastStep && procesandoPedido ? (
            <>
              <span className="carrito-detal-spinner-btn"></span>
              Procesando...
            </>
          ) : (
            nextLabel
          )}
        </button>
      </div>
    );
  };

  // ========== RENDER PRINCIPAL ==========
  if (currentStep === 1) {
    return renderResumen();
  }

  return (
    <div className="carrito-detal-checkout-paso">
      {renderSteps()}
      
      {currentStep === 2 && renderPasoInformacion()}
      {currentStep === 3 && renderPasoDireccion()}
      {currentStep === 4 && renderPasoPago()}
      {currentStep === 5 && renderResumenFinal()}
      
      {renderNavigation()}
    </div>
  );
};

export default CarritoDetallePedido;