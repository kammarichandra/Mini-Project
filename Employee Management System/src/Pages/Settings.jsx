import PageSurface from "../Components/PageSurface";

function Settings() {
  return (
    <PageSurface
      title="Settings"
      subtitle="Keep your workspace preferences and account details up to date."
      icon="fa-gear"
      actionLabel="Save Changes"
      stats={[
        { label: "Profile completeness", value: "82%", note: "+12% this month" },
        { label: "Team members", value: "128", note: "Across 5 departments" },
        { label: "Notifications", value: "On", note: "Last checked today" },
        { label: "Security", value: "Good", note: "No issues detected" },
      ]}
    >
      <section className="workspace-panel workspace-panel-wide">
        <div className="panel-heading"><h2>Workspace preferences</h2><span>General</span></div>
        <label className="setting-row"><span>Company name</span><input defaultValue="TeamSync" /></label>
        <label className="setting-row"><span>Default timezone</span><select defaultValue="asia"><option value="asia">Asia / Kolkata</option><option value="utc">UTC</option></select></label>
        <label className="setting-row"><span>Weekly summary emails</span><input type="checkbox" defaultChecked /></label>
      </section>
      <section className="workspace-panel">
        <div className="panel-heading"><h2>Account</h2><span>Chandra</span></div>
        <div className="profile-summary"><div className="large-avatar">CS</div><div><strong>Chandra Shekar</strong><p>Administrator</p></div></div>
        <button className="panel-button">Change password</button>
      </section>
    </PageSurface>
  );
}

export default Settings