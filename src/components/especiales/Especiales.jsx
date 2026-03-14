import React, { useEffect, useState } from 'react';
import CreateSuplementoForm from './create-especial';
import EditSuplementoForm from './edit-especial';
import { useConfig } from '../../context/config';
import '../../css/Especiales/especiales.css';

import editIcon from '../../img/edit.png';
import deleteIcon from '../../img/delete.png';
import activateIcon from '../../img/activate.png';
import deactivateIcon from '../../img/deactivate.png';
import sparkIcon from '../../img/spark.png';

// Mapeo de categorías a nombres amigables
const categoriaNombres = {
  'quemadores': 'Quemadores',
  'proteinas': 'Proteínas',
  'fibras': 'Fibras',
  'detox': 'Detox',
  'termogenicos': 'Termogénicos',
  'control_apetito': 'Control Apetito',
  'energeticos': 'Energéticos',
  'vitaminas': 'Vitaminas'
};

// Mapeo de presentaciones a nombres amigables
const presentacionNombres = {
  'polvo': 'Polvo',
  'capsulas': 'Cápsulas',
  'tabletas': 'Tabletas',
  'liquido': 'Líquido',
  'gomitas': 'Gomitas',
  'barritas': 'Barritas'
};

const Suplementos = () => {
  const { darkMode } = useConfig();
  const [suplementos, setSuplementos] = useState([]);
  const [filteredSuplementos, setFilteredSuplementos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [presentacionFilter, setPresentacionFilter] = useState('');
  
  // Estados para modales de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [suplementoToAction, setSuplementoToAction] = useState(null);
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
  const [selectedSuplemento, setSelectedSuplemento] = useState(null);
  const suplementosPerPage = 10;

  useEffect(() => {
    fetchSuplementos();
    fetchCategorias();
    fetchPresentaciones();
  }, []);

  // ===== FUNCIÓN CORREGIDA PARA OBTENER TODOS LOS SUPLEMENTOS (ACTIVOS E INACTIVOS) =====
  const fetchSuplementos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // IMPORTANTE: Agregar query param 'all=true' para obtener TODOS los suplementos
      const response = await fetch('http://127.0.0.1:5000/suplementos/?all=true', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Suplementos obtenidos (incluyendo inactivos):', data.length);
        
        const suplementosWithSimpleIds = data.map((suplemento, index) => ({
          ...suplemento,
          simpleId: index + 1,
          categoria: suplemento.categoria || 'quemadores',
          presentacion: suplemento.presentacion || 'polvo'
        }));
        
        setSuplementos(suplementosWithSimpleIds);
        setFilteredSuplementos(suplementosWithSimpleIds);
      } else {
        console.error('Error al obtener suplementos:', response.status);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/suplementos/categorias', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Categorías cargadas:', data);
      }
    } catch (error) {
      console.error('Error al obtener categorías:', error);
    }
  };

  const fetchPresentaciones = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/suplementos/presentaciones', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Presentaciones cargadas:', data);
      }
    } catch (error) {
      console.error('Error al obtener presentaciones:', error);
    }
  };

  // Función para ejecutar análisis con Spark
  const ejecutarAnalisisSpark = async () => {
    setAnalisisLoading(true);
    setAnalisisError('');
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://127.0.0.1:5000/suplementos/analisis', {
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
    let filtered = suplementos;

    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(suplemento => 
        suplemento.simpleId.toString().includes(searchTerm) || 
        suplemento.id.toString().includes(searchTerm) ||
        suplemento.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        suplemento.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        suplemento.beneficios?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        suplemento.modo_uso?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        suplemento.precio?.toString().includes(searchTerm) ||
        suplemento.stock?.toString().includes(searchTerm) ||
        (suplemento.categoria && suplemento.categoria.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (suplemento.presentacion && suplemento.presentacion.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== '') {
      filtered = filtered.filter(suplemento => 
        statusFilter === 'activo' ? suplemento.activo : !suplemento.activo
      );
    }

    if (categoriaFilter !== '') {
      filtered = filtered.filter(suplemento => suplemento.categoria === categoriaFilter);
    }

    if (presentacionFilter !== '') {
      filtered = filtered.filter(suplemento => suplemento.presentacion === presentacionFilter);
    }
    
    setFilteredSuplementos(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoriaFilter, presentacionFilter, suplementos]);

  const indexOfLastSuplemento = currentPage * suplementosPerPage;
  const indexOfFirstSuplemento = indexOfLastSuplemento - suplementosPerPage;
  const currentSuplementos = filteredSuplementos.slice(indexOfFirstSuplemento, indexOfLastSuplemento);
  const totalPages = Math.ceil(filteredSuplementos.length / suplementosPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Funciones para manejar modales
  const openDeleteModal = (suplemento) => {
    setSuplementoToAction(suplemento);
    setActionType('delete');
    setActionError('');
    setActionSuccess(false);
    setShowDeleteModal(true);
  };

  const openStatusModal = (suplemento) => {
    setSuplementoToAction(suplemento);
    setActionType('toggle');
    setActionError('');
    setActionSuccess(false);
    setShowStatusModal(true);
  };

  const closeActionModals = () => {
    setShowDeleteModal(false);
    setShowStatusModal(false);
    setSuplementoToAction(null);
    setActionLoading(false);
    setActionError('');
    setActionSuccess(false);
  };

  const confirmDelete = async () => {
    if (!suplementoToAction) return;

    setActionLoading(true);
    setActionError('');

    try {
      const token = localStorage.getItem('token');
      
      console.log('🗑️ Eliminando suplemento:', {
        id: suplementoToAction.id,
        nombre: suplementoToAction.nombre
      });
      
      if (!token) {
        setActionError('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
        setActionLoading(false);
        return;
      }

      const response = await fetch(`http://127.0.0.1:5000/suplementos/${suplementoToAction.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const responseText = await response.text();

      if (response.ok) {
        console.log('✅ Suplemento eliminado exitosamente');
        setActionSuccess(true);
        
        setTimeout(() => {
          const updatedSuplementos = suplementos.filter(e => e.id !== suplementoToAction.id);
          const suplementosWithSimpleIds = updatedSuplementos.map((e, index) => ({
            ...e,
            simpleId: index + 1
          }));
          
          setSuplementos(suplementosWithSimpleIds);
          setFilteredSuplementos(suplementosWithSimpleIds);
          
          if (currentSuplementos.length === 1 && currentPage > 1) {
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
    if (!suplementoToAction) return;

    const newStatus = !suplementoToAction.activo;
    const action = newStatus ? 'activar' : 'desactivar';

    setActionLoading(true);
    setActionError('');

    try {
      const token = localStorage.getItem('token');
      
      console.log(`🔄 ${action.toUpperCase()} suplemento:`, {
        id: suplementoToAction.id,
        nombre: suplementoToAction.nombre,
        estadoActual: suplementoToAction.activo,
        nuevoEstado: newStatus
      });

      const response = await fetch(`http://127.0.0.1:5000/suplementos/${suplementoToAction.id}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const responseText = await response.text();

      if (response.ok) {
        console.log(`✅ Suplemento ${action}do exitosamente`);
        setActionSuccess(true);
        
        setTimeout(() => {
          const updatedSuplementos = suplementos.map(suplemento => 
            suplemento.id === suplementoToAction.id 
              ? { ...suplemento, activo: newStatus }
              : suplemento
          );
          
          setSuplementos(updatedSuplementos);
          setFilteredSuplementos(updatedSuplementos);
          
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
      console.error(`❌ Error al ${action} suplemento:`, error);
      setActionError(`Error de conexión al ${action} suplemento.`);
      setActionLoading(false);
    }
  };

  const handleEdit = (suplemento) => {
    setSelectedSuplemento(suplemento);
    setShowEditModal(true);
  };

  const handleAddSuplemento = () => {
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedSuplemento(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  const getStatusBadge = (activo) => {
    return activo ? (
      <span className="suplementos-status-badge active">Activo</span>
    ) : (
      <span className="suplementos-status-badge inactive">Inactivo</span>
    );
  };

  // Función para obtener el color de fondo según categoría
  const getCategoriaColor = (categoria) => {
    switch(categoria) {
      case 'quemadores': return '#ffebee';
      case 'proteinas': return '#e8f5e9';
      case 'fibras': return '#fff3e0';
      case 'detox': return '#e0f2f1';
      case 'termogenicos': return '#f3e5f5';
      case 'control_apetito': return '#e1f5fe';
      case 'energeticos': return '#fff8e1';
      case 'vitaminas': return '#e8eaf6';
      default: return '#f5f5f5';
    }
  };

  // Función para obtener el color de fondo según presentación
  const getPresentacionColor = (presentacion) => {
    switch(presentacion) {
      case 'polvo': return '#e8f5e9';
      case 'capsulas': return '#e3f2fd';
      case 'tabletas': return '#f3e5f5';
      case 'liquido': return '#e0f2f1';
      case 'gomitas': return '#fff3e0';
      case 'barritas': return '#fff8e1';
      default: return '#f5f5f5';
    }
  };

  if (loading && suplementos.length === 0) {
    return (
      <div className={`suplementos-container ${darkMode ? 'dark-mode' : ''}`}>
        <div className="suplementos-loading-spinner"></div>
        <p className="suplementos-loading-text">Cargando suplementos...</p>
      </div>
    );
  }

  return (
    <div className={`suplementos-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="suplementos-content">
        
        {/* Header con título y botones */}
        <div className="suplementos-section-header">
          <h3 className="suplementos-section-title">Gestión de Suplementos</h3>
          <div className="suplementos-header-buttons">
            {/* BOTÓN DE ANÁLISIS CON SPARK */}
            <button 
              className="suplementos-spark-btn"
              onClick={() => {
                setShowAnalisisModal(true);
                ejecutarAnalisisSpark();
              }}
              title="Analizar suplementos con Apache Spark"
            >
              <span className="suplementos-spark-icon"></span>
              Análisis con Spark
            </button>
            
            <button 
              className="suplementos-add-btn"
              onClick={handleAddSuplemento}
              title="Agregar nuevo suplemento"
            >
              <span className="suplementos-btn-icon">+</span>
              Agregar Suplemento
            </button>
          </div>
        </div>

        {/* Buscador y Filtros */}
        <div className="suplementos-search-section">
          <div className="suplementos-filters-row">
            <div className="suplementos-search-container suplementos-main-search">
              <input
                type="text"
                placeholder="Buscar por nombre, descripción, beneficios, modo de uso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="suplementos-search-input"
              />
            </div>

            <div className="suplementos-filter-group">
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="suplementos-filter-select"
              >
                <option value="">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </select>
            </div>

            {/* FILTRO DE CATEGORÍA */}
            <div className="suplementos-filter-group">
              <select 
                value={categoriaFilter} 
                onChange={(e) => setCategoriaFilter(e.target.value)}
                className="suplementos-filter-select"
              >
                <option value="">Todas las categorías</option>
                <option value="quemadores">Quemadores</option>
                <option value="proteinas">Proteínas</option>
                <option value="fibras">Fibras</option>
                <option value="detox">Detox</option>
                <option value="termogenicos">Termogénicos</option>
                <option value="control_apetito">Control Apetito</option>
                <option value="energeticos">Energéticos</option>
                <option value="vitaminas">Vitaminas</option>
              </select>
            </div>

            {/* FILTRO DE PRESENTACIÓN */}
            <div className="suplementos-filter-group">
              <select 
                value={presentacionFilter} 
                onChange={(e) => setPresentacionFilter(e.target.value)}
                className="suplementos-filter-select"
              >
                <option value="">Todas las presentaciones</option>
                <option value="polvo">Polvo</option>
                <option value="capsulas">Cápsulas</option>
                <option value="tabletas">Tabletas</option>
                <option value="liquido">Líquido</option>
                <option value="gomitas">Gomitas</option>
                <option value="barritas">Barritas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla de suplementos */}
        <div className="suplementos-table-container">
          <table className="suplementos-table">
            <thead>
              <tr>
                <th className="suplementos-th">ID</th>
                <th className="suplementos-th">Nombre</th>
                <th className="suplementos-th">Categoría</th>
                <th className="suplementos-th">Presentación</th>
                <th className="suplementos-th">Descripción</th>
                <th className="suplementos-th">Beneficios</th>
                <th className="suplementos-th">Precio</th>
                <th className="suplementos-th">Stock</th>
                <th className="suplementos-th">Estado</th>
                <th className="suplementos-th suplementos-actions-header">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentSuplementos.length > 0 ? (
                currentSuplementos.map(suplemento => (
                  <tr key={suplemento.id} className="suplementos-row">
                    <td className="suplementos-td suplementos-id">{suplemento.simpleId}</td>
                    <td className="suplementos-td suplementos-name">{suplemento.nombre || 'N/A'}</td>
                    
                    {/* CELDA DE CATEGORÍA */}
                    <td className="suplementos-td suplementos-categoria">
                      <span 
                        className="suplementos-categoria-badge"
                        style={{ 
                          backgroundColor: getCategoriaColor(suplemento.categoria),
                          padding: '4px 8px',
                          borderRadius: '12px',
                          display: 'inline-block'
                        }}
                      >
                        {categoriaNombres[suplemento.categoria] || suplemento.categoria}
                      </span>
                    </td>

                    {/* CELDA DE PRESENTACIÓN */}
                    <td className="suplementos-td suplementos-presentacion">
                      <span 
                        className="suplementos-presentacion-badge"
                        style={{ 
                          backgroundColor: getPresentacionColor(suplemento.presentacion),
                          padding: '4px 8px',
                          borderRadius: '12px',
                          display: 'inline-block'
                        }}
                      >
                        {presentacionNombres[suplemento.presentacion] || suplemento.presentacion}
                      </span>
                    </td>

                    {/* CELDA DE DESCRIPCIÓN */}
                    <td className="suplementos-td suplementos-descripcion">
                      {suplemento.descripcion ? (
                        <span title={suplemento.descripcion}>
                          {suplemento.descripcion.length > 40 
                            ? `${suplemento.descripcion.substring(0, 40)}...` 
                            : suplemento.descripcion
                          }
                        </span>
                      ) : 'N/A'}
                    </td>

                    {/* CELDA DE BENEFICIOS */}
                    <td className="suplementos-td suplementos-beneficios">
                      {suplemento.beneficios ? (
                        <span title={suplemento.beneficios}>
                          {suplemento.beneficios.length > 40 
                            ? `${suplemento.beneficios.substring(0, 40)}...` 
                            : suplemento.beneficios
                          }
                        </span>
                      ) : 'N/A'}
                    </td>

                    <td className="suplementos-td suplementos-price">{formatPrice(suplemento.precio)}</td>
                    
                    <td className="suplementos-td suplementos-stock">
                      <span className={`suplementos-stock-badge ${suplemento.stock > 10 ? 'stock-alto' : suplemento.stock > 0 ? 'stock-medio' : 'stock-bajo'}`}>
                        {suplemento.stock || 0}
                      </span>
                    </td>
                    
                    <td className="suplementos-td suplementos-status">
                      {getStatusBadge(suplemento.activo)}
                    </td>
                    
                    <td className="suplementos-td suplementos-actions-cell">
                      <div className="suplementos-actions-buttons">
                        <button 
                          onClick={() => handleEdit(suplemento)}
                          className="suplementos-action-btn suplementos-edit-btn"
                          title="Editar suplemento"
                        >
                          <img src={editIcon} alt="Editar" className="suplementos-action-icon" />
                        </button>
                        <button 
                          onClick={() => openStatusModal(suplemento)}
                          className="suplementos-action-btn suplementos-status-btn"
                          title={suplemento.activo ? "Desactivar suplemento" : "Activar suplemento"}
                        >
                          <img 
                            src={suplemento.activo ? deactivateIcon : activateIcon} 
                            alt={suplemento.activo ? "Desactivar" : "Activar"} 
                            className="suplementos-action-icon" 
                          />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(suplemento)}
                          className="suplementos-action-btn suplementos-delete-btn"
                          title="Eliminar suplemento"
                        >
                          <img src={deleteIcon} alt="Eliminar" className="suplementos-action-icon" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="suplementos-no-results">
                    {searchTerm || statusFilter || categoriaFilter || presentacionFilter ? 
                      'No se encontraron suplementos con esos criterios' : 
                      'No hay suplementos registrados'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Paginación */}
          {filteredSuplementos.length > suplementosPerPage && (
            <div className="suplementos-pagination-container">
              <div className="suplementos-pagination-controls">
                <button 
                  onClick={() => paginate(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="suplementos-pagination-btn suplementos-prev-btn"
                >
                  Anterior
                </button>
                
                <div className="suplementos-pagination-numbers">
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
                          {showEllipsis && <span className="suplementos-pagination-ellipsis">...</span>}
                          <button
                            onClick={() => paginate(number)}
                            className={`suplementos-pagination-btn ${currentPage === number ? 'active' : ''}`}
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
                  className="suplementos-pagination-btn suplementos-next-btn"
                >
                  Siguiente
                </button>
              </div>

              <div className="suplementos-count-info">
                Mostrando {currentSuplementos.length} de {filteredSuplementos.length} suplementos
              </div>
            </div>
          )}

          {filteredSuplementos.length <= suplementosPerPage && filteredSuplementos.length > 0 && (
            <div className="suplementos-count-info">
              Mostrando {currentSuplementos.length} de {filteredSuplementos.length} suplementos
            </div>
          )}
        </div>

        {/* Modal de Análisis con Spark */}
        {showAnalisisModal && (
          <div className="suplementos-modal-overlay">
            <div className="suplementos-modal-content suplementos-analisis-modal">
              <div className="suplementos-modal-header">
                <h3 className="suplementos-modal-title">
                  <span className="suplementos-spark-title-icon"></span>
                  Análisis con Apache Spark
                </h3>
                <button 
                  className="suplementos-close-modal" 
                  onClick={() => setShowAnalisisModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className="suplementos-modal-body">
                {analisisLoading ? (
                  <div className="suplementos-analisis-loading">
                    <div className="suplementos-analisis-spinner"></div>
                    <p>Ejecutando análisis con Spark...</p>
                    <p className="suplementos-analisis-subtext">Procesando datos de suplementos</p>
                  </div>
                ) : analisisError ? (
                  <div className="suplementos-analisis-error">
                    <div className="suplementos-analisis-error-icon">⚠️</div>
                    <p className="suplementos-analisis-error-message">{analisisError}</p>
                  </div>
                ) : analisisResultados && (
                  <div className="suplementos-analisis-resultados">
                    <div className="suplementos-analisis-stats">
                      <div className="suplementos-analisis-stat-card">
                        <div className="suplementos-analisis-stat-label">Total Suplementos</div>
                        <div className="suplementos-analisis-stat-value">{analisisResultados.total_suplementos || 0}</div>
                      </div>
                      <div className="suplementos-analisis-stat-card">
                        <div className="suplementos-analisis-stat-label">Precio Promedio</div>
                        <div className="suplementos-analisis-stat-value">
                          {formatPrice(analisisResultados.precio_promedio || 0)}
                        </div>
                      </div>
                      <div className="suplementos-analisis-stat-card">
                        <div className="suplementos-analisis-stat-label">Precio Mínimo</div>
                        <div className="suplementos-analisis-stat-value">
                          {formatPrice(analisisResultados.precio_minimo || 0)}
                        </div>
                      </div>
                      <div className="suplementos-analisis-stat-card">
                        <div className="suplementos-analisis-stat-label">Precio Máximo</div>
                        <div className="suplementos-analisis-stat-value">
                          {formatPrice(analisisResultados.precio_maximo || 0)}
                        </div>
                      </div>
                    </div>

                    {analisisResultados.distribucion_categorias && (
                      <div className="suplementos-analisis-categorias">
                        <h4>Distribución por Categorías</h4>
                        <div className="suplementos-analisis-categoria-grid">
                          {Object.entries(analisisResultados.distribucion_categorias).map(([categoria, cantidad]) => (
                            <div key={categoria} className="suplementos-analisis-categoria-item">
                              <span className="suplementos-analisis-categoria-nombre">
                                {categoriaNombres[categoria] || categoria}
                              </span>
                              <span className="suplementos-analisis-categoria-cantidad">{cantidad}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {analisisResultados.distribucion_presentaciones && (
                      <div className="suplementos-analisis-presentaciones">
                        <h4>Distribución por Presentaciones</h4>
                        <div className="suplementos-analisis-presentacion-grid">
                          {Object.entries(analisisResultados.distribucion_presentaciones).map(([presentacion, cantidad]) => (
                            <div key={presentacion} className="suplementos-analisis-presentacion-item">
                              <span className="suplementos-analisis-presentacion-nombre">
                                {presentacionNombres[presentacion] || presentacion}
                              </span>
                              <span className="suplementos-analisis-presentacion-cantidad">{cantidad}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {analisisResultados.suplementos_destacados && (
                      <div className="suplementos-analisis-destacados">
                        <h4>Suplementos Destacados</h4>
                        <ul className="suplementos-analisis-destacados-lista">
                          {analisisResultados.suplementos_destacados.map((suplemento, index) => (
                            <li key={index} className="suplementos-analisis-destacado-item">
                              <strong>{suplemento.nombre}</strong> - {formatPrice(suplemento.precio)}
                              <span className="suplementos-analisis-destacado-categoria">
                                ({categoriaNombres[suplemento.categoria] || suplemento.categoria})
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analisisResultados.stock_total !== undefined && (
                      <div className="suplementos-analisis-stock">
                        <h4>Información de Stock</h4>
                        <div className="suplementos-analisis-stock-grid">
                          <div className="suplementos-analisis-stock-item">
                            <span className="suplementos-analisis-stock-label">Stock Total:</span>
                            <span className="suplementos-analisis-stock-value">{analisisResultados.stock_total}</span>
                          </div>
                          <div className="suplementos-analisis-stock-item">
                            <span className="suplementos-analisis-stock-label">Stock Promedio:</span>
                            <span className="suplementos-analisis-stock-value">{analisisResultados.stock_promedio}</span>
                          </div>
                          <div className="suplementos-analisis-stock-item">
                            <span className="suplementos-analisis-stock-label">Productos con Stock Bajo (&lt;10):</span>
                            <span className="suplementos-analisis-stock-value">{analisisResultados.suplementos_bajo_stock || 0}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="suplementos-modal-footer">
                <button 
                  className="suplementos-btn-cancel"
                  onClick={() => setShowAnalisisModal(false)}
                >
                  Cerrar
                </button>
                {!analisisLoading && !analisisError && analisisResultados && (
                  <button 
                    className="suplementos-btn-reload-analisis"
                    onClick={ejecutarAnalisisSpark}
                  >
                    <span className="suplementos-reload-icon">↻</span>
                    Actualizar Análisis
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación para eliminar */}
        {showDeleteModal && suplementoToAction && (
          <div className="suplementos-modal-overlay">
            <div className="suplementos-modal-content suplementos-delete-modal">
              <div className="suplementos-modal-header">
                <h3 className="suplementos-modal-title">Confirmar Eliminación</h3>
                <button className="suplementos-close-modal" onClick={closeActionModals} disabled={actionLoading}>✕</button>
              </div>
              <div className="suplementos-modal-body">
                {actionError ? (
                  <div className="suplementos-delete-error">
                    <div className="suplementos-delete-error-icon">❌</div>
                    <p className="suplementos-delete-error-message">{actionError}</p>
                  </div>
                ) : actionSuccess ? (
                  <div className="suplementos-delete-success">
                    <div className="suplementos-delete-success-icon">✅</div>
                    <p className="suplementos-delete-success-message">Suplemento eliminado exitosamente</p>
                  </div>
                ) : actionLoading ? (
                  <div className="suplementos-delete-loading">
                    <div className="suplementos-delete-spinner"></div>
                    <p className="suplementos-delete-loading-text">Eliminando suplemento...</p>
                  </div>
                ) : (
                  <>
                    <div className="suplementos-delete-icon">⚠️</div>
                    <p className="suplementos-delete-question">
                      ¿Estás seguro de que quieres eliminar este suplemento?
                    </p>
                    <div className="suplementos-delete-info">
                      <p><strong>Nombre:</strong> {suplementoToAction.nombre}</p>
                      <p><strong>Descripción:</strong> {suplementoToAction.descripcion || 'Sin descripción'}</p>
                      <p><strong>Categoría:</strong> {categoriaNombres[suplementoToAction.categoria] || suplementoToAction.categoria}</p>
                      <p><strong>Presentación:</strong> {presentacionNombres[suplementoToAction.presentacion] || suplementoToAction.presentacion}</p>
                      <p><strong>Beneficios:</strong> {suplementoToAction.beneficios || 'Sin beneficios'}</p>
                      <p><strong>Modo de Uso:</strong> {suplementoToAction.modo_uso || 'Sin especificar'}</p>
                      <p><strong>Precio:</strong> {formatPrice(suplementoToAction.precio)}</p>
                      <p><strong>Stock:</strong> {suplementoToAction.stock || 0}</p>
                      <p><strong>Estado:</strong> {suplementoToAction.activo ? 'Activo' : 'Inactivo'}</p>
                    </div>
                    <p className="suplementos-delete-warning">
                      Esta acción no se puede deshacer. El suplemento será eliminado permanentemente.
                    </p>
                  </>
                )}
              </div>
              <div className="suplementos-modal-footer">
                {!actionLoading && !actionSuccess && !actionError && (
                  <>
                    <button 
                      className="suplementos-btn-cancel"
                      onClick={closeActionModals}
                    >
                      Cancelar
                    </button>
                    <button 
                      className="suplementos-btn-delete"
                      onClick={confirmDelete}
                    >
                      Eliminar
                    </button>
                  </>
                )}
                {(actionLoading || actionSuccess || actionError) && (
                  <button 
                    className="suplementos-btn-cancel"
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
        {showStatusModal && suplementoToAction && (
          <div className="suplementos-modal-overlay">
            <div className="suplementos-modal-content suplementos-status-modal">
              <div className="suplementos-modal-header">
                <h3 className="suplementos-modal-title">Confirmar Cambio de Estado</h3>
                <button className="suplementos-close-modal" onClick={closeActionModals} disabled={actionLoading}>✕</button>
              </div>
              <div className="suplementos-modal-body">
                {actionError ? (
                  <div className="suplementos-status-error">
                    <div className="suplementos-status-error-icon">❌</div>
                    <p className="suplementos-status-error-message">{actionError}</p>
                  </div>
                ) : actionSuccess ? (
                  <div className="suplementos-status-success">
                    <div className="suplementos-status-success-icon">✅</div>
                    <p className="suplementos-status-success-message">
                      Suplemento {suplementoToAction.activo ? 'desactivado' : 'activado'} exitosamente
                    </p>
                  </div>
                ) : actionLoading ? (
                  <div className="suplementos-status-loading">
                    <div className="suplementos-status-spinner"></div>
                    <p className="suplementos-status-loading-text">
                      {suplementoToAction.activo ? 'Desactivando' : 'Activando'} suplemento...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="suplementos-status-icon">
                      {suplementoToAction.activo ? '🔴' : '🟢'}
                    </div>
                    <p className="suplementos-status-question">
                      ¿Estás seguro de que quieres <strong>{suplementoToAction.activo ? 'desactivar' : 'activar'}</strong> este suplemento?
                    </p>
                    <div className="suplementos-status-info">
                      <p><strong>Nombre:</strong> {suplementoToAction.nombre}</p>
                      <p><strong>Descripción:</strong> {suplementoToAction.descripcion || 'Sin descripción'}</p>
                      <p><strong>Categoría:</strong> {categoriaNombres[suplementoToAction.categoria] || suplementoToAction.categoria}</p>
                      <p><strong>Presentación:</strong> {presentacionNombres[suplementoToAction.presentacion] || suplementoToAction.presentacion}</p>
                      <p><strong>Precio:</strong> {formatPrice(suplementoToAction.precio)}</p>
                      <p><strong>Stock:</strong> {suplementoToAction.stock || 0}</p>
                      <p><strong>Estado actual:</strong> {suplementoToAction.activo ? 'Activo' : 'Inactivo'}</p>
                      <p><strong>Estado nuevo:</strong> {suplementoToAction.activo ? 'Inactivo' : 'Activo'}</p>
                    </div>
                  </>
                )}
              </div>
              <div className="suplementos-modal-footer">
                {!actionLoading && !actionSuccess && !actionError && (
                  <>
                    <button 
                      className="suplementos-btn-cancel"
                      onClick={closeActionModals}
                    >
                      Cancelar
                    </button>
                    <button 
                      className="suplementos-btn-status"
                      onClick={confirmToggleStatus}
                    >
                      {suplementoToAction.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </>
                )}
                {(actionLoading || actionSuccess || actionError) && (
                  <button 
                    className="suplementos-btn-cancel"
                    onClick={closeActionModals}
                  >
                    Cerrar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal para crear suplemento */}
        {showCreateModal && (
          <div className="suplementos-modal-overlay">
            <div className="suplementos-modal-content create-suplemento-modal">
              <div className="suplementos-modal-header">
                <h3 className="suplementos-modal-title">Agregar Nuevo Suplemento</h3>
                <button className="suplementos-close-modal" onClick={closeCreateModal}>✕</button>
              </div>
              <div className="suplementos-modal-body">
                <CreateSuplementoForm 
                  onClose={closeCreateModal}
                  onSuplementoCreated={() => {
                    fetchSuplementos();
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal para editar suplemento */}
        {showEditModal && selectedSuplemento && (
          <div className="suplementos-modal-overlay">
            <div className="suplementos-modal-content">
              <div className="suplementos-modal-header">
                <h3 className="suplementos-modal-title">Editar Suplemento</h3>
                <button className="suplementos-close-modal" onClick={closeEditModal}>✕</button>
              </div>
              <div className="suplementos-modal-body">
                <EditSuplementoForm 
                  suplemento={selectedSuplemento}
                  onClose={closeEditModal}
                  onSuplementoUpdated={() => {
                    fetchSuplementos();
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

export default Suplementos;