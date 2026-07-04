import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../context/config';
import { HiMiniUserCircle } from "react-icons/hi2";
import { IoNotificationsCircle } from "react-icons/io5";
import '../css/Home/home.css';

import logo from '../img/Logo_balancea_titulo.png';
import logo_blanco from '../img/Logo_balancea_modo_obscuro.png';
import logo_blanco_texto from '../img/Logo_balancea_blanco_titulo.png';
import logo_hoja from '../img/hoja.png';
import facebookLogo from '../img/facebook.png';
import instagramLogo from '../img/instagram.png';
import tik_tokLogo from '../img/tik-tok.png';

//iconos para footer
import calidadIcon from '../img/calidad.png';
import envioIcon from '../img/envio.png';
import pagosIcon from '../img/pago-seguro.png';
import atencionIcon from '../img/atencion.png';
import ubicacionIcon from '../img/ubicacion-menu.png';
import telefonoIcon from '../img/telefono-menu.png';
import emailIcon from '../img/email-menu.png';
import dateIcon from '../img/reloj.png';

// Íconos para categorías de suplementos
import quemadorIcon from '../img/quemador.png';
import proteinaIcon from '../img/suplemento.png';
import fibraIcon from '../img/fibra.png';
import detoxIcon from '../img/detox.png';
import termogenicoIcon from '../img/termogenico.png';
import controlApetitoIcon from '../img/control-apetito.png';
import energeticoIcon from '../img/energetico.png';
import vitaminasIcon from '../img/multivitamina.png';
import suplementoGenericoIcon from '../img/suplemento.png';

// Asistente de voz
import VoiceAssistant from '../components/Voz/VoiceAssistant';

