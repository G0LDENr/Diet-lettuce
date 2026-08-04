// src/utils/actividadAdminUtils.js
import { 
  FaUsers, 
  FaBox, 
  FaHome, 
  FaSignOutAlt,
  FaUserPlus,
  FaUserEdit,
  FaUserMinus,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import { 
  HiClipboardList 
} from 'react-icons/hi';
import { 
  MdNotificationsActive 
} from 'react-icons/md';
import { 
  BsDatabaseFillGear 
} from 'react-icons/bs';

export const getActividadAdminIcon = (tipo, accion) => {
  const map = {
    'usuario': {
      'crear': { icon: FaUserPlus, label: 'Usuario creado' },
      'editar': { icon: FaUserEdit, label: 'Usuario editado' },
      'eliminar': { icon: FaUserMinus, label: 'Usuario eliminado' }
    },
    'suplemento': {
      'crear': { icon: FaPlus, label: 'Suplemento creado' },
      'editar': { icon: FaEdit, label: 'Suplemento editado' },
      'eliminar': { icon: FaTrash, label: 'Suplemento eliminado' },
      'activar': { icon: FaCheck, label: 'Suplemento activado' },
      'desactivar': { icon: FaTimes, label: 'Suplemento desactivado' }
    },
    'orden': {
      'crear': { icon: HiClipboardList, label: 'Orden creada' },
      'editar': { icon: HiClipboardList, label: 'Orden editada' },
      'eliminar': { icon: HiClipboardList, label: 'Orden eliminada' },
      'cambiar_estado': { icon: HiClipboardList, label: 'Estado cambiado' }
    },
    'notificacion': {
      'enviar': { icon: MdNotificationsActive, label: 'Notificación enviada' }
    },
    'respaldo': {
      'generar': { icon: BsDatabaseFillGear, label: 'Respaldo generado' }
    },
    'navegacion': {
      'acceder': { icon: FaHome, label: 'Navegación' }
    },
    'sesion': {
      'cerrar': { icon: FaSignOutAlt, label: 'Cerró sesión' }
    }
  };
  return map[tipo]?.[accion] || { icon: FaBox, label: 'Actividad' };
};