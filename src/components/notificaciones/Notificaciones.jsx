import React, { useEffect, useState } from 'react';
import { useConfig } from '../../context/config';
import PedidoModal from './Modal-Notificaciones';
import BackupCodeModal from './Modal-BackupCode';
import SendMessageModal from './SendMessageModal';
import AnalyticsModal from './AnalyticsModal';
import '../../css/Notificaciones/notificaciones.css';

import deleteIcon from '../../img/delete.png';
import refreshIcon from '../../img/actualizar.png';
import sendIcon from '../../img/enviar.png';
import statsIcon from '../../img/spark.png';
import readIcon from '../../img/leido.png';
import copyIcon from '../../img/copiar.png';

const Notificaciones = () => {
  const { darkMode, t } = useConfig();
  const [notificaciones, setNotificaciones] = useState([]);
  const [filteredNotificaciones, setFilteredNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [readFilter, setReadFilter] = useState('');
  const [showSendModal, setShowSendModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  
  // Estados para modales
  const [showPedidoModal, setShowPedidoModal] = useState(false);
  const [showBackupCodeModal, setShowBackupCodeModal] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [backupCodeNotif, setBackupCodeNotif] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [ordenesData, setOrdenesData] = useState({});
  
  const notificacionesPerPage = 10;
  const API_BASE_URL = 'http://127.0.0.1:5000';

  // ========== FUNCIONES DE UTILIDAD ==========
  
  const getUserType = () => {
    return userRole === 1 ? 'admin' : 'cliente';
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return 'Fecha inválida';
    }
  };

  const extractBackupCodeFromMessage = (mensaje) => {
    if (!mensaje) return null;
    const match = mensaje.match(/\*\*([A-Za-z0-9]{16})\*\*/);
    return match ? match[1] : null;
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const extractCodigoFromTitulo = (titulo) => {
    if (!titulo) return '';
    const patrones = [
      /#\s*([A-Z0-9]{4,})/i,
      /pedido\s*#?\s*([A-Z0-9]{4,})/i,
      /\b([A-Z0-9]{4,})\b/
    ];
    for (const patron of patrones) {
      const match = titulo.match(patron);
      if (match && match[1]) return match[1];
    }
    return '';
  };

  const cleanCodigoPedido = (codigo) => {
    if (!codigo) return '';
    return codigo.replace(/^#/, '');
  };

  const getEstadoEnEspanol = (estado) => {
    const estados = {
      'pendiente': 'Pendiente',
      'confirmada': 'Confirmada',
      'pagada': 'Pagada',
      'en_preparacion': 'En Preparación',
      'enviada': 'Enviada',
      'entregada': 'Entregada',
      'cancelada': 'Cancelada',
      'reembolsada': 'Reembolsada'
    };
    return estados[estado] || estado || 'Estado no especificado';
  };

  const getNotificationTypeText = (tipo) => {
    const tipos = {
      'nuevo_pedido': 'Nuevo Pedido',
      'estado_cambiado': 'Estado Cambiado',
      'estado_pedido': 'Estado Pedido',
      'mensaje_admin': 'Mensaje',
      'pedido_cancelado': 'Pedido Cancelado',
      'ingrediente_inactivo': 'Ingrediente Inactivo',
      'ingrediente_no_disponible': 'Ingrediente No Disponible',
      'backup_code': 'Código de Respaldo'
    };
    return tipos[tipo] || tipo;
  };

  const getNotificationColor = (tipo) => {
    const colores = {
      'nuevo_pedido': '#28a745',
      'estado_cambiado': '#007bff',
      'estado_pedido': '#17a2b8',
      'mensaje_admin': '#6f42c1',
      'pedido_cancelado': '#dc3545',
      'ingrediente_inactivo': '#ffc107',
      'ingrediente_no_disponible': '#fd7e14',
      'backup_code': '#96bd44'
    };
    return colores[tipo] || '#666';
  };

  const showMessage = (title, message, type = 'success') => {
    console.log(`${type}: ${title} - ${message}`);
    alert(`${title}: ${message}`);
  };

  // ========== FUNCIONES DE API ==========

  const fetchOrdenDetails = async (codigoPedido) => {
    if (!codigoPedido) return null;
    const codigoLimpio = codigoPedido.replace(/^#/, '');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/ordenes/codigo/${codigoLimpio}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrdenesData(prev => ({ ...prev, [codigoLimpio]: data }));
        return data;
      }
    } catch (error) {
      console.error('Error al obtener detalles de la orden:', error);
    }
    return null;
  };

  const fetchNotificaciones = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user'));
      
      if (!token) {
        setError('No hay sesión activa');
        setLoading(false);
        return;
      }
      
      const userType = userData?.rol === 1 ? 'admin' : 'cliente';
      const response = await fetch(`${API_BASE_URL}/notificaciones/usuario?user_type=${userType}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotificaciones(data.notificaciones || []);
        setFilteredNotificaciones(data.notificaciones || []);
        
        data.notificaciones?.slice(0, 5).forEach(notif => {
          if (notif.tipo !== 'backup_code') {
            const codigo = notif.metadata?.codigo_pedido || 
                          notif.metadata?.codigo || 
                          extractCodigoFromTitulo(notif.titulo);
            if (codigo) fetchOrdenDetails(codigo);
          }
        });
      } else if (response.status === 401) {
        setError('Tu sesión ha expirado');
      } else {
        setError(`Error ${response.status} al obtener notificaciones`);
      }
    } catch (error) {
      setError(`Error de conexión: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ========== MANEJADORES DE EVENTOS ==========

  const handleRefresh = async () => {
    await fetchNotificaciones();
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      const token = localStorage.getItem('token');
      
      const notificacion = notificaciones.find(n => n.id === notifId);
      if (!notificacion) return;
      
      if (notificacion.tipo === 'backup_code' && !notificacion.leida) {
        const backupCode = extractBackupCodeFromMessage(notificacion.mensaje);
        const confirmar = window.confirm(
          '⚠️ ADVERTENCIA: Esta notificación contiene tu código único de respaldo.\n\n' +
          'Una vez que la marques como leída, NO podrás ver el código nuevamente en esta notificación.\n\n' +
          `Tu código es: ${backupCode || 'No disponible'}\n\n` +
          '¿Ya guardaste el código en un lugar seguro?'
        );
        
        if (!confirmar) {
          return;
        }
      }
      
      const response = await fetch(`${API_BASE_URL}/notificaciones/${notifId}/leer`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const updatedNotificaciones = notificaciones.map(notif => 
          notif.id === notifId ? { ...notif, leida: true } : notif
        );
        setNotificaciones(updatedNotificaciones);
        setFilteredNotificaciones(updatedNotificaciones);
      }
      
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const userType = getUserType();
      
      const response = await fetch(`${API_BASE_URL}/notificaciones/leer-todas?user_type=${userType}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const updatedNotificaciones = notificaciones.map(notif => ({
          ...notif,
          leida: true
        }));
        setNotificaciones(updatedNotificaciones);
        setFilteredNotificaciones(updatedNotificaciones);
        showMessage('Éxito', 'Todas las notificaciones han sido marcadas como leídas', 'success');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeleteNotification = async (notifId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/notificaciones/${notifId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const updatedNotificaciones = notificaciones.filter(n => n.id !== notifId);
        setNotificaciones(updatedNotificaciones);
        setFilteredNotificaciones(updatedNotificaciones);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      return false;
    }
  };

  const handleDeleteClick = (notifId, notifTitulo) => {
    setNotificationToDelete({ id: notifId, titulo: notifTitulo });
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!notificationToDelete) return;

    try {
      setLoading(true);
      const success = await handleDeleteNotification(notificationToDelete.id);
      
      if (success) {
        setShowDeleteConfirm(false);
        setNotificationToDelete(null);
        showMessage('Notificación eliminada', 'La notificación ha sido eliminada correctamente', 'success');
      } else {
        showMessage('Error', 'No se pudo eliminar la notificación', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('Error de conexión', 'No se pudo conectar con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setNotificationToDelete(null);
  };

  const handleDeleteAllRead = async () => {
    if (!window.confirm('¿Eliminar todas las notificaciones leídas?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const userType = getUserType();
      
      const response = await fetch(`${API_BASE_URL}/notificaciones/leidas?user_type=${userType}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const updated = notificaciones.filter(n => !n.leida);
        setNotificaciones(updated);
        setFilteredNotificaciones(updated);
        showMessage('Notificaciones eliminadas', 'Todas las notificaciones leídas han sido eliminadas', 'success');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // ========== FUNCIÓN MEJORADA PARA ABRIR MODAL (DIFERENCIA ENTRE PEDIDO Y MENSAJE) ==========
  const handleOpenPedidoModal = async (notif) => {
    try {
      setModalLoading(true);
      
      if (!notif.leida) {
        await handleMarkAsRead(notif.id);
      }
      
      // Verificar si es un mensaje simple (tipo mensaje_admin)
      const esMensajeSimple = notif.tipo === 'mensaje_admin';
      
      if (esMensajeSimple) {
        // Es un mensaje simple, mostrar solo el mensaje en el modal
        const datosModal = {
          tipo: 'mensaje',
          titulo: notif.titulo,
          mensaje: notif.mensaje,
          fecha: formatDate(notif.fecha_creacion),
          notificacion: notif
        };
        setPedidoSeleccionado(datosModal);
        setShowPedidoModal(true);
        setModalLoading(false);
        return;
      }
      
      // Es una notificación de pedido, obtener detalles
      setShowPedidoModal(true);
      
      const codigoPedido = cleanCodigoPedido(
        notif.metadata?.codigo_pedido || 
        notif.metadata?.codigo || 
        notif.metadata?.pedido_id ||
        extractCodigoFromTitulo(notif.titulo) || 
        ''
      );
      
      let ordenData = null;
      if (codigoPedido) {
        ordenData = await fetchOrdenDetails(codigoPedido);
      }
      
      let estado = 'En proceso';
      if (notif.tipo === 'pedido_cancelado') {
        estado = 'Cancelado';
      } else if (notif.metadata?.estado_nuevo) {
        estado = getEstadoEnEspanol(notif.metadata.estado_nuevo);
      } else if (notif.metadata?.estado) {
        estado = getEstadoEnEspanol(notif.metadata.estado);
      } else if (ordenData?.estado) {
        estado = getEstadoEnEspanol(ordenData.estado);
      }
      
      const datosModal = {
        tipo: 'pedido',
        notificacion: notif,
        codigoPedido: codigoPedido,
        orden: ordenData,
        fecha: formatDate(notif.fecha_creacion),
        estado: estado,
        precio: ordenData?.precio_total || ordenData?.precio || notif.metadata?.precio || 0,
        metodo_pago: ordenData?.metodo_pago || notif.metadata?.metodo_pago || 'No especificado',
        direccion: ordenData?.direccion_texto || notif.metadata?.direccion_completa || 'No especificada',
        cliente_nombre: ordenData?.nombre_usuario || notif.metadata?.cliente_nombre || 'No especificado',
        cliente_telefono: ordenData?.telefono_usuario || notif.metadata?.telefono_cliente || 'No especificado'
      };
      
      setPedidoSeleccionado(datosModal);
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenBackupCodeModal = async (notif) => {
    try {
      setModalLoading(true);
      
      const backupCode = extractBackupCodeFromMessage(notif.mensaje);
      
      setBackupCodeNotif({
        id: notif.id,
        titulo: notif.titulo,
        mensaje: notif.mensaje,
        fecha: formatDate(notif.fecha_creacion),
        backupCode: backupCode,
        leida: notif.leida
      });
      
      setShowBackupCodeModal(true);
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleClosePedidoModal = () => {
    setShowPedidoModal(false);
    setPedidoSeleccionado(null);
  };

  const handleCloseBackupCodeModal = async () => {
    if (backupCodeNotif) {
      await handleDeleteNotification(backupCodeNotif.id);
    }
    setShowBackupCodeModal(false);
    setBackupCodeNotif(null);
  };

  const handleNotificationClick = async (notif) => {
    if (notif.tipo === 'backup_code') {
      await handleOpenBackupCodeModal(notif);
    } else if (notif.tipo === 'mensaje_admin') {
      // Mensaje simple - abre modal de mensaje
      await handleOpenPedidoModal(notif);
    } else {
      const tiposConDetalles = ['nuevo_pedido', 'estado_cambiado', 'estado_pedido', 'pedido_cancelado'];
      if (tiposConDetalles.includes(notif.tipo)) {
        await handleOpenPedidoModal(notif);
      } else {
        if (!notif.leida) {
          await handleMarkAsRead(notif.id);
        }
      }
    }
  };

  // ========== RENDERIZADO DE NOTIFICACIÓN ==========
  const renderNotificacion = (notif) => {
    const tiposConDetalles = ['nuevo_pedido', 'estado_cambiado', 'estado_pedido', 'pedido_cancelado'];
    const esMensajeSimple = notif.tipo === 'mensaje_admin';
    const tieneDetalles = tiposConDetalles.includes(notif.tipo);
    const isBackupCode = notif.tipo === 'backup_code';
    const backupCode = isBackupCode ? extractBackupCodeFromMessage(notif.mensaje) : null;
    
    // Los mensajes simples también deben ser clickeables
    const esClickeable = tieneDetalles || isBackupCode || esMensajeSimple;
    
    return (
      <div 
        key={notif.id} 
        className={`notificacion-item ${notif.leida ? 'leida' : 'no-leida'} ${isBackupCode ? 'backup-code-notif' : ''} ${esMensajeSimple ? 'mensaje-simple-notif' : ''}`}
        style={{ 
          borderLeftColor: getNotificationColor(notif.tipo),
          cursor: esClickeable ? 'pointer' : 'default'
        }}
        onClick={() => handleNotificationClick(notif)}
      >
        <div className="notificacion-header">
          <div className="notificacion-icon">
            <div className="notification-type-indicator" style={{ backgroundColor: getNotificationColor(notif.tipo) }}></div>
          </div>
          <div className="notificacion-info">
            <h4 className="notificacion-titulo">{notif.titulo}</h4>
            <div className="notificacion-meta">
              <span className="notificacion-tipo">{getNotificationTypeText(notif.tipo)}</span>
              <span className="notificacion-fecha">{formatDate(notif.fecha_creacion)}</span>
            </div>
          </div>
          <div className="notificacion-actions">
            {!notif.leida && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notif.id); }}
                className="action-btn mark-read-btn"
                title="Marcar como leída"
              >
                ✓
              </button>
            )}
            <button 
              onClick={(e) => { e.stopPropagation(); handleDeleteClick(notif.id, notif.titulo); }}
              className="action-btn delete-btn"
              title="Eliminar notificación"
            >
              <img src={deleteIcon} alt="Eliminar" />
            </button>
          </div>
        </div>
        
        <div className="notificacion-mensaje">
          {isBackupCode ? (
            <div className="backup-code-container">
              <p>{notif.mensaje.replace(/\*\*([A-Za-z0-9]{16})\*\*/, '')}</p>
              {backupCode && (
                <div className="backup-code-box">
                  <code className="backup-code-display">{backupCode}</code>
                  <button 
                    className="backup-copy-btn"
                    onClick={(e) => { e.stopPropagation(); copyToClipboard(backupCode); }}
                    title="Copiar código"
                  >
                    {copiedCode === backupCode ? '✓ Copiado' : 'Copiar'}
                  </button>
                </div>
              )}
              <div className="backup-code-warning">
                ⚠️ <strong>IMPORTANTE:</strong> Este código es PERMANENTE. Guárdalo en un lugar seguro.<br />
                Una vez que cierres esta ventana, la notificación se eliminará automáticamente.
              </div>
            </div>
          ) : (
            // Para mensajes simples, mostrar solo un preview del mensaje
            esMensajeSimple ? (
              <div className="mensaje-preview">
                {notif.mensaje && notif.mensaje.length > 120 
                  ? `${notif.mensaje.substring(0, 120)}...` 
                  : notif.mensaje}
                <span className="ver-mas-indicator">Ver más →</span>
              </div>
            ) : (
              notif.mensaje
            )
          )}
        </div>
        
        {notif.metadata && Object.keys(notif.metadata).length > 0 && !isBackupCode && !esMensajeSimple && (
          <div className="notificacion-metadata">
            {notif.metadata.codigo_pedido && (
              <div className="metadata-item">
                <span className="metadata-label">Pedido:</span>
                <span className="metadata-value">#{notif.metadata.codigo_pedido}</span>
              </div>
            )}
            {notif.metadata.cliente_nombre && (
              <div className="metadata-item">
                <span className="metadata-label">Cliente:</span>
                <span className="metadata-value">{notif.metadata.cliente_nombre}</span>
              </div>
            )}
            {notif.metadata.precio && (
              <div className="metadata-item">
                <span className="metadata-label">Precio:</span>
                <span className="metadata-value precio">${parseFloat(notif.metadata.precio).toFixed(2)}</span>
              </div>
            )}
            {notif.metadata.estado_nuevo && (
              <div className="metadata-item">
                <span className="metadata-label">Estado:</span>
                <span className={`metadata-value estado-${notif.metadata.estado_nuevo}`}>
                  {getEstadoEnEspanol(notif.metadata.estado_nuevo)}
                </span>
              </div>
            )}
            {notif.metadata.remitente && (
              <div className="metadata-item">
                <span className="metadata-label">De:</span>
                <span className="metadata-value">{notif.metadata.remitente}</span>
              </div>
            )}
          </div>
        )}
        
        {((tieneDetalles && !notif.leida) || (isBackupCode && !notif.leida) || (esMensajeSimple && !notif.leida)) && (
          <div className="click-indicator">
            <span className="click-hint">
              {esMensajeSimple ? 'Haz clic para leer el mensaje completo' : 'Haz clic para ver detalles'}
            </span>
          </div>
        )}
      </div>
    );
  };

  // ========== EFECTOS ==========

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = JSON.parse(localStorage.getItem('user'));
        
        if (userData) {
          setUserRole(userData.rol || userData.role);
        }
        
        await fetchNotificaciones();
      } catch (error) {
        setError('Error al cargar las notificaciones');
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    let filtered = notificaciones;

    if (searchTerm.trim()) {
      filtered = filtered.filter(notif => 
        notif.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notif.mensaje?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter) {
      filtered = filtered.filter(notif => notif.tipo === typeFilter);
    }

    if (readFilter) {
      filtered = filtered.filter(notif => notif.leida === (readFilter === 'leidas'));
    }
    
    setFilteredNotificaciones(filtered);
    setCurrentPage(1);
  }, [searchTerm, typeFilter, readFilter, notificaciones]);

  // ========== PAGINACIÓN ==========

  const indexOfLastNotif = currentPage * notificacionesPerPage;
  const indexOfFirstNotif = indexOfLastNotif - notificacionesPerPage;
  const currentNotificaciones = filteredNotificaciones.slice(indexOfFirstNotif, indexOfLastNotif);
  const totalPages = Math.ceil(filteredNotificaciones.length / notificacionesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // ========== RENDERIZADO PRINCIPAL ==========

  if (loading && notificaciones.length === 0) {
    return (
      <div className={`notificaciones-container ${darkMode ? 'dark-mode' : ''}`}>
        <div className="loading-spinner"></div>
        <p style={{textAlign: 'center', color: darkMode ? '#e2e8f0' : '#666'}}>
          Cargando notificaciones...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`notificaciones-container ${darkMode ? 'dark-mode' : ''}`}>
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchNotificaciones}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`notificaciones-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="notificaciones-content">
        
        {/* Header con título y botones */}
        <div className="section-header">
          <h3>Notificaciones</h3>
          <div className="header-buttons">
            <button 
              className="refresh-btn" onClick={handleRefresh} disabled={loading}
              title="Actualizar notificaciones"
            >
              <img src={refreshIcon} alt="Actualizar" className={`btn-icon-img-actualizar ${loading ? 'spinning' : ''}`} />
              {loading ? 'Actualizando...' : 'Actualizar'}
            </button>
            
            <button 
              className="mark-read-btn" onClick={handleMarkAllAsRead}
              disabled={notificaciones.every(n => n.leida) || loading}
              title="Marcar todas como leídas"
            >
              <img src={readIcon} alt="Marcar leídas" className="btn-icon-img" />
              Marcar Todas Leídas
            </button>
            
            {userRole === 1 && (
              <>
                <button 
                  className="delete-read-btn" onClick={handleDeleteAllRead}
                  disabled={notificaciones.every(n => !n.leida) || loading}
                  title="Eliminar notificaciones leídas"
                >
                  <img src={deleteIcon} alt="Eliminar leídas" className="btn-icon-img" />
                  Eliminar Leídas
                </button>
                
                <button 
                  className="send-message-btn" onClick={() => setShowSendModal(true)}
                  disabled={loading} title="Enviar mensaje a usuarios"
                >
                  <img src={sendIcon} alt="Enviar" className="btn-icon-img" />
                  Enviar Mensaje
                </button>
                
                <button 
                  className="analytics-btn" onClick={() => setShowAnalyticsModal(true)}
                  disabled={loading} title="Ver estadísticas"
                >
                  <img src={statsIcon} alt="Estadísticas" className="btn-icon-img" />
                  Estadísticas
                </button>
              </>
            )}
          </div>
        </div>

        {/* Buscador y Filtros */}
        <div className="search-section">
          <div className="filters-row">
            <div className="search-container main-search">
              <input
                type="text"
                placeholder="Buscar en notificaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                disabled={loading}
              />
              {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm('')}>
                  ✕
                </button>
              )}
            </div>

            <div className="filter-group">
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="filter-select" disabled={loading}>
                <option value="">Todos los tipos</option>
                <option value="nuevo_pedido">Nuevos Pedidos</option>
                <option value="estado_cambiado">Cambios de Estado</option>
                <option value="estado_pedido">Estado de Pedidos</option>
                <option value="mensaje_admin">Mensajes</option>
                <option value="pedido_cancelado">Pedidos Cancelados</option>
                <option value="ingrediente_no_disponible">Ingrediente No Disponible</option>
                <option value="ingrediente_inactivo">Ingrediente Inactivo</option>
                <option value="backup_code">Código de Respaldo</option>
              </select>
            </div>

            <div className="filter-group">
              <select value={readFilter} onChange={(e) => setReadFilter(e.target.value)} className="filter-select" disabled={loading}>
                <option value="">Todas</option>
                <option value="no-leidas">No leídas</option>
                <option value="leidas">Leídas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contador de notificaciones */}
        <div className="notifications-counter">
          <span className="counter-total">Total: <strong>{notificaciones.length}</strong></span>
          <span className="counter-unread">No leídas: <strong>{notificaciones.filter(n => !n.leida).length}</strong></span>
          <span className="counter-role">Rol: <strong>{userRole === 1 ? 'Administrador' : 'Cliente'}</strong></span>
        </div>

        {/* Lista de notificaciones */}
        <div className="notificaciones-list-container">
          {loading && notificaciones.length > 0 && (
            <div className="list-loading-overlay">
              <div className="loading-spinner small"></div>
              <span>Actualizando notificaciones...</span>
            </div>
          )}
          
          {currentNotificaciones.length > 0 ? (
            currentNotificaciones.map(notif => renderNotificacion(notif))
          ) : (
            <div className="no-notificaciones">
              {loading ? 'Cargando...' : 
               searchTerm || typeFilter || readFilter ? 
                 'No se encontraron notificaciones con esos criterios' : 
                 'No hay notificaciones disponibles'}
            </div>
          )}
        </div>

        {/* Paginación */}
        {filteredNotificaciones.length > notificacionesPerPage && (
          <div className="pagination-container">
            <div className="pagination-controls">
              <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1 || loading}
                className="pagination-btn prev-btn">Anterior</button>
              
              <div className="pagination-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(n => n === 1 || n === totalPages || (n >= currentPage - 1 && n <= currentPage + 1))
                  .map((n, idx, arr) => (
                    <React.Fragment key={n}>
                      {idx > 0 && n - arr[idx-1] > 1 && <span className="pagination-ellipsis">...</span>}
                      <button onClick={() => paginate(n)} className={`pagination-btn ${currentPage === n ? 'active' : ''}`}>
                        {n}
                      </button>
                    </React.Fragment>
                  ))}
              </div>
              
              <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages || loading}
                className="pagination-btn next-btn">Siguiente</button>
            </div>
            <div className="notificaciones-count-info">
              Mostrando {currentNotificaciones.length} de {filteredNotificaciones.length} notificaciones
            </div>
          </div>
        )}

        {/* Modal de detalles del pedido/mensaje - Componente separado que maneja ambos tipos */}
        <PedidoModal 
          show={showPedidoModal}
          onClose={handleClosePedidoModal}
          pedidoSeleccionado={pedidoSeleccionado}
          modalLoading={modalLoading}
          darkMode={darkMode}
        />

        {/* Modal de código de respaldo */}
        <BackupCodeModal
          show={showBackupCodeModal}
          onClose={handleCloseBackupCodeModal}
          notificacion={backupCodeNotif}
          darkMode={darkMode}
        />

        {/* Modal para enviar mensaje */}
        <SendMessageModal
          show={showSendModal}
          onClose={() => setShowSendModal(false)}
          darkMode={darkMode}
          onMessageSent={fetchNotificaciones}
        />

        {/* Modal de estadísticas */}
        <AnalyticsModal
          show={showAnalyticsModal}
          onClose={() => setShowAnalyticsModal(false)}
          darkMode={darkMode}
        />

        {/* Modal de confirmación de eliminación */}
        {showDeleteConfirm && (
          <div className="modal-overlay-delete">
            <div className="modal-content confirm-modal">
              <div className="confirm-header"><h3>¿Eliminar Notificación?</h3></div>
              <div className="confirm-body">
                <p className="confirm-message">
                  ¿Estás seguro de eliminar: <strong>"{notificationToDelete?.titulo}"</strong>?
                </p>
                <p className="confirm-warning">Esta acción no se puede deshacer.</p>
              </div>
              <div className="confirm-actions">
                <button className="confirm-btn cancel-btn" onClick={handleDeleteCancel}>Cancelar</button>
                <button className="confirm-btn delete-confirm-btn" onClick={handleDeleteConfirm}>Sí, Eliminar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notificaciones;