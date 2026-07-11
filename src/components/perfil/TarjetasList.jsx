import React, { useState, useEffect } from 'react';
import { FaCreditCard, FaSearch, FaEdit, FaTrash, FaPlus, FaCheckCircle, FaEye, FaEyeSlash, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { VscStarFull } from "react-icons/vsc";
import { GoShield } from "react-icons/go";
import '../../css/Perfil/gestionar-tarjetas.css';

const ModalGestionarTarjetas = ({ 
  isOpen, 
  onClose, 
  tarjetas, 
  onDelete, 
  onSetPredeterminada, 
  onAdd, 
  onEdit, 
  userData,
  showAddButton = true,
  isCheckout = false,
  darkMode = false,
  onSelect,
  selectedTarjetaId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  const [filteredTarjetas, setFilteredTarjetas] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [showCardNumber, setShowCardNumber] = useState({});
  const [selectedId, setSelectedId] = useState(selectedTarjetaId || null);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [tarjetaAEliminar, setTarjetaAEliminar] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (tarjetas) {
      const filtered = tarjetas.filter(tarjeta => 
        tarjeta.nombre_titular?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tarjeta.numero_enmascarado?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTarjetas(filtered);
      setCurrentPage(1);
    }
  }, [tarjetas, searchTerm]);

  useEffect(() => {
    if (isCheckout && tarjetas.length > 0) {
      if (!selectedTarjetaId) {
        const predeterminada = tarjetas.find(t => t.predeterminada);
        if (predeterminada) {
          setSelectedId(predeterminada.id);
        } else {
          setSelectedId(tarjetas[0].id);
        }
      } else {
        setSelectedId(selectedTarjetaId);
      }
    }
  }, [tarjetas, isCheckout, selectedTarjetaId]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTarjetas = filteredTarjetas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTarjetas.length / itemsPerPage);
  const startItem = filteredTarjetas.length === 0 ? 0 : indexOfFirstItem + 1;
  const endItem = Math.min(indexOfLastItem, filteredTarjetas.length);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSelectTarjeta = (tarjeta) => {
    if (isCheckout) {
      setSelectedId(tarjeta.id);
      if (onSelect) {
        onSelect(tarjeta);
      }
      setTimeout(() => {
        onClose();
      }, 300);
    }
  };

  const handleDeleteClick = (tarjeta) => {
    setTarjetaAEliminar(tarjeta);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    setIsDeleting(true);
    
    setTimeout(() => {
      if (tarjetaAEliminar) {
        onDelete(tarjetaAEliminar.id);
        setShowConfirmModal(false);
        setTarjetaAEliminar(null);
        setIsDeleting(false);
        setSuccessMessage('Tarjeta eliminada correctamente');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    }, 1500);
  };

  const handleSetPredeterminada = (id) => {
    onSetPredeterminada(id);
    setSuccessMessage('Tarjeta predeterminada actualizada');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const toggleShowNumber = (id) => {
    setShowCardNumber(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const detectarTipoTarjeta = (numeroEnmascarado) => {
    const ultimosDigitos = numeroEnmascarado?.split(' ').pop() || '';
    if (ultimosDigitos.startsWith('4')) return 'Visa';
    if (ultimosDigitos.startsWith('5')) return 'Mastercard';
    if (ultimosDigitos.startsWith('3')) return 'American Express';
    return 'Tarjeta';
  };

  const getTipoTarjetaLabel = (tipo) => {
    switch(tipo) {
      case 'visa': return 'Visa';
      case 'mastercard': return 'Mastercard';
      case 'amex': return 'American Express';
      default: return 'Tarjeta';
    }
  };

  const handleAddClick = () => {
    onAdd();
  };

  if (!isOpen) return null;

  return (
    <div className={`tarjeta-modal-overlay ${darkMode ? 'dark-mode' : ''}`} onClick={onClose}>
      <div className="tarjeta-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="tarjeta-modal-header">
          <div className="tarjeta-modal-logo">
            <FaCreditCard />
          </div>
          <div className="tarjeta-modal-header-info">
            <h3>Gestionar Tarjetas</h3>
            <div className="tarjeta-modal-header-subtitle">
              {isCheckout ? 'Selecciona una tarjeta para tu pedido' : 'Administra tus métodos de pago'}
            </div>
          </div>
          <button className="tarjeta-modal-close" onClick={onClose}>✕</button>
        </div>

        {successMessage && (
          <div className="tarjeta-modal-success-message">
            <FaCheckCircle className="success-icon" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="tarjeta-modal-body">
          <div className="tarjeta-search-container">
            <div className="tarjeta-search-wrapper">
              <FaSearch className="tarjeta-search-icon" />
              <input
                type="text"
                className="tarjeta-search-input"
                placeholder="Buscar por titular o número de tarjeta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isCheckout && showAddButton && (
            <button 
              className="tarjeta-add-btn-checkout"
              onClick={handleAddClick}
            >
              <FaPlus /> Agregar nueva tarjeta
            </button>
          )}

          <div className="tarjeta-lista-container">
            {currentTarjetas.length === 0 ? (
              <div className="tarjeta-empty-state">
                <p>No hay tarjetas registradas</p>
                {!isCheckout && (
                  <button className="tarjeta-add-btn" onClick={handleAddClick}>
                    <FaPlus /> Agregar tarjeta
                  </button>
                )}
              </div>
            ) : (
              <>
                {currentTarjetas.map((tarjeta) => {
                  const tipo = tarjeta.tipo_tarjeta === 'visa' ? 'Visa' :
                              tarjeta.tipo_tarjeta === 'mastercard' ? 'Mastercard' :
                              tarjeta.tipo_tarjeta === 'amex' ? 'American Express' : 
                              detectarTipoTarjeta(tarjeta.numero_enmascarado);
                  
                  const isSelected = isCheckout && selectedId === tarjeta.id;
                  
                  return (
                    <div 
                      key={tarjeta.id} 
                      className={`tarjeta-card ${isSelected ? 'selected' : ''} ${tarjeta.predeterminada && !isCheckout ? 'predeterminada' : ''}`}
                      onClick={() => handleSelectTarjeta(tarjeta)}
                      style={{ cursor: isCheckout ? 'pointer' : 'default' }}
                    >
                      <div className="tarjeta-card-header">
                        <div className="tarjeta-card-tipo">
                          <FaCreditCard />
                          <span>{tipo}</span>
                          
                          {/* Badge Predeterminada */}
                          {tarjeta.predeterminada && (
                            <span className={`tarjeta-badge predeterminada-badge ${
                              isCheckout 
                                ? (isSelected ? 'in-use' : 'checkout-gris') 
                                : ''
                            }`}>
                              Predeterminada
                            </span>
                          )}
                          
                          {/* Badge "En uso" - SOLO EN CHECKOUT */}
                          {isCheckout && isSelected && !tarjeta.predeterminada && (
                            <span className="tarjeta-badge selected-badge">En uso</span>
                          )}
                        </div>
                        <div className="tarjeta-card-actions" onClick={(e) => e.stopPropagation()}>
                          <button 
                            className="tarjeta-edit-btn"
                            onClick={() => onEdit(tarjeta)}
                            title="Editar tarjeta"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="tarjeta-delete-btn"
                            onClick={() => handleDeleteClick(tarjeta)}
                            title="Eliminar tarjeta"
                            disabled={tarjeta.predeterminada && filteredTarjetas.length > 1}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                      <div className="tarjeta-card-body">
                        <div className="tarjeta-numero">
                          {showCardNumber[tarjeta.id] ? (
                            <span>{tarjeta.numero_enmascarado || "**** **** **** ****"}</span>
                          ) : (
                            <span>•••• •••• •••• {tarjeta.ultimos_digitos || "****"}</span>
                          )}
                          <button 
                            className="tarjeta-eye-btn"
                            onClick={() => toggleShowNumber(tarjeta.id)}
                          >
                            {showCardNumber[tarjeta.id] ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                        <div className="tarjeta-info-row">
                          <span className="tarjeta-titular">{tarjeta.nombre_titular}</span>
                          <span className="tarjeta-fecha">Exp: {tarjeta.mes_expiracion}/{tarjeta.anio_expiracion}</span>
                        </div>
                      </div>
                      {/* Botón "Establecer como predeterminada" - SOLO EN PERFIL */}
                      {!tarjeta.predeterminada && !isCheckout && (
                        <div className="tarjeta-card-footer" onClick={(e) => e.stopPropagation()}>
                          <button 
                            className="tarjeta-set-default-btn"
                            onClick={() => handleSetPredeterminada(tarjeta.id)}
                          >
                            <VscStarFull /> Establecer como predeterminada
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {filteredTarjetas.length > 0 && (
            <div className="tarjeta-pagination-container">
              <div className="tarjeta-results-count">
                Mostrando {startItem} - {endItem} de {filteredTarjetas.length} tarjetas
              </div>
              {totalPages > 1 && (
                <div className="tarjeta-pagination">
                  <button
                    className="tarjeta-page-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    &laquo;
                  </button>
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      className={`tarjeta-page-btn ${currentPage === index + 1 ? 'active' : ''}`}
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    className="tarjeta-page-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    &raquo;
                  </button>
                </div>
              )}
            </div>
          )}

          {!isCheckout && (
            <div className="tarjeta-add-footer">
              <button className="tarjeta-add-new-btn" onClick={handleAddClick}>
                <FaPlus /> Agregar nueva tarjeta
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===== MODAL DE CONFIRMACIÓN DE ELIMINACIÓN ===== */}
      {showConfirmModal && tarjetaAEliminar && (
        <div className={`confirm-modal-overlay ${darkMode ? 'dark-mode' : ''}`} onClick={() => !isDeleting && setShowConfirmModal(false)}>
          <div className={`confirm-modal-content ${isDeleting ? 'deleting' : ''}`} onClick={(e) => e.stopPropagation()}>
            
            {isDeleting ? (
              <>
                <div className="confirm-modal-loading">
                  <div className="confirm-modal-spinner"></div>
                  <p className="confirm-modal-loading-text">Eliminando...</p>
                </div>
              </>
            ) : (
              <>
                <div className="confirm-modal-header">
                  <h3>Confirmar eliminación</h3>
                  <button className="confirm-modal-close" onClick={() => setShowConfirmModal(false)}>
                    <FaTimes />
                  </button>
                </div>

                <div className="confirm-modal-body">
                  <div className="confirm-modal-icon-wrapper">
                    <FaExclamationTriangle className="confirm-modal-icon" />
                  </div>

                  <p className="confirm-modal-message" style={{ marginBottom: '0' }}>
                    ¿Estás seguro de que quieres eliminar
                  </p>
                  <p className="confirm-modal-message" style={{ marginTop: '0' }}>
                    esta tarjeta?
                  </p>

                  <div className="confirm-modal-direccion-info">
                    <div className="confirm-modal-direccion-row">
                      <div className="confirm-modal-direccion-label">
                        <FaCreditCard className="confirm-modal-direccion-icon" />
                        <span>Tipo:</span>
                      </div>
                      <div className="confirm-modal-direccion-value">
                        {getTipoTarjetaLabel(tarjetaAEliminar?.tipo_tarjeta)}
                      </div>
                    </div>
                    <div className="confirm-modal-direccion-row">
                      <div className="confirm-modal-direccion-label">
                        <span>💳</span>
                        <span>Número:</span>
                      </div>
                      <div className="confirm-modal-direccion-value">
                        {tarjetaAEliminar?.numero_enmascarado || "**** **** **** 1234"}
                      </div>
                    </div>
                    <div className="confirm-modal-direccion-row">
                      <div className="confirm-modal-direccion-label">
                        <span>👤</span>
                        <span>Titular:</span>
                      </div>
                      <div className="confirm-modal-direccion-value">
                        {tarjetaAEliminar?.nombre_titular}
                      </div>
                    </div>
                    <div className="confirm-modal-direccion-row">
                      <div className="confirm-modal-direccion-label">
                        <span>📅</span>
                        <span>Expira:</span>
                      </div>
                      <div className="confirm-modal-direccion-value">
                        {tarjetaAEliminar?.mes_expiracion}/{tarjetaAEliminar?.anio_expiracion}
                      </div>
                    </div>
                  </div>

                  <div className="confirm-modal-warning">
                    <GoShield className="confirm-modal-warning-icon" />
                    <div className="confirm-modal-warning-text">
                      <strong>Esta acción no se puede deshacer</strong>
                      <span>La tarjeta será eliminada permanentemente</span>
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

export default ModalGestionarTarjetas;