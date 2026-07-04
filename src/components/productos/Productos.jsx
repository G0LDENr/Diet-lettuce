import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../../context/config';
import { HiMiniUserCircle } from "react-icons/hi2";
import { IoNotificationsCircle } from "react-icons/io5";
import { FaShoppingCart } from "react-icons/fa";
import '../../css/Productos/productos.css';
import '../../css/Carrito/carrito.css';

import logo from '../../img/Logo_balancea_titulo.png';
import logo_blanco_texto from '../../img/Logo_balancea_blanco_titulo.png';
import logo_hoja from '../../img/hoja.png';
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

import calidadIcon from '../../img/calidad.png';
import envioIcon from '../../img/envio.png';
import pagosIcon from '../../img/pago-seguro.png';
import atencionIcon from '../../img/atencion.png';
import ubicacionIcon from '../../img/ubicacion-menu.png';
import telefonoIcon from '../../img/telefono-menu.png';
import emailIcon from '../../img/email-menu.png';
import dateIcon from '../../img/reloj.png';

import categoriaIconoUnico from '../../img/hoja.png';

import heroCalidadIcon from '../../img/calidad.png';
import heroEnvioIcon from '../../img/envio.png';
import heroPagosIcon from '../../img/pago-seguro.png';
import heroSaludIcon from '../../img/salud.png'

import ComprarProductoModal from './comprar-producto';
import ModalDetalleProducto from './Detalle-Producto';
import VoiceAssistant from '../../components/Voz/VoiceAssistant';

