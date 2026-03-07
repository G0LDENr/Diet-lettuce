import React, { useEffect, useState } from 'react';
import CreateEspecialForm from './create-especial';
import EditEspecialForm from './edit-especial';
import { useConfig } from '../../context/config';
import '../../css/Especiales/especiales.css';

import editIcon from '../../img/edit.png';
import deleteIcon from '../../img/delete.png';
import activateIcon from '../../img/activate.png';
import deactivateIcon from '../../img/deactivate.png';
import sparkIcon from '../../img/spark.png';

// Mapeo de categorías a nombres amigables (sin emojis)
const categoriaNombres = {
  'ensaladas': 'Ensalada',
  'batidos': 'Batido',
  'proteinas': 'Proteína',
  'suplementos': 'Suplemento',
  'bebidas': 'Bebida'
};

const Especiales = () => {
  const { darkMode } = useConfig();
  const [especiales, setEspeciales] = useState([]);
  const [filteredEspeciales, setFilteredEspeciales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  
  // Estados para modales de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [especialToAction, setEspecialToAction] = useState(null);
  const [actionType, setActionType] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState(false);
  
  // Estados para análisis con Spark
  const [showAnalisisModal, setShowAnalisisModal] = useState(false);
  const [analisisResultados, setAnalisisResultados] = useState(null);
  const [analisisLoading, setAnalisisLoading] = useState(false);
  const [analisisError, setAnalisisError] = useState('');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEspecial, setSelectedEspecial] = useState(null);
  const especialesPerPage = 7;

  useEffect(() => {
    fetchEspeciales();
  }, []);

  const fetchEspeciales = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://127.0.0.1:5000/especiales/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        const especialesWithSimpleIds = data.map((especial, index) => ({
          ...especial,
          simpleId: index + 1,
          categoria: especial.categoria || 'ensaladas'
        }));
        
        setEspeciales(especialesWithSimpleIds);
        setFilteredEspeciales(especialesWithSimpleIds);
      } else {
        console.error('Error al obtener especiales:', response.status);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para ejecutar análisis con Spark
  const ejecutarAnalisisSpark = async () => {
    setAnalisisLoading(true);
    setAnalisisError('');
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://127.0.0.1:5000/especiales/analisis', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setAnalisisResultados(data);
      } else {
        setAnalisisError(data.msg || 'Error al ejecutar el análisis');
      }
    } catch (error) {
      console.error('Error en análisis Spark:', error);
      setAnalisisError('Error de conexión al ejecutar el análisis');
    } finally {
      setAnalisisLoading(false);
    }
  };

  useEffect(() => {
    let filtered = especiales;

    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(especial => 
        especial.simpleId.toString().includes(searchTerm) || 
        especial.id.toString().includes(searchTerm) ||
        especial.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        especial.ingredientes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        especial.precio?.toString().includes(searchTerm) ||
        (especial.categoria && especial.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== '') {
      filtered = filtered.filter(especial => 
        statusFilter === 'activo' ? especial.activo : !especial.activo
      );
    }

    if (categoriaFilter !== '') {
      filtered = filtered.filter(especial => especial.categoria === categoriaFilter);
    }
    
    setFilteredEspeciales(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoriaFilter, especiales]);

  const indexOfLastEspecial = currentPage * especialesPerPage;
  const indexOfFirstEspecial = indexOfLastEspecial - especialesPerPage;
  const currentEspeciales = filteredEspeciales.slice(indexOfFirstEspecial, indexOfLastEspecial);
  const totalPages = Math.ceil(filteredEspeciales.length / especialesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Funciones para manejar modales
  const openDeleteModal = (especial) => {
    setEspecialToAction(especial);
    setActionType('delete');
    setActionError('');
    setActionSuccess(false);
    setShowDeleteModal(true);
  };

  const openStatusModal = (especial) => {
    setEspecialToAction(especial);
    setActionType('toggle');
    setActionError('');
    setActionSuccess(false);
    setShowStatusModal(true);
  };

  const closeActionModals = () => {
    setShowDeleteModal(false);
    setShowStatusModal(false);
    setEspecialToAction(null);
    setActionLoading(false);
    setActionError('');
    setActionSuccess(false);
  };

  const confirmDelete = async () => {
    if (!especialToAction) return;

    setActionLoading(true);
    setActionError('');

    try {
      const token = localStorage.getItem('token');
      
      console.log('🗑️ Eliminando especial:', {
        id: especialToAction.id,
        nombre: especialToAction.nombre
      });
      
      if (!token) {
        setActionError('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
        setActionLoading(false);
        return;
      }

      const response = await fetch(`http://127.0.0.1:5000/especiales/${especialToAction.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const responseText = await response.text();

      if (response.ok) {
        console.log('✅ Especial eliminado exitosamente');
        setActionSuccess(true);
        
        setTimeout(() => {
          const updatedEspeciales = especiales.filter(e => e.id !== especialToAction.id);
          const especialesWithSimpleIds = updatedEspeciales.map((e, index) => ({
            ...e,
            simpleId: index + 1
          }));
          
          setEspeciales(especialesWithSimpleIds);
          setFilteredEspeciales(especialesWithSimpleIds);
          
          if (currentEspeciales.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          }
          
          closeActionModals();
        }, 1500);
      } else {
        let errorMsg = `Error ${response.status}: ${response.statusText}`;
        try {
          if (responseText.trim()) {
            const errorData = JSON.parse(responseText);
            errorMsg = errorData.msg || errorData.message || errorData.error || errorMsg;
          }
        } catch (e) {
          errorMsg = responseText || errorMsg;
        }
        
        if (response.status === 401) {
          errorMsg = 'No autorizado. Token inválido o expirado.';
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        
        setActionError(errorMsg);
        setActionLoading(false);
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      setActionError('Error de conexión. Verifica tu conexión a internet.');
      setActionLoading(false);
    }
  };

  const confirmToggleStatus = async () => {
    if (!especialToAction) return;

    const newStatus = !especialToAction.activo;
    const action = newStatus ? 'activar' : 'desactivar';

    setActionLoading(true);
    setActionError('');

    try {
      const token = localStorage.getItem('token');
      
      console.log(`🔄 ${action.toUpperCase()} especial:`, {
        id: especialToAction.id,
        nombre: especialToAction.nombre,
        estadoActual: especialToAction.activo,
        nuevoEstado: newStatus
      });

      const response = await fetch(`http://127.0.0.1:5000/especiales/${especialToAction.id}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const responseText = await response.text();

      if (response.ok) {
        console.log(`✅ Especial ${action}do exitosamente`);
        setActionSuccess(true);
        
        setTimeout(() => {
          const updatedEspeciales = especiales.map(especial => 
            especial.id === especialToAction.id 
              ? { ...especial, activo: newStatus }
              : especial
          );
          
          setEspeciales(updatedEspeciales);
          setFilteredEspeciales(updatedEspeciales);
          
          closeActionModals();
        }, 1500);
      } else {
        let errorMsg = `Error ${response.status}: ${response.statusText}`;
        try {
          if (responseText.trim()) {
            const errorData = JSON.parse(responseText);
            errorMsg = errorData.msg || errorData.message || errorData.error || errorMsg;
          }
        } catch (e) {
          errorMsg = responseText || errorMsg;
        }
        
        setActionError(errorMsg);
        setActionLoading(false);
      }
    } catch (error) {
      console.error(`❌ Error al ${action} especial:`, error);
      setActionError(`Error de conexión al ${action} especial.`);
      setActionLoading(false);
    }
  };

  const handleEdit = (especial) => {
    setSelectedEspecial(especial);
    setShowEditModal(true);
  };

  const handleAddEspecial = () => {
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedEspecial(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  const getStatusBadge = (activo) => {
    return activo ? (
      <span className="especiales-status-badge active">Activo</span>
    ) : (
      <span className="especiales-status-badge inactive">Inactivo</span>
    );
  };

  // Función para obtener el color de fondo según categoría
  const getCategoriaColor = (categoria) => {
    switch(categoria) {
      case 'ensaladas': return '#e8f5e9';
      case 'batidos': return '#e3f2fd';
      case 'proteinas': return '#f3e5f5';
      case 'suplementos': return '#fff3e0';
      case 'bebidas': return '#e0f2f1';
      default: return '#f5f5f5';
    }
  };

  if (loading && especiales.length === 0) {
    return (
      <div className={`especiales-container ${darkMode ? 'dark-mode' : ''}`}>
        <div className="especiales-loading-spinner"></div>
        <p className="especiales-loading-text">Cargando especiales...</p>
      </div>
    );
  }

  return (
    <div className={`especiales-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="especiales-content">
        
        {/* Header con título y botones */}
        <div className="especiales-section-header">
          <h3 className="especiales-section-title">Gestión de Especiales</h3>
          <div className="especiales-header-buttons">
            {/* BOTÓN DE ANÁLISIS CON SPARK */}
            <button 
              className="especiales-spark-btn"
              onClick={() => {
                setShowAnalisisModal(true);
                ejecutarAnalisisSpark();
              }}
              title="Analizar especiales con Apache Spark"
            >
              <span className="especiales-spark-icon"></span>
              Análisis con Spark
            </button>
            
            <button 
              className="especiales-add-btn"
              onClick={handleAddEspecial}
              title="Agregar nuevo especial"
            >
              <span className="especiales-btn-icon">+</span>
              Agregar Especial
            </button>
          </div>
        </div>

        {/* Buscador y Filtros */}
        <div className="especiales-search-section">
          <div className="especiales-filters-row">
            <div className="especiales-search-container especiales-main-search">
              <input
                type="text"
                placeholder="Buscar por ID, nombre, ingredientes, precio o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="especiales-search-input"
              />
              {searchTerm && (
                <button 
                  className="especiales-clear-search"
                  onClick={() => setSearchTerm('')}
                  title="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="especiales-filter-group">
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="especiales-filter-select"
              >
                <option value="">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </select>
            </div>

            {/* FILTRO DE CATEGORÍA SIN EMOJIS */}
            <div className="especiales-filter-group">
              <select 
                value={categoriaFilter} 
                onChange={(e) => setCategoriaFilter(e.target.value)}
                className="especiales-filter-select"
              >
                <option value="">Todas las categorías</option>
                <option value="ensaladas">Ensaladas</option>
                <option value="batidos">Batidos</option>
                <option value="proteinas">Proteínas</option>
                <option value="suplementos">Suplementos</option>
                <option value="bebidas">Bebidas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla de especiales */}
        <div className="especiales-table-container">
          <table className="especiales-table">
            <thead>
              <tr>
                <th className="especiales-th">ID</th>
                <th className="especiales-th">Nombre</th>
                <th className="especiales-th">Categoría</th>
                <th className="especiales-th">Ingredientes</th>
                <th className="especiales-th">Precio</th>
                <th className="especiales-th">Estado</th>
                <th className="especiales-th especiales-actions-header">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentEspeciales.length > 0 ? (
                currentEspeciales.map(especial => (
                  <tr key={especial.id} className="especiales-row">
                    <td className="especiales-td especiales-id">{especial.simpleId}</td>
                    <td className="especiales-td especiales-name">{especial.nombre || 'N/A'}</td>
                    
                    {/* CELDA DE CATEGORÍA SIN EMOJIS */}
                    <td className="especiales-td especiales-categoria">
                      <span 
                        className="especiales-categoria-badge"
                        style={{ 
                          backgroundColor: getCategoriaColor(especial.categoria),
                          padding: '4px 8px',
                          borderRadius: '12px',
                          display: 'inline-block'
                        }}
                      >
                        {categoriaNombres[especial.categoria] || especial.categoria}
                      </span>
                    </td>
                    
                    <td className="especiales-td especiales-ingredientes">
                      {especial.ingredientes ? (
                        <span title={especial.ingredientes}>
                          {especial.ingredientes.length > 50 
                            ? `${especial.ingredientes.substring(0, 50)}...` 
                            : especial.ingredientes
                          }
                        </span>
                      ) : 'N/A'}
                    </td>
                    <td className="especiales-td especiales-price">{formatPrice(especial.precio)}</td>
                    <td className="especiales-td especiales-status">
                      {getStatusBadge(especial.activo)}
                    </td>
                    <td className="especiales-td especiales-actions-cell">
                      <div className="especiales-actions-buttons">
                        <button 
                          onClick={() => handleEdit(especial)}
                          className="especiales-action-btn especiales-edit-btn"
                          title="Editar especial"
                        >
                          <img src={editIcon} alt="Editar" className="especiales-action-icon" />
                        </button>
                        <button 
                          onClick={() => openStatusModal(especial)}
                          className="especiales-action-btn especiales-status-btn"
                          title={especial.activo ? "Desactivar especial" : "Activar especial"}
                        >
                          <img 
                            src={especial.activo ? deactivateIcon : activateIcon} 
                            alt={especial.activo ? "Desactivar" : "Activar"} 
                            className="especiales-action-icon" 
                          />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(especial)}
                          className="especiales-action-btn especiales-delete-btn"
                          title="Eliminar especial"
                        >
                          <img src={deleteIcon} alt="Eliminar" className="especiales-action-icon" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="especiales-no-results">
                    {searchTerm || statusFilter || categoriaFilter ? 'No se encontraron especiales con esos criterios' : 'No hay especiales registrados'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Paginación */}
          {filteredEspeciales.length > especialesPerPage && (
            <div className="especiales-pagination-container">
              <div className="especiales-pagination-controls">
                <button 
                  onClick={() => paginate(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="especiales-pagination-btn especiales-prev-btn"
                >
                  Anterior
                </button>
                
                <div className="especiales-pagination-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(number => 
                      number === 1 || 
                      number === totalPages || 
                      (number >= currentPage - 1 && number <= currentPage + 1)
                    )
                    .map((number, index, array) => {
                      const showEllipsis = index > 0 && number - array[index - 1] > 1;
                      return (
                        <React.Fragment key={number}>
                          {showEllipsis && <span className="especiales-pagination-ellipsis">...</span>}
                          <button
                            onClick={() => paginate(number)}
                            className={`especiales-pagination-btn ${currentPage === number ? 'active' : ''}`}
                          >
                            {number}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>
                
                <button 
                  onClick={() => paginate(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  className="especiales-pagination-btn especiales-next-btn"
                >
                  Siguiente
                </button>
              </div>

              <div className="especiales-count-info">
                Mostrando {currentEspeciales.length} de {filteredEspeciales.length} especiales
              </div>
            </div>
          )}

          {filteredEspeciales.length <= especialesPerPage && filteredEspeciales.length > 0 && (
            <div className="especiales-count-info">
              Mostrando {currentEspeciales.length} de {filteredEspeciales.length} especiales
            </div>
          )}
        </div>

        {/* Modal de Análisis con Spark */}
        {showAnalisisModal && (
          <div className="especiales-modal-overlay">
            <div className="especiales-modal-content especiales-analisis-modal">
              <div className="especiales-modal-header">
                <h3 className="especiales-modal-title">
                  <span className="especiales-spark-title-icon"></span>
                  Análisis con Apache Spark
                </h3>
                <button 
                  className="especiales-close-modal" 
                  onClick={() => setShowAnalisisModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className="especiales-modal-body">
                {analisisLoading ? (
                  <div className="especiales-analisis-loading">
                    <div className="especiales-analisis-spinner"></div>
                    <p>Ejecutando análisis con Spark...</p>
                    <p className="especiales-analisis-subtext">Procesando datos de especiales</p>
                  </div>
                ) : analisisError ? (
                  <div className="especiales-analisis-error">
                    <div className="especiales-analisis-error-icon"></div>
                    <p className="especiales-analisis-error-message">{analisisError}</p>
                  </div>
                ) : analisisResultados && (
                  <div className="especiales-analisis-resultados">
                    <div className="especiales-analisis-stats">
                      <div className="especiales-analisis-stat-card">
                        <div className="especiales-analisis-stat-label">Total Especiales</div>
                        <div className="especiales-analisis-stat-value">{analisisResultados.total_especiales || 0}</div>
                      </div>
                      <div className="especiales-analisis-stat-card">
                        <div className="especiales-analisis-stat-label">Precio Promedio</div>
                        <div className="especiales-analisis-stat-value">
                          {formatPrice(analisisResultados.precio_promedio || 0)}
                        </div>
                      </div>
                      <div className="especiales-analisis-stat-card">
                        <div className="especiales-analisis-stat-label">Precio Mínimo</div>
                        <div className="especiales-analisis-stat-value">
                          {formatPrice(analisisResultados.precio_minimo || 0)}
                        </div>
                      </div>
                      <div className="especiales-analisis-stat-card">
                        <div className="especiales-analisis-stat-label">Precio Máximo</div>
                        <div className="especiales-analisis-stat-value">
                          {formatPrice(analisisResultados.precio_maximo || 0)}
                        </div>
                      </div>
                    </div>

                    {analisisResultados.distribucion_categorias && (
                      <div className="especiales-analisis-categorias">
                        <h4>Distribución por Categorías</h4>
                        <div className="especiales-analisis-categoria-grid">
                          {Object.entries(analisisResultados.distribucion_categorias).map(([categoria, cantidad]) => (
                            <div key={categoria} className="especiales-analisis-categoria-item">
                              <span className="especiales-analisis-categoria-nombre">
                                {categoriaNombres[categoria] || categoria}
                              </span>
                              <span className="especiales-analisis-categoria-cantidad">{cantidad}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {analisisResultados.especiales_destacados && (
                      <div className="especiales-analisis-destacados">
                        <h4>Especiales Destacados</h4>
                        <ul className="especiales-analisis-destacados-lista">
                          {analisisResultados.especiales_destacados.map((especial, index) => (
                            <li key={index} className="especiales-analisis-destacado-item">
                              <strong>{especial.nombre}</strong> - {formatPrice(especial.precio)}
                              <span className="especiales-analisis-destacado-categoria">
                                ({categoriaNombres[especial.categoria] || especial.categoria})
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="especiales-modal-footer">
                <button 
                  className="especiales-btn-cancel"
                  onClick={() => setShowAnalisisModal(false)}
                >
                  Cerrar
                </button>
                {!analisisLoading && !analisisError && analisisResultados && (
                  <button 
                    className="especiales-btn-reload-analisis"
                    onClick={ejecutarAnalisisSpark}
                  >
                    <span className="especiales-reload-icon">↻</span>
                    Actualizar Análisis
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación para eliminar */}
        {showDeleteModal && especialToAction && (
          <div className="especiales-modal-overlay">
            <div className="especiales-modal-content especiales-delete-modal">
              <div className="especiales-modal-header">
                <h3 className="especiales-modal-title">Confirmar Eliminación</h3>
                <button className="especiales-close-modal" onClick={closeActionModals} disabled={actionLoading}>✕</button>
              </div>
              <div className="especiales-modal-body">
                {actionError ? (
                  <div className="especiales-delete-error">
                    <div className="especiales-delete-error-icon">❌</div>
                    <p className="especiales-delete-error-message">{actionError}</p>
                  </div>
                ) : actionSuccess ? (
                  <div className="especiales-delete-success">
                    <div className="especiales-delete-success-icon"></div>
                    <p className="especiales-delete-success-message">Especial eliminado exitosamente</p>
                  </div>
                ) : actionLoading ? (
                  <div className="especiales-delete-loading">
                    <div className="especiales-delete-spinner"></div>
                    <p className="especiales-delete-loading-text">Eliminando especial...</p>
                  </div>
                ) : (
                  <>
                    <div className="especiales-delete-icon"></div>
                    <p className="especiales-delete-question">
                      ¿Estás seguro de que quieres eliminar este especial?
                    </p>
                    <div className="especiales-delete-info">
                      <p><strong>Nombre:</strong> {especialToAction.nombre}</p>
                      <p><strong>Categoría:</strong> {categoriaNombres[especialToAction.categoria] || especialToAction.categoria}</p>
                      <p><strong>Ingredientes:</strong> {especialToAction.ingredientes || 'Sin ingredientes'}</p>
                      <p><strong>Precio:</strong> {formatPrice(especialToAction.precio)}</p>
                      <p><strong>Estado:</strong> {especialToAction.activo ? 'Activo' : 'Inactivo'}</p>
                    </div>
                    <p className="especiales-delete-warning">
                      Esta acción no se puede deshacer. El especial será eliminado permanentemente.
                    </p>
                  </>
                )}
              </div>
              <div className="especiales-modal-footer">
                {!actionLoading && !actionSuccess && !actionError && (
                  <>
                    <button 
                      className="especiales-btn-cancel"
                      onClick={closeActionModals}
                    >
                      Cancelar
                    </button>
                    <button 
                      className="especiales-btn-delete"
                      onClick={confirmDelete}
                    >
                      Eliminar
                    </button>
                  </>
                )}
                {(actionLoading || actionSuccess || actionError) && (
                  <button 
                    className="especiales-btn-cancel"
                    onClick={closeActionModals}
                  >
                    Cerrar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación para cambiar estado */}
        {showStatusModal && especialToAction && (
          <div className="especiales-modal-overlay">
            <div className="especiales-modal-content especiales-status-modal">
              <div className="especiales-modal-header">
                <h3 className="especiales-modal-title">Confirmar Cambio de Estado</h3>
                <button className="especiales-close-modal" onClick={closeActionModals} disabled={actionLoading}>✕</button>
              </div>
              <div className="especiales-modal-body">
                {actionError ? (
                  <div className="especiales-status-error">
                    <div className="especiales-status-error-icon"></div>
                    <p className="especiales-status-error-message">{actionError}</p>
                  </div>
                ) : actionSuccess ? (
                  <div className="especiales-status-success">
                    <div className="especiales-status-success-icon"></div>
                    <p className="especiales-status-success-message">
                      Especial {especialToAction.activo ? 'desactivado' : 'activado'} exitosamente
                    </p>
                  </div>
                ) : actionLoading ? (
                  <div className="especiales-status-loading">
                    <div className="especiales-status-spinner"></div>
                    <p className="especiales-status-loading-text">
                      {especialToAction.activo ? 'Desactivando' : 'Activando'} especial...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="especiales-status-icon">
                      {especialToAction.activo ? '🔴' : '🟢'}
                    </div>
                    <p className="especiales-status-question">
                      ¿Estás seguro de que quieres <strong>{especialToAction.activo ? 'desactivar' : 'activar'}</strong> este especial?
                    </p>
                    <div className="especiales-status-info">
                      <p><strong>Nombre:</strong> {especialToAction.nombre}</p>
                      <p><strong>Categoría:</strong> {categoriaNombres[especialToAction.categoria] || especialToAction.categoria}</p>
                      <p><strong>Estado actual:</strong> {especialToAction.activo ? 'Activo' : 'Inactivo'}</p>
                      <p><strong>Estado nuevo:</strong> {especialToAction.activo ? 'Inactivo' : 'Activo'}</p>
                    </div>
                  </>
                )}
              </div>
              <div className="especiales-modal-footer">
                {!actionLoading && !actionSuccess && !actionError && (
                  <>
                    <button 
                      className="especiales-btn-cancel"
                      onClick={closeActionModals}
                    >
                      Cancelar
                    </button>
                    <button 
                      className="especiales-btn-status"
                      onClick={confirmToggleStatus}
                    >
                      {especialToAction.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </>
                )}
                {(actionLoading || actionSuccess || actionError) && (
                  <button 
                    className="especiales-btn-cancel"
                    onClick={closeActionModals}
                  >
                    Cerrar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal para crear especial */}
        {showCreateModal && (
          <div className="especiales-modal-overlay">
            <div className="especiales-modal-content create-especial-modal">
              <div className="especiales-modal-header">
                <h3 className="especiales-modal-title">Agregar Nuevo Especial</h3>
                <button className="especiales-close-modal" onClick={closeCreateModal}>✕</button>
              </div>
              <div className="especiales-modal-body">
                <CreateEspecialForm 
                  onClose={closeCreateModal}
                  onEspecialCreated={() => {
                    fetchEspeciales();
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal para editar especial */}
        {showEditModal && selectedEspecial && (
          <div className="especiales-modal-overlay">
            <div className="especiales-modal-content">
              <div className="especiales-modal-header">
                <h3 className="especiales-modal-title">Editar Especial</h3>
                <button className="especiales-close-modal" onClick={closeEditModal}>✕</button>
              </div>
              <div className="especiales-modal-body">
                <EditEspecialForm 
                  especial={selectedEspecial}
                  onClose={closeEditModal}
                  onEspecialUpdated={() => {
                    fetchEspeciales();
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Especiales;