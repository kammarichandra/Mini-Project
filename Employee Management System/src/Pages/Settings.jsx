import { useState } from "react";
import PageSurface from "../Components/PageSurface";

const settingsStorageKey = "employeeManagementDashboardSettings";
const defaultSettings = {
  companyName: "TeamSync",
  timezone: "asia",
  weeklySummary: true,
  displayName: "Chandra Shekar",
};

function getSavedSettings() {
  try {
    const savedSettings = JSON.parse(
      window.localStorage.getItem(settingsStorageKey) || "null"
    );

    return savedSettings && typeof savedSettings === "object"
      ? { ...defaultSettings, ...savedSettings }
      : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

function Settings() {
  const [settings, setSettings] = useState(getSavedSettings);
  const [saveMessage, setSaveMessage] = useState("");

  const updateSetting = (field, value) => {
    setSettings((current) => ({ ...current, [field]: value }));
    setSaveMessage("");
  };

  const saveSettings = () => {
    if (!settings.companyName.trim() || !settings.displayName.trim()) {
      setSaveMessage("Company name and display name are required.");
      return;
    }

    try {
      const nextSettings = {
        ...settings,
        companyName: settings.companyName.trim(),
        displayName: settings.displayName.trim(),
      };
      window.localStorage.setItem(settingsStorageKey, JSON.stringify(nextSettings));
      setSettings(nextSettings);
      setSaveMessage("Settings saved.");
    } catch {
      setSaveMessage("Unable to save settings in this browser.");
    }
  };

  return (
    <PageSurface
      title="Settings"
      subtitle="Keep your workspace preferences and account details up to date."
      icon="fa-gear"
      actionLabel="Save Changes"
      onAction={saveSettings}
      stats={[
        { label: "Profile completeness", value: "82%", note: "+12% this month" },
        { label: "Team members", value: "128", note: "Across 5 departments" },
        { label: "Notifications", value: settings.weeklySummary ? "On" : "Off", note: "Weekly summary emails" },
        { label: "Security", value: "Good", note: "No issues detected" },
      ]}
    >
      <section className="workspace-panel workspace-panel-wide">
        <div className="panel-heading"><h2>Workspace preferences</h2><span>General</span></div>
        <label className="setting-row"><span>Company name</span><input value={settings.companyName} onChange={(event) => updateSetting("companyName", event.target.value)} /></label>
        <label className="setting-row"><span>Default timezone</span><select value={settings.timezone} onChange={(event) => updateSetting("timezone", event.target.value)}><option value="asia">Asia / Kolkata</option><option value="utc">UTC</option></select></label>
        <label className="setting-row"><span>Weekly summary emails</span><input type="checkbox" checked={settings.weeklySummary} onChange={(event) => updateSetting("weeklySummary", event.target.checked)} /></label>
        {saveMessage && <p className="settings-feedback" role="status">{saveMessage}</p>}
      </section>
      <section className="workspace-panel">
        <div className="panel-heading"><h2>Account</h2><span>Administrator</span></div>
        <div className="profile-summary"><div className="large-avatar">{settings.displayName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</div><div><strong>{settings.displayName}</strong><p>Administrator</p></div></div>
        <label className="account-setting"><span>Display name</span><input value={settings.displayName} onChange={(event) => updateSetting("displayName", event.target.value)} /></label>
      </section>
    </PageSurface>
  );
}

export default Settings