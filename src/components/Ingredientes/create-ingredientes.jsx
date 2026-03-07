import React, { useState } from 'react';
import { useConfig } from '../../context/config';
import '../../css/Ingredientes/create-ingredientes.css';

const CreateIngredienteForm = ({ onClose, onIngredienteCreated }) => {
  const { darkMode } = useConfig();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: ''
  });

  const [errors, setErrors] = useState({});

  const categoriasSugeridas = [
    'vegetales', 'proteínas', 'lacteos', 'condimentos', 
    'aderezos', 'toppings', 'gomitas', 'frutas', 'cereales'
  ];

  const validateData = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del ingrediente es requerido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    clearMessages();
  };

  const handleCategoriaClick = (categoria) => {
    setFormData(prev => ({ ...prev, categoria }));
  };

  const clearMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateData()) return;

    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      const token = localStorage.getItem('token');
      
      const response = await fetch('http://127.0.0.1:5000/ingredientes/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre: formData.nombre.trim(),
          categoria: formData.categoria.trim() || null
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage(data.msg || 'Ingrediente creado exitosamente');
        setTimeout(() => {
          onIngredienteCreated();
          onClose();
        }, 2000);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.msg || 'Error al crear ingrediente');
      }
    } catch (err) {
      setErrorMessage('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`create-ingrediente-form ${darkMode ? 'create-ingrediente-form-dark-mode' : ''}`}>
      <form onSubmit={handleSubmit} className="create-ingrediente-form-form">
        
        {successMessage && (
          <div className="create-ingrediente-success-message">{successMessage}</div>
        )}
        {errorMessage && (
          <div className="create-ingrediente-error-message-box">{errorMessage}</div>
        )}

        <div className="create-ingrediente-form-group">
          <label htmlFor="create-nombre">Nombre *</label>
          <input
            type="text"
            id="create-nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ej: Lechuga Romana, Pollo a la Parrilla, etc."
            required
            disabled={loading || successMessage}
            className={`create-ingrediente-input ${errors.nombre ? 'create-ingrediente-input-error' : ''}`}
          />
          {errors.nombre && <span className="create-ingrediente-error-message">{errors.nombre}</span>}
        </div>

        <div className="create-ingrediente-form-group">
          <label htmlFor="create-categoria">Categoría</label>
          <input
            type="text"
            id="create-categoria"
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            placeholder="Ej: vegetales, condimentos, etc."
            disabled={loading || successMessage}
            className="create-ingrediente-input"
          />
          <div className="create-ingrediente-categorias-container">
            <small className="create-ingrediente-form-text">
              Categorías sugeridas (opcional):
            </small>
            <div className="create-ingrediente-categorias-sugeridas">
              {categoriasSugeridas.map((categoria, index) => (
                <span
                  key={index}
                  className={`create-ingrediente-categoria-chip ${formData.categoria === categoria ? 'active' : ''}`}
                  onClick={() => handleCategoriaClick(categoria)}
                >
                  {categoria}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="create-ingrediente-form-actions">
          <button 
            type="button" 
            className="create-ingrediente-btn-cancel" 
            onClick={onClose} 
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="create-ingrediente-btn-submit" 
            disabled={loading || successMessage || !formData.nombre.trim()}
          >
            {loading ? (
              <>
                <span className="create-ingrediente-spinner"></span>
                Creando...
              </>
            ) : successMessage ? 'Creado' : 'Crear Ingrediente'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateIngredienteForm;