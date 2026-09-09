function Loader({ onClose }) {
  return (
    <div className="loader-overlay">
      <div className="loader-box">
        <div
          className="spinner-border text-primary"
          role="status"
        >
          <span className="visually-hidden">
            Loading...
          </span>
        </div>

        <p className="mt-3 mb-0">Loading...</p>

        <button
          className="btn btn-sm btn-secondary mt-3"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default Loader;