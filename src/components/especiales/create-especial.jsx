import React, { useState, useEffect } from 'react';
import { useConfig } from '../../context/config';
import '../../css/Especiales/create-especial.css';

const CreateSuplementoForm = ({ onClose, onSuplementoCreated }) => {
  const { darkMode } = useConfig();
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: 'quemadores',
    presentacion: 'polvo',
    beneficios: '',
    modo_uso: '',
    stock: '0',
    activo: 'true'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Opciones de categorías
  const categorias = [
    { value: 'quemadores', label: 'Quemadores de Grasa' },
    { value: 'proteinas', label: 'Proteínas' },
    { value: 'fibras', label: 'Fibras y Digestivos' },
    { value: 'detox', label: 'Detox y Limpieza' },
    { value: 'termogenicos', label: 'Termogénicos' },
    { value: 'control_apetito', label: 'Control de Apetito' },
    { value: 'energeticos', label: 'Energéticos Naturales' },
    { value: 'vitaminas', label: 'Vitaminas y Minerales' }
  ];

  // Opciones de presentaciones
  const presentaciones = [
    { value: 'polvo', label: 'Polvo' },
    { value: 'capsulas', label: 'Cápsulas' },
    { value: 'tabletas', label: 'Tabletas' },
    { value: 'liquido', label: 'Líquido' },
    { value: 'gomitas', label: 'Gomitas' },
    { value: 'barritas', label: 'Barritas' }
  ];

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del suplemento es obligatorio';
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria';
    }

    if (!formData.precio) {
      newErrors.precio = 'El precio es obligatorio';
    } else {
      const precio = parseFloat(formData.precio);
      if (isNaN(precio) || precio <= 0) {
        newErrors.precio = 'El precio debe ser un número mayor a 0';
      }
    }

    // Validar stock
    const stock = parseInt(formData.stock);
    if (isNaN(stock) || stock < 0) {
      newErrors.stock = 'El stock debe ser un número mayor o igual a 0';
    }

    // Validar categoría
    if (!formData.categoria) {
      newErrors.categoria = 'Debe seleccionar una categoría';
    }

    // Validar presentación
    if (!formData.presentacion) {
      newErrors.presentacion = 'Debe seleccionar una presentación';
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

      const suplementoData = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        precio: parseFloat(formData.precio),
        categoria: formData.categoria,
        presentacion: formData.presentacion,
        beneficios: formData.beneficios.trim() || '',
        modo_uso: formData.modo_uso.trim() || '',
        stock: parseInt(formData.stock),
        activo: formData.activo === 'true'
      };

      console.log('Enviando datos del suplemento:', suplementoData);

      const response = await fetch('http://127.0.0.1:5000/suplementos/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(suplementoData)
      });

      console.log('Respuesta status:', response.status);
      
      const responseText = await response.text();
      console.log('Respuesta texto:', responseText);

      if (response.ok) {
        try {
          const result = JSON.parse(responseText);
          setSuccessMessage('Suplemento creado exitosamente');
          
          // Limpiar el formulario
          setFormData({
            nombre: '',
            descripcion: '',
            precio: '',
            categoria: 'quemadores',
            presentacion: 'polvo',
            beneficios: '',
            modo_uso: '',
            stock: '0',
            activo: 'true'
          });
          
          // Esperar 2 segundos antes de cerrar el modal y actualizar la lista
          setTimeout(() => {
            if (onSuplementoCreated) {
              onSuplementoCreated(result.suplemento);
            }
            onClose();
          }, 2000);
          
        } catch (parseError) {
          console.error('Error parseando JSON:', parseError);
          setSuccessMessage('Suplemento creado exitosamente');
          setTimeout(() => {
            onClose();
            if (onSuplementoCreated) {
              onSuplementoCreated();
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
      setErrors({ general: 'Error de conexión al crear suplemento' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className={`create-suplemento-form ${darkMode ? 'create-suplemento-form-dark-mode' : ''}`}>
      <form className="create-suplemento-form-form" onSubmit={handleSubmit}>
        
        {/* Mensaje de éxito */}
        {successMessage && (
          <div className="create-suplemento-success-message">
            {successMessage}
          </div>
        )}

        {/* Mensaje de error general */}
        {errors.general && (
          <div className="create-suplemento-error-message-box">
            {errors.general}
          </div>
        )}

        {/* Nombre del suplemento */}
        <div className="create-suplemento-form-group">
          <label htmlFor="create-suplemento-nombre">Nombre del suplemento *</label>
          <input
            type="text"
            id="create-suplemento-nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className={`create-suplemento-input ${errors.nombre ? 'create-suplemento-input-error' : ''}`}
            placeholder="Ej: Quemador de Grasa Extreme, Proteína Whey, etc."
            maxLength="100"
            disabled={loading || successMessage}
          />
          {errors.nombre && <span className="create-suplemento-error-message">{errors.nombre}</span>}
        </div>

        {/* Descripción */}
        <div className="create-suplemento-form-group">
          <label htmlFor="create-suplemento-descripcion">Descripción *</label>
          <textarea
            id="create-suplemento-descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            className={`create-suplemento-textarea ${errors.descripcion ? 'create-suplemento-input-error' : ''}`}
            placeholder="Describe el suplemento, sus características principales..."
            rows="3"
            maxLength="500"
            disabled={loading || successMessage}
          />
          {errors.descripcion && <span className="create-suplemento-error-message">{errors.descripcion}</span>}
        </div>

        {/* Fila: Categoría y Presentación */}
        <div className="create-suplemento-row">
          <div className="create-suplemento-price-status-fields">
            <div className="create-suplemento-form-group">
              <label htmlFor="create-suplemento-categoria">Categoría *</label>
              <select
                id="create-suplemento-categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className={`create-suplemento-select ${errors.categoria ? 'create-suplemento-input-error' : ''}`}
                disabled={loading || successMessage}
              >
                {categorias.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.categoria && <span className="create-suplemento-error-message">{errors.categoria}</span>}
            </div>

            <div className="create-suplemento-form-group">
              <label htmlFor="create-suplemento-presentacion">Presentación *</label>
              <select
                id="create-suplemento-presentacion"
                name="presentacion"
                value={formData.presentacion}
                onChange={handleChange}
                className={`create-suplemento-select ${errors.presentacion ? 'create-suplemento-input-error' : ''}`}
                disabled={loading || successMessage}
              >
                {presentaciones.map(pre => (
                  <option key={pre.value} value={pre.value}>
                    {pre.label}
                  </option>
                ))}
              </select>
              {errors.presentacion && <span className="create-suplemento-error-message">{errors.presentacion}</span>}
            </div>
          </div>
        </div>

        {/* Beneficios */}
        <div className="create-suplemento-form-group">
          <label htmlFor="create-suplemento-beneficios">Beneficios</label>
          <textarea
            id="create-suplemento-beneficios"
            name="beneficios"
            value={formData.beneficios}
            onChange={handleChange}
            className="create-suplemento-textarea"
            placeholder="Ej: Acelera el metabolismo, reduce el apetito, aumenta la energía..."
            rows="2"
            maxLength="500"
            disabled={loading || successMessage}
          />
        </div>

        {/* Modo de Uso */}
        <div className="create-suplemento-form-group">
          <label htmlFor="create-suplemento-modo-uso">Modo de Uso</label>
          <textarea
            id="create-suplemento-modo-uso"
            name="modo_uso"
            value={formData.modo_uso}
            onChange={handleChange}
            className="create-suplemento-textarea"
            placeholder="Ej: Tomar 2 cápsulas antes del desayuno, mezclar con agua, etc."
            rows="2"
            maxLength="500"
            disabled={loading || successMessage}
          />
        </div>

        {/* Fila: Precio, Stock y Estado */}
        <div className="create-suplemento-row">
          <div className="create-suplemento-price-status-fields">
            <div className="create-suplemento-form-group">
              <label htmlFor="create-suplemento-precio">Precio ($) *</label>
              <input
                type="number"
                id="create-suplemento-precio"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                className={`create-suplemento-input ${errors.precio ? 'create-suplemento-input-error' : ''}`}
                placeholder="0.00"
                min="0"
                step="0.01"
                disabled={loading || successMessage}
              />
              {errors.precio && <span className="create-suplemento-error-message">{errors.precio}</span>}
            </div>

            <div className="create-suplemento-form-group">
              <label htmlFor="create-suplemento-stock">Stock *</label>
              <input
                type="number"
                id="create-suplemento-stock"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className={`create-suplemento-input ${errors.stock ? 'create-suplemento-input-error' : ''}`}
                placeholder="0"
                min="0"
                step="1"
                disabled={loading || successMessage}
              />
              {errors.stock && <span className="create-suplemento-error-message">{errors.stock}</span>}
            </div>

            <div className="create-suplemento-form-group">
              <label htmlFor="create-suplemento-activo">Estado *</label>
              <select
                id="create-suplemento-activo"
                name="activo"
                value={formData.activo}
                onChange={handleChange}
                className="create-suplemento-select"
                disabled={loading || successMessage}
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="create-suplemento-form-actions">
          <button 
            type="button" 
            className="create-suplemento-btn-cancel"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="create-suplemento-btn-submit"
            disabled={loading || successMessage}
          >
            {loading ? (
              <>
                <span className="create-suplemento-spinner"></span>
                Creando...
              </>
            ) : successMessage ? 'Creado' : 'Crear Suplemento'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSuplementoForm;