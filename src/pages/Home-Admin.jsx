import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Configuracion from '../components/config/Config-admin';
import Users from '../components/users/Users';
import Especial from '../components/especiales/Especiales';
import Ordenes from '../components/ordenes/Ordenes';
import Notificaciones from '../components/notificaciones/Notificaciones';
import Respaldos from '../components/Backup/Backup';

import { FaBars, FaTimes, FaCog, FaUsers, FaHome, FaBox, FaHeadset, FaArrowRight, FaHistory, FaLeaf, FaSignOutAlt } from 'react-icons/fa';
import { SlEnergy } from "react-icons/sl";
import { HiClipboardList } from "react-icons/hi";
import { MdNotificationsActive } from "react-icons/md";
import { BsDatabaseFillGear } from "react-icons/bs";
import { MdFoodBank } from "react-icons/md";

import { ConfigProvider, useConfig } from '../context/config';
import { getActividadesAdmin, agregarActividadAdmin } from '../services/actividadAdminService';
import { getActividadAdminIcon } from '../utils/actividadAdminUtils';
import '../css/Home/home-admin.css';

import logoBalancea from '../img/Logo_balancea_modo_obscuro.png';
import logo from '../img/Logo_balancea_titulo.png';

const HomeAdmin = () => <ConfigProvider><Main /></ConfigProvider>;

