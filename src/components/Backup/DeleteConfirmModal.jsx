import React from 'react';

const DeleteConfirmModal = ({ show, onClose, onConfirm, backupName }) => {
  if (!show) return null;

  return (
    <div className="backup-message-overlay">
      <div className="backup-message-modal warning">
        <div className="backup-message-icon-container">
          <span className="backup-message-icon">⚠️</span>
        </div>
        
        <div className="backup-message-content">
          <h3 className="backup-message-title">¿Eliminar Respaldo?</h3>
          <p className="backup-message-text">
            ¿Estás seguro de que quieres eliminar el respaldo <strong>"{backupName}"</strong>?
          </p>
          <p className="backup-message-warning">
            Esta acción eliminará permanentemente el archivo físico del servidor.
          </p>
        </div>
        
        <div className="backup-message-actions">
          <button 
            className="backup-message-btn cancel"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button 
            className="backup-message-btn error"
            onClick={() => onConfirm(backupName)}
          >
            Sí, Eliminar
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

export default DeleteConfirmModal;