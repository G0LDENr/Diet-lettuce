// src/services/actividadAdminService.js

const STORAGE_KEY = 'admin_activities';
const MAX_ACTIVIDADES = 30;

// Obtener todas las actividades del admin
export const getActividadesAdmin = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error al obtener actividades del admin:', error);
    return [];
  }
};

// Guardar actividades del admin
export const guardarActividadesAdmin = (actividades) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actividades));
  } catch (error) {
    console.error('Error al guardar actividades del admin:', error);
  }
};

// Agregar una nueva actividad del admin
export const agregarActividadAdmin = (tipo, accion, descripcion, usuario = null) => {
  try {
    const actividades = getActividadesAdmin();
    const nuevaActividad = {
      id: Date.now(),
      tipo: tipo, // 'usuario', 'suplemento', 'orden', 'notificacion', 'respaldo', 'navegacion'
      accion: accion, // 'crear', 'editar', 'eliminar', 'activar', 'desactivar', 'cambiar_estado', 'enviar', 'generar', 'acceder'
      descripcion: descripcion,
      fecha: new Date().toISOString(),
      usuario: usuario || 'Administrador'
    };
    
    actividades.unshift(nuevaActividad);
    if (actividades.length > MAX_ACTIVIDADES) {
      actividades.pop();
    }
    
    guardarActividadesAdmin(actividades);
    return nuevaActividad;
  } catch (error) {
    console.error('Error al agregar actividad del admin:', error);
    return null;
  }
};

// Limpiar todas las actividades del admin
export const limpiarActividadesAdmin = () => {
  localStorage.removeItem(STORAGE_KEY);
};