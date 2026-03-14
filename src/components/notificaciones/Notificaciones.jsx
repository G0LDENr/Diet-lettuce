import React, { useEffect, useState } from 'react';
import { useConfig } from '../../context/config';
import PedidoModal from './Modal-Notificaciones';
import '../../css/Notificaciones/notificaciones.css';

import deleteIcon from '../../img/delete.png';
import refreshIcon from '../../img/actualizar.png';
import sendIcon from '../../img/enviar.png';
import statsIcon from '../../img/spark.png';
import readIcon from '../../img/leido.png';

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
  const [usuarios, setUsuarios] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [messageForm, setMessageForm] = useState({
    destinatario_tipo: 'todos',
    destinatario_id: '',
    titulo: 'Mensaje del Restaurante',
    mensaje: ''
  });
  
  // Estados para modal de detalles del pedido
  const [showPedidoModal, setShowPedidoModal] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
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
      'ingrediente_no_disponible': 'Ingrediente No Disponible'
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
      'ingrediente_no_disponible': '#fd7e14'
    };
    return colores[tipo] || '#666';
  };

  const markAsReadFrontend = (notifId) => {
    const updated = notificaciones.map(n => 
      n.id === notifId ? { ...n, leida: true } : n
    );
    setNotificaciones(updated);
    setFilteredNotificaciones(updated);
  };

  const showMessage = (title, message, type = 'success') => {
    console.log(`${type}: ${title} - ${message}`);
    // Si tienes un sistema de toasts, puedes usarlo aquí
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
          const codigo = notif.metadata?.codigo_pedido || 
                        notif.metadata?.codigo || 
                        extractCodigoFromTitulo(notif.titulo);
          if (codigo) fetchOrdenDetails(codigo);
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

  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/notificaciones/usuarios`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      }
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/notificaciones/analiticas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('Error al obtener analíticas:', error);
    }
  };

  // ========== MANEJADORES DE EVENTOS ==========

  const handleRefresh = async () => {
    await fetchNotificaciones();
  };

  // FUNCIÓN CORREGIDA: Marcar notificación individual como leída
  const handleMarkAsRead = async (notifId) => {
    try {
      console.log(`\n=== MARCANDO NOTIFICACIÓN ${notifId} COMO LEÍDA ===`);
      
      const token = localStorage.getItem('token');
      
      // 1. Encontrar la notificación en el array local
      const notificacion = notificaciones.find(n => n.id === notifId);
      if (!notificacion) {
        console.log(`❌ Notificación ${notifId} no encontrada en el array local`);
        return;
      }
      
      // 2. PRIMERO: Llamar al backend
      console.log(`🔄 Enviando solicitud al backend...`);
      
      const response = await fetch(`${API_BASE_URL}/notificaciones/${notifId}/leer`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log(`✅ Backend actualizado correctamente`);
        
        // 3. SOLO si el backend confirma, actualizar el frontend
        const updatedNotificaciones = notificaciones.map(notif => 
          notif.id === notifId ? { ...notif, leida: true } : notif
        );
        setNotificaciones(updatedNotificaciones);
        setFilteredNotificaciones(updatedNotificaciones);
        
        console.log(`✅ Notificación ${notifId} marcada como leída en frontend y backend`);
      } else {
        console.warn(`⚠️ Error ${response.status} del backend`);
        showMessage(
          'Error',
          'No se pudo marcar la notificación como leída',
          'error'
        );
      }
      
      console.log(`=== FIN MARCADO DE NOTIFICACIÓN ${notifId} ===\n`);
      
    } catch (error) {
      console.error('❌ Error inesperado:', error);
      showMessage(
        'Error de conexión',
        'No se pudo conectar con el servidor',
        'error'
      );
    }
  };

  // FUNCIÓN CORREGIDA: Marcar TODAS como leídas
  const handleMarkAllAsRead = async () => {
    try {
      console.log('🔄 MARCANDO TODAS LAS NOTIFICACIONES COMO LEÍDAS...');
      
      const token = localStorage.getItem('token');
      const userType = getUserType();
      
      console.log(`👤 User Type para marcar todas: ${userType}`);
      
      // 1. PRIMERO: Llamar al backend
      const response = await fetch(`${API_BASE_URL}/notificaciones/leer-todas?user_type=${userType}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('✅ Backend actualizado correctamente');
        
        // 2. SOLO si el backend confirma, actualizar frontend
        const updatedNotificaciones = notificaciones.map(notif => ({
          ...notif,
          leida: true
        }));
        setNotificaciones(updatedNotificaciones);
        setFilteredNotificaciones(updatedNotificaciones);
        
        console.log('✅ Todas las notificaciones marcadas como leídas');
        showMessage(
          'Éxito',
          'Todas las notificaciones han sido marcadas como leídas',
          'success'
        );
      } else {
        console.warn(`⚠️ Error ${response.status} del backend`);
        showMessage(
          'Error',
          'No se pudieron marcar todas las notificaciones',
          'error'
        );
      }
      
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
      showMessage(
        'Error de conexión',
        'No se pudo conectar con el servidor',
        'error'
      );
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
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/notificaciones/${notificationToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const updated = notificaciones.filter(n => n.id !== notificationToDelete.id);
        setNotificaciones(updated);
        setFilteredNotificaciones(updated);
        setShowDeleteConfirm(false);
        setNotificationToDelete(null);
        
        showMessage(
          'Notificación eliminada',
          'La notificación ha sido eliminada correctamente',
          'success'
        );
      } else {
        showMessage(
          'Error',
          'No se pudo eliminar la notificación',
          'error'
        );
      }
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      showMessage(
        'Error de conexión',
        'No se pudo conectar con el servidor',
        'error'
      );
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
        
        showMessage(
          'Notificaciones eliminadas',
          'Todas las notificaciones leídas han sido eliminadas',
          'success'
        );
      } else {
        showMessage(
          'Error',
          'No se pudieron eliminar las notificaciones',
          'error'
        );
      }
    } catch (error) {
      console.error('Error al eliminar notificaciones leídas:', error);
      showMessage(
        'Error de conexión',
        'No se pudo conectar con el servidor',
        'error'
      );
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageForm.mensaje.trim()) {
      showMessage('Mensaje requerido', 'Por favor escribe un mensaje', 'warning');
      return;
    }

    try {
      setSendingMessage(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/notificaciones/mensaje`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageForm)
      });

      if (response.ok) {
        const data = await response.json();
        showMessage('Mensaje enviado', data.msg, 'success');
        
        setMessageForm({
          destinatario_tipo: 'todos',
          destinatario_id: '',
          titulo: 'Mensaje del Restaurante',
          mensaje: ''
        });
        setShowSendModal(false);
        fetchNotificaciones();
      } else {
        const errorData = await response.json();
        showMessage('Error', errorData.msg || 'Error al enviar mensaje', 'error');
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      showMessage('Error de conexión', 'No se pudo conectar con el servidor', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  // FUNCIÓN CORREGIDA: Abrir modal con detalles del pedido
  const handleOpenPedidoModal = async (notif) => {
    try {
      console.log(`🚀 Abriendo modal para notificación ${notif.id}`);
      setModalLoading(true);
      
      // 1. Marcar como leída si no lo está - AHORA ESPERA CONFIRMACIÓN
      if (!notif.leida) {
        await handleMarkAsRead(notif.id);
      }
      
      // 2. Abrir el modal
      setShowPedidoModal(true);
      
      // 3. Preparar datos iniciales
      const codigoPedido = cleanCodigoPedido(
        notif.metadata?.codigo_pedido || 
        notif.metadata?.codigo || 
        notif.metadata?.pedido_id ||
        extractCodigoFromTitulo(notif.titulo) || 
        ''
      );
      
      // Obtener datos de la orden si existe
      let ordenData = null;
      if (codigoPedido) {
        ordenData = await fetchOrdenDetails(codigoPedido);
      }
      
      // Determinar el estado del pedido
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
      console.error('Error al abrir modal:', error);
      setPedidoSeleccionado({
        notificacion: notif,
        codigoPedido: '',
        orden: null,
        fecha: formatDate(notif.fecha_creacion),
        estado: 'Error',
        precio: 0,
        metodo_pago: 'No especificado',
        direccion: 'No especificada',
        cliente_nombre: 'No especificado',
        cliente_telefono: 'No especificado'
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleClosePedidoModal = () => {
    setShowPedidoModal(false);
    setPedidoSeleccionado(null);
  };

  // FUNCIÓN CORREGIDA: Manejar clic en notificación
  const handleNotificationClick = async (notif) => {
    console.log(`🖱️ Click en notificación: ${notif.id} - ${notif.tipo}`);
    
    // Solo abrir modal para notificaciones de pedidos
    const tiposConDetalles = ['nuevo_pedido', 'estado_cambiado', 'estado_pedido', 'pedido_cancelado'];
    
    if (tiposConDetalles.includes(notif.tipo)) {
      console.log(`✅ Abriendo modal para pedido`);
      await handleOpenPedidoModal(notif);
    } else {
      console.log(`ℹ️ Solo marcando como leída`);
      if (!notif.leida) {
        await handleMarkAsRead(notif.id);
      }
    }
  };

  // ========== EFECTOS ==========

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = JSON.parse(localStorage.getItem('user'));
        
        if (userData) {
          setUserRole(userData.rol || userData.role);
        } else if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUserRole(payload.rol || payload.role);
          } catch {}
        }
        
        await fetchNotificaciones();
      } catch (error) {
        setError('Error al cargar las notificaciones');
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (showSendModal && userRole === 1) {
      fetchUsuarios();
    }
  }, [showSendModal, userRole]);

  useEffect(() => {
    if (showAnalyticsModal && userRole === 1) {
      fetchAnalytics();
    }
  }, [showAnalyticsModal, userRole]);

  useEffect(() => {
    let filtered = notificaciones;

    if (searchTerm.trim()) {
      filtered = filtered.filter(notif => 
        notif.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notif.mensaje?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notif.metadata?.codigo_pedido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notif.metadata?.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
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

  // ========== RENDERIZADO ==========

  const renderNotificacion = (notif) => {
    const tiposConDetalles = ['nuevo_pedido', 'estado_cambiado', 'estado_pedido', 'pedido_cancelado'];
    const tieneDetalles = tiposConDetalles.includes(notif.tipo);
    
    return (
      <div 
        key={notif.id} 
        className={`notificacion-item ${notif.leida ? 'leida' : 'no-leida'}`}
        style={{ 
          borderLeftColor: getNotificationColor(notif.tipo),
          cursor: tieneDetalles ? 'pointer' : 'default'
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
              {notif.hace_cuanto && <span className="notificacion-timeago">({notif.hace_cuanto})</span>}
            </div>
          </div>
          <div className="notificacion-actions">
            {!notif.leida && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notif.id); }}
                className="action-btn mark-read-btn"
                title="Marcar como leída"
                style={{
                  width: '32px', height: '32px', backgroundColor: '#28a745',
                  color: 'white', border: 'none', borderRadius: '4px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'
                }}
              >✓</button>
            )}
            <button 
              onClick={(e) => { e.stopPropagation(); handleDeleteClick(notif.id, notif.titulo); }}
              className="action-btn delete-btn"
              title="Eliminar notificación"
              style={{
                width: '32px', height: '32px', backgroundColor: '#dc3545',
                border: 'none', borderRadius: '4px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <img src={deleteIcon} alt="Eliminar" style={{ width: '16px', height: '16px', filter: 'invert(1)' }} />
            </button>
          </div>
        </div>
        
        <div className="notificacion-mensaje">{notif.mensaje}</div>
        
        {notif.metadata && Object.keys(notif.metadata).length > 0 && (
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
        
        {tieneDetalles && !notif.leida && (
          <div className="click-indicator">
            <span className="click-hint">Haz clic para ver detalles</span>
          </div>
        )}
      </div>
    );
  };

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
              {!loading && notificaciones.length === 0 && (
                <p style={{ fontSize: '14px', color: darkMode ? '#94a3b8' : '#64748b', marginTop: '10px' }}>
                  Las notificaciones aparecerán aquí cuando recibas nuevos pedidos, 
                  haya cambios en tus pedidos o recibas mensajes.
                </p>
              )}
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

        {filteredNotificaciones.length <= notificacionesPerPage && filteredNotificaciones.length > 0 && (
          <div className="notificaciones-count-info">
            Mostrando {currentNotificaciones.length} de {filteredNotificaciones.length} notificaciones
          </div>
        )}

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

        {/* Modal de detalles del pedido */}
        <PedidoModal 
          show={showPedidoModal}
          onClose={handleClosePedidoModal}
          pedidoSeleccionado={pedidoSeleccionado}
          modalLoading={modalLoading}
          darkMode={darkMode}
        />

        {/* Modal para enviar mensaje */}
        {showSendModal && (
          <div className="modal-overlay">
            <div className="modal-content large-modal">
              <div className="modal-header">
                <h3>Enviar Mensaje a Usuarios</h3>
                <button className="close-modal" onClick={() => setShowSendModal(false)} disabled={sendingMessage}>✕</button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSendMessage}>
                  <div className="form-group">
                    <label>Tipo de Destinatario</label>
                    <select
                      value={messageForm.destinatario_tipo}
                      onChange={(e) => setMessageForm({
                        ...messageForm,
                        destinatario_tipo: e.target.value,
                        destinatario_id: e.target.value === 'todos' ? '' : messageForm.destinatario_id
                      })}
                      className="form-select" disabled={sendingMessage}
                    >
                      <option value="todos">Todos los Usuarios</option>
                      <option value="cliente">Cliente Específico</option>
                      <option value="admin">Administrador Específico</option>
                      <option value="todos_admins">Todos los Administradores</option>
                    </select>
                  </div>

                  {(messageForm.destinatario_tipo === 'cliente' || messageForm.destinatario_tipo === 'admin') && (
                    <div className="form-group">
                      <label>{messageForm.destinatario_tipo === 'cliente' ? 'Cliente' : 'Administrador'}</label>
                      <select
                        value={messageForm.destinatario_id}
                        onChange={(e) => setMessageForm({...messageForm, destinatario_id: e.target.value})}
                        className="form-select" required disabled={sendingMessage}
                      >
                        <option value="">Seleccionar...</option>
                        {usuarios
                          .filter(u => messageForm.destinatario_tipo === 'cliente' ? u.role === 2 : u.role === 1)
                          .map(u => (
                            <option key={u.id} value={u.id}>{u.nombre} ({u.email || u.telefono})</option>
                          ))}
                      </select>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Título</label>
                    <input type="text" value={messageForm.titulo} onChange={(e) => setMessageForm({...messageForm, titulo: e.target.value})}
                      className="form-input" required disabled={sendingMessage} />
                  </div>

                  <div className="form-group">
                    <label>Mensaje</label>
                    <textarea value={messageForm.mensaje} onChange={(e) => setMessageForm({...messageForm, mensaje: e.target.value})}
                      className="form-textarea" rows="5" required disabled={sendingMessage}
                      placeholder="Escribe tu mensaje aquí..." />
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowSendModal(false)} disabled={sendingMessage}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={sendingMessage}>
                      {sendingMessage ? 'Enviando...' : 'Enviar Mensaje'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal de estadísticas */}
        {showAnalyticsModal && (
          <div className="modal-overlay">
            <div className="modal-content large-modal">
              <div className="modal-header">
                <h3>Estadísticas de Notificaciones</h3>
                <button className="close-modal" onClick={() => setShowAnalyticsModal(false)}>✕</button>
              </div>
              <div className="modal-body">
                {analyticsData ? (
                  <div className="analytics-content">
                    <div className="analytics-grid">
                      <div className="analytics-card">
                        <h4>Resumen General</h4>
                        <div className="analytics-stats">
                          <div className="stat-item">
                            <span className="stat-value">{analyticsData.total_notificaciones}</span>
                            <span className="stat-label">Total</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-value">{analyticsData.no_leidas}</span>
                            <span className="stat-label">No Leídas</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-value">{analyticsData.tasa_lectura?.toFixed(1) || '0'}%</span>
                            <span className="stat-label">Tasa Lectura</span>
                          </div>
                        </div>
                      </div>

                      {analyticsData.distribucion_tipos && (
                        <div className="analytics-card">
                          <h4>Por Tipo</h4>
                          <div className="analytics-list">
                            {Object.entries(analyticsData.distribucion_tipos).map(([tipo, count]) => (
                              <div key={tipo} className="analytics-item">
                                <span>{getNotificationTypeText(tipo)}</span>
                                <span>{count} notif.</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {analyticsData.estadisticas_diarias && (
                        <div className="analytics-card">
                          <h4>Actividad Diaria</h4>
                          <div className="analytics-list">
                            {analyticsData.estadisticas_diarias.slice(0, 7).map((est, idx) => (
                              <div key={idx} className="analytics-item">
                                <span>{est.fecha}</span>
                                <span>{est.count} notif.</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="loading-analytics">
                    <div className="loading-spinner small"></div>
                    <p>Cargando estadísticas...</p>
                  </div>
                )}

                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={() => setShowAnalyticsModal(false)}>Cerrar</button>
                  <button className="btn btn-primary" onClick={fetchAnalytics}>Actualizar</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notificaciones;