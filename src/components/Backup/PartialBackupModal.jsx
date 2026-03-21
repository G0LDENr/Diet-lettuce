import React from 'react';

const PartialBackupModal = ({ 
  show, onClose, onCreate, customName, setCustomName, 
  availableTables, selectedTables, setSelectedTables, loading 
}) => {
  if (!show) return null;

  const handleTableToggle = (table) => {
    setSelectedTables(prev => 
      prev.includes(table) 
        ? prev.filter(t => t !== table)
        : [...prev, table]
    );
  };

  const handleSelectAll = () => {
    if (selectedTables.length === availableTables.length) {
      setSelectedTables([]);
    } else {
      setSelectedTables([...availableTables]);
    }
  };

  return (
    <div className="backup-modal-overlay">
      <div className="backup-modal-content backup-backup-modal backup-large-modal">
        <div className="backup-modal-header">
          <h3>Crear Respaldo Parcial</h3>
          <button onClick={onClose} className="backup-close-modal">✕</button>
        </div>
        
        <div className="backup-modal-body">
          <div className="backup-backup-icon">
            📑
          </div>
          
          <p className="backup-backup-description">
            Selecciona las tablas específicas que quieres incluir en el respaldo.
          </p>
          
          <div className="backup-form-group">
            <label htmlFor="backupNamePartial">Nombre personalizado (opcional)</label>
            <input
              type="text"
              id="backupNamePartial"
              className="backup-form-control"
              placeholder="Ej: solo_usuarios_pedidos"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />
          </div>
          
          <div className="backup-tables-section">
            <div className="backup-tables-header">
              <h4 className="backup-tables-title">Tablas disponibles ({availableTables.length})</h4>
              <button 
                className="backup-select-all-btn"
                onClick={handleSelectAll}
                disabled={availableTables.length === 0}
              >
                {selectedTables.length === availableTables.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
              </button>
            </div>
            
            {availableTables.length === 0 ? (
              <div className="backup-empty-tables">
                <p>Cargando tablas disponibles...</p>
              </div>
            ) : (
              <>
                <div className="backup-tables-grid">
                  {availableTables.map(table => (
                    <div key={table} className="backup-table-checkbox-item">
                      <label>
                        <input
                          type="checkbox"
                          checked={selectedTables.includes(table)}
                          onChange={() => handleTableToggle(table)}
                        />
                        <span className="backup-table-name">{table}</span>
                      </label>
                    </div>
                  ))}
                </div>
                
                <div className="backup-selected-count">
                  <span className="backup-selected-badge">
                    {selectedTables.length}
                  </span> tabla{selectedTables.length !== 1 ? 's' : ''} seleccionada{selectedTables.length !== 1 ? 's' : ''}
                </div>
              </>
            )}
          </div>
          
          <div className="backup-info-box">
            <div className="backup-info-icon"></div>
            <div className="backup-info-content">
              <p><strong>Nota:</strong> Las relaciones entre tablas se mantendrán solo si todas las tablas relacionadas están seleccionadas.</p>
            </div>
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
            disabled={loading || selectedTables.length === 0}
          >
            {loading ? (
              <>
                <span className="backup-btn-spinner"></span>
                Creando...
              </>
            ) : (
              `Crear Respaldo (${selectedTables.length} tablas)`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartialBackupModal;