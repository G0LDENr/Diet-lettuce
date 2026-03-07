import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEye, faEyeSlash, faPlus, faTrash,
  faChevronLeft, faChevronRight, faHome, faBriefcase, faMapMarkerAlt,
  faCreditCard, faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

const Register = ({ onToggle }) => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [skipTarjeta, setSkipTarjeta] = useState(false);
    const [formData, setFormData] = useState({
        // Paso 1: Información personal
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        gender: '',
        // Paso 2: Direcciones
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
        // Paso 3: Tarjeta de crédito (opcional)
        tarjeta: {
            nombre_titular: '',
            numero_tarjeta: '',
            mes_expiracion: '',
            anio_expiracion: '',
            predeterminada: true
        }
    });
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showTarjetaNumber, setShowTarjetaNumber] = useState(false);
    const [language, setLanguage] = useState('es');

    // Textos según el idioma
    const texts = {
        es: {
            step1: "Información Personal",
            step2: "Direcciones de Entrega",
            step3: "Tarjeta de Crédito (Opcional)",
            title: "Crear Cuenta",
            name: "Nombre completo",
            namePlaceholder: "Tu nombre completo",
            email: "Correo electrónico",
            emailPlaceholder: "correo@example.com",
            password: "Contraseña",
            passwordPlaceholder: "••••••••",
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
            
            // Textos para tarjeta
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
            
            // Botones de navegación
            siguiente: "Siguiente",
            anterior: "Anterior",
            registrar: "Registrarse",
            loading: "Creando cuenta...",
            
            // Otros textos
            haveAccount: "¿Ya tienes cuenta?",
            login: "Inicia sesión aquí",
            brandTagline: "No es antojo... es una experiencia..",
            errorComplete: "Por favor, completa todos los campos obligatorios",
            errorPasswordMatch: "Las contraseñas no coinciden",
            errorConnection: "Error de conexión con el servidor",
            errorEmailExists: "El correo electrónico ya está en uso",
            errorDireccionComplete: "Completa al menos una dirección completa",
            errorCP: "El código postal debe tener 5 dígitos",
            errorTarjeta: "Los datos de la tarjeta no son válidos",
            errorTarjetaNumero: "Número de tarjeta inválido",
            errorTarjetaFecha: "Fecha de expiración inválida",
            close: "Cerrar",
            successMessage: "Cuenta creada exitosamente. Redirigiendo...",
            welcomeAdmin: "Bienvenido Administrador",
            welcomeUser: "Bienvenido"
        },
        en: {
            step1: "Personal Information",
            step2: "Delivery Addresses",
            step3: "Credit Card (Optional)",
            title: "Create Account",
            name: "Full name",
            namePlaceholder: "Your full name",
            email: "Email",
            emailPlaceholder: "email@example.com",
            password: "Password",
            passwordPlaceholder: "••••••••",
            confirmPassword: "Confirm password",
            confirmPasswordPlaceholder: "••••••••",
            phone: "Phone",
            phonePlaceholder: "1234567890",
            gender: "Sex",
            genderOptions: {
                select: "Select sex",
                M: "Male",
                F: "Female",
            },
            direccionTitle: "Delivery Address",
            calle: "Street",
            callePlaceholder: "Street name",
            numeroExterior: "Exterior Number",
            numeroExteriorPlaceholder: "123",
            numeroInterior: "Interior Number",
            numeroInteriorPlaceholder: "A",
            colonia: "Neighborhood",
            coloniaPlaceholder: "Neighborhood name",
            ciudad: "City",
            ciudadPlaceholder: "City name",
            estado: "State",
            estadoPlaceholder: "State name",
            codigoPostal: "Postal Code",
            codigoPostalPlaceholder: "12345",
            referencias: "Additional references",
            referenciasPlaceholder: "Between streets, landmarks, etc.",
            tipoDireccion: "Address type",
            tipoOptions: {
                casa: "Home",
                trabajo: "Work",
                otro: "Other"
            },
            predeterminada: "Default address",
            agregarDireccion: "Add another address",
            eliminarDireccion: "Remove address",
            seleccionarPredeterminada: "Set as default",
            
            // Card texts
            tarjetaTitle: "Credit Card",
            skipTarjeta: "Skip this step (I'll do it later)",
            nombreTitular: "Cardholder name",
            nombreTitularPlaceholder: "As it appears on card",
            numeroTarjeta: "Card number",
            numeroTarjetaPlaceholder: "1234 5678 9012 3456",
            mesExpiracion: "Month",
            mesExpiracionPlaceholder: "MM",
            anioExpiracion: "Year",
            anioExpiracionPlaceholder: "YYYY",
            tarjetaPredeterminada: "Use as default payment method",
            
            // Navigation buttons
            siguiente: "Next",
            anterior: "Previous",
            registrar: "Sign Up",
            loading: "Creating account...",
            
            // Other texts
            haveAccount: "Already have an account?",
            login: "Login here",
            brandTagline: "It's not a craving... it's an experience.",
            errorComplete: "Please complete all required fields",
            errorPasswordMatch: "Passwords do not match",
            errorConnection: "Server connection error",
            errorEmailExists: "Email already in use",
            errorDireccionComplete: "Complete at least one full address",
            errorCP: "Postal code must have 5 digits",
            errorTarjeta: "Invalid card data",
            errorTarjetaNumero: "Invalid card number",
            errorTarjetaFecha: "Invalid expiration date",
            close: "Close",
            successMessage: "Account created successfully. Redirecting...",
            welcomeAdmin: "Welcome Administrator",
            welcomeUser: "Welcome"
        }
    };

    const t = texts[language];

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
        // Si el usuario eligió omitir, no validar
        if (skipTarjeta) return true;
        
        // Si todos los campos de tarjeta están vacíos, considerar como omitido
        if (!formData.tarjeta.nombre_titular && 
            !formData.tarjeta.numero_tarjeta && 
            !formData.tarjeta.mes_expiracion && 
            !formData.tarjeta.anio_expiracion) {
            return true;
        }

        // Validar campos requeridos
        if (!formData.tarjeta.nombre_titular || 
            !formData.tarjeta.numero_tarjeta || 
            !formData.tarjeta.mes_expiracion || 
            !formData.tarjeta.anio_expiracion) {
            setError(t.errorTarjeta);
            return false;
        }

        // Validar número de tarjeta (13-19 dígitos)
        const numeroLimpio = formData.tarjeta.numero_tarjeta.replace(/\s/g, '');
        if (!/^\d{13,19}$/.test(numeroLimpio)) {
            setError(t.errorTarjetaNumero);
            return false;
        }

        // Validar mes (1-12)
        const mes = parseInt(formData.tarjeta.mes_expiracion);
        if (isNaN(mes) || mes < 1 || mes > 12) {
            setError(t.errorTarjetaFecha);
            return false;
        }

        // Validar año (actual o futuro)
        const anio = parseInt(formData.tarjeta.anio_expiracion);
        const fechaActual = new Date();
        const anioActual = fechaActual.getFullYear();
        const mesActual = fechaActual.getMonth() + 1;

        if (isNaN(anio) || anio < anioActual || anio > anioActual + 10) {
            setError(t.errorTarjetaFecha);
            return false;
        }

        // Si el año es el actual, validar que el mes sea actual o futuro
        if (anio === anioActual && mes < mesActual) {
            setError(t.errorTarjetaFecha);
            return false;
        }

        return true;
    };

    const handleNextStep = () => {
        if (currentStep === 1) {
            if (validateStep1()) {
                setError('');
                setCurrentStep(2);
            }
        } else if (currentStep === 2) {
            if (validateStep2()) {
                setError('');
                setCurrentStep(3);
            }
        }
    };

    const handlePrevStep = () => {
        if (currentStep === 2) {
            setCurrentStep(1);
        } else if (currentStep === 3) {
            setCurrentStep(2);
        }
        setError('');
    };

    const redirectByRole = (role, user) => {
        const welcomeMessage = role === 1 ? t.welcomeAdmin : t.welcomeUser;
        console.log(`${welcomeMessage}:`, user?.name || 'Usuario');
        
        switch(role) {
            case 1:
                navigate('/panel-admin');
                break;
            case 2:
                navigate('/home');
                break;
            default:
                navigate('/auth');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (currentStep === 1) {
            if (!validateStep1()) {
                setLoading(false);
                return;
            }
            handleNextStep();
            setLoading(false);
            return;
        }

        if (currentStep === 2) {
            if (!validateStep2()) {
                setLoading(false);
                return;
            }
            handleNextStep();
            setLoading(false);
            return;
        }

        if (currentStep === 3) {
            if (!validateTarjeta()) {
                setLoading(false);
                return;
            }
        }

        try {
            // 1. Registrar al usuario
            const userData = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                telefono: formData.phone,
                sexo: formData.gender,
                direccion: formData.direcciones.length > 0 ? formData.direcciones[0] : null
            };

            // Si hay datos de tarjeta y no se omitió, agregarlos
            if (!skipTarjeta && formData.tarjeta.nombre_titular && formData.tarjeta.numero_tarjeta) {
                userData.tarjeta = {
                    nombre_titular: formData.tarjeta.nombre_titular,
                    numero_tarjeta: formData.tarjeta.numero_tarjeta.replace(/\s/g, ''),
                    mes_expiracion: formData.tarjeta.mes_expiracion,
                    anio_expiracion: formData.tarjeta.anio_expiracion,
                    predeterminada: formData.tarjeta.predeterminada
                };
            }

            console.log('Registrando usuario:', userData);

            const registerResponse = await fetch('http://127.0.0.1:5000/user/add_user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(userData),
            });

            const registerData = await registerResponse.json();
            console.log('Respuesta registro:', registerData);

            if (!registerResponse.ok) {
                setError(registerData.msg || t.errorConnection);
                setLoading(false);
                return;
            }

            // 2. Iniciar sesión automáticamente
            console.log('Iniciando sesión automáticamente...');
            const loginResponse = await fetch('http://127.0.0.1:5000/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    email: formData.email, 
                    password: formData.password 
                }),
            });

            const loginData = await loginResponse.json();
            console.log('Respuesta login:', loginData);

            if (loginResponse.ok) {
                // Guardar token y datos del usuario
                localStorage.setItem('token', loginData.access_token);
                localStorage.setItem('user', JSON.stringify(loginData.user));
                localStorage.setItem('userData', JSON.stringify(loginData.user));
                
                // Redirigir según rol
                if (loginData.user && loginData.user.rol !== undefined) {
                    redirectByRole(loginData.user.rol, loginData.user);
                } else {
                    navigate('/home');
                }
            } else {
                // Si el login automático falla, redirigir al login manual
                navigate('/auth', { 
                    state: { 
                        message: language === 'es' 
                            ? '✓ Cuenta creada. Por favor inicia sesión.' 
                            : '✓ Account created. Please login.' 
                    } 
                });
            }
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

    // Formatear número de tarjeta (agregar espacios cada 4 dígitos)
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

    // Renderizar paso 1
    const renderStep1 = () => (
        <>
            <h2 className="auth-form-title">{t.step1}</h2>
            
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
                    <label htmlFor="name">{t.name} *</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        className="auth-form-input"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder={t.namePlaceholder}
                        required
                        disabled={loading}
                    />
                </div>
                
                <div className="auth-form-group">
                    <label htmlFor="email">{t.email} *</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        className="auth-form-input"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder={t.emailPlaceholder}
                        required
                        disabled={loading}
                    />
                </div>

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
                        <option value="M">{t.genderOptions.M}</option>
                        <option value="F">{t.genderOptions.F}</option>
                    </select>
                </div>
                
                <div className="auth-form-group">
                    <label htmlFor="password">{t.password} *</label>
                    <div className="auth-password-container">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            className="auth-form-input"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder={t.passwordPlaceholder}
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

    // Renderizar paso 2
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
                                    pattern="\d{5}"
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

    // Renderizar paso 3 (Tarjeta - Opcional)
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
        <div className="auth-form-inner">
            {/* Indicador de pasos (actualizado para 3 pasos) */}
            <div className="auth-step-indicator" style={{ marginBottom: '30px' }}>
                <div className={`auth-step ${currentStep === 1 ? 'active' : ''}`}>
                    <div className="auth-step-number">1</div>
                    <div className="auth-step-label">{t.step1}</div>
                </div>
                <div className="auth-step-connector"></div>
                <div className={`auth-step ${currentStep === 2 ? 'active' : ''}`}>
                    <div className="auth-step-number">2</div>
                    <div className="auth-step-label">{t.step2}</div>
                </div>
                <div className="auth-step-connector"></div>
                <div className={`auth-step ${currentStep === 3 ? 'active' : ''}`}>
                    <div className="auth-step-number">3</div>
                    <div className="auth-step-label">{t.step3}</div>
                </div>
            </div>
            
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            
            <div className="auth-footer">
                <p>
                    {t.haveAccount}{' '}
                    <button 
                        className="auth-toggle-link" 
                        onClick={onToggle}
                    >
                        {t.login}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Register;