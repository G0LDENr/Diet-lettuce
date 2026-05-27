import React, { useState } from 'react';

const FullBackupModal = ({ show, onClose, onCreate, customName, setCustomName, loading, dbType = 'mysql' }) => {
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const [pendingCreate, setPendingCreate] = useState(false);

  if (!show) return null;

  const isMongoDB = dbType === 'mongodb';
  const itemsLabel = isMongoDB ? 'colecciones' : 'tablas';

  const handleCreateClick = () => {
    // Mostrar modal de código antes de crear
    setShowCodeModal(true);
  };

  const handleConfirmCreate = () => {
    if (!backupCode) {
      alert('Por favor ingresa el código de respaldo');
      return;
    }
    setPendingCreate(true);
    // Llamar a onCreate con el código
    onCreate(backupCode);
  };

  return (
    <>
      {/* Modal principal */}
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
              Se creará un respaldo <strong>completo</strong> de toda la base de datos, incluyendo todas las {itemsLabel}, procedimientos y estructuras.
            </p>
            
            <div className="backup-info-box">
              <div className="backup-info-icon">ℹ</div>
              <div className="backup-info-content">
                <p><strong>Información importante:</strong></p>
                <ul>
                  <li>Tamaño aproximado: Depende del tamaño de tu BD</li>
                  <li>Tiempo estimado: Variable según el tamaño</li>
                  <li>El archivo se guardará en el servidor</li>
                  <li>Se requiere el código único de respaldo</li>
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
              onClick={handleCreateClick}
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
              <p>Para crear un respaldo completo, necesitas ingresar tu código único de respaldo:</p>
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
                ⚠️ Este código es PERMANENTE. Guárdalo en un lugar seguro.<br />
                Se usará para autenticar todas tus operaciones de respaldo.
              </small>
            </div>
            <div className="backup-modal-footer">
              <button 
                className="backup-modal-btn cancel"
                onClick={() => {
                  setShowCodeModal(false);
                  setBackupCode('');
                }}
              >
                Cancelar
              </button>
              <button 
                className="backup-modal-btn primary"
                onClick={handleConfirmCreate}
                disabled={!backupCode || pendingCreate}
              >
                {pendingCreate ? (
                  <>
                    <span className="backup-btn-spinner"></span>
                    Verificando...
                  </>
                ) : (
                  'Confirmar y Crear'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FullBackupModal;