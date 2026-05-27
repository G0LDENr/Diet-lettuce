import React, { useEffect, useState } from 'react';

const PartialBackupModal = ({ 
  show, onClose, onCreate, customName, setCustomName, 
  availableTables, selectedTables, setSelectedTables, loading 
}) => {
  const [dbType, setDbType] = useState('mysql');
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const [pendingCreate, setPendingCreate] = useState(false);

  // Detectar el tipo de base de datos al montar el componente
  useEffect(() => {
    const detectDbType = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://127.0.0.1:5000/db-info', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setDbType(data.db_type || 'mysql');
        }
      } catch (error) {
        console.error('Error detectando tipo de BD:', error);
        setDbType('mysql');
      }
    };
    
    if (show) {
      detectDbType();
    }
  }, [show]);

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

  const handleCreateClick = () => {
    if (selectedTables.length === 0) return;
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

  // Texto según el tipo de base de datos
  const isMongoDB = dbType === 'mongodb';
  const itemSingular = isMongoDB ? 'colección' : 'tabla';
  const itemPlural = isMongoDB ? 'colecciones' : 'tablas';
  const titleText = isMongoDB ? 'Crear Respaldo Parcial de Colecciones' : 'Crear Respaldo Parcial de Tablas';
  const descriptionText = isMongoDB 
    ? 'Selecciona las colecciones específicas que quieres incluir en el respaldo.' 
    : 'Selecciona las tablas específicas que quieres incluir en el respaldo.';
  const emptyText = isMongoDB ? 'Cargando colecciones disponibles...' : 'Cargando tablas disponibles...';
  const noteText = isMongoDB 
    ? 'Las relaciones entre colecciones se mantendrán solo si todas las colecciones relacionadas están seleccionadas. En MongoDB, los IDs originales se preservan durante la restauración.'
    : 'Las relaciones entre tablas se mantendrán solo si todas las tablas relacionadas están seleccionadas.';

  return (
    <>
      {/* Modal principal */}
      <div className="backup-modal-overlay">
        <div className="backup-modal-content backup-backup-modal backup-large-modal">
          <div className="backup-modal-header">
            <h3>{titleText}</h3>
            <button onClick={onClose} className="backup-close-modal">✕</button>
          </div>
          
          <div className="backup-modal-body">
            <div className="backup-backup-icon">
              📑
            </div>
            
            <p className="backup-backup-description">
              {descriptionText}
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
                <h4 className="backup-tables-title">
                  {itemPlural} disponibles ({availableTables.length})
                </h4>
                <button 
                  className="backup-select-all-btn"
                  onClick={handleSelectAll}
                  disabled={availableTables.length === 0}
                >
                  {selectedTables.length === availableTables.length 
                    ? `Deseleccionar todas las ${itemPlural}` 
                    : `Seleccionar todas las ${itemPlural}`}
                </button>
              </div>
              
              {availableTables.length === 0 ? (
                <div className="backup-empty-tables">
                  <p>{emptyText}</p>
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
                    </span> {itemSingular}{selectedTables.length !== 1 ? 's' : ''} seleccionada{selectedTables.length !== 1 ? 's' : ''}
                  </div>
                </>
              )}
            </div>
            
            <div className="backup-info-box">
              <div className="backup-info-icon">ℹ️</div>
              <div className="backup-info-content">
                <p><strong>Nota:</strong> {noteText}</p>
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
              onClick={handleCreateClick}
              disabled={loading || selectedTables.length === 0}
            >
              {loading ? (
                <>
                  <span className="backup-btn-spinner"></span>
                  Creando...
                </>
              ) : (
                `Crear Respaldo (${selectedTables.length} ${itemSingular}${selectedTables.length !== 1 ? 's' : ''})`
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
              <p>Para crear un respaldo, necesitas ingresar tu código único de respaldo:</p>
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

export default PartialBackupModal;