const STORAGE_KEY = 'user_activities';
const MAX_ACTIVIDADES = 4;

// Obtener todas las actividades (para uso interno)
const getTodasActividades = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    return [];
  }
};

// Obtener solo las 3 actividades más recientes
export const getActividades = () => {
  try {
    const todas = getTodasActividades();
    return todas.slice(0, MAX_ACTIVIDADES);
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    return [];
  }
};

// Guardar actividades (solo las 3 más recientes)
export const guardarActividades = (actividades) => {
  try {
    const limitadas = actividades.slice(0, MAX_ACTIVIDADES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitadas));
  } catch (error) {
    console.error('Error al guardar actividades:', error);
  }
};

// Agregar una nueva actividad
export const agregarActividad = (tipo, accion, descripcion) => {
  try {
    const todas = getTodasActividades();
    const nuevaActividad = {
      id: Date.now(),
      tipo: tipo,
      accion: accion,
      descripcion: descripcion,
      fecha: new Date().toISOString()
    };
    
    todas.unshift(nuevaActividad);
    
    if (todas.length > MAX_ACTIVIDADES) {
      todas.length = MAX_ACTIVIDADES;
    }
    
    guardarActividades(todas);
    return nuevaActividad;
  } catch (error) {
    console.error('Error al agregar actividad:', error);
    return null;
  }
};

// Limpiar todas las actividades
export const limpiarActividades = () => {
  localStorage.removeItem(STORAGE_KEY);
};