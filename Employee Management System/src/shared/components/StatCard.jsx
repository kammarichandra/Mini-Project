function StatCard({ title, value, icon, change, changeType, color }) {
  return (
    <div className="stat-card" style={{ borderTop: `4px solid ${color || "#3b82f6"}` }}>
      <div className="stat-card-header">
        <div>
          <span className="stat-title">{title}</span>
          <h2 className="stat-value">{value}</h2>
        </div>
        <div className="stat-icon" style={{ backgroundColor: `${color || "#3b82f6"}15` }}>
          {icon}
        </div>
      </div>
      {change && (
        <div className="stat-footer">
          <span className={`stat-change ${changeType === "negative" ? "decrease" : "increase"}`}>
            {changeType === "negative" ? "▼" : "▲"} {change}
          </span>
          <span className="stat-period">vs last month</span>
        </div>
      )}
    </div>
  );
}

export default StatCard;