const Home = () => {
  const { t } = useConfig();
  const navigate = useNavigate();
  
  const [productosPopulares, setProductosPopulares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const isAuthenticated = useMemo(() => localStorage.getItem('token') !== null, []);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    };
  }, []);

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

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userData');
    navigate('/');
    window.location.reload();
  }, [navigate]);

  const fetchProductosPopulares = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [productosResponse, ordenesResponse] = await Promise.all([
        fetch('http://127.0.0.1:5000/suplementos/', { headers: getAuthHeaders() }),
        fetch('http://127.0.0.1:5000/ordenes/', { headers: getAuthHeaders() })
      ]);
      
      if (!productosResponse.ok) {
        throw new Error(`Error al obtener productos: ${productosResponse.status}`);
      }
      
      let productosData = await productosResponse.json();
      productosData = productosData.filter(producto => producto.activo);
      
      const productosConIcono = productosData.map(producto => ({
        ...producto,
        icono: obtenerIconoPorCategoria(producto.categoria || 'quemadores')
      }));
      
      if (ordenesResponse.ok) {
        const ordenesData = await ordenesResponse.json();
        const productosConConteo = calcularProductosPopulares(productosConIcono, ordenesData);
        setProductosPopulares(productosConConteo.slice(0, 3));
      } else {
        setProductosPopulares(productosConIcono.slice(0, 3));
      }
      
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchProductosPopulares();
  }, [fetchProductosPopulares]);

  const calcularProductosPopulares = (productos, ordenes) => {
    const conteoProductos = {};
    
    ordenes.forEach(orden => {
      if (orden.tipo_pedido === 'suplemento' && orden.suplemento_id) {
        const productoId = orden.suplemento_id;
        conteoProductos[productoId] = (conteoProductos[productoId] || 0) + 1;
      }
      else if (orden.tipo_pedido === 'carrito' && orden.pedido_json) {
        try {
          const pedidoJson = typeof orden.pedido_json === 'string' 
            ? JSON.parse(orden.pedido_json) 
            : orden.pedido_json;
          
          if (pedidoJson.items && Array.isArray(pedidoJson.items)) {
            pedidoJson.items.forEach(item => {
              if (item.suplemento_id) {
                conteoProductos[item.suplemento_id] = (conteoProductos[item.suplemento_id] || 0) + 1;
              }
            });
          }
        } catch (e) {
          console.error('Error parseando pedido_json:', e);
        }
      }
    });

    return productos
      .map(producto => ({
        ...producto,
        conteo: conteoProductos[producto.id] || 0
      }))
      .sort((a, b) => {
        if (b.conteo !== a.conteo) {
          return b.conteo - a.conteo;
        }
        return a.nombre.localeCompare(b.nombre);
      });
  };

  const handleVerProducto = useCallback((productoId) => {
    navigate('/productos', { 
      state: { 
        productoDestacado: productoId,
        desdeHome: true 
      } 
    });
  }, [navigate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price || 0);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const ProductCard = useMemo(() => React.memo(({ producto, onClick }) => (
    <div 
      className="home-product-card"
      onClick={() => onClick(producto.id)}
    >
      <div className="home-product-image-container">
        <img 
          src={producto.icono || suplementoGenericoIcon} 
          alt={producto.nombre} 
          className="home-product-icon-image" 
          loading="lazy"
        />
        {producto.stock !== undefined && producto.stock <= 5 && producto.stock > 0 && (
          <div className="stock-warning-badge">
            ¡Últimas {producto.stock}!
          </div>
        )}
        {producto.stock === 0 && (
          <div className="stock-out-badge">
            Agotado
          </div>
        )}
      </div>
      
      {producto.categoria && (
        <span className="product-category-badge">
          {producto.categoria_nombre || producto.categoria}
        </span>
      )}
      
      <h3>{producto.nombre}</h3>
      
      <p className="product-description">
        {producto.descripcion && producto.descripcion.length > 60
          ? `${producto.descripcion.substring(0, 60)}...`
          : producto.descripcion || 'Suplemento de alta calidad'
        }
      </p>
      
      <div className="product-price">
        {formatPrice(producto.precio)}
      </div>
      
      <button 
        className="ver-producto-btn"
        disabled={producto.stock === 0}
      >
        {producto.stock === 0 ? 'Agotado' : 'Ver Producto'}
      </button>
    </div>
  )), []);

  return (
    <div className="home">
      <Header 
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        t={t}
      />
      
      <HeroSection t={t} navigate={navigate} />
      
      <ProductsSection
        loading={loading}
        error={error}
        productosPopulares={productosPopulares}
        onVerProducto={handleVerProducto}
        onRetry={fetchProductosPopulares}
        ProductCard={ProductCard}
      />
      
      <FindUsSection t={t} />
      
      <Footer t={t} />
      
      {/* Asistente de voz - Accesibilidad */}
      <VoiceAssistant />
      
      {showScrollTop && (
        <button 
          className="scroll-top-btn"
          onClick={scrollToTop}
          aria-label="Volver arriba"
        >
          ↑
        </button>
      )}
    </div>
  );
};

const Header = ({ isAuthenticated, onLogout, t }) => (
  <header className="home-header">
    <nav className="home-nav">
      <div className="home-nav-brand">
        <div className="home-logo-container">
          <img src={logo} alt="Balancea" className="home-logo" />
        </div>
      </div>
      <ul className="home-nav-menu">
        <li><a href="#inicio">{t('inicio') || 'Inicio'}</a></li>
        <li><a href="/productos">{t('productos') || 'Productos'}</a></li>
        <li><a href="/nosotros">{t('nosotros') || 'Nosotros'}</a></li>
        <li><a href="/dietas">{t('dietas') || 'Dietas'}</a></li>
        <li><a href="/configuracion">{t('configuracion') || 'Configuración'}</a></li>
      </ul>
      <div className="header-right">
        <li className="nav-profile-icon" style={{ listStyle: 'none' }}>
          <a href="/perfil" title="Mi Perfil">
            <HiMiniUserCircle className="profile-icon" />
          </a>
        </li>
        
        <li className="nav-profile-icon" style={{ listStyle: 'none' }}>
          <a href="/notificacionesUser" title="Notificaciones">
            <IoNotificationsCircle className="profile-icon" />
          </a>
        </li>
        
        {!isAuthenticated && (
          <a href="/login" className="home-login-btn">
            Login
          </a>
        )}
        
        {isAuthenticated && (
          <button 
            onClick={onLogout} 
            className="home-logout-btn"
            title="Cerrar Sesión"
          >
            Cerrar Sesión
          </button>
        )}
      </div>
    </nav>
  </header>
);

