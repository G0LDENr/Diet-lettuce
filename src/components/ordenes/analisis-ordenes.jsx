import React, { useState, useEffect } from 'react';
import { 
  FaChartBar, 
  FaTimes, 
  FaUsers, 
  FaShoppingCart, 
  FaMoneyBillWave, 
  FaChartLine,
  FaUserTag,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTachometerAlt,
  FaTree,
  FaChartPie,
  FaCogs,
  FaThumbsUp,
  FaArrowUp,
  FaArrowDown,
  FaLayerGroup,
  FaUserFriends,
  FaDollarSign,
  FaClipboardList,
  FaBalanceScale,
  FaBullseye,
  FaHandshake,
  FaRocket,
  FaShieldAlt,
  FaStore,
  FaShoppingBag,
  FaCreditCard,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaIdBadge,
  FaPercent,
  FaCalculator,
  FaChartArea,
  FaEye,
  FaLightbulb,
  FaFileAlt,
  FaPrint,
  FaDownload,
  FaShareAlt,
  FaHeart,
  FaStar,
  FaTrophy,
  FaMedal,
  FaGem,
  FaCrown
} from 'react-icons/fa';
import { IoMdClose, IoMdPeople, IoMdPie, IoMdAnalytics } from 'react-icons/io';
import { MdError, MdWarning, MdOutlineAnalytics } from 'react-icons/md';
import { GiChart, GiMagnifyingGlass, GiTarget, GiMoneyStack } from 'react-icons/gi';
import { AiOutlineLoading, AiOutlineTeam } from 'react-icons/ai';
import '../../css/Ordenes/analisis-ordenes.css';

