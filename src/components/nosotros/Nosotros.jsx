import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../../context/config';
import { HiMiniUserCircle } from "react-icons/hi2";
import { IoNotificationsCircle } from "react-icons/io5";
import { FiFileText, FiDownload, FiX } from "react-icons/fi";
import { MdPictureAsPdf } from "react-icons/md";
import '../../css/Nosotros/nosotros.css';

import logo from '../../img/DietLettuce.png';
import logolechuga from '../../img/DietLettuce.png';

// Importa tus archivos PDF
import canvaDietLettuce from '../../docs/canva-diet-lettuce.pdf';
import cartaUsuario from '../../docs/carta-usuario.pdf';
import FODADietLettuce from '../../docs/foda-diet-lettuce.pdf';
import BalanceDietLettuce from '../../docs/balance-diet-lettuce.pdf';

const Nosotros = () => {
  const { t } = useConfig();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', url: '', type: '' });
  
  // Verificar si el usuario está autenticado
  const isAuthenticated = localStorage.getItem('token') !== null;

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userData');
    navigate('/');
    window.location.reload();
  };

  // Función para abrir modal
  const openModal = (title, url, type) => {
    setModalContent({ title, url, type });
    setModalOpen(true);
    // Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
  };

  // Función para cerrar modal
  const closeModal = () => {
    setModalOpen(false);
    setModalContent({ title: '', url: '', type: '' });
    document.body.style.overflow = 'unset';
  };

  // Función para descargar archivo
  const downloadFile = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="nosotros">
      {/* Header */}
      <header className="nosotros-header">
        <nav className="nosotros-nav">
          <div className="nosotros-nav-brand">
            <div className="nosotros-logo-container">
              <img src={logo} alt="Diet Lettuce" className="nosotros-logo" />
              <h2>
                <span className="nosotros-crazy-swash">Diet</span> Lettuce
              </h2>
            </div>
          </div>
          <ul className="nosotros-nav-menu">
            <li><a href="/">{t('inicio')}</a></li>
            <li><a href="/productos">{t('productos')}</a></li>
            <li><a href="#nosotros">{t('nosotros')}</a></li>
            <li><a href="/configuracion">{t('configuracion')}</a></li>
            <li><a href="/login">{t('login')}</a></li>
            <li className="nav-profile-icon">
              <a href="/perfil" title="Mi Perfil">
                <HiMiniUserCircle className="profile-icon" />
              </a>
            </li>
            <li className="nav-profile-icon">
              <a href="/notificacionesUser" title="Notifycation">
                <IoNotificationsCircle className="profile-icon" />
              </a>
            </li>
            {isAuthenticated && (
              <li>
                <button 
                  onClick={handleLogout} 
                  className="nosotros-logout-btn"
                  title="Cerrar Sesión"
                >
                  Cerrar Sesión
                </button>
              </li>
            )}
          </ul>
        </nav>
      </header>

      {/* Hero Nosotros */}
      <section className="nosotros-hero">
        <div className="nosotros-container">
          <h1 className="nosotros-title"> <span className="nosotros-crazy-swash-hero">Diet</span> Lettuce</h1>
          <p className="nosotros-subtitle">
           <span className="nosotros-crazy-swash-text">Diet</span> Lettuces {t('yNuestraPasion')}
          </p>
        </div>
      </section>

      {/* Misión, Visión, Valores, Objetivo y Metas */}
      <section className="nosotros-mvv-section">
        <div className="nosotros-container">
          <div className="nosotros-mvv-grid">

            {/* Misión */}
            <div className="nosotros-mvv-card nosotros-mision-card">
              <div className="nosotros-card-background"></div>
              <div className="nosotros-card-content">
                <div className="nosotros-mvv-icon-container">
                  <div className="nosotros-mvv-icon">
                    <i className="fas fa-bullseye"></i>
                    <img src={logolechuga} alt="Logo Diet Lettuce" className="nosotros-icon-logo" />
                  </div>
                </div>
                <h3>{t('mision')}</h3>
                <p>
                  {t('misionTexto')}
                </p>
              </div>
            </div>

            {/* Visión */}
            <div className="nosotros-mvv-card nosotros-vision-card">
              <div className="nosotros-card-background"></div>
              <div className="nosotros-card-content">
                <div className="nosotros-mvv-icon-container">
                  <div className="nosotros-mvv-icon">
                    <i className="fas fa-eye"></i>
                    <img src={logolechuga} alt="Logo Diet Lettuce" className="nosotros-icon-logo" />
                  </div>
                </div>
                <h3>{t('vision')}</h3>
                <p>
                  {t('visionTexto')}
                </p>
              </div>
            </div>

            {/* Valores */}
            <div className="nosotros-mvv-card nosotros-valores-card">
              <div className="nosotros-card-background"></div>
              <div className="nosotros-card-content">
                <div className="nosotros-mvv-icon-container">
                  <div className="nosotros-mvv-icon">
                    <i className="fas fa-heart"></i>
                    <img src={logolechuga} alt="Logo Diet Lettuce" className="nosotros-icon-logo" />
                  </div>
                </div>
                <h3>{t('valores')}</h3>
                <div className="nosotros-valores-list">
                  <div className="nosotros-valor-item">
                    <i className="fas fa-star"></i>
                    <span>{t('calidad')}</span>
                  </div>
                  <div className="nosotros-valor-item">
                    <i className="fas fa-lightbulb"></i>
                    <span>{t('responsabilidadAmbiental')}</span>
                  </div>
                  <div className="nosotros-valor-item">
                    <i className="fas fa-laugh"></i>
                    <span>{t('honestidad')}</span>
                  </div>
                  <div className="nosotros-valor-item">
                    <i className="fas fa-users"></i>
                    <span>{t('compromisoSalud')}</span>
                  </div>
                  <div className="nosotros-valor-item">
                    <i className="fas fa-thumbs-up"></i>
                    <span>{t('responsabilidadSocial')}</span>
                  </div>
                  <div className="nosotros-valor-item">
                    <i className="fas fa-handshake"></i>
                    <span>{t('cuidadoCliente')}</span>
                  </div>
                  <div className="nosotros-valor-item">
                    <i className="fas fa-seedling"></i>
                    <span>{t('atencionCliente')}</span>
                  </div>
                  <div className="nosotros-valor-item">
                    <i className="fas fa-hands-helping"></i>
                    <span>{t('didiplina')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Objetivo */}
            <div className="nosotros-mvv-card nosotros-mision-card">
              <div className="nosotros-card-background"></div>
              <div className="nosotros-card-content">
                <div className="nosotros-mvv-icon-container">
                  <div className="nosotros-mvv-icon">
                    <i className="fas fa-bullseye"></i>
                    <img src={logolechuga} alt="Logo Diet Lettuce" className="nosotros-icon-logo" />
                  </div>
                </div>
                <h3>{t('objetivo')}</h3>
                <p>
                  {t('objetivoTexto')}
                </p>
              </div>
            </div>

            {/* Metas */}
            <div className="nosotros-mvv-card nosotros-metas-card">
              <div className="nosotros-card-background"></div>
              <div className="nosotros-card-content">
                <div className="nosotros-mvv-icon-container">
                  <div className="nosotros-mvv-icon">
                    <i className="fas fa-chart-line"></i>
                    <img src={logolechuga} alt="Logo Diet Lettuce" className="nosotros-icon-logo" />
                  </div>
                </div>
                <h3>{t('metas')}</h3>
                <p>
                  {t('metasTexto')}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Documentos Section - Canva y Carta de Usuario */}
      <section className="nosotros-documentos-section">
        <div className="nosotros-container">
          <h2 className="nosotros-documentos-title">Documentos Importantes</h2>
          <div className="nosotros-documentos-grid">
            
            {/* Canva Document */}
            <div className="nosotros-documento-card">
              <div className="nosotros-documento-icon">
                <MdPictureAsPdf />
              </div>
              <h3>Canva Diet Lettuce</h3>
              <p>Presentación y diseño de nuestra marca</p>
              <div className="nosotros-documento-buttons">
                <button 
                  className="nosotros-documento-btn ver"
                  onClick={() => openModal('Canva Diet Lettuce', canvaDietLettuce, 'pdf')}
                >
                  Ver
                </button>
                <button 
                  className="nosotros-documento-btn descargar"
                  onClick={() => downloadFile(canvaDietLettuce, 'canva-diet-lettuce.pdf')}
                >
                  <FiDownload /> Descargar
                </button>
              </div>
            </div>

            {/* Carta de Usuario */}
            <div className="nosotros-documento-card">
              <div className="nosotros-documento-icon">
                <FiFileText />
              </div>
              <h3>Carta del Usuario</h3>
              <p>Términos y condiciones para usuarios</p>
              <div className="nosotros-documento-buttons">
                <button 
                  className="nosotros-documento-btn ver"
                  onClick={() => openModal('Carta del Usuario', cartaUsuario, 'pdf')}
                >
                  Ver
                </button>
                <button 
                  className="nosotros-documento-btn descargar"
                  onClick={() => downloadFile(cartaUsuario, 'carta-usuario.pdf')}
                >
                  <FiDownload /> Descargar
                </button>
              </div>
            </div>

            {/* Balance Document */}
            <div className="nosotros-documento-card">
              <div className="nosotros-documento-icon">
                <MdPictureAsPdf />
              </div>
              <h3>Balance Diet Lettuce</h3>
              <p>Presentación y diseño de nuestra marca</p>
              <div className="nosotros-documento-buttons">
                <button 
                  className="nosotros-documento-btn ver"
                  onClick={() => openModal('Balance Diet Lettuce', BalanceDietLettuce, 'pdf')}
                >
                  Ver
                </button>
                <button 
                  className="nosotros-documento-btn descargar"
                  onClick={() => downloadFile(BalanceDietLettuce, 'balance-diet-lettuce.pdf')}
                >
                  <FiDownload /> Descargar
                </button>
              </div>
            </div>

            {/* FODA Document */}
            <div className="nosotros-documento-card">
              <div className="nosotros-documento-icon">
                <MdPictureAsPdf />
              </div>
              <h3>Foda Diet Lettuce</h3>
              <p>Presentación y diseño de nuestra marca</p>
              <div className="nosotros-documento-buttons">
                <button 
                  className="nosotros-documento-btn ver"
                  onClick={() => openModal('FODA Diet Lettuce', FODADietLettuce, 'pdf')}
                >
                  Ver
                </button>
                <button 
                  className="nosotros-documento-btn descargar"
                  onClick={() => downloadFile(FODADietLettuce, 'foda-diet-lettuce.pdf')}
                >
                  <FiDownload /> Descargar
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Modal para visualizar PDF */}
      {modalOpen && (
        <div className="nosotros-modal-overlay" onClick={closeModal}>
          <div className="nosotros-modal-content" onClick={e => e.stopPropagation()}>
            <div className="nosotros-modal-header">
              <h3>{modalContent.title}</h3>
              <button className="nosotros-modal-close" onClick={closeModal}>
                <FiX />
              </button>
            </div>
            <div className="nosotros-modal-body">
              <iframe 
                src={modalContent.url}
                title={modalContent.title}
                width="100%"
                height="600px"
                frameBorder="0"
              />
            </div>
            <div className="nosotros-modal-footer">
              <button 
                className="nosotros-documento-btn descargar"
                onClick={() => downloadFile(modalContent.url, `${modalContent.title.toLowerCase().replace(/\s+/g, '-')}.pdf`)}
              >
                <FiDownload /> Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="nosotros-footer">
        <div className="nosotros-container">
          <div className="nosotros-footer-content">
            <div className="nosotros-footer-section">
              <div className="nosotros-footer-logo-container">
                <img src={logo} alt="Diet Lettuce" className="nosotros-footer-logo" />
                <h3>
                  <span className="nosotros-crazy-swash">Diet</span> Lettuce
                </h3>
              </div>
              <p>{t('footerDescription')}</p>
            </div>
            <div className="nosotros-footer-section">
              <h4>{t('contacto')}</h4>
              <ul>
                <li><i className="fas fa-map-marker-alt"></i> {t('direccion')}</li>
                <li><i className="fas fa-phone"></i> {t('telefono1')}</li>
                <li><i className="fas fa-phone"></i> {t('telefono2')}</li>
                <li><i className="fas fa-phone"></i> {t('telefono3')}</li>
                <li><i className="fas fa-phone"></i> {t('telefono4')}</li>
                <li><i className="fas fa-envelope"></i> {t('email')}</li>
              </ul>
            </div>
          </div>
          <div className="nosotros-footer-bottom">
            <p>{t('derechos')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Nosotros;