const HeroSection = ({ t, navigate }) => (
  <section className="home-hero" id="inicio">
    <div className="home-hero-overlay"></div>
    <div className="home-hero-content">
      <div className="home-hero-text">
        <p className="home-hero-description">
          {t('heroDescription')}
        </p>
        <p className="home-hero-subdescription">
          {t('heroSubDescription')}
        </p>
      </div>
      <button 
        className="hero-cta-btn"
        onClick={() => navigate('/productos')}
      >
        <span className="btn-text">Conoce nuestros productos</span>
        <span className="btn-divider"></span>
        <span className="btn-arrow">›</span>
      </button>
    </div>
  </section>
);

const ProductsSection = ({ 
  loading, 
  error, 
  productosPopulares, 
  onVerProducto, 
  onRetry,
  ProductCard
}) => (
  <section className="home-products" id="productos">
    <div className="home-container">
      {/* Logo encima del título */}
      <div className="products-logo-container">
        <img src={logo_hoja} alt="Balancea" className="products-logo" />
      </div>
      
      <h2 className="home-section-title">
        Conoce nuestros <span className="highlight-green">productos</span>
      </h2>
      <p className="home-section-subtitle">
        Descubre los suplementos favoritos de nuestros clientes
      </p>
      
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage error={error} onRetry={onRetry} />
      ) : (
        <div className="home-products-grid">
          {productosPopulares.map(producto => (
            <ProductCard 
              key={producto.id} 
              producto={producto} 
              onClick={onVerProducto}
            />
          ))}
        </div>
      )}
    </div>
  </section>
);

const LoadingSpinner = () => (
  <div className="home-loading-container">
    <div className="loading-spinner"></div>
    <p>Cargando suplementos populares...</p>
  </div>
);

const ErrorMessage = ({ error, onRetry }) => (
  <div className="home-error-container">
    <p className="error-message">Error: {error}</p>
    <button onClick={onRetry} className="retry-btn">
      Reintentar
    </button>
  </div>
);

const FindUsSection = ({ t }) => (
  <section className="home-find-us">
    <div className="home-container">
      <div className="home-find-us-content">
        {/* Logo encima del título de FindUs */}
        <div className="findus-logo-container">
          <img src={logo_hoja} alt="Balancea" className="findus-logo" />
        </div>
        
        <h2>{t('encuentranosTitle') || 'Conócenos'}</h2>
        
        {/* Descripción 1 arriba */}
        <p className="findus-description findus-description-1">
          {t('encuentranosDescription') || 'Síguenos en nuestras redes sociales'}
        </p>
        
        {/* Descripción 2 abajo */}
        <p className="findus-description findus-description-2">
          {t('encuentranosDescription2') || 'Promociones y nuevos productos'}
        </p>
        
        {/* Línea pequeña en el centro */}
        <div className="findus-divider"></div>
        
        <div className="home-social-icons">
          <SocialLink 
            href="https://www.facebook.com/profile.php?id=61582244528322" 
            src={facebookLogo} 
            alt="Facebook" 
          />
          <SocialLink 
            href="https://www.instagram.com/dietlettuce1/" 
            src={instagramLogo} 
            alt="Instagram" 
          />
          <SocialLink 
            href="https://www.tiktok.com/@dietlettuce01" 
            src={tik_tokLogo} 
            alt="TikTok" 
          />
        </div>
      </div>
    </div>
  </section>
);

