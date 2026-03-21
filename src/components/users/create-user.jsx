import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEye, faEyeSlash, faPlus, faTrash,
  faChevronLeft, faChevronRight, faMapMarkerAlt,
  faCreditCard, faCheckCircle, faChild, faUser, faPhone
} from '@fortawesome/free-solid-svg-icons';
import '../../css/Users/create-user.css';

const CreateUserForm = ({ onClose, onUserCreated }) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [skipTarjeta, setSkipTarjeta] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [accountType, setAccountType] = useState('personal');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    gender: '',
    edad: '',
    tutor_nombre: '',
    tutor_telefono: '',
    direcciones: [
      {
        calle: '',
        numero_exterior: '',
        numero_interior: '',
        colonia: '',
        ciudad: '',
        estado: '',
        codigo_postal: '',
        referencias: '',
        tipo: 'casa',
        predeterminada: true
      }
    ],
    tarjeta: {
      nombre_titular: '',
      numero_tarjeta: '',
      mes_expiracion: '',
      anio_expiracion: '',
      predeterminada: true
    }
  });

  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTarjetaNumber, setShowTarjetaNumber] = useState(false);

  const t = {
    step1: "Información Personal",
    step2: "Direcciones de Entrega",
    step3: "Tarjeta de Crédito",
    title: "Crear Cuenta",
    accountTypeTitle: "Tipo de Cuenta",
    accountPersonal: "Cuenta Personal",
    accountInfantil: "Cuenta Infantil",
    accountPersonalDesc: "Para comprar y gestionar pedidos",
    accountInfantilDesc: "Para niños (3-17 años) - Necesitarás los datos del tutor",
    name: "Nombre completo",
    namePlaceholder: "Tu nombre completo",
    childNamePlaceholder: "Nombre del niño/a",
    email: "Correo electrónico",
    emailPlaceholder: "correo@example.com",
    childEmailPlaceholder: "correo_del_nino@example.com",
    password: "Contraseña",
    passwordPlaceholder: "••••••••",
    childPasswordPlaceholder: "Contraseña para el niño",
    confirmPassword: "Confirmar contraseña",
    confirmPasswordPlaceholder: "••••••••",
    phone: "Teléfono",
    phonePlaceholder: "1234567890",
    gender: "Sexo",
    genderOptions: {
      select: "Seleccionar Sexo",
      M: "Masculino",
      F: "Femenino",
    },
    edadPersonal: "Edad",
    edadPersonalPlaceholder: "Tu edad (mayor de 18 años)",
    edadInfantil: "Edad del niño/a",
    edadInfantilPlaceholder: "Edad (3-17 años)",
    tutor_nombre: "Nombre del tutor (padre/madre)",
    tutor_nombrePlaceholder: "Nombre completo del tutor",
    tutor_telefono: "Teléfono del tutor",
    tutor_telefonoPlaceholder: "Teléfono del tutor",
    tutorInfo: "Datos del tutor (padre/madre)",
    
    direccionTitle: "Dirección de Entrega",
    calle: "Calle",
    callePlaceholder: "Nombre de la calle",
    numeroExterior: "Número Exterior",
    numeroExteriorPlaceholder: "123",
    numeroInterior: "Número Interior",
    numeroInteriorPlaceholder: "A",
    colonia: "Colonia",
    coloniaPlaceholder: "Nombre de la colonia",
    ciudad: "Ciudad",
    ciudadPlaceholder: "Nombre de la ciudad",
    estado: "Estado",
    estadoPlaceholder: "Nombre del estado",
    codigoPostal: "Código Postal",
    codigoPostalPlaceholder: "12345",
    referencias: "Referencias adicionales",
    referenciasPlaceholder: "Entre calles, puntos de referencia, etc.",
    tipoDireccion: "Tipo de dirección",
    tipoOptions: {
      casa: "Casa",
      trabajo: "Trabajo",
      otro: "Otro"
    },
    predeterminada: "Dirección predeterminada",
    agregarDireccion: "Agregar otra dirección",
    eliminarDireccion: "Eliminar dirección",
    seleccionarPredeterminada: "Marcar como predeterminada",
    
    tarjetaTitle: "Tarjeta de Crédito",
    skipTarjeta: "Omitir este paso (lo haré después)",
    nombreTitular: "Nombre del titular",
    nombreTitularPlaceholder: "Como aparece en la tarjeta",
    numeroTarjeta: "Número de tarjeta",
    numeroTarjetaPlaceholder: "1234 5678 9012 3456",
    mesExpiracion: "Mes",
    mesExpiracionPlaceholder: "MM",
    anioExpiracion: "Año",
    anioExpiracionPlaceholder: "AAAA",
    tarjetaPredeterminada: "Usar como método de pago predeterminado",
    
    siguiente: "Siguiente",
    anterior: "Anterior",
    registrar: "Registrarse",
    loading: "Creando cuenta...",
    
    errorComplete: "Por favor, completa todos los campos obligatorios",
    errorPasswordMatch: "Las contraseñas no coinciden",
    errorConnection: "Error de conexión con el servidor",
    errorDireccionComplete: "Completa al menos una dirección completa",
    errorCP: "El código postal debe tener 5 dígitos",
    errorTarjeta: "Los datos de la tarjeta no son válidos",
    errorTarjetaNumero: "Número de tarjeta inválido",
    errorTarjetaFecha: "Fecha de expiración inválida",
    errorEdadPersonal: "Debes ser mayor de 18 años",
    errorEdadInfantil: "La edad debe ser entre 3 y 17 años",
    errorEdadRequerida: "La edad es requerida",
    errorTutorData: "El nombre y teléfono del tutor son requeridos",
    close: "Cerrar",
    successMessage: "Cuenta creada exitosamente",
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDireccionChange = (index, field, value) => {
    const updatedDirecciones = [...formData.direcciones];
    updatedDirecciones[index][field] = value;
    
    if (field === 'predeterminada' && value === true) {
      updatedDirecciones.forEach((dir, i) => {
        if (i !== index) dir.predeterminada = false;
      });
    }
    
    setFormData(prev => ({
      ...prev,
      direcciones: updatedDirecciones
    }));
  };

  const handleTarjetaChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      tarjeta: {
        ...prev.tarjeta,
        [field]: value
      }
    }));
  };

  const handleAddDireccion = () => {
    setFormData(prev => ({
      ...prev,
      direcciones: [
        ...prev.direcciones,
        {
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
        }
      ]
    }));
  };

  const handleRemoveDireccion = (index) => {
    if (formData.direcciones.length > 1) {
      const updatedDirecciones = formData.direcciones.filter((_, i) => i !== index);
      
      const removedWasPredeterminada = formData.direcciones[index].predeterminada;
      if (removedWasPredeterminada && updatedDirecciones.length > 0) {
        updatedDirecciones[0].predeterminada = true;
      }
      
      setFormData(prev => ({
        ...prev,
        direcciones: updatedDirecciones
      }));
    }
  };

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError(t.errorComplete);
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t.errorPasswordMatch);
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Por favor ingresa un correo electrónico válido");
      return false;
    }

    if (!formData.edad) {
      setError(t.errorEdadRequerida);
      return false;
    }

    const edad = parseInt(formData.edad);
    if (isNaN(edad)) {
      setError(t.errorEdadRequerida);
      return false;
    }

    if (accountType === 'personal') {
      if (edad < 18) {
        setError(t.errorEdadPersonal);
        return false;
      }
    } else {
      if (edad < 3 || edad > 17) {
        setError(t.errorEdadInfantil);
        return false;
      }

      if (!formData.tutor_nombre || !formData.tutor_telefono) {
        setError(t.errorTutorData);
        return false;
      }
    }

    return true;
  };

  const validateStep2 = () => {
    const direccionCompleta = formData.direcciones.some(dir => 
      dir.calle && 
      dir.numero_exterior && 
      dir.colonia && 
      dir.ciudad && 
      dir.estado && 
      dir.codigo_postal
    );

    if (!direccionCompleta) {
      setError(t.errorDireccionComplete);
      return false;
    }

    for (const dir of formData.direcciones) {
      if (dir.codigo_postal && !/^\d{5}$/.test(dir.codigo_postal)) {
        setError(t.errorCP);
        return false;
      }
    }

    return true;
  };

  const validateTarjeta = () => {
    if (skipTarjeta) return true;
    
    if (!formData.tarjeta.nombre_titular && 
        !formData.tarjeta.numero_tarjeta && 
        !formData.tarjeta.mes_expiracion && 
        !formData.tarjeta.anio_expiracion) {
      return true;
    }

    if (!formData.tarjeta.nombre_titular || 
        !formData.tarjeta.numero_tarjeta || 
        !formData.tarjeta.mes_expiracion || 
        !formData.tarjeta.anio_expiracion) {
      setError(t.errorTarjeta);
      return false;
    }

    const numeroLimpio = formData.tarjeta.numero_tarjeta.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(numeroLimpio)) {
      setError(t.errorTarjetaNumero);
      return false;
    }

    const mes = parseInt(formData.tarjeta.mes_expiracion);
    if (isNaN(mes) || mes < 1 || mes > 12) {
      setError(t.errorTarjetaFecha);
      return false;
    }

    const anio = parseInt(formData.tarjeta.anio_expiracion);
    const fechaActual = new Date();
    const anioActual = fechaActual.getFullYear();
    const mesActual = fechaActual.getMonth() + 1;

    if (isNaN(anio) || anio < anioActual || anio > anioActual + 10) {
      setError(t.errorTarjetaFecha);
      return false;
    }

    if (anio === anioActual && mes < mesActual) {
      setError(t.errorTarjetaFecha);
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      if (validateStep1()) {
        setError('');
        setStep(2);
      }
    } else if (step === 2) {
      if (validateStep2()) {
        setError('');
        setStep(3);
      }
    }
  };

  const handlePrevStep = () => {
    if (step === 1) {
      setStep(0);
    } else if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (step === 0) {
      handleNextStep();
      setLoading(false);
      return;
    }

    if (step === 1) {
      if (!validateStep1()) {
        setLoading(false);
        return;
      }
      handleNextStep();
      setLoading(false);
      return;
    }

    if (step === 2) {
      if (!validateStep2()) {
        setLoading(false);
        return;
      }
      handleNextStep();
      setLoading(false);
      return;
    }

    if (step === 3) {
      if (!validateTarjeta()) {
        setLoading(false);
        return;
      }
    }

    try {
      // Preparar datos del usuario
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 2,
        telefono: formData.phone,
        sexo: formData.gender,
        tipo_cuenta: accountType,
        edad: parseInt(formData.edad)
      };

      console.log('1. Datos básicos:', userData);

      // Agregar datos del tutor para cuenta infantil
      if (accountType === 'infantil') {
        userData.tutor_nombre = formData.tutor_nombre;
        userData.tutor_telefono = formData.tutor_telefono;
        console.log('2. Datos tutor:', { tutor_nombre: formData.tutor_nombre, tutor_telefono: formData.tutor_telefono });
      }

      // VERIFICAR que las direcciones existen
      console.log('3. Direcciones en formData:', formData.direcciones);
      console.log('4. Longitud de direcciones:', formData.direcciones.length);

      // Enviar la dirección - AHORA COMO "direccion" en lugar de "direccion_data"
      if (formData.direcciones.length > 0) {
        const primeraDireccion = formData.direcciones[0];
        console.log('5. Primera dirección:', primeraDireccion);
        
        // Verificar campos de la dirección
        console.log('6. Campos de dirección:');
        console.log('   - calle:', primeraDireccion.calle);
        console.log('   - numero_exterior:', primeraDireccion.numero_exterior);
        console.log('   - colonia:', primeraDireccion.colonia);
        console.log('   - ciudad:', primeraDireccion.ciudad);
        console.log('   - estado:', primeraDireccion.estado);
        console.log('   - codigo_postal:', primeraDireccion.codigo_postal);
        
        if (!primeraDireccion.calle || !primeraDireccion.numero_exterior || !primeraDireccion.colonia || 
            !primeraDireccion.ciudad || !primeraDireccion.estado || !primeraDireccion.codigo_postal) {
          console.log('❌ ERROR: La dirección está incompleta');
          setError('La dirección está incompleta. Por favor completa todos los campos obligatorios.');
          setLoading(false);
          return;
        }

        userData.direccion = {
          calle: primeraDireccion.calle,
          numero_exterior: primeraDireccion.numero_exterior,
          numero_interior: primeraDireccion.numero_interior || '',
          colonia: primeraDireccion.colonia,
          ciudad: primeraDireccion.ciudad,
          estado: primeraDireccion.estado,
          codigo_postal: primeraDireccion.codigo_postal,
          referencias: primeraDireccion.referencias || '',
          tipo: primeraDireccion.tipo,
          predeterminada: true
        };
        console.log('7. direccion a enviar:', userData.direccion);
      } else {
        console.log('❌ ERROR: No hay direcciones');
        setError('Debes agregar al menos una dirección');
        setLoading(false);
        return;
      }

      // Agregar tarjeta si no se omitió
      if (!skipTarjeta && formData.tarjeta.nombre_titular && formData.tarjeta.numero_tarjeta) {
        userData.tarjeta_data = {
          nombre_titular: formData.tarjeta.nombre_titular,
          numero_tarjeta: formData.tarjeta.numero_tarjeta.replace(/\s/g, ''),
          mes_expiracion: formData.tarjeta.mes_expiracion,
          anio_expiracion: formData.tarjeta.anio_expiracion,
          predeterminada: formData.tarjeta.predeterminada
        };
        console.log('8. tarjeta_data:', userData.tarjeta_data);
      }

      console.log('9. DATOS FINALES A ENVIAR:', JSON.stringify(userData, null, 2));

      const response = await fetch('http://127.0.0.1:5000/user/add_user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log('10. RESPUESTA DEL SERVIDOR:', data);

      if (!response.ok) {
        setError(data.msg || t.errorConnection);
        setLoading(false);
        return;
      }

      setSuccessMessage(t.successMessage);
      
      setTimeout(() => {
        onUserCreated();
        onClose();
      }, 2000);

    } catch (err) {
      console.error('Error en registro:', err);
      setError(t.errorConnection);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const toggleTarjetaNumberVisibility = () => {
    setShowTarjetaNumber(!showTarjetaNumber);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const renderAccountTypeSelector = () => (
    <div className="auth-account-type">
      <h2 className="auth-form-title">{t.accountTypeTitle}</h2>
      <div className="auth-account-type-options">
        <button
          type="button"
          className={`auth-account-type-option ${accountType === 'personal' ? 'active' : ''}`}
          onClick={() => setAccountType('personal')}
        >
          <FontAwesomeIcon icon={faUser} size="2x" />
          <div className="auth-account-type-text">
            <strong>{t.accountPersonal}</strong>
            <small>{t.accountPersonalDesc}</small>
          </div>
        </button>
        
        <button
          type="button"
          className={`auth-account-type-option ${accountType === 'infantil' ? 'active' : ''}`}
          onClick={() => setAccountType('infantil')}
        >
          <FontAwesomeIcon icon={faChild} size="2x" />
          <div className="auth-account-type-text">
            <strong>{t.accountInfantil}</strong>
            <small>{t.accountInfantilDesc}</small>
          </div>
        </button>
      </div>
      
      <div className="auth-step-navigation" style={{ marginTop: '30px' }}>
        <button 
          type="button" 
          className="auth-next-button"
          onClick={handleNextStep}
        >
          {t.siguiente} <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <>
      <h2 className="auth-form-title">
        {accountType === 'infantil' ? (
          <>
            <FontAwesomeIcon icon={faChild} style={{ marginRight: '10px' }} />
            {t.accountInfantil}
          </>
        ) : (
          t.step1
        )}
      </h2>
      
      {error && (
        <div className="auth-error-message">
          {error}
          <button 
            type="button" 
            className="auth-retry-button"
            onClick={() => setError('')}
          >
            {t.close}
          </button>
        </div>
      )}
      
      <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="auth-form">
        <div className="auth-form-group">
          <label htmlFor="name">
            {accountType === 'infantil' ? t.childNamePlaceholder : t.name} *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="auth-form-input"
            value={formData.name}
            onChange={handleInputChange}
            placeholder={accountType === 'infantil' ? t.childNamePlaceholder : t.namePlaceholder}
            required
            disabled={loading}
          />
        </div>
        
        <div className="auth-form-group">
          <label htmlFor="email">
            {accountType === 'infantil' ? t.childEmailPlaceholder : t.email} *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="auth-form-input"
            value={formData.email}
            onChange={handleInputChange}
            placeholder={accountType === 'infantil' ? t.childEmailPlaceholder : t.emailPlaceholder}
            required
            disabled={loading}
          />
        </div>

        <div className="auth-form-group">
          <label htmlFor="edad">
            {accountType === 'infantil' ? t.edadInfantil : t.edadPersonal} *
          </label>
          <input
            id="edad"
            name="edad"
            type="number"
            min={accountType === 'infantil' ? "3" : "18"}
            max={accountType === 'infantil' ? "17" : "120"}
            className="auth-form-input"
            value={formData.edad}
            onChange={handleInputChange}
            placeholder={accountType === 'infantil' ? t.edadInfantilPlaceholder : t.edadPersonalPlaceholder}
            required
            disabled={loading}
          />
        </div>

        {accountType === 'personal' && (
          <div className="auth-form-group">
            <label htmlFor="phone">{t.phone}</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="auth-form-input"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder={t.phonePlaceholder}
              disabled={loading}
            />
          </div>
        )}

        {accountType === 'infantil' && (
          <>
            <div className="auth-form-section">
              <h3 className="auth-section-title">
                <FontAwesomeIcon icon={faUser} style={{ marginRight: '10px' }} />
                {t.tutorInfo}
              </h3>
              
              <div className="auth-form-group">
                <label htmlFor="tutor_nombre">
                  <FontAwesomeIcon icon={faUser} style={{ marginRight: '5px' }} />
                  {t.tutor_nombre} *
                </label>
                <input
                  id="tutor_nombre"
                  name="tutor_nombre"
                  type="text"
                  className="auth-form-input"
                  value={formData.tutor_nombre}
                  onChange={handleInputChange}
                  placeholder={t.tutor_nombrePlaceholder}
                  required
                  disabled={loading}
                />
              </div>

              <div className="auth-form-group">
                <label htmlFor="tutor_telefono">
                  <FontAwesomeIcon icon={faPhone} style={{ marginRight: '5px' }} />
                  {t.tutor_telefono} *
                </label>
                <input
                  id="tutor_telefono"
                  name="tutor_telefono"
                  type="tel"
                  className="auth-form-input"
                  value={formData.tutor_telefono}
                  onChange={handleInputChange}
                  placeholder={t.tutor_telefonoPlaceholder}
                  required
                  disabled={loading}
                />
              </div>
            </div>
          </>
        )}

        <div className="auth-form-group">
          <label htmlFor="gender">{t.gender}</label>
          <select
            id="gender"
            name="gender"
            className="auth-form-input"
            value={formData.gender}
            onChange={handleInputChange}
            disabled={loading}
          >
            <option value="">{t.genderOptions.select}</option>
            <option value="Masculino">{t.genderOptions.M}</option>
            <option value="Femenino">{t.genderOptions.F}</option>
          </select>
        </div>
        
        <div className="auth-form-group">
          <label htmlFor="password">
            {accountType === 'infantil' ? t.childPasswordPlaceholder : t.password} *
          </label>
          <div className="auth-password-container">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              className="auth-form-input"
              value={formData.password}
              onChange={handleInputChange}
              placeholder={accountType === 'infantil' ? t.childPasswordPlaceholder : t.passwordPlaceholder}
              required
              disabled={loading}
            />
            <button 
              type="button" 
              className="auth-password-toggle"
              onClick={togglePasswordVisibility}
              disabled={loading}
            >
              <FontAwesomeIcon 
                icon={showPassword ? faEyeSlash : faEye} 
              />
            </button>
          </div>
        </div>

        <div className="auth-form-group">
          <label htmlFor="confirmPassword">{t.confirmPassword} *</label>
          <div className="auth-password-container">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              className="auth-form-input"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder={t.confirmPasswordPlaceholder}
              required
              disabled={loading}
            />
            <button 
              type="button" 
              className="auth-password-toggle"
              onClick={toggleConfirmPasswordVisibility}
              disabled={loading}
            >
              <FontAwesomeIcon 
                icon={showConfirmPassword ? faEyeSlash : faEye} 
              />
            </button>
          </div>
        </div>
        
        <div className="auth-step-navigation">
          <button 
            type="button" 
            className="auth-prev-button"
            onClick={handlePrevStep}
          >
            <FontAwesomeIcon icon={faChevronLeft} /> {t.anterior}
          </button>
          
          <button 
            type="submit" 
            className="auth-next-button"
            disabled={loading}
          >
            {t.siguiente} <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </form>
    </>
  );

  const renderStep2 = () => (
    <>
      <h2 className="auth-form-title">{t.step2}</h2>
      
      {error && (
        <div className="auth-error-message">
          {error}
          <button 
            type="button" 
            className="auth-retry-button"
            onClick={() => setError('')}
          >
            {t.close}
          </button>
        </div>
      )}
      
      <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="auth-form">
        {formData.direcciones.map((direccion, index) => (
          <div key={index} className="auth-direccion-form">
            <div className="auth-direccion-header">
              <h3>
                {t.direccionTitle} {index + 1}
                {direccion.predeterminada && (
                  <span className="auth-predeterminada-badge">
                    <FontAwesomeIcon icon={faMapMarkerAlt} /> {t.predeterminada}
                  </span>
                )}
              </h3>
              {formData.direcciones.length > 1 && (
                <button
                  type="button"
                  className="auth-remove-direccion-button"
                  onClick={() => handleRemoveDireccion(index)}
                  disabled={loading || (direccion.predeterminada && formData.direcciones.length > 1)}
                  title={t.eliminarDireccion}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              )}
            </div>
            
            <div className="auth-direccion-grid">
              <div className="auth-form-group">
                <label htmlFor={`calle-${index}`}>{t.calle} *</label>
                <input
                  id={`calle-${index}`}
                  type="text"
                  className="auth-form-input"
                  value={direccion.calle}
                  onChange={(e) => handleDireccionChange(index, 'calle', e.target.value)}
                  placeholder={t.callePlaceholder}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="auth-form-group">
                <label htmlFor={`numero_exterior-${index}`}>{t.numeroExterior} *</label>
                <input
                  id={`numero_exterior-${index}`}
                  type="text"
                  className="auth-form-input"
                  value={direccion.numero_exterior}
                  onChange={(e) => handleDireccionChange(index, 'numero_exterior', e.target.value)}
                  placeholder={t.numeroExteriorPlaceholder}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="auth-form-group">
                <label htmlFor={`numero_interior-${index}`}>{t.numeroInterior}</label>
                <input
                  id={`numero_interior-${index}`}
                  type="text"
                  className="auth-form-input"
                  value={direccion.numero_interior}
                  onChange={(e) => handleDireccionChange(index, 'numero_interior', e.target.value)}
                  placeholder={t.numeroInteriorPlaceholder}
                  disabled={loading}
                />
              </div>
              
              <div className="auth-form-group">
                <label htmlFor={`colonia-${index}`}>{t.colonia} *</label>
                <input
                  id={`colonia-${index}`}
                  type="text"
                  className="auth-form-input"
                  value={direccion.colonia}
                  onChange={(e) => handleDireccionChange(index, 'colonia', e.target.value)}
                  placeholder={t.coloniaPlaceholder}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="auth-form-group">
                <label htmlFor={`ciudad-${index}`}>{t.ciudad} *</label>
                <input
                  id={`ciudad-${index}`}
                  type="text"
                  className="auth-form-input"
                  value={direccion.ciudad}
                  onChange={(e) => handleDireccionChange(index, 'ciudad', e.target.value)}
                  placeholder={t.ciudadPlaceholder}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="auth-form-group">
                <label htmlFor={`estado-${index}`}>{t.estado} *</label>
                <input
                  id={`estado-${index}`}
                  type="text"
                  className="auth-form-input"
                  value={direccion.estado}
                  onChange={(e) => handleDireccionChange(index, 'estado', e.target.value)}
                  placeholder={t.estadoPlaceholder}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="auth-form-group">
                <label htmlFor={`codigo_postal-${index}`}>{t.codigoPostal} *</label>
                <input
                  id={`codigo_postal-${index}`}
                  type="text"
                  className="auth-form-input"
                  value={direccion.codigo_postal}
                  onChange={(e) => handleDireccionChange(index, 'codigo_postal', e.target.value)}
                  placeholder={t.codigoPostalPlaceholder}
                  required
                  disabled={loading}
                  maxLength="5"
                />
              </div>
              
              <div className="auth-form-group">
                <label htmlFor={`tipo-${index}`}>{t.tipoDireccion}</label>
                <select
                  id={`tipo-${index}`}
                  className="auth-form-input"
                  value={direccion.tipo}
                  onChange={(e) => handleDireccionChange(index, 'tipo', e.target.value)}
                  disabled={loading}
                >
                  <option value="casa">{t.tipoOptions.casa}</option>
                  <option value="trabajo">{t.tipoOptions.trabajo}</option>
                  <option value="otro">{t.tipoOptions.otro}</option>
                </select>
              </div>
              
              <div className="auth-form-group auth-full-width">
                <label htmlFor={`referencias-${index}`}>{t.referencias}</label>
                <textarea
                  id={`referencias-${index}`}
                  className="auth-form-input"
                  value={direccion.referencias}
                  onChange={(e) => handleDireccionChange(index, 'referencias', e.target.value)}
                  placeholder={t.referenciasPlaceholder}
                  disabled={loading}
                  rows="3"
                />
              </div>
              
              <div className="auth-form-group auth-checkbox-group">
                <label className="auth-checkbox-label">
                  <input
                    type="checkbox"
                    checked={direccion.predeterminada}
                    onChange={(e) => handleDireccionChange(index, 'predeterminada', e.target.checked)}
                    disabled={loading}
                  />
                  <span className="auth-checkbox-custom"></span>
                  {t.seleccionarPredeterminada}
                </label>
              </div>
            </div>
          </div>
        ))}
        
        <div className="auth-add-direccion-container">
          <button
            type="button"
            className="auth-add-direccion-button"
            onClick={handleAddDireccion}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faPlus} /> {t.agregarDireccion}
          </button>
        </div>
        
        <div className="auth-step-navigation">
          <button 
            type="button" 
            className="auth-prev-button"
            onClick={handlePrevStep}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faChevronLeft} /> {t.anterior}
          </button>
          
          <button 
            type="submit" 
            className="auth-next-button"
            disabled={loading}
          >
            {t.siguiente} <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </form>
    </>
  );

  const renderStep3 = () => (
    <>
      <h2 className="auth-form-title">
        <FontAwesomeIcon icon={faCreditCard} style={{ marginRight: '10px' }} />
        {t.step3}
      </h2>
      
      {error && (
        <div className="auth-error-message">
          {error}
          <button 
            type="button" 
            className="auth-retry-button"
            onClick={() => setError('')}
          >
            {t.close}
          </button>
        </div>
      )}
      
      <div className="auth-skip-option">
        <label className="auth-checkbox-label skip-checkbox">
          <input
            type="checkbox"
            checked={skipTarjeta}
            onChange={(e) => setSkipTarjeta(e.target.checked)}
          />
          <span className="auth-checkbox-custom"></span>
          <span className="skip-text">
            <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '8px', color: '#96bd44' }} />
            {t.skipTarjeta}
          </span>
        </label>
      </div>
      
      {!skipTarjeta && (
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-tarjeta-form">
            <div className="auth-form-group">
              <label htmlFor="nombre_titular">{t.nombreTitular}</label>
              <input
                id="nombre_titular"
                type="text"
                className="auth-form-input"
                value={formData.tarjeta.nombre_titular}
                onChange={(e) => handleTarjetaChange('nombre_titular', e.target.value)}
                placeholder={t.nombreTitularPlaceholder}
                disabled={loading}
              />
            </div>
            
            <div className="auth-form-group">
              <label htmlFor="numero_tarjeta">{t.numeroTarjeta}</label>
              <div className="auth-password-container">
                <input
                  id="numero_tarjeta"
                  type={showTarjetaNumber ? "text" : "password"}
                  className="auth-form-input"
                  value={formData.tarjeta.numero_tarjeta}
                  onChange={(e) => handleTarjetaChange('numero_tarjeta', formatCardNumber(e.target.value))}
                  placeholder={t.numeroTarjetaPlaceholder}
                  disabled={loading}
                  maxLength="19"
                />
                <button 
                  type="button" 
                  className="auth-password-toggle"
                  onClick={toggleTarjetaNumberVisibility}
                  disabled={loading}
                >
                  <FontAwesomeIcon 
                    icon={showTarjetaNumber ? faEyeSlash : faEye} 
                  />
                </button>
              </div>
            </div>
            
            <div className="auth-tarjeta-fecha">
              <div className="auth-form-group" style={{ flex: 1 }}>
                <label htmlFor="mes_expiracion">{t.mesExpiracion}</label>
                <input
                  id="mes_expiracion"
                  type="text"
                  className="auth-form-input"
                  value={formData.tarjeta.mes_expiracion}
                  onChange={(e) => handleTarjetaChange('mes_expiracion', e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
                  placeholder={t.mesExpiracionPlaceholder}
                  disabled={loading}
                  maxLength="2"
                />
              </div>
              
              <div className="auth-form-group" style={{ flex: 1 }}>
                <label htmlFor="anio_expiracion">{t.anioExpiracion}</label>
                <input
                  id="anio_expiracion"
                  type="text"
                  className="auth-form-input"
                  value={formData.tarjeta.anio_expiracion}
                  onChange={(e) => handleTarjetaChange('anio_expiracion', e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                  placeholder={t.anioExpiracionPlaceholder}
                  disabled={loading}
                  maxLength="4"
                />
              </div>
            </div>
            
            <div className="auth-form-group auth-checkbox-group">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.tarjeta.predeterminada}
                  onChange={(e) => handleTarjetaChange('predeterminada', e.target.checked)}
                  disabled={loading}
                />
                <span className="auth-checkbox-custom"></span>
                {t.tarjetaPredeterminada}
              </label>
            </div>
          </div>
          
          <div className="auth-step-navigation">
            <button 
              type="button" 
              className="auth-prev-button"
              onClick={handlePrevStep}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faChevronLeft} /> {t.anterior}
            </button>
            
            <button 
              type="submit" 
              className="auth-submit-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-spinner"></span>
                  {t.loading}
                </>
              ) : t.registrar}
            </button>
          </div>
        </form>
      )}
      
      {skipTarjeta && (
        <div className="auth-step-navigation" style={{ marginTop: '30px' }}>
          <button 
            type="button" 
            className="auth-prev-button"
            onClick={handlePrevStep}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faChevronLeft} /> {t.anterior}
          </button>
          
          <button 
            type="button" 
            className="auth-submit-button"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="auth-spinner"></span>
                {t.loading}
              </>
            ) : t.registrar}
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="auth-form-inner create-user-container">
      {successMessage && (
        <div className="auth-success-message">
          {successMessage}
        </div>
      )}
      
      {!successMessage && (
        <>
          <div className="auth-step-indicator" style={{ marginBottom: '30px' }}>
            <div className={`auth-step ${step === 0 ? 'active' : ''}`}>
              <div className="auth-step-number">1</div>
              <div className="auth-step-label">Tipo de Cuenta</div>
            </div>
            
            <div className="auth-step-connector"></div>
            <div className={`auth-step ${step === 1 ? 'active' : ''}`}>
              <div className="auth-step-number">2</div>
              <div className="auth-step-label">
                {accountType === 'infantil' ? 'Datos del Niño' : 'Datos Personales'}
              </div>
            </div>
            
            <div className="auth-step-connector"></div>
            <div className={`auth-step ${step === 2 ? 'active' : ''}`}>
              <div className="auth-step-number">3</div>
              <div className="auth-step-label">Direcciones</div>
            </div>
            
            <div className="auth-step-connector"></div>
            <div className={`auth-step ${step === 3 ? 'active' : ''}`}>
              <div className="auth-step-number">4</div>
              <div className="auth-step-label">Tarjeta</div>
            </div>
          </div>
          
          {step === 0 && renderAccountTypeSelector()}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </>
      )}
    </div>
  );
};

export default CreateUserForm;