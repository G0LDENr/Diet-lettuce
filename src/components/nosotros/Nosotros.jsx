import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../../context/config';
import { HiMiniUserCircle } from "react-icons/hi2";
import { IoNotificationsCircle } from "react-icons/io5";
import '../../css/Nosotros/nosotros.css';

// Imágenes para la sección de Esencia
import IconEsensia1 from '../../img/esensia1.png';
import IconEsensia2 from '../../img/esensia2.png';
import IconEsensia3 from '../../img/esensia3.png';
import IconEsensia4 from '../../img/esensia4.png';

// Logos
import logo from '../../img/Logo_balancea_titulo.png';
import logo_blanco_texto from '../../img/Logo_balancea_blanco_titulo.png';
import logo_hoja from '../../img/hoja.png';
import logo_valor from '../../img/aprobado.png'

// Iconos para las tarjetas MVV
import misionIcono from '../../img/orientacion.png';
import visionIcono from '../../img/foto.png';
import valoresIcono from '../../img/diamante.png';
import objetivoIcono from '../../img/montana.png';
import metasIcono from '../../img/barra-grafica.png';

// Iconos para la sección de estadísticas
import clientesIcono from '../../img/esensia2.png';
import productosIcono from '../../img/hoja.png';
import añosIcono from '../../img/calidad.png';
import entregasIcono from '../../img/calidad-balancea.png';

// Iconos para el footer
import calidadIcon from '../../img/calidad.png';
import envioIcon from '../../img/envio.png';
import pagosIcon from '../../img/pago-seguro.png';
import atencionIcon from '../../img/atencion.png';
import ubicacionIcon from '../../img/ubicacion-menu.png';
import telefonoIcon from '../../img/telefono-menu.png';
import emailIcon from '../../img/email-menu.png';
import dateIcon from '../../img/reloj.png';

// Importar Voice Assistant
import VoiceAssistant from '../../components/Voz/VoiceAssistant';

