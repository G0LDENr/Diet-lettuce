// pages/Productos.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../../context/config';
import { HiMiniUserCircle } from "react-icons/hi2";
import { IoNotificationsCircle } from "react-icons/io5";
import { FaShoppingCart } from "react-icons/fa";
import '../../css/Productos/productos.css';
import '../../css/Productos/carrito.css';

import logo from '../../img/DietLettuce.png';
// Íconos para categorías de suplementos
import quemadorIcon from '../../img/quemador.png';
import proteinaIcon from '../../img/suplemento.png';
import fibraIcon from '../../img/fibra.png';
import detoxIcon from '../../img/detox.png';
import termogenicoIcon from '../../img/termogenico.png';
import controlApetitoIcon from '../../img/control-apetito.png';
import energeticoIcon from '../../img/energetico.png';
import vitaminasIcon from '../../img/multivitamina.png';
import suplementoGenericoIcon from '../../img/suplemento.png';
import searchIcon from '../../img/search.png';

import ComprarProductoModal from './comprar-producto';

const Productos = () => {
  const navigate = useNavigate();
  const { t, darkMode } = useConfig();
  
  // ========== ESTADOS PARA PRODUCTOS ==========
  const [productos, setProductos] = useState([]);
  const [productosPopulares, setProductosPopulares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todos');
  const [presentacionSeleccionada, setPresentacionSeleccionada] = useState('todas');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showComprarModal, setShowComprarModal] = useState(false);
  const [productoParaComprar, setProductoParaComprar] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [presentaciones, setPresentaciones] = useState([]);
  const productosPerPage = 9;

  // Función para obtener icono según categoría de suplemento
  const obtenerIconoPorCategoria = (categoria) => {
    // Normalizar: convertir a minúsculas y quitar espacios extras
    const cat = (categoria || '').toLowerCase().trim();
    
    switch(cat) {
      case 'quemadores':
      case 'quemadores de grasa':
        return quemadorIcon;
      case 'proteinas':
      case 'proteína':
        return proteinaIcon;
      case 'fibras':
      case 'fibras y digestivos':
        return fibraIcon;
      case 'detox':
      case 'detox y limpieza':
        return detoxIcon;
      case 'termogenicos':
      case 'termogénicos':
        return termogenicoIcon;
      case 'control_apetito':
      case 'control de apetito':
        return controlApetitoIcon;
      case 'energeticos':
      case 'energeticos naturales':
        return energeticoIcon;
      case 'vitaminas':
      case 'vitaminas y minerales':
        return vitaminasIcon;
      default:
        return suplementoGenericoIcon;
    }
  };

  // Función para obtener nombre legible de categoría
  const obtenerNombreCategoria = (categoriaId) => {
    // Mapeo directo de IDs a nombres
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
    // Mapeo directo de IDs a nombres
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

  // ========== ESTADOS PARA CARRITO ==========
  const [carritoCount, setCarritoCount] = useState(0);
  const [animarCarrito, setAnimarCarrito] = useState(false);

  // ========== FUNCIONES DEL CARRITO ==========
  const carritoKey = 'carrito_suplementos';

  const getCarritoFromStorage = () => {
    try {
      const carritoStr = localStorage.getItem(carritoKey);
      return carritoStr ? JSON.parse(carritoStr) : [];
    } catch (error) {
      console.error('Error al cargar carrito:', error);
      return [];
    }
  };

  const saveCarritoToStorage = (carrito) => {
    try {
      localStorage.setItem(carritoKey, JSON.stringify(carrito));
    } catch (error) {
      console.error('Error al guardar carrito:', error);
    }
  };

  const updateCarritoCount = () => {
    const carrito = getCarritoFromStorage();
    const total = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);
    setCarritoCount(total);
  };

  const agregarAlCarrito = (producto, cantidad = 1) => {
    const carrito = getCarritoFromStorage();
    const productoExistente = carrito.find(item => item.id === producto.id);
    
    if (productoExistente) {
      productoExistente.cantidad += cantidad;
    } else {
      carrito.push({
        id: producto.id,
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        precio: producto.precio || 0,
        presentacion: producto.presentacion || 'polvo',
        presentacion_nombre: obtenerNombrePresentacion(producto.presentacion),
        categoria: producto.categoria || 'quemadores',
        categoria_nombre: obtenerNombreCategoria(producto.categoria),
        stock: producto.stock || 0,
        imagen: producto.icono || suplementoGenericoIcon,
        cantidad: cantidad,
        fechaAgregado: new Date().toISOString()
      });
    }
    
    saveCarritoToStorage(carrito);
    updateCarritoCount();
    setAnimarCarrito(true);
    setTimeout(() => setAnimarCarrito(false), 500);
    
    return carrito;
  };

  const handleGoToCarrito = () => {
    navigate('/carrito');
  };

  // ========== FUNCIONES DE AUTENTICACIÓN ==========
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userData');
    navigate('/');
    window.location.reload();
  };

  // ========== FUNCIONES PARA OBTENER SUPLEMENTOS ==========
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (token) {
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    }
    return {
      'Content-Type': 'application/json'
    };
  };

  // Obtener categorías del backend
  const fetchCategorias = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/suplementos/categorias', {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        // Mantener las categorías con sus IDs originales
        setCategorias([
          { id: 'todos', nombre: 'Todas las categorías' },
          ...data.categorias
        ]);
      }
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      // Fallback a categorías por defecto con los IDs correctos
      setCategorias([
        { id: 'todos', nombre: 'Todas las categorías' },
        { id: 'quemadores', nombre: 'Quemadores de Grasa' },
        { id: 'proteinas', nombre: 'Proteínas' },
        { id: 'fibras', nombre: 'Fibras y Digestivos' },
        { id: 'detox', nombre: 'Detox y Limpieza' },
        { id: 'termogenicos', nombre: 'Termogénicos' },
        { id: 'control_apetito', nombre: 'Control de Apetito' },
        { id: 'energeticos', nombre: 'Energéticos Naturales' },
        { id: 'vitaminas', nombre: 'Vitaminas y Minerales' }
      ]);
    }
  };

  // Obtener presentaciones del backend
  const fetchPresentaciones = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/suplementos/presentaciones', {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        // Mantener las presentaciones con sus IDs originales
        setPresentaciones([
          { id: 'todas', nombre: 'Todas las presentaciones' },
          ...data.presentaciones
        ]);
      }
    } catch (error) {
      console.error('Error al obtener presentaciones:', error);
      // Fallback a presentaciones por defecto con los IDs correctos
      setPresentaciones([
        { id: 'todas', nombre: 'Todas las presentaciones' },
        { id: 'polvo', nombre: 'Polvo' },
        { id: 'capsulas', nombre: 'Cápsulas' },
        { id: 'tableta', nombre: 'Tableta' },
        { id: 'liquido', nombre: 'Líquido' },
        { id: 'gomitas', nombre: 'Gomitas' },
        { id: 'barritas', nombre: 'Barritas' }
      ]);
    }
  };

  const fetchProductosYPopulares = async () => {
    try {
      setLoading(true);
      
      // Obtener suplementos
      const productosResponse = await fetch('http://127.0.0.1:5000/suplementos/', {
        headers: getAuthHeaders()
      });
      
      let productosData = [];
      
      if (productosResponse.ok) {
        productosData = await productosResponse.json();
        const productosActivos = productosData.filter(producto => producto.activo);
        
        // Asignar icono según categoría
        const productosConIcono = productosActivos.map(producto => ({
          ...producto,
          icono: obtenerIconoPorCategoria(producto.categoria || 'quemadores')
        }));
        
        setProductos(productosConIcono);
        productosData = productosConIcono;
      }

      // Para populares, usar los más vendidos o los que tienen más stock
      const productosPopularesOrdenados = [...productosData]
        .sort((a, b) => (b.stock || 0) - (a.stock || 0))
        .slice(0, 3);
      
      setProductosPopulares(productosPopularesOrdenados);
      
    } catch (error) {
      console.error('Error de conexión:', error);
      if (productos.length > 0) {
        setProductosPopulares(productos.slice(0, 3));
      }
    } finally {
      setLoading(false);
    }
  };

  // Filtrar productos por búsqueda, categoría y presentación - CORREGIDO
  const filteredProductos = productos.filter(producto => {
    const matchesSearch = 
      (producto.nombre && producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (producto.descripcion && producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (producto.beneficios && producto.beneficios.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Comparar directamente con los IDs (no con los nombres)
    const matchesCategoria = categoriaSeleccionada === 'todos' || producto.categoria === categoriaSeleccionada;
    const matchesPresentacion = presentacionSeleccionada === 'todas' || producto.presentacion === presentacionSeleccionada;
    
    return matchesSearch && matchesCategoria && matchesPresentacion;
  });

  // Paginación
  const indexOfLastProduct = currentPage * productosPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productosPerPage;
  const currentProductos = filteredProductos.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProductos.length / productosPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoriaSeleccionada, presentacionSeleccionada]);

  // ========== FUNCIONES DE INTERACCIÓN ==========
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userIsAuthenticated = !!token;
    setIsAuthenticated(userIsAuthenticated);
    
    // Obtener categorías y presentaciones primero
    fetchCategorias();
    fetchPresentaciones();
    
    // Luego obtener productos
    fetchProductosYPopulares();
    updateCarritoCount();
  }, []);

  const handleProductClick = (producto) => {
    setSelectedProduct(producto);
    setShowProductModal(true);
  };

  const handleAddToCart = (producto) => {
    agregarAlCarrito(producto, 1);
    
    if (showProductModal) {
      closeModal();
    }
  };

  const handleComprarProducto = (producto) => {
    setProductoParaComprar(producto);
    setShowComprarModal(true);
    setShowProductModal(false);
  };

  const closeModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price || 0);
  };

  // Si está cargando
  if (loading) {
    return (
      <div className={`productos-container ${darkMode ? 'dark-mode' : ''}`}>
        <div className="loading-spinner"></div>
        <p style={{textAlign: 'center', color: darkMode ? '#e2e8f0' : '#666'}}>
          Cargando suplementos...
        </p>
      </div>
    );
  }

  return (
    <div className={`productos-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Header */}
      <header className="productos-header">
        <nav className="productos-nav">
          <div className="productos-nav-brand">
            <div className="productos-logo-container">
              <img src={logo} alt="Diet Lettuce" className="productos-logo" />
              <h2>
                <span className="productos-crazy-swash">Diet</span> Lettuce
              </h2>
            </div>
          </div>
          <ul className="productos-nav-menu">
            <li><a href="/">{t('inicio')}</a></li>
            <li><a href="#productos" className="active">{t('productos')}</a></li>
            <li><a href="/nosotros">{t('nosotros')}</a></li>
            <li><a href="/configuracion">{t('configuracion')}</a></li>
            <li><a href="/login">{t('login')}</a></li>
            
            <li className="nav-carrito-icon">
              <a 
                href="/carrito" 
                onClick={(e) => {
                  e.preventDefault();
                  handleGoToCarrito();
                }}
                title="Carrito de Compras"
                className="carrito-link"
              >
                <FaShoppingCart className={`carrito-icon ${animarCarrito ? 'animar-carrito' : ''}`} />
                {carritoCount > 0 && (
                  <span className="carrito-badge">
                    {carritoCount > 99 ? '99+' : carritoCount}
                  </span>
                )}
              </a>
            </li>
            
            <li className="nav-profile-icon">
              <a href="/perfil" title="Mi Perfil">
                <HiMiniUserCircle className="profile-icon" />
              </a>
            </li>
            <li className="nav-profile-icon">
              <a href="/notificacionesUser" title="Notificaciones">
                <IoNotificationsCircle className="profile-icon" />
              </a>
            </li>
            {isAuthenticated && (
              <li>
                <button 
                  onClick={handleLogout} 
                  className="productos-logout-btn"
                  title="Cerrar Sesión"
                >
                  Cerrar Sesión
                </button>
              </li>
            )}
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="productos-hero">
        <div className="productos-container-main">
          <h1 className="productos-title">
            Suplementos para tu <span className="productos-crazy-swash-hero">Salud y Bienestar</span>
          </h1>
          <p className="productos-subtitle">
            Descubre nuestra selección de suplementos naturales para apoyar tu pérdida de peso y mejorar tu salud
          </p>
        </div>
      </section>

      {/* Productos Populares */}
      {productosPopulares.length > 0 && (
        <section className="productos-populares-section">
          <div className="productos-container-main">
            <h2 className="section-title">Los Más Populares</h2>
            <div className="productos-populares-grid">
              {productosPopulares.map((producto) => (
                <div 
                  key={producto.id} 
                  className="producto-popular-card"
                  onClick={() => handleProductClick(producto)}
                >
                  <div className="producto-popular-image">
                    <img src={producto.icono || suplementoGenericoIcon} alt={producto.nombre} />
                  </div>
                  <div className="producto-popular-content">
                    <h3>{producto.nombre}</h3>
                    {producto.descripcion && producto.descripcion.trim() !== '' && (
                      <p className="producto-popular-desc">
                        {producto.descripcion.length > 80 
                          ? `${producto.descripcion.substring(0, 80)}...` 
                          : producto.descripcion
                        }
                      </p>
                    )}
                    <button className="ver-producto-btn">
                      Ver Detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Buscador y Filtros */}
      <section className="todos-productos-section">
        <div className="productos-container-main">
          <div className="productos-header-actions">
            <h2 className="section-title">Todos los Suplementos</h2>
            
            <div className="filtros-container">
              {/* Buscador */}
              <div className="productos-search-container">
                <div className="search-input-wrapper">
                  <img src={searchIcon} alt="Buscar" className="search-icon" />
                  <input
                    type="text"
                    placeholder="Buscar suplementos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="productos-search-input"
                  />
                  {searchTerm && (
                    <button 
                      className="clear-search"
                      onClick={() => setSearchTerm('')}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Select de Categorías - AHORA USA LOS IDs CORRECTOS */}
              <div className="categoria-select-container">
                <select
                  value={categoriaSeleccionada}
                  onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                  className="categoria-select"
                >
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select de Presentaciones - AHORA USA LOS IDs CORRECTOS */}
              <div className="presentacion-select-container">
                <select
                  value={presentacionSeleccionada}
                  onChange={(e) => setPresentacionSeleccionada(e.target.value)}
                  className="presentacion-select"
                >
                  {presentaciones.map((pre) => (
                    <option key={pre.id} value={pre.id}>
                      {pre.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Grid de Productos */}
          {currentProductos.length > 0 ? (
            <>
              <div className="productos-grid">
                {currentProductos.map((producto) => (
                  <div 
                    key={producto.id} 
                    className="producto-card"
                    onClick={() => handleProductClick(producto)}
                  >
                    <div className="producto-image">
                      <img src={producto.icono || suplementoGenericoIcon} alt={producto.nombre} />
                    </div>
                    <div className="producto-content">
                      <h3>{producto.nombre}</h3>
                      {producto.descripcion && (
                        <p className="producto-desc">
                          {producto.descripcion.length > 80 
                            ? `${producto.descripcion.substring(0, 80)}...` 
                            : producto.descripcion
                          }
                        </p>
                      )}
                      <div className="producto-metadata">
                        <span className="producto-categoria">
                          {obtenerNombreCategoria(producto.categoria)}
                        </span>
                        <span className="producto-presentacion">
                          {obtenerNombrePresentacion(producto.presentacion)}
                        </span>
                      </div>
                      {producto.beneficios && (
                        <div className="producto-beneficios">
                          <strong>Beneficios:</strong> {producto.beneficios.substring(0, 60)}...
                        </div>
                      )}
                      <div className="producto-footer">
                        <div className="producto-price">
                          {formatPrice(producto.precio)}
                        </div>
                        <button className="producto-btn">
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginación */}
              {filteredProductos.length > productosPerPage && (
                <div className="pagination-container">
                  <div className="pagination-controls">
                    <button 
                      onClick={() => paginate(currentPage - 1)} 
                      disabled={currentPage === 1}
                      className="pagination-btn prev-btn"
                    >
                      Anterior
                    </button>
                    
                    <div className="pagination-numbers">
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
                              {showEllipsis && <span className="pagination-ellipsis">...</span>}
                              <button
                                onClick={() => paginate(number)}
                                className={`pagination-btn ${currentPage === number ? 'active' : ''}`}
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
                      className="pagination-btn next-btn"
                    >
                      Siguiente
                    </button>
                  </div>

                  <div className="productos-count-info">
                    Mostrando {currentProductos.length} de {filteredProductos.length} suplementos
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="no-products">
              <p>No se encontraron suplementos con esos criterios de búsqueda.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="productos-footer">
        <div className="productos-container-main">
          <div className="productos-footer-content">
            <div className="productos-footer-section">
              <div className="productos-footer-logo-container">
                <img src={logo} alt="Diet Lettuce" className="productos-footer-logo" />
                <h3>
                  <span className="productos-crazy-swash">Diet</span> Lettuce
                </h3>
              </div>
              <p>Suplementos naturales para tu salud y bienestar</p>
            </div>
            <div className="productos-footer-section">
              <h4>Categorías</h4>
              <ul>
                <li><a href="#quemadores">Quemadores de Grasa</a></li>
                <li><a href="#proteinas">Proteínas</a></li>
                <li><a href="#fibras">Fibras y Digestivos</a></li>
                <li><a href="#detox">Detox y Limpieza</a></li>
                <li><a href="#termogenicos">Termogénicos</a></li>
                <li><a href="#vitaminas">Vitaminas</a></li>
              </ul>
            </div>
            <div className="productos-footer-section">
              <h4>Contacto</h4>
              <ul>
                <li>México, CDMX</li>
                <li>+52 55 1234 5678</li>
                <li>info@dietlettuce.com</li>
              </ul>
            </div>
          </div>
          <div className="productos-footer-bottom">
            <p>&copy; 2024 Diet Lettuce. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Modal de Producto */}
      {showProductModal && selectedProduct && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content product-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeModal}>×</button>
            <div className="product-modal-grid">
              
              {/* Lado Izquierdo - Imagen con cuadro */}
              <div className="product-modal-left">
                <div className="product-modal-image-container">
                  <img 
                    src={selectedProduct.icono || suplementoGenericoIcon} 
                    alt={selectedProduct.nombre} 
                    className="product-modal-image"
                  />
                </div>
                <div className="product-modal-price">
                  {formatPrice(selectedProduct.precio)}
                </div>
              </div>

              {/* Lado Derecho - Información */}
              <div className="product-modal-right">
                <h2 className="product-modal-title">{selectedProduct.nombre}</h2>
                
                {/* Categoría y Presentación */}
                <div className="product-modal-info">
                  <span className="product-modal-categoria">
                    {obtenerNombreCategoria(selectedProduct.categoria)}
                  </span>
                  <span className="product-modal-presentacion">
                    {obtenerNombrePresentacion(selectedProduct.presentacion)}
                  </span>
                </div>

                {/* Descripción */}
                {selectedProduct.descripcion && (
                  <div className="product-modal-descripcion">
                    <h3>Descripción</h3>
                    <p>{selectedProduct.descripcion}</p>
                  </div>
                )}

                {/* Beneficios */}
                {selectedProduct.beneficios && (
                  <div className="product-modal-beneficios">
                    <h3>Beneficios</h3>
                    <p>{selectedProduct.beneficios}</p>
                  </div>
                )}

                {/* Modo de Uso */}
                {selectedProduct.modo_uso && (
                  <div className="product-modal-modo-uso">
                    <h3>Modo de Uso</h3>
                    <p>{selectedProduct.modo_uso}</p>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="product-modal-actions">
                  <button 
                    className="product-modal-btn add-to-cart"
                    onClick={() => handleAddToCart(selectedProduct)}
                    disabled={selectedProduct.stock === 0}
                  >
                    Agregar al Carrito
                  </button>
                  <button 
                    className="product-modal-btn buy-now"
                    onClick={() => handleComprarProducto(selectedProduct)}
                    disabled={selectedProduct.stock === 0}
                  >
                    Comprar Ahora
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Comprar Producto */}
      {showComprarModal && productoParaComprar && (
        <ComprarProductoModal 
          producto={productoParaComprar}
          onClose={() => setShowComprarModal(false)}
          onOrderCreated={(orden) => {
            console.log('Pedido creado:', orden);
            fetchProductosYPopulares();
          }}
        />
      )}
    </div>
  );
};

export default Productos;