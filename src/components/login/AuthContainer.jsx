import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import { useConfig, Config } from '../../context/config';
import Logo from "../../img/DietLettuce.png";
import '../../css/Login/auth.css';

const AuthContainer = () => {
    const navigate = useNavigate();
    const { t } = useConfig();
    const [showRegister, setShowRegister] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const toggleAuth = () => {
        setIsAnimating(true);
        // Limpiar cualquier mensaje de estado anterior
        window.history.replaceState({}, document.title);
        setTimeout(() => {
            setShowRegister(!showRegister);
            setTimeout(() => {
                setIsAnimating(false);
            }, 100);
        }, 50);
    };

    const handleGoBack = () => {
        navigate('/');
    };

    return (
        <div className="auth-wrapper">
            {/* Botón de regresar - Superior Izquierda */}
            <button 
                className="auth-back-button"
                onClick={handleGoBack}
                title={t('back') || "Regresar"}
            >
                <span className="auth-back-icon">←</span>
                <span className="auth-back-text">{t('back') || "Regresar"}</span>
            </button>

            {/* Configuración (idioma y tema) - Superior Derecha */}
            <div className="auth-config-wrapper">
                <Config simpleIcons={true} />
            </div>

            <div className={`auth-container ${showRegister ? 'show-register' : ''} ${isAnimating ? 'animating' : ''}`}>
                {/* Lado izquierdo - Siempre visible con el logo */}
                <div className="auth-brand-section">
                    <div className="auth-logo-container">
                        <img src={Logo} alt="Crazy Lettuces Logo" className="auth-logo-image"/>
                    </div>
                    <h1 className="auth-brand-name">
                        <span className="auth-brand-crazy">Crazy</span>
                        <span className="auth-brand-lettuces"> Lettuces</span>
                    </h1>
                    <p className="auth-brand-tagline">
                        {showRegister 
                            ? (t('createAccountTagline') || "Crea tu cuenta y únete a la experiencia")
                            : (t('brandTagline') || "No es antojo... es una experiencia..")}
                    </p>
                </div>

                {/* Lado derecho - Contenedor de formularios con animación de altura */}
                <div className="auth-forms-container">
                    <div className={`auth-form-content ${showRegister ? 'show-register' : ''}`}>
                        {!showRegister ? (
                            <Login onToggle={toggleAuth} />
                        ) : (
                            <Register onToggle={toggleAuth} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthContainer;