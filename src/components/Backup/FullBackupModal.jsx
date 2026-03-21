import React from 'react';

const FullBackupModal = ({ show, onClose, onCreate, customName, setCustomName, loading }) => {
  if (!show) return null;

  return (
    <div className="backup-modal-overlay">
      <div className="backup-modal-content backup-backup-modal">
        <div className="backup-modal-header">
          <h3>Crear Respaldo Completo</h3>
          <button onClick={onClose} className="backup-close-modal">✕</button>
        </div>
        
        <div className="backup-modal-body">
          <div className="backup-backup-icon">
            💾
          </div>
          
          <p className="backup-backup-description">
            Se creará un respaldo <strong>completo</strong> de toda la base de datos, incluyendo todas las tablas, procedimientos y estructuras.
          </p>
          
          <div className="backup-info-box">
            <div className="backup-info-icon">ℹ</div>
            <div className="backup-info-content">
              <p><strong>Información importante:</strong></p>
              <ul>
                <li>Tamaño aproximado: Depende del tamaño de tu BD</li>
                <li>Tiempo estimado: Variable según el tamaño</li>
                <li>El archivo se guardará en el servidor</li>
              </ul>
            </div>
          </div>
          
          <div className="backup-form-group">
            <label htmlFor="backupName">Nombre personalizado (opcional)</label>
            <input
              type="text"
              id="backupName"
              className="backup-form-control"
              placeholder="Ej: respaldo_marzo_2024"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />
            <small className="backup-form-text">
              Si se deja vacío, se generará un nombre automático con la fecha y hora
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
            className="backup-modal-btn primary"
            onClick={onCreate}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="backup-btn-spinner"></span>
                Creando...
              </>
            ) : (
              'Crear Respaldo Completo'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FullBackupModal;