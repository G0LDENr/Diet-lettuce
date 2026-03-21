const RestoreConfirmModal = ({ show, onClose, onConfirm, backupName }) => {
  if (!show) return null;

  return (
    <div className="backup-modal-overlay-delete">
      <div className="backup-modal-content backup-confirm-modal">
        <h3>⚠️ Restaurar Base de Datos</h3>
        <p>¿Restaurar desde <strong>"{backupName}"</strong>?</p>
        <p className="backup-confirm-warning"><strong>ADVERTENCIA:</strong> Sobrescribirá la BD actual.</p>
        <div className="backup-confirm-actions">
          <button onClick={onClose}>Cancelar</button>
          <button onClick={onConfirm}>Sí, Restaurar</button>
        </div>
      </div>
    </div>
  );
};

export default RestoreConfirmModal;