const Main = () => {
  const navigate = useNavigate();
  const { t, darkMode } = useConfig();
  const [userData, setUserData] = useState(null);
  const [activeContent, setActiveContent] = useState(null);
  const [activeContentType, setActiveContentType] = useState('inicio');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [actividadesAdmin, setActividadesAdmin] = useState([]);
  const [ordenesRecientes, setOrdenesRecientes] = useState([]);
  const [loadingOrdenes, setLoadingOrdenes] = useState(true);
  
  const [statsData, setStatsData] = useState({
    suplementos: 0,
    ordenes: 0,
    usuarios: 0,
    notificaciones: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    const user = JSON.parse(localStorage.getItem('user'));
    setUserData(user);
    cargarActividadesAdmin();
    fetchStats();
    fetchOrdenesRecientes();
  }, [navigate]);

  const cargarActividadesAdmin = () => {
    const actividadesGuardadas = getActividadesAdmin();
    const actividadesFiltradas = actividadesGuardadas.filter(
      act => !(act.tipo === 'sesion' && act.accion === 'iniciar')
    );
    setActividadesAdmin(actividadesFiltradas);
  };

  const registrarActividadAdmin = (tipo, accion, descripcion) => {
    const nombreAdmin = userData?.nombre || 'Administrador';
    const nuevaActividad = agregarActividadAdmin(tipo, accion, descripcion, nombreAdmin);
    if (nuevaActividad) {
      setActividadesAdmin(prev => [nuevaActividad, ...prev]);
    }
  };

  const fetchOrdenesRecientes = async () => {
    try {
      setLoadingOrdenes(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://127.0.0.1:5000/ordenes/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      let ordenes = [];
      if (Array.isArray(data)) {
        ordenes = data;
      } else if (data.ordenes && Array.isArray(data.ordenes)) {
        ordenes = data.ordenes;
      } else if (data.data && Array.isArray(data.data)) {
        ordenes = data.data;
      }
      
      const ordenesSorted = ordenes
        .sort((a, b) => new Date(b.fecha_creacion || b.fecha) - new Date(a.fecha_creacion || a.fecha))
        .slice(0, 3);
      
      setOrdenesRecientes(ordenesSorted);
    } catch (error) {
      console.error('Error al obtener órdenes recientes:', error);
      setOrdenesRecientes([]);
    } finally {
      setLoadingOrdenes(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const token = localStorage.getItem('token');
      
      const extractArray = (data) => {
        if (Array.isArray(data)) return data;
        if (data?.suplementos && Array.isArray(data.suplementos)) return data.suplementos;
        if (data?.ordenes && Array.isArray(data.ordenes)) return data.ordenes;
        if (data?.users && Array.isArray(data.users)) return data.users;
        if (data?.data && Array.isArray(data.data)) return data.data;
        return [];
      };

      const suplementosRes = await fetch('http://127.0.0.1:5000/suplementos/?all=true', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const suplementosData = await suplementosRes.json();
      const suplementosArray = extractArray(suplementosData);
      const totalSuplementos = suplementosArray.length;

      const ordenesRes = await fetch('http://127.0.0.1:5000/ordenes/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const ordenesData = await ordenesRes.json();
      const ordenesArray = extractArray(ordenesData);
      const totalOrdenes = ordenesArray.length;

      const usuariosRes = await fetch('http://127.0.0.1:5000/user/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usuariosData = await usuariosRes.json();
      const usuariosArray = extractArray(usuariosData);
      const totalUsuarios = usuariosArray.length;

      const notificacionesRes = await fetch('http://127.0.0.1:5000/notificaciones/contador', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const notificacionesData = await notificacionesRes.json();
      const totalNotificaciones = notificacionesData.total_no_leidas || 0;

      setStatsData({
        suplementos: totalSuplementos,
        ordenes: totalOrdenes,
        usuarios: totalUsuarios,
        notificaciones: totalNotificaciones
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      setStatsData({
        suplementos: 0,
        ordenes: 0,
        usuarios: 0,
        notificaciones: 0
      });
    } finally {
      setLoadingStats(false);
    }
  };

  const loadContent = (type) => {
    setActiveContentType(type);
    const contentMap = {
      'users': <Users />,
      'configuracion': <Configuracion />,
      'especiales': <Especial />,
      'Ordenes': <Ordenes />,
      'Notificaciones': <Notificaciones />,
      'Respaldos': <Respaldos />
    };
    setActiveContent(contentMap[type] || null);
    if (!contentMap[type]) setActiveContentType('inicio');
    
    const nombreSeccion = {
      'users': 'Usuarios',
      'configuracion': 'Configuración',
      'especiales': 'Suplementos',
      'Ordenes': 'Órdenes',
      'Notificaciones': 'Notificaciones',
      'Respaldos': 'Respaldos'
    };
    if (type !== 'inicio' && nombreSeccion[type]) {
      registrarActividadAdmin(
        'navegacion',
        'acceder',
        `Accedió a la sección ${nombreSeccion[type]}`
      );
    }
  };

  const handleLogout = () => {
    registrarActividadAdmin('sesion', 'cerrar', 'Cerró sesión');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const formatTiempoRelativo = (fechaISO) => {
    if (!fechaISO) return 'Fecha no disponible';
    const fecha = new Date(fechaISO);
    const ahora = new Date();
    const diffMs = ahora - fecha;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);
    
    if (diffMin < 1) return 'Hace un momento';
    if (diffMin < 60) return `Hace ${diffMin} min${diffMin > 1 ? 's' : ''}`;
    if (diffHoras < 24) return `Hace ${diffHoras} h${diffHoras > 1 ? 's' : ''}`;
    if (diffDias < 7) return `Hace ${diffDias} d${diffDias > 1 ? 's' : ''}`;
    if (diffDias < 30) return `Hace ${Math.floor(diffDias / 7)} sem${Math.floor(diffDias / 7) > 1 ? 's' : ''}`;
    return fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getEstadoTexto = (estado) => {
    const estados = {
      'pendiente': 'Pendiente',
      'confirmada': 'Confirmada',
      'pagada': 'Pagada',
      'en_preparacion': 'En preparación',
      'enviada': 'Enviada',
      'entregada': 'Entregada',
      'cancelada': 'Cancelada',
      'reembolsada': 'Reembolsada'
    };
    return estados[estado] || estado || 'Desconocido';
  };

  const getEstadoClase = (estado) => {
    const clases = {
      'pendiente': 'pending',
      'confirmada': 'processing',
      'pagada': 'processing',
      'en_preparacion': 'processing',
      'enviada': 'processing',
      'entregada': 'delivered',
      'cancelada': 'cancelled',
      'reembolsada': 'cancelled'
    };
    return clases[estado] || 'pending';
  };

  const stats = [
    { icon: FaBox, label: 'Suplementos', count: statsData.suplementos },
    { icon: HiClipboardList, label: 'Órdenes', count: statsData.ordenes },
    { icon: FaUsers, label: 'Usuarios', count: statsData.usuarios },
    { icon: MdNotificationsActive, label: 'Notificaciones', count: statsData.notificaciones }
  ];

  const quickAccess = [
    { icon: MdFoodBank, title: 'Gestionar', subtitle: 'Suplementos', action: 'especiales' },
    { icon: HiClipboardList, title: 'Ver', subtitle: 'Órdenes', action: 'Ordenes' },
    { icon: FaUsers, title: 'Administrar', subtitle: 'Usuarios', action: 'users' },
    { icon: MdNotificationsActive, title: 'Ver', subtitle: 'Notificaciones', action: 'Notificaciones' },
    { icon: FaCog, title: 'Configurar', subtitle: 'Sistema', action: 'configuracion' }
  ];

  const menuItems = [
    { icon: FaHome, label: 'Inicio', type: 'inicio' },
    { icon: FaUsers, label: 'Usuarios', type: 'users' },
    { icon: SlEnergy, label: 'Suplementos', type: 'especiales' },
    { icon: HiClipboardList, label: 'Órdenes', type: 'Ordenes' },
    { icon: MdNotificationsActive, label: 'Notificaciones', type: 'Notificaciones' },
    { icon: BsDatabaseFillGear, label: 'Respaldos', type: 'Respaldos' },
    { icon: FaCog, label: 'Configuración', type: 'configuracion' }
  ];

  const renderInicio = () => (
    <div className="home-ad-dashboard">
      <div className="home-ad-welcome-banner">
        <h2 className="home-ad-welcome-title">Bienvenido al Panel de Administrador</h2>
        <p className="home-ad-welcome-subtitle">Seleccione algo del menú para continuar</p>
      </div>

      <div className="home-ad-stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="home-ad-stat-card">
            <div className="home-ad-stat-icon" style={{ background: '#eef3e8', color: '#50831d' }}>
              <s.icon />
            </div>
            <div className="home-ad-stat-info">
              <span className="home-ad-stat-label">{s.label}</span>
              <span className="home-ad-stat-count">
                {loadingStats ? '...' : s.count}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="home-ad-quick-access">
        <div className="home-ad-quick-header">
          <FaBox className="home-ad-quick-icon" />
          <h3>Acceso Rápido</h3>
        </div>
        <div className="home-ad-quick-grid">
          {quickAccess.map((item, i) => (
            <button key={i} className="home-ad-quick-btn" onClick={() => loadContent(item.action)}>
              <item.icon />
              <div className="home-ad-quick-text">
                <span className="home-ad-quick-title">{item.title}</span>
                <span className="home-ad-quick-subtitle">{item.subtitle}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="home-ad-bottom-grid">
        <div className="home-ad-recent-orders">
          <div className="home-ad-recent-header">
            <HiClipboardList className="home-ad-recent-icon" />
            <h3>Órdenes Recientes</h3>
          </div>
          <div className="home-ad-recent-list">
            {loadingOrdenes ? (
              <div className="home-ad-recent-item">
                <span className="home-ad-order-id">Cargando...</span>
              </div>
            ) : ordenesRecientes.length > 0 ? (
              ordenesRecientes.map((orden) => (
                <div key={orden.id} className="home-ad-recent-item">
                  <span className="home-ad-order-id">#{orden.codigo || orden.id}</span>
                  <span className={`home-ad-order-status ${getEstadoClase(orden.estado)}`}>
                    {getEstadoTexto(orden.estado)}
                  </span>
                  <span className="home-ad-order-date">
                    {formatTiempoRelativo(orden.fecha_creacion || orden.fecha)}
                  </span>
                </div>
              ))
            ) : (
              <div className="home-ad-no-activity">
                <p>No hay órdenes</p>
              </div>
            )}
          </div>
        </div>

        <div className="home-ad-recent-activity">
          <div className="home-ad-recent-header">
            <FaHistory className="home-ad-recent-icon" />
            <h3>Actividad Reciente</h3>
          </div>
          <div className="home-ad-recent-list">
            {actividadesAdmin.length > 0 ? 
              actividadesAdmin
                .filter(a => !(a.tipo === 'sesion' && a.accion === 'iniciar'))
                .slice(0, 3)
                .map((a) => {
                  const { icon: Icon, label } = getActividadAdminIcon(a.tipo, a.accion);
                  return (
                    <div key={a.id} className="home-ad-recent-item">
                      <div className="home-ad-activity-icon" style={{ background: '#eef3e8' }}>
                        <Icon style={{ color: '#50831d', fontSize: '0.9rem' }} />
                      </div>
                      <div className="home-ad-activity-info">
                        <span className="home-ad-activity-text">{a.descripcion}</span>
                        <span className="home-ad-activity-date">{formatTiempoRelativo(a.fecha)}</span>
                      </div>
                    </div>
                  );
                }) : (
              <div className="home-ad-no-activity">
                <p>No hay actividad reciente</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`home-ad-container ${darkMode ? 'dark-mode' : ''}`}>
      <button className={`home-ad-sidebar-toggle ${sidebarOpen ? 'open' : ''}`} onClick={toggleSidebar}>
        {sidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      <aside className={`home-ad-sidebar ${sidebarOpen ? 'open' : 'closed'} ${darkMode ? 'dark-mode' : ''}`}>
        <div className="home-ad-sidebar-header">
          <div className="home-ad-admin-logo">
            <img src={logoBalancea} alt="Balancea" className="home-ad-admin-logo-img" />
          </div>
          <div className="home-ad-admin-user-info">
            <div className="home-ad-admin-user-top">
              <div className="home-ad-admin-avatar">
                <FaLeaf className="home-ad-admin-avatar-icon" />
              </div>
              <h3 className="home-ad-admin-user-name">{userData?.nombre || 'Administrador'}</h3>
            </div>
            <p className="home-ad-admin-user-email">{userData?.correo || 'admin@balancea.com'}</p>
            <span className="home-ad-admin-user-role">Administrador</span>
          </div>
        </div>

        <nav className="home-ad-sidebar-nav">
          {menuItems.map((item) => (
            <button key={item.type} className={`home-ad-nav-btn ${activeContentType === item.type ? 'active' : ''}`} onClick={() => loadContent(item.type)}>
              <item.icon className="home-ad-nav-icon" /> {item.label}
            </button>
          ))}
          <button className="home-ad-nav-btn home-ad-logout-btn" onClick={handleLogout}>
            <FaSignOutAlt className="home-ad-nav-icon" />
            Cerrar Sesión
          </button>
        </nav>

        <div className="home-ad-sidebar-footer">
          <div className="home-ad-support-box">
            <FaHeadset className="home-ad-support-icon" />
            <div className="home-ad-support-info">
              <span className="home-ad-support-title">Soporte</span>
              <span className="home-ad-support-hours">24 horas</span>
            </div>
          </div>
        </div>
      </aside>

      <main className={`home-ad-main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="home-ad-content-wrapper">
          <div className="home-ad-header-section">
            <div className="home-ad-header-left"></div>
            <div className="home-ad-header-center">
              <img src={logo} alt="Balancea" className="home-ad-header-logo-center" />
            </div>
            <button className="home-ad-logout-btn-header" onClick={handleLogout}>Cerrar Sesión</button>
          </div>
          <div className="home-ad-header-line"></div>
          <div className="home-ad-dynamic-content">
            {activeContentType === 'inicio' ? renderInicio() : (
              activeContent || <div className="home-ad-welcome-message"><h3>Bienvenido al Panel de Administración</h3><p>Selecciona una opción del menú lateral</p></div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomeAdmin;