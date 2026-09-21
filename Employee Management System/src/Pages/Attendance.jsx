import PageSurface from "../Components/PageSurface";

function Attendance() {
  return (
    <PageSurface title="Attendance" subtitle="Monitor daily presence and attendance trends." icon="fa-calendar-check" actionLabel="Export Report" stats={[
      { label: "Present today", value: "112", note: "+5.2% vs yesterday" },
      { label: "On leave", value: "8", note: "6.2% of workforce", tone: "warning" },
      { label: "Late arrivals", value: "6", note: "-2.1% this week" },
      { label: "Attendance rate", value: "87%", note: "Healthy" },
    ]}>
      <section className="workspace-panel workspace-panel-wide"><div className="panel-heading"><h2>Today&apos;s attendance</h2><span>21 September 2026</span></div><div className="progress-summary"><strong>87%</strong><div><div className="wide-progress"><span style={{ width: "87%" }}></span></div><small>112 of 128 employees present</small></div></div><div className="mini-table"><div><b>Employee</b><b>Check-in</b><b>Status</b></div>{["Rahul Mehta", "Sneha Iyer", "Amit Kumar", "Neha Singh"].map((name, index) => <div key={name}><span>{name}</span><span>{index === 2 ? "--" : `09:${10 + index * 4}`}</span><em className={index === 2 ? "warning" : "positive"}>{index === 2 ? "On leave" : "Present"}</em></div>)}</div></section>
      <section className="workspace-panel"><div className="panel-heading"><h2>Weekly trend</h2></div><div className="trend-bars">{[72, 84, 78, 91, 87, 94, 87].map((height, index) => <div key={index}><span style={{ height: `${height}%` }}></span><small>{["M", "T", "W", "T", "F", "S", "S"][index]}</small></div>)}</div></section>
    </PageSurface>
  )
}

export default Attendance