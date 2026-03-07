import React, { useState } from 'react';
import '../../css/Users/create-user.css';

const CreateUserForm = ({ onClose, onUserCreated }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showDireccionForm, setShowDireccionForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Datos personales del usuario
  const [userData, setUserData] = useState({
    nombre: '',
    correo: '',
    contraseña: '',
    confirmarContraseña: '',
    telefono: '',
    sexo: '',
    rol: 2
  });
  
  // Lista de direcciones
  const [direcciones, setDirecciones] = useState([]);
  
  // Datos de la dirección actual (para el formulario)
  const [direccionActual, setDireccionActual] = useState({
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

  const [errors, setErrors] = useState({});

  // Validar datos personales
  const validateUserData = () => {
    const newErrors = {};

    if (!userData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!userData.correo.trim()) {
      newErrors.correo = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(userData.correo)) {
      newErrors.correo = 'Correo inválido';
    }

    if (!userData.contraseña) {
      newErrors.contraseña = 'La contraseña es requerida';
    } else if (userData.contraseña.length < 6) {
      newErrors.contraseña = 'Mínimo 6 caracteres';
    }

    if (userData.contraseña !== userData.confirmarContraseña) {
      newErrors.confirmarContraseña = 'Las contraseñas no coinciden';
    }

    if (userData.telefono && !/^\d{10}$/.test(userData.telefono)) {
      newErrors.telefono = 'Teléfono inválido (10 dígitos)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validar dirección
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

  // Agregar dirección a la lista
  const handleAddDireccion = () => {
    if (validateDireccion()) {
      // Si es la primera dirección, marcarla como predeterminada automáticamente
      const nuevaDireccion = {
        ...direccionActual,
        predeterminada: direcciones.length === 0 ? true : direccionActual.predeterminada
      };

      // Si se marca como predeterminada, quitar predeterminada de las demás
      let direccionesActualizadas = [...direcciones];
      if (nuevaDireccion.predeterminada) {
        direccionesActualizadas = direccionesActualizadas.map(dir => ({
          ...dir,
          predeterminada: false
        }));
      }

      setDirecciones([...direccionesActualizadas, nuevaDireccion]);
      setShowDireccionForm(false);
      
      // Resetear formulario de dirección
      setDireccionActual({
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

  // Eliminar dirección
  const handleRemoveDireccion = (index) => {
    const nuevasDirecciones = direcciones.filter((_, i) => i !== index);
    
    // Si eliminamos la dirección predeterminada y quedan direcciones,
    // marcar la primera como predeterminada
    if (direcciones[index].predeterminada && nuevasDirecciones.length > 0) {
      nuevasDirecciones[0].predeterminada = true;
    }
    
    setDirecciones(nuevasDirecciones);
  };

  // Marcar dirección como predeterminada
  const handleSetPredeterminada = (index) => {
    const nuevasDirecciones = direcciones.map((dir, i) => ({
      ...dir,
      predeterminada: i === index
    }));
    setDirecciones(nuevasDirecciones);
  };

  // Continuar al paso 2 (direcciones)
  const handleNextStep = () => {
    setErrorMessage('');
    if (validateUserData()) {
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

  // Limpiar mensajes
  const clearMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  // Enviar formulario completo - CORREGIDO para usar /add_user
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      // Validar que haya al menos una dirección
      if (direcciones.length === 0) {
        setErrorMessage('⚠️ Debes agregar al menos una dirección');
        setLoading(false);
        return;
      }

      // Encontrar la dirección predeterminada (el backend solo acepta una dirección)
      const direccionPredeterminada = direcciones.find(d => d.predeterminada) || direcciones[0];

      // Preparar datos para el backend - usando direccion (singular) como espera el backend
      const requestData = {
        name: userData.nombre,
        email: userData.correo,
        password: userData.contraseña,
        role: parseInt(userData.rol),
        telefono: userData.telefono || '',
        sexo: userData.sexo || '',
        direccion: {  // Importante: es "direccion" en singular, no "direcciones"
          calle: direccionPredeterminada.calle,
          numero_exterior: direccionPredeterminada.numero_exterior,
          numero_interior: direccionPredeterminada.numero_interior || '',
          colonia: direccionPredeterminada.colonia,
          ciudad: direccionPredeterminada.ciudad,
          estado: direccionPredeterminada.estado,
          codigo_postal: direccionPredeterminada.codigo_postal,
          referencias: direccionPredeterminada.referencias || '',
          tipo: direccionPredeterminada.tipo,
          predeterminada: true
        }
      };

      console.log('Enviando datos:', requestData);

      // Usar el endpoint /add_user que SÍ existe y NO requiere token
      const response = await fetch('http://127.0.0.1:5000/user/add_user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'  // Sin token porque es público
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (response.ok) {
        // Mostrar mensaje de éxito
        setSuccessMessage('¡Usuario creado exitosamente!');
        
        // Esperar 2 segundos y luego cerrar el modal
        setTimeout(() => {
          onUserCreated();
          onClose();
        }, 2000);
      } else {
        setErrorMessage(`❌ Error: ${data.msg || 'Error al crear usuario'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('❌ Error de conexión al crear usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-user-form">
      {/* Mensajes de éxito/error */}
      {successMessage && (
        <div className="create-success-message">
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="create-error-message-box">
          {errorMessage}
        </div>
      )}

      {/* Indicador de pasos (solo visible si no hay mensaje de éxito) */}
      {!successMessage && (
        <div className="create-form-steps">
          <div className={`create-step-indicator ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <span className="create-step-number">1</span>
            <span className="create-step-label">Datos Personales</span>
          </div>
          <div className="create-step-line"></div>
          <div className={`create-step-indicator ${step >= 2 ? 'active' : ''}`}>
            <span className="create-step-number">2</span>
            <span className="create-step-label">Direcciones</span>
          </div>
        </div>
      )}

      {/* PASO 1: DATOS PERSONALES */}
      {step === 1 && !successMessage && (
        <>
          <div className="create-form-group">
            <label className="create-form-label">
              Nombre completo <span className="create-required">*</span>
            </label>
            <input
              type="text"
              className={`create-form-control ${errors.nombre ? 'create-input-error' : ''}`}
              value={userData.nombre}
              onChange={(e) => {
                setUserData({...userData, nombre: e.target.value});
                clearMessages();
              }}
              placeholder="Ej: Juan Pérez"
              maxLength="100"
            />
            {errors.nombre && <span className="create-error-message">{errors.nombre}</span>}
          </div>

          <div className="create-form-group">
            <label className="create-form-label">
              Correo electrónico <span className="create-required">*</span>
            </label>
            <input
              type="email"
              className={`create-form-control ${errors.correo ? 'create-input-error' : ''}`}
              value={userData.correo}
              onChange={(e) => {
                setUserData({...userData, correo: e.target.value});
                clearMessages();
              }}
              placeholder="Ej: correo@ejemplo.com"
              maxLength="100"
            />
            {errors.correo && <span className="create-error-message">{errors.correo}</span>}
          </div>

          <div className="create-form-row">
            <div className="create-form-group create-half">
              <label className="create-form-label">
                Contraseña <span className="create-required">*</span>
              </label>
              <input
                type="password"
                className={`create-form-control ${errors.contraseña ? 'create-input-error' : ''}`}
                value={userData.contraseña}
                onChange={(e) => {
                  setUserData({...userData, contraseña: e.target.value});
                  clearMessages();
                }}
                placeholder="Mínimo 6 caracteres"
                maxLength="50"
              />
              {errors.contraseña && <span className="create-error-message">{errors.contraseña}</span>}
            </div>

            <div className="create-form-group create-half">
              <label className="create-form-label">
                Confirmar contraseña <span className="create-required">*</span>
              </label>
              <input
                type="password"
                className={`create-form-control ${errors.confirmarContraseña ? 'create-input-error' : ''}`}
                value={userData.confirmarContraseña}
                onChange={(e) => {
                  setUserData({...userData, confirmarContraseña: e.target.value});
                  clearMessages();
                }}
                placeholder="Repite la contraseña"
                maxLength="50"
              />
              {errors.confirmarContraseña && <span className="create-error-message">{errors.confirmarContraseña}</span>}
            </div>
          </div>

          <div className="create-form-row">
            <div className="create-form-group create-half">
              <label className="create-form-label">Teléfono</label>
              <input
                type="tel"
                className={`create-form-control ${errors.telefono ? 'create-input-error' : ''}`}
                value={userData.telefono}
                onChange={(e) => {
                  setUserData({...userData, telefono: e.target.value.replace(/\D/g, '').slice(0, 10)});
                  clearMessages();
                }}
                placeholder="10 dígitos"
                maxLength="10"
              />
              {errors.telefono && <span className="create-error-message">{errors.telefono}</span>}
            </div>

            <div className="create-form-group create-half">
              <label className="create-form-label">Sexo</label>
              <select
                className="create-select"
                value={userData.sexo}
                onChange={(e) => {
                  setUserData({...userData, sexo: e.target.value});
                  clearMessages();
                }}
              >
                <option value="">Seleccionar</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>
          </div>

          <div className="create-form-group">
            <label className="create-form-label">Rol</label>
            <select
              className="create-select"
              value={userData.rol}
              onChange={(e) => {
                setUserData({...userData, rol: parseInt(e.target.value)});
                clearMessages();
              }}
            >
              <option value="2">Usuario</option>
              <option value="1">Administrador</option>
            </select>
          </div>

          <div className="create-form-actions">
            <button type="button" className="create-btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button 
              type="button" 
              className="create-btn-next"
              onClick={handleNextStep}
            >
              Siguiente: Direcciones →
            </button>
          </div>
        </>
      )}

      {/* PASO 2: DIRECCIONES */}
      {step === 2 && !successMessage && (
        <>
          <div className="create-direcciones-section">
            <div className="create-direcciones-header">
              <h4 className="create-direcciones-title">Direcciones del usuario</h4>
              {!showDireccionForm && (
                <button 
                  type="button"
                  className="create-btn-add-direccion"
                  onClick={() => {
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
              <div className="create-direcciones-list">
                {direcciones.map((dir, index) => (
                  <div key={index} className={`create-direccion-item ${dir.predeterminada ? 'predeterminada' : ''}`}>
                    <div className="create-direccion-header">
                      <span className="create-direccion-tipo">{dir.tipo}</span>
                      {dir.predeterminada && (
                        <span className="create-predeterminada-badge">Predeterminada</span>
                      )}
                    </div>
                    <div className="create-direccion-contenido">
                      <p><strong>{dir.calle} #{dir.numero_exterior}</strong></p>
                      {dir.numero_interior && <p>Int. {dir.numero_interior}</p>}
                      <p>{dir.colonia}, {dir.ciudad}, {dir.estado}</p>
                      <p>CP: {dir.codigo_postal}</p>
                      {dir.referencias && <p className="create-referencias">{dir.referencias}</p>}
                    </div>
                    <div className="create-direccion-acciones">
                      {!dir.predeterminada && direcciones.length > 1 && (
                        <button
                          type="button"
                          className="create-btn-set-predeterminada"
                          onClick={() => handleSetPredeterminada(index)}
                          title="Marcar como predeterminada"
                        >
                          ★
                        </button>
                      )}
                      <button
                        type="button"
                        className="create-btn-remove-direccion"
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
              <div className="create-direccion-form">
                <h5 className="create-form-subtitle">Nueva dirección</h5>
                
                <div className="create-form-group">
                  <label className="create-form-label">
                    Tipo de dirección <span className="create-required">*</span>
                  </label>
                  <select
                    className="create-select"
                    value={direccionActual.tipo}
                    onChange={(e) => setDireccionActual({...direccionActual, tipo: e.target.value})}
                  >
                    <option value="casa">Casa</option>
                    <option value="trabajo">Trabajo</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div className="create-form-group">
                  <label className="create-form-label">
                    Calle <span className="create-required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`create-form-control ${errors.calle ? 'create-input-error' : ''}`}
                    value={direccionActual.calle}
                    onChange={(e) => setDireccionActual({...direccionActual, calle: e.target.value})}
                    placeholder="Ej: Av. Principal"
                  />
                  {errors.calle && <span className="create-error-message">{errors.calle}</span>}
                </div>

                <div className="create-form-row">
                  <div className="create-form-group create-half">
                    <label className="create-form-label">
                      Número exterior <span className="create-required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`create-form-control ${errors.numero_exterior ? 'create-input-error' : ''}`}
                      value={direccionActual.numero_exterior}
                      onChange={(e) => setDireccionActual({...direccionActual, numero_exterior: e.target.value})}
                      placeholder="Ej: 123"
                    />
                    {errors.numero_exterior && <span className="create-error-message">{errors.numero_exterior}</span>}
                  </div>

                  <div className="create-form-group create-half">
                    <label className="create-form-label">Número interior</label>
                    <input
                      type="text"
                      className="create-form-control"
                      value={direccionActual.numero_interior}
                      onChange={(e) => setDireccionActual({...direccionActual, numero_interior: e.target.value})}
                      placeholder="Ej: A, 2B (opcional)"
                    />
                  </div>
                </div>

                <div className="create-form-group">
                  <label className="create-form-label">
                    Colonia <span className="create-required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`create-form-control ${errors.colonia ? 'create-input-error' : ''}`}
                    value={direccionActual.colonia}
                    onChange={(e) => setDireccionActual({...direccionActual, colonia: e.target.value})}
                    placeholder="Ej: Centro"
                  />
                  {errors.colonia && <span className="create-error-message">{errors.colonia}</span>}
                </div>

                <div className="create-form-row">
                  <div className="create-form-group create-half">
                    <label className="create-form-label">
                      Ciudad <span className="create-required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`create-form-control ${errors.ciudad ? 'create-input-error' : ''}`}
                      value={direccionActual.ciudad}
                      onChange={(e) => setDireccionActual({...direccionActual, ciudad: e.target.value})}
                      placeholder="Ej: Ciudad de México"
                    />
                    {errors.ciudad && <span className="create-error-message">{errors.ciudad}</span>}
                  </div>

                  <div className="create-form-group create-half">
                    <label className="create-form-label">
                      Estado <span className="create-required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`create-form-control ${errors.estado ? 'create-input-error' : ''}`}
                      value={direccionActual.estado}
                      onChange={(e) => setDireccionActual({...direccionActual, estado: e.target.value})}
                      placeholder="Ej: CDMX"
                    />
                    {errors.estado && <span className="create-error-message">{errors.estado}</span>}
                  </div>
                </div>

                <div className="create-form-group">
                  <label className="create-form-label">
                    Código postal <span className="create-required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`create-form-control ${errors.codigo_postal ? 'create-input-error' : ''}`}
                    value={direccionActual.codigo_postal}
                    onChange={(e) => setDireccionActual({...direccionActual, codigo_postal: e.target.value.replace(/\D/g, '').slice(0, 5)})}
                    placeholder="5 dígitos"
                    maxLength="5"
                  />
                  {errors.codigo_postal && <span className="create-error-message">{errors.codigo_postal}</span>}
                </div>

                <div className="create-form-group">
                  <label className="create-form-label">Referencias</label>
                  <textarea
                    className="create-form-control"
                    value={direccionActual.referencias}
                    onChange={(e) => setDireccionActual({...direccionActual, referencias: e.target.value})}
                    placeholder="Ej: Entre calles, puntos de referencia, etc."
                    rows="3"
                  />
                </div>

                <div className="create-checkbox-group">
                  <label className="create-checkbox-label">
                    <input
                      type="checkbox"
                      checked={direccionActual.predeterminada}
                      onChange={(e) => setDireccionActual({...direccionActual, predeterminada: e.target.checked})}
                      disabled={direcciones.length === 0}
                    />
                    <span>Marcar como dirección predeterminada</span>
                  </label>
                </div>

                <div className="create-direccion-form-actions">
                  <button
                    type="button"
                    className="create-btn-cancel-small"
                    onClick={() => {
                      setShowDireccionForm(false);
                      setDireccionActual({
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
                    className="create-btn-save-direccion"
                    onClick={handleAddDireccion}
                  >
                    Guardar dirección
                  </button>
                </div>
              </div>
            )}

            {direcciones.length === 0 && !showDireccionForm && (
              <div className="create-no-direcciones">
                <p>No hay direcciones agregadas</p>
                <p className="create-no-direcciones-sub">Haz clic en "Agregar dirección" para comenzar</p>
              </div>
            )}
          </div>

          <div className="create-form-actions-step">
            <button type="button" className="create-btn-back" onClick={handlePrevStep}>
              ← Atrás
            </button>
            <button 
              type="button" 
              className="create-btn-submit"
              onClick={handleSubmit}
              disabled={loading || direcciones.length === 0}
            >
              {loading ? 'Creando...' : 'Crear Usuario'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CreateUserForm;