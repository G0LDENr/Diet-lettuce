import React, { useState, useEffect } from 'react';

const AnalyticsModal = ({ show, onClose, darkMode }) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = 'http://127.0.0.1:5000';

  const getNotificationTypeText = (tipo) => {
    const tipos = {
      'nuevo_pedido': 'Nuevo Pedido',
      'estado_cambiado': 'Estado Cambiado',
      'estado_pedido': 'Estado Pedido',
      'mensaje_admin': 'Mensaje',
      'pedido_cancelado': 'Pedido Cancelado',
      'ingrediente_inactivo': 'Ingrediente Inactivo',
      'ingrediente_no_disponible': 'Ingrediente No Disponible',
      'backup_code': 'Código de Respaldo'
    };
    return tipos[tipo] || tipo;
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/notificaciones/analiticas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('Error al obtener analíticas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) {
      fetchAnalytics();
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className={`modal-overlay ${darkMode ? 'dark-mode' : ''}`} onClick={onClose}>
      <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Estadísticas de Notificaciones</h3>
          <button className="close-modal" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {loading ? (
            <div className="loading-analytics">
              <div className="loading-spinner small"></div>
              <p>Cargando estadísticas...</p>
            </div>
          ) : analyticsData ? (
            <div className="analytics-content">
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h4>Resumen General</h4>
                  <div className="analytics-stats">
                    <div className="stat-item">
                      <span className="stat-value">{analyticsData.total_notificaciones}</span>
                      <span className="stat-label">Total</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{analyticsData.no_leidas}</span>
                      <span className="stat-label">No Leídas</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{analyticsData.tasa_lectura?.toFixed(1) || '0'}%</span>
                      <span className="stat-label">Tasa Lectura</span>
                    </div>
                  </div>
                </div>

                {analyticsData.distribucion_tipos && (
                  <div className="analytics-card">
                    <h4>Por Tipo</h4>
                    <div className="analytics-list">
                      {Object.entries(analyticsData.distribucion_tipos).map(([tipo, count]) => (
                        <div key={tipo} className="analytics-item">
                          <span>{getNotificationTypeText(tipo)}</span>
                          <span>{count} notif.</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analyticsData.estadisticas_diarias && (
                  <div className="analytics-card">
                    <h4>Actividad Diaria</h4>
                    <div className="analytics-list">
                      {analyticsData.estadisticas_diarias.slice(0, 7).map((est, idx) => (
                        <div key={idx} className="analytics-item">
                          <span>{est.fecha}</span>
                          <span>{est.count} notif.</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="error-message">
              <p>No se pudieron cargar las estadísticas</p>
            </div>
          )}

          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
            <button className="btn btn-primary" onClick={fetchAnalytics} disabled={loading}>
              Actualizar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsModal;