import React, { useState, useEffect } from 'react';
import { useConfig } from '../../context/config';
import '../../css/Users/edit-user.css';

const EditUserForm = ({ user, onClose, onUserUpdated }) => {
  const { darkMode } = useConfig();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showDireccionForm, setShowDireccionForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [changePassword, setChangePassword] = useState(false);
  
  // Datos personales del usuario
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    rol: '2',
    sexo: ''
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

  const [errors, setErrors] = useState({});
  const [editingDireccionIndex, setEditingDireccionIndex] = useState(null);

  // Cargar datos del usuario cuando el componente se monta
  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        correo: user.correo || '',
        telefono: user.telefono || '',
        password: '',
        confirmPassword: '',
        rol: user.rol?.toString() || '2',
        sexo: user.sexo || ''
      });

      // Cargar direcciones si existen
      if (user.direcciones && user.direcciones.length > 0) {
        setDirecciones(user.direcciones);
      } else if (user.direccion) {
        // Si solo hay una dirección simple, crear una dirección a partir de ella
        setDirecciones([{
          id: null,
          calle: user.direccion.split(',')[0] || '',
          numero_exterior: '',
          numero_interior: '',
          colonia: user.direccion.split(',')[1] || '',
          ciudad: user.direccion.split(',')[2] || '',
          estado: user.direccion.split(',')[3] || '',
          codigo_postal: '',
          referencias: '',
          tipo: 'casa',
          predeterminada: true
        }]);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    clearMessages();
  };

  const handlePasswordToggle = () => {
    setChangePassword(!changePassword);
    // Limpiar campos de contraseña cuando se desactiva
    if (!changePassword) {
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
      setErrors(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
    }
  };

  // Limpiar mensajes
  const clearMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  // Validar datos personales
  const validateUserData = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      newErrors.correo = 'El correo no es válido';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    } else if (!/^\d{10}$/.test(formData.telefono)) {
      newErrors.telefono = 'Teléfono inválido (10 dígitos)';
    }

    if (!formData.sexo) {
      newErrors.sexo = 'El sexo es obligatorio';
    }

    // Validar contraseñas solo si se activó el cambio
    if (changePassword) {
      if (!formData.password) {
        newErrors.password = 'La contraseña es obligatoria';
      } else if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
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

      let direccionesActualizadas = [...direcciones];
      
      if (editingDireccionIndex !== null) {
        // Editar dirección existente
        direccionesActualizadas[editingDireccionIndex] = nuevaDireccion;
        setEditingDireccionIndex(null);
      } else {
        // Agregar nueva dirección
        direccionesActualizadas = [...direcciones, nuevaDireccion];
      }

      // Si se marca como predeterminada, quitar predeterminada de las demás
      if (nuevaDireccion.predeterminada) {
        direccionesActualizadas = direccionesActualizadas.map((dir, idx) => ({
          ...dir,
          predeterminada: idx === (editingDireccionIndex !== null ? editingDireccionIndex : direcciones.length)
        }));
      }

      setDirecciones(direccionesActualizadas);
      setShowDireccionForm(false);
      
      // Resetear formulario de dirección
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

  // Editar dirección
  const handleEditDireccion = (index) => {
    setDireccionActual(direcciones[index]);
    setEditingDireccionIndex(index);
    setShowDireccionForm(true);
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
      const token = localStorage.getItem('token');
      
      const userData = {
        name: formData.nombre,
        email: formData.correo,
        telefono: formData.telefono,
        role: parseInt(formData.rol),
        sexo: formData.sexo,
        direcciones: direcciones.map(dir => ({
          id: dir.id,
          calle: dir.calle,
          numero_exterior: dir.numero_exterior,
          numero_interior: dir.numero_interior || '',
          colonia: dir.colonia,
          ciudad: dir.ciudad,
          estado: dir.estado,
          codigo_postal: dir.codigo_postal,
          referencias: dir.referencias || '',
          tipo: dir.tipo,
          predeterminada: dir.predeterminada
        }))
      };

      // Solo incluir password si se activó el cambio
      if (changePassword && formData.password) {
        userData.password = formData.password;
      }

      console.log('Actualizando usuario:', user.id, userData);

      const response = await fetch(`http://127.0.0.1:5000/user/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      console.log('Respuesta status:', response.status);
      
      const responseText = await response.text();
      console.log('Respuesta texto:', responseText);

      if (response.ok) {
        try {
          const result = JSON.parse(responseText);
          // Mostrar mensaje de éxito
          setSuccessMessage('Usuario actualizado exitosamente');
          
          // Esperar 2 segundos antes de cerrar el modal y actualizar la lista
          setTimeout(() => {
            if (onUserUpdated) {
              onUserUpdated(result.user);
            }
            onClose();
          }, 2000);
          
        } catch (parseError) {
          console.error('Error parseando JSON:', parseError);
          setErrorMessage('Usuario actualizado, pero hubo un error procesando la respuesta');
        }
      } else {
        let errorMsg = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMsg = errorData.msg || errorMsg;
        } catch (e) {
          errorMsg = responseText || errorMsg;
        }
        setErrorMessage(`❌ Error al actualizar usuario: ${errorMsg}`);
      }

    } catch (error) {
      console.error('Error de conexión:', error);
      setErrorMessage('❌ Error de conexión al actualizar usuario: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!user) {
    return null;
  }

  return (
    <div className={`edit-user-form ${darkMode ? 'edit-user-form-dark-mode' : ''}`}>
      {/* Mensajes de éxito/error */}
      {successMessage && (
        <div className="edit-user-success-message">
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="edit-error-message-box">
          {errorMessage}
        </div>
      )}

      {/* Indicador de pasos (solo visible si no hay mensaje de éxito) */}
      {!successMessage && (
        <div className="edit-form-steps">
          <div className={`edit-step-indicator ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <span className="edit-step-number">1</span>
            <span className="edit-step-label">Datos Personales</span>
          </div>
          <div className="edit-step-line"></div>
          <div className={`edit-step-indicator ${step >= 2 ? 'active' : ''}`}>
            <span className="edit-step-number">2</span>
            <span className="edit-step-label">Direcciones</span>
          </div>
        </div>
      )}

      {/* PASO 1: DATOS PERSONALES */}
      {step === 1 && !successMessage && (
        <form className="edit-user-form-form" onSubmit={(e) => e.preventDefault()}>
          {/* Información del usuario */}
          <div className="edit-user-info">
            <h4>Editando usuario ID: {user.id} - {user.nombre}</h4>
          </div>

          {/* Nombre completo */}
          <div className="edit-form-row">
            <div className="edit-form-group edit-form-group-full-width">
              <label htmlFor="edit-nombre">Nombre completo *</label>
              <input
                type="text"
                id="edit-nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={errors.nombre ? 'edit-input-error' : ''}
                placeholder="Ingresa el nombre completo"
              />
              {errors.nombre && <span className="edit-error-message">{errors.nombre}</span>}
            </div>
          </div>

          {/* Correo electrónico */}
          <div className="edit-form-row">
            <div className="edit-form-group edit-form-group-full-width">
              <label htmlFor="edit-correo">Correo electrónico *</label>
              <input
                type="email"
                id="edit-correo"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                className={errors.correo ? 'edit-input-error' : ''}
                placeholder="Ingresa el correo electrónico"
              />
              {errors.correo && <span className="edit-error-message">{errors.correo}</span>}
            </div>
          </div>

          {/* Teléfono */}
          <div className="edit-form-row">
            <div className="edit-form-group edit-form-group-full-width">
              <label htmlFor="edit-telefono">Teléfono *</label>
              <input
                type="tel"
                id="edit-telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className={errors.telefono ? 'edit-input-error' : ''}
                placeholder="Ingresa el número de teléfono"
              />
              {errors.telefono && <span className="edit-error-message">{errors.telefono}</span>}
            </div>
          </div>

          {/* Opción para cambiar contraseña */}
          <div className="edit-password-toggle">
            <label className="edit-toggle-label">
              <input
                type="checkbox"
                checked={changePassword}
                onChange={handlePasswordToggle}
                className="edit-toggle-input"
              />
              <span className="edit-toggle-slider"></span>
              Cambiar contraseña
            </label>
          </div>

          {/* Campos de contraseña - solo se muestran si está activado */}
          {changePassword && (
            <div className="edit-form-row">
              <div className="edit-password-fields">
                <div className="edit-form-group">
                  <label htmlFor="edit-password">Nueva contraseña *</label>
                  <input
                    type="password"
                    id="edit-password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? 'edit-input-error' : ''}
                    placeholder="Ingresa la nueva contraseña"
                  />
                  {errors.password && <span className="edit-error-message">{errors.password}</span>}
                </div>

                <div className="edit-form-group">
                  <label htmlFor="edit-confirmPassword">Confirmar contraseña *</label>
                  <input
                    type="password"
                    id="edit-confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={errors.confirmPassword ? 'edit-input-error' : ''}
                    placeholder="Confirma la nueva contraseña"
                  />
                  {errors.confirmPassword && <span className="edit-error-message">{errors.confirmPassword}</span>}
                </div>
              </div>
            </div>
          )}

          {/* Rol y Sexo - en la misma fila */}
          <div className="edit-form-row">
            <div className="edit-role-sex-fields">
              <div className="edit-form-group">
                <label htmlFor="edit-rol">Rol *</label>
                <select
                  id="edit-rol"
                  name="rol"
                  value={formData.rol}
                  onChange={handleChange}
                  className="edit-select"
                >
                  <option value="2">Usuario</option>
                  <option value="1">Administrador</option>
                </select>
              </div>

              <div className="edit-form-group">
                <label htmlFor="edit-sexo">Sexo *</label>
                <select
                  id="edit-sexo"
                  name="sexo"
                  value={formData.sexo}
                  onChange={handleChange}
                  className={errors.sexo ? 'edit-select-error' : 'edit-select'}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
                {errors.sexo && <span className="edit-error-message">{errors.sexo}</span>}
              </div>
            </div>
          </div>

          {/* Botones de navegación */}
          <div className="edit-form-actions-step">
            <button 
              type="button" 
              className="edit-btn-cancel"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="button" 
              className="edit-btn-next"
              onClick={handleNextStep}
            >
              Siguiente: Direcciones →
            </button>
          </div>
        </form>
      )}

      {/* PASO 2: DIRECCIONES */}
      {step === 2 && !successMessage && (
        <div className="edit-user-form-form">
          <div className="edit-direcciones-section">
            <div className="edit-direcciones-header">
              <h4 className="edit-direcciones-title">Direcciones del usuario</h4>
              {!showDireccionForm && (
                <button 
                  type="button"
                  className="edit-btn-add-direccion"
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
              <div className="edit-direcciones-list">
                {direcciones.map((dir, index) => (
                  <div key={index} className={`edit-direccion-item ${dir.predeterminada ? 'predeterminada' : ''}`}>
                    <div className="edit-direccion-header">
                      <span className="edit-direccion-tipo">{dir.tipo}</span>
                      {dir.predeterminada && (
                        <span className="edit-predeterminada-badge">Predeterminada</span>
                      )}
                    </div>
                    <div className="edit-direccion-contenido">
                      <p><strong>{dir.calle} #{dir.numero_exterior}</strong></p>
                      {dir.numero_interior && <p>Int. {dir.numero_interior}</p>}
                      <p>{dir.colonia}, {dir.ciudad}, {dir.estado}</p>
                      <p>CP: {dir.codigo_postal}</p>
                      {dir.referencias && <p className="edit-referencias">{dir.referencias}</p>}
                    </div>
                    <div className="edit-direccion-acciones">
                      <button
                        type="button"
                        className="edit-btn-edit-direccion"
                        onClick={() => handleEditDireccion(index)}
                        title="Editar dirección"
                      >
                        ✎
                      </button>
                      {!dir.predeterminada && direcciones.length > 1 && (
                        <button
                          type="button"
                          className="edit-btn-set-predeterminada"
                          onClick={() => handleSetPredeterminada(index)}
                          title="Marcar como predeterminada"
                        >
                          ★
                        </button>
                      )}
                      <button
                        type="button"
                        className="edit-btn-remove-direccion"
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
              <div className="edit-direccion-form">
                <h5 className="edit-form-subtitle">
                  {editingDireccionIndex !== null ? 'Editar dirección' : 'Nueva dirección'}
                </h5>
                
                <div className="edit-form-group">
                  <label className="edit-form-label">
                    Tipo de dirección <span className="edit-required">*</span>
                  </label>
                  <select
                    className="edit-select"
                    value={direccionActual.tipo}
                    onChange={(e) => setDireccionActual({...direccionActual, tipo: e.target.value})}
                  >
                    <option value="casa">Casa</option>
                    <option value="trabajo">Trabajo</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div className="edit-form-group">
                  <label className="edit-form-label">
                    Calle <span className="edit-required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`edit-form-control ${errors.calle ? 'edit-input-error' : ''}`}
                    value={direccionActual.calle}
                    onChange={(e) => setDireccionActual({...direccionActual, calle: e.target.value})}
                    placeholder="Ej: Av. Principal"
                  />
                  {errors.calle && <span className="edit-error-message">{errors.calle}</span>}
                </div>

                <div className="edit-form-row">
                  <div className="edit-form-group edit-half">
                    <label className="edit-form-label">
                      Número exterior <span className="edit-required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`edit-form-control ${errors.numero_exterior ? 'edit-input-error' : ''}`}
                      value={direccionActual.numero_exterior}
                      onChange={(e) => setDireccionActual({...direccionActual, numero_exterior: e.target.value})}
                      placeholder="Ej: 123"
                    />
                    {errors.numero_exterior && <span className="edit-error-message">{errors.numero_exterior}</span>}
                  </div>

                  <div className="edit-form-group edit-half">
                    <label className="edit-form-label">Número interior</label>
                    <input
                      type="text"
                      className="edit-form-control"
                      value={direccionActual.numero_interior}
                      onChange={(e) => setDireccionActual({...direccionActual, numero_interior: e.target.value})}
                      placeholder="Ej: A, 2B (opcional)"
                    />
                  </div>
                </div>

                <div className="edit-form-group">
                  <label className="edit-form-label">
                    Colonia <span className="edit-required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`edit-form-control ${errors.colonia ? 'edit-input-error' : ''}`}
                    value={direccionActual.colonia}
                    onChange={(e) => setDireccionActual({...direccionActual, colonia: e.target.value})}
                    placeholder="Ej: Centro"
                  />
                  {errors.colonia && <span className="edit-error-message">{errors.colonia}</span>}
                </div>

                <div className="edit-form-row">
                  <div className="edit-form-group edit-half">
                    <label className="edit-form-label">
                      Ciudad <span className="edit-required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`edit-form-control ${errors.ciudad ? 'edit-input-error' : ''}`}
                      value={direccionActual.ciudad}
                      onChange={(e) => setDireccionActual({...direccionActual, ciudad: e.target.value})}
                      placeholder="Ej: Ciudad de México"
                    />
                    {errors.ciudad && <span className="edit-error-message">{errors.ciudad}</span>}
                  </div>

                  <div className="edit-form-group edit-half">
                    <label className="edit-form-label">
                      Estado <span className="edit-required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`edit-form-control ${errors.estado ? 'edit-input-error' : ''}`}
                      value={direccionActual.estado}
                      onChange={(e) => setDireccionActual({...direccionActual, estado: e.target.value})}
                      placeholder="Ej: CDMX"
                    />
                    {errors.estado && <span className="edit-error-message">{errors.estado}</span>}
                  </div>
                </div>

                <div className="edit-form-group">
                  <label className="edit-form-label">
                    Código postal <span className="edit-required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`edit-form-control ${errors.codigo_postal ? 'edit-input-error' : ''}`}
                    value={direccionActual.codigo_postal}
                    onChange={(e) => setDireccionActual({...direccionActual, codigo_postal: e.target.value.replace(/\D/g, '').slice(0, 5)})}
                    placeholder="5 dígitos"
                    maxLength="5"
                  />
                  {errors.codigo_postal && <span className="edit-error-message">{errors.codigo_postal}</span>}
                </div>

                <div className="edit-form-group">
                  <label className="edit-form-label">Referencias</label>
                  <textarea
                    className="edit-form-control"
                    value={direccionActual.referencias}
                    onChange={(e) => setDireccionActual({...direccionActual, referencias: e.target.value})}
                    placeholder="Ej: Entre calles, puntos de referencia, etc."
                    rows="3"
                  />
                </div>

                <div className="edit-checkbox-group">
                  <label className="edit-checkbox-label">
                    <input
                      type="checkbox"
                      checked={direccionActual.predeterminada}
                      onChange={(e) => setDireccionActual({...direccionActual, predeterminada: e.target.checked})}
                      disabled={direcciones.length === 0 && editingDireccionIndex === null}
                    />
                    <span>Marcar como dirección predeterminada</span>
                  </label>
                </div>

                <div className="edit-direccion-form-actions">
                  <button
                    type="button"
                    className="edit-btn-cancel-small"
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
                    className="edit-btn-save-direccion"
                    onClick={handleAddDireccion}
                  >
                    {editingDireccionIndex !== null ? 'Actualizar dirección' : 'Guardar dirección'}
                  </button>
                </div>
              </div>
            )}

            {direcciones.length === 0 && !showDireccionForm && (
              <div className="edit-no-direcciones">
                <p>No hay direcciones agregadas</p>
                <p className="edit-no-direcciones-sub">Haz clic en "Agregar dirección" para comenzar</p>
              </div>
            )}
          </div>

          {/* Botones de navegación */}
          <div className="edit-form-actions-step">
            <button 
              type="button" 
              className="edit-btn-back"
              onClick={handlePrevStep}
              disabled={loading}
            >
              ← Atrás
            </button>
            <button 
              type="button" 
              className="edit-btn-submit"
              onClick={handleSubmit}
              disabled={loading || direcciones.length === 0}
            >
              {loading ? 'Actualizando...' : 'Actualizar Usuario'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditUserForm;