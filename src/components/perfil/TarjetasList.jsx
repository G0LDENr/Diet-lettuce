import React, { useState, useEffect } from 'react';
import { FaCreditCard, FaSearch, FaEdit, FaTrash, FaPlus, FaCheckCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { VscStarFull } from "react-icons/vsc";
import '../../css/Perfil/gestionar-tarjetas.css';

const ModalGestionarTarjetas = ({ isOpen, onClose, tarjetas, onDelete, onSetPredeterminada, onAdd, onEdit, userData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  const [filteredTarjetas, setFilteredTarjetas] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [showCardNumber, setShowCardNumber] = useState({});

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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTarjetas = filteredTarjetas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTarjetas.length / itemsPerPage);
  const startItem = filteredTarjetas.length === 0 ? 0 : indexOfFirstItem + 1;
  const endItem = Math.min(indexOfLastItem, filteredTarjetas.length);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDelete = (id, nombre) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la tarjeta "${nombre || 'seleccionada'}"?`)) {
      onDelete(id);
      setSuccessMessage('Tarjeta eliminada correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
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

  if (!isOpen) return null;

  return (
    <div className="tarjeta-modal-overlay" onClick={onClose}>
      <div className="tarjeta-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="tarjeta-modal-header">
          <div className="tarjeta-modal-logo">
            <FaCreditCard />
          </div>
          <div className="tarjeta-modal-header-info">
            <h3>Gestionar Tarjetas</h3>
            <div className="tarjeta-modal-header-subtitle">Administra tus métodos de pago</div>
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

          <div className="tarjeta-lista-container">
            {currentTarjetas.length === 0 ? (
              <div className="tarjeta-empty-state">
                <p>No hay tarjetas registradas</p>
                <button className="tarjeta-add-btn" onClick={onAdd}>
                  <FaPlus /> Agregar tarjeta
                </button>
              </div>
            ) : (
              <>
                {currentTarjetas.map((tarjeta) => {
                  const tipo = tarjeta.tipo_tarjeta === 'visa' ? 'Visa' :
                              tarjeta.tipo_tarjeta === 'mastercard' ? 'Mastercard' :
                              tarjeta.tipo_tarjeta === 'amex' ? 'American Express' : 
                              detectarTipoTarjeta(tarjeta.numero_enmascarado);
                  
                  return (
                    <div key={tarjeta.id} className={`tarjeta-card ${tarjeta.predeterminada ? 'predeterminada' : ''}`}>
                      <div className="tarjeta-card-header">
                        <div className="tarjeta-card-tipo">
                          <FaCreditCard />
                          <span>{tipo}</span>
                          {tarjeta.predeterminada && (
                            <span className="tarjeta-badge">Predeterminada</span>
                          )}
                        </div>
                        <div className="tarjeta-card-actions">
                          <button 
                            className="tarjeta-edit-btn"
                            onClick={() => onEdit(tarjeta)}
                            title="Editar tarjeta"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="tarjeta-delete-btn"
                            onClick={() => handleDelete(tarjeta.id, tarjeta.nombre_titular)}
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
                      {!tarjeta.predeterminada && (
                        <div className="tarjeta-card-footer">
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

          <div className="tarjeta-add-footer">
            <button className="tarjeta-add-new-btn" onClick={onAdd}>
              <FaPlus /> Agregar nueva tarjeta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalGestionarTarjetas;