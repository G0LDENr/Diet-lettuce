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

  // Calcular estadísticas de stock
  const calcularEstadisticasStock = () => {
    if (!analisisResultados?.suplementos_destacados || analisisResultados.suplementos_destacados.length === 0) {
      return { min: 0, max: 0, rango: 0, umbralBajo: 0, umbralAlto: 0 };
    }
    
    const stocks = analisisResultados.suplementos_destacados.map(s => s.stock);
    const minStock = Math.min(...stocks);
    const maxStock = Math.max(...stocks);
    const rango = maxStock - minStock;
    
    const umbralBajo = minStock + (rango * 0.3);
    const umbralAlto = minStock + (rango * 0.7);
    
    return { min: minStock, max: maxStock, rango, umbralBajo, umbralAlto };
  };

  const getStockColor = (stockValue) => {
    const { umbralBajo, umbralAlto } = calcularEstadisticasStock();
    if (stockValue <= umbralBajo) return '#f44336';
    if (stockValue >= umbralAlto) return '#4caf50';
    return '#ff9800';
  };

  const getStockPromedioColor = () => {
    const stockPromedio = analisisResultados?.stock_promedio || 0;
    const { umbralBajo, umbralAlto } = calcularEstadisticasStock();
    if (stockPromedio <= umbralBajo) return '#f44336';
    if (stockPromedio >= umbralAlto) return '#4caf50';
    return '#ff9800';
  };

  const getPrecisionColor = (stockValue) => {
    const { umbralBajo, umbralAlto } = calcularEstadisticasStock();
    if (stockValue <= umbralBajo) return '#f44336';
    if (stockValue >= umbralAlto) return '#4caf50';
    return '#ff9800';
  };

  const estadisticasStock = calcularEstadisticasStock();

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
      if (scatterChartRef.current) {
        scatterChartRef.current.destroy();
      }
      if (barChartRef.current) {
        barChartRef.current.destroy();
      }
      if (kmeansChartRef.current) {
        kmeansChartRef.current.destroy();
      }
    };
  }, [show, analisisResultados]);

  const crearGraficaComparacion = () => {
    const ctx = document.getElementById('scatterChart');
    if (!ctx) return;

    if (scatterChartRef.current) {
      scatterChartRef.current.destroy();
    }

    const predicciones = analisisResultados.regresion_lineal.predicciones || [];
    
    scatterChartRef.current = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Precio Real',
            data: predicciones.map((p, idx) => ({ x: idx + 1, y: p.precio_real })),
            backgroundColor: '#96bd44',
            borderColor: '#96bd44',
            pointRadius: 8,
            pointHoverRadius: 12,
            pointStyle: 'circle',
            order: 1
          },
          {
            label: 'Precio Predicho',
            data: predicciones.map((p, idx) => ({ x: idx + 1, y: p.precio_predicho })),
            backgroundColor: '#ff9800',
            borderColor: '#ff9800',
            pointRadius: 8,
            pointHoverRadius: 12,
            pointStyle: 'triangle',
            order: 2
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
                const label = context.dataset.label || '';
                const value = context.parsed.y;
                return `${label}: $${value.toFixed(2)}`;
              }
            }
          },
          legend: {
            position: 'top',
            labels: {
              font: { size: 12 },
              usePointStyle: true,
              boxWidth: 10
            }
          },
          title: {
            display: true,
            text: 'Comparacion: Precio Real vs Precio Predicho',
            font: { size: 14, weight: 'bold' }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Muestra',
              font: { weight: 'bold' }
            },
            grid: {
              display: true
            }
          },
          y: {
            title: {
              display: true,
              text: 'Precio (MXN)',
              font: { weight: 'bold' }
            },
            grid: {
              display: true
            },
            ticks: {
              callback: function(value) {
                return '$' + value.toFixed(2);
              }
            }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        }
      }
    });
  };

  const crearGraficaCategorias = () => {
    const ctx = document.getElementById('barChart');
    if (!ctx) return;

    if (barChartRef.current) {
      barChartRef.current.destroy();
    }

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
          borderColor: '#6c9e2e',
          borderWidth: 1,
          borderRadius: 8,
          barPercentage: 0.7,
          categoryPercentage: 0.8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: { size: 12 }
            }
          },
          title: {
            display: true,
            text: 'Distribucion por Categorias',
            font: { size: 14, weight: 'bold' }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.raw} suplementos`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Cantidad',
              font: { weight: 'bold' }
            },
            ticks: {
              stepSize: 1,
              precision: 0
            }
          },
          x: {
            title: {
              display: true,
              text: 'Categorias',
              font: { weight: 'bold' }
            }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        }
      }
    });
  };

  const crearGraficaKMeans = () => {
    const ctx = document.getElementById('kmeansChart');
    if (!ctx) return;

    if (kmeansChartRef.current) {
      kmeansChartRef.current.destroy();
    }

    const clusters = analisisResultados.kmeans?.clusters || [];
    const labels = clusters.map(c => c.tipo);
    const data = clusters.map(c => c.cantidad);
    const colores = ['#96bd44', '#ff9800', '#f44336'];

    kmeansChartRef.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colores,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { size: 12 }
            }
          },
          title: {
            display: true,
            text: 'Distribucion de Productos por Cluster',
            font: { size: 14, weight: 'bold' }
          },
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

  const renderKMeans = () => {
    const kmeans = analisisResultados?.kmeans;
    if (!kmeans || !kmeans.clusters || kmeans.clusters.length === 0) return null;

    const getSilhouetteColor = (score) => {
      if (score >= 0.7) return '#4caf50';
      if (score >= 0.5) return '#ff9800';
      if (score >= 0.3) return '#ffc107';
      return '#f44336';
    };

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
            <div className="metric-value" style={{ color: getSilhouetteColor(kmeans.silhouette_score) }}>
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
                  <div className="stat-row">
                    <span><strong>Rango precios:</strong></span>
                    <strong>{formatPrice(cluster.precio_minimo)} - {formatPrice(cluster.precio_maximo)}</strong>
                  </div>
                  <div className="stat-row">
                    <span><strong>Stock promedio:</strong></span>
                    <strong>{Math.round(cluster.stock_promedio)} unidades</strong>
                  </div>
                </div>
                {cluster.productos && cluster.productos.length > 0 && (
                  <div className="cluster-productos">
                    <span>Productos destacados:</span>
                    <ul>
                      {cluster.productos.map((prod, i) => (
                        <li key={i}>{prod}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="cluster-recomendacion">
                  <span className="recomendacion-label">Recomendacion:</span>
                  <p>{cluster.recomendacion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="kmeans-interpretacion">
          <h4>Interpretacion del Analisis</h4>
          <p>
            El algoritmo KMeans ha segmentado los productos en <strong>{kmeans.clusters.length} grupos</strong> basados en 
            precio y stock. El silhouette score de <strong>{kmeans.silhouette_score?.toFixed(4)}</strong> indica que 
            la segmentacion es <strong>{getSilhouetteText(kmeans.silhouette_score).split(' - ')[0].toLowerCase()}</strong>.
          </p>
          <p className="insight">
            <strong>Insight de negocio:</strong> Los productos {kmeans.clusters[0]?.tipo?.toLowerCase()} representan 
            el {kmeans.clusters[0]?.porcentaje}% del inventario y deberian manejarse con 
            {kmeans.clusters[0]?.recomendacion?.toLowerCase()}.
          </p>
        </div>
      </div>
    );
  };

  if (!show) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price || 0);
  };

  const getR2Color = (r2) => {
    if (r2 >= 0.8) return '#4caf50';
    if (r2 >= 0.6) return '#ff9800';
    if (r2 >= 0.4) return '#ffc107';
    return '#f44336';
  };

  const getR2Interpretacion = (r2) => {
    if (r2 >= 0.8) return 'Excelente - El modelo explica muy bien la variabilidad de precios';
    if (r2 >= 0.6) return 'Bueno - El modelo explica adecuadamente la variabilidad de precios';
    if (r2 >= 0.4) return 'Moderado - El modelo tiene capacidad predictiva limitada';
    return 'Debil - El modelo no explica bien la variabilidad de precios';
  };

  const renderRegresionLineal = () => {
    const regresion = analisisResultados?.regresion_lineal;
    if (!regresion) return null;

    const tienePredicciones = regresion.predicciones && regresion.predicciones.length > 0;

    return (
      <div className="analisis-regresion-section">
        <h3>
          <span className="regresion-icon"></span>
          Regresion Lineal - Prediccion de Precios
        </h3>
        
        <div className="regresion-metrics">
          <div className="metric-card">
            <div className="metric-label">R2 Score</div>
            <div className="metric-value" style={{ color: getR2Color(regresion.r2_score) }}>
              {regresion.r2_score ? regresion.r2_score.toFixed(4) : '0.0000'}
            </div>
            <div className="metric-interpretacion">{getR2Interpretacion(regresion.r2_score)}</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-label">RMSE</div>
            <div className="metric-value">{regresion.rmse ? regresion.rmse.toFixed(2) : '0.00'}</div>
            <div className="metric-interpretacion">Error cuadratico medio (menor es mejor)</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-label">MSE</div>
            <div className="metric-value">{regresion.mse ? regresion.mse.toFixed(2) : '0.00'}</div>
            <div className="metric-interpretacion">Error medio cuadratico</div>
          </div>
        </div>

        <div className="stock-legend-info">
          <h4>Clasificacion de Stock (Dinamica)</h4>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#f44336' }}></span>
              <span>Stock Bajo (≤ {Math.round(estadisticasStock.umbralBajo)})</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#ff9800' }}></span>
              <span>Stock Medio ({Math.round(estadisticasStock.umbralBajo)} - {Math.round(estadisticasStock.umbralAlto)})</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#4caf50' }}></span>
              <span>Stock Alto (≥ {Math.round(estadisticasStock.umbralAlto)})</span>
            </div>
          </div>
          <div className="legend-note">
            <small>Stock Min: {estadisticasStock.min} | Stock Max: {estadisticasStock.max}</small>
          </div>
        </div>

        {tienePredicciones && (
          <div className="regresion-grafica">
            <h4>Visualizacion de Predicciones</h4>
            <div className="grafica-container">
              <canvas id="scatterChart" style={{ width: '100%', height: '400px' }}></canvas>
            </div>
            <div className="grafica-nota">
              <small>Los puntos verdes representan los precios reales, los naranjas los precios predichos por el modelo</small>
            </div>
          </div>
        )}

        {analisisResultados.distribucion_categorias && Object.keys(analisisResultados.distribucion_categorias).length > 0 && (
          <div className="regresion-grafica">
            <h4>Distribucion por Categorias</h4>
            <div className="grafica-container">
              <canvas id="barChart" style={{ width: '100%', height: '400px' }}></canvas>
            </div>
          </div>
        )}

        {regresion.coeficientes && Object.keys(regresion.coeficientes).length > 0 && (
          <div className="regresion-coeficientes">
            <h4>Coeficientes del Modelo</h4>
            <div className="coeficientes-grid">
              <div className="coeficiente-item">
                <span className="coeficiente-label">Categoria</span>
                <span className={`coeficiente-value ${regresion.coeficientes.categoria >= 0 ? 'positive' : 'negative'}`}>
                  {regresion.coeficientes.categoria >= 0 ? '+' : ''}{regresion.coeficientes.categoria?.toFixed(4) || '0'}
                </span>
                <span className="coeficiente-efecto">
                  {regresion.coeficientes.categoria > 0 ? 'Aumenta el precio' : 
                   regresion.coeficientes.categoria < 0 ? 'Disminuye el precio' : 'Sin efecto'}
                </span>
              </div>
              <div className="coeficiente-item">
                <span className="coeficiente-label">Presentacion</span>
                <span className={`coeficiente-value ${regresion.coeficientes.presentacion >= 0 ? 'positive' : 'negative'}`}>
                  {regresion.coeficientes.presentacion >= 0 ? '+' : ''}{regresion.coeficientes.presentacion?.toFixed(4) || '0'}
                </span>
                <span className="coeficiente-efecto">
                  {regresion.coeficientes.presentacion > 0 ? 'Aumenta el precio' : 
                   regresion.coeficientes.presentacion < 0 ? 'Disminuye el precio' : 'Sin efecto'}
                </span>
              </div>
              <div className="coeficiente-item">
                <span className="coeficiente-label">Stock</span>
                <span className="coeficiente-value" style={{ color: getStockPromedioColor() }}>
                  {regresion.coeficientes.stock >= 0 ? '+' : ''}{regresion.coeficientes.stock?.toFixed(4) || '0'}
                </span>
                <span className="coeficiente-efecto">
                  {regresion.coeficientes.stock > 0 ? 'Mayor stock = mayor precio' : 
                   regresion.coeficientes.stock < 0 ? 'Mayor stock = menor precio' : 'Sin efecto'}
                </span>
              </div>
            </div>
            <div className="coeficiente-formula">
              <strong>Formula de prediccion:</strong>
              <code>
                Precio = {regresion.coeficientes.categoria?.toFixed(2)} x (Categoria) + 
                {regresion.coeficientes.presentacion?.toFixed(2)} x (Presentacion) + 
                {regresion.coeficientes.stock?.toFixed(2)} x (Stock) + Constante
              </code>
            </div>
          </div>
        )}

        {tienePredicciones && (
          <div className="regresion-predicciones">
            <h4>Comparativa: Precio Real vs Precio Predicho</h4>
            <div className="predicciones-table-container">
              <table className="predicciones-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Producto</th>
                    <th>Stock</th>
                    <th>Precio Real</th>
                    <th>Precio Predicho</th>
                    <th>Diferencia</th>
                    <th>Precision</th>
                  </tr>
                </thead>
                <tbody>
                  {regresion.predicciones.map((pred, idx) => {
                    const diferencia = pred.diferencia;
                    const precision = Math.min(100, Math.abs(diferencia / pred.precio_real) * 100);
                    const isOverpriced = diferencia > 0;
                    const productoStock = analisisResultados.suplementos_destacados?.find(s => s.nombre === pred.nombre)?.stock || 0;
                    
                    return (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td className="producto-nombre">{pred.nombre}</td>
                        <td className="producto-stock" style={{ color: getStockColor(productoStock), fontWeight: 'bold' }}>
                          {productoStock}
                        </td>
                        <td className="precio-real">{formatPrice(pred.precio_real)}</td>
                        <td className="precio-predicho">{formatPrice(pred.precio_predicho)}</td>
                        <td className={`diferencia ${isOverpriced ? 'overpriced' : 'underpriced'}`}>
                          {isOverpriced ? '+' : '-'}{formatPrice(Math.abs(diferencia))}
                        </td>
                        <td>
                          <div className="precision-bar">
                            <div 
                              className="precision-fill" 
                              style={{ 
                                width: `${100 - precision}%`,
                                backgroundColor: getPrecisionColor(productoStock)
                              }}
                            ></div>
                            <span>{(100 - precision).toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {regresion.mensaje && (
          <div className="regresion-mensaje">
            <p>{regresion.mensaje}</p>
          </div>
        )}
      </div>
    );
  };

  const tieneStockInfo = analisisResultados?.stock_total !== undefined && analisisResultados?.stock_total > 0;

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
              <div className="error-icon"></div>
              <p className="error-message">{analisisError}</p>
              <button className="retry-btn" onClick={onRefresh}>
                Reintentar
              </button>
            </div>
          ) : analisisResultados ? (
            <div className="analisis-resultados">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon"></div>
                  <div className="stat-info">
                    <div className="stat-label">Total Suplementos</div>
                    <div className="stat-value">{analisisResultados.total_suplementos || 0}</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"></div>
                  <div className="stat-info">
                    <div className="stat-label">Precio Promedio</div>
                    <div className="stat-value">{formatPrice(analisisResultados.precio_promedio || 0)}</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"></div>
                  <div className="stat-info">
                    <div className="stat-label">Precio Minimo</div>
                    <div className="stat-value">{formatPrice(analisisResultados.precio_minimo || 0)}</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"></div>
                  <div className="stat-info">
                    <div className="stat-label">Precio Maximo</div>
                    <div className="stat-value">{formatPrice(analisisResultados.precio_maximo || 0)}</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"></div>
                  <div className="stat-info">
                    <div className="stat-label">Stock Total</div>
                    <div className="stat-value">{analisisResultados.stock_total || 0}</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"></div>
                  <div className="stat-info">
                    <div className="stat-label">Stock Promedio</div>
                    <div className="stat-value" style={{ color: getStockPromedioColor(), fontWeight: 'bold' }}>
                      {analisisResultados.stock_promedio?.toFixed(2) || 0}
                    </div>
                  </div>
                </div>
              </div>

              {renderRegresionLineal()}
              {renderKMeans()}

              {analisisResultados.suplementos_destacados && analisisResultados.suplementos_destacados.length > 0 && (
                <div className="destacados-section">
                  <h4>Suplementos Destacados</h4>
                  <div className="destacados-list">
                    {analisisResultados.suplementos_destacados.map((suplemento, index) => (
                      <div key={index} className="destacado-item">
                        <span className="destacado-nombre">{suplemento.nombre}</span>
                        <span className="destacado-precio">{formatPrice(suplemento.precio)}</span>
                        <span className="destacado-categoria">{categoriaNombres[suplemento.categoria] || suplemento.categoria}</span>
                        <span className="destacado-stock" style={{ color: getStockColor(suplemento.stock), fontWeight: 'bold' }}>
                          Stock: {suplemento.stock}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="stock-info-section">
                <h4>Informacion de Inventario</h4>
                <div className="stock-info-grid">
                  <div className="stock-info-item">
                    <span className="stock-label">Productos Activos:</span>
                    <span className="stock-value" style={{ color: '#4caf50' }}>{analisisResultados.suplementos_activos || 0}</span>
                  </div>
                  <div className="stock-info-item">
                    <span className="stock-label">Productos Inactivos:</span>
                    <span className="stock-value" style={{ color: '#ff9800' }}>{analisisResultados.suplementos_inactivos || 0}</span>
                  </div>
                  <div className="stock-info-item">
                    <span className="stock-label">Sin Stock:</span>
                    <span className="stock-value" style={{ color: (analisisResultados.suplementos_sin_stock || 0) > 0 ? '#f44336' : '#4caf50' }}>
                      {analisisResultados.suplementos_sin_stock || 0}
                    </span>
                  </div>
                  <div className="stock-info-item">
                    <span className="stock-label">Stock Bajo:</span>
                    <span className="stock-value" style={{ color: (analisisResultados.suplementos_bajo_stock || 0) > 0 ? '#f44336' : '#4caf50' }}>
                      {analisisResultados.suplementos_bajo_stock || 0}
                    </span>
                  </div>
                </div>
                {!tieneStockInfo && (
                  <div className="stock-info-mensaje">
                    <small>No hay datos de stock disponibles para los suplementos</small>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
        
        <div className="analisis-modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cerrar
          </button>
          {!analisisLoading && !analisisError && analisisResultados && (
            <button className="btn-refresh" onClick={onRefresh}>
              <span className="refresh-icon">↻</span>
              Actualizar Analisis
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalisisSparkModal;