import React, { useState, useEffect } from 'react';
import { useConfig } from '../../context/config';
import '../../css/Especiales/create-especial.css';

const CreateEspecialForm = ({ onClose, onEspecialCreated }) => {
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
    { value: 'ensaladas', label: 'Ensalada'},
    { value: 'batidos', label: 'Batido'},
    { value: 'proteinas', label: ' Proteína'},
    { value: 'suplementos', label: ' Suplemento'},
    { value: 'bebidas', label: ' Bebida'},
  ];

  // Cargar ingredientes desde el backend
  useEffect(() => {
    const fetchIngredientes = async () => {
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

    fetchIngredientes();
  }, []);

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

    // Validar categoría (aunque tiene valor por defecto)
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

      console.log('Enviando datos del especial:', especialData);

      const response = await fetch('http://127.0.0.1:5000/especiales/', {
        method: 'POST',
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
          // Mostrar mensaje de éxito en lugar de alert
          setSuccessMessage('Especial creado exitosamente');
          
          // Limpiar el formulario
          setFormData({
            nombre: '',
            precio: '',
            categoria: 'ensaladas',
            activo: 'true'
          });
          setIngredientes(['']);
          
          // Esperar 2 segundos antes de cerrar el modal y actualizar la lista
          setTimeout(() => {
            if (onEspecialCreated) {
              onEspecialCreated(result.especial);
            }
            onClose();
          }, 2000);
          
        } catch (parseError) {
          console.error('Error parseando JSON:', parseError);
          setSuccessMessage('Especial creado exitosamente');
          setTimeout(() => {
            onClose();
            if (onEspecialCreated) {
              onEspecialCreated();
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
      setErrors({ general: 'Error de conexión al crear especial' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className={`create-especial-form ${darkMode ? 'create-especial-form-dark-mode' : ''}`}>
      <form className="create-especial-form-form" onSubmit={handleSubmit}>
        
        {/* Mensaje de éxito */}
        {successMessage && (
          <div className="create-especial-success-message">
            {successMessage}
          </div>
        )}

        {/* Mensaje de error general */}
        {errors.general && (
          <div className="create-especial-error-message-box">
            {errors.general}
          </div>
        )}

        {/* Nombre del especial */}
        <div className="create-especial-form-group">
          <label htmlFor="create-especial-nombre">Nombre del especial *</label>
          <input
            type="text"
            id="create-especial-nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className={`create-especial-input ${errors.nombre ? 'create-especial-input-error' : ''}`}
            placeholder="Ej: Especial de la Casa, Combo Familiar, etc."
            maxLength="100"
            disabled={loading || successMessage}
          />
          {errors.nombre && <span className="create-especial-error-message">{errors.nombre}</span>}
        </div>

        {/* Categoría - NUEVO CAMPO */}
        <div className="create-especial-form-group">
          <label htmlFor="create-especial-categoria">Categoría *</label>
          <select
            id="create-especial-categoria"
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            className={`create-especial-select ${errors.categoria ? 'create-especial-input-error' : ''}`}
            disabled={loading || successMessage}
          >
            {categorias.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
          {errors.categoria && <span className="create-especial-error-message">{errors.categoria}</span>}
        </div>

        {/* Ingredientes - Selects dinámicos automáticos */}
        <div className="create-especial-form-group">
          <label>
            Ingredientes *
            {loadingIngredientes && (
              <span className="create-especial-loading-text"> (Cargando ingredientes...)</span>
            )}
          </label>
          <div className="create-especial-ingredientes-container">
            {loadingIngredientes ? (
              <div className="create-especial-loading-ingredientes">
                <div className="create-especial-spinner-small"></div>
                <span className="create-especial-loading-text">Cargando lista de ingredientes...</span>
              </div>
            ) : (
              <>
                {ingredientes.map((ingrediente, index) => (
                  <div key={index} className="create-especial-ingrediente-row">
                    <select
                      value={ingrediente}
                      onChange={(e) => handleIngredienteChange(index, e.target.value)}
                      className={`create-especial-select ${errors.ingredientes && index === 0 ? 'create-especial-input-error' : ''}`}
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
                        className="create-especial-remove-ingrediente-btn"
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
                  <span className="create-especial-error-message">{errors.ingredientes}</span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Precio y Estado */}
        <div className="create-especial-row">
          <div className="create-especial-price-status-fields">
            <div className="create-especial-form-group">
              <label htmlFor="create-especial-precio">Precio ($) *</label>
              <input
                type="number"
                id="create-especial-precio"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                className={`create-especial-input ${errors.precio ? 'create-especial-input-error' : ''}`}
                placeholder="0.00"
                min="0"
                step="0.01"
                disabled={loading || successMessage}
              />
              {errors.precio && <span className="create-especial-error-message">{errors.precio}</span>}
            </div>

            <div className="create-especial-form-group">
              <label htmlFor="create-especial-activo">Estado *</label>
              <select
                id="create-especial-activo"
                name="activo"
                value={formData.activo}
                onChange={handleChange}
                className="create-especial-select"
                disabled={loading || successMessage}
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="create-especial-form-actions">
          <button 
            type="button" 
            className="create-especial-btn-cancel"
            onClick={handleCancel}
            disabled={loading || loadingIngredientes}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="create-especial-btn-submit"
            disabled={loading || loadingIngredientes || successMessage}
          >
            {loading ? (
              <>
                <span className="create-especial-spinner"></span>
                Creando...
              </>
            ) : successMessage ? 'Creado' : 'Crear Especial'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEspecialForm;