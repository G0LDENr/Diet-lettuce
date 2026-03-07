// Versión mejorada del Home.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../context/config';
import { HiMiniUserCircle } from "react-icons/hi2";
import { IoNotificationsCircle } from "react-icons/io5";
import '../css/Home/home.css';

import logo from '../img/icono-Diet.png';
import LogoLechuga from '../img/ensalada.png';
import facebookLogo from '../img/facebook.png';
import instagramLogo from '../img/instagram.png';
import tik_tokLogo from '../img/tik-tok.png';

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

  // Manejar scroll para botón "Volver arriba"
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
        fetch('http://127.0.0.1:5000/especiales/', { headers: getAuthHeaders() }),
        fetch('http://127.0.0.1:5000/ordenes/', { headers: getAuthHeaders() })
      ]);
      
      if (!productosResponse.ok) {
        throw new Error(`Error al obtener productos: ${productosResponse.status}`);
      }
      
      let productosData = await productosResponse.json();
      productosData = productosData.filter(producto => producto.activo);
      
      if (ordenesResponse.ok) {
        const ordenesData = await ordenesResponse.json();
        const productosConConteo = calcularProductosPopulares(productosData, ordenesData);
        setProductosPopulares(productosConConteo.slice(0, 3));
      } else {
        setProductosPopulares(productosData.slice(0, 3));
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
      if (orden.tipo_pedido === 'especial' && orden.especial_id) {
        const productoId = orden.especial_id;
        conteoProductos[productoId] = (conteoProductos[productoId] || 0) + 1;
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

  // Componente de producto memoizado
  const ProductCard = useMemo(() => React.memo(({ producto, onClick }) => (
    <div 
      className="home-product-card popular-card"
      onClick={() => onClick(producto.id)}
    >
      <div className="home-product-image-container">
        <img 
          src={LogoLechuga} 
          alt={producto.nombre} 
          className="home-product-icon-image" 
          loading="lazy"
        />
        {producto.conteo > 0 && (
          <div className="product-count-badge">
            {producto.conteo} {producto.conteo === 1 ? 'pedido' : 'pedidos'}
          </div>
        )}
      </div>
      <h3>{producto.nombre}</h3>
      <p className="product-description">
        {producto.descripcion && producto.descripcion.length > 60
          ? `${producto.descripcion.substring(0, 60)}...`
          : producto.descripcion || 'Producto delicioso'
        }
      </p>
      <div className="product-price">
        {formatPrice(producto.precio)}
      </div>
      <button className="ver-producto-btn">
        Ver Producto
      </button>
    </div>
  )), []);

  // Componente de placeholder memoizado
  const PlaceholderCard = useMemo(() => React.memo(({ title, description, onClick }) => (
    <div className="home-product-card" onClick={onClick}>
      <div className="home-product-image-container">
        <img src={LogoLechuga} alt={title} className="home-product-icon-image" loading="lazy" />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <button className="ver-producto-btn">Ver Producto</button>
    </div>
  )), []);

  return (
    <div className="home">
      <Header 
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        t={t}
      />
      
      <HeroSection t={t} />
      
      <ProductsSection
        loading={loading}
        error={error}
        productosPopulares={productosPopulares}
        onVerProducto={handleVerProducto}
        onRetry={fetchProductosPopulares}
        onNavigateToProductos={() => navigate('/productos')}
        t={t}
        ProductCard={ProductCard}
        PlaceholderCard={PlaceholderCard}
      />
      
      <FindUsSection t={t} />
      
      <Footer t={t} />
      
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

// Componente Header separado
const Header = ({ isAuthenticated, onLogout, t }) => (
  <header className="home-header">
    <nav className="home-nav">
      <div className="home-nav-brand">
        <div className="home-logo-container">
          <img src={logo} alt="Crazy Lettuces" className="home-logo" />
          <h2>
            <span className="home-crazy-swash">Diet</span> Lettuce
          </h2>
        </div>
      </div>
      <ul className="home-nav-menu">
        <li><a href="#inicio">{t('inicio')}</a></li>
        <li><a href="/productos">{t('productos')}</a></li>
        <li><a href="/nosotros">{t('nosotros')}</a></li>
        <li><a href="/configuracion">{t('configuracion')}</a></li>
        <li><a href="/login">{t('login')}</a></li>
        <li className="nav-profile-icon">
          <a href="/perfil" title="Mi Perfil">
            <HiMiniUserCircle className="profile-icon" />
          </a>
        </li>
        <li className="nav-profile-icon">
          <a href="/notificacionesUser" title="Notification">
            <IoNotificationsCircle className="profile-icon" />
          </a>
        </li>
        {isAuthenticated && (
          <li>
            <button 
              onClick={onLogout} 
              className="home-logout-btn"
              title="Cerrar Sesión"
            >
              Cerrar Sesión
            </button>
          </li>
        )}
      </ul>
    </nav>
  </header>
);

// Componente Hero separado
const HeroSection = ({ t }) => (
  <section className="home-hero" id="inicio">
    <div className="home-hero-overlay"></div>
    <div className="home-hero-content">
      <div className="home-hero-text">
        <h1 className="home-hero-title">
          <span className="home-crazy-large-swash">Diet</span>
          <span className="home-highlight"> Lettuce</span>
        </h1>
        <p className="home-hero-description">
          {t('heroDescription')}
        </p>
      </div>
    </div>
  </section>
);

// Componente ProductsSection mejorado
const ProductsSection = ({ 
  loading, 
  error, 
  productosPopulares, 
  onVerProducto, 
  onRetry,
  onNavigateToProductos,
  t,
  ProductCard,
  PlaceholderCard
}) => (
  <section className="home-products" id="productos">
    <div className="home-container">
      <h2 className="home-section-title">Los Más Populares</h2>
      <p className="home-section-subtitle">
        Descubre los productos favoritos de nuestros clientes
      </p>
      
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage error={error} onRetry={onRetry} />
      ) : (
        <>
          <div className="home-products-grid">
            {productosPopulares.length > 0 ? (
              productosPopulares.map(producto => (
                <ProductCard 
                  key={producto.id} 
                  producto={producto} 
                  onClick={onVerProducto}
                />
              ))
            ) : (
              <>
                <PlaceholderCard 
                  title={t('comboFreshName')}
                  description={t('comboFreshDescription')}
                  onClick={onNavigateToProductos}
                />
                <PlaceholderCard 
                  title={t('crazySpicyName')}
                  description={t('crazySpicyDescription')}
                  onClick={onNavigateToProductos}
                />
                <PlaceholderCard 
                  title={t('comboLocoName')}
                  description={t('comboLocoDescription')}
                  onClick={onNavigateToProductos}
                />
              </>
            )}
          </div>
          
          <div className="home-ver-todos-container">
            <button 
              className="home-ver-todos-btn"
              onClick={onNavigateToProductos}
            >
              Ver Todos los Productos →
            </button>
          </div>
        </>
      )}
    </div>
  </section>
);

// Componentes auxiliares
const LoadingSpinner = () => (
  <div className="home-loading-container">
    <div className="loading-spinner"></div>
    <p>Cargando productos populares...</p>
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
        <h2>{t('encuentranosTitle')}</h2>
        <p>{t('encuentranosDescription')}</p>
        <div className="home-social-icons">
          <SocialLink 
            href="https://www.facebook.com/share/1BUz4PdFw8/" 
            src={facebookLogo} 
            alt="Facebook" 
          />
          <SocialLink 
            href="https://www.instagram.com/crazy_lettuces?igsh=MW1oZDloZ3I0cDg2MQ==" 
            src={instagramLogo} 
            alt="Instagram" 
          />
          <SocialLink 
            href="https://www.tiktok.com/@crazy.lettuce8?_r=1&_t=ZS-91InvRY4cKt" 
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
        <div className="home-footer-section">
          <div className="home-footer-logo-container">
            <img src={logo} alt="Crazy Lettuces" className="home-footer-logo" />
            <h3>
              <span className="home-crazy-swash">Diet</span> Lettuce
            </h3>
          </div>
          <p>{t('footerDescription')}</p>
        </div>
        <div className="home-footer-section">
          <h4>{t('productosFooter')}</h4>
          <ul>
            <li><a href="/productos">Lechugas Chile</a></li>
            <li><a href="/productos">Lechugas Gomitas</a></li>
            <li><a href="/productos">Combos Locos</a></li>
          </ul>
        </div>
        <div className="home-footer-section">
          <h4>{t('contacto')}</h4>
          <ul>
            <li><i className="fas fa-map-marker-alt"></i> {t('direccion')}</li>
            <li><i className="fas fa-phone"></i> {t('telefono1')}</li>
            <li><i className="fas fa-phone"></i> {t('telefono2')}</li>
            <li><i className="fas fa-phone"></i> {t('telefono3')}</li>
            <li><i className="fas fa-phone"></i> {t('telefono4')}</li>
            <li><i className="fas fa-envelope"></i> {t('email')}</li>
          </ul>
        </div>
      </div>
      <div className="home-footer-bottom">
        <p>{t('derechos')}</p>
      </div>
    </div>
  </footer>
);

export default Home;