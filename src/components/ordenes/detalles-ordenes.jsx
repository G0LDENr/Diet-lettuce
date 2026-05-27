import React from 'react';
import '../../css/Ordenes/detalles-ordenes.css';

const ModalDetallePedido = ({ orden, onClose }) => {
  if (!orden) return null;

  let items = [];
  
  try {
    if (orden.pedido_json) {
      let pedidoData = orden.pedido_json;
      
      // Si es string, parsearlo
      if (typeof pedidoData === 'string') {
        pedidoData = JSON.parse(pedidoData);
      }
      
      // Verificar la estructura
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
      }
    }
  } catch (error) {
    console.error('Error al parsear pedido_json:', error);
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price || 0);
  };

  // Calcular subtotal de cada item si no viene
  const calcularSubtotal = (item) => {
    if (item.subtotal) return item.subtotal;
    return (item.precio_unitario || item.precio || 0) * (item.cantidad || 1);
  };

  return (
    <div className="modal-detalle-overlay">
      <div className="modal-detalle-content">
        <div className="modal-detalle-header">
          <h3>Productos del Pedido #{orden.codigo_unico}</h3>
          <button className="modal-detalle-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-detalle-body">
          {/* SOLO PRODUCTOS DEL CARRITO */}
          <div className="detalle-seccion">
            <div className="productos-lista">
              {items.length > 0 ? (
                items.map((item, index) => (
                  <div key={index} className="producto-detalle-item">
                    <div className="producto-detalle-header">
                      <span className="producto-detalle-nombre">{item.nombre || item.nombre_producto || 'Producto'}</span>
                      <span className="producto-detalle-cantidad">x{item.cantidad || 1}</span>
                    </div>
                    <div className="producto-detalle-precios">
                      <span className="producto-detalle-precio-unitario">
                        {formatPrice(item.precio_unitario || item.precio || 0)} c/u
                      </span>
                      <span className="producto-detalle-subtotal">
                        {formatPrice(calcularSubtotal(item))}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-productos">
                  <p>No hay productos en este pedido</p>
                  <p className="detalle-info">ID de pedido: {orden.id}</p>
                  <p className="detalle-info">Tipo: {orden.tipo_pedido}</p>
                  {orden.suplemento_id && (
                    <p className="detalle-info">Suplemento ID: {orden.suplemento_id}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-detalle-footer">
          <div className="total-container">
            <span className="total-label">Total:</span>
            <span className="total-valor">{formatPrice(orden.precio_total || orden.precio || 0)}</span>
          </div>
          <button className="btn-cerrar" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetallePedido;