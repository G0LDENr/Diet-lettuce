import React from 'react';
import userIcon from '../../img/user.png';

const PerfilUserInfo = ({ userData, isAuthenticated, direccionesCount, tarjetasCount }) => {
  return (
    <div className="perfil-user-info-section" style={{
      backgroundColor: '#f9f9f9',
      borderRadius: '15px',
      padding: '30px',
      marginBottom: '30px',
      border: '1px solid #e0e0e0'
    }}>
      <div className="perfil-user-avatar">
        <div className="perfil-avatar-circle" style={{
          backgroundColor: '#e8f5e9',
          border: '3px solid #96bd44'
        }}>
          <img src={userIcon} alt="Usuario" className="perfil-avatar-img" style={{ filter: 'none' }} />
        </div>
        <h3 style={{ color: '#2d6a4f', marginTop: '15px' }}>
          {isAuthenticated && userData ? userData.nombre : 'Usuario'}
        </h3>
        <p className="perfil-user-email" style={{ color: '#6b7280' }}>
          {isAuthenticated && userData ? userData.correo : 'No autenticado'}
        </p>
        <div className="perfil-user-badge" style={{
          backgroundColor: '#e8f5e9',
          color: '#2d6a4f',
          border: '1px solid #96bd44'
        }}>
          {isAuthenticated && userData ? 
            (userData.rol_texto === 'admin' ? '👑 Administrador' : '👤 Cliente') : 
            '👤 Invitado'}
        </div>
        
        <div className="perfil-user-stats" style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '30px',
          marginTop: '30px',
          paddingTop: '20px',
          borderTop: '2px solid #e0e0e0'
        }}>
          <div className="perfil-stat-item">
            <span className="perfil-stat-label" style={{ color: '#6b7280' }}>Miembro desde</span>
            <span className="perfil-stat-value" style={{ color: '#2d6a4f', fontWeight: 'bold' }}>
              {isAuthenticated && userData && userData.fecha_registro ? 
                new Date(userData.fecha_registro).toLocaleDateString('es-MX', { year: 'numeric', month: 'short' }) : 
                'No disponible'}
            </span>
          </div>
          <div className="perfil-stat-item">
            <span className="perfil-stat-label" style={{ color: '#6b7280' }}>Direcciones</span>
            <span className="perfil-stat-value" style={{ color: '#96bd44', fontWeight: 'bold', fontSize: '1.5rem' }}>
              {direccionesCount}
            </span>
          </div>
          <div className="perfil-stat-item">
            <span className="perfil-stat-label" style={{ color: '#6b7280' }}>Tarjetas</span>
            <span className="perfil-stat-value" style={{ color: '#96bd44', fontWeight: 'bold', fontSize: '1.5rem' }}>
              {tarjetasCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilUserInfo;