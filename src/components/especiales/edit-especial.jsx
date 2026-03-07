import React, { useState, useEffect } from 'react';
import { useConfig } from '../../context/config';
import '../../css/Especiales/edit-especial.css';

const EditEspecialForm = ({ especial, onClose, onEspecialUpdated }) => {
  const { darkMode } = useConfig();
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    categoria: 'ensaladas', // NUEVO CAMPO con valor por defecto
    activo: 'true'
  });
  const [ingredientes, setIngredientes] = useState(['']); // Array de ingredientes
  const [ingredientesDisponibles, setIngredientesDisponibles] = useState([]); // Lista dinámica de ingredientes
  const [loading, setLoading] = useState(false);
  const [loadingIngredientes, setLoadingIngredientes] = useState(true);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Opciones de categorías
  const categorias = [
    { value: 'ensaladas', label: '🥗 Ensalada', icon: '🥗' },
    { value: 'batidos', label: '🥤 Batido', icon: '🥤' },
    { value: 'proteinas', label: '💪 Proteína', icon: '💪' },
    { value: 'suplementos', label: '💊 Suplemento', icon: '💊' },
    { value: 'bebidas', label: '🧃 Bebida', icon: '🧃' },
    { value: 'snacks', label: '🍎 Snack', icon: '🍎' }
  ];

  // Cargar datos del especial y ingredientes disponibles
  useEffect(() => {
    if (especial) {
      console.log('Especial recibido para editar:', especial);

      // Inicializar el formulario con los datos del especial existente
      setFormData({
        nombre: especial.nombre || '',
        precio: especial.precio ? especial.precio.toString() : '',
        categoria: especial.categoria || 'ensaladas', // NUEVO CAMPO
        activo: especial.activo ? 'true' : 'false'
      });

      // Inicializar los ingredientes desde el string separado por comas
      const ingredientesArray = especial.ingredientes 
        ? especial.ingredientes.split(',').map(ing => ing.trim()).filter(ing => ing)
        : [];
      
      // Agregar un campo vacío al final para que se pueda agregar más ingredientes
      setIngredientes([...ingredientesArray, '']);
    }
    
    fetchIngredientesDisponibles();
  }, [especial]);

  // Cargar ingredientes desde el backend
  const fetchIngredientesDisponibles = async () => {
    try {
      setLoadingIngredientes(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://127.0.0.1:5000/ingredientes/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Filtrar solo ingredientes activos y mapear a un array de nombres
        const ingredientesActivos = data
          .filter(ing => ing.activo)
          .map(ing => ing.nombre)
          .sort(); // Ordenar alfabéticamente
        
        setIngredientesDisponibles(ingredientesActivos);
      } else {
        console.error('Error al obtener ingredientes:', response.status);
        // Si hay error, usar lista básica como fallback
        setIngredientesDisponibles([
          'Limon',
          'Chile en Polvo',
          'Sal',
          'Gomita Picante',
          'Gomita Dulce',
          'Gomitas Aciditas',
          'Chamoy',
          'salsa',
          'cacahuate',
          'Miguelito',
        ]);
      }
    } catch (error) {
      console.error('Error de conexión al obtener ingredientes:', error);
      setIngredientesDisponibles([
        'Limon',
        'Chile en Polvo',
        'Sal',
        'Gomita Picante',
        'Gomita Dulce',
        'Gomitas Aciditas',
        'Chamoy',
        'salsa',
        'cacahuate',
        'Miguelito',
      ]);
    } finally {
      setLoadingIngredientes(false);
    }
  };

  // Efecto para agregar automáticamente un nuevo select cuando se selecciona un ingrediente
  useEffect(() => {
    const ultimoIngrediente = ingredientes[ingredientes.length - 1];
    // Si el último ingrediente tiene un valor seleccionado
    if (ultimoIngrediente !== '') {
      setIngredientes(prev => [...prev, '']);
    }
  }, [ingredientes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    // Limpiar mensaje de éxito cuando el usuario modifique algún campo
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleIngredienteChange = (index, value) => {
    const newIngredientes = [...ingredientes];
    newIngredientes[index] = value;
    setIngredientes(newIngredientes);
    
    // Limpiar error de ingredientes si existe
    if (errors.ingredientes) {
      setErrors(prev => ({
        ...prev,
        ingredientes: ''
      }));
    }
  };

  const eliminarIngrediente = (index) => {
    if (ingredientes.length > 1) {
      const newIngredientes = ingredientes.filter((_, i) => i !== index);
      setIngredientes(newIngredientes);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del especial es obligatorio';
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar que al menos un ingrediente esté seleccionado
    const ingredientesSeleccionados = ingredientes.filter(ing => ing !== '');
    if (ingredientesSeleccionados.length === 0) {
      newErrors.ingredientes = 'Debe seleccionar al menos un ingrediente';
    }

    if (!formData.precio) {
      newErrors.precio = 'El precio es obligatorio';
    } else {
      const precio = parseFloat(formData.precio);
      if (isNaN(precio) || precio <= 0) {
        newErrors.precio = 'El precio debe ser un número mayor a 0';
      }
    }

    // Validar categoría
    if (!formData.categoria) {
      newErrors.categoria = 'Debe seleccionar una categoría';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Convertir array de ingredientes a string separado por comas
      const ingredientesString = ingredientes
        .filter(ing => ing !== '')
        .join(', ');

      const especialData = {
        nombre: formData.nombre.trim(),
        ingredientes: ingredientesString,
        precio: parseFloat(formData.precio),
        categoria: formData.categoria, // NUEVO CAMPO
        activo: formData.activo === 'true'
      };

      console.log('Actualizando especial ID:', especial.id);
      console.log('Enviando datos del especial:', especialData);

      const response = await fetch(`http://127.0.0.1:5000/especiales/${especial.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(especialData)
      });

      console.log('Respuesta status:', response.status);
      
      const responseText = await response.text();
      console.log('Respuesta texto:', responseText);

      if (response.ok) {
        try {
          const result = JSON.parse(responseText);
          // Mostrar mensaje de éxito
          setSuccessMessage('El especial fue actualizado exitosamente');
          
          // Esperar 2 segundos antes de cerrar el modal y actualizar la lista
          setTimeout(() => {
            if (onEspecialUpdated) {
              onEspecialUpdated(result.especial);
            }
            onClose();
          }, 2000);
          
        } catch (parseError) {
          console.error('Error parseando JSON:', parseError);
          setSuccessMessage('Especial actualizado exitosamente');
          setTimeout(() => {
            onClose();
            if (onEspecialUpdated) {
              onEspecialUpdated();
            }
          }, 2000);
        }
      } else {
        let errorMsg = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMsg = errorData.msg || errorMsg;
        } catch (e) {
          errorMsg = responseText || errorMsg;
        }
        setErrors({ general: errorMsg });
      }

    } catch (error) {
      console.error('Error de conexión:', error);
      setErrors({ general: 'Error de conexión al actualizar especial' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className={`edit-especial-form ${darkMode ? 'edit-especial-form-dark-mode' : ''}`}>
      <form className="edit-especial-form-form" onSubmit={handleSubmit}>
        
        {/* Mensaje de éxito */}
        {successMessage && (
          <div className="edit-especial-success-message">
            {successMessage}
          </div>
        )}

        {/* Mensaje de error general */}
        {errors.general && (
          <div className="edit-especial-error-message-box">
            {errors.general}
          </div>
        )}

        {/* Nombre del especial */}
        <div className="edit-especial-form-group">
          <label htmlFor="edit-especial-nombre">Nombre del especial *</label>
          <input
            type="text"
            id="edit-especial-nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className={`edit-especial-input ${errors.nombre ? 'edit-especial-input-error' : ''}`}
            placeholder="Ej: Especial de la Casa, Combo Familiar, etc."
            maxLength="100"
            disabled={loading || successMessage}
          />
          {errors.nombre && <span className="edit-especial-error-message">{errors.nombre}</span>}
        </div>

        {/* Categoría - NUEVO CAMPO */}
        <div className="edit-especial-form-group">
          <label htmlFor="edit-especial-categoria">Categoría *</label>
          <select
            id="edit-especial-categoria"
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            className={`edit-especial-select ${errors.categoria ? 'edit-especial-input-error' : ''}`}
            disabled={loading || successMessage}
          >
            {categorias.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
          {errors.categoria && <span className="edit-especial-error-message">{errors.categoria}</span>}
        </div>

        {/* Ingredientes - Selects dinámicos automáticos */}
        <div className="edit-especial-form-group">
          <label>
            Ingredientes *
            {loadingIngredientes && (
              <span className="edit-especial-loading-text"> (Cargando ingredientes...)</span>
            )}
          </label>
          <div className="edit-especial-ingredientes-container">
            {loadingIngredientes ? (
              <div className="edit-especial-loading-ingredientes">
                <div className="edit-especial-spinner-small"></div>
                <span className="edit-especial-loading-text">Cargando lista de ingredientes...</span>
              </div>
            ) : (
              <>
                {ingredientes.map((ingrediente, index) => (
                  <div key={index} className="edit-especial-ingrediente-row">
                    <select
                      value={ingrediente}
                      onChange={(e) => handleIngredienteChange(index, e.target.value)}
                      className={`edit-especial-select ${errors.ingredientes && index === 0 ? 'edit-especial-input-error' : ''}`}
                      disabled={loadingIngredientes || loading || successMessage}
                    >
                      <option value="">Selecciona un ingrediente</option>
                      {ingredientesDisponibles.map((ing, i) => (
                        <option 
                          key={i} 
                          value={ing}
                          disabled={ingredientes.includes(ing) && ingrediente !== ing}
                        >
                          {ing}
                        </option>
                      ))}
                    </select>
                    {ingredientes.length > 1 && (
                      <button
                        type="button"
                        className="edit-especial-remove-ingrediente-btn"
                        onClick={() => eliminarIngrediente(index)}
                        title="Eliminar ingrediente"
                        disabled={loadingIngredientes || loading || successMessage}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                
                {errors.ingredientes && (
                  <span className="edit-especial-error-message">{errors.ingredientes}</span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Precio y Estado */}
        <div className="edit-especial-row">
          <div className="edit-especial-price-status-fields">
            <div className="edit-especial-form-group">
              <label htmlFor="edit-especial-precio">Precio ($) *</label>
              <input
                type="number"
                id="edit-especial-precio"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                className={`edit-especial-input ${errors.precio ? 'edit-especial-input-error' : ''}`}
                placeholder="0.00"
                min="0"
                step="0.01"
                disabled={loading || successMessage}
              />
              {errors.precio && <span className="edit-especial-error-message">{errors.precio}</span>}
            </div>

            <div className="edit-especial-form-group">
              <label htmlFor="edit-especial-activo">Estado *</label>
              <select
                id="edit-especial-activo"
                name="activo"
                value={formData.activo}
                onChange={handleChange}
                className="edit-especial-select"
                disabled={loading || successMessage}
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="edit-especial-form-actions">
          <button 
            type="button" 
            className="edit-especial-btn-cancel"
            onClick={handleCancel}
            disabled={loading || loadingIngredientes}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="edit-especial-btn-submit"
            disabled={loading || loadingIngredientes || successMessage}
          >
            {loading ? (
              <>
                <span className="edit-especial-spinner"></span>
                Actualizando...
              </>
            ) : successMessage ? 'Actualizado' : 'Actualizar Especial'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEspecialForm;