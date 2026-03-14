import React from 'react';
import '../../css/Notificaciones/modal_detalle_pedido.css';

const PedidoModal = ({ show, onClose, pedidoSeleccionado, modalLoading, darkMode }) => {
  if (!show) return null;

  const renderProductosCarrito = (pedidoJson) => {
    try {
      const items = typeof pedidoJson === 'string' ? JSON.parse(pedidoJson) : pedidoJson;
      if (Array.isArray(items)) {
        return items.map((item, index) => (
          <div key={index} className="carrito-item">
            <span className="item-nombre">{item.nombre || 'Producto'}</span>
            <span className="item-cantidad">x{item.cantidad || 1}</span>
            <span className="item-precio">
              ${((item.precio_unitario || 0) * (item.cantidad || 1)).toFixed(2)}
            </span>
          </div>
        ));
      }
    } catch (e) {
      console.error('Error parseando pedido_json:', e);
    }
    return <p>No se pudieron cargar los productos</p>;
  };

  return (
    <div className="modal-overlay-pedido" onClick={onClose}>
      <div className="modal-content large-modal pedido-modal" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <h3>Detalles del Pedido</h3>
          <button className="close-modal" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          {modalLoading ? (
            <div className="pedido-loading">
              <div className="loading-spinner small"></div>
              <p>Cargando información del pedido...</p>
            </div>
          ) : pedidoSeleccionado ? (
            <>
              <div className="pedido-codigo-container">
                <div className="pedido-codigo-label">Código del Pedido:</div>
                <div className="pedido-codigo-value">
                  #{pedidoSeleccionado.codigoPedido || "N/A"}
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
                
                {pedidoSeleccionado.precio > 0 && (
                  <div className="pedido-info-item">
                    <span className="pedido-info-label">Total:</span>
                    <span className="pedido-info-value precio">
                      ${parseFloat(pedidoSeleccionado.precio).toFixed(2)}
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
                
                {pedidoSeleccionado.orden ? (
                  <>
                    <div className="pedido-detalle-item">
                      <strong>Tipo de Pedido:</strong>
                      <span className="pedido-tipo-badge">
                        {pedidoSeleccionado.orden.tipo_pedido === 'suplemento' ? 'Suplemento' : 
                         pedidoSeleccionado.orden.tipo_pedido === 'carrito' ? 'Carrito' : 
                         pedidoSeleccionado.orden.tipo_pedido || 'No especificado'}
                      </span>
                    </div>

                    {pedidoSeleccionado.orden.suplemento && (
                      <div className="pedido-producto-info">
                        <strong>Producto:</strong>
                        <div className="producto-detalle">
                          <span className="producto-nombre">{pedidoSeleccionado.orden.suplemento.nombre}</span>
                          {pedidoSeleccionado.orden.cantidad && (
                            <span className="producto-cantidad">Cantidad: {pedidoSeleccionado.orden.cantidad}</span>
                          )}
                          {pedidoSeleccionado.orden.precio_unitario && (
                            <span className="producto-precio-unitario">
                              Precio unitario: ${pedidoSeleccionado.orden.precio_unitario.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {pedidoSeleccionado.orden.tipo_pedido === 'carrito' && 
                     pedidoSeleccionado.orden.pedido_json && (
                      <div className="pedido-carrito-items">
                        <strong>Productos en el carrito:</strong>
                        <div className="carrito-items-list">
                          {renderProductosCarrito(pedidoSeleccionado.orden.pedido_json)}
                        </div>
                      </div>
                    )}

                    {pedidoSeleccionado.direccion && (
                      <div className="pedido-direccion">
                        <strong>Dirección de entrega:</strong>
                        <p>{pedidoSeleccionado.direccion}</p>
                      </div>
                    )}

                    {pedidoSeleccionado.orden.notas && (
                      <div className="pedido-notas">
                        <strong>Notas del pedido:</strong>
                        <p>{pedidoSeleccionado.orden.notas}</p>
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
          ) : (
            <div className="pedido-error">
              <p>Error al cargar los detalles del pedido.</p>
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