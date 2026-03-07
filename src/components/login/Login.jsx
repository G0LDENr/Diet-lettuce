import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const Login = ({ onToggle }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState(location.state?.message || '');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [language, setLanguage] = useState('es');

    // Textos según el idioma
    const texts = {
        es: {
            title: "Iniciar Sesión",
            email: "Correo electrónico",
            emailPlaceholder: "correo@example.com",
            password: "Contraseña",
            passwordPlaceholder: "••••••••",
            forgotPassword: "¿Olvidaste tu contraseña?",
            loginButton: "Ingresar",
            loading: "Procesando...",
            noAccount: "¿No tienes cuenta?",
            register: "Regístrate aquí",
            errorComplete: "Por favor, completa todos los campos",
            errorCredentials: "Credenciales incorrectas",
            errorConnection: "Error de conexión con el servidor",
            close: "Cerrar",
            welcomeAdmin: "Bienvenido Administrador",
            welcomeUser: "Bienvenido"
        },
        en: {
            title: "Login",
            email: "Email",
            emailPlaceholder: "email@example.com",
            password: "Password",
            passwordPlaceholder: "••••••••",
            forgotPassword: "Forgot your password?",
            loginButton: "Sign In",
            loading: "Processing...",
            noAccount: "Don't have an account?",
            register: "Register here",
            errorComplete: "Please complete all fields",
            errorCredentials: "Incorrect credentials",
            errorConnection: "Server connection error",
            close: "Close",
            welcomeAdmin: "Welcome Administrator",
            welcomeUser: "Welcome"
        }
    };

    const t = texts[language];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        if (!email || !password) {
            setError(t.errorComplete);
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:5000/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('userData', JSON.stringify(data.user));
                
                if (data.user && data.user.rol !== undefined) {
                    redirectByRole(data.user.rol, data.user);
                } else {
                    navigate('/home');
                }
            } else {
                setError(data.msg || t.errorCredentials);
            }
        } catch (err) {
            console.error('Error en login:', err);
            setError(t.errorConnection);
        } finally {
            setLoading(false);
        }
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

    const handleForgotPassword = () => {
        console.log("Funcionalidad de recuperación de contraseña");
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="auth-form-inner">
            <h2 className="auth-form-title">{t.title}</h2>
            
            {successMessage && (
                <div className="auth-success-message">
                    {successMessage}
                </div>
            )}
            
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
            
            <form onSubmit={handleSubmit} className="auth-form">
                <div className="auth-form-group">
                    <label htmlFor="email">{t.email}</label>
                    <input
                        id="email"
                        type="email"
                        className="auth-form-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t.emailPlaceholder}
                        required
                        disabled={loading}
                        autoComplete="email"
                    />
                </div>
                
                <div className="auth-form-group">
                    <label htmlFor="password">{t.password}</label>
                    <div className="auth-password-container">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            className="auth-form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t.passwordPlaceholder}
                            required
                            disabled={loading}
                            autoComplete="current-password"
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

                <div className="auth-forgot-password">
                    <span onClick={handleForgotPassword}>
                        {t.forgotPassword}
                    </span>
                </div>
                
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
                    ) : t.loginButton}
                </button>
            </form>
            
            <div className="auth-footer">
                <p>
                    {t.noAccount}{' '}
                    <button 
                        className="auth-toggle-link" 
                        onClick={onToggle}
                    >
                        {t.register}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;