import React, { useState } from 'react';

const BackupCodeModal = ({ show, onClose, notificacion, darkMode }) => {
  const [copied, setCopied] = useState(false);

  if (!show || !notificacion) return null;

  const copyToClipboard = () => {
    if (notificacion.backupCode) {
      navigator.clipboard.writeText(notificacion.backupCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="modal-overlay-pedido" onClick={onClose}>
      <div className="modal-content large-modal backup-code-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{notificacion.titulo}</h3>
          <button className="close-modal" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="backup-code-date">
            <span className="date-label">Fecha:</span>
            <span className="date-value">{notificacion.fecha}</span>
          </div>
          
          <div className="backup-code-message">
            <p>{notificacion.mensaje.replace(/\*\*([A-Za-z0-9]{16})\*\*/, '')}</p>
          </div>
          
          <div className="backup-code-display-container">
            <div className="backup-code-label">Tu código único de respaldo:</div>
            <div className="backup-code-box-large">
              <code className="backup-code-large">{notificacion.backupCode}</code>
              <button 
                className={`backup-copy-btn-large ${copied ? 'copied' : ''}`}
                onClick={copyToClipboard}
              >
                {copied ? '✓ Copiado' : 'Copiar código'}
              </button>
            </div>
          </div>
          
          <div className="backup-code-warning-large">
            <div className="warning-icon">⚠️</div>
            <div className="warning-text">
              <strong>IMPORTANTE:</strong> Este código es permanente.<br />
              <strong>Al cerrar esta ventana, la notificación se eliminará automáticamente.</strong><br />
              Asegúrate de copiar y guardar tu código en un lugar seguro antes de salir.
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar y Eliminar Notificación
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackupCodeModal;