import React, { useState } from 'react';

const UploadModal = ({ show, onClose, onUpload, uploadFile, setUploadFile, uploading, uploadProgress }) => {
  const [dragActive, setDragActive] = useState(false);

  if (!show) return null;

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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
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
            Sube un archivo de respaldo existente (.sql, .sql.gz o .gz)
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
              accept=".sql,.sql.gz,.gz"
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
                  <span className="backup-upload-hint">SQL, SQL.GZ o GZ (max. 500MB)</span>
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
            <div className="backup-info-icon"></div>
            <div className="backup-info-content">
              <p><strong>Importante:</strong></p>
              <ul>
                <li>El archivo debe ser un respaldo válido de MySQL</li>
                <li>Formatos aceptados: .sql, .sql.gz, .gz</li>
                <li>El respaldo se agregará a la lista y podrás restaurarlo después</li>
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
            onClick={onUpload}
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
  );
};

export default UploadModal;