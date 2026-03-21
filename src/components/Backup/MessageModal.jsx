import React from 'react';

const MessageModal = ({ show, onClose, title, message, type }) => {
  if (!show) return null;

  const getIcon = () => {
    switch(type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getTitle = () => {
    switch(type) {
      case 'success': return '¡Éxito!';
      case 'error': return 'Error';
      case 'warning': return 'Advertencia';
      case 'info': return 'Información';
      default: return title;
    }
  };

  return (
    <div className="backup-message-overlay">
      <div className={`backup-message-modal ${type}`}>
        <div className="backup-message-icon-container">
          <span className="backup-message-icon">{getIcon()}</span>
        </div>
        
        <div className="backup-message-content">
          <h3 className="backup-message-title">{getTitle()}</h3>
          <p className="backup-message-text">{message}</p>
        </div>
        
        <div className="backup-message-actions">
          <button 
            className={`backup-message-btn ${type}`}
            onClick={onClose}
          >
            Aceptar
          </button>
        </div>
        
        <button 
          className="backup-message-close"
          onClick={onClose}
          title="Cerrar"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default MessageModal;