const Productos = () => {
  const navigate = useNavigate();
  const { t, darkMode } = useConfig();
  
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
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [carritoCount, setCarritoCount] = useState(0);
  const [animarCarrito, setAnimarCarrito] = useState(false);
  
  const productosPerPage = 9;
  const carritoKey = 'carrito_suplementos';

  const obtenerIconoPorCategoria = (categoria) => {
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

  const getCarritoFromStorage = () => {
    try {
      const carritoStr = localStorage.getItem(carritoKey);
      return carritoStr ? JSON.parse(carritoStr) : [];
    } catch (error) {
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userData');
    navigate('/');
    window.location.reload();
  };

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

  const fetchCategorias = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/suplementos/categorias', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setCategorias([
          { id: 'todos', nombre: 'Todas las categorías' },
          ...data.categorias
        ]);
      }
    } catch (error) {
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

  const fetchPresentaciones = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/suplementos/presentaciones', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setPresentaciones([
          { id: 'todas', nombre: 'Todas las presentaciones' },
          ...data.presentaciones
        ]);
      }
    } catch (error) {
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
      const response = await fetch('http://127.0.0.1:5000/suplementos/', {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        const productosActivos = data.filter(producto => producto.activo);
        const productosConIcono = productosActivos.map(producto => ({
          ...producto,
          icono: obtenerIconoPorCategoria(producto.categoria || 'quemadores')
        }));
        setProductos(productosConIcono);
        const populares = [...productosConIcono]
          .sort((a, b) => (b.stock || 0) - (a.stock || 0))
          .slice(0, 3);
        setProductosPopulares(populares);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProductos = productos.filter(producto => {
    const matchesSearch = 
      (producto.nombre && producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (producto.descripcion && producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategoria = categoriaSeleccionada === 'todos' || producto.categoria === categoriaSeleccionada;
    const matchesPresentacion = presentacionSeleccionada === 'todas' || producto.presentacion === presentacionSeleccionada;
    return matchesSearch && matchesCategoria && matchesPresentacion;
  });

  const indexOfLastProduct = currentPage * productosPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productosPerPage;
  const currentProductos = filteredProductos.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProductos.length / productosPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoriaSeleccionada, presentacionSeleccionada]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    fetchCategorias();
    fetchPresentaciones();
    fetchProductosYPopulares();
    updateCarritoCount();
  }, []);

  useEffect(() => {
    const handleVoiceSearch = (event) => {
      setSearchTerm(event.detail.term);
    };
    
    const handleVoiceClear = () => {
      setSearchTerm('');
      setCategoriaSeleccionada('todos');
      setPresentacionSeleccionada('todas');
      setCurrentPage(1);
    };
    
    const handleVoiceFilter = (event) => {
      setCategoriaSeleccionada(event.detail.categoria);
      setCurrentPage(1);
    };
    
    const handleVoiceScroll = (event) => {
      if (event.detail.section === 'populares') {
        document.querySelector('.productos-populares-section')?.scrollIntoView({ behavior: 'smooth' });
      } else if (event.detail.section === 'todos') {
        document.querySelector('.todos-productos-section')?.scrollIntoView({ behavior: 'smooth' });
      }
    };
    
    window.addEventListener('voiceSearch', handleVoiceSearch);
    window.addEventListener('voiceClear', handleVoiceClear);
    window.addEventListener('voiceFilter', handleVoiceFilter);
    window.addEventListener('voiceScroll', handleVoiceScroll);
    
    return () => {
      window.removeEventListener('voiceSearch', handleVoiceSearch);
      window.removeEventListener('voiceClear', handleVoiceClear);
      window.removeEventListener('voiceFilter', handleVoiceFilter);
      window.removeEventListener('voiceScroll', handleVoiceScroll);
    };
  }, []);

  const handleProductClick = (producto) => {
    setSelectedProduct(producto);
    setShowProductModal(true);
  };

  const handleAddToCart = (producto) => {
    agregarAlCarrito(producto, 1);
    setShowProductModal(false);
    setSelectedProduct(null);
  };

  const handleBuyNow = (producto) => {
    setProductoParaComprar(producto);
    setShowComprarModal(true);
    setShowProductModal(false);
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price || 0);
  };

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
      <header className="home-header">
        <nav className="home-nav">
          <div className="home-nav-brand">
            <div className="home-logo-container">
              <img src={logo} alt="Balancea" className="home-logo" />
            </div>
          </div>
          <ul className="home-nav-menu">
            <li><a href="/">{t('inicio') || 'Inicio'}</a></li>
            <li><a href="/productos" className="active">{t('productos') || 'Productos'}</a></li>
            <li><a href="/nosotros">{t('nosotros') || 'Nosotros'}</a></li>
            <li><a href="/dietas">{t('dietas') || 'Dietas'}</a></li>
            <li><a href="/configuracion">{t('configuracion') || 'Configuración'}</a></li>
          </ul>
          <div className="header-right">
            <li className="nav-carrito-icon" style={{ listStyle: 'none' }}>
              <a href="/carrito" onClick={(e) => { e.preventDefault(); handleGoToCarrito(); }} title="Carrito de Compras" className="carrito-link">
                <FaShoppingCart className={`carrito-icon ${animarCarrito ? 'animar-carrito' : ''}`} />
                {carritoCount > 0 && <span className="carrito-badge">{carritoCount > 99 ? '99+' : carritoCount}</span>}
              </a>
            </li>
            <li className="nav-profile-icon" style={{ listStyle: 'none' }}>
              <a href="/perfil" title="Mi Perfil"><HiMiniUserCircle className="profile-icon" /></a>
            </li>
            <li className="nav-profile-icon" style={{ listStyle: 'none' }}>
              <a href="/notificacionesUser" title="Notificaciones"><IoNotificationsCircle className="profile-icon" /></a>
            </li>
            {!isAuthenticated && <a href="/login" className="home-login-btn">Login</a>}
            {isAuthenticated && <button onClick={handleLogout} className="home-logout-btn" title="Cerrar Sesión">Cerrar Sesión</button>}
          </div>
        </nav>
      </header>

      <section className="productos-hero">
        <div className="hero-container">
          <div className="hero-left">
            <h1 className="productos-title">
              Suplementos para tu <br />
              <span className="productos-crazy-swash-hero">Salud y Bienestar</span>
            </h1>
            <p className="productos-subtitle">
              Descubre nuestra selección de suplementos naturales para apoyar tu pérdida de peso y mejorar tu salud
            </p>
          </div>
          <div className="hero-right">
            <div className="logos-container">
              <div className="logo-item">
                <div className="logo-circle"><img src={logo_hoja} alt="Naturales" className="hero-logo-img" /></div>
                <p className="logo-text">Ingredientes Naturales</p>
              </div>
              <div className="logo-item">
                <div className="logo-circle"><img src={heroCalidadIcon} alt="Calidad" className="hero-logo-img" /></div>
                <p className="logo-text">Calidad Garantizada</p>
              </div>
              <div className="logo-item">
                <div className="logo-circle"><img src={heroSaludIcon} alt="Bienestar" className="hero-logo-img" /></div>
                <p className="logo-text">Bienestar Integral</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {productosPopulares.length > 0 && (
        <section className="productos-populares-section">
          <div className="productos-container-main">
            <div className="popular-section-header">
              <img src={logo_hoja} alt="Popular" className="popular-logo" />
            </div>
            <div className="popular-title-container">
              <h2 className="section-title">Los Más Populares</h2>
            </div>
            <p className="popular-description">Nuestros suplementos más vendidos y los más valorados</p>
            
            <div className="productos-populares-grid">
              {productosPopulares.map((producto) => (
                <div key={producto.id} className="producto-popular-card" onClick={() => handleProductClick(producto)}>
                  <div className="producto-popular-image">
                    <img src={producto.icono || suplementoGenericoIcon} alt={producto.nombre} />
                  </div>
                  <div className="producto-popular-content">
                    <h3>{producto.nombre}</h3>
                    {producto.descripcion && producto.descripcion.trim() !== '' && (
                      <p className="producto-popular-desc">
                        {producto.descripcion.length > 80 ? `${producto.descripcion.substring(0, 80)}...` : producto.descripcion}
                      </p>
                    )}
                    <div className="producto-popular-precio">{formatPrice(producto.precio)}</div>
                    <div className="producto-popular-categoria">
                      <img src={categoriaIconoUnico} alt="categoría" className="categoria-icon" />
                      {obtenerNombreCategoria(producto.categoria)}
                    </div>
                    <button className="ver-producto-btn">Ver Detalles</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="todos-productos-section">
        <div className="productos-container-main">
          <div className="productos-header-actions">
            <div className="todos-title-container">
              <h2 className="section-title">Todos los Suplementos</h2>
            </div>
            
            <div className="filtros-container">
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
                  {searchTerm && <button className="clear-search" onClick={() => setSearchTerm('')}>×</button>}
                </div>
              </div>
              <div className="categoria-select-container">
                <select value={categoriaSeleccionada} onChange={(e) => setCategoriaSeleccionada(e.target.value)} className="categoria-select">
                  {categorias.map((cat) => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                </select>
              </div>
              <div className="presentacion-select-container">
                <select value={presentacionSeleccionada} onChange={(e) => setPresentacionSeleccionada(e.target.value)} className="presentacion-select">
                  {presentaciones.map((pre) => <option key={pre.id} value={pre.id}>{pre.nombre}</option>)}
                </select>
              </div>
            </div>
          </div>

          {currentProductos.length > 0 ? (
            <>
              <div className="productos-grid">
                {currentProductos.map((producto) => (
                  <div key={producto.id} className="producto-card" onClick={() => handleProductClick(producto)}>
                    <div className="producto-image"><img src={producto.icono || suplementoGenericoIcon} alt={producto.nombre} /></div>
                    <div className="producto-content">
                      <h3>{producto.nombre}</h3>
                      {producto.descripcion && <p className="producto-desc">{producto.descripcion.length > 80 ? `${producto.descripcion.substring(0, 80)}...` : producto.descripcion}</p>}
                      <div className="producto-metadata">
                        <span className="producto-categoria">{obtenerNombreCategoria(producto.categoria)}</span>
                        <span className="producto-presentacion">{obtenerNombrePresentacion(producto.presentacion)}</span>
                      </div>
                      {producto.beneficios && <div className="producto-beneficios"><strong>Beneficios:</strong> {producto.beneficios.substring(0, 60)}...</div>}
                      <div className="producto-footer">
                        <div className="producto-price">{formatPrice(producto.precio)}</div>
                        <button className="producto-btn">Ver Detalles</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProductos.length > productosPerPage && (
                <div className="pagination-container">
                  <div className="pagination-controls">
                    <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="pagination-btn pagination-prev">◀ Anterior</button>
                    
                    <div className="pagination-numbers">
                      {(() => {
                        const pages = [];
                        const maxVisible = 5;
                        const halfVisible = Math.floor(maxVisible / 2);
                        let startPage = Math.max(1, currentPage - halfVisible);
                        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                        
                        if (endPage - startPage + 1 < maxVisible) {
                          startPage = Math.max(1, endPage - maxVisible + 1);
                        }
                        
                        if (startPage > 1) {
                          pages.push(<button key={1} onClick={() => paginate(1)} className="pagination-btn">1</button>);
                          if (startPage > 2) pages.push(<span key="start-ellipsis" className="pagination-ellipsis">...</span>);
                        }
                        
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(<button key={i} onClick={() => paginate(i)} className={`pagination-btn ${currentPage === i ? 'active' : ''}`}>{i}</button>);
                        }
                        
                        if (endPage < totalPages) {
                          if (endPage < totalPages - 1) pages.push(<span key="end-ellipsis" className="pagination-ellipsis">...</span>);
                          pages.push(<button key={totalPages} onClick={() => paginate(totalPages)} className="pagination-btn">{totalPages}</button>);
                        }
                        
                        return pages;
                      })()}
                    </div>
                    
                    <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="pagination-btn pagination-next">Siguiente ▶</button>
                  </div>
                  <div className="productos-count-info">Mostrando {currentProductos.length} de {filteredProductos.length} suplementos</div>
                </div>
              )}
            </>
          ) : (
            <div className="no-products"><p>No se encontraron suplementos con esos criterios de búsqueda.</p></div>
          )}
        </div>
      </section>

      <footer className="home-footer">
        <div className="home-container">
          <div className="home-footer-content">
            <div className="home-footer-section footer-section-left">
              <div className="home-footer-logo-container"><img src={logo_blanco_texto} alt="Balancea" className="home-footer-logo" /></div>
              <p className="footer-description">EQUILIBRA TU VIDA</p>
              <p className="footer-subdescription">Tu decisión crea el equilibrio.</p>
            </div>
            <div className="home-footer-section footer-section-center">
              <h4>Productos</h4>
              <ul className="footer-list">
                <li><img src={logo_hoja} alt="Icono" className="footer-list-icon" /><a href="/productos">Proteínas</a></li>
                <li><img src={logo_hoja} alt="Icono" className="footer-list-icon" /><a href="/productos">Quemadores de Grasa</a></li>
                <li><img src={logo_hoja} alt="Icono" className="footer-list-icon" /><a href="/productos">Vitaminas</a></li>
                <li><img src={logo_hoja} alt="Icono" className="footer-list-icon" /><a href="/productos">Control de Apetito</a></li>
                <li><img src={logo_hoja} alt="Icono" className="footer-list-icon" /><a href="/productos">Energéticos Naturales</a></li>
              </ul>
              <button className="footer-shop-btn" onClick={() => window.location.href = '/productos'}>Ver todos los productos</button>
            </div>
            <div className="home-footer-section footer-section-right">
              <h4>Contacto</h4>
              <ul className="footer-list">
                <li><img src={ubicacionIcon} alt="Ubicación" className="footer-list-icon" /><span>Dirección</span></li>
                <li><img src={telefonoIcon} alt="Teléfono" className="footer-list-icon" /><span>Teléfono</span></li>
                <li><img src={emailIcon} alt="Email" className="footer-list-icon" /><span>Email</span></li>
                <li><img src={dateIcon} alt="Horario" className="footer-list-icon" /><span>Horario: Lun-Vie 9am-6pm</span></li>
              </ul>
            </div>
          </div>
          <div className="footer-divider"></div>
          <div className="footer-guarantees">
            <div className="guarantee-item"><img src={calidadIcon} alt="Calidad Garantizada" className="guarantee-icon" /><span>Calidad Garantizada</span></div>
            <div className="guarantee-item"><img src={envioIcon} alt="Envío Rápido" className="guarantee-icon" /><span>Envío Rápido</span></div>
            <div className="guarantee-item"><img src={pagosIcon} alt="Pagos Seguros" className="guarantee-icon" /><span>Pagos Seguros</span></div>
            <div className="guarantee-item"><img src={atencionIcon} alt="Atención al Cliente" className="guarantee-icon" /><span>Atención al Cliente</span></div>
            <div className="guarantee-last-divider"></div>
            <div className="home-footer-bottom"><p>© 2024 Balancea - Todos los derechos reservados</p></div>
          </div>
        </div>
      </footer>

      <VoiceAssistant page="productos" />

      <ModalDetalleProducto show={showProductModal} onClose={closeProductModal} producto={selectedProduct} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} darkMode={darkMode} />
      
      {showComprarModal && productoParaComprar && (
        <ComprarProductoModal producto={productoParaComprar} onClose={() => setShowComprarModal(false)} onOrderCreated={() => fetchProductosYPopulares()} />
      )}

      {showScrollTop && <button className="scroll-top-btn" onClick={scrollToTop} aria-label="Volver arriba">↑</button>}
    </div>
  );
};

export default Productos;