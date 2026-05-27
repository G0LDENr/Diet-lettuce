import React, { useState } from 'react';

const DeleteConfirmModal = ({ show, onClose, onCodeSubmit, backupName, loading }) => {
  const [backupCode, setBackupCode] = useState('');

  if (!show) return null;

  const handleSubmit = () => {
    if (!backupCode) {
      alert('Por favor ingresa el código de respaldo');
      return;
    }
    onCodeSubmit(backupCode);
  };

  // Truncar nombre si es muy largo para mostrar
  const getDisplayName = (name) => {
    if (!name) return '';
    if (name.length > 50) {
      return name.substring(0, 47) + '...';
    }
    return name;
  };

  return (
    <div className="backup-modal-overlay">
      <div className="backup-modal-content backup-code-modal" style={{ maxWidth: '450px' }}>
        <div className="backup-modal-header">
          <h3>🔐 Eliminar Respaldo</h3>
          <button onClick={onClose} className="backup-close-modal">✕</button>
        </div>
        
        <div className="backup-modal-body">
          <div className="backup-delete-icon">
            ⚠️
          </div>
          
          <p className="backup-delete-message">
            ¿Estás seguro de que quieres eliminar el respaldo?
          </p>
          
          <div className="backup-filename-container">
            <strong className="backup-filename-label">Archivo:</strong>
            <code className="backup-filename-code" title={backupName}>
              {getDisplayName(backupName)}
            </code>
          </div>
          
          <p className="backup-delete-warning">
            Esta acción eliminará permanentemente el archivo físico del servidor.
          </p>
          
          <div className="backup-code-input-container">
            <label htmlFor="deleteBackupCode">Código de respaldo:</label>
            <input
              type="text"
              id="deleteBackupCode"
              className="backup-form-control"
              placeholder="Código de 16 caracteres"
              value={backupCode}
              onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
              autoFocus
              style={{ 
                textTransform: 'uppercase', 
                letterSpacing: '1px',
                fontFamily: 'monospace',
                fontSize: '1rem',
                textAlign: 'center'
              }}
            />
            <small className="backup-form-text">
              Ingresa tu código de respaldo para confirmar la eliminación.
            </small>
          </div>
        </div>
        
        <div className="backup-modal-footer">
          <button 
            className="backup-modal-btn cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            className="backup-modal-btn danger"
            onClick={handleSubmit}
            disabled={loading || !backupCode}
          >
            {loading ? 'Eliminando...' : 'Confirmar Eliminación'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;