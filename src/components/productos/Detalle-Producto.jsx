import React from 'react';
import '../../css/Productos/detalle-producto.css';

const ModalDetalleProducto = ({ 
  show, 
  onClose, 
  producto, 
  onAddToCart, 
  onBuyNow,
  darkMode 
}) => {
  if (!show || !producto) return null;

  // Función para formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price || 0);
  };

  // Función para obtener nombre legible de categoría
  const obtenerNombreCategoria = (categoriaId) => {
    const categoriaMap = {
      'quemadores': 'Quemadores de Grasa',
      'proteinas': 'Proteínas',
      'fibras': 'Fibras y Digestivos',
      'detox': 'Detox y Limpieza',
      'termogenicos': 'Termogénicos',
      'control_apetito': 'Control de Apetito',
      'energeticos': 'Energéticos Naturales',
      'vitaminas': 'Vitaminas y Minerales'
    };
    return categoriaMap[categoriaId] || categoriaId;
  };

  // Función para obtener nombre legible de presentación
  const obtenerNombrePresentacion = (presentacionId) => {
    const presentacionMap = {
      'polvo': 'Polvo',
      'capsulas': 'Cápsulas',
      'tableta': 'Tableta',
      'liquido': 'Líquido',
      'gomitas': 'Gomitas',
      'barritas': 'Barritas'
    };
    return presentacionMap[presentacionId] || presentacionId;
  };

  return (
    <div className={`modal-overlay-producto ${darkMode ? 'dark-mode' : ''}`} onClick={onClose}>
      <div className="modal-content product-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>×</button>
        
        <div className="product-modal-grid">
          {/* Lado Izquierdo - Imagen con cuadro */}
          <div className="product-modal-left">
            <div className="product-modal-image-container">
              <img 
                src={producto.icono} 
                alt={producto.nombre} 
                className="product-modal-image"
              />
            </div>
            <div className="product-modal-price">
              {formatPrice(producto.precio)}
            </div>
          </div>

          {/* Lado Derecho - Información */}
          <div className="product-modal-right">
            <h2 className="product-modal-title">{producto.nombre}</h2>
            
            {/* Categoría y Presentación */}
            <div className="product-modal-info">
              <span className="product-modal-categoria">
                {obtenerNombreCategoria(producto.categoria)}
              </span>
              <span className="product-modal-presentacion">
                {obtenerNombrePresentacion(producto.presentacion)}
              </span>
            </div>

            {/* Stock */}
            <div className="product-modal-stock">
              <span className={`stock-badge ${producto.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                {producto.stock > 0 ? `Stock disponible: ${producto.stock} unidades` : 'Agotado'}
              </span>
            </div>

            {/* Descripción */}
            {producto.descripcion && (
              <div className="product-modal-descripcion">
                <h3>Descripción</h3>
                <p>{producto.descripcion}</p>
              </div>
            )}

            {/* Beneficios */}
            {producto.beneficios && (
              <div className="product-modal-beneficios">
                <h3>Beneficios</h3>
                <p>{producto.beneficios}</p>
              </div>
            )}

            {/* Modo de Uso */}
            {producto.modo_uso && (
              <div className="product-modal-modo-uso">
                <h3>Modo de Uso</h3>
                <p>{producto.modo_uso}</p>
              </div>
            )}

            {/* Ingredientes */}
            {producto.ingredientes && (
              <div className="product-modal-ingredientes">
                <h3>Ingredientes</h3>
                <p>{producto.ingredientes}</p>
              </div>
            )}

            {/* Advertencias */}
            {producto.advertencias && (
              <div className="product-modal-advertencias">
                <h3>Advertencias</h3>
                <p>{producto.advertencias}</p>
              </div>
            )}

            {/* Botones de acción */}
            <div className="product-modal-actions">
              <button 
                className="product-modal-btn add-to-cart"
                onClick={() => onAddToCart(producto)}
                disabled={producto.stock === 0}
              >
                Agregar al Carrito
              </button>
              <button 
                className="product-modal-btn buy-now"
                onClick={() => onBuyNow(producto)}
                disabled={producto.stock === 0}
              >
                Comprar Ahora
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalDetalleProducto;