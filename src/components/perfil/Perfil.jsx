import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../../context/config';
import '../../css/Perfil/perfil.css';

// Componentes
import ModalEditarPerfil from './PerfilForm';
import ModalGestionarDirecciones from './DireccionesList';
import ModalAgregarDireccion from './CreateDireccion';
import ModalCambiarPassword from './ModalCambiarPassword';
import ModalGestionarTarjetas from './TarjetasList';
import ModalAgregarTarjeta from './ModalAgregarTarjeta';
import ModalInformacionSistema from './ModalInformacion';

// Iconos
import { FaArrowLeft, FaMapMarkerAlt, FaCreditCard, FaBox, FaHeart, FaStar, FaPhone, FaEnvelope, FaUserShield, FaUser, FaIdCard, FaHistory, FaPlus, FaShieldAlt, FaKey, FaChevronRight, FaEdit, FaCalendarAlt, FaShoppingBag, FaInfoCircle } from 'react-icons/fa';
import { HiOutlineCalendarDateRange, HiOutlineShoppingBag } from "react-icons/hi2";
import { VscHome, VscSettings, VscVersions } from "react-icons/vsc";
import { SlLocationPin } from "react-icons/sl";
import { MdOutlineSecurity, MdOutlineSystemUpdate } from "react-icons/md";
import { FaGear } from "react-icons/fa6";

