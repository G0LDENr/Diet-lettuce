import React, { useState } from 'react';
import { FaInfoCircle, FaCheckCircle, FaCalendarAlt, FaHeart, FaShieldAlt, FaUsers } from 'react-icons/fa';
import { VscSettings, VscVersions } from "react-icons/vsc";
import '../../css/Perfil/informacion-sistema.css';

const ModalInformacionSistema = ({ isOpen, onClose }) => {
  const [successMessage, setSuccessMessage] = useState('');

  // Información del sistema para usuarios
  const sistemaInfo = [
    { id: 1, icon: VscVersions, title: "Versión actual", value: "2.1.0", desc: "Última versión estable" },
    { id: 2, icon: FaCalendarAlt, title: "Última actualización", value: "Junio 2024", desc: "Nuevas funciones y mejoras" },
    { id: 3, icon: FaHeart, title: "Hecho con", value: "México", desc: "Desarrollado con pasión" },
    { id: 4, icon: FaUsers, title: "Usuarios activos", value: "10,000+", desc: "Confían en Balancea" },
    { id: 5, icon: FaShieldAlt, title: "Seguridad", value: "Alta", desc: "Tus datos protegidos" }
  ];

  const handleClose = () => {
    setSuccessMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="sistema-modal-overlay" onClick={handleClose}>
      <div className="sistema-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="sistema-modal-header">
          <div className="sistema-modal-logo">
            <VscSettings />
          </div>
          <div className="sistema-modal-header-info">
            <h3>Información del Sistema</h3>
            <div className="sistema-modal-header-subtitle">Conoce más sobre Balancea</div>
          </div>
          <button className="sistema-modal-close" onClick={handleClose}>✕</button>
        </div>

        {successMessage && (
          <div className="sistema-modal-success-message">
            <FaCheckCircle className="success-icon" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="sistema-modal-body">
          {/* Acerca de Balancea */}
          <div className="sistema-section">
            <div className="sistema-section-title">
              <FaInfoCircle className="section-icon" />
              <h4>Acerca de Balancea</h4>
            </div>
            <div className="sistema-about-content">
              <p className="sistema-description">
                Balancea es una plataforma de bienestar y salud que te ayuda a equilibrar tu vida mediante 
                productos naturales y suplementos de alta calidad. Nuestro compromiso es brindar soluciones 
                efectivas para mejorar tu calidad de vida.
              </p>
            </div>
          </div>

          {/* Información del Sistema */}
          <div className="sistema-section">
            <div className="sistema-section-title">
              <VscVersions className="section-icon" />
              <h4>Información del Sistema</h4>
            </div>
            <div className="sistema-info-list">
              {sistemaInfo.map((item) => (
                <div key={item.id} className="sistema-info-item">
                  <div className="sistema-info-icon">
                    <item.icon />
                  </div>
                  <div className="sistema-info-details">
                    <span className="sistema-info-label">{item.title}</span>
                    <div className="sistema-info-values">
                      <span className="sistema-info-value">{item.value}</span>
                      <span className="sistema-info-desc">{item.desc}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Misión y Visión */}
          <div className="sistema-section">
            <div className="sistema-section-title">
              <FaHeart className="section-icon" />
              <h4>Nuestra Filosofía</h4>
            </div>
            <div className="sistema-mission-vision">
              <div className="sistema-mission">
                <strong>Misión:</strong> Proveer soluciones naturales y efectivas para el bienestar integral de las personas.
              </div>
              <div className="sistema-vision">
                <strong>Visión:</strong> Ser líder en suplementos naturales, transformando vidas y promoviendo salud.
              </div>
            </div>
          </div>

          {/* Soporte */}
          <div className="sistema-section">
            <div className="sistema-section-title">
              <FaShieldAlt className="section-icon" />
              <h4>Soporte</h4>
            </div>
            <div className="sistema-support-content">
              <p className="sistema-support-text">
                ¿Necesitas ayuda? Contáctanos:
              </p>
              <div className="sistema-support-email">
                soporte@balancea.com
              </div>
              <div className="sistema-support-phone">
                55 1234 5678
              </div>
            </div>
          </div>

          <div className="sistema-copyright">
            <p>© 2025 Balancea - Todos los derechos reservados</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalInformacionSistema;