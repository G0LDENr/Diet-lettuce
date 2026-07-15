import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import { useConfig, Config } from '../../context/config';
import Logo from "../../img/Isotipo_balancea.png";
import Logo2 from "../../img/Logo_balancea_blanco_titulo.png";
import "../../css/Login/auth.css";
import { FaLeaf, FaHeart, FaStar, FaEnvelope, FaLock, FaShieldAlt, FaCreditCard, FaHeadset, FaArrowLeft, FaGlobe, FaMoon, FaSun } from 'react-icons/fa';

const AuthContainer = () => {
    const navigate = useNavigate();
    const { t, language, setLanguage, darkMode, toggleDarkMode } = useConfig();
    const [showRegister, setShowRegister] = useState(false);
    const [registerStep, setRegisterStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showLanguageMenu, setShowLanguageMenu] = useState(false);

    const toggleAuth = (targetStep = 0) => {
        setIsAnimating(true);
        window.history.replaceState({}, document.title);
        setTimeout(() => {
            setShowRegister(!showRegister);
            if (!showRegister) {
                setRegisterStep(0);
            }
            setTimeout(() => {
                setIsAnimating(false);
            }, 100);
        }, 50);
    };

    const handleRegisterStepChange = (step) => {
        setRegisterStep(step);
    };

    const handleGoBack = () => {
        navigate('/');
    };

    const toggleLanguageMenu = () => {
        setShowLanguageMenu(!showLanguageMenu);
    };

    const changeLanguage = (lang) => {
        setLanguage(lang);
        setShowLanguageMenu(false);
    };

    // Obtener el texto según el idioma actual
    const getText = (key) => {
        const texts = {
            back: { es: 'Volver', en: 'Back' },
            lightMode: { es: 'Modo Claro', en: 'Light Mode' },
            darkMode: { es: 'Modo Oscuro', en: 'Dark Mode' },
            welcomeBack: { es: '¡Bienvenido de nuevo!', en: 'Welcome back!' },
            loginToContinue: { es: 'Inicia sesión para continuar', en: 'Login to continue' },
            naturalIngredients: { es: 'Ingredientes Naturales', en: 'Natural Ingredients' },
            healthWellness: { es: 'Salud y Bienestar', en: 'Health & Wellness' },
            inspiringGoals: { es: 'Metas que inspiran', en: 'Inspiring Goals' },
            infoProtected: { es: 'Tu información está protegida', en: 'Your info is protected' },
            securePayment: { es: 'Pago 100% seguro', en: '100% secure payment' },
            support247: { es: 'Soporte 24/7', en: '24/7 Support' }
        };
        return texts[key]?.[language] || texts[key]?.es || key;
    };

    return (
        <div className={`auth-wrapper ${darkMode ? 'dark-mode' : ''}`}>
            {/* Botones superiores */}
            <div className="auth-top-buttons">
                <button 
                    className="auth-top-button auth-back-button"
                    onClick={handleGoBack}
                    title={getText('back')}
                >
                    <FaArrowLeft className="auth-button-icon" />
                    <span className="auth-button-text">{getText('back')}</span>
                </button>

                <div className="auth-top-right-buttons">
                    {/* Selector de idioma */}
                    <div className="auth-language-selector">
                        <button 
                            className="auth-top-button auth-language-button"
                            onClick={toggleLanguageMenu}
                        >
                            <FaGlobe className="auth-button-icon" />
                            <span className="auth-button-text">{language === 'es' ? 'ES' : 'EN'}</span>
                        </button>
                        {showLanguageMenu && (
                            <div className="auth-language-menu">
                                <button 
                                    className={`auth-language-option ${language === 'es' ? 'active' : ''}`}
                                    onClick={() => changeLanguage('es')}
                                >
                                    Español
                                </button>
                                <button 
                                    className={`auth-language-option ${language === 'en' ? 'active' : ''}`}
                                    onClick={() => changeLanguage('en')}
                                >
                                    English
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Botón de modo oscuro/claro */}
                    <button 
                        className="auth-top-button auth-theme-button"
                        onClick={toggleDarkMode}
                        title={darkMode ? getText('lightMode') : getText('darkMode')}
                    >
                        {darkMode ? (
                            <FaSun className="auth-button-icon" />
                        ) : (
                            <FaMoon className="auth-button-icon" />
                        )}
                        <span className="auth-button-text">
                            {darkMode ? getText('lightMode') : getText('darkMode')}
                        </span>
                    </button>
                </div>
            </div>

            <div className={`auth-container ${showRegister ? 'show-register' : ''} ${isAnimating ? 'animating' : ''}`}>
                {/* Lado izquierdo - Sección de marca */}
                <div className="auth-brand-section">
                    <div className="auth-brand-content">
                        {/* Logo 1 - SIN CÍRCULO */}
                        <div className="auth-logo-container">
                            <img src={Logo} alt="Crazy Lettuces Logo" className="auth-logo-image"/>
                        </div>

                        {/* Logo 2 - SIN CÍRCULO */}
                        <div className="auth-logo-container auth-secondary-logo">
                            <img src={Logo2} alt="Secondary Logo" className="auth-logo-image"/>
                        </div>
                        
                        {/* Tres círculos más pequeños */}
                        <div className="auth-brand-features">
                            <div className="auth-feature-item">
                                <div className="auth-feature-circle">
                                    <FaLeaf className="auth-feature-icon" />
                                </div>
                                <span className="auth-feature-label">{getText('naturalIngredients')}</span>
                            </div>
                            <div className="auth-feature-item">
                                <div className="auth-feature-circle">
                                    <FaHeart className="auth-feature-icon" />
                                </div>
                                <span className="auth-feature-label">{getText('healthWellness')}</span>
                            </div>
                            <div className="auth-feature-item">
                                <div className="auth-feature-circle">
                                    <FaStar className="auth-feature-icon" />
                                </div>
                                <span className="auth-feature-label">{getText('inspiringGoals')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lado derecho - Contenedor de formularios */}
                <div className="auth-forms-container">
                    <div className={`auth-form-content ${showRegister ? 'show-register' : ''}`}>
                        {!showRegister ? (
                            <>
                                <div className="auth-form-header">
                                    <h2 className="auth-form-title">{getText('welcomeBack')}</h2>
                                    <div className="auth-title-line"></div>
                                    <p className="auth-form-subtitle">{getText('loginToContinue')}</p>
                                </div>
                                <Login onToggle={() => toggleAuth(0)} />
                            </>
                        ) : (
                            <Register 
                                onToggle={() => toggleAuth(0)} 
                                initialStep={registerStep}
                                onStepChange={handleRegisterStepChange}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Footer con información de seguridad */}
            <div className="auth-footer-security">
                <div className="auth-security-item">
                    <FaShieldAlt className="auth-security-icon" />
                    <span>{getText('infoProtected')}</span>
                </div>
                <div className="auth-security-divider"></div>
                <div className="auth-security-item">
                    <FaCreditCard className="auth-security-icon" />
                    <span>{getText('securePayment')}</span>
                </div>
                <div className="auth-security-divider"></div>
                <div className="auth-security-item">
                    <FaHeadset className="auth-security-icon" />
                    <span>{getText('support247')}</span>
                </div>
            </div>
        </div>
    );
};

export default AuthContainer;