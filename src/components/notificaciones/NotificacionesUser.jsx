import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../../context/config';
import PedidoModal from './Modal-Notificaciones';
import '../../css/Notificaciones/notificaciones-user.css';

// Importa los iconos de react-icons
import { FiSearch } from 'react-icons/fi';
import { FiSliders } from 'react-icons/fi';
import { FiCalendar } from 'react-icons/fi';
import { IoNotificationsOutline } from "react-icons/io5";
import { TfiEmail } from "react-icons/tfi";
import { FiTrash2 } from 'react-icons/fi';

// Importa las imágenes de iconos
import packageIcon from '../../img/ShopTrue.png';
import refreshIcon from '../../img/ShopTrue.png';
import messageIcon from '../../img/ShopTrue.png';
import defaultIcon from '../../img/ShopTrue.png';
import refreshBtnIcon from '../../img/actualizar.png';
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
  
  const notificacionesPerPage = 5;
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
      
      const updatedNotificaciones = notificaciones.map(notif => 
        notif.id === notifId ? { ...notif, leida: true } : notif
      );
      setNotificaciones(updatedNotificaciones);
      setFilteredNotificaciones(updatedNotificaciones);
      
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

  // Función para abrir modal con detalles
  const handleOpenPedidoModal = async (notif) => {
    try {
      setModalLoading(true);
      
      if (!notif.leida) {
        await handleMarkAsRead(notif.id);
      }
      
      const esMensajeSimple = notif.tipo === 'mensaje_admin' || 
                              (!notif.metadata?.codigo_pedido && 
                               !extractCodigoFromTitulo(notif.titulo));
      
      if (esMensajeSimple) {
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
      
      const codigoPedido = notif.metadata?.codigo_pedido || 
                          extractCodigoFromTitulo(notif.titulo) || 
                          '';
      const codigoLimpio = codigoPedido.replace(/^#/, '');
      
      let ordenData = await fetchOrdenDetails(codigoLimpio);
      
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

  // Cálculos para paginación - 5 por página
  const indexOfLastNotif = currentPage * notificacionesPerPage;
  const indexOfFirstNotif = indexOfLastNotif - notificacionesPerPage;
  const currentNotificaciones = filteredNotificaciones.slice(indexOfFirstNotif, indexOfLastNotif);
  const totalPages = Math.ceil(filteredNotificaciones.length / notificacionesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Función para generar números de página con ellipsis
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      
      if (currentPage > 3) {
        pageNumbers.push('...');
      }
      
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        if (i > 1 && i < totalPages) {
          pageNumbers.push(i);
        }
      }
      
      if (currentPage < totalPages - 2) {
        pageNumbers.push('...');
      }
      
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  // Función para eliminar notificación individual
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

  // Función para limpiar el título - eliminar SOLO el código
  const limpiarTitulo = (titulo) => {
    if (!titulo) return '';
    
    let tituloLimpio = titulo;
    
    // Elimina el código entre paréntesis al final: "Pedido recibido (ABC123)" -> "Pedido recibido"
    tituloLimpio = tituloLimpio.replace(/\s*\([A-Z0-9]+\)\s*$/i, '').trim();
    
    // Si no encontró el código entre paréntesis, intenta con # al final
    if (tituloLimpio === titulo) {
      tituloLimpio = tituloLimpio.replace(/\s*#\s*[A-Z0-9]+\s*$/i, '').trim();
    }
    
    // Si aún no se limpió, intenta con código sin # ni paréntesis (solo al final)
    if (tituloLimpio === titulo) {
      tituloLimpio = tituloLimpio.replace(/\s+[A-Z0-9]{4,}\s*$/i, '').trim();
    }
    
    return tituloLimpio;
  };

  // Función para limpiar el mensaje - eliminar el código del pedido
  const limpiarMensaje = (mensaje) => {
    if (!mensaje) return '';
    
    let mensajeLimpio = mensaje;
    
    // Elimina "Tu pedido #ABC123 ha sido recibido." -> "Tu pedido ha sido recibido."
    mensajeLimpio = mensajeLimpio.replace(/Tu pedido\s*#?[A-Z0-9]+\s*/i, 'Tu pedido ');
    
    // Elimina cualquier mención del código con # en el mensaje
    mensajeLimpio = mensajeLimpio.replace(/#[A-Z0-9]+\s*/g, '');
    
    // Elimina cualquier mención del código entre paréntesis
    mensajeLimpio = mensajeLimpio.replace(/\s*\([A-Z0-9]+\)\s*/g, ' ');
    
    // Limpia espacios múltiples
    mensajeLimpio = mensajeLimpio.replace(/\s+/g, ' ').trim();
    
    return mensajeLimpio;
  };

  // Renderizar notificación
  const renderNotificacion = (notif) => {
    const estadoPedido = getEstadoPedido(notif);
    const tituloLimpio = limpiarTitulo(notif.titulo);
    const mensajeLimpio = limpiarMensaje(notif.mensaje);
    
    // Determinar el icono según el tipo usando imágenes
    const getIconForType = () => {
      switch(notif.tipo) {
        case 'nuevo_pedido':
          return packageIcon;
        case 'cambio_estado':
          return refreshIcon;
        case 'mensaje_admin':
          return messageIcon;
        default:
          return defaultIcon;
      }
    };
    
    const getCircleClass = () => {
      switch(notif.tipo) {
        case 'nuevo_pedido':
          return 'Notif-User-tipo-nuevo_pedido';
        case 'cambio_estado':
          return 'Notif-User-tipo-cambio_estado';
        case 'mensaje_admin':
          return 'Notif-User-tipo-mensaje_admin';
        default:
          return 'Notif-User-tipo-default';
      }
    };
    
    const getEstadoClass = (estado) => {
      const estadoLower = estado.toLowerCase();
      if (estadoLower.includes('recibido')) return 'Notif-User-estado-recibido';
      if (estadoLower.includes('preparando') || estadoLower.includes('preparación')) return 'Notif-User-estado-preparando';
      if (estadoLower.includes('camino')) return 'Notif-User-estado-en-camino';
      if (estadoLower.includes('entregado')) return 'Notif-User-estado-entregado';
      if (estadoLower.includes('cancelado')) return 'Notif-User-estado-cancelado';
      return 'Notif-User-estado-en-proceso';
    };
    
    return (
      <div 
        className={`Notif-User-item ${notif.leida ? 'Notif-User-leida' : 'Notif-User-no-leida'}`}
        onClick={() => handleOpenPedidoModal(notif)}
        style={{ cursor: 'pointer' }}
      >
        {/* Círculo con icono en la parte izquierda */}
        <div className={`Notif-User-item-circle ${getCircleClass()}`}>
          <img 
            src={getIconForType()} 
            alt="icono" 
            className="Notif-User-item-icon-img"
          />
        </div>
        
        <div className="Notif-User-header">
          <div className="Notif-User-info">
            <h4 className="Notif-User-titulo">{tituloLimpio}</h4>
            <div className="Notif-User-meta">
              <span className="Notif-User-fecha">{formatDate(notif.fecha_creacion)}</span>
            </div>
          </div>
          <div className="Notif-User-actions">
            {!notif.leida && <span className="Notif-User-badge-no-leida">Nuevo</span>}
            
            {/* Botón Leer - Fondo blanco, icono verde */}
            <button 
              onClick={(e) => handleToggleReadStatus(notif, e)}
              className="Notif-User-action-btn-read"
              title={notif.leida ? "Marcar como no leída" : "Marcar como leída"}
            >
              <TfiEmail className="Notif-User-action-icon-read" />
            </button>
            
            {/* Botón Eliminar - Fondo blanco, icono rojo */}
            <button 
              onClick={(e) => { e.stopPropagation(); handleDeleteClick(notif.id, notif.titulo); }}
              className="Notif-User-action-btn-delete"
              title="Eliminar notificación"
            >
              <FiTrash2 className="Notif-User-action-icon-delete" />
            </button>
          </div>
        </div>
        
        {/* Mensaje limpio SIN código */}
        <div className="Notif-User-mensaje">{mensajeLimpio}</div>
        
        <div className="Notif-User-metadata">
          <div className="Notif-User-metadata-item">
            <span className="Notif-User-metadata-label">Estado:</span>
            <span className={`Notif-User-metadata-value Notif-User-estado-pedido ${getEstadoClass(estadoPedido)}`}>
              {estadoPedido}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar estado de carga
  if (loading && notificaciones.length === 0) {
    return (
      <div className={`Notif-User-container ${darkMode ? 'Notif-User-dark-mode' : ''}`}>
        <div className="Notif-User-loading-spinner"></div>
        <p style={{textAlign: 'center', color: '#fff'}}>Cargando notificaciones...</p>
      </div>
    );
  }

  return (
    <div className={`Notif-User-container ${darkMode ? 'Notif-User-dark-mode' : ''}`}>
      <div className="Notif-User-content">
        
        {/* Header con título, descripción y botón de Cerrar Sesión en esquina superior derecha */}
        <div className="Notif-User-section-header">
          <div className="Notif-User-header-left">
            <button onClick={handleGoBack} className="Notif-User-back-button">
              <img src={backIcon} alt="Regresar" className="Notif-User-back-icon" />
            </button>
            <div className="Notif-User-header-text">
              <h3>Mis Notificaciones</h3>
              <p className="Notif-User-header-description">
                Aquí puedes ver todas las notificaciones relacionadas con tus pedidos y cuenta.
              </p>
            </div>
          </div>
          
          {/* Botón de Cerrar Sesión en la esquina superior derecha */}
          {isAuthenticated ? (
            <button onClick={handleLogout} className="Notif-User-logout-btn-header">
              <img src={logoutIcon} alt="Salir" className="Notif-User-btn-icon-img Notif-User-logout-icon" />
              Cerrar Sesión
            </button>
          ) : (
            <button onClick={handleLoginRedirect} className="Notif-User-login-btn-header">
              Iniciar Sesión
            </button>
          )}
        </div>

        {/* Filtros y botones en una sola línea */}
        <div className="Notif-User-controls-section">
          <div className="Notif-User-controls-row">
            {/* Buscador con icono de lupa - SIN BORDE */}
            <div className="Notif-User-search-container">
              <FiSearch className="Notif-User-input-icon" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="Notif-User-search-input"
              />
              {searchTerm && (
                <button className="Notif-User-clear-search" onClick={() => setSearchTerm('')}>✕</button>
              )}
            </div>

            {/* Filtro de tipo con icono de configuración - SIN BORDE */}
            <div className="Notif-User-select-wrapper">
              <FiSliders className="Notif-User-input-icon" />
              <select 
                value={typeFilter} 
                onChange={(e) => setTypeFilter(e.target.value)} 
                className="Notif-User-filter-select"
              >
                <option value="">Todos los tipos</option>
                <option value="nuevo_pedido">Nuevos Pedidos</option>
                <option value="cambio_estado">Cambios de Estado</option>
                <option value="mensaje_admin">Mensajes</option>
              </select>
            </div>

            {/* Filtro de leído/no leído con icono de calendario - SIN BORDE */}
            <div className="Notif-User-select-wrapper">
              <FiCalendar className="Notif-User-input-icon" />
              <select 
                value={readFilter} 
                onChange={(e) => setReadFilter(e.target.value)} 
                className="Notif-User-filter-select"
              >
                <option value="">Todas</option>
                <option value="no-leidas">No leídas</option>
                <option value="leidas">Leídas</option>
              </select>
            </div>

            {/* Botón Actualizar */}
            <button 
              className="Notif-User-refresh-btn" 
              onClick={handleRefresh} 
              disabled={loading}
            >
              <img 
                src={refreshBtnIcon} 
                alt="Actualizar" 
                className={`Notif-User-btn-icon-img ${loading ? 'Notif-User-spinning' : ''}`} 
              />
              {loading ? '...' : 'Actualizar'}
            </button>
            
            {/* Botón Marcar Todas - Color más claro */}
            <button 
              className="Notif-User-mark-read-btn" 
              onClick={handleMarkAllAsRead} 
              disabled={notificaciones.every(n => n.leida) || loading}
            >
              <TfiEmail className="Notif-User-btn-icon" />
              Marcar Todas
            </button>
            
            {/* Botón Eliminar Todas (Leídas) */}
            <button 
              className="Notif-User-delete-read-btn" 
              onClick={handleDeleteAllRead} 
              disabled={notificaciones.every(n => !n.leida) || loading}
            >
              <FiTrash2 className="Notif-User-btn-icon" />
              Eliminar Todas
            </button>
          </div>
        </div>

        {/* Contador de notificaciones */}
        <div className="Notif-User-notifications-counter">
          <div className="Notif-User-counter-item">
            <div className="Notif-User-counter-icon-circle">
              <IoNotificationsOutline className="Notif-User-counter-icon" />
            </div>
            <div className="Notif-User-counter-info">
              <span className="Notif-User-counter-label">Total de Notificaciones</span>
              <span className="Notif-User-counter-number">{notificaciones.length}</span>
            </div>
          </div>
          <div className="Notif-User-counter-divider"></div>
          <div className="Notif-User-counter-item Notif-User-no-icon">
            <div className="Notif-User-counter-info">
              <span className="Notif-User-counter-label">No leídas</span>
              <span className="Notif-User-counter-number Notif-User-highlight">{notificaciones.filter(n => !n.leida).length}</span>
            </div>
          </div>
        </div>

        {/* Lista de notificaciones */}
        <div className="Notif-User-list-container">
          {currentNotificaciones.length > 0 ? (
            currentNotificaciones.map(notif => (
              <React.Fragment key={notif.id}>
                {renderNotificacion(notif)}
              </React.Fragment>
            ))
          ) : (
            <div className="Notif-User-no-notificaciones">
              {loading ? 'Cargando...' : 
               searchTerm || typeFilter || readFilter ? 'No se encontraron notificaciones' : 
               'No hay notificaciones disponibles'}
            </div>
          )}
        </div>

        {/* Paginación - 5 por página con números de página */}
        {filteredNotificaciones.length > notificacionesPerPage && (
          <div className="Notif-User-pagination-container">
            <div className="Notif-User-pagination-controls">
              <button 
                className="Notif-User-pagination-btn" 
                onClick={() => paginate(currentPage - 1)} 
                disabled={currentPage === 1}
              >
                ◀ Anterior
              </button>
              
              <div className="Notif-User-pagination-numbers">
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="Notif-User-pagination-ellipsis">...</span>
                  ) : (
                    <button
                      key={page}
                      className={`Notif-User-pagination-btn ${currentPage === page ? 'Notif-User-active' : ''}`}
                      onClick={() => paginate(page)}
                    >
                      {page}
                    </button>
                  )
                ))}
              </div>
              
              <button 
                className="Notif-User-pagination-btn" 
                onClick={() => paginate(currentPage + 1)} 
                disabled={currentPage === totalPages}
              >
                Siguiente ▶
              </button>
            </div>
            
            <span className="Notif-User-count-info">
              Mostrando {indexOfFirstNotif + 1} - {Math.min(indexOfLastNotif, filteredNotificaciones.length)} de {filteredNotificaciones.length} notificaciones
            </span>
          </div>
        )}

        {/* Modal de confirmación de eliminación */}
        {showDeleteConfirm && (
          <div className="Notif-User-modal-overlay-delete">
            <div className="Notif-User-modal-content Notif-User-confirm-modal">
              <div className="Notif-User-confirm-header">
                <h3>⚠️ Eliminar Notificación</h3>
              </div>
              <div className="Notif-User-confirm-body">
                <p className="Notif-User-confirm-message">
                  ¿Estás seguro de eliminar: <strong>"{notificationToDelete?.titulo}"</strong>?
                </p>
                <p className="Notif-User-confirm-warning">Esta acción no se puede deshacer</p>
              </div>
              <div className="Notif-User-confirm-actions">
                <button 
                  className="Notif-User-confirm-btn Notif-User-cancel-btn" 
                  onClick={handleDeleteCancel}
                >
                  Cancelar
                </button>
                <button 
                  className="Notif-User-confirm-btn Notif-User-delete-confirm-btn" 
                  onClick={handleDeleteConfirm}
                >
                  Eliminar
                </button>
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
      </div>
    </div>
  );
};

export default NotificacionesUser;