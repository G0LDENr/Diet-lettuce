import React from 'react';
import '../../css/Carrito/carrito-detalle-pedido.css';

// Íconos
import arrowLeftIcon from '../../img/izquierda.png';
import arrowRightIcon from '../../img/derecha.png';
import addIcon from '../../img/mas.png';
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
  showPoliticaSeguridad,  // ⬅️ RECIBIDA COMO PROP
  showTarjetaNumber,
  notasPedido,
  procesandoPedido,
  handleCardSelect,
  handleTarjetaChange,
  setShowNewCardForm,
  setUseSavedCard,
  setAceptoTerminos,
  setShowPoliticaSeguridad,  // ⬅️ RECIBIDA COMO PROP
  setShowTarjetaNumber,
  setNotasPedido,
}) => {
  const total = calcularTotal();

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

  // ========== INDICADOR DE PASOS ==========
  const renderSteps = () => {
    const steps = [
      { number: 1, label: 'Carrito' },
      { number: 2, label: 'Información' },
      { number: 3, label: 'Dirección' },
      { number: 4, label: 'Pago' }
    ];

    return (
      <div className="carrito-detal-paso-header">
        <div className="carrito-detal-paso-indicador">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <span className={`carrito-detal-paso-numero ${
                step.number < currentStep ? 'completado' : 
                step.number === currentStep ? 'activo' : ''
              }`}>
                {step.number < currentStep ? '✓' : step.number}
              </span>
              {index < steps.length - 1 && (
                <span className={`carrito-detal-paso-linea ${
                  step.number < currentStep ? 'activo' : ''
                }`}></span>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="carrito-detal-paso-titulos">
          {steps.map((step) => (
            <span key={step.number} className={`carrito-detal-paso-titulo ${
              step.number < currentStep ? 'completado' : 
              step.number === currentStep ? 'activo' : ''
            }`}>
              {step.label}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // ========== PASO 2: INFORMACIÓN ==========
  const renderPasoInformacion = () => {
    return (
      <div className="carrito-detal-info-container">
        <h3>Información personal</h3>
        <p className="carrito-detal-info-subtitulo">Ingresa tus datos para la entrega del pedido</p>
        
        <div className="carrito-detal-info-formulario">
          <div className="carrito-detal-form-grid">
            <div className="carrito-detal-form-group">
              <label>Nombre completo *</label>
              {isAuthenticated ? (
                <>
                  <input
                    type="text"
                    name="nombre_completo"
                    value={infoForm.nombre_completo}
                    readOnly
                    className="carrito-detal-form-input carrito-detal-readonly-input"
                    disabled
                  />
                  <div className="carrito-detal-field-info">
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
                  className="carrito-detal-form-input"
                  required
                />
              )}
            </div>
            
            <div className="carrito-detal-form-group">
              <label>Teléfono *</label>
              {isAuthenticated ? (
                <>
                  <input
                    type="tel"
                    name="telefono"
                    value={infoForm.telefono}
                    readOnly
                    className="carrito-detal-form-input carrito-detal-readonly-input"
                    disabled
                  />
                  <div className="carrito-detal-field-info">
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
                    className="carrito-detal-form-input"
                    required
                  />
                  <small className="carrito-detal-form-hint">Formato: 10 dígitos o +52 seguido de 10 dígitos</small>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ========== PASO 3: DIRECCIÓN ==========
  const renderPasoDireccion = () => {
    return (
      <div className="carrito-detal-direccion-container">
        <h3>Dirección de entrega</h3>
        <p className="carrito-detal-direccion-subtitulo">Selecciona o ingresa la dirección donde quieres recibir tu pedido</p>
        
        {isAuthenticated && userDirecciones.length > 0 && !showNewAddressForm && (
          <div className="carrito-detal-form-section">
            <h4>Tus direcciones guardadas</h4>
            {loadingDirecciones ? (
              <div className="carrito-detal-loading-direcciones">
                <div className="carrito-detal-spinner small"></div>
                <p>Cargando direcciones...</p>
              </div>
            ) : (
              <>
                <div className="carrito-detal-direcciones-guardadas">
                  {userDirecciones.map((direccion) => (
                    <div 
                      key={direccion.id} 
                      className={`carrito-detal-direccion-guardada ${selectedAddressId === direccion.id ? 'seleccionada' : ''}`}
                      onClick={() => handleAddressSelect(direccion)}
                    >
                      <div className="carrito-detal-direccion-guardada-header">
                        <div className="carrito-detal-direccion-tipo">
                          <img src={getTipoDireccionIcon(direccion.tipo)} alt={getTipoDireccionLabel(direccion.tipo)} className="carrito-detal-direccion-icon" />
                          <span>{getTipoDireccionLabel(direccion.tipo)}</span>
                          {direccion.predeterminada && (
                            <span className="carrito-detal-direccion-pred">Predeterminada</span>
                          )}
                        </div>
                        <div className="carrito-detal-direccion-radio">
                          <input 
                            type="radio" 
                            name="savedAddress" 
                            checked={selectedAddressId === direccion.id}
                            onChange={() => handleAddressSelect(direccion)}
                          />
                        </div>
                      </div>
                      <div className="carrito-detal-direccion-info">
                        <p><strong>{direccion.calle} #{direccion.numero_exterior}</strong>{direccion.numero_interior ? ` Int. ${direccion.numero_interior}` : ''}</p>
                        <p>{direccion.colonia}, {direccion.ciudad}, {direccion.estado}</p>
                        <p>CP: {direccion.codigo_postal}</p>
                        {direccion.referencias && (
                          <p className="carrito-detal-direccion-referencias">
                            <small>Referencias: {direccion.referencias}</small>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <button 
                  type="button"
                  className="carrito-detal-btn-agregar-direccion"
                  onClick={() => {
                    setShowNewAddressForm(true);
                    setUseSavedAddress(false);
                  }}
                >
                  <img src={addIcon} alt="Agregar" className="carrito-detal-btn-icon-left" />
                  Agregar nueva dirección
                </button>
              </>
            )}
          </div>
        )}

        {(showNewAddressForm || !isAuthenticated || userDirecciones.length === 0) && (
          <div className="carrito-detal-form-section">
            <h4>{isAuthenticated ? 'Nueva dirección' : 'Dirección de entrega'}</h4>
            
            {isAuthenticated && userDirecciones.length > 0 && (
              <button 
                type="button"
                className="carrito-detal-btn-volver-direcciones"
                onClick={() => {
                  setShowNewAddressForm(false);
                  setUseSavedAddress(true);
                }}
              >
                ← Volver a direcciones guardadas
              </button>
            )}
            
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
    );
  };

  // ========== PASO 4: PAGO ==========
  const renderPasoPago = () => {
    return (
      <div className="carrito-detal-pago-container">
        <div className="carrito-detal-pago-metodos">
          <h3>Método de pago</h3>
          
          <div className="carrito-detal-metodos-grid">
            <div 
              className={`carrito-detal-metodo-pago-card ${metodoPago === 'efectivo' ? 'seleccionado' : ''}`}
              onClick={() => setMetodoPago('efectivo')}
            >
              <div className="carrito-detal-metodo-icon">💵</div>
              <div className="carrito-detal-metodo-info">
                <h4>Pago en Efectivo</h4>
                <p>Paga cuando recibas tu pedido</p>
                <div className="carrito-detal-metodo-desc">
                  Entrega el dinero al repartidor al momento de la entrega.
                </div>
              </div>
              <div className="carrito-detal-metodo-radio">
                <input 
                  type="radio" 
                  name="metodoPago" 
                  checked={metodoPago === 'efectivo'}
                  onChange={() => setMetodoPago('efectivo')}
                />
              </div>
            </div>
            
            <div 
              className={`carrito-detal-metodo-pago-card ${metodoPago === 'tarjeta' ? 'seleccionado' : ''}`}
              onClick={() => setMetodoPago('tarjeta')}
            >
              <div className="carrito-detal-metodo-icon">💳</div>
              <div className="carrito-detal-metodo-info">
                <h4>Pago con Tarjeta</h4>
                <p>Pago seguro en línea</p>
                <div className="carrito-detal-metodo-desc">
                  Paga ahora con tarjeta de crédito o débito.
                </div>
              </div>
              <div className="carrito-detal-metodo-radio">
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
          <div className="carrito-detal-tarjeta-form-container">
            <h3>Información de pago con tarjeta</h3>
            
            {isAuthenticated && userTarjetas.length > 0 && !showNewCardForm && (
              <div className="carrito-detal-form-section">
                <h4>Tus tarjetas guardadas</h4>
                {loadingTarjetas ? (
                  <div className="carrito-detal-loading-tarjetas">
                    <div className="carrito-detal-spinner small"></div>
                    <p>Cargando tarjetas...</p>
                  </div>
                ) : (
                  <>
                    <div className="carrito-detal-tarjetas-guardadas">
                      {userTarjetas.map((tarjeta) => (
                        <div 
                          key={tarjeta.id} 
                          className={`carrito-detal-tarjeta-guardada ${selectedTarjetaId === tarjeta.id ? 'seleccionada' : ''}`}
                          onClick={() => handleCardSelect(tarjeta)}
                        >
                          <div className="carrito-detal-tarjeta-guardada-header">
                            <div className="carrito-detal-tarjeta-tipo">
                              <img 
                                src={getTarjetaIcon(tarjeta.tipo_tarjeta)} 
                                alt={tarjeta.tipo_tarjeta} 
                                className="carrito-detal-tarjeta-icon-small"
                              />
                              <span>{getTipoTarjetaLabel(tarjeta.tipo_tarjeta)}</span>
                              {tarjeta.predeterminada && (
                                <span className="carrito-detal-tarjeta-predeterminada-badge">
                                  <img src={estrellaIcon} alt="Predeterminada" className="carrito-detal-estrella-icon" />
                                  Principal
                                </span>
                              )}
                            </div>
                            <div className="carrito-detal-tarjeta-radio">
                              <input 
                                type="radio" 
                                name="savedCard" 
                                checked={selectedTarjetaId === tarjeta.id}
                                onChange={() => handleCardSelect(tarjeta)}
                              />
                            </div>
                          </div>
                          <div className="carrito-detal-tarjeta-info">
                            <p className="carrito-detal-tarjeta-numero">{formatearNumeroTarjeta(tarjeta.numero_enmascarado)}</p>
                            <p className="carrito-detal-tarjeta-titular">{tarjeta.nombre_titular}</p>
                            <p className="carrito-detal-tarjeta-expiracion">Exp: {tarjeta.mes_expiracion}/{tarjeta.anio_expiracion}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <button 
                      type="button"
                      className="carrito-detal-btn-agregar-tarjeta"
                      onClick={() => {
                        setShowNewCardForm(true);
                        setUseSavedCard(false);
                      }}
                    >
                      <img src={addIcon} alt="Agregar" className="carrito-detal-btn-icon-left" />
                      Usar otra tarjeta
                    </button>
                  </>
                )}
              </div>
            )}

            {(showNewCardForm || !isAuthenticated || userTarjetas.length === 0) && (
              <div className="carrito-detal-form-section">
                <h4>{isAuthenticated ? 'Nueva tarjeta' : 'Datos de la tarjeta'}</h4>
                
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
            
            <div className="carrito-detal-info-seguridad">
              <div className="carrito-detal-seguridad-icon">🔒</div>
              <div className="carrito-detal-seguridad-text">
                <p><strong>Pago 100% seguro</strong></p>
                <p>Tus datos están protegidos con encriptación SSL de 256 bits. Nunca almacenamos información sensible de tu tarjeta.</p>
              </div>
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

  // ========== RESUMEN FINAL ==========
  const renderResumenFinal = () => {
    return (
      <div className="carrito-detal-resumen-final">
        <div className="carrito-detal-resumen-final-header">
          <h3>Resumen del Pedido</h3>
        </div>
        
        <div className="carrito-detal-resumen-final-detalle">
          <div className="carrito-detal-resumen-row">
            <span>Suplementos ({totalCarritoItems})</span>
            <span>{formatPrice(total)}</span>
          </div>
          
          <div className="carrito-detal-resumen-row envio">
            <span>Envío</span>
            <span className="carrito-detal-envio-gratis">Gratis</span>
          </div>
          
          <div className="carrito-detal-resumen-row">
            <span>Método de pago</span>
            <span className="carrito-detal-metodo-pago-tag">
              {metodoPago === 'efectivo' ? '💵 Efectivo' : '💳 Tarjeta'}
            </span>
          </div>
          
          <div className="carrito-detal-resumen-separador"></div>
          
          <div className="carrito-detal-resumen-row total">
            <strong>Total</strong>
            <strong className="carrito-detal-total-final">{formatPrice(total)}</strong>
          </div>
        </div>
        
        <div className="carrito-detal-resumen-final-acciones">
          <button 
            onClick={handlePasoAnterior}
            className="carrito-detal-btn-final prev-btn"
          >
            <img src={arrowLeftIcon} alt="Anterior" className="carrito-detal-btn-icon" />
            Volver a Dirección
          </button>
          <button 
            onClick={handleFinalizarPedido}
            disabled={procesandoPedido}
            className="carrito-detal-btn-final confirm-btn"
          >
            {procesandoPedido ? (
              <>
                <span className="carrito-detal-spinner-btn"></span>
                Procesando...
              </>
            ) : (
              `Finalizar Pedido - ${formatPrice(total)}`
            )}
          </button>
        </div>
        
        <div className="carrito-detal-terminos-info">
          <p>
            Al finalizar, aceptas nuestros <a href="/terminos" target="_blank">Términos y Condiciones</a> y nuestra <a href="/privacidad" target="_blank">Política de Privacidad</a>.
          </p>
        </div>
      </div>
    );
  };

  // ========== BOTONES DE NAVEGACIÓN ==========
  const renderNavigation = () => {
    const isLastStep = currentStep === 4;
    const nextLabel = isLastStep ? 'Finalizar Pedido' : 'Continuar';

    return (
      <div className="carrito-detal-checkout-navigation">
        <button 
          onClick={handlePasoAnterior}
          className="carrito-detal-btn-nav prev-btn"
        >
          <img src={arrowLeftIcon} alt="Anterior" className="carrito-detal-btn-icon" />
          {currentStep === 2 ? 'Volver al Carrito' : 
           currentStep === 3 ? 'Volver a Información' : 
           'Volver a Dirección'}
        </button>
        <button 
          onClick={isLastStep ? handleFinalizarPedido : handleSiguientePaso}
          disabled={isLastStep && procesandoPedido}
          className="carrito-detal-btn-nav next-btn"
        >
          {isLastStep && procesandoPedido ? (
            <>
              <span className="carrito-detal-spinner-btn"></span>
              Procesando...
            </>
          ) : (
            <>
              {nextLabel}
              <img src={arrowRightIcon} alt="Siguiente" className="carrito-detal-btn-icon" />
            </>
          )}
        </button>
      </div>
    );
  };

  // ========== RENDER PRINCIPAL ==========
  return (
    <div className="carrito-detal-checkout-paso">
      {renderSteps()}
      
      {currentStep === 2 && renderPasoInformacion()}
      {currentStep === 3 && renderPasoDireccion()}
      {currentStep === 4 && (
        <>
          {renderPasoPago()}
          {renderResumenFinal()}
        </>
      )}
      
      {renderNavigation()}
    </div>
  );
};

export default CarritoDetallePedido;