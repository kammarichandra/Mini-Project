import { useState } from "react";
import PageSurface from "../Components/PageSurface";
import { useTheme } from "../Components/useTheme";
import { getCurrentUser, normalizeRole } from "../utils/auth";
import { getEmployeesFromStorage } from "../utils/employees";

const settingsStorageKey = "employeeManagementDashboardSettings";
const employeeSettingsStoragePrefix = "employeeManagementEmployeeSettings";
const defaultSettings = {
  companyName: "TeamSync",
  timezone: "asia",
  weeklySummary: true,
  attendanceAlerts: true,
  leaveAlerts: true,
  displayName: "Chandra Shekar",
};
const employeeDefaultSettings = {
  weeklySummary: true,
  attendanceAlerts: true,
  leaveAlerts: true,
};

function getSavedSettings(storageKey, defaults) {
  try {
    const savedSettings = JSON.parse(
      window.localStorage.getItem(storageKey) || "null"
    );

    return savedSettings && typeof savedSettings === "object"
      ? { ...defaults, ...savedSettings }
      : defaults;
  } catch {
    return defaults;
  }
}

function Settings() {
  const currentUser = getCurrentUser();
  const isEmployee = normalizeRole(currentUser?.role) === "Employee";
  const employee = isEmployee
    ? getEmployeesFromStorage().find(
        (record) =>
          record.email.toLowerCase() === currentUser?.email?.toLowerCase()
      )
    : null;
  const activeSettingsKey = isEmployee
    ? `${employeeSettingsStoragePrefix}:${currentUser?.email?.toLowerCase() || "unknown"}`
    : settingsStorageKey;
  const [settings, setSettings] = useState(() =>
    getSavedSettings(
      activeSettingsKey,
      isEmployee ? employeeDefaultSettings : defaultSettings
    )
  );
  const [saveMessage, setSaveMessage] = useState("");
  const { theme, setTheme } = useTheme();
  const [themeMessage, setThemeMessage] = useState("");

  const updateSetting = (field, value) => {
    setSettings((current) => ({ ...current, [field]: value }));
    setSaveMessage("");
  };

  const saveSettings = () => {
    if (!isEmployee && (!settings.companyName.trim() || !settings.displayName.trim())) {
      setSaveMessage("Company name and display name are required.");
      return;
    }

    try {
      const nextSettings = isEmployee
        ? settings
        : {
            ...settings,
            companyName: settings.companyName.trim(),
            displayName: settings.displayName.trim(),
          };
      window.localStorage.setItem(activeSettingsKey, JSON.stringify(nextSettings));
      setSettings(nextSettings);
      setSaveMessage("Settings saved.");
    } catch {
      setSaveMessage("Unable to save settings in this browser.");
    }
  };

  const handleThemeChange = (nextTheme) => {
    const saved = setTheme(nextTheme);
    setThemeMessage(saved ? "" : "Theme changed, but could not be saved in this browser.");
  };

  if (isEmployee) {
    const displayName = employee?.name || currentUser?.fullName || "Employee";
    const initials = displayName
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return (
      <PageSurface
        title="Settings"
        subtitle="Manage your account details, appearance, and personal notifications."
        icon="fa-gear"
        actionLabel="Save Preferences"
        onAction={saveSettings}
        stats={[
          { label: "Role", value: "Employee", note: "Account access" },
          { label: "Department", value: employee?.department || "Not assigned", note: employee?.id ? `Employee ID ${employee.id}` : "Contact HR to link your profile" },
          { label: "Notifications", value: settings.weeklySummary || settings.attendanceAlerts || settings.leaveAlerts ? "On" : "Off", note: "Personal preferences" },
          { label: "Appearance", value: theme === "dark" ? "Dark" : "Light", note: "Workspace theme" },
        ]}
      >
        <section className="workspace-panel">
          <div className="panel-heading"><h2>My account</h2><span>Employee profile</span></div>
          <div className="profile-summary">
            <div className="large-avatar">{initials}</div>
            <div><strong>{displayName}</strong><p>{currentUser?.email || "No email on file"}</p></div>
          </div>
          <div className="setting-row"><span>Role</span><strong>Employee</strong></div>
          <div className="setting-row"><span>Department</span><strong>{employee?.department || "Not assigned"}</strong></div>
          <div className="setting-row"><span>Employee ID</span><strong>{employee?.id || "Not linked"}</strong></div>
        </section>

        <section className="workspace-panel workspace-panel-wide">
          <div className="panel-heading"><h2>Personal preferences</h2><span>Only visible to you</span></div>
          <div className="theme-setting">
            <div className="theme-setting-copy">
              <strong>Appearance</strong>
              <span>Choose a light or dark workspace theme.</span>
            </div>
            <div className="theme-options" role="group" aria-label="Workspace theme">
              <button
                className={`theme-option${theme === "light" ? " selected" : ""}`}
                type="button"
                aria-pressed={theme === "light"}
                onClick={() => handleThemeChange("light")}
              >
                <i className="fa-solid fa-sun" aria-hidden="true"></i>
                Light
              </button>
              <button
                className={`theme-option${theme === "dark" ? " selected" : ""}`}
                type="button"
                aria-pressed={theme === "dark"}
                onClick={() => handleThemeChange("dark")}
              >
                <i className="fa-solid fa-moon" aria-hidden="true"></i>
                Dark
              </button>
            </div>
          </div>
          {themeMessage && <p className="settings-feedback settings-error" role="status">{themeMessage}</p>}
          <label className="setting-row"><span>Weekly summary emails</span><input type="checkbox" checked={settings.weeklySummary} onChange={(event) => updateSetting("weeklySummary", event.target.checked)} /></label>
          <label className="setting-row"><span>Attendance update emails</span><input type="checkbox" checked={settings.attendanceAlerts} onChange={(event) => updateSetting("attendanceAlerts", event.target.checked)} /></label>
          <label className="setting-row"><span>Leave request emails</span><input type="checkbox" checked={settings.leaveAlerts} onChange={(event) => updateSetting("leaveAlerts", event.target.checked)} /></label>
          {saveMessage && <p className="settings-feedback" role="status">{saveMessage}</p>}
        </section>
      </PageSurface>
    );
  }

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
        { label: "Notifications", value: settings.weeklySummary || settings.attendanceAlerts || settings.leaveAlerts ? "On" : "Off", note: "Email preferences" },
        { label: "Security", value: "Good", note: "No issues detected" },
      ]}
    >
      <section className="workspace-panel workspace-panel-wide">
        <div className="panel-heading"><h2>Workspace preferences</h2><span>General</span></div>
        <label className="setting-row"><span>Company name</span><input value={settings.companyName} onChange={(event) => updateSetting("companyName", event.target.value)} /></label>
        <label className="setting-row"><span>Default timezone</span><select value={settings.timezone} onChange={(event) => updateSetting("timezone", event.target.value)}><option value="asia">Asia / Kolkata</option><option value="utc">UTC</option></select></label>
        <div className="theme-setting">
          <div className="theme-setting-copy">
            <strong>Appearance</strong>
            <span>Choose a light or dark workspace theme.</span>
          </div>
          <div className="theme-options" role="group" aria-label="Workspace theme">
            <button
              className={`theme-option${theme === "light" ? " selected" : ""}`}
              type="button"
              aria-pressed={theme === "light"}
              onClick={() => handleThemeChange("light")}
            >
              <i className="fa-solid fa-sun" aria-hidden="true"></i>
              Light
            </button>
            <button
              className={`theme-option${theme === "dark" ? " selected" : ""}`}
              type="button"
              aria-pressed={theme === "dark"}
              onClick={() => handleThemeChange("dark")}
            >
              <i className="fa-solid fa-moon" aria-hidden="true"></i>
              Dark
            </button>
          </div>
        </div>
        {themeMessage && <p className="settings-feedback settings-error" role="status">{themeMessage}</p>}
        <label className="setting-row"><span>Weekly summary emails</span><input type="checkbox" checked={settings.weeklySummary} onChange={(event) => updateSetting("weeklySummary", event.target.checked)} /></label>
        <label className="setting-row"><span>Attendance update emails</span><input type="checkbox" checked={settings.attendanceAlerts} onChange={(event) => updateSetting("attendanceAlerts", event.target.checked)} /></label>
        <label className="setting-row"><span>Leave request emails</span><input type="checkbox" checked={settings.leaveAlerts} onChange={(event) => updateSetting("leaveAlerts", event.target.checked)} /></label>
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