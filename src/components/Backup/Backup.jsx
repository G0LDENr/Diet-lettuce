import React, { useState, useEffect } from 'react';
import { useConfig } from '../../context/config';
import '../../css/Backup/backup.css';

// Componentes separados
import DiagramaModal from './DiagramaModal';
import MessageModal from './MessageModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import RestoreConfirmModal from './RestoreConfirmModal';
import FullBackupModal from './FullBackupModal';
import PartialBackupModal from './PartialBackupModal';
import ScheduleModal from './ScheduleModal';
import UploadModal from './UploadModal';

// Iconos
import refreshIcon from '../../img/actualizar.png';
import diagramIcon from '../../img/diagram.png';
import uploadIcon from '../../img/upload.png';
import calendarIcon from '../../img/calendar.png';
import databaseIcon from '../../img/database.png';
import downloadIcon from '../../img/download.png';
import deleteIcon from '../../img/delete.png';
import restoreIcon from '../../img/restore.png';

const Backup = () => {
  const { darkMode } = useConfig();
  
  // Estados existentes
  const [backups, setBackups] = useState([]);
  const [filteredBackups, setFilteredBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [scheduledJobs, setScheduledJobs] = useState([]);
  
  // Estados para modales
  const [showDiagramModal, setShowDiagramModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [showFullBackupModal, setShowFullBackupModal] = useState(false);
  const [showPartialBackupModal, setShowPartialBackupModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Estados para datos
  const [messageData, setMessageData] = useState({ title: '', message: '', type: 'success' });
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  const [customName, setCustomName] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [backupToDelete, setBackupToDelete] = useState(null);
  const [backupToRestore, setBackupToRestore] = useState(null);
  
  const [scheduleData, setScheduleData] = useState({
    dias: {
      0: { seleccionado: false, hora: 2, tipo: 'full', tablas: [] },
      1: { seleccionado: false, hora: 2, tipo: 'full', tablas: [] },
      2: { seleccionado: false, hora: 2, tipo: 'full', tablas: [] },
      3: { seleccionado: false, hora: 2, tipo: 'full', tablas: [] },
      4: { seleccionado: false, hora: 2, tipo: 'full', tablas: [] },
      5: { seleccionado: false, hora: 2, tipo: 'full', tablas: [] },
      6: { seleccionado: false, hora: 2, tipo: 'full', tablas: [] },
    }
  });

  const backupsPerPage = 10; // Cambiado a 10

  // ============================================
  // FUNCIONES DE UTILIDAD
  // ============================================
  
  const showMessage = (title, message, type = 'success') => {
    setMessageData({ title, message, type });
    setShowMessageModal(true);
    if (type === 'success') setTimeout(() => setShowMessageModal(false), 3000);
  };

  // ============================================
  // FUNCIONES DE FETCH
  // ============================================

  const fetchBackups = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/backups/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setBackups(data.backups || []);
        setFilteredBackups(data.backups || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchScheduledJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/backups/scheduled', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setScheduledJobs(data.scheduled_jobs || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchAvailableTables = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/backups/tables', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableTables(data.tables || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchBackups(), fetchScheduledJobs()]);
      setLoading(false);
    };
    loadData();
  }, []);

const handleDownload = async (backupId, filename) => {
  try {
    const token = localStorage.getItem('token');
    
    showMessage(
      'Preparando descarga',
      'Obteniendo el archivo de respaldo...',
      'info'
    );
    
    const response = await fetch(`http://127.0.0.1:5000/backups/${backupId}/download`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Error en la descarga');
    }

    const blob = await response.blob();

    // Verificar si el navegador soporta la API File System Access
    if ('showSaveFilePicker' in window) {
      try {
        // Mostrar diálogo para elegir ubicación
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [{
            description: 'SQL Backup',
            accept: {
              'application/sql': ['.sql', '.sql.gz', '.gz'],
              'application/gzip': ['.gz', '.sql.gz'],
              'application/octet-stream': ['.sql', '.gz', '.sql.gz']
            }
          }]
        });
        
        // Crear un archivo escribible
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        
        showMessage(
          'Archivo guardado',
          `El respaldo se guardó correctamente en la ubicación seleccionada.`,
          'success'
        );
      } catch (err) {
        // Usuario canceló la selección
        if (err.name !== 'AbortError') {
          console.error('Error al guardar:', err);
          showMessage(
            'Error',
            'No se pudo guardar el archivo',
            'error'
          );
        }
      }
    } else {
      // Fallback para navegadores que no soportan File System Access
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      
      // Forzar el diálogo de guardado
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
      showMessage(
        'Descarga iniciada',
        'El archivo se está descargando. Revisa tu carpeta de descargas.',
        'success'
      );
    }
  } catch (error) {
    console.error('Error al descargar:', error);
    showMessage(
      'Error al descargar',
      'No se pudo descargar el respaldo',
      'error'
    );
  }
};

  const handleDeleteConfirm = async (backup) => {
    if (!backup) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:5000/backups/${backup.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setBackups(prev => prev.filter(b => b.id !== backup.id));
        setFilteredBackups(prev => prev.filter(b => b.id !== backup.id));
        setShowDeleteConfirm(false);
        showMessage('Eliminado', 'Respaldo eliminado', 'success');
      }
    } catch (error) {
      showMessage('Error', 'No se pudo eliminar', 'error');
    }
  };

  const handleRestoreConfirm = async (backup) => {
    if (!backup) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:5000/backups/${backup.id}/restore`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ confirm: true })
      });
      if (response.ok) {
        setShowRestoreConfirm(false);
        showMessage('Restaurado', 'Base de datos restaurada', 'success');
      }
    } catch (error) {
      showMessage('Error', 'No se pudo restaurar', 'error');
    }
  };

  const handleCreateFullBackup = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/backups/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          backup_type: 'full',
          custom_name: customName || undefined
        })
      });
      if (response.ok) {
        showMessage('Creado', 'Respaldo completo creado', 'success');
        fetchBackups();
        setShowFullBackupModal(false);
        setCustomName('');
      }
    } catch (error) {
      showMessage('Error', 'No se pudo crear', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePartialBackup = async () => {
    if (selectedTables.length === 0) {
      showMessage('Selección requerida', 'Selecciona al menos una tabla', 'warning');
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/backups/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          backup_type: 'partial',
          tables: selectedTables,
          custom_name: customName || undefined
        })
      });
      if (response.ok) {
        showMessage('Creado', 'Respaldo parcial creado', 'success');
        fetchBackups();
        setShowPartialBackupModal(false);
        setSelectedTables([]);
        setCustomName('');
      }
    } catch (error) {
      showMessage('Error', 'No se pudo crear', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleBackup = async () => {
    try {
      const trabajos = [];
      for (const [diaIndex, config] of Object.entries(scheduleData.dias)) {
        if (config.seleccionado) {
          trabajos.push({
            hour: config.hora,
            minute: 0,
            days_of_week: [parseInt(diaIndex)],
            backup_type: config.tipo,
            tables: config.tipo === 'partial' ? config.tablas : undefined
          });
        }
      }
      
      const token = localStorage.getItem('token');
      for (const trabajo of trabajos) {
        await fetch('http://127.0.0.1:5000/backups/schedule', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(trabajo)
        });
      }
      
      showMessage('Programado', 'Respaldos programados', 'success');
      fetchScheduledJobs();
      setShowScheduleModal(false);
    } catch (error) {
      showMessage('Error', 'No se pudo programar', 'error');
    }
  };

  const handleCancelSchedule = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://127.0.0.1:5000/backups/scheduled/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showMessage('Programación cancelada', 'El respaldo programado ha sido cancelado', 'success');
        fetchScheduledJobs();
      } else {
        const data = await response.json();
        showMessage('Error', data.message || 'Error al cancelar el respaldo programado', 'error');
      }
    } catch (error) {
      console.error('Error al cancelar:', error);
      showMessage('Error de conexión', 'No se pudo conectar con el servidor', 'error');
    }
  };

  const handleUploadBackup = async () => {
    if (!uploadFile) {
      showMessage('Archivo requerido', 'Selecciona un archivo', 'warning');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(30);
      
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('backup_file', uploadFile);

      const response = await fetch('http://127.0.0.1:5000/backups/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      setUploadProgress(70);
      
      if (response.ok) {
        setUploadProgress(100);
        showMessage('Importado', 'Respaldo importado', 'success');
        setShowUploadModal(false);
        setUploadFile(null);
        fetchBackups();
      }
    } catch (error) {
      showMessage('Error', 'No se pudo importar', 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRefresh = () => {
    fetchBackups();
    fetchScheduledJobs();
    showMessage('Actualizado', 'Lista de respaldos actualizada', 'success');
  };

  // ============================================
  // FILTROS Y BÚSQUEDA
  // ============================================

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    let filtered = backups;
    if (value.trim() !== '') {
      filtered = filtered.filter(backup => 
        backup.filename?.toLowerCase().includes(value.toLowerCase())
      );
    }
    if (typeFilter !== '') {
      filtered = filtered.filter(backup => backup.backup_type === typeFilter);
    }
    setFilteredBackups(filtered);
    setCurrentPage(1);
  };

  const handleTypeFilterChange = (e) => {
    const value = e.target.value;
    setTypeFilter(value);
    
    let filtered = backups;
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(backup => 
        backup.filename?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (value !== '') {
      filtered = filtered.filter(backup => backup.backup_type === value);
    }
    setFilteredBackups(filtered);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setTypeFilter('');
    setFilteredBackups(backups);
    setCurrentPage(1);
  };

  // ============================================
  // PAGINACIÓN
  // ============================================

  const indexOfLastBackup = currentPage * backupsPerPage;
  const indexOfFirstBackup = indexOfLastBackup - backupsPerPage;
  const currentBackups = filteredBackups.slice(indexOfFirstBackup, indexOfLastBackup);
  const totalPages = Math.ceil(filteredBackups.length / backupsPerPage);

  // ============================================
  // UTILIDADES DE RENDER
  // ============================================

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getTypeBadge = (type) => (
    <span className={`backup-type-badge ${type}`}>
      {type === 'full' ? 'Completo' : 'Parcial'}
    </span>
  );

  const getStatusBadge = (status) => (
    <span className={`backup-status-badge ${status}`}>
      {status === 'completed' ? 'Completado' : status}
    </span>
  );

  const horasDisponibles = Array.from({ length: 24 }, (_, i) => ({ valor: i, label: `${i}:00` }));

  if (loading && backups.length === 0) {
    return (
      <div className={`backup-container ${darkMode ? 'dark-mode' : ''}`}>
        <div className="backup-loading-spinner"></div>
        <p className="backup-loading-text">Cargando respaldos...</p>
      </div>
    );
  }

  return (
    <div className={`backup-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="backup-content">
        
        {/* Header */}
        <div className="backup-section-header">
          <h3 className="backup-section-title">Gestión de Respaldos</h3>
          <div className="backup-header-buttons">
            <button className="backup-refresh-btn" onClick={handleRefresh} title="Actualizar">
              <img src={refreshIcon} alt="Actualizar" className="backup-btn-icon-img-actualizar" />
            </button>
            
            <button className="backup-diagram-btn" onClick={() => setShowDiagramModal(true)} title="Ver diagrama ER">
              <img src={diagramIcon} alt="Diagrama" className="backup-btn-icon-img" />
              Diagrama ER
            </button>
            
            <div className="backup-button-separator"></div>
            
            <button className="backup-upload-btn" onClick={() => setShowUploadModal(true)}>
              <img src={uploadIcon} alt="Importar" className="backup-btn-icon-img" /> Importar
            </button>
            <button className="backup-schedule-btn" onClick={() => setShowScheduleModal(true)}>
              <img src={calendarIcon} alt="Programar" className="backup-btn-icon-img" /> Programar
            </button>
            <button className="backup-partial-btn" onClick={() => { fetchAvailableTables(); setShowPartialBackupModal(true); }}>
              <img src={databaseIcon} alt="Parcial" className="backup-btn-icon-img" /> Parcial
            </button>
            <button className="backup-full-btn" onClick={() => setShowFullBackupModal(true)}>
              Completo
            </button>
          </div>
        </div>

        {/* Jobs programados */}
        {scheduledJobs.length > 0 && (
          <div className="backup-scheduled-section">
            <h4>
              <img src={calendarIcon} alt="Programados" className="backup-section-icon" />
              Respaldos Programados
            </h4>
            <div className="backup-jobs-grid">
              {scheduledJobs.map(job => (
                <div key={job.id} className="backup-job-card">
                  <div className="backup-job-header">
                    <span className="backup-job-type">{job.backup_type === 'full' ? 'Completo' : 'Parcial'}</span>
                    <button 
                      className="backup-cancel-job-btn"
                      onClick={() => handleCancelSchedule(job.id)}
                      title="Cancelar programación"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="backup-job-details">
                    <div className="backup-job-time">
                      <strong>{job.hour?.toString().padStart(2, '0')}:00</strong>
                    </div>
                    <div className="backup-job-days">
                      {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
                        .filter((_, index) => job.days_of_week?.includes(index))
                        .join(', ')}
                    </div>
                    {job.tables && job.tables.length > 0 && (
                      <div className="backup-job-tables">
                        <small>Tablas: {job.tables.length}</small>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Búsqueda y Filtros */}
        <div className="backup-search-section">
          <div className="backup-filters-row">
            <div className="backup-search-container">
              <div className="backup-autocomplete-container">
                <input
                  type="text"
                  placeholder="Buscar respaldo por nombre..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="backup-search-input"
                />
                {searchTerm && (
                  <button className="backup-clear-search" onClick={clearSearch}>✕</button>
                )}
              </div>
            </div>
            
            <select 
              value={typeFilter} 
              onChange={handleTypeFilterChange}
              className="backup-filter-select"
            >
              <option value="">Todos los tipos</option>
              <option value="full">Completos</option>
              <option value="partial">Parciales</option>
            </select>
          </div>
        </div>

        {/* Tabla de respaldos */}
        <div className="backup-table-container">
          <table className="backup-table">
            <thead>
              <tr>
                <th>Archivo</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Tablas</th>
                <th>Tamaño</th>
                <th>Estado</th>
                <th className="backup-actions-header">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentBackups.length > 0 ? (
                currentBackups.map(backup => (
                  <tr key={backup.id} className="backup-row">
                    <td className="backup-filename">{backup.filename}</td>
                    <td className="backup-date">{formatDate(backup.created_at)}</td>
                    <td>{getTypeBadge(backup.backup_type)}</td>
                    <td className="backup-tables">
                      {backup.tables_included && backup.tables_included.length > 0 ? (
                        <span title={backup.tables_included.join(', ')}>
                          {backup.tables_included.length} tabla{backup.tables_included.length !== 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="backup-text-muted">Todas</span>
                      )}
                    </td>
                    <td className="backup-size">{backup.size_mb} MB</td>
                    <td>{getStatusBadge(backup.status)}</td>
                    <td className="backup-actions-cell">
                      <div className="backup-actions-buttons">
                        <button 
                          onClick={() => handleDownload(backup.id, backup.filename)}
                          className="backup-action-btn"
                          title="Descargar respaldo"
                        >
                          <img src={downloadIcon} alt="Descargar" className="backup-action-icon" />
                        </button>
                        <button 
                          onClick={() => { setBackupToRestore(backup); setShowRestoreConfirm(true); }}
                          className="backup-action-btn"
                          title="Restaurar desde este respaldo"
                        >
                          <img src={restoreIcon} alt="Restaurar" className="backup-action-icon" />
                        </button>
                        <button 
                          onClick={() => { setBackupToDelete(backup); setShowDeleteConfirm(true); }}
                          className="backup-action-btn"
                          title="Eliminar respaldo"
                        >
                          <img src={deleteIcon} alt="Eliminar" className="backup-action-icon" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="backup-no-results">
                    {searchTerm || typeFilter ? 'No se encontraron respaldos con esos criterios' : 'No hay respaldos disponibles'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Información de registros - SIEMPRE VISIBLE debajo de la tabla */}
          {filteredBackups.length > 0 && (
            <div className="backup-count-info">
              Mostrando {currentBackups.length} de {filteredBackups.length} respaldos
            </div>
          )}

          {/* Paginación - SOLO cuando hay más de 10 respaldos */}
          {totalPages > 1 && (
            <div className="backup-pagination">
              <div className="backup-pagination-controls">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                  disabled={currentPage === 1}
                  className="backup-pagination-btn"
                >
                  ← Anterior
                </button>
                
                <div className="backup-pagination-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(number => 
                      number === 1 || 
                      number === totalPages || 
                      (number >= currentPage - 1 && number <= currentPage + 1)
                    )
                    .map((number, index, array) => {
                      const showEllipsis = index > 0 && number - array[index - 1] > 1;
                      return (
                        <React.Fragment key={number}>
                          {showEllipsis && <span className="backup-pagination-ellipsis">...</span>}
                          <button
                            onClick={() => setCurrentPage(number)}
                            className={`backup-pagination-btn ${currentPage === number ? 'active' : ''}`}
                          >
                            {number}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>
                
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                  disabled={currentPage === totalPages}
                  className="backup-pagination-btn"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      <DiagramaModal 
        show={showDiagramModal}
        onClose={() => setShowDiagramModal(false)}
        token={localStorage.getItem('token')}
        darkMode={darkMode}
        showMessage={showMessage}
      />

      <MessageModal
        show={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        title={messageData.title}
        message={messageData.message}
        type={messageData.type}
      />

      <DeleteConfirmModal
        show={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => handleDeleteConfirm(backupToDelete)}
        backupName={backupToDelete?.filename}
      />

      <RestoreConfirmModal
        show={showRestoreConfirm}
        onClose={() => setShowRestoreConfirm(false)}
        onConfirm={() => handleRestoreConfirm(backupToRestore)}
        backupName={backupToRestore?.filename}
      />

      <FullBackupModal
        show={showFullBackupModal}
        onClose={() => setShowFullBackupModal(false)}
        onCreate={handleCreateFullBackup}
        customName={customName}
        setCustomName={setCustomName}
        loading={loading}
      />

      <PartialBackupModal
        show={showPartialBackupModal}
        onClose={() => setShowPartialBackupModal(false)}
        onCreate={handleCreatePartialBackup}
        customName={customName}
        setCustomName={setCustomName}
        availableTables={availableTables}
        selectedTables={selectedTables}
        setSelectedTables={setSelectedTables}
        loading={loading}
      />

      <ScheduleModal
        show={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSchedule={handleScheduleBackup}
        scheduleData={scheduleData}
        setScheduleData={setScheduleData}
        availableTables={availableTables}
        horasDisponibles={horasDisponibles}
      />

      <UploadModal
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUploadBackup}
        uploadFile={uploadFile}
        setUploadFile={setUploadFile}
        uploading={uploading}
        uploadProgress={uploadProgress}
      />
    </div>
  );
};

export default Backup;