const Perfil = () => {
  const navigate = useNavigate();
  const { darkMode } = useConfig();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [direcciones, setDirecciones] = useState([]);
  const [tarjetas, setTarjetas] = useState([]);
  const [pedidos, setPedidos] = useState(0);
  const [productosFav, setProductosFav] = useState(0);
  const [loadingDirecciones, setLoadingDirecciones] = useState(false);
  const [loadingTarjetas, setLoadingTarjetas] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [paisUsuario, setPaisUsuario] = useState('México');
  
  // Estados para los modales
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDireccionesModal, setShowDireccionesModal] = useState(false);
  const [showAgregarDireccionModal, setShowAgregarDireccionModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showTarjetasModal, setShowTarjetasModal] = useState(false);
  const [showAgregarTarjetaModal, setShowAgregarTarjetaModal] = useState(false);
  const [showSistemaModal, setShowSistemaModal] = useState(false);
  const [direccionToEdit, setDireccionToEdit] = useState(null);
  const [tarjetaToEdit, setTarjetaToEdit] = useState(null);
  const [direccionesMostrar, setDireccionesMostrar] = useState([]);

  const isAuthenticated = localStorage.getItem('token') !== null;

  // Actividades recientes
  const actividadesRecientes = [
    { id: 1, icon: HiOutlineShoppingBag, text: "Pedido #1234 - Entregado", date: "Hace 2 días", circleColor: "#eef3e8", iconColor: "#426a1c" },
    { id: 2, icon: FaCreditCard, text: "Tarjeta agregada", date: "Hace 5 días", circleColor: "#eef3e8", iconColor: "#426a1c" },
    { id: 3, icon: FaMapMarkerAlt, text: "Nueva dirección agregada", date: "Hace 1 semana", circleColor: "#eef3e8", iconColor: "#426a1c" },
    { id: 4, icon: FaHeart, text: "Producto añadido a favoritos", date: "Hace 2 semanas", circleColor: "#eef3e8", iconColor: "#426a1c" }
  ];

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (userData) {
      fetchDirecciones();
      fetchTarjetas();
      setPedidos(12);
      setProductosFav(8);
    }
  }, [userData]);

  // Actualizar país cuando cambien las direcciones
  useEffect(() => {
    if (direcciones.length > 0) {
      const direccionPrincipal = direcciones.find(dir => dir.predeterminada) || direcciones[0];
      if (direccionPrincipal && direccionPrincipal.pais) {
        setPaisUsuario(direccionPrincipal.pais);
      } else if (direccionPrincipal && direccionPrincipal.estado) {
        setPaisUsuario(direccionPrincipal.estado);
      } else {
        setPaisUsuario('México');
      }
    }
  }, [direcciones]);

  // Filtrar direcciones para mostrar: predeterminada + segunda dirección
  useEffect(() => {
    if (direcciones.length > 0) {
      const predeterminada = direcciones.find(d => d.predeterminada === true);
      const segunda = direcciones.find(d => d.predeterminada !== true);
      const mostrar = [];
      if (predeterminada) mostrar.push(predeterminada);
      if (segunda) mostrar.push(segunda);
      setDireccionesMostrar(mostrar);
    } else {
      setDireccionesMostrar([]);
    }
  }, [direcciones]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/user/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDirecciones = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoadingDirecciones(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/direcciones/me/direcciones', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDirecciones(data.direcciones || []);
      }
    } catch (error) {
      console.error('Error al obtener direcciones:', error);
    } finally {
      setLoadingDirecciones(false);
    }
  };

  const fetchTarjetas = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoadingTarjetas(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/tarjetas/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTarjetas(data.tarjetas || []);
      }
    } catch (error) {
      console.error('Error al obtener tarjetas:', error);
    } finally {
      setLoadingTarjetas(false);
    }
  };

  // Función para eliminar dirección
  const handleDeleteDireccion = async (direccionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:5000/direcciones/${direccionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchDirecciones();
        return true;
      } else {
        alert('Error al eliminar la dirección');
        return false;
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
      return false;
    }
  };

  // Función para establecer dirección predeterminada
  const handleSetDireccionPredeterminada = async (direccionId) => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(`http://127.0.0.1:5000/direcciones/${direccionId}/predeterminada`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: user.id || userData?.id })
      });

      if (response.ok) {
        await fetchDirecciones();
        return true;
      } else {
        alert('Error al actualizar dirección predeterminada');
        return false;
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
      return false;
    }
  };

  // Función para guardar dirección (agregar o editar)
  const handleSaveDireccion = async (direccionData) => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const dataToSend = {
        ...direccionData,
        user_id: user.id || userData?.id
      };
      
      const url = direccionToEdit 
        ? `http://127.0.0.1:5000/direcciones/${direccionToEdit.id}`
        : 'http://127.0.0.1:5000/direcciones/me/add_direccion';
        
      const method = direccionToEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        await fetchDirecciones();
        setShowAgregarDireccionModal(false);
        setDireccionToEdit(null);
        setSuccessMessage(direccionToEdit ? 'Dirección actualizada correctamente' : 'Dirección agregada correctamente');
        setTimeout(() => setSuccessMessage(''), 3000);
        return Promise.resolve();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.msg || 'No se pudo guardar la dirección'}`);
        return Promise.reject(errorData);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
      return Promise.reject(error);
    }
  };

  // Función para eliminar tarjeta
  const handleDeleteTarjeta = async (tarjetaId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:5000/tarjetas/${tarjetaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchTarjetas();
        setSuccessMessage('Tarjeta eliminada correctamente');
        setTimeout(() => setSuccessMessage(''), 3000);
        return true;
      } else {
        alert('Error al eliminar la tarjeta');
        return false;
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
      return false;
    }
  };

  // Función para establecer tarjeta predeterminada
  const handleSetTarjetaPredeterminada = async (tarjetaId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:5000/tarjetas/${tarjetaId}/predeterminada`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchTarjetas();
        setSuccessMessage('Tarjeta predeterminada actualizada');
        setTimeout(() => setSuccessMessage(''), 3000);
        return true;
      } else {
        alert('Error al actualizar tarjeta predeterminada');
        return false;
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
      return false;
    }
  };

  // Función para agregar/editar tarjeta
  const handleSaveTarjeta = async (tarjetaData) => {
    try {
      const token = localStorage.getItem('token');
      const url = tarjetaToEdit 
        ? `http://127.0.0.1:5000/tarjetas/${tarjetaToEdit.id}`
        : 'http://127.0.0.1:5000/tarjetas/me/add_tarjeta';
      const method = tarjetaToEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tarjetaData)
      });

      if (response.ok) {
        await fetchTarjetas();
        setShowAgregarTarjetaModal(false);
        setTarjetaToEdit(null);
        setSuccessMessage(tarjetaToEdit ? 'Tarjeta actualizada correctamente' : 'Tarjeta agregada correctamente');
        setTimeout(() => setSuccessMessage(''), 3000);
        return Promise.resolve();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.msg || 'No se pudo guardar la tarjeta'}`);
        return Promise.reject(errorData);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
      return Promise.reject(error);
    }
  };

  // Función para abrir modal de edición de dirección
  const handleEditDireccion = (direccion) => {
    setDireccionToEdit(direccion);
    setShowAgregarDireccionModal(true);
  };

  // Función para abrir modal de agregar dirección
  const handleAddDireccion = () => {
    setDireccionToEdit(null);
    setShowAgregarDireccionModal(true);
  };

  // Función para abrir modal de agregar tarjeta
  const handleAddTarjeta = () => {
    setTarjetaToEdit(null);
    setShowAgregarTarjetaModal(true);
  };

  // Función para abrir modal de edición de tarjeta
  const handleEditTarjeta = (tarjeta) => {
    setTarjetaToEdit(tarjeta);
    setShowAgregarTarjetaModal(true);
  };

  // Función para actualizar el perfil
  const handleUpdateProfile = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/user/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.nombre,
          email: formData.correo,
          telefono: formData.telefono,
          sexo: formData.sexo
        })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUserData(updatedUser.user);
        setSuccessMessage('Perfil actualizado exitosamente');
        setTimeout(() => setSuccessMessage(''), 3000);
        return Promise.resolve();
      } else {
        const errorData = await response.json();
        alert(`❌ Error: ${errorData.msg || 'Error al actualizar el perfil'}`);
        return Promise.reject(errorData);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error de conexión');
      return Promise.reject(error);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const getInitials = () => {
    if (!userData?.nombre) return '?';
    const nombres = userData.nombre.split(' ');
    if (nombres.length >= 2) {
      return (nombres[0][0] + nombres[1][0]).toUpperCase();
    }
    return userData.nombre.substring(0, 2).toUpperCase();
  };

  const formatFechaRegistro = () => {
    if (!userData?.fecha_registro) return 'No disponible';
    
    try {
      let fecha = new Date(userData.fecha_registro);
      if (isNaN(fecha.getTime())) return 'No disponible';
      return fecha.toLocaleDateString('es-MX', { 
        year: 'numeric', 
        month: 'short' 
      });
    } catch (error) {
      return 'No disponible';
    }
  };

  if (loading) {
    return (
      <div className={`perfil-container ${darkMode ? 'dark-mode' : ''}`}>
        <div className="perfil-loading-spinner"></div>
        <p style={{textAlign: 'center', color: darkMode ? '#e2e8f0' : '#666'}}>
          Cargando perfil...
        </p>
      </div>
    );
  }

  return (
    <div className={`perfil-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Hero Banner */}
      <div className="perfil-hero-banner">
        <div className="perfil-hero-container">
          <div className="perfil-hero-header">
            <button className="perfil-back-button" onClick={() => navigate(-1)}>
              <FaArrowLeft />
            </button>
            <div className="perfil-title-wrapper">
              <h1 className="perfil-hero-title">Mi Perfil</h1>
              <p className="perfil-hero-description">Administra tu información personal,</p>
              <p className="perfil-hero-description">direcciones y preferencias de tu cuenta.</p>
              <div className="perfil-hero-line"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="perfil-content">
        {successMessage && (
          <div className="perfil-message-container success">
            <div className="perfil-message-icon">✓</div>
            <div className="perfil-message-text">{successMessage}</div>
          </div>
        )}

        {!isAuthenticated && (
          <div className="perfil-warning-container">
            <div className="perfil-warning-icon">⚠️</div>
            <div className="perfil-warning-text">
              <h4>Inicia sesión para gestionar tu perfil</h4>
              <p>Para guardar tus datos personales y acceder a todas las funciones, necesitas iniciar sesión.</p>
              <button onClick={handleLoginRedirect} className="perfil-primary-btn">
                Iniciar Sesión
              </button>
            </div>
          </div>
        )}

        {isAuthenticated && userData && (
          <>
            {/* Fila principal: Tarjeta de info + 4 cuadros de estadísticas */}
            <div className="perfil-main-row">
              {/* Tarjeta de Información Personal */}
              <div className="perfil-info-card">
                <div className="perfil-info-left">
                  <div className="perfil-avatar-circle">
                    <span className="perfil-avatar-initials">{getInitials()}</span>
                  </div>
                  <div className="perfil-info-details">
                    <h2 className="perfil-info-name">{userData.nombre || 'Usuario'}</h2>
                    <span className={`perfil-info-role ${userData.rol === 'admin' ? 'role-admin' : 'role-user'}`}>
                      <FaUserShield className="role-icon" />
                      {userData.rol === 'admin' ? 'Administrador' : 'Usuario'}
                    </span>
                    <div className="perfil-info-contact">
                      <p><FaEnvelope className="contact-icon" /> {userData.correo || 'correo@ejemplo.com'}</p>
                      <p><FaPhone className="contact-icon" /> {userData.telefono || 'No especificado'}</p>
                    </div>
                    <div className="perfil-info-country">
                      <p><SlLocationPin className="contact-icon"/> {paisUsuario}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid de 4 cuadros de estadísticas */}
              <div className="perfil-stats-grid">
                <div className="perfil-stat-card">
                  <div className="perfil-stat-icon" style={{ background: '#eef3e8', color: '#50831d' }}>
                    <HiOutlineCalendarDateRange />
                  </div>
                  <h3 className="perfil-stat-title">Miembro desde</h3>
                  <p className="perfil-stat-value">{formatFechaRegistro()}</p>
                </div>
                <div className="perfil-stat-card">
                  <div className="perfil-stat-icon" style={{ background: '#eef3e8', color: '#50831d' }}>
                    <VscHome />
                  </div>
                  <h3 className="perfil-stat-title">Direcciones</h3>
                  <p className="perfil-stat-value">{direcciones.length}</p>
                </div>
                <div className="perfil-stat-card">
                  <div className="perfil-stat-icon" style={{ background: '#eef3e8', color: '#50831d' }}>
                    <FaCreditCard />
                  </div>
                  <h3 className="perfil-stat-title">Tarjetas</h3>
                  <p className="perfil-stat-value">{tarjetas.length}</p>
                </div>
                <div className="perfil-stat-card">
                  <div className="perfil-stat-icon" style={{ background: '#eef3e8', color: '#50831d' }}>
                    <HiOutlineShoppingBag />
                  </div>
                  <h3 className="perfil-stat-title">Pedidos realizados</h3>
                  <p className="perfil-stat-value">{pedidos}</p>
                </div>
              </div>
            </div>

            {/* Segunda fila: 4 cuadros grandes */}
            <div className="perfil-second-row">
              {/* Cuadro 1: Información Personal */}
              <div className="perfil-info-section">
                <div className="perfil-section-title">
                  <FaUser className="section-icon" />
                  <h3>Información Personal</h3>
                  <button className="section-edit-btn" onClick={() => setShowEditModal(true)}>
                    <FaEdit /> Editar Perfil
                  </button>
                </div>
                <div className="perfil-section-content">
                  <div className="info-row">
                    <div className="row-icon-circle">
                      <FaIdCard className="row-icon" />
                    </div>
                    <div className="row-details">
                      <span className="row-label">nombre completo</span>
                      <span className="row-value">{userData.nombre || 'No especificado'}</span>
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="row-icon-circle">
                      <FaEnvelope className="row-icon" />
                    </div>
                    <div className="row-details">
                      <span className="row-label">correo electrónico</span>
                      <span className="row-value">{userData.correo || 'No especificado'}</span>
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="row-icon-circle">
                      <FaPhone className="row-icon" />
                    </div>
                    <div className="row-details">
                      <span className="row-label">teléfono</span>
                      <span className="row-value">{userData.telefono || 'No especificado'}</span>
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="row-icon-circle">
                      <FaUser className="row-icon" />
                    </div>
                    <div className="row-details">
                      <span className="row-label">sexo</span>
                      <span className="row-value">{userData.sexo || 'No especificado'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cuadro 2: Actividad Reciente */}
              <div className="perfil-info-section">
                <div className="perfil-section-title">
                  <FaHistory className="section-icon" />
                  <h3>Actividad Reciente</h3>
                </div>
                <div className="perfil-section-content">
                  {actividadesRecientes.map((actividad) => (
                    <div key={actividad.id} className="activity-row">
                      <div 
                        className="activity-icon-circle" 
                        style={{ background: actividad.circleColor }}
                      >
                        <actividad.icon 
                          className="activity-icon" 
                          style={{ color: actividad.iconColor }} 
                        />
                      </div>
                      <div className="activity-details">
                        <span className="activity-text">{actividad.text}</span>
                        <span className="activity-date">{actividad.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cuadro 3: Mis Direcciones */}
              <div className="perfil-info-section">
                <div className="perfil-section-title">
                  <FaMapMarkerAlt className="section-icon" />
                  <h3>Mis Direcciones</h3>
                  <button className="section-manage-btn" onClick={() => setShowDireccionesModal(true)}>
                    <FaGear/> Gestionar
                  </button>
                </div>
                <div className="perfil-section-content" style={{ padding: '0.8rem' }}>
                  <div className="direcciones-list">
                    {direccionesMostrar.length > 0 ? (
                      direccionesMostrar.map((direccion) => (
                        <div key={direccion.id} className="direccion-item" style={{ padding: '0.5rem', marginBottom: '0.5rem' }}>
                          <div className="direccion-header" style={{ marginBottom: '0.25rem', gap: '0.3rem' }}>
                            <div className="direccion-icon-circle" style={{ width: '22px', height: '22px' }}>
                              <VscHome className="direccion-icon" style={{ fontSize: '0.65rem' }} />
                            </div>
                            <span className="direccion-label" style={{ fontSize: '0.6rem', fontWeight: '600' }}>
                              {direccion.predeterminada ? 'Dirección principal' : 'Dirección secundaria'}
                            </span>
                            {direccion.predeterminada && (
                              <span className="direccion-badge" style={{ fontSize: '0.5rem', padding: '0.1rem 0.3rem' }}>Predeterminada</span>
                            )}
                          </div>
                          <p className="direccion-text" style={{ fontSize: '0.65rem', margin: '0 0 0.1rem 0', lineHeight: '1.3', paddingLeft: '1.5rem' }}>
                            {direccion.calle} {direccion.numero_exterior}, {direccion.colonia}, {direccion.ciudad}, {direccion.estado}
                          </p>
                          <p className="direccion-cp" style={{ fontSize: '0.6rem', color: '#999', margin: 0, paddingLeft: '1.5rem' }}>
                            CP: {direccion.codigo_postal}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="no-direccion" style={{ fontSize: '0.7rem', padding: '0.5rem' }}>
                        <p>No tienes direcciones guardadas</p>
                      </div>
                    )}
                  </div>
                  <button className="add-direccion-btn" onClick={handleAddDireccion} style={{ padding: '0.4rem', fontSize: '0.65rem', marginTop: '0.3rem' }}>
                    <FaPlus /> Agregar nueva dirección
                  </button>
                </div>
              </div>

              {/* Cuadro 4: Seguridad */}
              <div className="perfil-info-section">
                <div className="perfil-section-title">
                  <MdOutlineSecurity className="section-icon" />
                  <h3>Seguridad</h3>
                </div>
                <div className="perfil-section-content">
                  <button className="security-btn" onClick={() => setShowPasswordModal(true)}>
                    <div className="security-btn-left">
                      <div className="security-icon-circle">
                        <FaKey />
                      </div>
                      <div className="security-text">
                        <span className="security-title">Cambiar contraseña</span>
                        <span className="security-desc">Administrar tus contraseñas</span>
                      </div>
                    </div>
                    <FaChevronRight className="security-arrow" />
                  </button>

                  <button className="security-btn" style={{ marginTop: '0.75rem' }} onClick={() => setShowTarjetasModal(true)}>
                    <div className="security-btn-left">
                      <div className="security-icon-circle">
                        <FaCreditCard />
                      </div>
                      <div className="security-text">
                        <span className="security-title">Administrar tarjetas</span>
                        <span className="security-desc">Gestiona tus métodos de pago</span>
                      </div>
                    </div>
                    <FaChevronRight className="security-arrow" />
                  </button>

                  <button className="security-btn" style={{ marginTop: '0.75rem' }} onClick={() => setShowSistemaModal(true)}>
                    <div className="security-btn-left">
                      <div className="security-icon-circle">
                        <FaInfoCircle />
                      </div>
                      <div className="security-text">
                        <span className="security-title">Información del Sistema</span>
                        <span className="security-desc">Conoce un poco de Balancea</span>
                      </div>
                    </div>
                    <FaChevronRight className="security-arrow" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de Editar Perfil */}
      <ModalEditarPerfil 
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        userData={userData}
        onSave={handleUpdateProfile}
      />

      {/* Modal de Gestionar Direcciones */}
      <ModalGestionarDirecciones 
        isOpen={showDireccionesModal}
        onClose={() => setShowDireccionesModal(false)}
        direcciones={direcciones}
        onDelete={handleDeleteDireccion}
        onSetPredeterminada={handleSetDireccionPredeterminada}
        onAdd={handleAddDireccion}
        onEdit={handleEditDireccion}
        userData={userData}
        showAddButton={false}
        showSetDefaultButton={true}
        isCheckout={false}
      />

      {/* Modal de Agregar/Editar Dirección */}
      <ModalAgregarDireccion 
        isOpen={showAgregarDireccionModal}
        onClose={() => {
          setShowAgregarDireccionModal(false);
          setDireccionToEdit(null);
        }}
        onSave={handleSaveDireccion}
        direccionToEdit={direccionToEdit}
      />

      {/* Modal de Cambiar Contraseña */}
      <ModalCambiarPassword 
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        isAuthenticated={isAuthenticated}
        navigate={navigate}
      />

      {/* Modal de Gestionar Tarjetas */}
      <ModalGestionarTarjetas 
        isOpen={showTarjetasModal}
        onClose={() => setShowTarjetasModal(false)}
        tarjetas={tarjetas}
        onDelete={handleDeleteTarjeta}
        onSetPredeterminada={handleSetTarjetaPredeterminada}
        onAdd={handleAddTarjeta}
        onEdit={handleEditTarjeta}
        userData={userData}
        showAddButton={true}
        isCheckout={false}
      />

      {/* Modal de Agregar/Editar Tarjeta */}
      <ModalAgregarTarjeta 
        isOpen={showAgregarTarjetaModal}
        onClose={() => {
          setShowAgregarTarjetaModal(false);
          setTarjetaToEdit(null);
        }}
        userData={userData}
        tarjetas={tarjetas}
        onSuccess={() => {
          fetchTarjetas();
          setShowAgregarTarjetaModal(false);
        }}
      />

      {/* Modal de Información del Sistema */}
      <ModalInformacionSistema 
        isOpen={showSistemaModal}
        onClose={() => setShowSistemaModal(false)}
      />
    </div>
  );
};

export default Perfil;