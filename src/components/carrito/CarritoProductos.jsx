import React from 'react';
import '../../css/Carrito/carrito-productos.css';

// Íconos
import trashIcon from '../../img/delete.png';
import deleteIcon from '../../img/delete.png';
import suplementoGenericoIcon from '../../img/Icon-Shop.png';
import arrowRightIcon from '../../img/derecha.png';

const CarritoProductos = ({ 
  carritoItems, 
  totalCarritoItems,
  actualizarCantidad, 
  eliminarDelCarrito,
  vaciarCarrito,
  calcularTotal,
  handleSiguientePaso,
  formatPrice 
}) => {
  const total = calcularTotal();

  return (
    <>
      {/* ===== SECCIÓN DE PRODUCTOS ===== */}
      <div className="carrito-product-section">
        <div className="carrito-product-header">
          <h3>Suplementos en el Carrito</h3>
          <button 
            onClick={vaciarCarrito}
            className="carrito-product-vaciar-btn"
          >
            <img src={trashIcon} alt="Vaciar" className="carrito-product-icon-img" />
            Vaciar Carrito
          </button>
        </div>
        
        <div className="carrito-product-list">
          {carritoItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <div className="carrito-product-card">
                <div className="carrito-product-imagen">
                  <img 
                    src={item.imagen || suplementoGenericoIcon} 
                    alt={item.nombre}
                    onError={(e) => {
                      e.target.src = suplementoGenericoIcon;
                    }}
                  />
                </div>
                
                <div className="carrito-product-info">
                  <div className="carrito-product-header-info">
                    <h4 className="carrito-product-nombre">{item.nombre}</h4>
                    <button 
                      onClick={() => eliminarDelCarrito(item.id)}
                      className="carrito-product-eliminar-btn"
                      title="Eliminar producto"
                    >
                      <img src={deleteIcon} alt="Eliminar" className="carrito-product-icon-img" />
                    </button>
                  </div>
                  
                  <div className="carrito-product-controls">
                    <div className="carrito-product-cantidad">
                      <label>Cantidad:</label>
                      <div className="carrito-product-cantidad-buttons">
                        <button 
                          onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                          className="carrito-product-cantidad-btn decrement"
                          disabled={item.cantidad <= 1}
                        >
                          −
                        </button>
                        <span className="carrito-product-cantidad-value">{item.cantidad}</span>
                        <button 
                          onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                          className="carrito-product-cantidad-btn increment"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    <div className="carrito-product-precios">
                      <div className="carrito-product-precio-unitario">
                        {formatPrice(item.precio)} c/u
                      </div>
                      <div className="carrito-product-precio-subtotal">
                        <strong>{formatPrice(item.precio * item.cantidad)}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {index < carritoItems.length - 1 && <hr className="carrito-product-divisor" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ===== RESUMEN DEL PEDIDO ===== */}
      <div className="carrito-product-resumen-section">
        <div className="carrito-product-resumen-card">
          <div className="carrito-product-resumen-header">
            <h3>Resumen del Pedido</h3>
          </div>
          
          <div className="carrito-product-resumen-detalle">
            <div className="carrito-product-resumen-row">
              <span>Suplementos ({totalCarritoItems})</span>
              <span>{formatPrice(total)}</span>
            </div>
            
            <div className="carrito-product-resumen-row envio">
              <span>Costo de envío</span>
              <span className="carrito-product-envio-gratis">Gratis</span>
            </div>
            
            <div className="carrito-product-resumen-separador"></div>
            
            <div className="carrito-product-resumen-row total">
              <strong>Total a pagar</strong>
              <strong className="carrito-product-total-precio">{formatPrice(total)}</strong>
            </div>
          </div>
          
          <div className="carrito-product-resumen-acciones">
            <button 
              onClick={handleSiguientePaso}
              className="carrito-product-procesar-btn"
              disabled={carritoItems.length === 0}
            >
              Continuar con el Pedido
              <img src={arrowRightIcon} alt="Siguiente" className="carrito-product-btn-icon-right" />
            </button>
            
            <div className="carrito-product-beneficios">
              <p className="carrito-product-beneficio">
                <span className="carrito-product-check-icon">✓</span> Envío gratis
              </p>
              <p className="carrito-product-beneficio">
                <span className="carrito-product-check-icon">✓</span> Entrega garantizada en 48-72 horas
              </p>
              <p className="carrito-product-beneficio">
                <span className="carrito-product-check-icon">✓</span> Paga en efectivo o tarjeta
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CarritoProductos;