import React from 'react';
import backIcon from '../../img/atras.png';
import logoutIcon from '../../img/salida.png';
import editIcon from '../../img/edit.png';

const PerfilHeader = ({ isAuthenticated, onLogout, onLoginRedirect }) => {
  return (
    <header className="perfil-header" style={{
      backgroundColor: 'white',
      borderBottom: '2px solid #96bd44',
      padding: '10px 0',
      boxShadow: '0 2px 10px rgba(150, 189, 68, 0.1)'
    }}>
      <div className="perfil-content">
        <div className="perfil-section-header">
          <div className="perfil-header-title-container">
            <button 
              onClick={() => window.history.back()} 
              className="perfil-back-button"
              title="Regresar"
              style={{
                backgroundColor: '#f5f5f5',
                border: '1px solid #e0e0e0',
                width: '40px',
                height: '40px',
                borderRadius: '8px'
              }}
            >
              <img src={backIcon} alt="Regresar" style={{ width: '20px', height: '20px' }} />
            </button>
            <h3 style={{ color: '#2d6a4f', margin: 0 }}>Mi Perfil</h3>
          </div>
          <div className="perfil-header-buttons">
            {isAuthenticated ? (
              <button 
                onClick={onLogout} 
                className="perfil-verify-code-btn"
                style={{
                  backgroundColor: '#2d6a4f',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <img src={logoutIcon} alt="Salir" style={{ width: '16px', height: '16px', filter: 'brightness(0) invert(1)' }} />
                Cerrar Sesión
              </button>
            ) : (
              <button 
                onClick={onLoginRedirect} 
                className="perfil-add-orden-btn"
                style={{
                  backgroundColor: '#96bd44',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <img src={editIcon} alt="Iniciar sesión" style={{ width: '16px', height: '16px', filter: 'brightness(0) invert(1)' }} />
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default PerfilHeader;