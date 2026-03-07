import React from 'react';
import addIcon from '../../img/mas.png';
import homeIcon from '../../img/casa.png';
import workIcon from '../../img/trabajo.png';
import otherIcon from '../../img/ubicacion.png';
import defaultIcon from '../../img/estrella.png';
import deleteIcon from '../../img/delete.png';
import editIcon from '../../img/edit.png';

// Componente de dirección individual mejorado
const DireccionItem = ({ direccion, isAuthenticated, onDelete, onEdit }) => {
  
  // Obtener icono según tipo
  const getIcono = () => {
    switch(direccion.tipo) {
      case 'casa': return homeIcon;
      case 'trabajo': return workIcon;
      default: return otherIcon;
    }
  };

  // Obtener texto de tipo
  const getTipoTexto = () => {
    switch(direccion.tipo) {
      case 'casa': return 'Casa';
      case 'trabajo': return 'Trabajo';
      default: return 'Otro';
    }
  };

  return (
    <div className="direccion-item" style={{
      backgroundColor: '#f9f9f9',
      border: '1px solid #e0e0e0',
      borderRadius: '10px',
      padding: '15px',
      position: 'relative'
    }}>
      {direccion.predeterminada && (
        <div style={{
          position: 'absolute',
          top: '-10px',
          left: '15px',
          backgroundColor: '#96bd44',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <img src={defaultIcon} alt="Predeterminada" style={{ width: '12px', height: '12px', filter: 'brightness(0) invert(1)' }} />
          Principal
        </div>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            backgroundColor: '#e8f5e9',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img src={getIcono()} alt={getTipoTexto()} style={{ width: '20px', height: '20px' }} />
          </div>
          <div>
            <span style={{ 
              backgroundColor: '#2d6a4f', 
              color: 'white', 
              padding: '4px 10px', 
              borderRadius: '15px',
              fontSize: '0.8rem',
              fontWeight: '500'
            }}>
              {getTipoTexto()}
            </span>
          </div>
        </div>
        
        {isAuthenticated && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="direccion-edit-btn"
              onClick={() => onEdit(direccion)}
              style={{
                backgroundColor: 'white',
                border: '1px solid #96bd44',
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Editar dirección"
            >
              <img src={editIcon} alt="Editar" style={{ width: '16px', height: '16px' }} />
            </button>
            <button 
              className="direccion-delete-btn"
              onClick={() => onDelete(direccion.id)}
              disabled={direccion.predeterminada}
              style={{
                backgroundColor: 'white',
                border: '1px solid #e53e3e',
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                cursor: direccion.predeterminada ? 'not-allowed' : 'pointer',
                opacity: direccion.predeterminada ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={direccion.predeterminada ? "No se puede eliminar la dirección principal" : "Eliminar dirección"}
            >
              <img src={deleteIcon} alt="Eliminar" style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: '10px' }}>
        <p style={{ fontWeight: '600', color: '#1f2937', margin: '5px 0' }}>
          {direccion.calle} #{direccion.numero_exterior}
          {direccion.numero_interior && ` Int. ${direccion.numero_interior}`}
        </p>
        <p style={{ color: '#6b7280', margin: '5px 0' }}>
          {direccion.colonia}, {direccion.ciudad}, {direccion.estado}
        </p>
        <p style={{ color: '#6b7280', margin: '5px 0' }}>
          CP: {direccion.codigo_postal}
        </p>
        {direccion.referencias && (
          <p style={{ 
            color: '#9ca3af', 
            fontSize: '0.85rem', 
            fontStyle: 'italic',
            margin: '5px 0',
            padding: '8px',
            backgroundColor: 'white',
            borderRadius: '6px',
            border: '1px dashed #e0e0e0'
          }}>
            📝 {direccion.referencias}
          </p>
        )}
      </div>
    </div>
  );
};

// Componente principal de lista de direcciones
const DireccionesList = ({ direcciones, loading, isAuthenticated, onDelete, onGestionar }) => {
  return (
    <div className="perfil-security-section" style={{ backgroundColor: 'white', border: '1px solid #e0e0e0' }}>
      <div className="perfil-section-header">
        <h3 style={{ color: '#2d6a4f' }}>Mis Direcciones</h3>
        <div className="perfil-header-buttons">
          {isAuthenticated && (
            <button 
              className="perfil-add-orden-btn"
              onClick={onGestionar}
              style={{
                backgroundColor: '#96bd44',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              <img src={addIcon} alt="Gestionar" style={{ width: '16px', height: '16px', filter: 'brightness(0) invert(1)' }} />
              Gestionar Direcciones
            </button>
          )}
        </div>
      </div>

      <div className="perfil-security-content">
        {loading ? (
          <div className="perfil-loading-spinner" style={{ borderTopColor: '#96bd44' }}></div>
        ) : direcciones.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            border: '1px dashed #96bd44'
          }}>
            <img src={homeIcon} alt="No hay direcciones" style={{ width: '60px', height: '60px', opacity: 0.5, marginBottom: '15px' }} />
            <p style={{ color: '#6b7280', marginBottom: '10px' }}>
              {isAuthenticated 
                ? "No tienes direcciones registradas aún."
                : "Inicia sesión para ver tus direcciones."}
            </p>
            {isAuthenticated && (
              <button 
                onClick={onGestionar}
                style={{
                  backgroundColor: '#96bd44',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                + Agregar primera dirección
              </button>
            )}
          </div>
        ) : (
          <div className="direcciones-list" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
            {direcciones.map((direccion) => (
              <DireccionItem 
                key={direccion.id} 
                direccion={direccion} 
                isAuthenticated={isAuthenticated}
                onDelete={onDelete}
                onEdit={() => {}} // Implementar edición si es necesario
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DireccionesList;