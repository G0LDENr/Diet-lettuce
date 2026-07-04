import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../../context/config';
import { HiMiniUserCircle } from "react-icons/hi2";
import { IoNotificationsCircle } from "react-icons/io5";
import '../../css/Config/config.css';

// Logos y assets
import logo from '../../img/Logo_balancea_titulo.png';
import logo_blanco_texto from '../../img/Logo_balancea_blanco_titulo.png';
import logo_hoja from '../../img/hoja.png';

import configLogo from '../../img/Icons-Settings.png';
import idiomaIcono from '../../img/Icons-Language.png';
import temaIcono from '../../img/Icons-ModeDark.png';
import informacionIcono from '../../img/hoja-config.png';

// Iconos de banderas
import esFlag from '../../img/mexico.png';
import enFlag from '../../img/estados-unidos.png';

// Iconos para los botones de tema
import solIcono from '../../img/soleado.png';
import lunaIcono from '../../img/luna.png';

// Iconos para el footer
import calidadIcon from '../../img/calidad.png';
import envioIcon from '../../img/envio.png';
import pagosIcon from '../../img/pago-seguro.png';
import atencionIcon from '../../img/atencion.png';
import ubicacionIcon from '../../img/ubicacion-menu.png';
import telefonoIcon from '../../img/telefono-menu.png';
import emailIcon from '../../img/email-menu.png';
import dateIcon from '../../img/reloj.png';