const AnalisisOrdenes = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analisisData, setAnalisisData] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (open) {
      cargarAnalisis();
    }
  }, [open]);

  const cargarAnalisis = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://127.0.0.1:5000/ordenes/analisis', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setAnalisisData(data);
      } else {
        setError(data.msg || 'Error al cargar el análisis');
      }
    } catch (err) {
      console.error('Error cargando análisis:', err);
      setError('Error al cargar los datos del análisis');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabIndex) => {
    setTabValue(tabIndex);
  };

  if (!open) return null;

  if (loading) {
    return (
      <div className="ordenes-modal-overlay">
        <div className="ordenes-modal-content analisis-modal">
          <div className="ordenes-modal-header">
            <h3 className="ordenes-modal-title">
              <FaChartBar /> Análisis de Órdenes
            </h3>
            <button className="ordenes-close-modal" onClick={onClose}>
              <FaTimes />
            </button>
          </div>
          <div className="ordenes-modal-body" style={{ textAlign: 'center', padding: '40px' }}>
            <div className="ordenes-loading-spinner"></div>
            <p>Cargando análisis...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ordenes-modal-overlay">
        <div className="ordenes-modal-content analisis-modal">
          <div className="ordenes-modal-header">
            <h3 className="ordenes-modal-title">
              <FaChartBar /> Análisis de Órdenes
            </h3>
            <button className="ordenes-close-modal" onClick={onClose}>
              <FaTimes />
            </button>
          </div>
          <div className="ordenes-modal-body">
            <div className="analisis-error">
              <MdError style={{ fontSize: '48px', color: '#f44336' }} />
              <p>{error}</p>
            </div>
          </div>
          <div className="ordenes-modal-footer">
            <button className="ordenes-btn ordenes-btn-close" onClick={onClose}>
              <FaTimes /> Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analisisData) return null;

  const { estadisticas, tabla_usuarios, errores, segmentos, wcss, silhouette, pca, graficas } = analisisData;

  // Renderizar tabla de usuarios
  const renderTablaUsuarios = () => {
    if (!tabla_usuarios || tabla_usuarios.length === 0) {
      return <p>No hay datos de usuarios disponibles</p>;
    }

    return (
      <div className="analisis-table-container">
        <table className="analisis-table">
          <thead>
            <tr>
              <th><FaUserFriends /> Usuario</th>
              <th><FaCalendarAlt /> Edad</th>
              <th><FaClipboardList /> Pedidos</th>
              <th><FaDollarSign /> Total Gastos</th>
              <th><FaCalculator /> Promedio</th>
              <th><FaArrowUp /> Máx. Gasto</th>
              <th><FaArrowDown /> Mín. Gasto</th>
              <th><FaBullseye /> Segmento</th>
            </tr>
          </thead>
          <tbody>
            {tabla_usuarios.map((usuario) => (
              <tr key={usuario.usuario_id}>
                <td>{usuario.nombre}</td>
                <td>{usuario.edad}</td>
                <td>{usuario.total_ordenes}</td>
                <td>${usuario.total_gastos.toFixed(2)}</td>
                <td>${usuario.promedio_gasto.toFixed(2)}</td>
                <td>${usuario.max_gasto.toFixed(2)}</td>
                <td>${usuario.min_gasto.toFixed(2)}</td>
                <td>
                  <span className={`analisis-segmento-badge ${usuario.segmento.toLowerCase()}`}>
                    {usuario.segmento === 'Premium' ? <FaCrown /> : usuario.segmento === 'Intermedio' ? <FaMedal /> : <FaUserFriends />} {usuario.segmento}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Renderizar tabla de errores
  const renderTablaErrores = () => {
    if (!errores || errores.length === 0) {
      return <p>No hay datos de errores disponibles</p>;
    }

    return (
      <div className="analisis-table-container">
        <table className="analisis-table">
          <thead>
            <tr>
              <th><FaUserFriends /> Usuario</th>
              <th><FaCalendarAlt /> Edad</th>
              <th><FaDollarSign /> Gasto Real</th>
              <th><FaCalculator /> Gasto Predicho</th>
              <th><FaBalanceScale /> Error</th>
              <th><FaPercent /> Error²</th>
            </tr>
          </thead>
          <tbody>
            {errores.map((error, index) => (
              <tr key={index}>
                <td>{error.usuario}</td>
                <td>{error.edad}</td>
                <td>${error.gasto_real.toFixed(2)}</td>
                <td>${error.gasto_predicho.toFixed(2)}</td>
                <td className={error.error > 0 ? 'analisis-error-positivo' : 'analisis-error-negativo'}>
                  {error.error > 0 ? <FaArrowUp /> : <FaArrowDown />} {error.error.toFixed(2)}
                </td>
                <td>{error.error_cuadrado.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Renderizar segmentos
  const renderSegmentos = () => {
    if (!segmentos || segmentos.length === 0) {
      return <p>No hay segmentos disponibles</p>;
    }

    return (
      <div className="analisis-table-container">
        <table className="analisis-table">
          <thead>
            <tr>
              <th><FaBullseye /> Segmento</th>
              <th><FaFileAlt /> Descripción</th>
              <th><FaUsers /> Usuarios</th>
              <th><FaCalendarAlt /> Edad Prom.</th>
              <th><FaDollarSign /> Gastos Prom.</th>
              <th><FaClipboardList /> Pedidos Prom.</th>
              <th><FaLightbulb /> Estrategia</th>
            </tr>
          </thead>
          <tbody>
            {segmentos.map((seg) => (
              <tr key={seg.cluster}>
                <td>
                  <span className={`analisis-segmento-badge ${seg.tipo.toLowerCase()}`}>
                    {seg.tipo === 'Premium' ? <FaCrown /> : seg.tipo === 'Intermedio' ? <FaMedal /> : <FaUserFriends />} {seg.tipo}
                  </span>
                </td>
                <td>{seg.descripcion}</td>
                <td>{seg.cantidad_usuarios} ({seg.porcentaje}%)</td>
                <td>{seg.edad_promedio}</td>
                <td>${seg.gastos_promedio.toFixed(2)}</td>
                <td>{seg.pedidos_promedio}</td>
                <td style={{ fontSize: '0.85rem' }}>{seg.estrategia}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Tarjetas de resumen
  const renderTarjetasResumen = () => {
    if (!estadisticas) return null;

    const cards = [
      { 
        label: 'Total de Clientes', 
        value: estadisticas.total_usuarios, 
        icon: <FaUsers />,
        desc: 'Usuarios que han realizado compras'
      },
      { 
        label: 'Pedidos Realizados', 
        value: estadisticas.total_ordenes, 
        icon: <FaShoppingCart />,
        desc: 'Total de órdenes completadas'
      },
      { 
        label: 'Ventas Totales', 
        value: `$${estadisticas.total_gastos.toFixed(2)}`, 
        icon: <FaMoneyBillWave />,
        desc: 'Monto total facturado'
      },
      { 
        label: 'Gasto Promedio por Cliente', 
        value: `$${estadisticas.gasto_promedio_usuario.toFixed(2)}`, 
        icon: <FaChartLine />,
        desc: 'Ticket promedio de compra'
      }
    ];

    return (
      <div className="analisis-cards">
        {cards.map((card, index) => (
          <div key={index} className="analisis-card">
            <div className="analisis-card-icon">{card.icon}</div>
            <div className="analisis-card-content">
              <div className="analisis-card-label">{card.label}</div>
              <div className="analisis-card-value">{card.value}</div>
              <div className="analisis-card-desc">{card.desc}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="ordenes-modal-overlay">
      <div className="ordenes-modal-content analisis-modal analisis-large-modal">
        <div className="ordenes-modal-header">
          <h3 className="ordenes-modal-title">
            <FaChartBar /> Análisis de Órdenes
          </h3>
          <button className="ordenes-close-modal" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="ordenes-modal-body">
          {/* Tarjetas de resumen */}
          {renderTarjetasResumen()}

          {/* Tabs con nombres amigables */}
          <div className="analisis-tabs">
            <button 
              className={`analisis-tab ${tabValue === 0 ? 'active' : ''}`}
              onClick={() => handleTabChange(0)}
            >
              <FaUsers /> Clientes
            </button>
            <button 
              className={`analisis-tab ${tabValue === 1 ? 'active' : ''}`}
              onClick={() => handleTabChange(1)}
            >
              <FaBalanceScale /> Precisión del Modelo
            </button>
            <button 
              className={`analisis-tab ${tabValue === 2 ? 'active' : ''}`}
              onClick={() => handleTabChange(2)}
            >
              <FaBullseye /> Segmentos de Clientes
            </button>
            <button 
              className={`analisis-tab ${tabValue === 3 ? 'active' : ''}`}
              onClick={() => handleTabChange(3)}
            >
              <FaChartPie /> Visualización de Datos
            </button>
            <button 
              className={`analisis-tab ${tabValue === 4 ? 'active' : ''}`}
              onClick={() => handleTabChange(4)}
            >
              <FaLayerGroup /> Factores Clave (PCA)
            </button>
          </div>

          {/* Contenido de tabs */}
          <div className="analisis-tab-content">
            {/* Tab 0: Clientes */}
            {tabValue === 0 && (
              <div>
                <h4><FaUsers /> Perfil de Clientes</h4>
                <p style={{ color: '#666', marginBottom: '1rem' }}>
                  Aquí puedes ver el comportamiento de compra de cada cliente: cuánto gastan, frecuencia de compra y su segmento.
                </p>
                {renderTablaUsuarios()}
              </div>
            )}

            {/* Tab 1: Precisión del Modelo */}
            {tabValue === 1 && (
              <div>
                <h4><FaBalanceScale /> ¿Qué tan preciso es nuestro modelo?</h4>
                <p style={{ color: '#666', marginBottom: '1rem' }}>
                  Comparamos el gasto real de los clientes contra lo que nuestro modelo predijo. 
                  Un error pequeño significa que el modelo es preciso.
                </p>
                <div className="analisis-error-cards">
                  <div className="analisis-error-card">
                    <span className="analisis-error-label">Error Promedio</span>
                    <span className={`analisis-error-value ${estadisticas?.error_promedio > 5 ? 'error' : 'success'}`}>
                      ${estadisticas?.error_promedio?.toFixed(2) || 'N/A'}
                    </span>
                    <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '4px' }}>
                      {estadisticas?.error_promedio > 5 ? 'Alto - Necesita mejorar' : 'Bajo - Modelo confiable'}
                    </div>
                  </div>
                  <div className="analisis-error-card">
                    <span className="analisis-error-label">Error al Cuadrado</span>
                    <span className="analisis-error-value">
                      {estadisticas?.error_cuadrado_promedio?.toFixed(2) || 'N/A'}
                    </span>
                    <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '4px' }}>
                      Amplifica errores grandes para detectar anomalías
                    </div>
                  </div>
                </div>
                <h5 style={{ marginTop: '1rem' }}>Detalle de Predicciones por Cliente</h5>
                {renderTablaErrores()}
              </div>
            )}

            {/* Tab 2: Segmentos de Clientes */}
            {tabValue === 2 && (
              <div>
                <h4><FaBullseye /> ¿Cómo clasificamos a nuestros clientes?</h4>
                <p style={{ color: '#666', marginBottom: '1rem' }}>
                  Agrupamos a los clientes en 3 segmentos según su valor para el negocio.
                  Cada segmento tiene una estrategia comercial diferente.
                </p>
                {renderSegmentos()}
              </div>
            )}

            {/* Tab 3: Visualización de Datos */}
            {tabValue === 3 && (
              <div>
                <h4><FaChartPie /> ¿Cómo se agrupan los clientes?</h4>
                <p style={{ color: '#666', marginBottom: '1rem' }}>
                  Estas gráficas muestran cómo se distribuyen los clientes y la calidad de la segmentación.
                </p>
                
                <h5>Calidad de los Grupos (WCSS)</h5>
                <p style={{ color: '#666', fontSize: '0.85rem' }}>
                  Mide qué tan compactos están los grupos. Un valor más bajo significa grupos más homogéneos.
                </p>
                <div className="analisis-wcss-cards">
                  <div className="analisis-wcss-card">
                    <span className="analisis-wcss-label">Compactación Actual</span>
                    <span className="analisis-wcss-value">{wcss?.actual?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className="analisis-wcss-card">
                    <span className="analisis-wcss-label">Compactación Total</span>
                    <span className="analisis-wcss-value">{wcss?.total?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className="analisis-wcss-card">
                    <span className="analisis-wcss-label">Porcentaje de Compactación</span>
                    <span className="analisis-wcss-value">{wcss?.porcentaje?.toFixed(2) || 'N/A'}%</span>
                    <div style={{ fontSize: '0.7rem', color: '#888' }}>
                      {wcss?.porcentaje < 30 ? 'Excelente' : wcss?.porcentaje < 50 ? 'Bueno' : 'Puede mejorar'}
                    </div>
                  </div>
                </div>

                {/* Gráfica Elbow */}
                {graficas?.elbow && (
                  <div className="analisis-grafica-container">
                    <h5>¿Cuántos grupos son ideales? (Método del Codo)</h5>
                    <p style={{ color: '#666', fontSize: '0.85rem' }}>
                      El punto donde la curva "dobla" indica el número óptimo de grupos de clientes.
                    </p>
                    <img
                      src={`data:image/png;base64,${graficas.elbow}`}
                      alt="Método del Codo"
                      className="analisis-grafica-img"
                    />
                  </div>
                )}

                {/* Silhouette */}
                <div className="analisis-silhouette">
                  <h4><FaTachometerAlt /> ¿Qué tan separados están los grupos?</h4>
                  <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    Mide qué tan distintos son los grupos entre sí. 
                    Un puntaje alto significa que los clientes de cada grupo son muy diferentes a los de otros grupos.
                  </p>
                  <div className="analisis-silhouette-cards">
                    <div className="analisis-silhouette-card">
                      <span className="analisis-silhouette-label">Puntaje de Separación</span>
                      <span className="analisis-silhouette-value">{silhouette?.score?.toFixed(4) || 'N/A'}</span>
                    </div>
                    <div className="analisis-silhouette-card">
                      <span className="analisis-silhouette-label">Calificación</span>
                      <span className={`analisis-silhouette-badge ${silhouette?.interpretacion?.toLowerCase() || ''}`}>
                        {silhouette?.interpretacion || 'N/A'}
                      </span>
                      <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '4px' }}>
                        {silhouette?.interpretacion === 'Excelente' ? 'Grupos muy bien definidos' :
                         silhouette?.interpretacion === 'Bueno' ? 'Grupos claramente diferenciados' :
                         silhouette?.interpretacion === 'Regular' ? 'Grupos con algo de solapamiento' :
                         '❌ Grupos poco definidos'}
                      </div>
                    </div>
                    <div className="analisis-silhouette-card">
                      <span className="analisis-silhouette-label">Número Óptimo de Grupos</span>
                      <span className="analisis-silhouette-value">{silhouette?.k_optimo || 'N/A'}</span>
                      <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '4px' }}>
                        {silhouette?.k_optimo === 3 ? '3 grupos (Recomendado)' : 
                         silhouette?.k_optimo === 2 ? '2 grupos' : 
                         `${silhouette?.k_optimo} grupos`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gráfica de Clusters */}
                {graficas?.clusters && (
                  <div className="analisis-grafica-container">
                    <h5>Visualización de Grupos de Clientes</h5>
                    <p style={{ color: '#666', fontSize: '0.85rem' }}>
                      Cada punto representa un cliente. Los clientes del mismo color pertenecen al mismo grupo.
                      La "X" marca el centro de cada grupo.
                    </p>
                    <img
                      src={`data:image/png;base64,${graficas.clusters}`}
                      alt="Visualización de Clusters"
                      className="analisis-grafica-img"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Factores Clave (PCA) */}
            {tabValue === 4 && (
              <div>
                <h4><FaLayerGroup /> Factores que Definen a los Clientes (PCA)</h4>
                <p style={{ color: '#666', marginBottom: '1rem' }}>
                  Identificamos los factores más importantes que diferencian a los clientes entre sí.
                  Esto nos ayuda a entender qué características son clave para la segmentación.
                </p>
                
                <div className="analisis-pca-container">
                  <div className="analisis-pca-card">
                    <h5>Factor Principal 1</h5>
                    <p>Representa el <strong>{Math.round(pca?.componentes?.componente_1?.varianza_explicada * 100)}%</strong> de la diferencia entre clientes</p>
                    <p style={{ fontSize: '0.8rem', color: '#666' }}>
                      Este factor combina las siguientes características:
                    </p>
                    <div className="analisis-pca-pesos">
                      <div className="analisis-pca-peso">
                        <span><FaCalendarAlt /> Edad:</span>
                        <span>{pca?.componentes?.componente_1?.pesos?.edad?.toFixed(4) || 'N/A'}</span>
                      </div>
                      <div className="analisis-pca-peso">
                        <span><FaClipboardList /> Número de Pedidos:</span>
                        <span>{pca?.componentes?.componente_1?.pesos?.total_ordenes?.toFixed(4) || 'N/A'}</span>
                      </div>
                      <div className="analisis-pca-peso">
                        <span><FaDollarSign /> Gasto Total:</span>
                        <span>{pca?.componentes?.componente_1?.pesos?.total_gastos?.toFixed(4) || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="analisis-pca-card">
                    <h5>Factor Principal 2</h5>
                    <p>Representa el <strong>{Math.round(pca?.componentes?.componente_2?.varianza_explicada * 100)}%</strong> de la diferencia entre clientes</p>
                    <p style={{ fontSize: '0.8rem', color: '#666' }}>
                      Este factor complementa al anterior con:
                    </p>
                    <div className="analisis-pca-pesos">
                      <div className="analisis-pca-peso">
                        <span><FaCalendarAlt /> Edad:</span>
                        <span>{pca?.componentes?.componente_2?.pesos?.edad?.toFixed(4) || 'N/A'}</span>
                      </div>
                      <div className="analisis-pca-peso">
                        <span><FaClipboardList /> Número de Pedidos:</span>
                        <span>{pca?.componentes?.componente_2?.pesos?.total_ordenes?.toFixed(4) || 'N/A'}</span>
                      </div>
                      <div className="analisis-pca-peso">
                        <span><FaDollarSign /> Gasto Total:</span>
                        <span>{pca?.componentes?.componente_2?.pesos?.total_gastos?.toFixed(4) || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Varianza acumulada */}
                {pca?.varianza_acumulada && (
                  <div className="analisis-varianza-container">
                    <h5>¿Cuánta información capturamos?</h5>
                    <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      Muestra el porcentaje de información que cada factor explica sobre los clientes.
                    </p>
                    <table className="analisis-table">
                      <thead>
                        <tr>
                          <th><FaLayerGroup /> Factor</th>
                          <th><FaPercent /> Información que Captura</th>
                          <th><FaChartLine /> Información Acumulada</th>
                          <th><FaEye /> Interpretación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pca.varianza_acumulada.map((val, index) => {
                          const individual = (pca.varianza_explicada?.[index] * 100)?.toFixed(2) || '0';
                          const acumulada = (val * 100)?.toFixed(2) || '0';
                          let interpretacion = '';
                          if (index === 0) {
                            interpretacion = 'Principal diferenciador entre clientes';
                          } else if (index === 1) {
                            interpretacion = 'Complementa al primer factor';
                          } else {
                            interpretacion = 'Detalle adicional';
                          }
                          return (
                            <tr key={index}>
                              <td><strong>Factor {index + 1}</strong></td>
                              <td>{individual}%</td>
                              <td>{acumulada}%</td>
                              <td style={{ fontSize: '0.8rem', color: '#666' }}>
                                {interpretacion}
                                {acumulada > 80 && index === 1 && ' Suficiente para análisis'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <div style={{ 
                      marginTop: '0.5rem', 
                      padding: '0.75rem', 
                      background: '#e8f5e9', 
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      color: '#2E7D32'
                    }}>
                      <FaCheckCircle style={{ marginRight: '8px' }} />
                      <strong>Conclusión:</strong> Con los primeros 2 factores capturamos el 
                      {(pca.varianza_acumulada?.[1] * 100)?.toFixed(0) || '80'}% de la información total, 
                      lo que significa que estos 2 factores son suficientes para entender la segmentación de clientes.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="ordenes-modal-footer">
          <button className="ordenes-btn ordenes-btn-close" onClick={onClose}>
            <FaTimes /> Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalisisOrdenes;