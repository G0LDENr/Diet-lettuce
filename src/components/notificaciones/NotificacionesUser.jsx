import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../../context/config';
import PedidoModal from './Modal-Notificaciones';
import '../../css/Notificaciones/notificaciones-user.css';

import deleteIcon from '../../img/delete.png';
import refreshIcon from '../../img/actualizar.png';
import readIcon from '../../img/leido.png';
import logoutIcon from '../../img/salida.png';
import backIcon from '../../img/atras.png';

const NotificacionesUser = () => {
  const navigate = useNavigate();
  const { darkMode, t } = useConfig();
  const [notificaciones, setNotificaciones] = useState([]);
  const [filteredNotificaciones, setFilteredNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [readFilter, setReadFilter] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [showPedidoModal, setShowPedidoModal] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  
  const notificacionesPerPage = 10;
  const API_BASE_URL = 'http://127.0.0.1:5000';

  // Verificar autenticación
  const isAuthenticated = localStorage.getItem('token') !== null;

  // Efecto para cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = JSON.parse(localStorage.getItem('user'));
        
        if (token && userData) {
          await fetchNotificaciones();
        } else {
          setLoading(false);
          setError('Debes iniciar sesión para ver tus notificaciones');
        }
      } catch (error) {
        setError('Error al cargar las notificaciones');
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Función para obtener detalles de una orden específica
  const fetchOrdenDetails = async (codigoPedido) => {
    if (!codigoPedido) return null;
    
    const codigoLimpio = codigoPedido.replace(/^#/, '');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/ordenes/codigo/${codigoLimpio}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const ordenData = await response.json();
        return ordenData;
      }
    } catch (error) {
      console.error('Error al obtener detalles de la orden:', error);
    }
    return null;
  };

  // Función para marcar notificación como leída
  const handleMarkAsRead = async (notifId) => {
    try {
      console.log(`\n=== MARCANDO NOTIFICACIÓN ${notifId} COMO LEÍDA ===`);
      
      const token = localStorage.getItem('token');
      if (!token) return;
      
      // PRIMERO: Actualizar frontend
      const updatedNotificaciones = notificaciones.map(notif => 
        notif.id === notifId ? { ...notif, leida: true } : notif
      );
      setNotificaciones(updatedNotificaciones);
      setFilteredNotificaciones(updatedNotificaciones);
      
      // SEGUNDO: Intentar sincronizar con backend
      try {
        const response = await fetch(`${API_BASE_URL}/notificaciones/${notifId}/leer`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          console.log(`✅ Sincronizado con backend`);
        }
      } catch (backendError) {
        console.warn('⚠️ Error de conexión con backend');
      }
      
    } catch (error) {
      console.error('❌ Error inesperado:', error);
    }
  };

  // Función para marcar/desmarcar notificación como leída
  const handleToggleReadStatus = async (notif, e) => {
    e.stopPropagation();
    const nuevaLeida = !notif.leida;
    
    if (nuevaLeida) {
      await handleMarkAsRead(notif.id);
    } else {
      const updatedNotificaciones = notificaciones.map(n => 
        n.id === notif.id ? { ...n, leida: false } : n
      );
      setNotificaciones(updatedNotificaciones);
      setFilteredNotificaciones(updatedNotificaciones);
    }
  };

  // Función para marcar TODAS como leídas
  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      markAllAsReadFrontend();
      
      try {
        await fetch(`${API_BASE_URL}/notificaciones/leer-todas?user_type=cliente`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (error) {
        console.warn('Error de conexión');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const markAllAsReadFrontend = () => {
    const updatedNotificaciones = notificaciones.map(notif => ({ ...notif, leida: true }));
    setNotificaciones(updatedNotificaciones);
    setFilteredNotificaciones(updatedNotificaciones);
  };

  // ===== FUNCIÓN PARA ABRIR MODAL CON DETALLES (CORREGIDA PARA DIFERENCIAR MENSAJES) =====
  const handleOpenPedidoModal = async (notif) => {
    try {
      setModalLoading(true);
      
      // Marcar como leída si no lo está
      if (!notif.leida) {
        await handleMarkAsRead(notif.id);
      }
      
      // Verificar si es una notificación de pedido o un mensaje simple
      const esMensajeSimple = notif.tipo === 'mensaje_admin' || 
                              (!notif.metadata?.codigo_pedido && 
                               !extractCodigoFromTitulo(notif.titulo));
      
      if (esMensajeSimple) {
        // Es un mensaje simple, mostrar solo el mensaje
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
      
      // Es una notificación de pedido, obtener detalles del pedido
      const codigoPedido = notif.metadata?.codigo_pedido || 
                          extractCodigoFromTitulo(notif.titulo) || 
                          '';
      const codigoLimpio = codigoPedido.replace(/^#/, '');
      
      // Obtener detalles de la orden
      let ordenData = await fetchOrdenDetails(codigoLimpio);
      
      // Construir el objeto para el modal según lo que espera PedidoModal
      const datosModal = {
        tipo: 'pedido',
        codigoPedido: codigoLimpio,
        fecha: formatDate(notif.fecha_creacion),
        estado: getEstadoPedido(notif),
        precio: notif.metadata?.precio_total || ordenData?.precio_total || 0,
        metodo_pago: ordenData?.metodo_pago || notif.metadata?.metodo_pago || 'efectivo',
        cliente_nombre: ordenData?.nombre_usuario || notif.metadata?.cliente_nombre || '',
        cliente_telefono: ordenData?.telefono_usuario || notif.metadata?.telefono_cliente || '',
        direccion: ordenData?.direccion_texto || notif.metadata?.direccion || '',
        orden: ordenData,
        notificacion: notif
      };
      
      setPedidoSeleccionado(datosModal);
      setShowPedidoModal(true);
      
    } catch (error) {
      console.error('Error al abrir modal:', error);
    } finally {
      setModalLoading(false);
    }
  };

  // Función para cerrar el modal
  const handleClosePedidoModal = () => {
    setShowPedidoModal(false);
    setPedidoSeleccionado(null);
  };

  // Función para obtener notificaciones
  const fetchNotificaciones = async () => {
    try {
      console.log('Iniciando fetchNotificaciones para cliente...');
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No hay sesión activa');
        setLoading(false);
        return;
      }

      const url = `${API_BASE_URL}/notificaciones/usuario`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const notifs = data.notificaciones || [];
        setNotificaciones(notifs);
        setFilteredNotificaciones(notifs);
      } else if (response.status === 401) {
        setError('Tu sesión ha expirado');
      } else {
        setError(`Error ${response.status} al obtener notificaciones`);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      setError(`Error de conexión: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para filtrar notificaciones
  useEffect(() => {
    let filtered = notificaciones;

    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(notif => 
        notif.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notif.mensaje?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notif.metadata?.codigo_pedido?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== '') {
      filtered = filtered.filter(notif => notif.tipo === typeFilter);
    }

    if (readFilter !== '') {
      const isRead = readFilter === 'leidas';
      filtered = filtered.filter(notif => notif.leida === isRead);
    }
    
    setFilteredNotificaciones(filtered);
    setCurrentPage(1);
  }, [searchTerm, typeFilter, readFilter, notificaciones]);

  // Función para refrescar
  const handleRefresh = async () => {
    await fetchNotificaciones();
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  // Función para ir atrás
  const handleGoBack = () => {
    navigate(-1);
  };

  // Función para redirigir a login
  const handleLoginRedirect = () => {
    navigate('/login');
  };

  // Cálculos para paginación
  const indexOfLastNotif = currentPage * notificacionesPerPage;
  const indexOfFirstNotif = indexOfLastNotif - notificacionesPerPage;
  const currentNotificaciones = filteredNotificaciones.slice(indexOfFirstNotif, indexOfLastNotif);
  const totalPages = Math.ceil(filteredNotificaciones.length / notificacionesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Función para eliminar notificación
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
        const updatedNotificaciones = notificaciones.filter(notif => notif.id !== notificationToDelete.id);
        setNotificaciones(updatedNotificaciones);
        setFilteredNotificaciones(updatedNotificaciones);
      }
    } catch (error) {
      alert('Error al eliminar notificación');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setNotificationToDelete(null);
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
      await fetch(`${API_BASE_URL}/notificaciones/leidas?user_type=cliente`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const updatedNotificaciones = notificaciones.filter(notif => !notif.leida);
      setNotificaciones(updatedNotificaciones);
      setFilteredNotificaciones(updatedNotificaciones);
    } catch (error) {
      const updatedNotificaciones = notificaciones.filter(notif => !notif.leida);
      setNotificaciones(updatedNotificaciones);
      setFilteredNotificaciones(updatedNotificaciones);
    }
  };

  // Funciones auxiliares
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      return date.toLocaleString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
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

  const getEstadoPedido = (notif) => {
    if (notif.metadata?.estado) return notif.metadata.estado;
    const texto = (notif.titulo || "") + " " + (notif.mensaje || "");
    const estados = ['Recibido', 'En preparación', 'Preparando', 'En camino', 'Entregado', 'Cancelado'];
    for (const estado of estados) {
      if (texto.toLowerCase().includes(estado.toLowerCase())) return estado;
    }
    return "En proceso";
  };

  // Renderizar notificación
  const renderNotificacion = (notif) => {
    const codigoPedido = extractCodigoFromTitulo(notif.titulo);
    const estadoPedido = getEstadoPedido(notif);
    
    return (
      <div 
        className={`notificacionesUser-item ${notif.leida ? 'leida' : 'no-leida'}`}
        onClick={() => handleOpenPedidoModal(notif)}
        style={{ cursor: 'pointer' }}
      >
        <div className="notificacionesUser-header">
          <div className="notificacionesUser-info">
            <h4 className="notificacionesUser-titulo">{notif.titulo}</h4>
            <div className="notificacionesUser-meta">
              <span className="notificacionesUser-fecha">{formatDate(notif.fecha_creacion)}</span>
            </div>
          </div>
          <div className="notificacionesUser-actions">
            {!notif.leida && <span className="notificacionesUser-badge-no-leida">Nuevo</span>}
            
            <button 
              onClick={(e) => handleToggleReadStatus(notif, e)}
              className="notificacionesUser-action-btn"
              title={notif.leida ? "Marcar como no leída" : "Marcar como leída"}
            >
              <img src={readIcon} alt="Marcar leída" className="notificacionesUser-action-icon" />
            </button>
            
            <button 
              onClick={(e) => { e.stopPropagation(); handleDeleteClick(notif.id, notif.titulo); }}
              className="notificacionesUser-action-btn"
              title="Eliminar"
            >
              <img src={deleteIcon} alt="Eliminar" className="notificacionesUser-action-icon" />
            </button>
          </div>
        </div>
        
        <div className="notificacionesUser-mensaje">{notif.mensaje}</div>
        
        <div className="notificacionesUser-metadata">
          {codigoPedido && (
            <div className="notificacionesUser-metadata-item">
              <span className="notificacionesUser-metadata-label">Código:</span>
              <span className="notificacionesUser-metadata-value">#{codigoPedido}</span>
            </div>
          )}
          <div className="notificacionesUser-metadata-item">
            <span className="notificacionesUser-metadata-label">Estado:</span>
            <span className="notificacionesUser-metadata-value estado-pedido">{estadoPedido}</span>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar estado de carga
  if (loading && notificaciones.length === 0) {
    return (
      <div className={`notificacionesUser-container ${darkMode ? 'dark-mode' : ''}`}>
        <div className="notificacionesUser-loading-spinner"></div>
        <p style={{textAlign: 'center'}}>Cargando notificaciones...</p>
      </div>
    );
  }

  return (
    <div className={`notificacionesUser-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="notificacionesUser-content">
        
        {/* Header */}
        <div className="notificacionesUser-section-header">
          <div className="notificacionesUser-header-left">
            <button onClick={handleGoBack} className="notificacionesUser-back-button">
              <img src={backIcon} alt="Regresar" className="notificacionesUser-back-icon" />
            </button>
            <h3>Mis Notificaciones</h3>
          </div>
          <div className="notificacionesUser-header-buttons">
            <button className="notificacionesUser-refresh-btn" onClick={handleRefresh} disabled={loading}>
              <img src={refreshIcon} alt="Actualizar" className={`notificacionesUser-btn-icon-img ${loading ? 'spinning' : ''}`} />
              {loading ? 'Actualizando...' : 'Actualizar'}
            </button>
            
            <button className="notificacionesUser-mark-read-btn" onClick={handleMarkAllAsRead} 
              disabled={notificaciones.every(n => n.leida) || loading}>
              <img src={readIcon} alt="Marcar leídas" className="notificacionesUser-btn-icon-img" />
              Marcar Todas Leídas
            </button>
            
            <button className="notificacionesUser-delete-read-btn" onClick={handleDeleteAllRead} 
              disabled={notificaciones.every(n => !n.leida) || loading}>
              <img src={deleteIcon} alt="Eliminar leídas" className="notificacionesUser-btn-icon-img" />
              Eliminar Leídas
            </button>
            
            {isAuthenticated ? (
              <button onClick={handleLogout} className="notificacionesUser-logout-btn">
                <img src={logoutIcon} alt="Salir" className="notificacionesUser-btn-icon-img" />
                Cerrar Sesión
              </button>
            ) : (
              <button onClick={handleLoginRedirect} className="notificacionesUser-login-btn">
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="notificacionesUser-search-section">
          <div className="notificacionesUser-filters-row">
            <div className="notificacionesUser-search-container">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="notificacionesUser-search-input"
              />
              {searchTerm && (
                <button className="notificacionesUser-clear-search" onClick={() => setSearchTerm('')}>✕</button>
              )}
            </div>

            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="notificacionesUser-filter-select">
              <option value="">Todos los tipos</option>
              <option value="nuevo_pedido">Nuevos Pedidos</option>
              <option value="cambio_estado">Cambios de Estado</option>
              <option value="mensaje_admin">Mensajes</option>
            </select>

            <select value={readFilter} onChange={(e) => setReadFilter(e.target.value)} className="notificacionesUser-filter-select">
              <option value="">Todas</option>
              <option value="no-leidas">No leídas</option>
              <option value="leidas">Leídas</option>
            </select>
          </div>
        </div>

        {/* Contador */}
        <div className="notificacionesUser-notifications-counter">
          <span className="notificacionesUser-counter-total">Total: <strong>{notificaciones.length}</strong></span>
          <span className="notificacionesUser-counter-unread">No leídas: <strong>{notificaciones.filter(n => !n.leida).length}</strong></span>
        </div>

        {/* Lista de notificaciones */}
        <div className="notificacionesUser-list-container">
          {currentNotificaciones.length > 0 ? (
            currentNotificaciones.map(notif => (
              <React.Fragment key={notif.id}>
                {renderNotificacion(notif)}
              </React.Fragment>
            ))
          ) : (
            <div className="notificacionesUser-no-notificaciones">
              {loading ? 'Cargando...' : 
               searchTerm || typeFilter || readFilter ? 'No se encontraron notificaciones' : 
               'No hay notificaciones disponibles'}
            </div>
          )}
        </div>

        {/* Paginación */}
        {filteredNotificaciones.length > notificacionesPerPage && (
          <div className="notificacionesUser-pagination-container">
            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
              Anterior
            </button>
            <span>Página {currentPage} de {totalPages}</span>
            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
              Siguiente
            </button>
          </div>
        )}

        {/* Modal de confirmación de eliminación */}
        {showDeleteConfirm && (
          <div className="notificacionesUser-modal-overlay-delete">
            <div className="notificacionesUser-modal-content">
              <h3>¿Eliminar Notificación?</h3>
              <p>¿Estás seguro de eliminar: <strong>"{notificationToDelete?.titulo}"</strong>?</p>
              <div className="notificacionesUser-confirm-actions">
                <button onClick={handleDeleteCancel}>Cancelar</button>
                <button onClick={handleDeleteConfirm}>Eliminar</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de detalles del pedido - Usando el componente PedidoModal */}
        <PedidoModal
          show={showPedidoModal}
          onClose={handleClosePedidoModal}
          pedidoSeleccionado={pedidoSeleccionado}
          modalLoading={modalLoading}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
};

export default NotificacionesUser;