const Configuracion = () => {
  const { language, darkMode, toggleLanguage, toggleDarkMode, t } = useConfig();
  const navigate = useNavigate();
  
  // Verificar si el usuario está autenticado
  const isAuthenticated = localStorage.getItem('token') !== null;

  // Opciones de idioma con banderas
  const languageOptions = [
    { value: 'es', label: 'Español', flag: '🇪🇸', flagImg: esFlag },
    { value: 'en', label: 'English', flag: '🇬🇧', flagImg: enFlag }
  ];

  // Obtener el idioma actual para mostrar
  const currentLanguage = languageOptions.find(opt => opt.value === language) || languageOptions[0];

  return (
    <div className={`config ${darkMode ? 'dark-mode' : ''}`}>
      {/* Header - Mismo diseño que nosotros */}
      <header className="home-header">
        <nav className="home-nav">
          <div className="home-nav-brand">
            <div className="home-logo-container">
              <img src={logo} alt="Balancea" className="home-logo" />
            </div>
          </div>
          <ul className="home-nav-menu">
            <li><a href="/">{t('inicio') || 'Inicio'}</a></li>
            <li><a href="/productos">{t('productos') || 'Productos'}</a></li>
            <li><a href="/nosotros">{t('nosotros') || 'Nosotros'}</a></li>
            <li><a href="/dietas">{t('dietas') || 'Dietas'}</a></li>
            <li><a href="/configuracion" className="active">{t('configuracion') || 'Configuración'}</a></li>
          </ul>
          <div className="header-right">
            <div className="nav-profile-icon">
              <a href="/perfil" title="Mi Perfil"><HiMiniUserCircle className="profile-icon" /></a>
            </div>
            <div className="nav-profile-icon">
              <a href="/notificacionesUser" title="Notificaciones"><IoNotificationsCircle className="profile-icon" /></a>
            </div>
            {!isAuthenticated && <a href="/login" className="home-login-btn">Login</a>}
          </div>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section className="config-hero">
        <div className="config-hero-container">
          <div className="config-hero-left">
            <h1 className="config-hero-title">Configuración</h1>
            <p className="config-hero-description">
              Personaliza tu experiencia en Balancea. Ajusta el idioma, el tema y gestiona tu cuenta según tus preferencias.
            </p>
          </div>
          <div className="config-hero-right">
            <div className="config-hero-logo-circle">
              <img src={configLogo} alt="Configuración" className="config-hero-logo" />
            </div>
          </div>
        </div>
      </section>

      {/* CUADROS DE CONFIGURACIÓN */}
      <div className="config-cuadros-wrapper">
        <div className="config-cuadros-container">
          
          {/* Cuadro 1: Idioma */}
          <div className="config-cuadro">
            <div className="config-cuadro-left">
              <div className="config-cuadro-icono">
                <img src={idiomaIcono} alt="Idioma" className="config-cuadro-icon-img" />
              </div>
              <div className="config-cuadro-info">
                <h3>Idioma</h3>
                <p>Selecciona tu idioma preferido para la interfaz de la aplicación.</p>
              </div>
            </div>
            <div className="config-cuadro-right">
              <div className="config-idioma-wrapper">
                <div className="config-idioma-label">Idioma actual</div>
                <select 
                  className="config-select config-select-large"
                  value={language}
                  onChange={toggleLanguage}
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"), url(${language === 'es' ? esFlag : enFlag})`,
                    backgroundRepeat: 'no-repeat, no-repeat',
                    backgroundPosition: 'right 16px center, left 12px center',
                    backgroundSize: '16px, 24px'
                  }}
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cuadro 2: Tema (Modo Oscuro/Claro) - CORREGIDO */}
          <div className="config-cuadro">
            <div className="config-cuadro-left">
              <div className="config-cuadro-icono">
                <img src={temaIcono} alt="Tema" className="config-cuadro-icon-img" />
              </div>
              <div className="config-cuadro-info">
                <h3>Tema</h3>
                <p>Elige entre modo claro u oscuro para una mejor experiencia visual.</p>
              </div>
            </div>
            <div className="config-cuadro-right">
              <div className="config-tema-wrapper">
                <div className="config-tema-label">Tema actual</div>
                <div className="config-botones-pegados">
                  <button 
                    className={`config-tema-btn ${!darkMode ? 'active' : ''}`}
                    onClick={() => {
                      if (darkMode) toggleDarkMode();
                    }}
                  >
                    <img src={solIcono} alt="Claro" className="tema-icon-img" />
                    Claro
                  </button>
                  <button 
                    className={`config-tema-btn ${darkMode ? 'active' : ''}`}
                    onClick={() => {
                      if (!darkMode) toggleDarkMode();
                    }}
                  >
                    <img src={lunaIcono} alt="Oscuro" className="tema-icon-img" />
                    Oscuro
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Cuadro 3: Información de la cuenta */}
          <div className="config-cuadro config-cuadro-info-especial">
            <div className="config-cuadro-left">
              <div className="config-cuadro-icono config-cuadro-icono-info">
                <img src={informacionIcono} alt="Información" className="config-cuadro-icon-img" />
              </div>
              <div className="config-cuadro-info">
                <h3>Tu experiencia, a tu manera</h3>
                <p>Personaliza la aplicación para que se adapte a tus necesidades y disfruta de una esperiencia más cómoda y agradable.</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-container">
          <div className="home-footer-content">
            <div className="home-footer-section footer-section-left">
              <div className="home-footer-logo-container">
                <img src={logo_blanco_texto} alt="Balancea" className="home-footer-logo" />
              </div>
              <p className="footer-description">EQUILIBRA TU VIDA</p>
              <p className="footer-subdescription">Tu decisión crea el equilibrio.</p>
            </div>
            <div className="home-footer-section footer-section-center">
              <h4>Productos</h4>
              <ul className="footer-list">
                <li><img src={logo_hoja} alt="Icono" className="footer-list-icon" /><a href="/productos">Proteínas</a></li>
                <li><img src={logo_hoja} alt="Icono" className="footer-list-icon" /><a href="/productos">Quemadores de Grasa</a></li>
                <li><img src={logo_hoja} alt="Icono" className="footer-list-icon" /><a href="/productos">Vitaminas</a></li>
                <li><img src={logo_hoja} alt="Icono" className="footer-list-icon" /><a href="/productos">Control de Apetito</a></li>
                <li><img src={logo_hoja} alt="Icono" className="footer-list-icon" /><a href="/productos">Energéticos Naturales</a></li>
              </ul>
              <button className="footer-shop-btn" onClick={() => window.location.href = '/productos'}>Ver todos los productos</button>
            </div>
            <div className="home-footer-section footer-section-right">
              <h4>Contacto</h4>
              <ul className="footer-list">
                <li><img src={ubicacionIcon} alt="Ubicación" className="footer-list-icon" /><span>Dirección</span></li>
                <li><img src={telefonoIcon} alt="Teléfono" className="footer-list-icon" /><span>Teléfono</span></li>
                <li><img src={emailIcon} alt="Email" className="footer-list-icon" /><span>Email</span></li>
                <li><img src={dateIcon} alt="Horario" className="footer-list-icon" /><span>Horario: Lun-Vie 9am-6pm</span></li>
              </ul>
            </div>
          </div>
          <div className="footer-divider"></div>
          <div className="footer-guarantees">
            <div className="guarantee-item"><img src={calidadIcon} alt="Calidad Garantizada" className="guarantee-icon" /><span>Calidad Garantizada</span></div>
            <div className="guarantee-item"><img src={envioIcon} alt="Envío Rápido" className="guarantee-icon" /><span>Envío Rápido</span></div>
            <div className="guarantee-item"><img src={pagosIcon} alt="Pagos Seguros" className="guarantee-icon" /><span>Pagos Seguros</span></div>
            <div className="guarantee-item"><img src={atencionIcon} alt="Atención al Cliente" className="guarantee-icon" /><span>Atención al Cliente</span></div>
            <div className="guarantee-last-divider"></div>
            <div className="home-footer-bottom"><p>© 2025 Balancea - Todos los derechos reservados</p></div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Configuracion;