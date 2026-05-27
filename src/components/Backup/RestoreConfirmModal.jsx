import React, { useState } from 'react';

const RestoreConfirmModal = ({ show, onClose, onConfirm, backupName }) => {
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleRestoreClick = () => {
    setShowCodeModal(true);
  };

  const handleConfirmRestore = () => {
    if (!backupCode) {
      alert('Por favor ingresa el código de respaldo');
      return;
    }
    setLoading(true);
    onConfirm(backupCode);
  };

  const handleCloseAll = () => {
    setShowCodeModal(false);
    setBackupCode('');
    setLoading(false);
    onClose();
  };

  return (
    <>
      {/* Modal de confirmación de restauración */}
      {!showCodeModal && (
        <div className="backup-modal-overlay-delete">
          <div className="backup-modal-content backup-confirm-modal backup-restore-modal">
            <div className="backup-confirm-header">
              <h3>Restaurar Base de Datos</h3>
            </div>
            <div className="backup-confirm-body">
              <div className="backup-confirm-icon">⚠️</div>
              <div className="backup-confirm-message">
                ¿Restaurar desde <strong>"{backupName}"</strong>?
              </div>
              <div className="backup-confirm-warning">
                <strong>ADVERTENCIA:</strong> Esta acción sobrescribirá la base de datos actual.
              </div>
            </div>
            <div className="backup-confirm-actions">
              <button className="backup-confirm-btn cancel" onClick={handleCloseAll}>
                Cancelar
              </button>
              <button className="backup-confirm-btn confirm" onClick={handleRestoreClick}>
                Sí, Restaurar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para ingresar código de respaldo */}
      {showCodeModal && (
        <div className="backup-modal-overlay">
          <div className="backup-modal-content backup-code-modal" style={{ maxWidth: '450px' }}>
            <div className="backup-modal-header">
              <h3>🔐 Código de Respaldo</h3>
              <button 
                onClick={() => {
                  setShowCodeModal(false);
                  setBackupCode('');
                }} 
                className="backup-close-modal"
              >
                ✕
              </button>
            </div>
            <div className="backup-modal-body">
              <p>Para restaurar la base de datos, necesitas ingresar tu código único de respaldo:</p>
              <input
                type="text"
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
              <small className="backup-form-text" style={{ display: 'block', marginTop: '10px' }}>
                ⚠️ Este código es PERMANENTE. Guárdalo en un lugar seguro.
              </small>
            </div>
            <div className="backup-modal-footer">
              <button 
                className="backup-modal-btn cancel"
                onClick={() => {
                  setShowCodeModal(false);
                  setBackupCode('');
                }}
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                className="backup-modal-btn primary"
                onClick={handleConfirmRestore}
                disabled={!backupCode || loading}
              >
                {loading ? (
                  <>
                    <span className="backup-btn-spinner"></span>
                    Restaurando...
                  </>
                ) : (
                  'Confirmar y Restaurar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RestoreConfirmModal;