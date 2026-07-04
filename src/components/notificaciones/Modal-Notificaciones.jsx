import React from 'react';
import { FaRegUser, FaTimes, FaCreditCard, FaBox, FaFileAlt} from 'react-icons/fa';
import { AiOutlineShoppingCart } from "react-icons/ai";
import { IoLocationOutline } from "react-icons/io5";
import { MdOutlineStickyNote2 } from "react-icons/md";
import { FiPhone, FiCalendar, FiCheckCircle } from "react-icons/fi";
import { MdAttachMoney } from "react-icons/md";
import { PiArrowLeftBold } from "react-icons/pi";
import { LuClipboardList } from "react-icons/lu";

import '../../css/Notificaciones/modal_detalle_pedido.css';

const PedidoModal = ({ show, onClose, pedidoSeleccionado, modalLoading, darkMode }) => {
  if (!show) return null;

  // Función para renderizar productos del carrito como tabla
  const renderProductosTabla = (pedidoJson) => {
    try {
      let items = [];
      let pedidoData = pedidoJson;
      
      if (typeof pedidoData === 'string') {
        pedidoData = JSON.parse(pedidoData);
      }
      
      if (Array.isArray(pedidoData)) {
        items = pedidoData;
      } else if (pedidoData.items && Array.isArray(pedidoData.items)) {
        items = pedidoData.items;
      } else if (pedidoData.item && Array.isArray(pedidoData.item)) {
        items = pedidoData.item;
      } else {
        return (
          <tr>
            <td colSpan="3" className="Detall-Notif-no-productos">No se pudieron cargar los productos</td>
          </tr>
        );
      }
      
      if (items.length > 0) {
        return items.map((item, index) => (
          <tr key={index}>
            <td className="Detall-Notif-producto-nombre-tabla">
              {item.nombre || item.nombre_producto || 'Producto'}
            </td>
            <td className="Detall-Notif-producto-cantidad-tabla">
              x{item.cantidad || 1}
            </td>
            <td className="Detall-Notif-producto-precio-tabla">
              ${((item.precio_unitario || item.precio || 0) * (item.cantidad || 1)).toFixed(2)}
            </td>
          </tr>
        ));
      } else {
        return (
          <tr>
            <td colSpan="3" className="Detall-Notif-no-productos">No hay productos en este pedido</td>
          </tr>
        );
      }
    } catch (e) {
      console.error('Error parseando pedido_json:', e);
      return (
        <tr>
          <td colSpan="3" className="Detall-Notif-no-productos">Error al cargar los productos</td>
        </tr>
      );
    }
  };

  // Función para determinar el estado del pedido
  const getEstadoInfo = (estado) => {
    const estados = {
      'recibido': { label: 'Recibido', color: '#dbeec5' },
      'pendiente': { label: 'Pendiente', color: '#FF9800' },
      'en proceso': { label: 'En Proceso', color: '#2196F3' },
      'en_preparacion': { label: 'En Preparación', color: '#2196F3' },
      'completado': { label: 'Completado', color: '#4CAF50' },
      'cancelado': { label: 'Cancelado', color: '#F44336' },
      'enviado': { label: 'Enviado', color: '#9C27B0' },
      'entregado': { label: 'Entregado', color: '#4CAF50' },
      'pagado': { label: 'Pagado', color: '#4CAF50' },
      'confirmado': { label: 'Confirmado', color: '#4CAF50' },
    };
    const estadoLower = (estado || '').toLowerCase();
    return estados[estadoLower] || { label: estado || 'Desconocido', color: '#757575' };
  };

  // Determinar si mostrar detalles de pedido o mensaje simple
  const esMensajeSimple = pedidoSeleccionado?.tipo === 'mensaje';

  // Renderizar mensaje simple
  if (esMensajeSimple) {
    return (
      <div className={`Detall-Notif-modal-overlay ${darkMode ? 'Detall-Notif-dark-mode' : ''}`} onClick={onClose}>
        <div className="Detall-Notif-modal-content Detall-Notif-pedido-modal Detall-Notif-mensaje-modal" onClick={(e) => e.stopPropagation()}>
          <div className="Detall-Notif-modal-header">
            <div className="Detall-Notif-header-left">
              <div className="Detall-Notif-icon-decorativo">
                <LuClipboardList />
              </div>
              <div className="Detall-Notif-header-titles">
                <h2>Mensaje del Administrador</h2>
                <p className="Detall-Notif-header-subtitle">Lee el mensaje completo</p>
              </div>
            </div>
            <button className="Detall-Notif-btn-close" onClick={onClose}>
              <FaTimes />
            </button>
          </div>

          <div className="Detall-Notif-modal-body Detall-Notif-mensaje-body">
            <div className="Detall-Notif-mensaje-contenido-completo">
              <div className="Detall-Notif-mensaje-fecha-info">
                <span className="Detall-Notif-fecha-label">Fecha:</span>
                <span className="Detall-Notif-fecha-value">{pedidoSeleccionado.fecha}</span>
              </div>
              {pedidoSeleccionado.notificacion?.metadata?.remitente && (
                <div className="Detall-Notif-mensaje-remitente-info">
                  <span className="Detall-Notif-remitente-label">De:</span>
                  <span className="Detall-Notif-remitente-value">{pedidoSeleccionado.notificacion.metadata.remitente}</span>
                </div>
              )}
              <div className="Detall-Notif-mensaje-texto">
                {pedidoSeleccionado.mensaje}
              </div>
            </div>
          </div>

          <div className="Detall-Notif-modal-footer">
            <button onClick={onClose} className="Detall-Notif-btn-cerrar-modal">Cerrar</button>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar detalles del pedido
  const estadoInfo = getEstadoInfo(pedidoSeleccionado?.estado);

  // 🔴 NUEVA LÓGICA: Detectar si es un pedido de suplemento
  const esSuplemento = (pedidoSeleccionado.orden?.tipo_pedido === 'suplemento' || 
                        pedidoSeleccionado.tipo_pedido === 'suplemento');

  // 🔴 NUEVA LÓGICA: Obtener datos del suplemento si existe
  const suplementoData = esSuplemento ? {
    nombre: pedidoSeleccionado.orden?.suplemento?.nombre || 
            pedidoSeleccionado.suplemento?.nombre || 
            'Producto sin nombre',
    cantidad: pedidoSeleccionado.orden?.cantidad || 
              pedidoSeleccionado.cantidad || 
              1,
    precio: pedidoSeleccionado.orden?.precio_unitario || 
            pedidoSeleccionado.precio_unitario || 
            0
  } : null;

  return (
    <div className={`Detall-Notif-modal-overlay ${darkMode ? 'Detall-Notif-dark-mode' : ''}`} onClick={onClose}>
      <div className="Detall-Notif-modal-content Detall-Notif-pedido-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="Detall-Notif-modal-header">
          <div className="Detall-Notif-header-left">
            {/* Icono decorativo - NO es un botón */}
            <div className="Detall-Notif-icon-decorativo">
              <LuClipboardList />
            </div>
            <div className="Detall-Notif-header-titles">
              <h2>Detalle del Pedido</h2>
              <p className="Detall-Notif-header-subtitle">Consulta la información completa de tu pedido</p>
            </div>
          </div>
          <button className="Detall-Notif-btn-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* BODY */}
        <div className="Detall-Notif-modal-body">
          {modalLoading ? (
            <div className="Detall-Notif-pedido-loading">
              <div className="Detall-Notif-loading-spinner Detall-Notif-small"></div>
              <p>Cargando información...</p>
            </div>
          ) : pedidoSeleccionado ? (
            <div className="Detall-Notif-pedido-content-grid">
              
              {/* COLUMNA IZQUIERDA - Más pequeña */}
              <div className="Detall-Notif-pedido-columna-izquierda">
                
                {/* Código del pedido - Alineado a la izquierda */}
                <div className="Detall-Notif-codigo-pedido-card">
                  <div className="Detall-Notif-codigo-label">CÓDIGO DEL PEDIDO</div>
                  <div className="Detall-Notif-codigo-value">
                    #{pedidoSeleccionado.codigoPedido || pedidoSeleccionado.codigo_unico || "N/A"}
                  </div>
                </div>

                {/* Información del pedido - Formato lista vertical */}
                <div className="Detall-Notif-info-lista-container">
                  <div className="Detall-Notif-info-lista-item">
                    <div className="Detall-Notif-info-lista-icon">
                      <FiCalendar />
                    </div>
                    <div className="Detall-Notif-info-lista-content">
                      <span className="Detall-Notif-info-lista-label">Fecha</span>
                      <span className="Detall-Notif-info-lista-value">{pedidoSeleccionado.fecha}</span>
                    </div>
                  </div>
                  
                  <div className="Detall-Notif-info-lista-item">
                    <div className="Detall-Notif-info-lista-icon">
                      <FiCheckCircle />
                    </div>
                    <div className="Detall-Notif-info-lista-content">
                      <span className="Detall-Notif-info-lista-label">Estado</span>
                      <span 
                        className="Detall-Notif-estado-badge" 
                        style={{ 
                          backgroundColor: estadoInfo.color,
                          color: '#669d36'
                        }}
                      >
                        {estadoInfo.label}
                      </span>
                    </div>
                  </div>
                  
                  <div className="Detall-Notif-info-lista-item">
                    <div className="Detall-Notif-info-lista-icon">
                      <MdAttachMoney />
                    </div>
                    <div className="Detall-Notif-info-lista-content">
                      <span className="Detall-Notif-info-lista-label">Total</span>
                      <span className="Detall-Notif-info-lista-value Detall-Notif-precio-total">
                        ${parseFloat(pedidoSeleccionado.precio || pedidoSeleccionado.precio_total || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="Detall-Notif-info-lista-item">
                    <div className="Detall-Notif-info-lista-icon">
                      <FaCreditCard />
                    </div>
                    <div className="Detall-Notif-info-lista-content">
                      <span className="Detall-Notif-info-lista-label">Método de pago</span>
                      <span className="Detall-Notif-info-lista-value Detall-Notif-metodo-pago">
                        {pedidoSeleccionado.metodo_pago === 'efectivo' ? 'Efectivo' : 
                         pedidoSeleccionado.metodo_pago === 'tarjeta' ? 'Tarjeta' : 
                         pedidoSeleccionado.metodo_pago || 'No especificado'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Información del cliente - Formato lista vertical */}
                <div className="Detall-Notif-cliente-section">
                  <div className="Detall-Notif-section-title">
                    <FaRegUser  />
                    <h3>Información del Cliente</h3>
                  </div>
                  <div className="Detall-Notif-cliente-lista">
                    <div className="Detall-Notif-cliente-lista-item">
                      <div className="Detall-Notif-cliente-lista-icon">
                        <FaRegUser  />
                      </div>
                      <div className="Detall-Notif-cliente-lista-content">
                        <span className="Detall-Notif-cliente-lista-label">Nombre</span>
                        <span className="Detall-Notif-cliente-lista-value">
                          {pedidoSeleccionado.cliente_nombre || 'No disponible'}
                        </span>
                      </div>
                    </div>
                    <div className="Detall-Notif-cliente-lista-item">
                      <div className="Detall-Notif-cliente-lista-icon">
                        <FiPhone />
                      </div>
                      <div className="Detall-Notif-cliente-lista-content">
                        <span className="Detall-Notif-cliente-lista-label">Teléfono</span>
                        <span className="Detall-Notif-cliente-lista-value">
                          {pedidoSeleccionado.cliente_telefono || 'No disponible'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* COLUMNA DERECHA - Más grande */}
              <div className="Detall-Notif-pedido-columna-derecha">
                
                {/* Detalles del pedido - Icono decorativo */}
                <div className="Detall-Notif-detalles-section">
                  <div className="Detall-Notif-section-title">
                    <AiOutlineShoppingCart />
                    <h3>Detalles del Pedido</h3>
                  </div>
                  
                  {/* Tipo de pedido */}
                  <div className="Detall-Notif-tipo-pedido-card">
                    <span className="Detall-Notif-tipo-label">Tipo de pedido</span>
                    <span className="Detall-Notif-tipo-value">
                      {(pedidoSeleccionado.orden?.tipo_pedido || pedidoSeleccionado.tipo_pedido) === 'suplemento' ? 'Suplemento' : 
                       (pedidoSeleccionado.orden?.tipo_pedido || pedidoSeleccionado.tipo_pedido) === 'carrito' ? 'Carrito' : 
                       (pedidoSeleccionado.orden?.tipo_pedido || pedidoSeleccionado.tipo_pedido) || 'No especificado'}
                    </span>
                  </div>

                  {/* 🔴 SECCIÓN DE PRODUCTOS MODIFICADA */}
                  <div className="Detall-Notif-productos-section">
                    <div className="Detall-Notif-productos-titulo">
                      {esSuplemento ? 'Producto del pedido' : 'Productos del carrito'}
                    </div>
                    <div className="Detall-Notif-tabla-productos-container">
                      <table className="Detall-Notif-tabla-productos">
                        <thead>
                          <tr>
                            <th className="Detall-Notif-th-producto">Producto</th>
                            <th className="Detall-Notif-th-cantidad">Cantidad</th>
                            <th className="Detall-Notif-th-precio">Precio</th>
                          </tr>
                        </thead>
                        <tbody>
                          {esSuplemento ? (
                            // 🔴 NUEVO: Mostrar el suplemento como una fila en la tabla
                            <tr>
                              <td className="Detall-Notif-producto-nombre-tabla">{suplementoData.nombre}</td>
                              <td className="Detall-Notif-producto-cantidad-tabla">x{suplementoData.cantidad}</td>
                              <td className="Detall-Notif-producto-precio-tabla">
                                ${(suplementoData.precio * suplementoData.cantidad).toFixed(2)}
                              </td>
                            </tr>
                          ) : (
                            // Mostrar los productos del carrito
                            renderProductosTabla(
                              pedidoSeleccionado.orden?.pedido_json || 
                              pedidoSeleccionado.pedido_json
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 🔴 DIRECCIÓN DE ENTREGA - Sin cambios */}
                  {(pedidoSeleccionado.direccion || pedidoSeleccionado.orden?.direccion) && (
                    <>
                      <div className="Detall-Notif-section-title">
                        <IoLocationOutline />
                        <h3>Dirección de entrega</h3>
                      </div>
                      <div className="Detall-Notif-direccion-card">
                        {pedidoSeleccionado.direccion || pedidoSeleccionado.orden?.direccion}
                      </div>
                    </>
                  )}

                  {/* 🔴 NOTAS DEL PEDIDO - Ahora SOLO muestra notas reales, no el producto */}
                  {(pedidoSeleccionado.notas || pedidoSeleccionado.orden?.notas) && (
                    <>
                      <div className="Detall-Notif-section-title">
                        <MdOutlineStickyNote2 />
                        <h3>Notas del pedido</h3>
                      </div>
                      <div className="Detall-Notif-notas-card">
                        {pedidoSeleccionado.notas || pedidoSeleccionado.orden?.notas}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="Detall-Notif-pedido-error">
              <p>Error al cargar la información.</p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="Detall-Notif-modal-footer">
          <button onClick={onClose} className="Detall-Notif-btn-cerrar-modal">Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default PedidoModal;