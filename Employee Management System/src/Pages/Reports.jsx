import PageSurface from "../Components/PageSurface";

function Reports() {
  return (
    <PageSurface title="Reports" subtitle="Turn workforce data into clear, shareable decisions." icon="fa-chart-column" actionLabel="Generate Report" stats={[
      { label: "Reports this month", value: "24", note: "+6 generated" },
      { label: "Scheduled reports", value: "8", note: "Next run tomorrow" },
      { label: "Shared with team", value: "18", note: "Across 4 groups" },
      { label: "Data freshness", value: "Live", note: "Updated just now" },
    ]}>
      <section className="workspace-panel workspace-panel-wide"><div className="panel-heading"><h2>Report library</h2><span>Recent</span></div><div className="report-list">{[["Monthly workforce overview", "PDF · Generated today"], ["Attendance exceptions", "XLSX · Generated yesterday"], ["Payroll cost analysis", "PDF · Generated 18 Sep"]].map(([name, detail]) => <div className="report-row" key={name}><div className="report-icon"><i className="fa-regular fa-file-lines"></i></div><div><strong>{name}</strong><p>{detail}</p></div><button className="panel-button">Open</button></div>)}</div></section>
      <section className="workspace-panel"><div className="panel-heading"><h2>Quick export</h2></div><p className="panel-note">Choose a reporting area to create a fresh snapshot.</p><button className="export-option">Employee directory <i className="fa-solid fa-arrow-right"></i></button><button className="export-option">Attendance summary <i className="fa-solid fa-arrow-right"></i></button><button className="export-option">Payroll costs <i className="fa-solid fa-arrow-right"></i></button></section>
    </PageSurface>
  )
}

export default Reports