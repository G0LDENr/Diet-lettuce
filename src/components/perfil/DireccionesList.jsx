import React, { useState, useEffect } from 'react';
import { FaSearch, FaEdit, FaTrash, FaPlus, FaMapMarkerAlt, FaCheckCircle, FaHome, FaBuilding, FaCheck } from 'react-icons/fa';
import '../../css/Perfil/gestionar-direcciones.css';

const ModalGestionarDirecciones = ({ isOpen, onClose, direcciones, onDelete, onSetPredeterminada, onAdd, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(2); // Mostrar 2 direcciones por página
  const [filteredDirecciones, setFilteredDirecciones] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

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
    }
  }, [direcciones, searchTerm]);

  // Calcular índices de paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDirecciones = filteredDirecciones.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDirecciones.length / itemsPerPage);
  const startItem = filteredDirecciones.length === 0 ? 0 : indexOfFirstItem + 1;
  const endItem = Math.min(indexOfLastItem, filteredDirecciones.length);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDelete = (id, nombre) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la dirección "${nombre || 'seleccionada'}"?`)) {
      onDelete(id);
      setSuccessMessage('Dirección eliminada correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleSetPredeterminada = (id) => {
    onSetPredeterminada(id);
    setSuccessMessage('Dirección predeterminada actualizada');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="dir-modal-overlay" onClick={onClose}>
      <div className="dir-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="dir-modal-header">
          <div className="dir-modal-logo">
            <FaMapMarkerAlt />
          </div>
          <div className="dir-modal-header-info">
            <h3>Gestionar Direcciones</h3>
            <div className="dir-modal-header-subtitle">Administra tus direcciones de envío</div>
          </div>
          <button className="dir-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Mensaje de éxito */}
        {successMessage && (
          <div className="dir-modal-success-message">
            <FaCheckCircle className="success-icon" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="dir-modal-body">
          {/* Buscador */}
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

          {/* Lista de direcciones */}
          <div className="dir-lista-container">
            {currentDirecciones.length === 0 ? (
              <div className="dir-empty-state">
                <p>No hay direcciones registradas</p>
              </div>
            ) : (
              <>
                {currentDirecciones.map((direccion) => (
                  <div key={direccion.id} className={`dir-card ${direccion.predeterminada ? 'predeterminada' : ''}`}>
                    <div className="dir-card-header">
                      <div className="dir-card-tipo">
                        {direccion.tipo === 'casa' ? <FaHome /> : direccion.tipo === 'trabajo' ? <FaBuilding /> : <FaMapMarkerAlt />}
                        <span>{direccion.tipo === 'casa' ? 'Casa' : direccion.tipo === 'trabajo' ? 'Trabajo' : 'Otro'}</span>
                        {direccion.predeterminada && <span className="dir-badge">Predeterminada</span>}
                      </div>
                      <div className="dir-card-actions">
                        <button 
                          className="dir-edit-btn"
                          onClick={() => onEdit(direccion)}
                          title="Editar dirección"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="dir-delete-btn"
                          onClick={() => handleDelete(direccion.id, direccion.calle)}
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
                    {!direccion.predeterminada && (
                      <div className="dir-card-footer">
                        <button 
                          className="dir-set-default-btn"
                          onClick={() => handleSetPredeterminada(direccion.id)}
                        >
                          <FaCheck /> Establecer como predeterminada
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Contador de resultados y paginación juntos */}
          {filteredDirecciones.length > 0 && (
            <div className="dir-pagination-container">
              <div className="dir-results-count">
                Mostrando {startItem} - {endItem} de {filteredDirecciones.length} direcciones
              </div>
              
              {/* Paginación */}
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
    </div>
  );
};

export default ModalGestionarDirecciones;