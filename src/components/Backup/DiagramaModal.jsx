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
  
  // Estados para selección de tablas
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showTableSelector, setShowTableSelector] = useState(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: darkMode ? 'dark' : 'default',
      securityLevel: 'loose',
      er: { diagramPadding: 30, layoutDirection: 'TB', fontSize: 14 }
    });
  }, [darkMode]);

  useEffect(() => {
    if (show) fetchDiagram();
  }, [show]);

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
        
        // Extraer nombres de tablas/colecciones
        if (data.data.tipo_bd === 'MySQL') {
          const tablas = data.data.tablas?.map(t => t.nombre) || [];
          setAvailableTables(tablas);
          setSelectedTables(tablas); // Por defecto seleccionar todas
        } else {
          const colecciones = data.data.colecciones?.map(c => c.nombre) || [];
          setAvailableTables(colecciones);
          setSelectedTables(colecciones); // Por defecto seleccionar todas
        }
        
        setShowTableSelector(true);
      } else {
        setError(data.message || 'Error al generar diagrama');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const generarDiagrama = async (data, tablasSeleccionadas) => {
    try {
      let def = 'erDiagram\n';
      
      if (data.tipo_bd === 'MySQL') {
        const tablasFiltradas = data.tablas?.filter(t => 
          tablasSeleccionadas.includes(t.nombre)
        ) || [];
        
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
        
      } else {
        const coleccionesFiltradas = data.colecciones?.filter(c => 
          tablasSeleccionadas.includes(c.nombre)
        ) || [];

        coleccionesFiltradas.forEach(col => {
          def += `  ${col.nombre} {\n`;
          
          const camposFiltrados = col.campos?.filter(campo => 
            !campo.nombre.startsWith('_') // Filtrar campos internos si es necesario
          ) || [];
          
          camposFiltrados.forEach(campo => {
            const tipoSimplificado = campo.tipo.replace(/[^a-zA-Z0-9]/g, '');
            const nombreCampo = campo.nombre.replace(/[^a-zA-Z0-9_]/g, '');
            const ref = campo.es_referencia ? ' REF' : '';
            
            def += `    ${tipoSimplificado} ${nombreCampo}${ref}\n`;
          });
          
          def += `  }\n`;
        });

        // Definir relaciones solo entre colecciones seleccionadas
        const relacionesFiltradas = data.relaciones?.filter(rel => 
          tablasSeleccionadas.includes(rel.coleccion_origen) && 
          tablasSeleccionadas.includes(rel.coleccion_destino)
        ) || [];

        relacionesFiltradas.forEach(rel => {
          def += `  ${rel.coleccion_origen} ||--o{ ${rel.coleccion_destino} : "referencia"\n`;
        });
      }

      const { svg } = await mermaid.render('diagrama', def);
      setSvgContent(svg);
      
    } catch (err) {
      setError('Error generando diagrama: ' + err.message);
    }
  };

  const handleTableToggle = (tableName) => {
    setSelectedTables(prev => {
      const newSelection = prev.includes(tableName)
        ? prev.filter(t => t !== tableName)
        : [...prev, tableName];
      
      // Actualizar estado de "seleccionar todos"
      setSelectAll(newSelection.length === availableTables.length);
      
      // Regenerar diagrama con nueva selección
      if (diagramData) {
        generarDiagrama(diagramData, newSelection);
      }
      
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTables([]);
      setSelectAll(false);
      if (diagramData) {
        generarDiagrama(diagramData, []);
      }
    } else {
      setSelectedTables([...availableTables]);
      setSelectAll(true);
      if (diagramData) {
        generarDiagrama(diagramData, availableTables);
      }
    }
  };

  const descargarPNG = async () => {
    if (!diagramRef.current) return;

    try {
      showMessage('Procesando', 'Generando imagen PNG...', 'info');

      const dataUrl = await toPng(diagramRef.current, {
        quality: 1,
        backgroundColor: 'white',
        pixelRatio: 2,
        style: {
          'background-color': 'white'
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

  if (!show) return null;

  return (
    <div className="backup-modal-overlay">
      <div className="backup-modal-content backup-diagram-modal">
        <div className="backup-modal-header">
          <h3>Diagrama Entidad-Relación</h3>
          <button onClick={onClose} className="backup-close-modal">✕</button>
        </div>
        
        {/* Selector de tablas */}
        {showTableSelector && availableTables.length > 0 && (
          <div className="backup-table-selector">
            <div className="backup-table-selector-header">
              <h4>Seleccionar tablas para el diagrama:</h4>
              <button 
                className="backup-select-all-btn"
                onClick={handleSelectAll}
              >
                {selectAll ? 'Deseleccionar todas' : 'Seleccionar todas'}
              </button>
            </div>
            <div className="backup-table-selector-grid">
              {availableTables.map(table => (
                <label key={table} className="backup-table-selector-item">
                  <input
                    type="checkbox"
                    checked={selectedTables.includes(table)}
                    onChange={() => handleTableToggle(table)}
                  />
                  <span className="backup-table-name">{table}</span>
                </label>
              ))}
            </div>
            <div className="backup-table-selector-info">
              {selectedTables.length} de {availableTables.length} tablas seleccionadas
            </div>
          </div>
        )}
        
        {/* Área de contenido con scroll */}
        <div className="backup-diagram-content">
          {loading && (
            <div className="backup-loading-container">
              <div className="backup-loading-spinner"></div>
              <p>Cargando datos de la base de datos...</p>
            </div>
          )}
          
          {error && (
            <div className="backup-error-message">
              {error}
            </div>
          )}
          
          {svgContent && (
            <div 
              ref={diagramRef}
              className="backup-diagram-visual"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          )}
          
          {!loading && !error && !svgContent && selectedTables.length > 0 && (
            <div className="backup-loading-container">
              <div className="backup-loading-spinner"></div>
              <p>Generando diagrama con {selectedTables.length} tablas...</p>
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
  );
};

export default DiagramaModal;