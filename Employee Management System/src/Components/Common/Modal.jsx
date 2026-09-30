import React from "react";

function Modal({
  show,
  title,
  children,
  onClose,
  onSave,
  saveLabel = "Save",
  showSave = true,
}) {
  if (!show) return null;

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>

              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>

            <div className="modal-body">
              {children}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Close
              </button>

              {showSave && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onSave}
                >
                  {saveLabel}
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show"></div>
    </>
  );
}

export default Modal;