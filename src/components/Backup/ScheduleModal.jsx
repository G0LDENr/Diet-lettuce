import React from 'react';

const ScheduleModal = ({ 
  show, onClose, onSchedule, scheduleData, setScheduleData, 
  availableTables, horasDisponibles 
}) => {
  if (!show) return null;

  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  const handleDiaChange = (index, campo, valor) => {
    setScheduleData(prev => ({
      ...prev,
      dias: {
        ...prev.dias,
        [index]: { ...prev.dias[index], [campo]: valor }
      }
    }));
  };

  const toggleDia = (index) => {
    const actual = scheduleData.dias[index];
    handleDiaChange(index, 'seleccionado', !actual.seleccionado);
  };

  const handleTablaToggle = (diaIndex, tabla) => {
    const diaActual = scheduleData.dias[diaIndex];
    const nuevasTablas = diaActual.tablas.includes(tabla)
      ? diaActual.tablas.filter(t => t !== tabla)
      : [...diaActual.tablas, tabla];
    
    handleDiaChange(diaIndex, 'tablas', nuevasTablas);
  };

  const handleSelectAllTablas = (diaIndex) => {
    const diaActual = scheduleData.dias[diaIndex];
    if (diaActual.tablas.length === availableTables.length) {
      handleDiaChange(diaIndex, 'tablas', []);
    } else {
      handleDiaChange(diaIndex, 'tablas', [...availableTables]);
    }
  };

  const getDiasSeleccionados = () => {
    return Object.entries(scheduleData.dias)
      .filter(([_, config]) => config.seleccionado)
      .length;
  };

  return (
    <div className="backup-modal-overlay">
      <div className="backup-modal-content backup-schedule-modal">
        <div className="backup-modal-header">
          <h3>Programar Respaldos Automáticos</h3>
          <button onClick={onClose} className="backup-close-modal">✕</button>
        </div>
        
        <div className="backup-modal-body">
          
          <p className="backup-schedule-description">
            Configura respaldos automáticos para días específicos de la semana.
          </p>
          
          <div className="backup-schedule-stats">
            <div className="backup-stat-badge">
              <span className="backup-stat-value">{getDiasSeleccionados()}</span>
              <span className="backup-stat-label">días seleccionados</span>
            </div>
          </div>
          
          <div className="backup-dias-programacion">
            {diasSemana.map((nombreDia, index) => {
              const diaConfig = scheduleData.dias[index];
              const esSeleccionado = diaConfig.seleccionado;
              
              return (
                <div key={index} className={`backup-dia-item ${esSeleccionado ? 'seleccionado' : ''}`}>
                  <div className="backup-dia-header">
                    <label className="backup-dia-checkbox-label">
                      <input
                        type="checkbox"
                        checked={esSeleccionado}
                        onChange={() => toggleDia(index)}
                      />
                      <span className="backup-dia-nombre">{nombreDia}</span>
                    </label>
                    
                    {esSeleccionado && (
                      <span className="backup-dia-badge">
                        {diaConfig.tipo === 'full' ? 'Completo' : 'Parcial'}
                      </span>
                    )}
                  </div>
                  
                  {esSeleccionado && (
                    <div className="backup-dia-config">
                      <div className="backup-config-row">
                        <div className="backup-config-group">
                          <label>Hora</label>
                          <select
                            value={diaConfig.hora}
                            onChange={(e) => handleDiaChange(index, 'hora', parseInt(e.target.value))}
                            className="backup-hora-select"
                          >
                            {horasDisponibles.map(hora => (
                              <option key={hora.valor} value={hora.valor}>
                                {hora.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="backup-config-group">
                          <label>Tipo</label>
                          <select
                            value={diaConfig.tipo}
                            onChange={(e) => handleDiaChange(index, 'tipo', e.target.value)}
                            className="backup-tipo-select"
                          >
                            <option value="full">Completo</option>
                            <option value="partial">Parcial</option>
                          </select>
                        </div>
                      </div>
                      
                      {diaConfig.tipo === 'partial' && (
                        <div className="backup-config-tablas">
                          <div className="backup-tablas-header">
                            <label>Tablas a incluir</label>
                            <button 
                              type="button"
                              className="backup-select-all-tablas-btn"
                              onClick={() => handleSelectAllTablas(index)}
                            >
                              {diaConfig.tablas.length === availableTables.length 
                                ? 'Deseleccionar todas' 
                                : 'Seleccionar todas'}
                            </button>
                          </div>
                          
                          <div className="backup-tablas-grid-mini">
                            {availableTables.map((tabla, idx) => (
                              <label key={idx} className="backup-tabla-checkbox-mini">
                                <input
                                  type="checkbox"
                                  checked={diaConfig.tablas.includes(tabla)}
                                  onChange={() => handleTablaToggle(index, tabla)}
                                />
                                <span>{tabla}</span>
                              </label>
                            ))}
                          </div>
                          
                          <div className="backup-tablas-count">
                            {diaConfig.tablas.length} tabla{diaConfig.tablas.length !== 1 ? 's' : ''} seleccionada{diaConfig.tablas.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {getDiasSeleccionados() > 0 && (
            <div className="backup-schedule-summary">
              <h4>Resumen de programación</h4>
              <div className="backup-summary-content">
                {Object.entries(scheduleData.dias)
                  .filter(([_, config]) => config.seleccionado)
                  .map(([diaIndex, config]) => {
                    const diaNombre = diasSemana[diaIndex];
                    return (
                      <div key={diaIndex} className="backup-summary-item">
                        <span className="backup-summary-day">{diaNombre}</span>
                        <span className="backup-summary-time">
                          {config.hora.toString().padStart(2, '0')}:00
                        </span>
                        <span className={`backup-summary-type ${config.tipo}`}>
                          {config.tipo === 'full' ? 'Completo' : 'Parcial'}
                        </span>
                        {config.tipo === 'partial' && (
                          <span className="backup-summary-tables">
                            ({config.tablas.length} tablas)
                          </span>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
        
        <div className="backup-modal-footer">
          <button 
            className="backup-modal-btn cancel"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button 
            className="backup-modal-btn primary"
            onClick={onSchedule}
            disabled={getDiasSeleccionados() === 0}
          >
            Programar Respaldos
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleModal;