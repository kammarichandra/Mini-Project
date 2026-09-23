function PageSurface({ title, subtitle, icon, stats, children, actionLabel, onAction }) {
  return (
    <div className="workspace-page">
      <div className="workspace-heading">
        <div className="workspace-title-wrap">
          <div className="workspace-icon" aria-hidden="true">
            <i className={`fa-solid ${icon}`}></i>
          </div>
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
        </div>
        {actionLabel && <button className="workspace-action" type="button" onClick={onAction}>{actionLabel}</button>}
      </div>
yy
yh

      <div className="workspace-stats">
        {stats.map((stat) => (
          <div className="workspace-stat" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <small className={stat.tone || "positive"}>{stat.note}</small>
          </div>
        ))}
      </div>

      <div className="workspace-grid">
        {children}
      </div>
    </div>
  );
}

export default PageSurface;
