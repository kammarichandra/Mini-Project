import PageSurface from "../Components/PageSurface";

function Leave_Managment() {
  return (
    <PageSurface title="Leave Management" subtitle="Review requests, balances, and upcoming time away." icon="fa-plane-departure" actionLabel="New Request" stats={[
      { label: "Pending requests", value: "12", note: "Needs review", tone: "warning" },
      { label: "Approved this month", value: "28", note: "+8.4% this month" },
      { label: "People on leave", value: "8", note: "Today" },
      { label: "Approval rate", value: "94%", note: "Last 30 days" },
    ]}>
      <section className="workspace-panel workspace-panel-wide">
        <div className="panel-heading">
          <h2>Leave requests</h2><span>12 pending</span>
        </div>

        <div className="request-list">
          {[["Priya Shah", "Annual leave", "22 Sep - 24 Sep", "Pending"], ["Arun Kumar", "Personal leave", "25 Sep", "Approved"], ["Meera Joshi", "Sick leave", "28 Sep - 29 Sep", "Pending"]].map((request) => <div className="request-row" key={request[0]}>
            <div className="large-avatar small-avatar">
              {request[0].split(" ").map((part) => part[0]).join("")}
            </div>
            <div>
              <strong>{request[0]}</strong>
              <p>{request[1]} · {request[2]}</p>
            </div>
            <em className={request[3] === "Pending" ? "warning" : "positive"}>{request[3]}</em></div>)}
        </div></section>
      <section className="workspace-panel">
        <div className="panel-heading">
          <h2>Leave balance</h2>
        </div>
        <div className="balance-ring">

          <strong>14</strong><span>days left</span>
        </div>
        <p className="panel-note">Your team has 82% of annual leave available.</p>
      </section>
    </PageSurface>
  )
}

export default Leave_Managment