const Nosotros = () => {
  const { t, darkMode } = useConfig();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', url: '', type: '' });
  
  const isAuthenticated = localStorage.getItem('token') !== null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userData');
    navigate('/');
  };

  const openModal = (title, url, type) => {
    setModalContent({ title, url, type });
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent({ title: '', url: '', type: '' });
    document.body.style.overflow = 'unset';
  };

  const downloadFile = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Items de Esencia
  const esenciaItems = [
    { id: 1, icon: IconEsensia1, title: "Pasión por el Bienestar", description: "Creemos en el poder de los hábitos saludables para transformar vidas.", keepColor: true },
    { id: 2, icon: IconEsensia2, title: "Compromiso con Nuestros Clientes", description: "Escuchamos, entendemos y acompañamos en cada paso del camino.", keepColor: false },
    { id: 3, icon: IconEsensia3, title: "Innovación Natural", description: "Desarrollamos fórmulas efectivas con ingredientes de origen natural.", keepColor: false },
    { id: 4, icon: IconEsensia4, title: "Excelencia en Cada Producto", description: "Seguimos altos estándares para garantizar productos seguros y efectivos.", keepColor: false }
  ];

  const valoresItems = [
    { key: 'calidad', label: t('calidad') || 'Calidad' },
    { key: 'integridad', label: t('integridad') || 'Integridad' },
    { key: 'compromiso', label: t('compromiso') || 'Compromiso' },
    { key: 'innovacion', label: t('innovacion') || 'Innovación' },
    { key: 'respeto', label: t('respeto') || 'Respeto' }
  ];

  const metasItems = [
    { key: 'meta1', label: t('meta1') || 'Alcanzar 5000 clientes satisfechos en el primer año' },
    { key: 'meta2', label: t('meta2') || 'Expandir presencia a 3 ciudades más durante el próximo año' },
    { key: 'meta3', label: t('meta3') || 'Desarrollar 5 nuevos productos naturales para 2026' }
  ];

  // Items de estadísticas
  const statsItems = [
    { id: 1, number: "10K+", title: "Clientes Satisfechos", description: "Personas que confían en nuestros productos.", icon: clientesIcono },
    { id: 2, number: "50+", title: "Productos Naturales", description: "Fórmulas desarrolladas con ingredientes de calidad.", icon: productosIcono },
    { id: 3, number: "98%", title: "Satisfacción", description: "De nuestros clientes recomendarían Balancea.", icon: añosIcono },
    { id: 4, number: "Calidad", title: "Certificada", description: "Productos aprobados y bajo estrictos estándares.", icon: entregasIcono }
  ];

  // Efecto para escuchar eventos de voz
  useEffect(() => {
    const handleVoiceScroll = (event) => {
      if (event.detail.section === 'esencia') {
        document.querySelector('.nosotros-hero-right')?.scrollIntoView({ behavior: 'smooth' });
      } else if (event.detail.section === 'mision-vision') {
        document.querySelector('.nosotros-mvv-section')?.scrollIntoView({ behavior: 'smooth' });
      } else if (event.detail.section === 'estadisticas') {
        document.querySelector('.nosotros-stats-section')?.scrollIntoView({ behavior: 'smooth' });
      } else if (event.detail.section === 'footer') {
        document.querySelector('.home-footer')?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    const handleVoiceFilter = (event) => {
      if (event.detail.categoria === 'mision') {
        const misionCard = document.querySelector('.nosotros-mvv-card:first-child');
        misionCard?.scrollIntoView({ behavior: 'smooth' });
        misionCard?.classList.add('highlight-card');
        setTimeout(() => misionCard?.classList.remove('highlight-card'), 2000);
      } else if (event.detail.categoria === 'vision') {
        const visionCard = document.querySelector('.nosotros-mvv-card:nth-child(2)');
        visionCard?.scrollIntoView({ behavior: 'smooth' });
        visionCard?.classList.add('highlight-card');
        setTimeout(() => visionCard?.classList.remove('highlight-card'), 2000);
      } else if (event.detail.categoria === 'valores') {
        const valoresCard = document.querySelector('.nosotros-mvv-card:nth-child(3)');
        valoresCard?.scrollIntoView({ behavior: 'smooth' });
        valoresCard?.classList.add('highlight-card');
        setTimeout(() => valoresCard?.classList.remove('highlight-card'), 2000);
      } else if (event.detail.categoria === 'objetivo') {
        const objetivoCard = document.querySelector('.nosotros-mvv-card:nth-child(4)');
        objetivoCard?.scrollIntoView({ behavior: 'smooth' });
        objetivoCard?.classList.add('highlight-card');
        setTimeout(() => objetivoCard?.classList.remove('highlight-card'), 2000);
      } else if (event.detail.categoria === 'metas') {
        const metasCard = document.querySelector('.nosotros-mvv-card:nth-child(5)');
        metasCard?.scrollIntoView({ behavior: 'smooth' });
        metasCard?.classList.add('highlight-card');
        setTimeout(() => metasCard?.classList.remove('highlight-card'), 2000);
      }
    };

    window.addEventListener('voiceScroll', handleVoiceScroll);
    window.addEventListener('voiceFilter', handleVoiceFilter);

    return () => {
      window.removeEventListener('voiceScroll', handleVoiceScroll);
      window.removeEventListener('voiceFilter', handleVoiceFilter);
    };
  }, []);

  return (
    <div className={`nosotros ${darkMode ? 'dark-mode' : ''}`}>
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
            <li><a href="/nosotros" className="active">{t('nosotros') || 'Nosotros'}</a></li>
            <li><a href="/dietas">{t('dietas') || 'Dietas'}</a></li>
            <li><a href="/configuracion">{t('configuracion') || 'Configuración'}</a></li>
          </ul>
          <div className="header-right">
            <div className="nav-profile-icon">
              <a href="/perfil" title="Mi Perfil"><HiMiniUserCircle className="profile-icon" /></a>
            </div>
            <div className="nav-profile-icon">
              <a href="/notificacionesUser" title="Notificaciones"><IoNotificationsCircle className="profile-icon" /></a>
            </div>
            {!isAuthenticated && <a href="/login" className="home-login-btn">Login</a>}
            {isAuthenticated && <button onClick={handleLogout} className="home-logout-btn" title="Cerrar Sesión">Cerrar Sesión</button>}
          </div>
        </nav>
      </header>

      <section className="nosotros-hero">
        <div className="nosotros-hero-container">
          <div className="nosotros-hero-left">
            <div className="nosotros-hero-content">
              <h1 className="nosotros-title">NOSOTROS</h1>
              <p className="nosotros-subtitle-cursiva">Equilibra tu vida</p>
              <p className="nosotros-description">
                En <strong>Balancea</strong>, nos dedicamos a ofrecer productos de alta calidad que ayudan a las personas 
                a alcanzar sus metas de salud y bienestar. Nuestro compromiso es brindar soluciones naturales y efectivas 
                para mejorar tu calidad de vida.
              </p>
            </div>
          </div>
          <div className="nosotros-hero-right">
            <div className="esencia-container">
              <div className="esencia-header">
                <h2 className="esencia-title">Nuestra Esencia</h2>
                <div className="esencia-line"></div>
              </div>
              <div className="esencia-circulos">
                {esenciaItems.map((item) => (
                  <div key={item.id} className="esencia-item">
                    <div className="esencia-circulo">
                      <img 
                        src={item.icon} 
                        alt={item.title} 
                        className={`esencia-icon-img ${!item.keepColor ? 'filter-white' : ''}`} 
                      />
                    </div>
                    <h3 className="esencia-item-title">{item.title}</h3>
                    <p className="esencia-item-description">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="nosotros-mvv-section">
        <div className="nosotros-container">
          <div className="nosotros-mvv-grid">
            {/* Misión */}
            <div className="nosotros-mvv-card">
              <div className="nosotros-card-content">
                <div className="nosotros-mvv-icon-container">
                  <div className="nosotros-mvv-icon">
                    <img src={misionIcono} alt="Misión" className="mvv-icono-img" />
                  </div>
                </div>
                <h3>{t('mision') || 'Misión'}</h3>
                <div className="nosotros-mvv-title-line"></div>
                <p>{t('misionTexto') || 'Proveer soluciones naturales y efectivas para el bienestar integral de las personas.'}</p>
              </div>
            </div>

            {/* Visión */}
            <div className="nosotros-mvv-card">
              <div className="nosotros-card-content">
                <div className="nosotros-mvv-icon-container">
                  <div className="nosotros-mvv-icon">
                    <img src={visionIcono} alt="Visión" className="mvv-icono-img" />
                  </div>
                </div>
                <h3>{t('vision') || 'Visión'}</h3>
                <div className="nosotros-mvv-title-line"></div>
                <p>{t('visionTexto') || 'Ser líder en suplementos naturales, transformando vidas y promoviendo salud.'}</p>
              </div>
            </div>

            {/* Valores */}
            <div className="nosotros-mvv-card">
              <div className="nosotros-card-content">
                <div className="nosotros-mvv-icon-container">
                  <div className="nosotros-mvv-icon">
                    <img src={valoresIcono} alt="Valores" className="mvv-icono-img" />
                  </div>
                </div>
                <h3>{t('valores') || 'Valores'}</h3>
                <div className="nosotros-mvv-title-line"></div>
                <div className="nosotros-valores-lista">
                  {valoresItems.map((item, index) => (
                    <div key={index} className="nosotros-valor-punto">
                      <img src={logo_valor} alt="icono" className="valor-icono" />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Objetivo */}
            <div className="nosotros-mvv-card">
              <div className="nosotros-card-content">
                <div className="nosotros-mvv-icon-container">
                  <div className="nosotros-mvv-icon">
                    <img src={objetivoIcono} alt="Objetivo" className="mvv-icono-img" />
                  </div>
                </div>
                <h3>{t('objetivo') || 'Objetivo'}</h3>
                <div className="nosotros-mvv-title-line"></div>
                <p>{t('objetivoTexto') || 'Brindar productos de alta calidad que contribuyan al bienestar físico y mental.'}</p>
              </div>
            </div>

            {/* Metas */}
            <div className="nosotros-mvv-card">
              <div className="nosotros-card-content">
                <div className="nosotros-mvv-icon-container">
                  <div className="nosotros-mvv-icon">
                    <img src={metasIcono} alt="Metas" className="mvv-icono-img" />
                  </div>
                </div>
                <h3>{t('metas') || 'Metas'}</h3>
                <div className="nosotros-mvv-title-line"></div>
                <div className="nosotros-metas-lista">
                  {metasItems.map((item, index) => (
                    <div key={index} className="nosotros-meta-punto">
                      <img src={logo_valor} alt="icono" className="meta-icono" />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECCIÓN DE ESTADÍSTICAS ========== */}
      <section className="nosotros-stats-section">
        <div className="stats-background">
          <div className="stats-container">
            <div className="stats-grid">
              {statsItems.map((item) => (
                <div key={item.id} className="stat-card">
                  <div className="stat-icon">
                    <img src={item.icon} alt={item.title} className="stat-icon-img" />
                  </div>
                  <div className="stat-content">
                    <h3 className="stat-number">{item.number}</h3>
                    <p className="stat-title">{item.title}</p>
                    <p className="stat-description">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

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

      {/* Voice Assistant - Integrado */}
      <VoiceAssistant page="nosotros" />
    </div>
  );
};

export default Nosotros;