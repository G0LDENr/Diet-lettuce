import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { toPng } from 'html-to-image';

const DiagramaModal = ({ show, onClose, token, darkMode, showMessage }) => {
  const diagramRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [diagramData, setDiagramData] = useState(null);
  const [svgContent, setSvgContent] = useState('');
  const [error, setError] = useState(null);
  const [downloadName, setDownloadName] = useState(`diagrama_${new Date().toISOString().slice(0,10)}`);
  const [dbType, setDbType] = useState('mysql');
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const [pendingFetch, setPendingFetch] = useState(false);
  
  // Estados para selección de tablas/colecciones
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: darkMode ? 'dark' : 'default',
      securityLevel: 'loose',
      er: { diagramPadding: 30, layoutDirection: 'TB', fontSize: 14 },
      flowchart: { 
        diagramPadding: 30, 
        layoutDirection: 'TB', 
        useMaxWidth: true,
        rankSpacing: 50,
        nodeSpacing: 40
      }
    });
  }, [darkMode]);

  // Resetear estados cuando se abre el modal
  useEffect(() => {
    if (show) {
      // Resetear estados
      setDiagramData(null);
      setSvgContent('');
      setError(null);
      setSelectedItems([]);
      setAvailableItems([]);
      setSelectAll(false);
      setShowSelector(false);
      // Mostrar modal de código primero
      setShowCodeModal(true);
    }
  }, [show]);

  // Generar diagrama cuando cambian los items seleccionados o los datos
  useEffect(() => {
    if (diagramData && selectedItems.length > 0) {
      generarDiagrama(diagramData, selectedItems);
    } else if (diagramData && selectedItems.length === 0) {
      setSvgContent('');
    }
  }, [diagramData, selectedItems]);

  const fetchDiagram = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://127.0.0.1:5000/backups/diagrama', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setDiagramData(data.data);
        setDbType(data.data.tipo_bd === 'MySQL' ? 'mysql' : 'mongodb');
        
        if (data.data.tipo_bd === 'MySQL') {
          const tablas = data.data.tablas?.map(t => t.nombre) || [];
          setAvailableItems(tablas);
          setSelectedItems(tablas);
          setSelectAll(true);
        } else {
          const colecciones = data.data.colecciones?.map(c => c.nombre) || [];
          setAvailableItems(colecciones);
          setSelectedItems(colecciones);
          setSelectAll(true);
        }
        
        setShowSelector(true);
      } else {
        setError(data.message || 'Error al generar diagrama');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
      setPendingFetch(false);
    }
  };

  const handleConfirmCode = () => {
    if (!backupCode) {
      alert('Por favor ingresa el código de respaldo');
      return;
    }
    setPendingFetch(true);
    setShowCodeModal(false);
    // Verificar código antes de cargar el diagrama
    verifyAndFetch();
  };

  const verifyAndFetch = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Limpiar el código
      let cleanCode = backupCode;
      const codeMatch = backupCode.match(/[A-Z0-9]{16}/i);
      if (codeMatch) {
        cleanCode = codeMatch[0];
      }
      
      // Verificar código con un endpoint de verificación
      const response = await fetch('http://127.0.0.1:5000/backups/verify-code', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          backup_code: cleanCode,
          user_id: userData.id
        })
      });
      
      if (response.ok) {
        // Código válido, cargar diagrama
        fetchDiagram();
      } else {
        const error = await response.json();
        setError(error.message || 'Código de respaldo inválido');
        setShowCodeModal(true);
      }
    } catch (err) {
      setError('Error al verificar código');
      setShowCodeModal(true);
    } finally {
      setPendingFetch(false);
    }
  };

  const generarDiagramaMongoDB = async (data, coleccionesSeleccionadas) => {
    try {
      let def = 'graph TD\n';
      def += '  classDef collection fill:#96bd44,stroke:#333,stroke-width:2px,color:#000\n';
      def += '  classDef field fill:#f9f9f9,stroke:#666,stroke-width:1px,color:#333\n';
      def += '  classDef ref fill:#ffe6b3,stroke:#f59e0b,stroke-width:1px,color:#333\n\n';
      
      const coleccionesFiltradas = data.colecciones?.filter(c => 
        coleccionesSeleccionadas.includes(c.nombre)
      ) || [];

      if (coleccionesFiltradas.length === 0) {
        setSvgContent('');
        return;
      }

      let index = 0;
      
      coleccionesFiltradas.forEach(col => {
        // Nodo principal de la colección
        def += `  col_${index}[["${col.nombre}"]]\n`;
        def += `  class col_${index} collection\n`;
        
        // Nodo para campos
        const camposFiltrados = col.campos?.filter(campo => 
          !campo.nombre.startsWith('_') && campo.nombre !== '_id'
        ) || [];
        
        if (camposFiltrados.length > 0) {
          def += `  campos_${index}["Campos:"]\n`;
          def += `  class campos_${index} field\n`;
          def += `  col_${index} --> campos_${index}\n`;
          
          let lastField = null;
          camposFiltrados.forEach((campo, campoIdx) => {
            const nombreCampo = campo.nombre;
            const tipoSimplificado = campo.tipo.split('(')[0];
            const fieldId = `field_${index}_${campoIdx}`;
            
            if (campo.es_referencia) {
              def += `  ${fieldId}["${nombreCampo}: ${tipoSimplificado} (referencia)"]\n`;
              def += `  class ${fieldId} ref\n`;
            } else {
              def += `  ${fieldId}["${nombreCampo}: ${tipoSimplificado}"]\n`;
              def += `  class ${fieldId} field\n`;
            }
            
            if (lastField) {
              def += `  ${lastField} --> ${fieldId}\n`;
            } else {
              def += `  campos_${index} --> ${fieldId}\n`;
            }
            lastField = fieldId;
          });
        } else {
          def += `  empty_${index}["(sin campos definidos)"]\n`;
          def += `  class empty_${index} field\n`;
          def += `  col_${index} --> empty_${index}\n`;
        }
        
        index++;
        def += `\n`;
      });

      // Definir relaciones entre colecciones
      const relacionesFiltradas = data.relaciones?.filter(rel => 
        coleccionesSeleccionadas.includes(rel.coleccion_origen) && 
        coleccionesSeleccionadas.includes(rel.coleccion_destino)
      ) || [];

      relacionesFiltradas.forEach(rel => {
        const origenIndex = coleccionesFiltradas.findIndex(c => c.nombre === rel.coleccion_origen);
        const destinoIndex = coleccionesFiltradas.findIndex(c => c.nombre === rel.coleccion_destino);
        if (origenIndex !== -1 && destinoIndex !== -1) {
          def += `  col_${origenIndex} -.->|"referencia"| col_${destinoIndex}\n`;
        }
      });

      const { svg } = await mermaid.render('diagrama', def);
      setSvgContent(svg);
      
    } catch (err) {
      setError('Error generando diagrama MongoDB: ' + err.message);
    }
  };

  const generarDiagramaMySQL = async (data, tablasSeleccionadas) => {
    try {
      let def = 'erDiagram\n';
      
      const tablasFiltradas = data.tablas?.filter(t => 
        tablasSeleccionadas.includes(t.nombre)
      ) || [];

      if (tablasFiltradas.length === 0) {
        setSvgContent('');
        return;
      }
      
      // Definir entidades (tablas)
      tablasFiltradas.forEach(tabla => {
        def += `  ${tabla.nombre} {\n`;
        tabla.columnas.forEach(col => {
          let tipo = col.tipo.split('(')[0].replace(/[^a-zA-Z0-9]/g, '');
          const pk = tabla.primary_key?.includes(col.nombre) ? ' PK' : '';
          const fk = tabla.foreign_keys?.some(fk => fk.columna_origen === col.nombre) ? ' FK' : '';
          def += `    ${tipo} ${col.nombre.replace(/[^a-zA-Z0-9_]/g, '')}${pk}${fk}\n`;
        });
        def += `  }\n`;
      });
      
      // Definir relaciones solo entre tablas seleccionadas
      const relacionesFiltradas = data.relaciones?.filter(rel => 
        tablasSeleccionadas.includes(rel.tabla_origen) && 
        tablasSeleccionadas.includes(rel.tabla_destino)
      ) || [];
      
      relacionesFiltradas.forEach(rel => {
        def += `  ${rel.tabla_origen} ||--o{ ${rel.tabla_destino} : "tiene"\n`;
      });

      const { svg } = await mermaid.render('diagrama', def);
      setSvgContent(svg);
      
    } catch (err) {
      setError('Error generando diagrama MySQL: ' + err.message);
    }
  };

  const generarDiagrama = async (data, itemsSeleccionados) => {
    setLoading(true);
    try {
      if (data.tipo_bd === 'MySQL') {
        await generarDiagramaMySQL(data, itemsSeleccionados);
      } else {
        await generarDiagramaMongoDB(data, itemsSeleccionados);
      }
    } catch (err) {
      console.error('Error generando diagrama:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleItemToggle = (itemName) => {
    setSelectedItems(prev => {
      const newSelection = prev.includes(itemName)
        ? prev.filter(t => t !== itemName)
        : [...prev, itemName];
      
      setSelectAll(newSelection.length === availableItems.length);
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
      setSelectAll(false);
    } else {
      setSelectedItems([...availableItems]);
      setSelectAll(true);
    }
  };

  const descargarPNG = async () => {
    if (!diagramRef.current) return;

    try {
      showMessage('Procesando', 'Generando imagen PNG...', 'info');

      const dataUrl = await toPng(diagramRef.current, {
        quality: 1,
        backgroundColor: darkMode ? '#1a1a1a' : 'white',
        pixelRatio: 2,
        style: {
          'background-color': darkMode ? '#1a1a1a' : 'white'
        }
      });

      if ('showSaveFilePicker' in window) {
        try {
          const fileHandle = await window.showSaveFilePicker({
            suggestedName: `${downloadName}.png`,
            types: [{
              description: 'PNG Image',
              accept: { 'image/png': ['.png'] }
            }]
          });
          
          const writable = await fileHandle.createWritable();
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          
          await writable.write(blob);
          await writable.close();
          
          showMessage('Descarga completada', 'Imagen guardada correctamente', 'success');
          
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error('Error al guardar:', err);
            showMessage('Error', 'No se pudo guardar el archivo', 'error');
          }
        }
      } else {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `${downloadName}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        showMessage('Descarga iniciada', 'El archivo se ha descargado en tu carpeta de descargas', 'success');
      }

    } catch (err) {
      console.error('Error al generar PNG:', err);
      showMessage('Error', 'No se pudo generar la imagen PNG', 'error');
    }
  };

  const handleClose = () => {
    // Resetear todos los estados al cerrar
    setDiagramData(null);
    setSvgContent('');
    setError(null);
    setSelectedItems([]);
    setAvailableItems([]);
    setSelectAll(false);
    setShowSelector(false);
    setLoading(false);
    setShowCodeModal(false);
    setBackupCode('');
    onClose();
  };

  const isMongoDB = dbType === 'mongodb';
  const itemsLabel = isMongoDB ? 'colecciones' : 'tablas';
  const titleText = isMongoDB ? 'Diagrama de Estructura' : 'Diagrama Entidad-Relación';

  if (!show && !showCodeModal) return null;

  return (
    <>
      {/* Modal para ingresar código de respaldo */}
      {showCodeModal && (
        <div className="backup-modal-overlay">
          <div className="backup-modal-content backup-code-modal" style={{ maxWidth: '450px' }}>
            <div className="backup-modal-header">
              <h3>🔐 Código de Respaldo</h3>
              <button 
                onClick={handleClose}
                className="backup-close-modal"
              >
                ✕
              </button>
            </div>
            <div className="backup-modal-body">
              <p>Para ver el diagrama de la base de datos, necesitas ingresar tu código único de respaldo:</p>
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
                onClick={handleClose}
              >
                Cancelar
              </button>
              <button 
                className="backup-modal-btn primary"
                onClick={handleConfirmCode}
                disabled={!backupCode || pendingFetch}
              >
                {pendingFetch ? (
                  <>
                    <span className="backup-btn-spinner"></span>
                    Verificando...
                  </>
                ) : (
                  'Confirmar y Ver Diagrama'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal principal del diagrama */}
      {!showCodeModal && (
        <div className="backup-modal-overlay">
          <div className="backup-modal-content backup-diagram-modal">
            <div className="backup-modal-header">
              <h3>{titleText}</h3>
              <button onClick={handleClose} className="backup-close-modal">✕</button>
            </div>
            
            {/* Selector de items */}
            {showSelector && availableItems.length > 0 && (
              <div className="backup-table-selector">
                <div className="backup-table-selector-header">
                  <h4>Seleccionar {itemsLabel} para el diagrama:</h4>
                  <button 
                    className="backup-select-all-btn"
                    onClick={handleSelectAll}
                  >
                    {selectAll ? `Deseleccionar todas las ${itemsLabel}` : `Seleccionar todas las ${itemsLabel}`}
                  </button>
                </div>
                <div className="backup-table-selector-grid">
                  {availableItems.map(item => (
                    <label key={item} className="backup-table-selector-item">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item)}
                        onChange={() => handleItemToggle(item)}
                      />
                      <span className="backup-table-name">{item}</span>
                    </label>
                  ))}
                </div>
                <div className="backup-table-selector-info">
                  {selectedItems.length} de {availableItems.length} {itemsLabel} seleccionadas
                </div>
              </div>
            )}
            
            {/* Área de contenido con scroll */}
            <div className="backup-diagram-content">
              {loading && (
                <div className="backup-loading-container">
                  <div className="backup-loading-spinner"></div>
                  <p>Generando diagrama con {selectedItems.length} {itemsLabel}...</p>
                </div>
              )}
              
              {error && (
                <div className="backup-error-message">
                  {error}
                </div>
              )}
              
              {svgContent && !loading && (
                <div 
                  ref={diagramRef}
                  className="backup-diagram-visual"
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    minHeight: '400px',
                    overflow: 'visible'
                  }}
                />
              )}
              
              {!loading && !error && !svgContent && selectedItems.length > 0 && (
                <div className="backup-loading-container">
                  <div className="backup-loading-spinner"></div>
                  <p>Preparando diagrama...</p>
                </div>
              )}
              
              {!loading && !error && selectedItems.length === 0 && (
                <div className="backup-error-message">
                  No hay {itemsLabel} seleccionadas. Selecciona al menos una para ver el diagrama.
                </div>
              )}
            </div>

            {/* Área de descarga con opción de cambiar nombre */}
            {svgContent && !error && (
              <div className="backup-diagram-footer">
                <div className="backup-download-options">
                  <div className="backup-download-name">
                    <label htmlFor="downloadName">Nombre del archivo:</label>
                    <input
                      type="text"
                      id="downloadName"
                      value={downloadName}
                      onChange={(e) => setDownloadName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                      placeholder="nombre_del_diagrama"
                      className="backup-download-input"
                    />
                    <span className="backup-download-extension">.png</span>
                  </div>
                  
                  <button 
                    onClick={descargarPNG}
                    className="backup-download-btn-primary"
                    disabled={loading}
                  >
                    Elegir ubicación y guardar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DiagramaModal;