import React, { useEffect, useRef, useState } from 'react';
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
  
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [diagramType, setDiagramType] = useState('er');

  useEffect(() => {
    if (show) {
      setDiagramData(null);
      setSvgContent('');
      setError(null);
      setSelectedItems([]);
      setAvailableItems([]);
      setSelectAll(false);
      setShowSelector(false);
      setDiagramType('er');
      setShowCodeModal(true);
    }
  }, [show]);

  useEffect(() => {
    if (diagramData && selectedItems.length > 0) {
      if (diagramType === 'er') {
        generarDiagramaER(diagramData, selectedItems);
      } else {
        generarDiagramaSnowflakeFromData(diagramData);
      }
    }
  }, [diagramData, selectedItems, diagramType]);

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
        
        let items = [];
        if (data.data.tipo_bd === 'MySQL') {
          items = data.data.tablas?.map(t => t.nombre) || [];
          items = items.filter(item => !item.startsWith('alembic_'));
        } else {
          items = data.data.colecciones?.map(c => c.nombre) || [];
        }
        
        setAvailableItems(items);
        setSelectedItems([...items]);
        setSelectAll(true);
        setShowSelector(true);
      } else {
        setError(data.message || 'Error al generar diagrama');
      }
    } catch (err) {
      setError('Error de conexion');
    } finally {
      setLoading(false);
      setPendingFetch(false);
    }
  };

  const fetchSnowflakeDiagram = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://127.0.0.1:5000/backups/diagrama/copo-nieve', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (response.ok && data.data) {
        setDiagramData(data.data);
        setDbType(data.data.tipo_bd === 'MySQL' ? 'mysql' : 'mongodb');
        
        let items = [];
        if (data.data.tipo_bd === 'MySQL') {
          items = data.data.tablas?.map(t => t.nombre) || [];
          items = items.filter(item => !item.startsWith('alembic_'));
        } else {
          items = data.data.colecciones?.map(c => c.nombre) || [];
        }
        
        setAvailableItems(items);
        setSelectedItems([...items]);
        setSelectAll(true);
        setShowSelector(true);
      } else {
        setError(data.message || 'Error al generar diagrama de copo de nieve');
      }
    } catch (err) {
      setError('Error de conexion');
    } finally {
      setLoading(false);
      setPendingFetch(false);
    }
  };

  const handleConfirmCode = () => {
    if (!backupCode) {
      alert('Ingresa el codigo de respaldo');
      return;
    }
    setPendingFetch(true);
    setShowCodeModal(false);
    verifyAndFetch();
  };

  const verifyAndFetch = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      let cleanCode = backupCode;
      const codeMatch = backupCode.match(/[A-Z0-9]{16}/i);
      if (codeMatch) {
        cleanCode = codeMatch[0];
      }
      
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
        if (diagramType === 'er') {
          fetchDiagram();
        } else {
          fetchSnowflakeDiagram();
        }
      } else {
        const error = await response.json();
        setError(error.message || 'Codigo invalido');
        setShowCodeModal(true);
      }
    } catch (err) {
      setError('Error al verificar codigo');
      setShowCodeModal(true);
    } finally {
      setPendingFetch(false);
    }
  };

  // ============================================
  // DIAGRAMA DE COPO DE NIEVE - CON TODAS LAS TABLAS
  // UN SOLO TONO DE VERDE
  // ============================================
  const generarDiagramaSnowflakeFromData = (data) => {
    const bgColor = darkMode ? '#1a1a2e' : '#ffffff';
    const textColor = darkMode ? '#ffffff' : '#1a1a2e';
    const verdeUnico = '#2e7d32';
    const verdeClaro = '#4caf50';
    const verdeMuyClaro = '#a5d6a7';
    
    // Extraer TODAS las tablas reales de la base de datos (excluyendo alembic)
    const todasLasTablas = (data.tablas || []).filter(t => !t.nombre.startsWith('alembic_'));
    
    if (todasLasTablas.length === 0) {
      setError('No hay tablas para mostrar');
      setLoading(false);
      return;
    }
    
    // Identificar tabla de hechos (ordenes, fact_ordenes, ventas)
    let factTable = todasLasTablas.find(t => 
      t.nombre === 'ordenes' || t.nombre === 'fact_ordenes' || t.nombre === 'ventas'
    );
    
    // Si no hay tabla de hechos identificada, usar la primera tabla como centro
    const centroIndex = factTable ? todasLasTablas.indexOf(factTable) : 0;
    const factTableData = factTable || todasLasTablas[centroIndex];
    
    // El resto son dimensiones (TODAS las demás tablas)
    const dimensionTables = todasLasTablas.filter(t => t !== factTableData);
    
    // Dimensiones agrupadas por tipo (para mejor organización)
    const dimensionesPrincipales = dimensionTables.filter(t => 
      !t.nombre.includes('detalle') && !t.nombre.includes('seguimiento') && !t.nombre.includes('historial')
    );
    
    const subDimensiones = dimensionTables.filter(t => 
      t.nombre.includes('detalle') || t.nombre.includes('seguimiento') || t.nombre.includes('historial')
    );
    
    const centerX = 500;
    const centerY = 400;
    
    // Calcular posiciones para dimensiones principales (círculo)
    const mainCount = dimensionesPrincipales.length;
    const radius = 280;
    const angleStep = mainCount > 0 ? (2 * Math.PI) / mainCount : 0;
    
    // Sub-dimensiones en círculo más interno
    const subCount = subDimensiones.length;
    const subRadius = 180;
    const subAngleStep = subCount > 0 ? (2 * Math.PI) / subCount : 0;
    
    let svgHtml = `
      <svg viewBox="0 0 1000 850" xmlns="http://www.w3.org/2000/svg" style="background: ${bgColor}; font-family: 'Segoe UI', Arial, sans-serif; width: 100%; height: auto;">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.25"/>
          </filter>
        </defs>
    `;
    
    // Líneas de conexión del centro a dimensiones principales
    for (let i = 0; i < mainCount; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      svgHtml += `<line x1="${centerX}" y1="${centerY}" x2="${x}" y2="${y}" stroke="${verdeUnico}" stroke-width="2" stroke-dasharray="6,3"/>`;
    }
    
    // Líneas de dimensiones principales a sub-dimensiones
    for (let i = 0; i < subCount && i < mainCount; i++) {
      const angle = i * subAngleStep - Math.PI / 2;
      const x = centerX + subRadius * Math.cos(angle);
      const y = centerY + subRadius * Math.sin(angle);
      
      const parentAngle = (i % mainCount) * angleStep - Math.PI / 2;
      const parentX = centerX + radius * Math.cos(parentAngle);
      const parentY = centerY + radius * Math.sin(parentAngle);
      svgHtml += `<line x1="${parentX}" y1="${parentY}" x2="${x}" y2="${y}" stroke="${verdeClaro}" stroke-width="1.5" stroke-dasharray="4,3"/>`;
    }
    
    // TABLA DE HECHOS (centro)
    const factName = factTableData.nombre;
    const factColumns = factTableData.columnas || [];
    const factRowCount = factTableData.total_registros || 0;
    
    // Calcular altura dinámica para tabla de hechos
    const factHeight = Math.max(100, 70 + factColumns.length * 14);
    
    svgHtml += `
      <rect x="${centerX - 120}" y="${centerY - factHeight/2}" width="240" height="${factHeight}" rx="12" fill="${verdeUnico}" stroke="${verdeUnico}" stroke-width="2" filter="url(#shadow)"/>
      <text x="${centerX}" y="${centerY - factHeight/2 + 25}" text-anchor="middle" fill="white" font-size="14" font-weight="bold">${factName.toUpperCase()}</text>
      <text x="${centerX}" y="${centerY - factHeight/2 + 42}" text-anchor="middle" fill="${verdeMuyClaro}" font-size="10">TABLA DE HECHOS</text>
    `;
    
    let factYOffset = centerY - factHeight/2 + 60;
    factColumns.slice(0, 8).forEach(col => {
      svgHtml += `<text x="${centerX}" y="${factYOffset}" text-anchor="middle" fill="white" font-size="10">${col.nombre}: ${col.tipo.split('(')[0]}</text>`;
      factYOffset += 14;
    });
    
    if (factColumns.length === 0 || factColumns.length > 8) {
      svgHtml += `<text x="${centerX}" y="${factYOffset}" text-anchor="middle" fill="white" font-size="10">Registros: ${factRowCount}</text>`;
    }
    
    svgHtml += `</rect>`;
    
    // DIMENSIONES PRINCIPALES
    for (let i = 0; i < mainCount; i++) {
      const dimension = dimensionesPrincipales[i];
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      const dimColumns = dimension.columnas || [];
      const dimRowCount = dimension.total_registros || 0;
      
      const dimHeight = Math.max(70, 50 + Math.min(dimColumns.length, 5) * 14);
      
      svgHtml += `
        <g transform="translate(${x - 110}, ${y - dimHeight/2})">
          <rect x="0" y="0" width="220" height="${dimHeight}" rx="10" fill="${verdeClaro}" stroke="${verdeUnico}" stroke-width="1.5" filter="url(#shadow)"/>
          <text x="110" y="22" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${dimension.nombre}</text>
          <text x="110" y="38" text-anchor="middle" fill="${verdeMuyClaro}" font-size="9">DIMENSION</text>
      `;
      
      let dimYOffset = 52;
      dimColumns.slice(0, 5).forEach(col => {
        svgHtml += `<text x="110" y="${dimYOffset}" text-anchor="middle" fill="white" font-size="9">${col.nombre}</text>`;
        dimYOffset += 14;
      });
      
      if (dimColumns.length === 0) {
        svgHtml += `<text x="110" y="52" text-anchor="middle" fill="white" font-size="9">Registros: ${dimRowCount}</text>`;
      }
      
      svgHtml += `</rect></g>`;
    }
    
    // SUB-DIMENSIONES
    for (let i = 0; i < subCount; i++) {
      const subDim = subDimensiones[i];
      const angle = i * subAngleStep - Math.PI / 2;
      const x = centerX + subRadius * Math.cos(angle);
      const y = centerY + subRadius * Math.sin(angle);
      
      const subColumns = subDim.columnas || [];
      
      svgHtml += `
        <g transform="translate(${x - 90}, ${y - 35})">
          <rect x="0" y="0" width="180" height="50" rx="8" fill="${verdeMuyClaro}" stroke="${verdeUnico}" stroke-width="1.5" filter="url(#shadow)"/>
          <text x="90" y="20" text-anchor="middle" fill="#1b5e20" font-size="11" font-weight="bold">${subDim.nombre}</text>
          <text x="90" y="36" text-anchor="middle" fill="#2e7d32" font-size="8">SUB-DIMENSION</text>
        </g>
      `;
    }
    
    // Si no hay sub-dimensiones pero hay dimensiones principales, mostrar mensaje
    if (subCount === 0 && mainCount > 0) {
      svgHtml += `
        <text x="500" y="760" text-anchor="middle" fill="${verdeUnico}" font-size="11" opacity="0.7">Todas las tablas han sido organizadas como dimensiones</text>
      `;
    }
    
    // TITULO
    svgHtml += `
      <text x="500" y="30" text-anchor="middle" fill="${textColor}" font-size="14" font-weight="bold" opacity="0.8">DIAGRAMA DE COPO DE NIEVE - SNOWFLAKE SCHEMA</text>
      <text x="500" y="50" text-anchor="middle" fill="${textColor}" font-size="11" opacity="0.6">Total de tablas: ${todasLasTablas.length} (${mainCount} dimensiones, ${subCount} sub-dimensiones)</text>
    `;
    
    // LEYENDA (sin emojis)
    svgHtml += `
      <g transform="translate(30, 760)">
        <rect x="0" y="0" width="350" height="65" rx="8" fill="${bgColor}" stroke="${verdeUnico}" stroke-width="1" opacity="0.9"/>
        <text x="175" y="18" text-anchor="middle" fill="${textColor}" font-size="11" font-weight="bold">LEYENDA</text>
        <rect x="15" y="28" width="14" height="14" rx="3" fill="${verdeUnico}"/>
        <text x="35" y="40" fill="${textColor}" font-size="10">Tabla de Hechos (Fact Table)</text>
        <rect x="15" y="46" width="14" height="14" rx="3" fill="${verdeClaro}"/>
        <text x="35" y="58" fill="${textColor}" font-size="10">Dimension</text>
        <rect x="175" y="28" width="14" height="14" rx="3" fill="${verdeMuyClaro}"/>
        <text x="195" y="40" fill="${textColor}" font-size="10">Sub-Dimension</text>
        <line x1="175" y1="53" x2="189" y2="53" stroke="${verdeUnico}" stroke-width="2" stroke-dasharray="4,2"/>
        <text x="195" y="58" fill="${textColor}" font-size="10">Relacion</text>
      </g>
    `;
    
    svgHtml += `</svg>`;
    
    setSvgContent(svgHtml);
    setError(null);
    setLoading(false);
  };

  // ============================================
  // DIAGRAMA ER NORMAL
  // ============================================
  const generarDiagramaERMySQL = async (data, tablasSeleccionadas) => {
    try {
      let def = 'erDiagram\n';
      
      const tablasFiltradas = data.tablas?.filter(t => 
        tablasSeleccionadas.includes(t.nombre) && !t.nombre.startsWith('alembic_')
      ) || [];

      if (tablasFiltradas.length === 0) {
        setSvgContent('');
        setError('No hay tablas seleccionadas');
        setLoading(false);
        return;
      }
      
      tablasFiltradas.forEach(tabla => {
        def += `  ${tabla.nombre} {\n`;
        tabla.columnas.slice(0, 6).forEach(col => {
          let tipo = col.tipo.split('(')[0].replace(/[^a-zA-Z0-9]/g, '');
          const pk = tabla.primary_key?.includes(col.nombre) ? ' PK' : '';
          const fk = tabla.foreign_keys?.some(fk => fk.columna_origen === col.nombre) ? ' FK' : '';
          def += `    ${tipo} ${col.nombre.replace(/[^a-zA-Z0-9_]/g, '')}${pk}${fk}\n`;
        });
        def += `  }\n`;
      });
      
      const relacionesFiltradas = data.relaciones?.filter(rel => 
        tablasSeleccionadas.includes(rel.tabla_origen) && 
        tablasSeleccionadas.includes(rel.tabla_destino)
      ) || [];
      
      relacionesFiltradas.slice(0, 15).forEach(rel => {
        def += `  ${rel.tabla_origen} ||--o{ ${rel.tabla_destino} : "tiene"\n`;
      });

      const mermaid = await import('mermaid');
      mermaid.default.initialize({ startOnLoad: true, theme: darkMode ? 'dark' : 'base' });
      const { svg } = await mermaid.default.render('diagrama', def);
      setSvgContent(svg);
      setError(null);
      setLoading(false);
      
    } catch (err) {
      console.error('Error:', err);
      setError('Error generando diagrama ER');
      setLoading(false);
    }
  };

  const generarDiagramaERMongoDB = async (data, coleccionesSeleccionadas) => {
    try {
      let def = 'graph TD\n';
      def += '  classDef collection fill:#2e7d32,stroke:#1b5e20,stroke-width:2px,color:#fff\n\n';
      
      const coleccionesFiltradas = data.colecciones?.filter(c => 
        coleccionesSeleccionadas.includes(c.nombre)
      ) || [];

      if (coleccionesFiltradas.length === 0) {
        setSvgContent('');
        setError('No hay colecciones seleccionadas');
        setLoading(false);
        return;
      }

      coleccionesFiltradas.forEach((col, idx) => {
        def += `  col_${idx}[["${col.nombre}"]]\n`;
        def += `  class col_${idx} collection\n`;
      });

      const mermaid = await import('mermaid');
      mermaid.default.initialize({ startOnLoad: true, theme: darkMode ? 'dark' : 'base' });
      const { svg } = await mermaid.default.render('diagrama', def);
      setSvgContent(svg);
      setError(null);
      setLoading(false);
      
    } catch (err) {
      console.error('Error:', err);
      setError('Error generando diagrama');
      setLoading(false);
    }
  };

  const generarDiagramaER = async (data, itemsSeleccionados) => {
    setLoading(true);
    try {
      if (data.tipo_bd === 'MySQL') {
        await generarDiagramaERMySQL(data, itemsSeleccionados);
      } else {
        await generarDiagramaERMongoDB(data, itemsSeleccionados);
      }
    } catch (err) {
      console.error('Error:', err);
      setLoading(false);
    }
  };

  const handleDiagramTypeChange = (type) => {
    setDiagramType(type);
    setSvgContent('');
    setError(null);
    setSelectedItems([]);
    setAvailableItems([]);
    setShowSelector(false);
    setLoading(true);
    
    if (type === 'snowflake') {
      fetchSnowflakeDiagram();
    } else {
      fetchDiagram();
    }
  };

  const handleItemToggle = (itemName) => {
    setSelectedItems(prev => {
      const newSelection = prev.includes(itemName)
        ? prev.filter(t => t !== itemName)
        : [...prev, itemName];
      
      setSelectAll(newSelection.length === availableItems.length && availableItems.length > 0);
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
      showMessage('Procesando', 'Generando imagen...', 'info');

      const dataUrl = await toPng(diagramRef.current, {
        quality: 1,
        backgroundColor: darkMode ? '#1a1a2e' : '#ffffff',
        pixelRatio: 2
      });

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${downloadName}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      showMessage('Completado', 'Imagen descargada', 'success');

    } catch (err) {
      console.error('Error:', err);
      showMessage('Error', 'No se pudo generar la imagen', 'error');
    }
  };

  const handleClose = () => {
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
    setDiagramType('er');
    onClose();
  };

  const titleText = diagramType === 'er' 
    ? 'Diagrama Entidad-Relacion'
    : 'Diagrama de Copo de Nieve';

  if (!show && !showCodeModal) return null;

  return (
    <>
      {showCodeModal && (
        <div className="backup-modal-overlay">
          <div className="backup-modal-content" style={{ maxWidth: '450px' }}>
            <div className="backup-modal-header">
              <h3>Codigo de Respaldo</h3>
              <button onClick={handleClose} className="backup-close-modal">X</button>
            </div>
            <div className="backup-modal-body">
              <p>Ingresa tu codigo unico de respaldo:</p>
              <input
                type="text"
                className="backup-form-control"
                placeholder="Codigo de 16 caracteres"
                value={backupCode}
                onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                autoFocus
                style={{ 
                  textTransform: 'uppercase', 
                  fontFamily: 'monospace',
                  textAlign: 'center'
                }}
              />
            </div>
            <div className="backup-modal-footer">
              <button className="backup-modal-btn cancel" onClick={handleClose}>Cancelar</button>
              <button 
                className="backup-modal-btn primary"
                onClick={handleConfirmCode}
                disabled={!backupCode || pendingFetch}
              >
                {pendingFetch ? 'Verificando...' : 'Ver Diagrama'}
              </button>
            </div>
          </div>
        </div>
      )}

      {!showCodeModal && (
        <div className="backup-modal-overlay">
          <div className="backup-modal-content backup-diagram-modal" style={{ width: '95%', maxWidth: '1100px' }}>
            <div className="backup-modal-header">
              <h3>{titleText}</h3>
              <button onClick={handleClose} className="backup-close-modal">X</button>
            </div>
            
            <div className="backup-diagram-type-selector">
              <button 
                className={`backup-diagram-type-btn ${diagramType === 'er' ? 'active' : ''}`}
                onClick={() => handleDiagramTypeChange('er')}
              >
                Diagrama Entidad-Relacion
              </button>
              <button 
                className={`backup-diagram-type-btn ${diagramType === 'snowflake' ? 'active' : ''}`}
                onClick={() => handleDiagramTypeChange('snowflake')}
              >
                Diagrama de Copo de Nieve
              </button>
            </div>
            
            {showSelector && availableItems.length > 0 && diagramType === 'er' && (
              <div className="backup-table-selector">
                <div className="backup-table-selector-header">
                  <h4>Seleccionar tablas:</h4>
                  <button className="backup-select-all-btn" onClick={handleSelectAll}>
                    {selectAll ? 'Deseleccionar todas' : 'Seleccionar todas'}
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
                  {selectedItems.length} de {availableItems.length} tablas seleccionadas
                </div>
              </div>
            )}
            
            <div className="backup-diagram-content">
              {loading && (
                <div className="backup-loading-container">
                  <div className="backup-loading-spinner"></div>
                  <p>Generando diagrama...</p>
                </div>
              )}
              
              {error && <div className="backup-error-message">{error}</div>}
              
              {svgContent && !loading && (
                <div 
                  ref={diagramRef}
                  className="backup-diagram-visual"
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                />
              )}
            </div>

            {svgContent && !error && (
              <div className="backup-diagram-footer">
                <div className="backup-download-options">
                  <div className="backup-download-name">
                    <label>Nombre del archivo:</label>
                    <input
                      type="text"
                      value={downloadName}
                      onChange={(e) => setDownloadName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                      className="backup-download-input"
                    />
                    <span className="backup-download-extension">.png</span>
                  </div>
                  <button 
                    onClick={descargarPNG}
                    className="backup-download-btn-primary"
                    disabled={loading}
                  >
                    Guardar como PNG
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