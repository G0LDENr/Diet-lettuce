import React, { useState, useEffect } from 'react';
import { FaSearch, FaEdit, FaTrash, FaPlus, FaMapMarkerAlt, FaCheckCircle, FaHome, FaBuilding, FaCheck, FaTimes, FaCity, FaMapPin, FaInfoCircle } from 'react-icons/fa';
import { PiWarningFill } from "react-icons/pi";
import { GoShield } from "react-icons/go";
import '../../css/Perfil/gestionar-direcciones.css';

const DireccionesList = ({ 
  isOpen, 
  onClose, 
  direcciones, 
  onDelete, 
  onSetPredeterminada, 
  onAdd, 
  onEdit, 
  onSelect,
  darkMode,
  showAddButton = true,
  showSetDefaultButton = true,
  isCheckout = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(2);
  const [filteredDirecciones, setFilteredDirecciones] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  
  // Estado para el modal de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [direccionAEliminar, setDireccionAEliminar] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (direcciones) {
      const filtered = direcciones.filter(dir => 
        dir.calle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dir.colonia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dir.ciudad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dir.estado?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDirecciones(filtered);
      setCurrentPage(1);
      
      if (isCheckout) {
        const predeterminada = direcciones.find(dir => dir.predeterminada);
        if (predeterminada) {
          setSelectedAddressId(predeterminada.id);
        } else if (direcciones.length > 0) {
          setSelectedAddressId(direcciones[0].id);
        }
      }
    }
  }, [direcciones, searchTerm, isCheckout]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDirecciones = filteredDirecciones.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDirecciones.length / itemsPerPage);
  const startItem = filteredDirecciones.length === 0 ? 0 : indexOfFirstItem + 1;
  const endItem = Math.min(indexOfLastItem, filteredDirecciones.length);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Función para abrir el modal de confirmación
  const handleDeleteClick = (direccion) => {
    setDireccionAEliminar(direccion);
    setShowConfirmModal(true);
  };

  // Función para confirmar la eliminación
  const handleConfirmDelete = () => {
    setIsDeleting(true);
    
    setTimeout(() => {
      if (direccionAEliminar) {
        onDelete(direccionAEliminar.id);
        setShowConfirmModal(false);
        setDireccionAEliminar(null);
        setIsDeleting(false);
      }
    }, 1500);
  };

  const handleSetPredeterminada = (id) => {
    onSetPredeterminada(id);
    setSuccessMessage('Dirección predeterminada actualizada');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSelectDireccion = (direccion) => {
    if (isCheckout) {
      setSelectedAddressId(direccion.id);
      if (onSelect) {
        onSelect(direccion);
      }
      setTimeout(() => {
        onClose();
      }, 300);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`dir-modal-overlay ${darkMode ? 'dark-mode' : ''}`} onClick={onClose}>
      <div className="dir-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="dir-modal-header">
          <div className="dir-modal-logo">
            <FaMapMarkerAlt />
          </div>
          <div className="dir-modal-header-info">
            <h3>Gestionar Direcciones</h3>
            <div className="dir-modal-header-subtitle">
              {isCheckout ? 'Selecciona la dirección para tu pedido' : 'Administra tus direcciones de envío'}
            </div>
          </div>
          <button className="dir-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="dir-modal-body">
          <div className="dir-search-container">
            <div className="dir-search-wrapper">
              <FaSearch className="dir-search-icon" />
              <input
                type="text"
                className="dir-search-input"
                placeholder="Buscar por calle, colonia, ciudad o estado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {showAddButton && (
            <button 
              className="dir-add-btn"
              onClick={() => {
                onAdd();
                onClose();
              }}
            >
              <FaPlus /> Agregar nueva dirección
            </button>
          )}

          <div className="dir-lista-container">
            {currentDirecciones.length === 0 ? (
              <div className="dir-empty-state">
                <p>No hay direcciones registradas</p>
              </div>
            ) : (
              <>
                {currentDirecciones.map((direccion) => {
                  const isSelected = isCheckout && selectedAddressId === direccion.id;
                  const isPredeterminada = direccion.predeterminada;
                  
                  return (
                    <div 
                      key={direccion.id} 
                      className={`dir-card ${isSelected ? 'selected' : ''} ${isPredeterminada && !isCheckout ? 'predeterminada' : ''}`}
                      onClick={() => handleSelectDireccion(direccion)}
                      style={{ cursor: isCheckout ? 'pointer' : 'default' }}
                    >
                      <div className="dir-card-header">
                        <div className="dir-card-tipo">
                          {direccion.tipo === 'casa' ? <FaHome /> : direccion.tipo === 'trabajo' ? <FaBuilding /> : <FaMapMarkerAlt />}
                          <span>{direccion.tipo === 'casa' ? 'Casa' : direccion.tipo === 'trabajo' ? 'Trabajo' : 'Otro'}</span>
                          {isPredeterminada && (
                            <span className={`dir-badge predeterminada-badge ${isSelected ? 'in-use' : ''}`}>
                              Predeterminada
                            </span>
                          )}
                          {isSelected && !isPredeterminada && isCheckout && (
                            <span className="dir-badge selected-badge">En uso</span>
                          )}
                        </div>
                        <div className="dir-card-actions" onClick={(e) => e.stopPropagation()}>
                          <button 
                            className="dir-edit-btn"
                            onClick={() => {
                              onEdit(direccion);
                              onClose();
                            }}
                            title="Editar dirección"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="dir-delete-btn"
                            onClick={() => handleDeleteClick(direccion)}
                            title="Eliminar dirección"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                      <div className="dir-card-body">
                        <p className="dir-direccion"><strong>Calle:</strong> {direccion.calle} {direccion.numero_exterior}{direccion.numero_interior && `, Int. ${direccion.numero_interior}`}</p>
                        <p className="dir-direccion"><strong>Colonia:</strong> {direccion.colonia}</p>
                        <p className="dir-direccion"><strong>Ciudad:</strong> {direccion.ciudad}, {direccion.estado}</p>
                        <p className="dir-direccion"><strong>CP:</strong> {direccion.codigo_postal}</p>
                        {direccion.referencias && <p className="dir-referencias"><strong>Referencias:</strong> {direccion.referencias}</p>}
                      </div>
                      {!isPredeterminada && showSetDefaultButton && (
                        <div className="dir-card-footer" onClick={(e) => e.stopPropagation()}>
                          <button 
                            className="dir-set-default-btn"
                            onClick={() => handleSetPredeterminada(direccion.id)}
                          >
                            <FaCheck /> Establecer como predeterminada
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {filteredDirecciones.length > 0 && (
            <div className="dir-pagination-container">
              <div className="dir-results-count">
                Mostrando {startItem} - {endItem} de {filteredDirecciones.length} direcciones
              </div>
              
              {totalPages > 1 && (
                <div className="dir-pagination">
                  <button
                    className="dir-page-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    &laquo;
                  </button>
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      className={`dir-page-btn ${currentPage === index + 1 ? 'active' : ''}`}
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    className="dir-page-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    &raquo;
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===== MODAL DE CONFIRMACIÓN DE ELIMINACIÓN ===== */}
      {showConfirmModal && direccionAEliminar && (
        <div className={`confirm-modal-overlay ${darkMode ? 'dark-mode' : ''}`} onClick={() => !isDeleting && setShowConfirmModal(false)}>
          <div className={`confirm-modal-content ${isDeleting ? 'deleting' : ''}`} onClick={(e) => e.stopPropagation()}>
            
            {isDeleting ? (
              /* ===== VERSIÓN DE CARGA ===== */
              <>
                <div className="confirm-modal-loading">
                  <div className="confirm-modal-spinner"></div>
                  <p className="confirm-modal-loading-text">Eliminando...</p>
                </div>
              </>
            ) : (
              /* ===== VERSIÓN NORMAL ===== */
              <>
                {/* Header */}
                <div className="confirm-modal-header">
                  <h3>Confirmar eliminación</h3>
                  <button className="confirm-modal-close" onClick={() => setShowConfirmModal(false)}>
                    <FaTimes />
                  </button>
                </div>

                {/* Body */}
                <div className="confirm-modal-body">
                  <div className="confirm-modal-icon-wrapper">
                    <PiWarningFill className="confirm-modal-icon" />
                  </div>

                  <p className="confirm-modal-message" style={{ marginBottom: '0' }}>
                    ¿Estás seguro de que quieres eliminar
                  </p>
                  <p className="confirm-modal-message" style={{ marginTop: '0' }}>
                    esta dirección?
                  </p><br />

                  <div className="confirm-modal-direccion-info">
                    <div className="confirm-modal-direccion-row">
                      <div className="confirm-modal-direccion-label">
                        <FaHome className="confirm-modal-direccion-icon" />
                        <span>Calle:</span>
                      </div>
                      <div className="confirm-modal-direccion-value">
                        {direccionAEliminar.calle} {direccionAEliminar.numero_exterior}
                      </div>
                    </div>
                    <div className="confirm-modal-direccion-row">
                      <div className="confirm-modal-direccion-label">
                        <FaMapMarkerAlt className="confirm-modal-direccion-icon" />
                        <span>Colonia:</span>
                      </div>
                      <div className="confirm-modal-direccion-value">
                        {direccionAEliminar.colonia}
                      </div>
                    </div>
                    <div className="confirm-modal-direccion-row">
                      <div className="confirm-modal-direccion-label">
                        <FaCity className="confirm-modal-direccion-icon" />
                        <span>Ciudad:</span>
                      </div>
                      <div className="confirm-modal-direccion-value">
                        {direccionAEliminar.ciudad}, {direccionAEliminar.estado}
                      </div>
                    </div>
                    <div className="confirm-modal-direccion-row">
                      <div className="confirm-modal-direccion-label">
                        <FaMapPin className="confirm-modal-direccion-icon" />
                        <span>CP:</span>
                      </div>
                      <div className="confirm-modal-direccion-value">
                        {direccionAEliminar.codigo_postal}
                      </div>
                    </div>
                    {direccionAEliminar.referencias && (
                      <div className="confirm-modal-direccion-row">
                        <div className="confirm-modal-direccion-label">
                          <FaInfoCircle className="confirm-modal-direccion-icon" />
                          <span>Referencias:</span>
                        </div>
                        <div className="confirm-modal-direccion-value">
                          {direccionAEliminar.referencias}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="confirm-modal-warning">
                    <GoShield className="confirm-modal-warning-icon" />
                    <div className="confirm-modal-warning-text">
                      <strong>Esta acción no se puede deshacer</strong>
                      <span>La dirección será eliminada permanentemente</span>
                    </div>
                  </div>
                </div>

                <div className="confirm-modal-footer">
                  <button className="confirm-modal-btn cancel" onClick={() => setShowConfirmModal(false)}>
                    Cancelar
                  </button>
                  <button className="confirm-modal-btn delete" onClick={handleConfirmDelete}>
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DireccionesList;