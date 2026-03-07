import React, { useEffect, useState } from 'react';
import CreateIngredienteForm from './create-ingredientes';
import EditIngredienteForm from './edit-ingredientes';
import { useConfig } from '../../context/config';
import '../../css/Ingredientes/ingredientes.css';

import editIcon from '../../img/edit.png';
import deleteIcon from '../../img/delete.png';
import activateIcon from '../../img/activate.png';
import deactivateIcon from '../../img/deactivate.png';

const Ingredientes = () => {
  const { darkMode } = useConfig();
  const [ingredientes, setIngredientes] = useState([]);
  const [filteredIngredientes, setFilteredIngredientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedIngrediente, setSelectedIngrediente] = useState(null);
  
  // Estados para modales de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [ingredienteToAction, setIngredienteToAction] = useState(null);
  const [actionType, setActionType] = useState(''); // 'delete' o 'toggle'
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState(false);
  
  const ingredientesPerPage = 10;
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    fetchIngredientes();
    fetchCategorias();
  }, []);

  const fetchIngredientes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://127.0.0.1:5000/ingredientes/?activos=false', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        console.log('✅ Datos recibidos del backend (todos los ingredientes):', data.length);
        
        const ingredientesWithSimpleIds = data.map((ingrediente, index) => ({
          ...ingrediente,
          simpleId: index + 1
        }));
        
        setIngredientes(ingredientesWithSimpleIds);
        setFilteredIngredientes(ingredientesWithSimpleIds);
      } else {
        console.error('❌ Error al obtener ingredientes:', response.status);
        const errorText = await response.text();
        console.error('❌ Detalles del error:', errorText);
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://127.0.0.1:5000/ingredientes/categorias', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategorias(['todas', ...data.categorias]);
      }
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      setCategorias(['todas']);
    }
  };

  useEffect(() => {
    let filtered = ingredientes;

    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(ingrediente => 
        ingrediente.simpleId.toString().includes(searchTerm) || 
        ingrediente.id.toString().includes(searchTerm) ||
        ingrediente.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ingrediente.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== '') {
      filtered = filtered.filter(ingrediente => 
        statusFilter === 'activo' ? ingrediente.activo : !ingrediente.activo
      );
    }

    if (categoriaFilter !== '' && categoriaFilter !== 'todas') {
      filtered = filtered.filter(ingrediente => 
        ingrediente.categoria === categoriaFilter
      );
    }
    
    setFilteredIngredientes(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoriaFilter, ingredientes]);

  const indexOfLastIngrediente = currentPage * ingredientesPerPage;
  const indexOfFirstIngrediente = indexOfLastIngrediente - ingredientesPerPage;
  const currentIngredientes = filteredIngredientes.slice(indexOfFirstIngrediente, indexOfLastIngrediente);
  const totalPages = Math.ceil(filteredIngredientes.length / ingredientesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Funciones para manejar modales
  const openDeleteModal = (ingrediente) => {
    setIngredienteToAction(ingrediente);
    setActionType('delete');
    setActionError('');
    setActionSuccess(false);
    setShowDeleteModal(true);
  };

  const openStatusModal = (ingrediente) => {
    setIngredienteToAction(ingrediente);
    setActionType('toggle');
    setActionError('');
    setActionSuccess(false);
    setShowStatusModal(true);
  };

  const closeActionModals = () => {
    setShowDeleteModal(false);
    setShowStatusModal(false);
    setIngredienteToAction(null);
    setActionLoading(false);
    setActionError('');
    setActionSuccess(false);
  };

  // Función para confirmar eliminación
  const confirmDelete = async () => {
    if (!ingredienteToAction) return;

    setActionLoading(true);
    setActionError('');

    try {
      const token = localStorage.getItem('token');
      
      console.log('🗑️ Eliminando ingrediente:', {
        id: ingredienteToAction.id,
        nombre: ingredienteToAction.nombre
      });
      
      if (!token) {
        setActionError('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
        setActionLoading(false);
        return;
      }

      const response = await fetch(`http://127.0.0.1:5000/ingredientes/${ingredienteToAction.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('✅ Ingrediente eliminado exitosamente');
        setActionSuccess(true);
        
        // Actualizar la lista local después de 1 segundo
        setTimeout(() => {
          const updatedIngredientes = ingredientes.filter(i => i.id !== ingredienteToAction.id);
          const ingredientesWithSimpleIds = updatedIngredientes.map((i, index) => ({
            ...i,
            simpleId: index + 1
          }));
          
          setIngredientes(ingredientesWithSimpleIds);
          setFilteredIngredientes(ingredientesWithSimpleIds);
          
          if (currentIngredientes.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          }
          
          closeActionModals();
        }, 1500);
      } else {
        const errorText = await response.text();
        console.error('❌ Error del servidor:', response.status, errorText);
        
        let errorMsg = `Error ${response.status}`;
        try {
          if (errorText.trim()) {
            const errorData = JSON.parse(errorText);
            errorMsg = errorData.msg || errorData.message || errorData.error || errorMsg;
          }
        } catch (e) {
          errorMsg = errorText || errorMsg;
        }
        
        setActionError(errorMsg);
        setActionLoading(false);
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      setActionError('Error de conexión al eliminar ingrediente. Verifica tu conexión a internet.');
      setActionLoading(false);
    }
  };

  // Función para confirmar cambio de estado
  const confirmToggleStatus = async () => {
    if (!ingredienteToAction) return;

    const newStatus = !ingredienteToAction.activo;
    const action = newStatus ? 'activar' : 'desactivar';

    setActionLoading(true);
    setActionError('');

    try {
      const token = localStorage.getItem('token');
      
      console.log(`🔄 ${action.toUpperCase()} ingrediente:`, {
        id: ingredienteToAction.id,
        nombre: ingredienteToAction.nombre,
        estadoActual: ingredienteToAction.activo,
        nuevoEstado: newStatus
      });

      const response = await fetch(`http://127.0.0.1:5000/ingredientes/${ingredienteToAction.id}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log(`✅ Estado del ingrediente actualizado exitosamente`);
        setActionSuccess(true);
        
        // Actualizar la lista local después de 1 segundo
        setTimeout(() => {
          const updatedIngredientes = ingredientes.map(ingrediente => 
            ingrediente.id === ingredienteToAction.id 
              ? { ...ingrediente, activo: newStatus }
              : ingrediente
          );
          
          setIngredientes(updatedIngredientes);
          setFilteredIngredientes(updatedIngredientes);
          
          closeActionModals();
        }, 1500);
      } else {
        const errorText = await response.text();
        console.error('❌ Error toggle:', response.status, errorText);
        
        let errorMsg = `Error ${response.status}`;
        try {
          if (errorText.trim()) {
            const errorData = JSON.parse(errorText);
            errorMsg = errorData.msg || errorData.message || errorData.error || errorMsg;
          }
        } catch (e) {
          errorMsg = errorText || errorMsg;
        }
        
        setActionError(errorMsg);
        setActionLoading(false);
      }
    } catch (error) {
      console.error(`❌ Error de conexión al cambiar estado:`, error);
      setActionError('Error de conexión al cambiar estado del ingrediente. Verifica tu conexión a internet.');
      setActionLoading(false);
    }
  };

  const handleEdit = (ingrediente) => {
    console.log('✏️ Editando ingrediente:', ingrediente);
    setSelectedIngrediente(ingrediente);
    setShowEditModal(true);
  };

  const handleAddIngrediente = () => {
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedIngrediente(null);
  };

  const getStatusBadge = (activo) => {
    return activo ? (
      <span className="ingredientes-status-badge active">
        <span className="ingredientes-status-dot active-dot"></span>
        Activo
      </span>
    ) : (
      <span className="ingredientes-status-badge inactive">
        <span className="ingredientes-status-dot inactive-dot"></span>
        Inactivo
      </span>
    );
  };

  const getCategoriaBadge = (categoria) => {
    if (!categoria) return <span className="ingredientes-categoria-badge sin-categoria">Sin categoría</span>;
    
    const colores = {
      'vegetales': 'success',
      'proteínas': 'danger',
      'lacteos': 'info',
      'condimentos': 'warning',
      'aderezos': 'primary',
      'toppings': 'secondary',
      'gomitas': 'purple',
      'frutas': 'fruit',
      'cereales': 'cereal'
    };
    
    return (
      <span className={`ingredientes-categoria-badge ${colores[categoria] || 'default'}`}>
        {categoria}
      </span>
    );
  };

  if (loading && ingredientes.length === 0) {
    return (
      <div className={`ingredientes-container ${darkMode ? 'dark-mode' : ''}`}>
        <div className="ingredientes-loading-spinner"></div>
        <p className="ingredientes-loading-text">Cargando ingredientes...</p>
      </div>
    );
  }

  return (
    <div className={`ingredientes-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="ingredientes-content">
        
        <div className="ingredientes-section-header">
          <h3 className="ingredientes-section-title">Gestión de Ingredientes</h3>
          <button 
            className="ingredientes-add-btn"
            onClick={handleAddIngrediente}
            title="Agregar nuevo ingrediente"
          >
            <span className="ingredientes-btn-icon">+</span>
            Agregar Ingrediente
          </button>
        </div>

        <div className="ingredientes-search-section">
          <div className="ingredientes-filters-row">
            <div className="ingredientes-search-container ingredientes-main-search">
              <input
                type="text"
                placeholder="Buscar por ID, nombre o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ingredientes-search-input"
              />
              {searchTerm && (
                <button 
                  className="ingredientes-clear-search"
                  onClick={() => setSearchTerm('')}
                  title="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="ingredientes-filter-group">
              <select 
                value={categoriaFilter} 
                onChange={(e) => setCategoriaFilter(e.target.value)}
                className="ingredientes-filter-select"
              >
                <option value="">Todas las categorías</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'todas' ? 'Todas las categorías' : cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="ingredientes-filter-group">
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="ingredientes-filter-select"
              >
                <option value="">Todos los estados</option>
                <option value="activo">Solo activos</option>
                <option value="inactivo">Solo inactivos</option>
              </select>
            </div>
          </div>
        </div>

        <div className="ingredientes-table-container">
          <table className="ingredientes-table">
            <thead>
              <tr>
                <th className="ingredientes-th">ID</th>
                <th className="ingredientes-th">Nombre</th>
                <th className="ingredientes-th">Categoría</th>
                <th className="ingredientes-th">Estado</th>
                <th className="ingredientes-th ingredientes-actions-header">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentIngredientes.length > 0 ? (
                currentIngredientes.map(ingrediente => (
                  <tr key={ingrediente.id} className="ingredientes-row">
                    <td className="ingredientes-td ingredientes-id">{ingrediente.simpleId}</td>
                    <td className="ingredientes-td ingredientes-name">
                      <strong>{ingrediente.nombre || 'N/A'}</strong>
                    </td>
                    <td className="ingredientes-td ingredientes-categoria">
                      {getCategoriaBadge(ingrediente.categoria)}
                    </td>
                    <td className="ingredientes-td ingredientes-status">
                      {getStatusBadge(ingrediente.activo)}
                    </td>
                    <td className="ingredientes-td ingredientes-actions-cell">
                      <div className="ingredientes-actions-buttons">
                        <button 
                          onClick={() => handleEdit(ingrediente)}
                          className="ingredientes-action-btn ingredientes-edit-btn"
                          title="Editar ingrediente"
                        >
                          <img src={editIcon} alt="Editar" className="ingredientes-action-icon" />
                        </button>
                        <button 
                          onClick={() => openStatusModal(ingrediente)}
                          className="ingredientes-action-btn ingredientes-status-btn"
                          title={ingrediente.activo ? "Desactivar ingrediente" : "Activar ingrediente"}
                        >
                          <img 
                            src={ingrediente.activo ? deactivateIcon : activateIcon} 
                            alt={ingrediente.activo ? "Desactivar" : "Activar"} 
                            className="ingredientes-action-icon" 
                          />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(ingrediente)}
                          className="ingredientes-action-btn ingredientes-delete-btn"
                          title="Eliminar ingrediente permanentemente"
                        >
                          <img src={deleteIcon} alt="Eliminar" className="ingredientes-action-icon" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="ingredientes-no-results">
                    {searchTerm || statusFilter || categoriaFilter ? 
                      'No se encontraron ingredientes con esos criterios' : 
                      'No hay ingredientes registrados'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {filteredIngredientes.length > ingredientesPerPage && (
            <div className="ingredientes-pagination-container">
              <div className="ingredientes-pagination-controls">
                <button 
                  onClick={() => paginate(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="ingredientes-pagination-btn ingredientes-prev-btn"
                >
                  Anterior
                </button>
                
                <div className="ingredientes-pagination-numbers">
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
                          {showEllipsis && <span className="ingredientes-pagination-ellipsis">...</span>}
                          <button
                            onClick={() => paginate(number)}
                            className={`ingredientes-pagination-btn ${currentPage === number ? 'active' : ''}`}
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
                  className="ingredientes-pagination-btn ingredientes-next-btn"
                >
                  Siguiente
                </button>
              </div>

              <div className="ingredientes-count-info">
                Mostrando {currentIngredientes.length} de {filteredIngredientes.length} ingredientes
              </div>
            </div>
          )}

          {filteredIngredientes.length <= ingredientesPerPage && filteredIngredientes.length > 0 && (
            <div className="ingredientes-count-info">
              Mostrando {currentIngredientes.length} de {filteredIngredientes.length} ingredientes
            </div>
          )}
        </div>

        {/* Modal de confirmación para eliminar */}
        {showDeleteModal && ingredienteToAction && (
          <div className="ingredientes-modal-overlay">
            <div className="ingredientes-modal-content ingredientes-delete-modal">
              <div className="ingredientes-modal-header">
                <h3 className="ingredientes-modal-title">Confirmar Eliminación</h3>
                <button className="ingredientes-close-modal" onClick={closeActionModals} disabled={actionLoading}>✕</button>
              </div>
              <div className="ingredientes-modal-body">
                {actionError ? (
                  <div className="ingredientes-delete-error">
                    <div className="ingredientes-delete-error-icon">❌</div>
                    <p className="ingredientes-delete-error-message">{actionError}</p>
                  </div>
                ) : actionSuccess ? (
                  <div className="ingredientes-delete-success">
                    <div className="ingredientes-delete-success-icon">✅</div>
                    <p className="ingredientes-delete-success-message">Ingrediente eliminado exitosamente</p>
                  </div>
                ) : actionLoading ? (
                  <div className="ingredientes-delete-loading">
                    <div className="ingredientes-delete-spinner"></div>
                    <p className="ingredientes-delete-loading-text">Eliminando ingrediente...</p>
                  </div>
                ) : (
                  <>
                    <div className="ingredientes-delete-icon">⚠️</div>
                    <p className="ingredientes-delete-question">
                      ¿Estás seguro de que quieres eliminar este ingrediente?
                    </p>
                    <div className="ingredientes-delete-info">
                      <p><strong>Nombre:</strong> {ingredienteToAction.nombre}</p>
                      <p><strong>Categoría:</strong> {ingredienteToAction.categoria || 'Sin categoría'}</p>
                      <p><strong>Estado actual:</strong> {ingredienteToAction.activo ? 'Activo' : 'Inactivo'}</p>
                    </div>
                    <p className="ingredientes-delete-warning">
                      Esta acción no se puede deshacer. El ingrediente será eliminado permanentemente.
                    </p>
                  </>
                )}
              </div>
              <div className="ingredientes-modal-footer">
                {!actionLoading && !actionSuccess && !actionError && (
                  <>
                    <button 
                      className="ingredientes-btn-cancel"
                      onClick={closeActionModals}
                    >
                      Cancelar
                    </button>
                    <button 
                      className="ingredientes-btn-delete"
                      onClick={confirmDelete}
                    >
                      Eliminar
                    </button>
                  </>
                )}
                {(actionLoading || actionSuccess || actionError) && (
                  <button 
                    className="ingredientes-btn-cancel"
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
        {showStatusModal && ingredienteToAction && (
          <div className="ingredientes-modal-overlay">
            <div className="ingredientes-modal-content ingredientes-status-modal">
              <div className="ingredientes-modal-header">
                <h3 className="ingredientes-modal-title">Confirmar Cambio de Estado</h3>
                <button className="ingredientes-close-modal" onClick={closeActionModals} disabled={actionLoading}>✕</button>
              </div>
              <div className="ingredientes-modal-body">
                {actionError ? (
                  <div className="ingredientes-status-error">
                    <div className="ingredientes-status-error-icon">❌</div>
                    <p className="ingredientes-status-error-message">{actionError}</p>
                  </div>
                ) : actionSuccess ? (
                  <div className="ingredientes-status-success">
                    <div className="ingredientes-status-success-icon">✅</div>
                    <p className="ingredientes-status-success-message">
                      Ingrediente {ingredienteToAction.activo ? 'desactivado' : 'activado'} exitosamente
                    </p>
                  </div>
                ) : actionLoading ? (
                  <div className="ingredientes-status-loading">
                    <div className="ingredientes-status-spinner"></div>
                    <p className="ingredientes-status-loading-text">
                      {ingredienteToAction.activo ? 'Desactivando' : 'Activando'} ingrediente...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="ingredientes-status-icon">
                      {ingredienteToAction.activo ? '🔴' : '🟢'}
                    </div>
                    <p className="ingredientes-status-question">
                      ¿Estás seguro de que quieres <strong>{ingredienteToAction.activo ? 'desactivar' : 'activar'}</strong> este ingrediente?
                    </p>
                    <div className="ingredientes-status-info">
                      <p><strong>Nombre:</strong> {ingredienteToAction.nombre}</p>
                      <p><strong>Categoría:</strong> {ingredienteToAction.categoria || 'Sin categoría'}</p>
                      <p><strong>Estado actual:</strong> {ingredienteToAction.activo ? 'Activo' : 'Inactivo'}</p>
                      <p><strong>Estado nuevo:</strong> {ingredienteToAction.activo ? 'Inactivo' : 'Activo'}</p>
                    </div>
                  </>
                )}
              </div>
              <div className="ingredientes-modal-footer">
                {!actionLoading && !actionSuccess && !actionError && (
                  <>
                    <button 
                      className="ingredientes-btn-cancel"
                      onClick={closeActionModals}
                    >
                      Cancelar
                    </button>
                    <button 
                      className="ingredientes-btn-status"
                      onClick={confirmToggleStatus}
                    >
                      {ingredienteToAction.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </>
                )}
                {(actionLoading || actionSuccess || actionError) && (
                  <button 
                    className="ingredientes-btn-cancel"
                    onClick={closeActionModals}
                  >
                    Cerrar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal para crear ingrediente */}
        {showCreateModal && (
          <div className="ingredientes-modal-overlay">
            <div className="ingredientes-modal-content create-ingrediente-modal">
              <div className="ingredientes-modal-header">
                <h3 className="ingredientes-modal-title">Agregar Nuevo Ingrediente</h3>
                <button className="ingredientes-close-modal" onClick={closeCreateModal}>✕</button>
              </div>
              <div className="ingredientes-modal-body">
                <CreateIngredienteForm 
                  onClose={closeCreateModal}
                  onIngredienteCreated={() => {
                    fetchIngredientes();
                    fetchCategorias();
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal para editar ingrediente */}
        {showEditModal && selectedIngrediente && (
          <div className="ingredientes-modal-overlay">
            <div className="ingredientes-modal-content">
              <div className="ingredientes-modal-header">
                <h3 className="ingredientes-modal-title">Editar Ingrediente</h3>
                <button className="ingredientes-close-modal" onClick={closeEditModal}>✕</button>
              </div>
              <div className="ingredientes-modal-body">
                <EditIngredienteForm 
                  ingrediente={selectedIngrediente}
                  onClose={closeEditModal}
                  onIngredienteUpdated={() => {
                    fetchIngredientes();
                    fetchCategorias();
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

export default Ingredientes;