import React, { useState } from 'react';
import '../../css/Backup/request-code-button.css';

const RequestCodeButton = ({ onCodeGenerated, userHasCode }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  // Si el usuario ya tiene código, no mostrar el botón
  if (userHasCode) {
    return null;
  }

  const handleGenerateCode = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch('http://127.0.0.1:5000/backups/generate-code', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: userData.id })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setCodeSent(true);
        setTimeout(() => {
          setShowModal(false);
          setCodeSent(false);
          if (onCodeGenerated) onCodeGenerated();
        }, 2500);
      } else {
        alert(result.message || 'Error al generar el código');
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        className="request-code-btn"
        onClick={() => setShowModal(true)}
        title="Solicitar código de respaldo"
      >
        <span className="btn-icon">🔑</span>
        Solicitar Código
      </button>

      {showModal && (
        <div className="request-code-overlay">
          <div className="request-code-modal">
            <div className="modal-header">
              <h3>Solicitar Código de Respaldo</h3>
              <button 
                className="close-btn"
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              {codeSent ? (
                <>
                  <div className="success-icon">✓</div>
                  <h4>¡Código Enviado!</h4>
                  <p className="success-text">
                    Tu código de respaldo ha sido enviado a tus notificaciones.
                  </p>
                  <p className="success-warning">
                    ⚠️ Revisa tu bandeja de notificaciones. Guarda el código en un lugar seguro.
                  </p>
                </>
              ) : (
                <>
                  <div className="info-icon">🔑</div>
                  <p className="info-text">
                    ¿Quieres generar tu código único de respaldo?
                  </p>
                  <p className="info-warning">
                    ⚠️ <strong>Importante:</strong> Este código es PERMANENTE.
                    Guárdalo en un lugar seguro.
                  </p>
                  <p className="info-note">
                    Se te enviará una notificación con el código.
                  </p>
                </>
              )}
            </div>
            
            <div className="modal-footer">
              {!codeSent && (
                <>
                  <button 
                    className="btn-cancel"
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="btn-generate"
                    onClick={handleGenerateCode}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner"></span>
                        Generando...
                      </>
                    ) : (
                      'Generar Código'
                    )}
                  </button>
                </>
              )}
              {codeSent && (
                <button 
                  className="btn-close"
                  onClick={() => {
                    setShowModal(false);
                    setCodeSent(false);
                  }}
                >
                  Cerrar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RequestCodeButton;