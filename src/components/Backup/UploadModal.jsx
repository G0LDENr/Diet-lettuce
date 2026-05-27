import React, { useState } from 'react';

const UploadModal = ({ show, onClose, onUpload, uploadFile, setUploadFile, uploading, uploadProgress, dbType = 'mysql' }) => {
  const [dragActive, setDragActive] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const [pendingUpload, setPendingUpload] = useState(false);

  if (!show) return null;

  const isMongoDB = dbType === 'mongodb';
  
  const acceptedFormats = isMongoDB 
    ? '.json, .json.gz, .gz' 
    : '.sql, .sql.gz, .gz';
  
  const fileTypes = isMongoDB 
    ? ".json,.json.gz,.gz" 
    : ".sql,.sql.gz,.gz";
  
  const descriptionText = isMongoDB
    ? 'Sube un archivo de respaldo existente (.json, .json.gz o .gz)'
    : 'Sube un archivo de respaldo existente (.sql, .sql.gz o .gz)';
  
  const infoText = isMongoDB
    ? 'El archivo debe ser un respaldo válido de MongoDB'
    : 'El archivo debe ser un respaldo válido de MySQL';

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    if (!uploadFile) {
      return;
    }
    setShowCodeModal(true);
  };

  const handleConfirmUpload = () => {
    if (!backupCode) {
      alert('Por favor ingresa el código de respaldo');
      return;
    }
    
    // Extraer solo los 16 caracteres alfanuméricos
    let cleanCode = backupCode;
    const codeMatch = backupCode.match(/[A-Z0-9]{16}/i);
    if (codeMatch) {
      cleanCode = codeMatch[0];
    }
    
    setPendingUpload(true);
    onUpload(cleanCode);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      {/* Modal principal de importación */}
      <div className="backup-modal-overlay">
        <div className="backup-modal-content backup-backup-modal">
          <div className="backup-modal-header">
            <h3>Importar Respaldo</h3>
            <button onClick={onClose} className="backup-close-modal">✕</button>
          </div>
          
          <div className="backup-modal-body">
            <div className="backup-backup-icon">
              ⬆️
            </div>
            
            <p className="backup-backup-description">
              {descriptionText}
            </p>
            
            <div 
              className={`backup-upload-area ${dragActive ? 'drag-active' : ''} ${uploadFile ? 'file-selected' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="backupFileUpload"
                className="backup-file-input"
                accept={fileTypes}
                onChange={handleFileChange}
                disabled={uploading}
              />
              <label htmlFor="backupFileUpload" className="backup-file-label">
                {uploadFile ? (
                  <>
                    <span className="backup-upload-icon">✅</span>
                    <span className="backup-file-name">{uploadFile.name}</span>
                    <span className="backup-file-size">{formatFileSize(uploadFile.size)}</span>
                  </>
                ) : (
                  <>
                    <span className="backup-upload-icon"></span>
                    <span className="backup-upload-text">
                      <strong>Haz clic para seleccionar</strong> o arrastra y suelta
                    </span>
                    <span className="backup-upload-hint">{acceptedFormats} (max. 500MB)</span>
                  </>
                )}
              </label>
            </div>
            
            {uploading && (
              <div className="backup-upload-progress">
                <div className="backup-progress-label">
                  <span>Subiendo archivo...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="backup-progress-bar">
                  <div 
                    className="backup-progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            <div className="backup-info-box">
              <div className="backup-info-icon">ℹ️</div>
              <div className="backup-info-content">
                <p><strong>Importante:</strong></p>
                <ul>
                  <li>{infoText}</li>
                  <li>Formatos aceptados: {acceptedFormats}</li>
                  <li>El respaldo se agregará a la lista y podrás restaurarlo después</li>
                  <li>Se requiere el código único de respaldo para importar</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="backup-modal-footer">
            <button 
              className="backup-modal-btn cancel"
              onClick={onClose}
              disabled={uploading}
            >
              Cancelar
            </button>
            <button 
              className="backup-modal-btn primary"
              onClick={handleUploadClick}
              disabled={!uploadFile || uploading}
            >
              {uploading ? (
                <>
                  <span className="backup-btn-spinner"></span>
                  Subiendo... {uploadProgress}%
                </>
              ) : (
                'Importar Respaldo'
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
              <p>Para importar un respaldo, necesitas ingresar tu código único de respaldo:</p>
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
                  fontSize: '1.1rem',
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
                onClick={handleConfirmUpload}
                disabled={!backupCode || pendingUpload}
              >
                {pendingUpload ? (
                  <>
                    <span className="backup-btn-spinner"></span>
                    Verificando...
                  </>
                ) : (
                  'Confirmar e Importar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UploadModal;