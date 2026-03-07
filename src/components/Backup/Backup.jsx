import React, { useEffect, useState } from 'react';
import { useConfig } from '../../context/config';
import '../../css/Backup/backup.css';

import downloadIcon from '../../img/download.png';
import deleteIcon from '../../img/delete.png';
import refreshIcon from '../../img/actualizar.png';
import restoreIcon from '../../img/restore.png';
import calendarIcon from '../../img/calendar.png';
import databaseIcon from '../../img/database.png';
import uploadIcon from '../../img/upload.png';

const Backup = () => {
  const { darkMode } = useConfig();
  const [backups, setBackups] = useState([]);
  const [filteredBackups, setFilteredBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showFullBackupModal, setShowFullBackupModal] = useState(false);
  const [showPartialBackupModal, setShowPartialBackupModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageData, setMessageData] = useState({
    title: '',
    message: '',
    type: 'success' // success, error, warning, info
  });
  const [selectedTables, setSelectedTables] = useState([]);
  const [availableTables, setAvailableTables] = useState([]);
  const [customName, setCustomName] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Estados para el autocomplete
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  
  // Estado modificado para programación por días
  const [scheduleData, setScheduleData] = useState({
    // Configuración por día: día index (0=domingo, 6=sábado)
    dias: {
      0: { seleccionado: false, hora: 2, tipo: 'full', tablas: [] }, // Domingo
      1: { seleccionado: false, hora: 2, tipo: 'full', tablas: [] }, // Lunes
      2: { seleccionado: false, hora: 2, tipo: 'full', tablas: [] }, // Martes
      3: { seleccionado: false, hora: 2, tipo: 'full', tablas: [] }, // Miércoles
      4: { seleccionado: false, hora: 2, tipo: 'full', tablas: [] }, // Jueves
      5: { seleccionado: false, hora: 2, tipo: 'full', tablas: [] }, // Viernes
      6: { seleccionado: false, hora: 2, tipo: 'full', tablas: [] }, // Sábado
    }
  });
  
  const [scheduledJobs, setScheduledJobs] = useState([]);
  const [backupToDelete, setBackupToDelete] = useState(null);
  const [backupToRestore, setBackupToRestore] = useState(null);
  const backupsPerPage = 7;

  // Generar horas de 00 a 23
  const horasDisponibles = Array.from({ length: 24 }, (_, i) => {
    const hora = i.toString().padStart(2, '0');
    return { valor: i, label: `${hora}:00` };
  });

  // Función para mostrar mensajes con estilo
  const showMessage = (title, message, type = 'success') => {
    setMessageData({ title, message, type });
    setShowMessageModal(true);
    
    // Auto-cerrar después de 3 segundos para mensajes de éxito
    if (type === 'success') {
      setTimeout(() => {
        setShowMessageModal(false);
      }, 3000);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchBackups(),
          fetchScheduledJobs()
        ]);
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        showMessage(
          'Error de conexión',
          'No se pudieron cargar los datos iniciales. Por favor, intenta de nuevo.',
          'error'
        );
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://127.0.0.1:5000/backups/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBackups(data.backups || []);
        setFilteredBackups(data.backups || []);
      } else {
        console.error('Error al obtener respaldos:', response.status);
        showMessage(
          'Error',
          'No se pudieron obtener los respaldos. Código: ' + response.status,
          'error'
        );
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      showMessage(
        'Error de conexión',
        'No se pudo conectar con el servidor. Verifica tu conexión.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTables = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/backups/tables', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableTables(data.tables || []);
      } else {
        showMessage(
          'Error',
          'No se pudieron obtener las tablas disponibles',
          'error'
        );
      }
    } catch (error) {
      console.error('Error al obtener tablas:', error);
      showMessage(
        'Error de conexión',
        'No se pudo conectar con el servidor',
        'error'
      );
    }
  };

  const fetchScheduledJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/backups/scheduled', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setScheduledJobs(data.scheduled_jobs || []);
      }
    } catch (error) {
      console.error('Error al obtener trabajos programados:', error);
    }
  };

  const handleRefresh = () => {
    fetchBackups();
    fetchScheduledJobs();
    showMessage(
      'Actualizado',
      'La lista de respaldos se ha actualizado correctamente',
      'success'
    );
  };

  // Función para buscar sugerencias de respaldos
  const buscarSugerencias = (texto) => {
    if (!texto || texto.trim() === '') {
      setSugerencias(backups.slice(0, 10));
      setMostrarSugerencias(backups.length > 0);
      return;
    }

    if (texto.length < 1) {
      setSugerencias([]);
      setMostrarSugerencias(false);
      return;
    }

    const textoLower = texto.toLowerCase().trim();
    const sugerenciasFiltradas = backups.filter(backup =>
      backup.filename?.toLowerCase().includes(textoLower) ||
      backup.tables_included?.some(table => 
        table.toLowerCase().includes(textoLower)
      )
    );

    setSugerencias(sugerenciasFiltradas.slice(0, 8));
    setMostrarSugerencias(sugerenciasFiltradas.length > 0);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    buscarSugerencias(value);
    
    let filtered = backups;

    if (value.trim() !== '') {
      filtered = filtered.filter(backup => 
        backup.filename?.toLowerCase().includes(value.toLowerCase()) ||
        backup.tables_included?.some(table => 
          table.toLowerCase().includes(value.toLowerCase())
        )
      );
    }

    if (typeFilter !== '') {
      filtered = filtered.filter(backup => backup.backup_type === typeFilter);
    }
    
    setFilteredBackups(filtered);
    setCurrentPage(1);
  };

  const handleFocusSearch = () => {
    setSugerencias(backups.slice(0, 10));
    setMostrarSugerencias(backups.length > 0);
  };

  const handleBlurSearch = () => {
    setTimeout(() => {
      setMostrarSugerencias(false);
    }, 200);
  };

  const seleccionarBackupSugerencia = (backup) => {
    setSearchTerm(backup.filename);
    setMostrarSugerencias(false);
    setSugerencias([]);
    
    let filtered = backups.filter(b => b.filename === backup.filename);
    
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
        backup.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        backup.tables_included?.some(table => 
          table.toLowerCase().includes(searchTerm.toLowerCase())
        )
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
    setSugerencias([]);
    setMostrarSugerencias(false);
    
    let filtered = backups;
    
    if (typeFilter !== '') {
      filtered = filtered.filter(backup => backup.backup_type === typeFilter);
    }
    
    setFilteredBackups(filtered);
    setCurrentPage(1);
  };

  const indexOfLastBackup = currentPage * backupsPerPage;
  const indexOfFirstBackup = indexOfLastBackup - backupsPerPage;
  const currentBackups = filteredBackups.slice(indexOfFirstBackup, indexOfLastBackup);
  const totalPages = Math.ceil(filteredBackups.length / backupsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDeleteClick = (backupId, backupName) => {
    setBackupToDelete({ id: backupId, name: backupName });
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!backupToDelete) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://127.0.0.1:5000/backups/${backupToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const updatedBackups = backups.filter(backup => backup.id !== backupToDelete.id);
        setBackups(updatedBackups);
        setFilteredBackups(updatedBackups);
        setSugerencias(updatedBackups.slice(0, 10));
        
        setShowDeleteConfirm(false);
        setBackupToDelete(null);
        
        showMessage(
          'Respaldo eliminado',
          `El respaldo "${backupToDelete.name}" ha sido eliminado correctamente.`,
          'success'
        );
      } else {
        const data = await response.json();
        showMessage(
          'Error al eliminar',
          data.message || 'No se pudo eliminar el respaldo',
          'error'
        );
      }
    } catch (error) {
      console.error('Error al eliminar respaldo:', error);
      showMessage(
        'Error de conexión',
        'No se pudo conectar con el servidor',
        'error'
      );
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setBackupToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setBackupToDelete(null);
  };

  const handleRestoreClick = (backupId, backupName) => {
    setBackupToRestore({ id: backupId, name: backupName });
    setShowRestoreConfirm(true);
  };

  const handleRestoreConfirm = async () => {
    if (!backupToRestore) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://127.0.0.1:5000/backups/${backupToRestore.id}/restore`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ confirm: true })
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(
          'Restauración exitosa',
          'La base de datos ha sido restaurada correctamente.',
          'success'
        );
        setShowRestoreConfirm(false);
        setBackupToRestore(null);
      } else {
        showMessage(
          'Error al restaurar',
          data.message || 'No se pudo restaurar el respaldo',
          'error'
        );
      }
    } catch (error) {
      console.error('Error al restaurar respaldo:', error);
      showMessage(
        'Error de conexión',
        'No se pudo conectar con el servidor',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreCancel = () => {
    setShowRestoreConfirm(false);
    setBackupToRestore(null);
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

      const data = await response.json();

      if (response.ok) {
        showMessage(
          'Respaldo creado',
          'Respaldo completo creado exitosamente',
          'success'
        );
        fetchBackups();
        setShowFullBackupModal(false);
        setCustomName('');
      } else {
        showMessage(
          'Error',
          data.message || 'Error al crear respaldo',
          'error'
        );
      }
    } catch (error) {
      console.error('Error al crear respaldo:', error);
      showMessage(
        'Error de conexión',
        'No se pudo conectar con el servidor',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePartialBackup = async () => {
    if (selectedTables.length === 0) {
      showMessage(
        'Selección requerida',
        'Selecciona al menos una tabla para el respaldo parcial',
        'warning'
      );
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

      const data = await response.json();

      if (response.ok) {
        showMessage(
          'Respaldo creado',
          'Respaldo parcial creado exitosamente',
          'success'
        );
        fetchBackups();
        setShowPartialBackupModal(false);
        setSelectedTables([]);
        setCustomName('');
      } else {
        showMessage(
          'Error',
          data.message || 'Error al crear respaldo',
          'error'
        );
      }
    } catch (error) {
      console.error('Error al crear respaldo:', error);
      showMessage(
        'Error de conexión',
        'No se pudo conectar con el servidor',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleBackup = async () => {
    try {
      const trabajosPorDia = [];
      
      for (const [diaIndex, config] of Object.entries(scheduleData.dias)) {
        if (config.seleccionado) {
          const trabajo = {
            hour: config.hora,
            minute: 0,
            days_of_week: [parseInt(diaIndex)],
            backup_type: config.tipo,
          };
          
          if (config.tipo === 'partial' && config.tablas.length > 0) {
            trabajo.tables = config.tablas;
          }
          
          trabajosPorDia.push(trabajo);
        }
      }
      
      if (trabajosPorDia.length === 0) {
        showMessage(
          'Selección requerida',
          'Debes seleccionar al menos un día para programar',
          'warning'
        );
        return;
      }
      
      const token = localStorage.getItem('token');
      const resultados = [];
      
      for (const trabajo of trabajosPorDia) {
        const response = await fetch('http://127.0.0.1:5000/backups/schedule', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(trabajo)
        });

        const data = await response.json();
        resultados.push({ ...trabajo, success: response.ok, message: data.message });
      }
      
      const exitosos = resultados.filter(r => r.success);
      const fallidos = resultados.filter(r => !r.success);
      
      if (exitosos.length > 0) {
        let mensaje = `${exitosos.length} respaldo(s) programado(s) exitosamente`;
        if (fallidos.length > 0) {
          mensaje += `, ${fallidos.length} fallido(s)`;
        }
        
        showMessage(
          'Programación completada',
          mensaje,
          fallidos.length > 0 ? 'warning' : 'success'
        );
      }
      
      if (fallidos.length > 0) {
        console.error('Trabajos fallidos:', fallidos);
      }
      
      fetchScheduledJobs();
      setShowScheduleModal(false);
      
      setScheduleData({
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
      
    } catch (error) {
      console.error('Error al programar respaldo:', error);
      showMessage(
        'Error de conexión',
        'No se pudo conectar con el servidor',
        'error'
      );
    }
  };

  const handleDownload = async (backupId, filename) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://127.0.0.1:5000/backups/${backupId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showMessage(
          'Descarga iniciada',
          `El archivo "${filename}" se está descargando`,
          'success'
        );
      } else {
        showMessage(
          'Error al descargar',
          'No se pudo descargar el respaldo',
          'error'
        );
      }
    } catch (error) {
      console.error('Error al descargar:', error);
      showMessage(
        'Error de conexión',
        'No se pudo conectar con el servidor',
        'error'
      );
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
        showMessage(
          'Programación cancelada',
          'El respaldo programado ha sido cancelado',
          'success'
        );
        fetchScheduledJobs();
      } else {
        const data = await response.json();
        showMessage(
          'Error',
          data.message || 'Error al cancelar el respaldo programado',
          'error'
        );
      }
    } catch (error) {
      console.error('Error al cancelar:', error);
      showMessage(
        'Error de conexión',
        'No se pudo conectar con el servidor',
        'error'
      );
    }
  };

  const handleUploadBackup = async () => {
    if (!uploadFile) {
      showMessage(
        'Archivo requerido',
        'Selecciona un archivo para importar',
        'warning'
      );
      return;
    }

    const allowedExtensions = ['.sql', '.sql.gz', '.gz'];
    const fileName = uploadFile.name.toLowerCase();
    const isValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidExtension) {
      showMessage(
        'Formato no válido',
        'Solo se permiten archivos .sql o .sql.gz',
        'warning'
      );
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(10);
      
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('backup_file', uploadFile);

      const response = await fetch('http://127.0.0.1:5000/backups/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      setUploadProgress(70);
      
      const data = await response.json();
      
      if (response.ok) {
        setUploadProgress(100);
        showMessage(
          'Importación exitosa',
          'Respaldo importado correctamente',
          'success'
        );
        setShowUploadModal(false);
        setUploadFile(null);
        fetchBackups();
      } else {
        showMessage(
          'Error',
          data.message || 'No se pudo importar el respaldo',
          'error'
        );
      }
    } catch (error) {
      console.error('Error al importar respaldo:', error);
      showMessage(
        'Error de conexión',
        'No se pudo conectar con el servidor',
        'error'
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleTableToggle = (tableName) => {
    setSelectedTables(prev => 
      prev.includes(tableName) 
        ? prev.filter(t => t !== tableName)
        : [...prev, tableName]
    );
  };

  const handleSelectAllTables = () => {
    if (selectedTables.length === availableTables.length) {
      setSelectedTables([]);
    } else {
      setSelectedTables([...availableTables]);
    }
  };

  const handleDiaChange = (diaIndex, campo, valor) => {
    setScheduleData(prev => ({
      ...prev,
      dias: {
        ...prev.dias,
        [diaIndex]: {
          ...prev.dias[diaIndex],
          [campo]: valor
        }
      }
    }));
  };

  const toggleDiaSeleccionado = (diaIndex) => {
    const diaActual = scheduleData.dias[diaIndex];
    handleDiaChange(diaIndex, 'seleccionado', !diaActual.seleccionado);
  };

  const handleTablaToggleParaDia = (diaIndex, tabla) => {
    const diaActual = scheduleData.dias[diaIndex];
    const nuevasTablas = diaActual.tablas.includes(tabla)
      ? diaActual.tablas.filter(t => t !== tabla)
      : [...diaActual.tablas, tabla];
    
    handleDiaChange(diaIndex, 'tablas', nuevasTablas);
  };

  const handleSelectAllTablasParaDia = (diaIndex) => {
    const diaActual = scheduleData.dias[diaIndex];
    if (diaActual.tablas.length === availableTables.length) {
      handleDiaChange(diaIndex, 'tablas', []);
    } else {
      handleDiaChange(diaIndex, 'tablas', [...availableTables]);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      full: { class: 'full', text: 'Completo'},
      partial: { class: 'partial', text: 'Parcial' }
    };
    
    const config = typeConfig[type] || { class: 'full', text: type };
    
    return (
      <span className={`backup-type-badge ${config.class}`}>
        {config.text}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { class: 'completed', text: 'Completado' },
      failed: { class: 'failed', text: 'Fallido' },
      in_progress: { class: 'in-progress', text: 'En Progreso' }
    };
    
    const config = statusConfig[status] || { class: 'completed', text: status };
    
    return <span className={`backup-status-badge ${config.class}`}>{config.text}</span>;
  };

  if (loading && backups.length === 0 && filteredBackups.length === 0) {
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
        
        {/* Header con título y botones */}
        <div className="backup-section-header">
          <h3 className="backup-section-title">Gestión de Respaldos</h3>
          <div className="backup-header-buttons">
            <button 
              className="backup-refresh-btn"
              onClick={handleRefresh}
              title="Actualizar lista"
              disabled={loading}
            >
              <img src={refreshIcon} alt="Actualizar" className="backup-btn-icon-img-actualizar" />
            </button>
            
            <button 
              className="backup-upload-btn"
              onClick={() => setShowUploadModal(true)}
              title="Importar respaldo existente"
            >
              <img src={uploadIcon} alt="Importar" className="backup-btn-icon-img" />
              Importar
            </button>
            
            <button 
              className="backup-schedule-btn"
              onClick={() => setShowScheduleModal(true)}
              title="Programar respaldo automático"
            >
              <img src={calendarIcon} alt="Programar" className="backup-btn-icon-img" />
              Programar
            </button>
            <button 
              className="backup-partial-btn"
              onClick={() => {
                fetchAvailableTables();
                setShowPartialBackupModal(true);
              }}
              title="Crear respaldo parcial"
            >
              <img src={databaseIcon} alt="Parcial" className="backup-btn-icon-img" />
              Respaldo Parcial
            </button>
            <button 
              className="backup-full-btn"
              onClick={() => setShowFullBackupModal(true)}
              title="Crear respaldo completo"
            >
              <span className="backup-btn-icon"></span>
              Respaldo Completo
            </button>
          </div>
        </div>

        {/* Trabajos programados */}
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
                    <span className="backup-job-type">
                      {job.backup_type === 'full' ? 'Completo' : 'Parcial'}
                    </span>
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

        {/* Buscador y Filtros */}
        <div className="backup-search-section">
          <div className="backup-filters-row">
            <div className="backup-search-container backup-main-search">
              <div className="backup-autocomplete-container">
                <input
                  type="text"
                  placeholder="Escribe para buscar o haz clic para ver todos los respaldos"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={handleFocusSearch}
                  onBlur={handleBlurSearch}
                  className="backup-search-input"
                  maxLength="100"
                  autoComplete="off"
                />
                {searchTerm && (
                  <button 
                    className="backup-clear-search"
                    onClick={clearSearch}
                    title="Limpiar búsqueda"
                  >
                    ✕
                  </button>
                )}
                
                {/* Sugerencias cuando hay coincidencias */}
                {mostrarSugerencias && sugerencias.length > 0 && (
                  <div className="backup-autocomplete-suggestions">
                    <div className="backup-suggestions-header">
                      {searchTerm.trim() === '' 
                        ? `Todos los respaldos (${sugerencias.length})`
                        : `Coincidencias encontradas (${sugerencias.length})`
                      }
                    </div>
                    {sugerencias.map((backup, index) => (
                      <div
                        key={index}
                        className="backup-suggestion-item"
                        onClick={() => seleccionarBackupSugerencia(backup)}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <div className="backup-suggestion-name">
                          <strong>{backup.filename}</strong>
                        </div>
                        <div className="backup-suggestion-details">
                          <span>Fecha: {formatDate(backup.created_at)}</span>
                          <span className={`backup-type-badge-small ${backup.backup_type}`}>
                            {backup.backup_type === 'full' ? 'Completo' : 'Parcial'}
                          </span>
                          <span>Tamaño: {backup.size_mb} MB</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Mensaje cuando no hay coincidencias */}
                {mostrarSugerencias && sugerencias.length === 0 && searchTerm.length >= 1 && (
                  <div className="backup-autocomplete-suggestions">
                    <div className="backup-suggestion-item backup-no-results">
                      No se encontraron respaldos que coincidan con "{searchTerm}"
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="backup-filter-group">
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
        </div>

        {/* Tabla de respaldos */}
        <div className="backup-table-container">
          <table className="backup-table">
            <thead>
              <tr>
                <th className="backup-th">Nombre del Archivo</th>
                <th className="backup-th">Fecha</th>
                <th className="backup-th">Tipo</th>
                <th className="backup-th">Tablas</th>
                <th className="backup-th">Tamaño</th>
                <th className="backup-th">Estado</th>
                <th className="backup-th backup-actions-header">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentBackups.length > 0 ? (
                currentBackups.map(backup => (
                  <tr key={backup.id} className="backup-row">
                    <td className="backup-td backup-filename">
                      <strong>{backup.filename}</strong>
                    </td>
                    <td className="backup-td backup-date">
                      {formatDate(backup.created_at)}
                    </td>
                    <td className="backup-td backup-type">
                      {getTypeBadge(backup.backup_type)}
                    </td>
                    <td className="backup-td backup-tables">
                      {backup.tables_included && backup.tables_included.length > 0 ? (
                        <span 
                          className="backup-tables-count"
                          title={backup.tables_included.join(', ')}
                        >
                          {backup.tables_included.length} tabla{backup.tables_included.length !== 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="backup-text-muted">Todas</span>
                      )}
                    </td>
                    <td className="backup-td backup-size">
                      <strong>{backup.size_mb} MB</strong>
                    </td>
                    <td className="backup-td backup-status">
                      {getStatusBadge(backup.status)}
                    </td>
                    <td className="backup-td backup-actions-cell">
                      <div className="backup-actions-buttons">
                        <button 
                          onClick={() => handleDownload(backup.id, backup.filename)}
                          className="backup-action-btn backup-download-btn"
                          title="Descargar respaldo"
                        >
                          <img src={downloadIcon} alt="Descargar" className="backup-action-icon" />
                        </button>
                        <button 
                          onClick={() => handleRestoreClick(backup.id, backup.filename)}
                          className="backup-action-btn backup-restore-btn"
                          title="Restaurar desde este respaldo"
                        >
                          <img src={restoreIcon} alt="Restaurar" className="backup-action-icon" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(backup.id, backup.filename)}
                          className="backup-action-btn backup-delete-btn"
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

          {/* Paginación */}
          {filteredBackups.length > backupsPerPage && (
            <div className="backup-pagination-container">
              <div className="backup-pagination-controls">
                <button 
                  onClick={() => paginate(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="backup-pagination-btn backup-prev-btn"
                >
                  Anterior
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
                            onClick={() => paginate(number)}
                            className={`backup-pagination-btn ${currentPage === number ? 'backup-active' : ''}`}
                          >
                            {number}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>
                
                <button 
                  onClick={() => paginate(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  className="backup-pagination-btn backup-next-btn"
                >
                  Siguiente
                </button>
              </div>

              <div className="backup-count-info">
                Mostrando {currentBackups.length} de {filteredBackups.length} respaldos
              </div>
            </div>
          )}

          {filteredBackups.length <= backupsPerPage && filteredBackups.length > 0 && (
            <div className="backup-count-info">
              Mostrando {currentBackups.length} de {filteredBackups.length} respaldos
            </div>
          )}
        </div>

        {/* Modal de mensajes con estilo */}
        {showMessageModal && (
          <div className="backup-modal-overlay-message">
            <div className={`backup-message-modal ${messageData.type}`}>
              <div className="backup-message-header">
                <span className="backup-message-icon">
                  {messageData.type === 'success' && '✅'}
                  {messageData.type === 'error' && '❌'}
                  {messageData.type === 'warning' && '⚠️'}
                  {messageData.type === 'info' && 'ℹ️'}
                </span>
                <h4>{messageData.title}</h4>
                <button 
                  className="backup-message-close"
                  onClick={() => setShowMessageModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className="backup-message-body">
                <p>{messageData.message}</p>
              </div>
              <div className="backup-message-footer">
                <button 
                  className="backup-message-btn"
                  onClick={() => setShowMessageModal(false)}
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación de eliminación */}
        {showDeleteConfirm && (
          <div className="backup-modal-overlay-delete">
            <div className="backup-modal-content backup-confirm-modal">
              <div className="backup-confirm-header">
                <h3 className="backup-confirm-title">¿Eliminar Respaldo?</h3>
              </div>
              <div className="backup-confirm-body">
                <div className="backup-confirm-icon">⚠️</div>
                <p className="backup-confirm-message">
                  ¿Estás seguro de que quieres eliminar el respaldo
                  <strong> "{backupToDelete?.name}"</strong>?
                </p>
                <p className="backup-confirm-warning">
                  Esta acción eliminará tanto el registro como el archivo físico.
                </p>
              </div>
              <div className="backup-confirm-actions">
                <button 
                  className="backup-confirm-btn backup-cancel-btn"
                  onClick={handleDeleteCancel}
                >
                  Cancelar
                </button>
                <button 
                  className="backup-confirm-btn backup-delete-confirm-btn"
                  onClick={handleDeleteConfirm}
                >
                  Sí, Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación de restauración */}
        {showRestoreConfirm && (
          <div className="backup-modal-overlay-delete">
            <div className="backup-modal-content backup-confirm-modal">
              <div className="backup-confirm-header">
                <h3 className="backup-confirm-title">⚠️ Restaurar Base de Datos</h3>
              </div>
              <div className="backup-confirm-body">
                <div className="backup-confirm-icon">⚠️</div>
                <p className="backup-confirm-message">
                  ¿Estás seguro de que quieres restaurar la base de datos desde
                  <strong> "{backupToRestore?.name}"</strong>?
                </p>
                <p className="backup-confirm-warning">
                  <strong>ADVERTENCIA:</strong> Esto sobrescribirá la base de datos actual. 
                  Asegúrate de tener un respaldo reciente.
                </p>
              </div>
              <div className="backup-confirm-actions">
                <button 
                  className="backup-confirm-btn backup-cancel-btn"
                  onClick={handleRestoreCancel}
                >
                  Cancelar
                </button>
                <button 
                  className="backup-confirm-btn backup-restore-confirm-btn"
                  onClick={handleRestoreConfirm}
                >
                  Sí, Restaurar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para respaldo completo */}
        {showFullBackupModal && (
          <div className="backup-modal-overlay">
            <div className="backup-modal-content">
              <div className="backup-modal-header">
                <h3 className="backup-modal-title">Crear Respaldo Completo</h3>
                <button className="backup-close-modal" onClick={() => setShowFullBackupModal(false)}>✕</button>
              </div>
              <div className="backup-modal-body">
                <div className="backup-form-group">
                  <label className="backup-form-label">Nombre personalizado (opcional)</label>
                  <input
                    type="text"
                    className="backup-form-control"
                    placeholder="Ej: respaldo_2026"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                  />
                  <small className="backup-form-text">
                    Si se deja vacío, se generará un nombre automático
                  </small>
                </div>
                <div className="backup-info-box">
                  <p>Se creará un respaldo completo de toda la base de datos.</p>
                  <p>Este proceso puede tomar varios minutos dependiendo del tamaño.</p>
                </div>
              </div>
              <div className="backup-modal-footer">
                <button 
                  className="backup-modal-btn cancel"
                  onClick={() => setShowFullBackupModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  className="backup-modal-btn primary"
                  onClick={handleCreateFullBackup}
                  disabled={loading}
                >
                  {loading ? 'Creando...' : 'Crear Respaldo Completo'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para respaldo parcial */}
        {showPartialBackupModal && (
          <div className="backup-modal-overlay">
            <div className="backup-modal-content backup-large-modal">
              <div className="backup-modal-header">
                <h3 className="backup-modal-title">Crear Respaldo Parcial</h3>
                <button className="backup-close-modal" onClick={() => setShowPartialBackupModal(false)}>✕</button>
              </div>
              <div className="backup-modal-body">
                <div className="backup-form-group">
                  <label className="backup-form-label">Nombre personalizado (opcional)</label>
                  <input
                    type="text"
                    className="backup-form-control"
                    placeholder="Ej: respaldo_usuarios_pedidos"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                  />
                </div>
                
                <div className="backup-tables-section">
                  <div className="backup-tables-header">
                    <h4 className="backup-tables-title">Seleccionar Tablas</h4>
                    <button 
                      className="backup-select-all-btn"
                      onClick={handleSelectAllTables}
                    >
                      {selectedTables.length === availableTables.length ? 'Deseleccionar Todas' : 'Seleccionar Todas'}
                    </button>
                  </div>
                  
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
                    {selectedTables.length} tabla{selectedTables.length !== 1 ? 's' : ''} seleccionada{selectedTables.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <div className="backup-modal-footer">
                <button 
                  className="backup-modal-btn cancel"
                  onClick={() => setShowPartialBackupModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  className="backup-modal-btn primary"
                  onClick={handleCreatePartialBackup}
                  disabled={loading || selectedTables.length === 0}
                >
                  {loading ? 'Creando...' : 'Crear Respaldo Parcial'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para programar respaldo */}
        {showScheduleModal && (
          <div className="backup-modal-overlay">
            <div className="backup-modal-content backup-schedule-modal">
              <div className="backup-modal-header">
                <h3 className="backup-modal-title">Programar Respaldos Automáticos</h3>
                <button className="backup-close-modal" onClick={() => setShowScheduleModal(false)}>✕</button>
              </div>
              <div className="backup-modal-body">
                <div className="backup-schedule-instructions">
                  <p>Selecciona los días de la semana y configura la hora para cada día.</p>
                </div>
                
                {/* Días de la semana */}
                <div className="backup-dias-programacion">
                  {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map((nombreDia, index) => {
                    const diaConfig = scheduleData.dias[index];
                    const esSeleccionado = diaConfig.seleccionado;
                    
                    return (
                      <div key={index} className={`backup-dia-item ${esSeleccionado ? 'seleccionado' : ''}`}>
                        {/* Checkbox del día */}
                        <div className="backup-dia-header">
                          <label className="backup-dia-checkbox-label">
                            <input
                              type="checkbox"
                              checked={esSeleccionado}
                              onChange={() => toggleDiaSeleccionado(index)}
                            />
                            <span className="backup-dia-nombre">{nombreDia}</span>
                          </label>
                        </div>
                        
                        {/* Configuración del día (solo si está seleccionado) */}
                        {esSeleccionado && (
                          <div className="backup-dia-config">
                            <div className="backup-config-row">
                              <div className="backup-config-group">
                                <label>Hora</label>
                                <select
                                  value={diaConfig.hora}
                                  onChange={(e) => handleDiaChange(index, 'hora', parseInt(e.target.value))}
                                  className="backup-hora-select"
                                >
                                  {horasDisponibles.map(hora => (
                                    <option key={hora.valor} value={hora.valor}>
                                      {hora.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              
                              <div className="backup-config-group">
                                <label>Tipo</label>
                                <select
                                  value={diaConfig.tipo}
                                  onChange={(e) => handleDiaChange(index, 'tipo', e.target.value)}
                                  className="backup-tipo-select"
                                >
                                  <option value="full">Completo</option>
                                  <option value="partial">Parcial</option>
                                </select>
                              </div>
                            </div>
                            
                            {/* Tablas (solo si es parcial) */}
                            {diaConfig.tipo === 'partial' && (
                              <div className="backup-config-tablas">
                                <div className="backup-tablas-header">
                                  <label>Seleccionar Tablas</label>
                                  <button 
                                    type="button"
                                    className="backup-select-all-tablas-btn"
                                    onClick={() => handleSelectAllTablasParaDia(index)}
                                  >
                                    {diaConfig.tablas.length === availableTables.length ? 'Deseleccionar Todas' : 'Seleccionar Todas'}
                                  </button>
                                </div>
                                
                                <div className="backup-tablas-grid-mini">
                                  {availableTables.map((tabla, idx) => (
                                    <label key={idx} className="backup-tabla-checkbox-mini">
                                      <input
                                        type="checkbox"
                                        checked={diaConfig.tablas.includes(tabla)}
                                        onChange={() => handleTablaToggleParaDia(index, tabla)}
                                      />
                                      <span>{tabla}</span>
                                    </label>
                                  ))}
                                </div>
                                
                                <div className="backup-tablas-count">
                                  {diaConfig.tablas.length} tabla{diaConfig.tablas.length !== 1 ? 's' : ''} seleccionada{diaConfig.tablas.length !== 1 ? 's' : ''}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Resumen */}
                <div className="backup-schedule-summary">
                  <h4 className="backup-summary-title">Resumen de Programación</h4>
                  <div className="backup-summary-content">
                    {Object.entries(scheduleData.dias)
                      .filter(([_, config]) => config.seleccionado)
                      .map(([diaIndex, config]) => {
                        const diaNombre = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][diaIndex];
                        return (
                          <div key={diaIndex} className="backup-summary-item">
                            <strong>{diaNombre}:</strong>
                            <span>{config.hora.toString().padStart(2, '0')}:00 - {config.tipo === 'full' ? 'Completo' : 'Parcial'}</span>
                            {config.tipo === 'partial' && config.tablas.length > 0 && (
                              <span className="backup-summary-tablas">({config.tablas.length} tablas)</span>
                            )}
                          </div>
                        );
                      })}
                    
                    {Object.values(scheduleData.dias).filter(d => d.seleccionado).length === 0 && (
                      <div className="backup-summary-empty">
                        No hay días seleccionados
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="backup-modal-footer">
                <button 
                  className="backup-modal-btn cancel"
                  onClick={() => setShowScheduleModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  className="backup-modal-btn primary"
                  onClick={handleScheduleBackup}
                  disabled={Object.values(scheduleData.dias).filter(d => d.seleccionado).length === 0}
                >
                  Programar Respaldos
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para importar respaldo */}
        {showUploadModal && (
          <div className="backup-modal-overlay">
            <div className="backup-modal-content">
              <div className="backup-modal-header">
                <h3 className="backup-modal-title">Importar Respaldo Existente</h3>
                <button className="backup-close-modal" onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                }}>✕</button>
              </div>
              <div className="backup-modal-body">
                <div className="backup-form-group">
                  <label className="backup-form-label">Seleccionar archivo de respaldo (.sql o .sql.gz)</label>
                  <input
                    type="file"
                    className="backup-form-control-file"
                    accept=".sql,.sql.gz,.gz"
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    disabled={uploading}
                  />
                  <small className="backup-form-text">
                    Formatos aceptados: .sql, .sql.gz, .gz
                  </small>
                </div>
                
                {uploadFile && (
                  <div className="backup-file-info">
                    <p><strong>Archivo seleccionado:</strong> {uploadFile.name}</p>
                    <p><strong>Tamaño:</strong> {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    <p><strong>Tipo:</strong> {uploadFile.type || 'Desconocido'}</p>
                  </div>
                )}
                
                {uploading && (
                  <div className="backup-upload-progress">
                    <div className="backup-progress-bar">
                      <div 
                        className="backup-progress-fill" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="backup-progress-text">
                      Importando... {uploadProgress}%
                    </p>
                  </div>
                )}
                
                <div className="backup-upload-info">
                  <p>Este respaldo se agregará a la lista y podrás restaurarlo cuando sea necesario.</p>
                  <p className="text-warning">
                    <strong>Nota:</strong> Asegúrate de que el respaldo sea compatible con tu versión de base de datos.
                  </p>
                </div>
              </div>
              <div className="backup-modal-footer">
                <button 
                  className="backup-modal-btn cancel"
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFile(null);
                  }}
                  disabled={uploading}
                >
                  Cancelar
                </button>
                <button 
                  className="backup-modal-btn primary"
                  onClick={handleUploadBackup}
                  disabled={!uploadFile || uploading}
                >
                  {uploading ? 'Importando...' : 'Importar Respaldo'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Backup;