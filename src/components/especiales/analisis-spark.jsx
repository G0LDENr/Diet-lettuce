import React, { useEffect, useRef } from 'react';
import { useConfig } from '../../context/config';
import '../../css/Especiales/analisis-suplemento.css';
import Chart from 'chart.js/auto';

const categoriaNombres = {
  'quemadores': 'Quemadores',
  'proteinas': 'Proteinas',
  'fibras': 'Fibras',
  'detox': 'Detox',
  'termogenicos': 'Termogenicos',
  'control_apetito': 'Control Apetito',
  'energeticos': 'Energeticos',
  'vitaminas': 'Vitaminas'
};

const presentacionNombres = {
  'polvo': 'Polvo',
  'capsulas': 'Capsulas',
  'tabletas': 'Tabletas',
  'liquido': 'Liquido',
  'gomitas': 'Gomitas',
  'barritas': 'Barritas'
};

const AnalisisSparkModal = ({ 
  show, 
  onClose, 
  analisisResultados, 
  analisisLoading, 
  analisisError,
  onRefresh,
  darkMode 
}) => {
  const scatterChartRef = useRef(null);
  const barChartRef = useRef(null);
  const kmeansChartRef = useRef(null);

  useEffect(() => {
    if (show && analisisResultados) {
      if (analisisResultados.regresion_lineal?.predicciones?.length > 0) {
        crearGraficaComparacion();
      }
      if (analisisResultados.distribucion_categorias && Object.keys(analisisResultados.distribucion_categorias).length > 0) {
        crearGraficaCategorias();
      }
      if (analisisResultados.kmeans?.clusters?.length > 0) {
        crearGraficaKMeans();
      }
    }
    
    return () => {
      if (scatterChartRef.current) scatterChartRef.current.destroy();
      if (barChartRef.current) barChartRef.current.destroy();
      if (kmeansChartRef.current) kmeansChartRef.current.destroy();
    };
  }, [show, analisisResultados]);

  const crearGraficaComparacion = () => {
    const ctx = document.getElementById('scatterChart');
    if (!ctx) return;
    if (scatterChartRef.current) scatterChartRef.current.destroy();

    const predicciones = analisisResultados.regresion_lineal.predicciones || [];
    
    scatterChartRef.current = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Precio Real',
            data: predicciones.map((p, idx) => ({ x: idx + 1, y: p.precio_real })),
            backgroundColor: '#96bd44',
            pointRadius: 8,
            pointHoverRadius: 12
          },
          {
            label: 'Precio Predicho',
            data: predicciones.map((p, idx) => ({ x: idx + 1, y: p.precio_predicho })),
            backgroundColor: '#ff9800',
            pointRadius: 8,
            pointHoverRadius: 12
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
              }
            }
          },
          legend: { position: 'top' },
          title: { display: true, text: 'Comparacion: Precio Real vs Predicho' }
        },
        scales: {
          y: {
            title: { display: true, text: 'Precio (MXN)' },
            ticks: { callback: (value) => '$' + value.toFixed(2) }
          },
          x: { title: { display: true, text: 'Muestra' } }
        }
      }
    });
  };

  const crearGraficaCategorias = () => {
    const ctx = document.getElementById('barChart');
    if (!ctx) return;
    if (barChartRef.current) barChartRef.current.destroy();

    const categorias = analisisResultados.distribucion_categorias || {};
    const labels = Object.keys(categorias).map(cat => categoriaNombres[cat] || cat);
    const data = Object.values(categorias);

    barChartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Cantidad de Suplementos',
          data: data,
          backgroundColor: '#96bd44',
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Distribucion por Categorias' }
        },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Cantidad' }, ticks: { stepSize: 1, precision: 0 } },
          x: { title: { display: true, text: 'Categorias' } }
        }
      }
    });
  };

  const crearGraficaKMeans = () => {
    const ctx = document.getElementById('kmeansChart');
    if (!ctx) return;
    if (kmeansChartRef.current) kmeansChartRef.current.destroy();

    const clusters = analisisResultados.kmeans?.clusters || [];
    const labels = clusters.map(c => c.tipo);
    const data = clusters.map(c => c.cantidad);
    const colores = ['#96bd44', '#ff9800', '#f44336'];

    kmeansChartRef.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{ data: data, backgroundColor: colores, borderWidth: 0 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          title: { display: true, text: 'Distribucion por Segmento' },
          tooltip: {
            callbacks: {
              label: function(context) {
                const cluster = clusters[context.dataIndex];
                return `${cluster.tipo}: ${cluster.cantidad} productos (${cluster.porcentaje}%)`;
              }
            }
          }
        }
      }
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price || 0);
  };

  const getCalidadColor = (calidad) => {
    if (calidad === 'Excelente') return '#4caf50';
    if (calidad === 'Buena') return '#ff9800';
    if (calidad === 'Regular') return '#ffc107';
    return '#f44336';
  };

  // ========== RENDER SECCIÓN LIMPIEZA DE DATOS ==========
  const renderLimpiezaDatos = () => {
    const limpieza = analisisResultados?.limpieza_datos;
    if (!limpieza || limpieza.registros_iniciales === 0) return null;

    return (
      <div className="analisis-limpieza-section">
        <h3>
          <span className="limpieza-icon"></span>
          Limpieza de Datos (KDD - Fase 2)
        </h3>
        
        <div className="limpieza-resumen">
          <div className="limpieza-card">
            <div className="limpieza-label">Registros Iniciales</div>
            <div className="limpieza-value">{limpieza.registros_iniciales}</div>
          </div>
          <div className="limpieza-card">
            <div className="limpieza-label">Registros Finales</div>
            <div className="limpieza-value">{limpieza.registros_finales}</div>
          </div>
          <div className="limpieza-card">
            <div className="limpieza-label">Duplicados Eliminados</div>
            <div className="limpieza-value" style={{ color: limpieza.duplicados_eliminados > 0 ? '#f44336' : '#4caf50' }}>
              {limpieza.duplicados_eliminados || 0}
            </div>
          </div>
          <div className="limpieza-card">
            <div className="limpieza-label">Calidad de Datos</div>
            <div className="limpieza-value" style={{ color: getCalidadColor(limpieza.calidad_datos) }}>
              {limpieza.calidad_datos || 'No definida'}
            </div>
          </div>
        </div>

        {limpieza.precios_fuera_rango > 0 && (
          <div className="limpieza-alerta">
            <span className="alerta-icon">⚠️</span>
            <span>Se encontraron {limpieza.precios_fuera_rango} productos con precios fuera del rango permitido</span>
          </div>
        )}

        {limpieza.nulos_originales && Object.keys(limpieza.nulos_originales).length > 0 && (
          <div className="limpieza-nulos">
            <h4>Valores nulos corregidos:</h4>
            <div className="nulos-grid">
              {Object.entries(limpieza.nulos_originales).map(([campo, porcentaje]) => (
                porcentaje > 0 && (
                  <div key={campo} className="nulo-item">
                    <span className="nulo-campo">{campo}:</span>
                    <span className="nulo-porcentaje">{porcentaje.toFixed(1)}% nulos</span>
                    <span className="nulo-accion">→ rellenados con valores por defecto</span>
                  </div>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ========== RENDER SECCIÓN DATA HOUSE ==========
  const renderDataHouse = () => {
    const dataHouse = analisisResultados?.data_house;
    if (!dataHouse) return null;

    return (
      <div className="analisis-datahouse-section">
        <h3>
          <span className="datahouse-icon"></span>
          Data House - Modelo Copo de Nieve
        </h3>

        <div className="datahouse-status">
          <div className={`status-badge ${dataHouse.almacenado ? 'success' : 'error'}`}>
            {dataHouse.almacenado ? '✓ Datos almacenados correctamente' : '✗ Error al almacenar'}
          </div>
          <p className="status-mensaje">{dataHouse.mensaje}</p>
        </div>

        {dataHouse.estructura && (
          <div className="datahouse-estructura">
            <h4>Estructura del Data House:</h4>
            <div className="estructura-grid">
              <div className="estructura-item">
                <span className="estructura-label">Tabla de Hechos:</span>
                <span className="estructura-value">{dataHouse.estructura.tabla_hechos || 'VENTAS_HECHOS'}</span>
              </div>
              <div className="estructura-item">
                <span className="estructura-label">Dimensiones:</span>
                <span className="estructura-value">{dataHouse.estructura.dimensiones?.join(', ') || 'No definidas'}</span>
              </div>
              <div className="estructura-item">
                <span className="estructura-label">Total Tablas:</span>
                <span className="estructura-value">{dataHouse.estructura.total_tablas || 0}</span>
              </div>
              <div className="estructura-item">
                <span className="estructura-label">Total Registros:</span>
                <span className="estructura-value">{dataHouse.estructura.total_registros || 0}</span>
              </div>
            </div>
          </div>
        )}

        {dataHouse.consultas_ejemplo && dataHouse.consultas_ejemplo.length > 0 && (
          <div className="datahouse-consultas">
            <h4>Ejemplo de consultas SQL:</h4>
            <div className="consultas-container">
              {dataHouse.consultas_ejemplo.slice(0, 2).map((consulta, idx) => (
                <pre key={idx} className="consulta-sql">
                  <code>{consulta}</code>
                </pre>
              ))}
            </div>
          </div>
        )}

        {dataHouse.timestamp && (
          <div className="datahouse-timestamp">
            <small>Última actualización: {new Date(dataHouse.timestamp).toLocaleString()}</small>
          </div>
        )}
      </div>
    );
  };

  // ========== RENDER KMEANS ==========
  const renderKMeans = () => {
    const kmeans = analisisResultados?.kmeans;
    if (!kmeans || !kmeans.clusters || kmeans.clusters.length === 0) return null;

    const getSilhouetteText = (score) => {
      if (score >= 0.7) return 'Excelente - Clusters bien definidos';
      if (score >= 0.5) return 'Bueno - Clusters aceptables';
      if (score >= 0.3) return 'Regular - Clusters con solapamiento';
      return 'Debil - Clusters poco definidos';
    };

    return (
      <div className="analisis-kmeans-section">
        <h3>
          <span className="kmeans-icon"></span>
          KMeans Clustering - Segmentacion de Productos
        </h3>
        
        <div className="kmeans-metrics">
          <div className="metric-card">
            <div className="metric-label">Silhouette Score</div>
            <div className="metric-value" style={{ color: '#96bd44' }}>
              {kmeans.silhouette_score?.toFixed(4) || '0.0000'}
            </div>
            <div className="metric-interpretacion">{getSilhouetteText(kmeans.silhouette_score)}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Total Productos</div>
            <div className="metric-value">{kmeans.total_productos || 0}</div>
            <div className="metric-interpretacion">Productos segmentados</div>
          </div>
        </div>

        <div className="kmeans-grafica">
          <h4>Distribucion por Segmento</h4>
          <div className="grafica-container">
            <canvas id="kmeansChart" style={{ width: '100%', height: '300px' }}></canvas>
          </div>
        </div>

        <div className="kmeans-clusters">
          <h4>Detalle de Segmentos</h4>
          <div className="clusters-grid">
            {kmeans.clusters.map((cluster, idx) => (
              <div key={idx} className={`cluster-card cluster-${cluster.tipo.toLowerCase()}`}>
                <div className="cluster-header">
                  <span className="cluster-nombre">{cluster.tipo}</span>
                  <span className="cluster-porcentaje">{cluster.porcentaje}%</span>
                </div>
                <div className="cluster-descripcion">{cluster.descripcion}</div>
                <div className="cluster-stats">
                  <div className="stat-row">
                    <span>Productos:</span>
                    <strong>{cluster.cantidad}</strong>
                  </div>
                  <div className="stat-row">
                    <span>Precio promedio:</span>
                    <strong>{formatPrice(cluster.precio_promedio)}</strong>
                  </div>
                </div>
                <div className="cluster-recomendacion">
                  <span className="recomendacion-label">Recomendacion:</span>
                  <p>{cluster.recomendacion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ========== RENDER ÁRBOL DE DECISIÓN ==========
  const renderArbolDecision = () => {
    const arbol = analisisResultados?.analisis_completo?.arbol_decision;
    if (!arbol || arbol.error) return null;

    return (
      <div className="analisis-arbol-section">
        <h3>
          <span className="arbol-icon">🌳</span>
          Árbol de Decisión - Clasificación de Precios
        </h3>

        <div className="arbol-metrics">
          <div className="metric-card">
            <div className="metric-label">Exactitud (Gini)</div>
            <div className="metric-value" style={{ color: '#96bd44' }}>
              {arbol.arbol_gini?.accuracy_global || 0}%
            </div>
            <div className="metric-interpretacion">Índice de Gini: 1-Σπ²</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Exactitud (Entropía)</div>
            <div className="metric-value" style={{ color: '#ff9800' }}>
              {arbol.arbol_entropy?.accuracy_global || 0}%
            </div>
            <div className="metric-interpretacion">Entropía: -Σπ log₂(π)</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Mejor Modelo</div>
            <div className="metric-value" style={{ color: '#4caf50' }}>
              {arbol.comparacion?.mejor || 'N/A'}
            </div>
          </div>
        </div>

        {/* Matriz de Confusión - Gini */}
        {arbol.arbol_gini?.matriz_confusion && (
          <div className="arbol-matriz">
            <h4>Matriz de Confusión - Árbol con Gini</h4>
            <div className="matriz-container">
              <table className="matriz-confusion">
                <thead>
                  <tr>
                    <th></th>
                    <th>Pred. Bajo</th>
                    <th>Pred. Medio</th>
                    <th>Pred. Alto</th>
                  </tr>
                </thead>
                <tbody>
                  {arbol.arbol_gini.matriz_confusion.map((row, i) => (
                    <tr key={i}>
                      <th>Real {['Bajo', 'Medio', 'Alto'][i]}</th>
                      {row.map((val, j) => (
                        <td key={j} className={i === j ? 'tp' : 'fp'}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Métricas por clase */}
            <div className="metricas-clase">
              <h5>Métricas por Clase (según documento):</h5>
              <div className="metricas-grid">
                {Object.entries(arbol.arbol_gini.metricas).map(([clase, metrics]) => (
                  <div key={clase} className="clase-metric-card">
                    <div className="clase-nombre">{clase}</div>
                    <div className="clase-metrics">
                      <div className="metric-row">
                        <span>Exactitud:</span>
                        <strong>{metrics.accuracy}%</strong>
                      </div>
                      <div className="metric-row">
                        <span>Precisión:</span>
                        <strong>{metrics.precision}%</strong>
                      </div>
                      <div className="metric-row">
                        <span>Recall:</span>
                        <strong>{metrics.recall}%</strong>
                      </div>
                      <div className="metric-row">
                        <span>F1 Score:</span>
                        <strong>{metrics.f1_score}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Importancia de Características */}
        {arbol.arbol_gini?.importancia_caracteristicas && (
          <div className="arbol-importancia">
            <h4>Importancia de Características</h4>
            <div className="importancia-grid">
              {Object.entries(arbol.arbol_gini.importancia_caracteristicas).map(([feature, importance]) => (
                <div key={feature} className="importancia-item">
                  <span className="importancia-label">{feature}:</span>
                  <div className="importancia-bar-container">
                    <div 
                      className="importancia-bar" 
                      style={{ width: `${importance * 100}%` }}
                    ></div>
                  </div>
                  <span className="importancia-value">{Math.round(importance * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Imagen del Árbol */}
        {arbol.imagen_arbol && (
          <div className="arbol-imagen">
            <h4>Visualización del Árbol de Decisión</h4>
            <img 
              src={`data:image/png;base64,${arbol.imagen_arbol}`} 
              alt="Árbol de Decisión"
              className="arbol-imagen-img"
            />
          </div>
        )}
      </div>
    );
  };

  // ========== RENDER BOSQUE ALEATORIO ==========
  const renderBosqueAleatorio = () => {
    const bosque = analisisResultados?.analisis_completo?.bosque_aleatorio;
    if (!bosque || bosque.error) return null;

    return (
      <div className="analisis-bosque-section">
        <h3>
          <span className="bosque-icon">🌲</span>
          Bosque Aleatorio (Random Forest)
        </h3>

        <div className="bosque-metrics">
          <div className="metric-card">
            <div className="metric-label">Exactitud</div>
            <div className="metric-value" style={{ color: '#96bd44' }}>
              {bosque.accuracy_global || 0}%
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Validación Cruzada</div>
            <div className="metric-value" style={{ color: '#ff9800' }}>
              {bosque.cv_mean_score || 0}%
            </div>
            <div className="metric-interpretacion">± {bosque.cv_std_score || 0}%</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Árboles</div>
            <div className="metric-value">{bosque.n_estimators || 100}</div>
          </div>
        </div>

        {/* Matriz de Confusión del Bosque */}
        {bosque.matriz_confusion && (
          <div className="bosque-matriz">
            <h4>Matriz de Confusión - Random Forest</h4>
            <div className="matriz-container">
              <table className="matriz-confusion">
                <thead>
                  <tr>
                    <th></th>
                    <th>Pred. Bajo</th>
                    <th>Pred. Medio</th>
                    <th>Pred. Alto</th>
                  </tr>
                </thead>
                <tbody>
                  {bosque.matriz_confusion.map((row, i) => (
                    <tr key={i}>
                      <th>Real {['Bajo', 'Medio', 'Alto'][i]}</th>
                      {row.map((val, j) => (
                        <td key={j} className={i === j ? 'tp' : 'fp'}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Métricas por clase del Bosque */}
            {bosque.metricas && (
              <div className="metricas-clase">
                <h5>Métricas por Clase:</h5>
                <div className="metricas-grid">
                  {Object.entries(bosque.metricas).map(([clase, metrics]) => (
                    <div key={clase} className="clase-metric-card">
                      <div className="clase-nombre">{clase}</div>
                      <div className="clase-metrics">
                        <div className="metric-row">
                          <span>Exactitud:</span>
                          <strong>{metrics.accuracy}%</strong>
                        </div>
                        <div className="metric-row">
                          <span>Precisión:</span>
                          <strong>{metrics.precision}%</strong>
                        </div>
                        <div className="metric-row">
                          <span>Recall:</span>
                          <strong>{metrics.recall}%</strong>
                        </div>
                        <div className="metric-row">
                          <span>F1 Score:</span>
                          <strong>{metrics.f1_score}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Importancia de Características del Bosque */}
        {bosque.importancia_caracteristicas && (
          <div className="bosque-importancia">
            <h4>Importancia de Características</h4>
            <div className="importancia-grid">
              {Object.entries(bosque.importancia_caracteristicas).map(([feature, importance]) => (
                <div key={feature} className="importancia-item">
                  <span className="importancia-label">{feature}:</span>
                  <div className="importancia-bar-container">
                    <div 
                      className="importancia-bar" 
                      style={{ width: `${importance * 100}%` }}
                    ></div>
                  </div>
                  <span className="importancia-value">{Math.round(importance * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ========== RENDER REGRESIÓN LINEAL COMPLETA ==========
  const renderRegresionLinealCompleta = () => {
    const regresion = analisisResultados?.analisis_completo?.regresion_lineal;
    if (!regresion || regresion.error) return null;

    return (
      <div className="analisis-regresion-completa-section">
        <h3>
          <span className="regresion-icon">📈</span>
          Regresión Lineal - Predicción de Precios
        </h3>

        <div className="regresion-comparativa">
          <div className="metric-card">
            <div className="metric-label">Regresión Simple</div>
            <div className="metric-value" style={{ color: '#96bd44' }}>
              R² = {regresion.regresion_simple?.r2_score || 0}
            </div>
            <div className="metric-interpretacion">{regresion.regresion_simple?.interpretacion}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Regresión Múltiple</div>
            <div className="metric-value" style={{ color: '#ff9800' }}>
              R² = {regresion.regresion_multiple?.r2_score || 0}
            </div>
            <div className="metric-interpretacion">{regresion.regresion_multiple?.interpretacion}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Mejor Modelo</div>
            <div className="metric-value" style={{ color: '#4caf50' }}>
              {regresion.comparacion?.mejor_modelo || 'N/A'}
            </div>
            <div className="metric-interpretacion">
              Mejora: {regresion.comparacion?.mejora || 0}%
            </div>
          </div>
        </div>

        {/* Coeficientes de Regresión Múltiple */}
        {regresion.regresion_multiple?.coeficientes && (
          <div className="regresion-coeficientes">
            <h4>Coeficientes de la Regresión Múltiple</h4>
            <div className="coeficientes-grid">
              {Object.entries(regresion.regresion_multiple.coeficientes).map(([varName, coef]) => (
                <div key={varName} className="coeficiente-item">
                  <span className="coeficiente-label">{varName}</span>
                  <span className={`coeficiente-value ${coef > 0 ? 'positive' : coef < 0 ? 'negative' : ''}`}>
                    {coef}
                  </span>
                  <span className="coeficiente-efecto">
                    {coef > 0 ? '↑ Aumenta el precio' : coef < 0 ? '↓ Disminuye el precio' : 'Sin efecto'}
                  </span>
                </div>
              ))}
            </div>
            <div className="coeficiente-intercepto">
              Intercepto: {regresion.regresion_multiple.intercepto}
            </div>
          </div>
        )}

        {/* Métricas del Documento */}
        {regresion.metricas_documento && (
          <div className="regresion-metricas-documento">
            <h4>Métricas de Error (según documento):</h4>
            <div className="metricas-error-grid">
              <div className="error-metric">
                <span>MAE (Error Absoluto Promedio):</span>
                <strong>{regresion.metricas_documento.error_absoluto_promedio}</strong>
              </div>
              <div className="error-metric">
                <span>MSE (Error Cuadrado Promedio):</span>
                <strong>{regresion.metricas_documento.error_cuadrado_promedio}</strong>
              </div>
              <div className="error-metric">
                <span>RMSE (Raíz del Error Cuadrado):</span>
                <strong>{regresion.metricas_documento.raiz_error_cuadrado_promedio}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Predicciones de Muestra */}
        {regresion.predicciones_muestra && regresion.predicciones_muestra.length > 0 && (
          <div className="regresion-predicciones">
            <h4>Comparación de Predicciones</h4>
            <div className="predicciones-table-container">
              <table className="predicciones-table">
                <thead>
                  <tr>
                    <th>Muestra</th>
                    <th>Precio Real</th>
                    <th>Pred. Simple</th>
                    <th>Error Simple</th>
                    <th>Pred. Múltiple</th>
                    <th>Error Múltiple</th>
                  </tr>
                </thead>
                <tbody>
                  {regresion.predicciones_muestra.map((p) => (
                    <tr key={p.muestra}>
                      <td>{p.muestra}</td>
                      <td>${p.precio_real}</td>
                      <td>${p.precio_predicho_simple}</td>
                      <td className={p.error_simple < p.error_multiple ? 'error-bueno' : 'error-malo'}>
                        ${p.error_simple}
                      </td>
                      <td>${p.precio_predicho_multiple}</td>
                      <td className={p.error_multiple < p.error_simple ? 'error-bueno' : 'error-malo'}>
                        ${p.error_multiple}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ========== RENDER REGRESIÓN LINEAL BÁSICA ==========
  const renderRegresionLinealBasica = () => {
    const regresion = analisisResultados?.regresion_lineal;
    if (!regresion) return null;

    return (
      <div className="analisis-regresion-section">
        <h3>
          <span className="regresion-icon">📊</span>
          Regresión Lineal - Predicción de Precios
        </h3>
        
        <div className="regresion-metrics">
          <div className="metric-card">
            <div className="metric-label">R2 Score</div>
            <div className="metric-value" style={{ color: '#96bd44' }}>
              {regresion.r2_score ? regresion.r2_score.toFixed(4) : '0.0000'}
            </div>
            <div className="metric-interpretacion">
              {regresion.r2_score >= 0.7 ? 'Buen modelo predictivo' : 
               regresion.r2_score >= 0.5 ? 'Modelo moderado' : 'Modelo con baja precisión'}
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">RMSE</div>
            <div className="metric-value">{regresion.rmse ? regresion.rmse.toFixed(2) : '0.00'}</div>
            <div className="metric-interpretacion">Error promedio de predicción</div>
          </div>
        </div>

        {regresion.predicciones?.length > 0 && (
          <div className="regresion-grafica">
            <h4>Visualización de Predicciones</h4>
            <div className="grafica-container">
              <canvas id="scatterChart" style={{ width: '100%', height: '400px' }}></canvas>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!show) return null;

  return (
    <div className={`analisis-modal-overlay ${darkMode ? 'dark-mode' : ''}`} onClick={onClose}>
      <div className="analisis-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="analisis-modal-header">
          <div className="header-icon">
            <h3>Analisis con Apache Spark</h3>
          </div>
          <button className="close-modal-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="analisis-modal-body">
          {analisisLoading ? (
            <div className="analisis-loading">
              <div className="loading-spinner"></div>
              <p>Ejecutando analisis con Spark...</p>
              <p className="loading-subtext">Procesando datos de suplementos con regresion lineal y clustering</p>
            </div>
          ) : analisisError ? (
            <div className="analisis-error">
              <p className="error-message">{analisisError}</p>
              <button className="retry-btn" onClick={onRefresh}>Reintentar</button>
            </div>
          ) : analisisResultados ? (
            <div className="analisis-resultados">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-info">
                    <div className="stat-label">Total Suplementos</div>
                    <div className="stat-value">{analisisResultados.total_suplementos || 0}</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-info">
                    <div className="stat-label">Precio Promedio</div>
                    <div className="stat-value">{formatPrice(analisisResultados.precio_promedio || 0)}</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-info">
                    <div className="stat-label">Precio Minimo</div>
                    <div className="stat-value">{formatPrice(analisisResultados.precio_minimo || 0)}</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-info">
                    <div className="stat-label">Precio Maximo</div>
                    <div className="stat-value">{formatPrice(analisisResultados.precio_maximo || 0)}</div>
                  </div>
                </div>
              </div>

              {/* Limpieza de Datos */}
              {renderLimpiezaDatos()}

              {/* Data House */}
              {renderDataHouse()}

              {/* Regresión Lineal Básica */}
              {renderRegresionLinealBasica()}

              {/* Árbol de Decisión */}
              {renderArbolDecision()}

              {/* Bosque Aleatorio */}
              {renderBosqueAleatorio()}

              {/* Regresión Lineal Completa */}
              {renderRegresionLinealCompleta()}

              {/* KMeans */}
              {renderKMeans()}

              {/* Distribución por Categorías */}
              {analisisResultados.distribucion_categorias && 
                Object.keys(analisisResultados.distribucion_categorias).length > 0 && (
                  <div className="distribucion-section">
                    <h4>Distribución por Categorías</h4>
                    <div className="grafica-container">
                      <canvas id="barChart" style={{ width: '100%', height: '300px' }}></canvas>
                    </div>
                  </div>
                )}
            </div>
          ) : null}
        </div>
        
        <div className="analisis-modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cerrar</button>
          {!analisisLoading && !analisisError && analisisResultados && (
            <button className="btn-refresh" onClick={onRefresh}>
              <span className="refresh-icon">↻</span>
              Actualizar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalisisSparkModal;