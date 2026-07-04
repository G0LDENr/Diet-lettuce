import React from 'react';
import '../../css/Productos/detalle-producto.css';
import { FiShoppingCart } from 'react-icons/fi';
import { FiShoppingBag } from 'react-icons/fi';
import { GrDocumentText } from 'react-icons/gr';
import { FaRegStar } from 'react-icons/fa';
import { RiCapsuleLine } from 'react-icons/ri';
import { FiFileText } from 'react-icons/fi';
import { FiAlertTriangle } from 'react-icons/fi';

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

  // Función para formatear beneficios como lista - eliminando viñetas existentes
  const formatearBeneficios = (beneficios) => {
    if (!beneficios) return null;
    // Dividir por saltos de línea, comas, puntos y viñetas comunes
    const items = beneficios.split(/\n|,|•|●|○|▪|▫|➢|➤|·|\*|-/).filter(item => item.trim());
    return items;
  };

  return (
    <div className={`detalle-prod-overlay ${darkMode ? 'dark-mode' : ''}`} onClick={onClose}>
      <div className="detalle-prod-modal" onClick={(e) => e.stopPropagation()}>
        <button className="detalle-prod-close-btn" onClick={onClose}>×</button>
        
        <div className="detalle-prod-grid">
          {/* Lado Izquierdo - Imagen con cuadro y precio dentro */}
          <div className="detalle-prod-left">
            <div className="detalle-prod-image-container">
              <img 
                src={producto.icono} 
                alt={producto.nombre} 
                className="detalle-prod-image"
              />
              {/* Precio dentro del cuadro de la imagen - con etiqueta "Precio:" */}
              <div className="detalle-prod-price-overlay">
                <span className="detalle-prod-price-label">Precio:</span>
                <span className="detalle-prod-price-value">{formatPrice(producto.precio)}</span>
              </div>
            </div>
          </div>

          {/* Lado Derecho - Información con botones abajo */}
          <div className="detalle-prod-right">
            <div className="detalle-prod-right-content">
              <h2 className="detalle-prod-title">{producto.nombre}</h2>
              
              {/* Categoría y Presentación */}
              <div className="detalle-prod-info">
                <span className="detalle-prod-categoria">
                  {obtenerNombreCategoria(producto.categoria)}
                </span>
                <span className="detalle-prod-presentacion">
                  {obtenerNombrePresentacion(producto.presentacion)}
                </span>
              </div>

              {/* Stock */}
              <div className="detalle-prod-stock">
                <span className={`detalle-prod-stock-badge ${producto.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                  {producto.stock > 0 ? `Disponible: ${producto.stock} und` : 'Agotado'}
                </span>
              </div>

              {/* Descripción */}
              {producto.descripcion && (
                <div className="detalle-prod-section detalle-prod-descripcion">
                  <div className="detalle-prod-section-divider"></div>
                  <div className="detalle-prod-section-header">
                    <GrDocumentText className="detalle-prod-section-icon" />
                    <h3>Descripción</h3>
                  </div>
                  <p>{producto.descripcion}</p>
                </div>
              )}

              {/* Beneficios - como lista de dos filas sin viñetas duplicadas */}
              {producto.beneficios && (
                <div className="detalle-prod-section detalle-prod-beneficios">
                  <div className="detalle-prod-section-divider"></div>
                  <div className="detalle-prod-section-header">
                    <FaRegStar className="detalle-prod-section-icon" />
                    <h3>Beneficios</h3>
                  </div>
                  <ul className="detalle-prod-beneficios-list">
                    {formatearBeneficios(producto.beneficios).map((beneficio, index) => (
                      <li key={index}>{beneficio.trim()}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Modo de Uso */}
              {producto.modo_uso && (
                <div className="detalle-prod-section detalle-prod-modo-uso">
                  <div className="detalle-prod-section-divider"></div>
                  <div className="detalle-prod-section-header">
                    <RiCapsuleLine className="detalle-prod-section-icon" />
                    <h3>Modo de Uso</h3>
                  </div>
                  <p>{producto.modo_uso}</p>
                </div>
              )}

              {/* Ingredientes */}
              {producto.ingredientes && (
                <div className="detalle-prod-section detalle-prod-ingredientes">
                  <div className="detalle-prod-section-divider"></div>
                  <div className="detalle-prod-section-header">
                    <FiFileText className="detalle-prod-section-icon" />
                    <h3>Ingredientes</h3>
                  </div>
                  <p>{producto.ingredientes}</p>
                </div>
              )}

              {/* Advertencias */}
              {producto.advertencias && (
                <div className="detalle-prod-section detalle-prod-advertencias">
                  <div className="detalle-prod-section-divider"></div>
                  <div className="detalle-prod-section-header">
                    <FiAlertTriangle className="detalle-prod-section-icon" />
                    <h3>Advertencias</h3>
                  </div>
                  <p>{producto.advertencias}</p>
                </div>
              )}
            </div>

            {/* Botones de acción - Abajo de la información del lado derecho */}
            <div className="detalle-prod-actions">
              <button 
                className="detalle-prod-btn add-to-cart"
                onClick={() => onAddToCart(producto)}
                disabled={producto.stock === 0}
              >
                <FiShoppingCart className="detalle-prod-btn-icon" />
                Agregar al Carrito
              </button>
              <button 
                className="detalle-prod-btn buy-now"
                onClick={() => onBuyNow(producto)}
                disabled={producto.stock === 0}
              >
                <FiShoppingBag className="detalle-prod-btn-icon" />
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