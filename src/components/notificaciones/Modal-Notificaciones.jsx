import React from 'react';
import '../../css/Notificaciones/modal_detalle_pedido.css';

const PedidoModal = ({ show, onClose, pedidoSeleccionado, modalLoading, darkMode }) => {
  if (!show) return null;

  const renderProductosCarrito = (pedidoJson) => {
    try {
      let items = [];
      let pedidoData = pedidoJson;
      
      // Si es string, parsearlo
      if (typeof pedidoData === 'string') {
        pedidoData = JSON.parse(pedidoData);
      }
      
      // Verificar la estructura similar al segundo componente
      if (Array.isArray(pedidoData)) {
        // Estructura directa: [item1, item2, ...]
        items = pedidoData;
      } else if (pedidoData.items && Array.isArray(pedidoData.items)) {
        // Estructura con items: { items: [...] }
        items = pedidoData.items;
      } else if (pedidoData.item && Array.isArray(pedidoData.item)) {
        // Estructura con item
        items = pedidoData.item;
      } else {
        console.log('Estructura de pedido_json:', pedidoData);
        return <p className="no-productos">No se pudieron cargar los productos</p>;
      }
      
      if (items.length > 0) {
        return items.map((item, index) => (
          <div key={index} className="carrito-item">
            <span className="item-nombre">{item.nombre || item.nombre_producto || 'Producto'}</span>
            <span className="item-cantidad">x{item.cantidad || 1}</span>
            <span className="item-precio">
              ${((item.precio_unitario || item.precio || 0) * (item.cantidad || 1)).toFixed(2)}
            </span>
          </div>
        ));
      } else {
        return <p className="no-productos">No hay productos en este pedido</p>;
      }
    } catch (e) {
      console.error('Error parseando pedido_json:', e);
      return <p className="no-productos">Error al cargar los productos</p>;
    }
  };

  // Renderizar mensaje simple
  const renderMensajeSimple = () => {
    return (
      <div className="mensaje-simple-container">
        <div className="mensaje-simple-header">
          <div className="mensaje-titulo">
            <h4>{pedidoSeleccionado.titulo}</h4>
          </div>
          <div className="mensaje-fecha">
            <span className="fecha-label">Fecha:</span>
            <span className="fecha-value">{pedidoSeleccionado.fecha}</span>
          </div>
        </div>
        
        <div className="mensaje-simple-contenido">
          <div className="mensaje-contenido">
            <p>{pedidoSeleccionado.mensaje}</p>
          </div>
        </div>
        
        {pedidoSeleccionado.notificacion?.metadata?.remitente && (
          <div className="mensaje-remitente">
            <span className="remitente-label">De:</span>
            <span className="remitente-value">{pedidoSeleccionado.notificacion.metadata.remitente}</span>
          </div>
        )}
      </div>
    );
  };

  // Renderizar pedido
  const renderPedido = () => {
    return (
      <>
        <div className="pedido-codigo-container">
          <div className="pedido-codigo-label">Código del Pedido:</div>
          <div className="pedido-codigo-value">
            #{pedidoSeleccionado.codigoPedido || pedidoSeleccionado.codigo_unico || "N/A"}
          </div>
        </div>
        
        <div className="pedido-info-grid">
          <div className="pedido-info-item">
            <span className="pedido-info-label">Fecha:</span>
            <span className="pedido-info-value">{pedidoSeleccionado.fecha}</span>
          </div>
          
          <div className="pedido-info-item">
            <span className="pedido-info-label">Estado:</span>
            <span className="pedido-info-value estado-pedido">
              {pedidoSeleccionado.estado}
            </span>
          </div>
          
          {(pedidoSeleccionado.precio > 0 || pedidoSeleccionado.precio_total > 0) && (
            <div className="pedido-info-item">
              <span className="pedido-info-label">Total:</span>
              <span className="pedido-info-value precio">
                ${parseFloat(pedidoSeleccionado.precio || pedidoSeleccionado.precio_total || 0).toFixed(2)}
              </span>
            </div>
          )}
          
          {pedidoSeleccionado.metodo_pago && (
            <div className="pedido-info-item">
              <span className="pedido-info-label">Método de pago:</span>
              <span className="pedido-info-value">
                {pedidoSeleccionado.metodo_pago === 'efectivo' ? '💵 Efectivo' : 
                 pedidoSeleccionado.metodo_pago === 'tarjeta' ? '💳 Tarjeta' : 
                 pedidoSeleccionado.metodo_pago}
              </span>
            </div>
          )}
        </div>

        <div className="pedido-cliente-info">
          <h4>Información del Cliente</h4>
          <div className="pedido-info-grid">
            <div className="pedido-info-item">
              <span className="pedido-info-label">Nombre:</span>
              <span className="pedido-info-value">
                {pedidoSeleccionado.cliente_nombre || 'No disponible'}
              </span>
            </div>
            {pedidoSeleccionado.cliente_telefono && (
              <div className="pedido-info-item">
                <span className="pedido-info-label">Teléfono:</span>
                <span className="pedido-info-value">{pedidoSeleccionado.cliente_telefono}</span>
              </div>
            )}
          </div>
        </div>

        <div className="pedido-detalles">
          <h4>Detalles del Pedido</h4>
          
          {/* Verificar si existe orden o si los datos están directamente en pedidoSeleccionado */}
          {(pedidoSeleccionado.orden || pedidoSeleccionado.tipo_pedido) ? (
            <>
              <div className="pedido-detalle-item">
                <strong>Tipo de Pedido:</strong>
                <span className="pedido-tipo-badge">
                  {(pedidoSeleccionado.orden?.tipo_pedido || pedidoSeleccionado.tipo_pedido) === 'suplemento' ? 'Suplemento' : 
                   (pedidoSeleccionado.orden?.tipo_pedido || pedidoSeleccionado.tipo_pedido) === 'carrito' ? 'Carrito' : 
                   (pedidoSeleccionado.orden?.tipo_pedido || pedidoSeleccionado.tipo_pedido) || 'No especificado'}
                </span>
              </div>

              {/* Caso de suplemento */}
              {((pedidoSeleccionado.orden?.tipo_pedido === 'suplemento' && pedidoSeleccionado.orden?.suplemento) ||
                (pedidoSeleccionado.tipo_pedido === 'suplemento' && pedidoSeleccionado.suplemento)) && (
                <div className="pedido-producto-info">
                  <strong>Producto:</strong>
                  <div className="producto-detalle">
                    <span className="producto-nombre">
                      {pedidoSeleccionado.orden?.suplemento?.nombre || 
                       pedidoSeleccionado.suplemento?.nombre || 
                       'Producto'}
                    </span>
                    {(pedidoSeleccionado.orden?.cantidad || pedidoSeleccionado.cantidad) && (
                      <span className="producto-cantidad">
                        Cantidad: {pedidoSeleccionado.orden?.cantidad || pedidoSeleccionado.cantidad}
                      </span>
                    )}
                    {(pedidoSeleccionado.orden?.precio_unitario || pedidoSeleccionado.precio_unitario) && (
                      <span className="producto-precio-unitario">
                        Precio unitario: ${(pedidoSeleccionado.orden?.precio_unitario || pedidoSeleccionado.precio_unitario || 0).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Caso de carrito */}
              {((pedidoSeleccionado.orden?.tipo_pedido === 'carrito' && pedidoSeleccionado.orden?.pedido_json) ||
                (pedidoSeleccionado.tipo_pedido === 'carrito' && pedidoSeleccionado.pedido_json)) && (
                <div className="pedido-carrito-items">
                  <strong>Productos en el carrito:</strong>
                  <div className="carrito-items-list">
                    {renderProductosCarrito(
                      pedidoSeleccionado.orden?.pedido_json || 
                      pedidoSeleccionado.pedido_json
                    )}
                  </div>
                </div>
              )}

              {(pedidoSeleccionado.direccion || pedidoSeleccionado.orden?.direccion) && (
                <div className="pedido-direccion">
                  <strong>Dirección de entrega:</strong>
                  <p>{pedidoSeleccionado.direccion || pedidoSeleccionado.orden?.direccion}</p>
                </div>
              )}

              {(pedidoSeleccionado.notas || pedidoSeleccionado.orden?.notas) && (
                <div className="pedido-notas">
                  <strong>Notas del pedido:</strong>
                  <p>{pedidoSeleccionado.notas || pedidoSeleccionado.orden?.notas}</p>
                </div>
              )}
            </>
          ) : (
            <div className="pedido-no-detalles">
              <p>Información del pedido no disponible.</p>
              {pedidoSeleccionado.notificacion?.mensaje && (
                <div className="pedido-mensaje">
                  <strong>Mensaje:</strong>
                  <p>{pedidoSeleccionado.notificacion.mensaje}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div className={`modal-overlay-pedido ${darkMode ? 'dark-mode' : ''}`} onClick={onClose}>
      <div className="modal-content large-modal pedido-modal" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <h3>
            {pedidoSeleccionado?.tipo === 'mensaje' ? 'Mensaje del Administrador' : 'Detalles del Pedido'}
          </h3>
          <button className="close-modal" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          {modalLoading ? (
            <div className="pedido-loading">
              <div className="loading-spinner small"></div>
              <p>Cargando información...</p>
            </div>
          ) : pedidoSeleccionado ? (
            pedidoSeleccionado.tipo === 'mensaje' ? renderMensajeSimple() : renderPedido()
          ) : (
            <div className="pedido-error">
              <p>Error al cargar la información.</p>
              <button onClick={onClose} className="pedido-btn-cerrar">Cerrar</button>
            </div>
          )}
        </div>
        
        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-secondary">Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default PedidoModal;