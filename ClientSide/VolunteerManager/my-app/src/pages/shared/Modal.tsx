// panels/shared/Modal.tsx

export function Modal({
    title,
    onClose,
    children,
  }: {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
  }) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">{title}</h3>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
          <div className="modal-body">{children}</div>
        </div>
      </div>
    );
  }
  
  export function ConfirmDelete({
    label,
    onConfirm,
    onCancel,
  }: {
    label: string;
    onConfirm: () => void;
    onCancel: () => void;
  }) {
    return (
      <Modal title="Confirm Delete" onClose={onCancel}>
        <p className="confirm-text">
          Are you sure you want to delete <strong>{label}</strong>?
          <br />This action cannot be undone.
        </p>
        <div className="confirm-actions">
          <button className="btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </Modal>
    );
  }
  