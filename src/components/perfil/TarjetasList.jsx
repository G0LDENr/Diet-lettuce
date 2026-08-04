import React, { useState, useEffect } from 'react';
import { FaCreditCard, FaSearch, FaEdit, FaTrash, FaPlus, FaCheckCircle, FaTimes, FaExclamationTriangle, FaCopy, FaStar } from 'react-icons/fa';
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
  const [selectedId, setSelectedId] = useState(selectedTarjetaId || null);
  const [copiedId, setCopiedId] = useState(null);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [tarjetaAEliminar, setTarjetaAEliminar] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

  // Limpiar mensaje de error después de 3 segundos
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // ===== FUNCIÓN PARA OBTENER LOS ÚLTIMOS 4 DÍGITOS =====
  const getUltimosDigitos = (numeroEnmascarado) => {
    if (!numeroEnmascarado) return '****';
    const match = numeroEnmascarado.match(/(\d{4})$/);
    if (match) {
      return match[1];
    }
    return '****';
  };

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
      }
    }, 1500);
  };

  // ===== FUNCIÓN MODIFICADA: Manejar errores correctamente =====
  const handleSetPredeterminada = async (id) => {
    try {
      // Intentar establecer como predeterminada
      await onSetPredeterminada(id);
      // Si es exitoso, no hacemos nada más
    } catch (error) {
      console.error('Error al establecer predeterminada:', error);
      setErrorMessage('Error al establecer la tarjeta como predeterminada');
    }
  };

  // ===== FUNCIÓN PARA COPIAR EL NÚMERO COMPLETO =====
  const handleCopyNumber = (tarjeta) => {
    if (tarjeta.numero_completo) {
      navigator.clipboard.writeText(tarjeta.numero_completo).then(() => {
        setCopiedId(tarjeta.id);
        setTimeout(() => setCopiedId(null), 2000);
      }).catch(err => {
        console.error('Error al copiar:', err);
      });
      return;
    }
    alert('⚠️ No se puede copiar el número completo.\nSolo están disponibles los últimos 4 dígitos.\n\nPara poder copiar el número completo, agrega la tarjeta nuevamente.');
  };

  const handleAddClick = () => {
    onAdd();
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

        {/* ===== MENSAJE DE ERROR ===== */}
        {errorMessage && (
          <div className="tarjeta-modal-error-message">
            <span className="error-icon">⚠️</span>
            <span>{errorMessage}</span>
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
              </div>
            ) : (
              <>
                {currentTarjetas.map((tarjeta) => {
                  const tipo = tarjeta.tipo_tarjeta === 'visa' ? 'Visa' :
                              tarjeta.tipo_tarjeta === 'mastercard' ? 'Mastercard' :
                              tarjeta.tipo_tarjeta === 'amex' ? 'American Express' : 
                              detectarTipoTarjeta(tarjeta.numero_enmascarado);
                  
                  const isSelected = isCheckout && selectedId === tarjeta.id;
                  const isPredeterminada = tarjeta.predeterminada;
                  
                  const ultimosDigitos = getUltimosDigitos(tarjeta.numero_enmascarado);
                  
                  return (
                    <div 
                      key={tarjeta.id} 
                      className={`tarjeta-card ${isSelected ? 'selected' : ''} ${isPredeterminada && !isCheckout ? 'predeterminada' : ''}`}
                      onClick={() => handleSelectTarjeta(tarjeta)}
                      style={{ cursor: isCheckout ? 'pointer' : 'default' }}
                    >
                      <div className="tarjeta-card-header">
                        <div className="tarjeta-card-tipo">
                          <FaCreditCard />
                          <span>{tipo}</span>
                          
                          {isPredeterminada && (
                            <span className={`tarjeta-badge predeterminada-badge ${
                              isCheckout 
                                ? (isSelected ? 'in-use' : 'checkout-gris') 
                                : ''
                            }`}>
                              Predeterminada
                            </span>
                          )}
                          
                          {isCheckout && isSelected && !isPredeterminada && (
                            <span className="tarjeta-badge selected-badge">En uso</span>
                          )}
                        </div>
                        
                        {/* ===== ACCIONES DE LA TARJETA ===== */}
                        <div className="tarjeta-card-actions" onClick={(e) => e.stopPropagation()}>
                          {/* ===== BOTÓN ESTABLECER COMO PREDETERMINADA - ICONO ESTRELLA ===== */}
                          {!isPredeterminada && !isCheckout && (
                            <button 
                              className="tarjeta-set-default-btn-icon"
                              onClick={() => handleSetPredeterminada(tarjeta.id)}
                              title="Establecer como predeterminada"
                            >
                              <FaStar />
                            </button>
                          )}
                          
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
                            disabled={isPredeterminada && filteredTarjetas.length > 1}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                      
                      <div className="tarjeta-card-body">
                        <div className="tarjeta-numero">
                          <span>
                            •••• •••• •••• {ultimosDigitos}
                          </span>
                          <button 
                            className="tarjeta-copy-btn"
                            onClick={() => handleCopyNumber(tarjeta)}
                            title="Copiar número de tarjeta"
                          >
                            {copiedId === tarjeta.id ? (
                              <FaCheckCircle className="copy-success" />
                            ) : (
                              <FaCopy />
                            )}
                          </button>
                        </div>
                        <div className="tarjeta-info-row">
                          <span className="tarjeta-titular">{tarjeta.nombre_titular}</span>
                          <span className="tarjeta-fecha">Exp: {tarjeta.mes_expiracion}/{tarjeta.anio_expiracion}</span>
                        </div>
                      </div>
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