const SocialLink = ({ href, src, alt }) => (
  <a 
    href={href} 
    className="home-social-link"
    target="_blank" 
    rel="noopener noreferrer"
  >
    <img src={src} alt={alt} className="home-social-logo" />
  </a>
);

const Footer = ({ t }) => (
  <footer className="home-footer">
    <div className="home-container">
      <div className="home-footer-content">
        {/* Columna 1 - Logo y descripción */}
        <div className="home-footer-section footer-section-left">
          <div className="home-footer-logo-container">
            <img src={logo_blanco_texto} alt="Balancea" className="home-footer-logo" />
          </div>
          <p className="footer-description">
            {t('footerDescription') || 'EQUILIBRA TU VIDA'}
          </p>
          <p className="footer-subdescription">
            {t('footerSubDescription3') || 'Tu decisión crea el equilibrio.'}
          </p>
        </div>

        {/* Columna 2 - Productos con botón */}
        <div className="home-footer-section footer-section-center">
          <h4>{t('productosFooter') || 'Productos'}</h4>
          <ul className="footer-list">
            <li>
              <img src={logo_hoja} alt="Icono" className="footer-list-icon" />
              <a href="/productos">Proteínas</a>
            </li>
            <li>
              <img src={logo_hoja} alt="Icono" className="footer-list-icon" />
              <a href="/productos">Quemadores de Grasa</a>
            </li>
            <li>
              <img src={logo_hoja} alt="Icono" className="footer-list-icon" />
              <a href="/productos">Vitaminas</a>
            </li>
            <li>
              <img src={logo_hoja} alt="Icono" className="footer-list-icon" />
              <a href="/productos">Control de Apetito</a>
            </li>
            <li>
              <img src={logo_hoja} alt="Icono" className="footer-list-icon" />
              <a href="/productos">Energéticos Naturales</a>
            </li>
          </ul>
          <button className="footer-shop-btn" onClick={() => window.location.href = '/productos'}>
            Ver todos los productos
          </button>
        </div>

        {/* Columna 3 - Contacto */}
        <div className="home-footer-section footer-section-right">
          <h4>{t('contacto') || 'Contacto'}</h4>
          <ul className="footer-list">
            <li>
              <img src={ubicacionIcon} alt="Ubicación" className="footer-list-icon" />
              <span>{t('direccion') || 'Dirección'}</span>
            </li>
            <li>
              <img src={telefonoIcon} alt="Teléfono" className="footer-list-icon" />
              <span>{t('telefono_menu') || 'Teléfono'}</span>
            </li>
            <li>
              <img src={emailIcon} alt="Email" className="footer-list-icon" />
              <span>{t('email') || 'Email'}</span>
            </li>
            <li>
              <img src={dateIcon} alt="Horario" className="footer-list-icon" />
              <span>{t('horario') || 'Horario: Lun-Vie 9am-6pm'}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Línea divisora horizontal */}
      <div className="footer-divider"></div>

      {/* Garantías - Sin líneas divisoras entre ellos, solo una al final */}
      <div className="footer-guarantees">
        <div className="guarantee-item">
          <img src={calidadIcon} alt="Calidad Garantizada" className="guarantee-icon" />
          <span>Calidad Garantizada</span>
        </div>
        <div className="guarantee-item">
          <img src={envioIcon} alt="Envío Rápido" className="guarantee-icon" />
          <span>Envío Rápido</span>
        </div>
        <div className="guarantee-item">
          <img src={pagosIcon} alt="Pagos Seguros" className="guarantee-icon" />
          <span>Pagos Seguros</span>
        </div>
        <div className="guarantee-item">
          <img src={atencionIcon} alt="Atención al Cliente" className="guarantee-icon" />
          <span>Atención al Cliente</span>
        </div>
        {/* Línea divisora vertical solo a la derecha del último */}
        <div className="guarantee-last-divider"></div>
        <div className="home-footer-bottom">
          <p>{t('derechos') || '© 2024 Balancea - Todos los derechos reservados'}</p>
        </div>
      </div>
    </div>
  </footer>
);

export default Home;