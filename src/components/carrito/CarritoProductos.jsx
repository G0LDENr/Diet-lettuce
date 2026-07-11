import React from 'react';
import '../../css/Carrito/carrito-productos.css';
import { FaTrashAlt } from 'react-icons/fa';

// Íconos
import suplementoGenericoIcon from '../../img/Icon-Shop.png';

const CarritoProductos = ({ 
  carritoItems, 
  actualizarCantidad, 
  eliminarDelCarrito,
  vaciarCarrito,
  formatPrice 
}) => {
  return (
    <div className="carrito-product-section">
      <div className="carrito-product-header">
        <h3>Suplementos en el Carrito</h3>
        <button 
          onClick={vaciarCarrito}
          className="carrito-product-vaciar-btn"
        >
          <FaTrashAlt className="carrito-product-icon-img" style={{ color: '#e53e3e' }} />
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
                  <div className="carrito-product-titulo">
                    <h4 className="carrito-product-nombre">{item.nombre}</h4>
                    <span className="carrito-product-categoria">{item.categoria || 'Suplemento'}</span>
                  </div>
                  <button 
                    onClick={() => eliminarDelCarrito(item.id)}
                    className="carrito-product-eliminar-btn"
                    title="Eliminar producto"
                  >
                    <FaTrashAlt className="carrito-product-icon-eliminar" />
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
                  
                  <div className="carrito-product-precio-subtotal">
                    <strong>{formatPrice(item.precio * item.cantidad)}</strong>
                  </div>
                </div>
              </div>
            </div>
            {index < carritoItems.length - 1 && <hr className="carrito-product-divisor" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CarritoProductos;