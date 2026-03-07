import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../../context/config';
import PerfilHeader from './PerfilHeader';
import PerfilUserInfo from './PerfilUserInfo';
import PerfilForm from './PerfilForm';
import DireccionesList from './DireccionesList';
import TarjetasList from './TarjetasList';
import ModalCambiarPassword from './ModalCambiarPassword';
import ModalAgregarTarjeta from './ModalAgregarTarjeta';
import ModalGestionarDirecciones from './ModalGestionarDirecciones';
import '../../css/Perfil/perfil.css';

const Perfil = () => {
  const navigate = useNavigate();
  const { t, darkMode } = useConfig();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDirecciones, setLoadingDirecciones] = useState(false);
  const [loadingTarjetas, setLoadingTarjetas] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAddTarjetaModal, setShowAddTarjetaModal] = useState(false);
  const [showDireccionesModal, setShowDireccionesModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [profileForm, setProfileForm] = useState({
    nombre: '',
    telefono: '',
    sexo: '',
    correo: ''
  });

  const [direcciones, setDirecciones] = useState([]);
  const [direccionesForm, setDireccionesForm] = useState([{
    calle: '',
    numero_exterior: '',
    numero_interior: '',
    colonia: '',
    ciudad: '',
    estado: '',
    codigo_postal: '',
    referencias: '',
    tipo: 'casa',
    predeterminada: true
  }]);

  const [tarjetas, setTarjetas] = useState([]);

  const isAuthenticated = localStorage.getItem('token') !== null;

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
    }
  }, [userData]);

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
        setProfileForm({
          nombre: data.nombre || '',
          telefono: data.telefono || '',
          sexo: data.sexo || '',
          correo: data.correo || ''
        });
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDirecciones = async () => {
    if (!isAuthenticated || !userData?.id) return;
    
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

  const handleUpdateProfile = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/user/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUserData(updatedUser.user);
        setSuccessMessage('Perfil actualizado exitosamente');
        setEditingProfile(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errorData = await response.json();
        alert(`❌ Error: ${errorData.msg || 'Error al actualizar el perfil'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error de conexión');
    }
  };

  const handleDeleteDireccion = async (direccionId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta dirección?')) return;
    
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
        setSuccessMessage('Dirección eliminada exitosamente');
        fetchDirecciones();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errorData = await response.json();
        alert(`❌ Error: ${errorData.msg || 'Error al eliminar la dirección'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error de conexión');
    }
  };

  const handleDeleteTarjeta = async (tarjetaId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta tarjeta?')) return;
    
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
        setSuccessMessage('Tarjeta eliminada exitosamente');
        fetchTarjetas();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errorData = await response.json();
        alert(`❌ Error: ${errorData.msg || 'Error al eliminar la tarjeta'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error de conexión');
    }
  };

  const handleSetTarjetaPredeterminada = async (tarjetaId) => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(`http://127.0.0.1:5000/tarjetas/user/${user.id}/predeterminada/${tarjetaId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSuccessMessage('Tarjeta predeterminada actualizada');
        fetchTarjetas();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errorData = await response.json();
        alert(`❌ Error: ${errorData.msg || 'Error al actualizar'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error de conexión');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  const handleLoginRedirect = () => {
    navigate('/login');
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
      <PerfilHeader 
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        onLoginRedirect={handleLoginRedirect}
      />

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
              <p>Para guardar tus datos personales, cambiar contraseña y acceder a todas las funciones, necesitas iniciar sesión.</p>
              <button onClick={handleLoginRedirect} className="perfil-primary-btn">
                Iniciar Sesión
              </button>
            </div>
          </div>
        )}

        <div className="perfil-card">
          <PerfilUserInfo 
            userData={userData}
            isAuthenticated={isAuthenticated}
            direccionesCount={direcciones.length}
            tarjetasCount={tarjetas.length}
          />

          <PerfilForm 
            profileForm={profileForm}
            setProfileForm={setProfileForm}
            editingProfile={editingProfile}
            setEditingProfile={setEditingProfile}
            isAuthenticated={isAuthenticated}
            onSave={handleUpdateProfile}
            userData={userData}
          />

          <DireccionesList 
            direcciones={direcciones}
            loading={loadingDirecciones}
            isAuthenticated={isAuthenticated}
            onDelete={handleDeleteDireccion}
            onGestionar={() => {
              setDireccionesForm(direcciones.length > 0 ? direcciones : [{
                calle: '',
                numero_exterior: '',
                numero_interior: '',
                colonia: '',
                ciudad: '',
                estado: '',
                codigo_postal: '',
                referencias: '',
                tipo: 'casa',
                predeterminada: true
              }]);
              setShowDireccionesModal(true);
            }}
          />

          <TarjetasList 
            tarjetas={tarjetas}
            loading={loadingTarjetas}
            isAuthenticated={isAuthenticated}
            onDelete={handleDeleteTarjeta}
            onSetPredeterminada={handleSetTarjetaPredeterminada}
            onAgregar={() => setShowAddTarjetaModal(true)}
            userData={userData}
          />

          <div className="perfil-security-section">
            <div className="perfil-section-header">
              <h3>Seguridad</h3>
            </div>
            <div className="perfil-security-content">
              <div className="perfil-security-info">
                <p className="perfil-security-note">
                  {isAuthenticated 
                    ? "Para cambiar tu contraseña, necesitarás ingresar tu contraseña actual. La nueva contraseña debe tener al menos 6 caracteres."
                    : "Inicia sesión para acceder a las opciones de seguridad y cambiar tu contraseña."
                  }
                </p>
                <button 
                  className="perfil-verify-code-btn"
                  onClick={() => {
                    if (!isAuthenticated) {
                      alert('⚠️ Debes iniciar sesión para cambiar tu contraseña');
                      navigate('/login');
                      return;
                    }
                    setShowPasswordModal(true);
                  }}
                  disabled={!isAuthenticated}
                >
                  <img src={require('../../img/password.png')} alt="Contraseña" className="perfil-btn-icon-img" />
                  {isAuthenticated ? "Cambiar Contraseña" : "Inicia sesión primero"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ModalCambiarPassword 
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        isAuthenticated={isAuthenticated}
        navigate={navigate}
      />

      <ModalAgregarTarjeta 
        isOpen={showAddTarjetaModal}
        onClose={() => setShowAddTarjetaModal(false)}
        userData={userData}
        tarjetas={tarjetas}
        onSuccess={() => {
          fetchTarjetas();
          setSuccessMessage('Tarjeta agregada exitosamente');
          setTimeout(() => setSuccessMessage(''), 3000);
        }}
      />

      <ModalGestionarDirecciones 
        isOpen={showDireccionesModal}
        onClose={() => setShowDireccionesModal(false)}
        direccionesForm={direccionesForm}
        setDireccionesForm={setDireccionesForm}
        isAuthenticated={isAuthenticated}
        onSuccess={() => {
          fetchDirecciones();
          setSuccessMessage('Direcciones actualizadas exitosamente');
          setTimeout(() => setSuccessMessage(''), 3000);
        }}
      />
    </div>
  );
};

export default Perfil;