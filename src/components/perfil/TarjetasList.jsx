import React from 'react';
import defaultCardIcon from '../../img/tarjeta.png';
import addCardIcon from '../../img/mas.png';
import deleteCardIcon from '../../img/delete.png';
import defaultIcon from '../../img/estrella.png';

// Componente de tarjeta individual mejorado
const TarjetaItem = ({ tarjeta, onDelete, onSetPredeterminada, tarjetasCount }) => {
  
  // Determinar el tipo de tarjeta por el número
  const detectarTipoTarjeta = (numeroEnmascarado) => {
    // El número enmascarado viene como "**** **** **** 1234"
    const ultimosDigitos = numeroEnmascarado.split(' ').pop() || '';
    
    // Detectar por los primeros dígitos (simulado)
    if (ultimosDigitos.startsWith('4')) return 'Visa';
    if (ultimosDigitos.startsWith('5')) return 'Mastercard';
    if (ultimosDigitos.startsWith('3')) return 'American Express';
    return 'Tarjeta';
  };

  // Obtener color de fondo según el tipo
  const getTipoColor = (tipo) => {
    switch(tipo) {
      case 'Visa': return '#e8f5e9'; // Verde muy claro
      case 'Mastercard': return '#c8e6c9'; // Verde claro
      case 'American Express': return '#a5d6a7'; // Verde medio claro
      default: return '#f5f5f5'; // Gris muy claro
    }
  };

  // Obtener texto de tipo
  const tipo = tarjeta.tipo_tarjeta === 'visa' ? 'Visa' :
               tarjeta.tipo_tarjeta === 'mastercard' ? 'Mastercard' :
               tarjeta.tipo_tarjeta === 'amex' ? 'American Express' : 
               detectarTipoTarjeta(tarjeta.numero_enmascarado);

  // Formatear número para mostrar
  const formatoNumero = tarjeta.numero_enmascarado || "**** **** **** 1234";
  
  return (
    <div 
      className="tarjeta-item" 
      style={{ 
        backgroundColor: getTipoColor(tipo),
        borderLeft: tarjeta.predeterminada ? '4px solid #2d6a4f' : '1px solid #96bd44'
      }}
    >
      <div className="tarjeta-item-header">
        <div className="tarjeta-tipo-container">
          <span className="tarjeta-tipo-badge" style={{
            backgroundColor: '#2d6a4f',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 'bold'
          }}>
            {tipo}
          </span>
          {tarjeta.predeterminada && (
            <span className="tarjeta-predeterminada-badge" style={{
              backgroundColor: '#96bd44',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              marginLeft: '10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <img src={defaultIcon} alt="Predeterminada" style={{ width: '12px', height: '12px', filter: 'brightness(0) invert(1)' }} />
              Principal
            </span>
          )}
        </div>
        
        <div className="tarjeta-actions">
          {!tarjeta.predeterminada && (
            <button 
              className="tarjeta-default-btn"
              onClick={() => onSetPredeterminada(tarjeta.id)}
              title="Establecer como principal"
              style={{
                backgroundColor: 'white',
                border: '1px solid #96bd44',
                color: '#2d6a4f',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img src={defaultIcon} alt="Predeterminar" style={{ width: '18px', height: '18px' }} />
            </button>
          )}
          <button 
            className="tarjeta-delete-btn"
            onClick={() => onDelete(tarjeta.id)}
            title="Eliminar tarjeta"
            disabled={tarjeta.predeterminada && tarjetasCount > 1}
            style={{
              backgroundColor: 'white',
              border: '1px solid #e53e3e',
              color: '#e53e3e',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              cursor: tarjeta.predeterminada && tarjetasCount > 1 ? 'not-allowed' : 'pointer',
              opacity: tarjeta.predeterminada && tarjetasCount > 1 ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img src={deleteCardIcon} alt="Eliminar" style={{ width: '18px', height: '18px' }} />
          </button>
        </div>
      </div>

      <div className="tarjeta-info" style={{ marginTop: '15px' }}>
        <p style={{ 
          fontFamily: 'Courier New, monospace', 
          fontSize: '1.3rem', 
          fontWeight: 'bold',
          color: '#2d6a4f',
          letterSpacing: '2px',
          margin: '5px 0'
        }}>
          {formatoNumero}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontWeight: '600', color: '#1f2937', margin: '5px 0' }}>
            {tarjeta.nombre_titular}
          </p>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '5px 0' }}>
            Exp: {tarjeta.mes_expiracion}/{tarjeta.anio_expiracion}
          </p>
        </div>
      </div>
    </div>
  );
};

// Componente principal de lista de tarjetas
const TarjetasList = ({ tarjetas, loading, isAuthenticated, onDelete, onSetPredeterminada, onAgregar, userData }) => {
  return (
    <div className="perfil-security-section" style={{ backgroundColor: 'white', border: '1px solid #e0e0e0' }}>
      <div className="perfil-section-header">
        <h3 style={{ color: '#2d6a4f' }}>Mis Tarjetas</h3>
        <div className="perfil-header-buttons">
          {isAuthenticated && (
            <button 
              className="perfil-add-orden-btn"
              onClick={onAgregar}
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
              <img src={addCardIcon} alt="Agregar" style={{ width: '16px', height: '16px', filter: 'brightness(0) invert(1)' }} />
              Agregar Tarjeta
            </button>
          )}
        </div>
      </div>

      <div className="perfil-security-content">
        {loading ? (
          <div className="perfil-loading-spinner" style={{ borderTopColor: '#96bd44' }}></div>
        ) : tarjetas.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            border: '1px dashed #96bd44'
          }}>
            <img src={defaultCardIcon} alt="No hay tarjetas" style={{ width: '60px', height: '60px', opacity: 0.5, marginBottom: '15px' }} />
            <p style={{ color: '#6b7280', marginBottom: '10px' }}>
              {isAuthenticated 
                ? "No tienes tarjetas registradas aún."
                : "Inicia sesión para ver tus tarjetas."}
            </p>
            {isAuthenticated && (
              <button 
                onClick={onAgregar}
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
                + Agregar primera tarjeta
              </button>
            )}
          </div>
        ) : (
          <div className="tarjetas-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {tarjetas.map((tarjeta) => (
              <TarjetaItem 
                key={tarjeta.id} 
                tarjeta={tarjeta} 
                onDelete={onDelete}
                onSetPredeterminada={onSetPredeterminada}
                tarjetasCount={tarjetas.length}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TarjetasList;