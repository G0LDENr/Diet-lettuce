import React, { useEffect, useState } from 'react';
import CreateUserForm from '../../components/users/create-user';
import EditUserForm from '../../components/users/edit-user';
import { useConfig } from '../../context/config';
import '../../css/Users/users.css';

// Importa tus imágenes
import editIcon from '../../img/edit.png';
import deleteIcon from '../../img/delete.png';
import locationIcon from '../../img/ubicacion.png';

const Users = () => {
  const { darkMode } = useConfig();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sexFilter, setSexFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
  
  // Estados para el modal de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
    // Obtener el ID del usuario actual del localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUserId(user.id);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://127.0.0.1:5000/user/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        const usersWithSimpleIds = data.map((user, index) => ({
          ...user,
          simpleId: index + 1
        }));
        
        setUsers(usersWithSimpleIds);
        setFilteredUsers(usersWithSimpleIds);
      } else {
        console.error('Error al obtener usuarios:', response.status);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = users;

    // Filtro por término de búsqueda
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(user => 
        user.simpleId.toString().includes(searchTerm) || 
        user.id.toString().includes(searchTerm) ||
        user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.correo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.telefono && user.telefono.toString().includes(searchTerm)) ||
        (user.direccion && user.direccion?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtro por rol
    if (roleFilter !== '') {
      filtered = filtered.filter(user => user.rol.toString() === roleFilter);
    }

    // Filtro por sexo
    if (sexFilter !== '') {
      filtered = filtered.filter(user => user.sexo === sexFilter);
    }
    
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, roleFilter, sexFilter, users]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Función para abrir el modal de eliminación
  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setDeleteError('');
    setShowDeleteModal(true);
  };

  // Función para cerrar el modal de eliminación
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
    setDeleteError('');
    setDeleteLoading(false);
  };

  // Función para confirmar la eliminación
  const confirmDelete = async () => {
    if (!userToDelete) return;

    setDeleteLoading(true);
    setDeleteError('');

    try {
      const token = localStorage.getItem('token');
      
      console.log('🔍 Eliminando usuario:', userToDelete.id, userToDelete.nombre);
      
      const response = await fetch(`http://127.0.0.1:5000/user/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const responseText = await response.text();
      
      if (response.ok) {
        console.log('✅ Usuario eliminado exitosamente');
        
        // Actualizar la lista local
        const updatedUsers = users.filter(user => user.id !== userToDelete.id);
        
        const usersWithSimpleIds = updatedUsers.map((user, index) => ({
          ...user,
          simpleId: index + 1
        }));
        
        setUsers(usersWithSimpleIds);
        setFilteredUsers(usersWithSimpleIds);
        
        // Ajustar paginación si es necesario
        if (currentUsers.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
        
        // Cerrar el modal después de 1 segundo
        setTimeout(() => {
          closeDeleteModal();
        }, 1000);
      } else {
        let errorMsg = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMsg = errorData.msg || errorData.message || errorData.error || errorMsg;
        } catch (e) {
          errorMsg = responseText || errorMsg;
        }
        
        if (response.status === 401) {
          errorMsg = 'No autorizado. Token inválido o expirado.';
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } else if (response.status === 403) {
          errorMsg = 'No tienes permisos para eliminar usuarios.';
        } else if (response.status === 404) {
          errorMsg = 'Usuario no encontrado.';
        }
        
        setDeleteError(errorMsg);
        setDeleteLoading(false);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      setDeleteError('Error de conexión al eliminar usuario. Verifica tu conexión a internet.');
      setDeleteLoading(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleAddUser = () => {
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedUser(null);
  };

  // Funciones para dirección
  const handleShowAddress = (direccion) => {
    if (direccion && direccion.trim() !== '') {
      setSelectedAddress(direccion);
      setShowAddressModal(true);
    } else {
      setSelectedAddress('No hay dirección registrada para este usuario');
      setShowAddressModal(true);
    }
  };

  const handleCloseAddressModal = () => {
    setShowAddressModal(false);
    setSelectedAddress('');
  };

  const handleCopyAddress = () => {
    if (selectedAddress && selectedAddress !== 'No hay dirección registrada para este usuario') {
      navigator.clipboard.writeText(selectedAddress)
        .then(() => {
          alert('Dirección copiada al portapapeles');
        })
        .catch(err => {
          console.error('Error al copiar:', err);
        });
    }
  };

  const handleOpenInMaps = () => {
    if (selectedAddress && selectedAddress !== 'No hay dirección registrada para este usuario') {
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedAddress)}`;
      window.open(mapsUrl, '_blank');
    }
  };

  const getAddressDisplay = (direccion) => {
    if (!direccion || direccion.trim() === '') {
      return (
        <span className="user-no-address" title="Sin dirección">
          Sin dirección
        </span>
      );
    } else {
      return (
        <div className="user-address-container">
          <span className="user-address-text" title={direccion}>
            {direccion.length > 20 ? `${direccion.substring(0, 20)}...` : direccion}
          </span>
          <button 
            className="user-view-address-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleShowAddress(direccion);
            }}
            title="Ver dirección completa"
          >
            <img src={locationIcon} alt="Ver dirección" className="user-address-icon" />
          </button>
        </div>
      );
    }
  };

  const getRoleText = (role) => {
    switch(role) {
      case 1: return 'Administrador';
      case 2: return 'Usuario';
      default: return 'Usuario';
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className={`users-container ${darkMode ? 'dark-mode' : ''}`}>
        <div className="users-loading-spinner"></div>
        <p className="users-loading-text">Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className={`users-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="users-content">
        
        <div className="users-section-header">
          <h3 className="users-section-title">Gestión de Usuarios</h3>
          <button 
            className="users-add-btn"
            onClick={handleAddUser}
            title="Agregar nuevo usuario"
          >
            <span className="users-btn-icon">+</span>
            Agregar Usuario
          </button>
        </div>

        <div className="users-search-section">
          <div className="users-filters-row">
            <div className="users-search-container users-main-search">
              <input
                type="text"
                placeholder="Buscar por ID, nombre, email, teléfono o dirección..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="users-search-input"
              />
              {/* ELIMINADO: botón de tache (✕) */}
            </div>

            <div className="users-filter-group">
              <select 
                value={roleFilter} 
                onChange={(e) => setRoleFilter(e.target.value)}
                className="users-filter-select"
              >
                <option value="">Todos los roles</option>
                <option value="1">Administrador</option>
                <option value="2">Usuario</option>
              </select>
            </div>

            <div className="users-filter-group">
              <select 
                value={sexFilter} 
                onChange={(e) => setSexFilter(e.target.value)}
                className="users-filter-select"
              >
                <option value="">Todos los sexos</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>
          </div>
        </div>

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th className="users-th">ID</th>
                <th className="users-th">Nombre</th>
                <th className="users-th">Email</th>
                <th className="users-th">Teléfono</th>
                <th className="users-th">Dirección</th>
                <th className="users-th">Rol</th>
                <th className="users-th">Sexo</th>
                <th className="users-th users-actions-header">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map(user => {
                  const isCurrentUser = user.id === currentUserId;
                  
                  return (
                    <tr key={user.id} className="users-row">
                      <td className="users-td users-id">{user.simpleId}</td>
                      <td className="users-td users-name">{user.nombre || 'N/A'}</td>
                      <td className="users-td users-email">{user.correo || 'N/A'}</td>
                      <td className="users-td users-phone">{user.telefono || 'N/A'}</td>
                      <td className="users-td users-address-col">
                        {getAddressDisplay(user.direccion)}
                      </td>
                      <td className="users-td users-role">{getRoleText(user.rol)}</td>
                      <td className="users-td users-sex">{user.sexo || 'N/A'}</td>
                      <td className="users-td users-actions-cell">
                        <div className="users-actions-buttons">
                          <button 
                            onClick={() => handleEdit(user)}
                            className="users-action-btn users-edit-btn"
                            title="Editar usuario"
                          >
                            <img src={editIcon} alt="Editar" className="users-action-icon" />
                          </button>
                          <button 
                            onClick={() => {
                              if (!isCurrentUser) {
                                openDeleteModal(user);
                              } else {
                                alert('No puedes eliminarte a ti mismo');
                              }
                            }}
                            className="users-action-btn users-delete-btn"
                            title={isCurrentUser ? "No puedes eliminarte a ti mismo" : "Eliminar usuario"}
                            disabled={isCurrentUser}
                            style={{
                              opacity: isCurrentUser ? 0.5 : 1,
                              cursor: isCurrentUser ? 'not-allowed' : 'pointer'
                            }}
                          >
                            <img src={deleteIcon} alt="Eliminar" className="users-action-icon" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="users-no-results">
                    {searchTerm || roleFilter || sexFilter ? 'No se encontraron usuarios con esos criterios' : 'No hay usuarios registrados'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {filteredUsers.length > usersPerPage && (
            <div className="users-pagination-container">
              <div className="users-pagination-controls">
                <button 
                  onClick={() => paginate(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="users-pagination-btn users-prev-btn"
                >
                  Anterior
                </button>
                
                <div className="users-pagination-numbers">
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
                          {showEllipsis && <span className="users-pagination-ellipsis">...</span>}
                          <button
                            onClick={() => paginate(number)}
                            className={`users-pagination-btn ${currentPage === number ? 'users-active' : ''}`}
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
                  className="users-pagination-btn users-next-btn"
                >
                  Siguiente
                </button>
              </div>

              <div className="users-count-info">
                Mostrando {currentUsers.length} de {filteredUsers.length} usuarios
              </div>
            </div>
          )}

          {filteredUsers.length <= usersPerPage && filteredUsers.length > 0 && (
            <div className="users-count-info">
              Mostrando {currentUsers.length} de {filteredUsers.length} usuarios
            </div>
          )}
        </div>

        {/* Modal para dirección */}
        {showAddressModal && (
          <div className="users-modal-overlay">
            <div className="users-modal-content users-address-modal">
              <div className="users-modal-header">
                <h3 className="users-modal-title">Dirección del Usuario</h3>
                <button className="users-close-modal" onClick={handleCloseAddressModal}>✕</button>
              </div>
              <div className="users-modal-body">
                <div className="users-address-content">
                  <p className="users-address-title">Dirección completa:</p>
                  <div className="users-address-display">
                    {selectedAddress}
                  </div>
                  {selectedAddress && selectedAddress !== 'No hay dirección registrada para este usuario' && (
                    <div className="users-address-actions">
                      <button 
                        className="users-btn users-btn-secondary"
                        onClick={handleCopyAddress}
                      >
                        Copiar Dirección
                      </button>
                      <button 
                        className="users-btn users-btn-primary"
                        onClick={handleOpenInMaps}
                      >
                        Abrir en Google Maps
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="users-modal-footer">
                <button 
                  className="users-btn users-btn-close"
                  onClick={handleCloseAddressModal}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para crear usuario */}
        {showCreateModal && (
          <div className="users-modal-overlay">
            <div className="users-modal-content create-user-modal">
              <div className="users-modal-header">
                <h3 className="users-modal-title">Agregar Nuevo Usuario</h3>
                <button className="users-close-modal" onClick={closeCreateModal}>✕</button>
              </div>
              <div className="users-modal-body">
                <CreateUserForm 
                  onClose={closeCreateModal}
                  onUserCreated={() => {
                    fetchUsers();
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal para editar usuario */}
        {showEditModal && selectedUser && (
          <div className="users-modal-overlay">
            <div className="users-modal-content">
              <div className="users-modal-header">
                <h3 className="users-modal-title">Editar Usuario</h3>
                <button className="users-close-modal" onClick={closeEditModal}>✕</button>
              </div>
              <div className="users-modal-body">
                <EditUserForm 
                  user={selectedUser}
                  onClose={closeEditModal}
                  onUserUpdated={() => {
                    fetchUsers();
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación de eliminación */}
        {showDeleteModal && userToDelete && (
          <div className="users-modal-overlay">
            <div className="users-modal-content users-delete-modal">
              <div className="users-modal-header users-delete-header">
                <h3 className="users-modal-title">Confirmar Eliminación</h3>
                <button className="users-close-modal" onClick={closeDeleteModal} disabled={deleteLoading}>✕</button>
              </div>
              <div className="users-modal-body users-delete-body">
                {deleteError ? (
                  <div className="users-delete-error">
                    <div className="users-delete-error-icon">❌</div>
                    <p className="users-delete-error-message">{deleteError}</p>
                  </div>
                ) : deleteLoading ? (
                  <div className="users-delete-loading">
                    <div className="users-delete-spinner"></div>
                    <p className="users-delete-loading-text">Eliminando usuario...</p>
                  </div>
                ) : (
                  <>
                    <div className="users-delete-icon">⚠️</div>
                    <p className="users-delete-question">
                      ¿Estás seguro de que quieres eliminar al usuario?
                    </p>
                    <div className="users-delete-user-info">
                      <p><strong>Nombre:</strong> {userToDelete.nombre}</p>
                      <p><strong>Email:</strong> {userToDelete.correo}</p>
                      <p><strong>Rol:</strong> {getRoleText(userToDelete.rol)}</p>
                    </div>
                    <p className="users-delete-warning">
                      Esta acción no se puede deshacer. Se eliminarán todos los datos del usuario incluyendo sus direcciones.
                    </p>
                  </>
                )}
              </div>
              <div className="users-modal-footer users-delete-footer">
                {!deleteLoading && !deleteError && (
                  <>
                    <button 
                      className="users-btn users-btn-cancel"
                      onClick={closeDeleteModal}
                    >
                      Cancelar
                    </button>
                    <button 
                      className="users-btn users-btn-delete"
                      onClick={confirmDelete}
                    >
                      Sí, Eliminar
                    </button>
                  </>
                )}
                {deleteLoading && (
                  <button 
                    className="users-btn users-btn-cancel"
                    onClick={closeDeleteModal}
                    disabled
                  >
                    Eliminando...
                  </button>
                )}
                {deleteError && (
                  <button 
                    className="users-btn users-btn-cancel"
                    onClick={closeDeleteModal}
                  >
                    Cerrar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;