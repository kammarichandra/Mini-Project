import PageSurface from "../Components/PageSurface";

function Performance() {
  return (
    <PageSurface title="Performance" subtitle="Keep reviews, goals, and team growth moving forward." icon="fa-arrow-trend-up" actionLabel="Start Review" stats={[
      { label: "Reviews completed", value: "86%", note: "+11% this quarter" },
      { label: "Goals on track", value: "74%", note: "Across all teams" },
      { label: "Needs attention", value: "9", note: "Review this week", tone: "warning" },
      { label: "Average score", value: "4.2", note: "Out of 5.0" },
    ]}>
      <section className="workspace-panel workspace-panel-wide"><div className="panel-heading"><h2>Team performance</h2><span>Q3 2026</span></div>{[["Engineering", 92], ["Marketing", 78], ["People & HR", 86], ["Finance", 71]].map(([name, value]) => <div className="metric-row" key={name}><div><strong>{name}</strong><span>{value}%</span></div><div className="wide-progress"><span style={{ width: `${value}%` }}></span></div></div>)}</section>
      <section className="workspace-panel"><div className="panel-heading"><h2>Upcoming reviews</h2></div><div className="review-list"><p><strong>Arun Kumar</strong><span>Tomorrow</span></p><p><strong>Sneha Iyer</strong><span>26 Sep</span></p><p><strong>Neha Singh</strong><span>30 Sep</span></p></div></section>
    </PageSurface>
  )
}

export default Performance