import React, { useEffect, useState } from 'react';
import CreateOrdenForm from '../../components/ordenes/create-ordenes';
import EditOrdenForm from '../../components/ordenes/edit-ordenes';
import VerificarCodigo from '../../components/ordenes/verificar-codigo';
import ModalDetallePedido from '../../components/ordenes/detalles-ordenes';
import { useConfig } from '../../context/config';
import '../../css/Ordenes/ordenes.css';

import editIcon from '../../img/edit.png';
import deleteIcon from '../../img/delete.png';
import verifyIcon from '../../img/verify.png';
import refreshIcon from '../../img/actualizar.png';
import locationIcon from '../../img/ubicacion.png';

const Ordenes = () => {
  const { darkMode } = useConfig();
  const [ordenes, setOrdenes] = useState([]);
  const [filteredOrdenes, setFilteredOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedOrden, setSelectedOrden] = useState(null);
  const [ordenToDelete, setOrdenToDelete] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [deleteDetail, setDeleteDetail] = useState('');
  const [deleteType, setDeleteType] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [selectedOrdenDetalle, setSelectedOrdenDetalle] = useState(null);
  
  const ordenesPerPage = 7;

  useEffect(() => {
    fetchOrdenes();
  }, []);

  const fetchOrdenes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://127.0.0.1:5000/ordenes/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Debug: ver qué campos vienen del backend
        if (data.length > 0) {
          console.log('📦 Datos de la primera orden:', data[0]);
          console.log('📦 Campos disponibles:', Object.keys(data[0]));
          console.log('💰 precio_total:', data[0].precio_total);
          console.log('💰 precio:', data[0].precio);
        }
        
        const ordenesWithSimpleIds = data.map((orden, index) => ({
          ...orden,
          simpleId: index + 1
        }));
        
        setOrdenes(ordenesWithSimpleIds);
        setFilteredOrdenes(ordenesWithSimpleIds);
      } else {
        console.error('Error al obtener órdenes:', response.status);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchOrdenes();
  };

  useEffect(() => {
    let filtered = ordenes;

    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(orden => 
        orden.simpleId.toString().includes(searchTerm) || 
        orden.id.toString().includes(searchTerm) ||
        orden.codigo_unico?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orden.nombre_usuario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orden.telefono_usuario?.includes(searchTerm) ||
        orden.direccion_texto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orden.metodo_pago?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== '') {
      filtered = filtered.filter(orden => orden.estado === statusFilter);
    }
    
    setFilteredOrdenes(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, ordenes]);

  const indexOfLastOrden = currentPage * ordenesPerPage;
  const indexOfFirstOrden = indexOfLastOrden - ordenesPerPage;
  const currentOrdenes = filteredOrdenes.slice(indexOfFirstOrden, indexOfLastOrden);
  const totalPages = Math.ceil(filteredOrdenes.length / ordenesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDeleteClick = (orden) => {
    setOrdenToDelete({ 
      id: orden.id, 
      nombre: orden.nombre_usuario,
      estado: orden.estado,
      codigo: orden.codigo_unico
    });
    setShowDeleteConfirm(true);
    setDeleteMessage('');
    setDeleteDetail('');
    setDeleteType('');
  };

  const handleShowAddress = (direccion) => {
    if (direccion && direccion.trim() !== '') {
      setSelectedAddress(direccion);
      setShowAddressModal(true);
    } else {
      setSelectedAddress('No hay dirección registrada para esta orden');
      setShowAddressModal(true);
    }
  };

  const handleCloseAddressModal = () => {
    setShowAddressModal(false);
    setSelectedAddress('');
  };

  const handleCopyAddress = () => {
    if (selectedAddress && selectedAddress !== 'No hay dirección registrada para esta orden') {
      navigator.clipboard.writeText(selectedAddress)
        .then(() => {
          alert('Dirección copiada al portapapeles');
        })
        .catch(err => {
          console.error('Error al copiar:', err);
        });
    }
  };

  const handleOpenInMaps = () => {
    if (selectedAddress && selectedAddress !== 'No hay dirección registrada para esta orden') {
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedAddress)}`;
      window.open(mapsUrl, '_blank');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!ordenToDelete) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('Eliminando orden ID:', ordenToDelete.id, 'Estado:', ordenToDelete.estado);
      
      const response = await fetch(`http://127.0.0.1:5000/ordenes/${ordenToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = { 
          msg: 'Error inesperado del servidor',
          tipo: 'error'
        };
      }
      
      console.log('Respuesta del servidor:', responseData);
      
      if (response.ok) {
        if (responseData.tipo === 'eliminacion_exitosa') {
          const updatedOrdenes = ordenes.filter(orden => orden.id !== ordenToDelete.id);
          
          const ordenesWithSimpleIds = updatedOrdenes.map((orden, index) => ({
            ...orden,
            simpleId: index + 1
          }));
          
          setOrdenes(ordenesWithSimpleIds);
          setFilteredOrdenes(ordenesWithSimpleIds);
          
          setDeleteMessage('Orden eliminada permanentemente');
          setDeleteDetail(responseData.detalle || '');
          setDeleteType('success');
        } 
        else if (responseData.tipo === 'marcada_como_eliminada') {
          const updatedOrdenes = ordenes.map(orden => 
            orden.id === ordenToDelete.id 
              ? { 
                  ...orden, 
                  estado: 'cancelado',
                  nombre_usuario: `${orden.nombre_usuario} [ELIMINADO]`,
                  telefono_usuario: '0000000000',
                  direccion_texto: '[ELIMINADA]'
                }
              : orden
          );
          
          const ordenesWithSimpleIds = updatedOrdenes.map((orden, index) => ({
            ...orden,
            simpleId: index + 1
          }));
          
          setOrdenes(ordenesWithSimpleIds);
          setFilteredOrdenes(ordenesWithSimpleIds);
          
          setDeleteMessage('Orden marcada como eliminada (no se pudo borrar físicamente)');
          setDeleteDetail(responseData.detalle || '');
          setDeleteType('warning');
        }
        else {
          setDeleteMessage(responseData.msg || 'Orden eliminada');
          setDeleteDetail('');
          setDeleteType('success');
          fetchOrdenes();
        }
        
        if (response.ok) {
          setTimeout(() => {
            setShowDeleteConfirm(false);
            setOrdenToDelete(null);
            setDeleteMessage('');
            setDeleteDetail('');
            setDeleteType('');
          }, 3000);
        }
        
      } else {
        setDeleteMessage(responseData.msg || 'Error al eliminar la orden');
        setDeleteDetail(responseData.detalle || '');
        setDeleteType('error');
      }
      
    } catch (error) {
      console.error('Error:', error);
      setDeleteMessage('Error de conexión con el servidor');
      setDeleteDetail('No se pudo comunicar con el servidor');
      setDeleteType('error');
      
      setTimeout(() => {
        setDeleteMessage('');
        setDeleteDetail('');
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setOrdenToDelete(null);
    setDeleteMessage('');
    setDeleteDetail('');
    setDeleteType('');
  };

  const handleEdit = (orden) => {
    setSelectedOrden(orden);
    setShowEditModal(true);
  };

  const handleAddOrden = () => {
    setShowCreateModal(true);
  };

  const handleVerifyCode = () => {
    setShowVerifyModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedOrden(null);
  };

  const closeVerifyModal = () => {
    setShowVerifyModal(false);
  };

  const handleVerDetalle = (orden) => {
    setSelectedOrdenDetalle(orden);
    setShowDetalleModal(true);
  };

  const handleCloseDetalleModal = () => {
    setShowDetalleModal(false);
    setSelectedOrdenDetalle(null);
  };

  const formatPrice = (price) => {
    // Asegurar que price sea un número válido
    const numPrice = parseFloat(price) || 0;
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numPrice);
  };

  // Función segura para obtener el precio
  const getPrecio = (orden) => {
    // Intentar con precio_total primero
    if (orden.precio_total !== undefined && orden.precio_total !== null) {
      return orden.precio_total;
    }
    // Si no, intentar con precio
    if (orden.precio !== undefined && orden.precio !== null) {
      return orden.precio;
    }
    // Si no hay ninguno, calcular de los items si es carrito
    if (orden.tipo_pedido === 'carrito' && orden.pedido_json) {
      try {
        const pedidoData = JSON.parse(orden.pedido_json);
        if (pedidoData.total) {
          return pedidoData.total;
        }
      } catch (e) {
        console.error('Error parseando pedido_json:', e);
      }
    }
    // Valor por defecto
    return 0;
  };

  const getStatusBadge = (estado) => {
    const statusConfig = {
      pendiente: { class: 'pending', text: 'Pendiente' },
      confirmada: { class: 'pending', text: 'Confirmada' },
      pagada: { class: 'preparing', text: 'Pagada' },
      en_preparacion: { class: 'preparing', text: 'En Preparación' },
      enviada: { class: 'ready', text: 'Enviada' },
      entregada: { class: 'delivered', text: 'Entregada' },
      cancelada: { class: 'cancelled', text: 'Cancelada' },
      reembolsada: { class: 'cancelled', text: 'Reembolsada' }
    };
    
    const config = statusConfig[estado] || { class: 'pending', text: estado || 'Desconocido' };
    
    return <span className={`ordenes-status-badge ${config.class}`}>{config.text}</span>;
  };

  const getMetodoPagoDisplay = (orden) => {
    if (!orden.metodo_pago) return 'N/A';
    
    let texto = orden.metodo_pago === 'efectivo' ? 'Efectivo' : 'Tarjeta';
    
    if (orden.metodo_pago === 'tarjeta' && orden.info_pago) {
      texto += ` (${orden.info_pago.tipo || 'Tarjeta'} •••• ${orden.info_pago.ultimos_4 || '****'})`;
    }
    
    return texto;
  };

  const getAddressDisplay = (direccion) => {
    if (!direccion || direccion.trim() === '') {
      return (
        <span className="ordenes-no-address" title="Sin dirección">
          Sin dirección
        </span>
      );
    } else if (direccion === '[ELIMINADA]') {
      return (
        <span className="ordenes-deleted-address" title="Dirección eliminada">
          Dirección eliminada
        </span>
      );
    } else {
      return (
        <div className="ordenes-address-container">
          <span className="ordenes-address-text" title={direccion}>
            {direccion.length > 25 ? `${direccion.substring(0, 25)}...` : direccion}
          </span>
          <button 
            className="ordenes-view-address-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleShowAddress(direccion);
            }}
            title="Ver dirección completa"
          >
            <img src={locationIcon} alt="Ver dirección" className="ordenes-address-icon" />
          </button>
        </div>
      );
    }
  };

  if (loading && ordenes.length === 0) {
    return (
      <div className={`ordenes-container ${darkMode ? 'dark-mode' : ''}`}>
        <div className="ordenes-loading-spinner"></div>
        <p className="ordenes-loading-text">Cargando órdenes...</p>
      </div>
    );
  }

  return (
    <div className={`ordenes-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="ordenes-content">
        
        <div className="ordenes-section-header">
          <h3 className="ordenes-section-title">Gestión de Órdenes</h3>
          <div className="ordenes-header-buttons">
            <button 
              className="ordenes-refresh-btn"
              onClick={handleRefresh}
              title="Actualizar lista"
              disabled={loading}
            >
              <img src={refreshIcon} alt="Actualizar" className="ordenes-btn-icon-refresh" />
            </button>
            <button 
              className="ordenes-verify-btn"
              onClick={handleVerifyCode}
              title="Verificar código de orden"
            >
              <img src={verifyIcon} alt="Verificar" className="ordenes-btn-icon-img" />
              Verificar Código
            </button>
            <button 
              className="ordenes-add-btn"
              onClick={handleAddOrden}
              title="Agregar nueva orden"
            >
              <span className="ordenes-btn-icon-text">+</span>
              Nueva Orden
            </button>
          </div>
        </div>

        <div className="ordenes-search-section">
          <div className="ordenes-filters-row">
            <div className="ordenes-search-container ordenes-main-search">
              <input
                type="text"
                placeholder="Buscar por código, nombre, teléfono, dirección o método de pago..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ordenes-search-input"
              />
              {searchTerm && (
                <button 
                  className="ordenes-clear-search"
                  onClick={() => setSearchTerm('')}
                  title="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="ordenes-filter-group">
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="ordenes-filter-select"
              >
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="confirmada">Confirmada</option>
                <option value="pagada">Pagada</option>
                <option value="en_preparacion">En Preparación</option>
                <option value="enviada">Enviada</option>
                <option value="entregada">Entregada</option>
                <option value="cancelada">Cancelada</option>
                <option value="reembolsada">Reembolsada</option>
              </select>
            </div>
          </div>
        </div>

        <div className="ordenes-table-container">
          <table className="ordenes-table">
            <thead>
              <tr>
                <th className="ordenes-th">ID</th>
                <th className="ordenes-th">Código</th>
                <th className="ordenes-th">Cliente</th>
                <th className="ordenes-th">Teléfono</th>
                <th className="ordenes-th">Dirección</th>
                <th className="ordenes-th">Tipo</th>
                <th className="ordenes-th">Pedido</th>
                <th className="ordenes-th">Pago</th>
                <th className="ordenes-th">Precio</th>
                <th className="ordenes-th">Estado</th>
                <th className="ordenes-th ordenes-actions-header">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentOrdenes.length > 0 ? (
                currentOrdenes.map(orden => (
                  <tr key={orden.id} className="ordenes-row">
                    <td className="ordenes-td ordenes-id">{orden.simpleId}</td>
                    <td className="ordenes-td ordenes-codigo">
                      <strong>{orden.codigo_unico}</strong>
                    </td>
                    <td className="ordenes-td ordenes-cliente">{orden.nombre_usuario || 'N/A'}</td>
                    <td className="ordenes-td ordenes-telefono">{orden.telefono_usuario || 'N/A'}</td>
                    <td className="ordenes-td ordenes-direccion">
                      {getAddressDisplay(orden.direccion_texto)}
                    </td>
                    <td className="ordenes-td ordenes-tipo">
                      <span className={`ordenes-tipo-badge ${orden.tipo_pedido}`}>
                        {orden.tipo_pedido === 'carrito' ? 'Carrito' : 
                         orden.tipo_pedido === 'suplemento' ? 'Suplemento' : 
                         orden.tipo_pedido || 'N/A'}
                      </span>
                    </td>
                    <td className="ordenes-td ordenes-pedido">
                      {orden.tipo_pedido === 'carrito' ? (
                        <button 
                          onClick={() => handleVerDetalle(orden)}
                          className="ordenes-pedido-link-btn"
                          title="Ver detalles del pedido"
                        >
                          Ver Carrito
                        </button>
                      ) : orden.tipo_pedido === 'suplemento' ? (
                        orden.suplemento ? orden.suplemento.nombre : 'N/A'
                      ) : (
                        <span title={orden.ingredientes_personalizados}>
                          {orden.ingredientes_personalizados ? 
                            (orden.ingredientes_personalizados.length > 30 
                              ? `${orden.ingredientes_personalizados.substring(0, 30)}...` 
                              : orden.ingredientes_personalizados
                            ) : 'N/A'
                          }
                        </span>
                      )}
                    </td>
                    <td className="ordenes-td ordenes-pago">
                      <span className="ordenes-metodo-pago-badge">
                        {getMetodoPagoDisplay(orden)}
                      </span>
                    </td>
                    <td className="ordenes-td ordenes-price">
                      {formatPrice(getPrecio(orden))}
                    </td>
                    <td className="ordenes-td ordenes-status">
                      {getStatusBadge(orden.estado)}
                    </td>
                    <td className="ordenes-td ordenes-actions-cell">
                      <div className="ordenes-actions-buttons">
                        <button 
                          onClick={() => handleEdit(orden)}
                          className="ordenes-action-btn ordenes-edit-btn"
                          title="Editar orden"
                          disabled={orden.estado === 'entregado' || orden.estado === 'cancelada'}
                        >
                          <img src={editIcon} alt="Editar" className="ordenes-action-icon" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(orden)}
                          className="ordenes-action-btn ordenes-delete-btn"
                          title="Eliminar orden permanentemente"
                          disabled={orden.estado === 'entregado' || orden.estado === 'cancelada'}
                        >
                          <img src={deleteIcon} alt="Eliminar" className="ordenes-action-icon" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="ordenes-no-results">
                    {searchTerm || statusFilter ? 'No se encontraron órdenes con esos criterios' : 'No hay órdenes registradas'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {filteredOrdenes.length > ordenesPerPage && (
            <div className="ordenes-pagination-container">
              <div className="ordenes-pagination-controls">
                <button 
                  onClick={() => paginate(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="ordenes-pagination-btn ordenes-prev-btn"
                >
                  Anterior
                </button>
                
                <div className="ordenes-pagination-numbers">
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
                          {showEllipsis && <span className="ordenes-pagination-ellipsis">...</span>}
                          <button
                            onClick={() => paginate(number)}
                            className={`ordenes-pagination-btn ${currentPage === number ? 'active' : ''}`}
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
                  className="ordenes-pagination-btn ordenes-next-btn"
                >
                  Siguiente
                </button>
              </div>

              <div className="ordenes-count-info">
                Mostrando {currentOrdenes.length} de {filteredOrdenes.length} órdenes
              </div>
            </div>
          )}

          {filteredOrdenes.length <= ordenesPerPage && filteredOrdenes.length > 0 && (
            <div className="ordenes-count-info">
              Mostrando {currentOrdenes.length} de {filteredOrdenes.length} órdenes
            </div>
          )}
        </div>

        {/* Modal de dirección */}
        {showAddressModal && (
          <div className="ordenes-modal-overlay">
            <div className="ordenes-modal-content ordenes-address-modal">
              <div className="ordenes-modal-header">
                <h3 className="ordenes-modal-title">Dirección del Cliente</h3>
                <button className="ordenes-close-modal" onClick={handleCloseAddressModal}>✕</button>
              </div>
              <div className="ordenes-modal-body">
                <div className="ordenes-address-content">
                  <p className="ordenes-address-title">Dirección completa:</p>
                  <div className="ordenes-address-display">
                    {selectedAddress}
                  </div>
                  {selectedAddress && selectedAddress !== 'No hay dirección registrada para esta orden' && (
                    <div className="ordenes-address-actions">
                      <button 
                        className="ordenes-btn ordenes-btn-secondary"
                        onClick={handleCopyAddress}
                      >
                        Copiar Dirección
                      </button>
                      <button 
                        className="ordenes-btn ordenes-btn-primary"
                        onClick={handleOpenInMaps}
                      >
                        Abrir en Google Maps
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="ordenes-modal-footer">
                <button 
                  className="ordenes-btn ordenes-btn-close"
                  onClick={handleCloseAddressModal}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación de eliminación */}
        {showDeleteConfirm && (
          <div className="ordenes-modal-overlay-delete">
            <div className="ordenes-modal-content ordenes-confirm-modal ordenes-direct-modal">
              <div className="ordenes-confirm-header">
                <h3 className="ordenes-confirm-title">Eliminar Orden Permanentemente</h3>
              </div>
              <div className="ordenes-confirm-body">
                {deleteMessage ? (
                  <div className={`ordenes-message-container ${deleteType}`}>
                    <div className="ordenes-message-icon">
                      {deleteType === 'success' ? '' : 
                       deleteType === 'warning' ? '⚠️' : '❌'}
                    </div>
                    <p className="ordenes-message-text">{deleteMessage}</p>
                    {deleteDetail && (
                      <p className="ordenes-message-detail">{deleteDetail}</p>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="ordenes-warning-box">
                      <div className="ordenes-warning-icon">⚠️</div>
                      <div className="ordenes-warning-content">
                        <p><strong>¿Eliminar esta orden PERMANENTEMENTE?</strong></p>
                        <p>Esta acción <strong>NO</strong> se puede deshacer.</p>
                      </div>
                    </div>
                    
                    <div className="ordenes-info-box">
                      <p><strong>Orden #:</strong> {ordenToDelete?.codigo}</p>
                      <p><strong>Cliente:</strong> {ordenToDelete?.nombre}</p>
                      <p><strong>Estado actual:</strong> {ordenToDelete?.estado}</p>
                    </div>
                    
                    <div className="ordenes-delete-consequences">
                      <p><strong>Se eliminará:</strong></p>
                      <ul>
                        <li>La orden completa de la base de datos</li>
                        <li>Todas las notificaciones relacionadas</li>
                        <li>Registro de historial asociado</li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
              <div className="ordenes-confirm-actions">
                {!deleteMessage ? (
                  <>
                    <button 
                      className="ordenes-confirm-btn ordenes-cancel-btn"
                      onClick={handleDeleteCancel}
                      disabled={loading}
                    >
                      Cancelar
                    </button>
                    <button 
                      className="ordenes-confirm-btn ordenes-delete-permanent-btn"
                      onClick={handleDeleteConfirm}
                      disabled={loading}
                    >
                      {loading ? 'Eliminando...' : 'Eliminar Permanentemente'}
                    </button>
                  </>
                ) : (
                  <button 
                    className="ordenes-confirm-btn ordenes-close-btn"
                    onClick={handleDeleteCancel}
                  >
                    Cerrar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal para crear orden */}
        {showCreateModal && (
          <div className="ordenes-modal-overlay">
            <div className="ordenes-modal-content ordenes-large-modal">
              <div className="ordenes-modal-header">
                <h3 className="ordenes-modal-title">Crear Nueva Orden</h3>
                <button className="ordenes-close-modal" onClick={closeCreateModal}>✕</button>
              </div>
              <div className="ordenes-modal-body">
                <CreateOrdenForm 
                  onClose={closeCreateModal}
                  onOrdenCreated={() => {
                    fetchOrdenes();
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal para editar orden */}
        {showEditModal && selectedOrden && (
          <div className="ordenes-modal-overlay">
            <div className="ordenes-modal-content ordenes-large-modal">
              <div className="ordenes-modal-header">
                <h3 className="ordenes-modal-title">Editar Orden</h3>
                <button className="ordenes-close-modal" onClick={closeEditModal}>✕</button>
              </div>
              <div className="ordenes-modal-body">
                <EditOrdenForm 
                  orden={selectedOrden}
                  onClose={closeEditModal}
                  onOrdenUpdated={() => {
                    fetchOrdenes();
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal para verificar código */}
        {showVerifyModal && (
          <div className="ordenes-modal-overlay">
            <div className="ordenes-modal-content">
              <div className="ordenes-modal-header">
                <h3 className="ordenes-modal-title">Verificar Código de Orden</h3>
                <button className="ordenes-close-modal" onClick={closeVerifyModal}>✕</button>
              </div>
              <div className="ordenes-modal-body">
                <VerificarCodigo 
                  onClose={closeVerifyModal}
                  onOrdenActualizada={(ordenActualizada) => {
                    setOrdenes(prevOrdenes => 
                      prevOrdenes.map(orden => 
                        orden.id === ordenActualizada.id 
                          ? { ...orden, estado: 'entregado' }
                          : orden
                      )
                    );
                    setFilteredOrdenes(prevFiltered => 
                      prevFiltered.map(orden => 
                        orden.id === ordenActualizada.id 
                          ? { ...orden, estado: 'entregado' }
                          : orden
                      )
                    );
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal de detalle del pedido */}
        {showDetalleModal && selectedOrdenDetalle && (
          <ModalDetallePedido 
            orden={selectedOrdenDetalle}
            onClose={handleCloseDetalleModal}
          />
        )}
      </div>
    </div>
  );
};

export default Ordenes;