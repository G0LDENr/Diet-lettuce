import React, { useState, useEffect } from 'react';

const SendMessageModal = ({ show, onClose, darkMode, onMessageSent }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageForm, setMessageForm] = useState({
    destinatario_tipo: 'todos',
    destinatario_id: '',
    titulo: 'Mensaje del Restaurante',
    mensaje: ''
  });

  const API_BASE_URL = 'http://127.0.0.1:5000';

  const showMessage = (title, message, type = 'success') => {
    console.log(`${type}: ${title} - ${message}`);
    alert(`${title}: ${message}`);
  };

  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/notificaciones/usuarios`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Usuarios recibidos:', data);
        setUsuarios(data);
      } else {
        console.error('Error al obtener usuarios:', response.status);
      }
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageForm.mensaje.trim()) {
      showMessage('Mensaje requerido', 'Por favor escribe un mensaje', 'warning');
      return;
    }

    try {
      setSendingMessage(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/notificaciones/mensaje`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageForm)
      });

      if (response.ok) {
        const data = await response.json();
        showMessage('Mensaje enviado', data.msg, 'success');
        
        setMessageForm({
          destinatario_tipo: 'todos',
          destinatario_id: '',
          titulo: 'Mensaje del Restaurante',
          mensaje: ''
        });
        
        if (onMessageSent) onMessageSent();
        onClose();
      } else {
        const errorData = await response.json();
        showMessage('Error', errorData.msg || 'Error al enviar mensaje', 'error');
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      showMessage('Error de conexión', 'No se pudo conectar con el servidor', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  useEffect(() => {
    if (show) {
      fetchUsuarios();
    }
  }, [show]);

  // Filtrar usuarios según el tipo seleccionado
  const getFilteredUsuarios = () => {
    if (messageForm.destinatario_tipo === 'cliente') {
      // rol: 2 = cliente (según tus datos: rol: 2, rol_nombre: 'Cliente')
      return usuarios.filter(u => u.rol === 2);
    } else if (messageForm.destinatario_tipo === 'admin') {
      // rol: 1 = administrador (según tus datos: rol: 1, rol_nombre: 'Administrador')
      return usuarios.filter(u => u.rol === 1);
    }
    return [];
  };

  const filteredUsuarios = getFilteredUsuarios();

  if (!show) return null;

  return (
    <div className={`modal-overlay ${darkMode ? 'dark-mode' : ''}`} onClick={onClose}>
      <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Enviar Mensaje a Usuarios</h3>
          <button className="close-modal" onClick={onClose} disabled={sendingMessage}>✕</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSendMessage}>
            <div className="form-group">
              <label>Tipo de Destinatario</label>
              <select
                value={messageForm.destinatario_tipo}
                onChange={(e) => setMessageForm({
                  ...messageForm,
                  destinatario_tipo: e.target.value,
                  destinatario_id: '' // Resetear el ID cuando cambia el tipo
                })}
                className="form-select"
                disabled={sendingMessage}
              >
                <option value="todos">Todos los Usuarios</option>
                <option value="cliente">Cliente Específico</option>
                <option value="admin">Administrador Específico</option>
                <option value="todos_admins">Todos los Administradores</option>
              </select>
            </div>

            {(messageForm.destinatario_tipo === 'cliente' || messageForm.destinatario_tipo === 'admin') && (
              <div className="form-group">
                <label>
                  {messageForm.destinatario_tipo === 'cliente' ? 'Seleccionar Cliente' : 'Seleccionar Administrador'}
                </label>
                <select
                  value={messageForm.destinatario_id}
                  onChange={(e) => setMessageForm({...messageForm, destinatario_id: e.target.value})}
                  className="form-select"
                  required
                  disabled={sendingMessage}
                >
                  <option value="">Seleccionar {messageForm.destinatario_tipo === 'cliente' ? 'Cliente' : 'Administrador'}...</option>
                  {filteredUsuarios.length > 0 ? (
                    filteredUsuarios.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.nombre} {u.email ? `(${u.email})` : u.telefono ? `(${u.telefono})` : ''}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No hay {messageForm.destinatario_tipo === 'cliente' ? 'clientes' : 'administradores'} disponibles</option>
                  )}
                </select>
                            

                {filteredUsuarios.length === 0 && (
                  <div className="info-message" style={{ 
                    marginTop: '8px', 
                    fontSize: '0.75rem', 
                    color: '#e74c3c',
                    padding: '8px',
                    backgroundColor: '#fef5f5',
                    borderRadius: '4px'
                  }}>
                    No hay {messageForm.destinatario_tipo === 'cliente' ? 'clientes' : 'administradores'} registrados en el sistema.
                  </div>
                )}
              </div>
            )}

            <div className="form-group">
              <label>Título</label>
              <input
                type="text"
                value={messageForm.titulo}
                onChange={(e) => setMessageForm({...messageForm, titulo: e.target.value})}
                className="form-input"
                required
                disabled={sendingMessage}
              />
            </div>

            <div className="form-group">
              <label>Mensaje</label>
              <textarea
                value={messageForm.mensaje}
                onChange={(e) => setMessageForm({...messageForm, mensaje: e.target.value})}
                className="form-textarea"
                rows="5"
                required
                disabled={sendingMessage}
                placeholder="Escribe tu mensaje aquí..."
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={sendingMessage}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={sendingMessage}
              >
                {sendingMessage ? 'Enviando...' : 'Enviar Mensaje'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SendMessageModal;