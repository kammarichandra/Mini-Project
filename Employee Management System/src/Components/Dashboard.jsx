import { useEffect, useState } from "react";
import StatCard from "./StatCard";

const initialActivities = [
  { id: 1, text: "Sarah Jenkins requested annual leave for next Monday", time: "10 mins ago", type: "leave" },
  { id: 2, text: "Alex Rivera joined as Senior Frontend Developer", time: "1 hour ago", type: "hire" },
  { id: 3, text: "Q3 Performance Reviews submitted for Design Team", time: "3 hours ago", type: "review" },
  { id: 4, text: "Michael Scott updated personal contact details", time: "Yesterday", type: "profile" },
];

const liveActivityTemplates = [
  "Priya Shah checked in for the day",
  "Jordan Lee updated their emergency contact",
  "The Engineering team completed its daily stand-up",
  "Olivia Martin submitted a remote-work request",
];

function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [recentActivities, setRecentActivities] = useState(initialActivities);

  useEffect(() => {
    const clock = setInterval(() => setCurrentTime(new Date()), 1000);
    const activityFeed = setInterval(() => {
      setRecentActivities((activities) => [
        {
          id: Date.now(),
          text: liveActivityTemplates[Math.floor(Math.random() * liveActivityTemplates.length)],
          time: "Just now",
          type: "live",
        },
        ...activities,
      ].slice(0, 5));
    }, 10000);

    return () => {
      clearInterval(clock);
      clearInterval(activityFeed);
    };
  }, []);

  // Statistics data showcasing props passed to StatCard
  const stats = [
    {
      title: "Total Employees",
      value: "154",
      icon: "👥",
      change: "+8.2%",
      changeType: "positive",
      color: "#2563eb",
    },
    {
      title: "Active Today",
      value: "142",
      icon: "✅",
      change: "+2.1%",
      changeType: "positive",
      color: "#16a34a",
    },
    {
      title: "On Leave",
      value: "12",
      icon: "🏖️",
      change: "-3.4%",
      changeType: "negative",
      color: "#f59e0b",
    },
    {
      title: "New Hires (Month)",
      value: "8",
      icon: "🎉",
      change: "+15%",
      changeType: "positive",
      color: "#8b5cf6",
    },
  ];

  const departmentOverview = [
    { name: "Engineering", count: 68, percentage: 44, color: "#2563eb" },
    { name: "Sales & Marketing", count: 34, percentage: 22, color: "#16a34a" },
    { name: "Human Resources", count: 18, percentage: 12, color: "#f59e0b" },
    { name: "Design & UX", count: 16, percentage: 10, color: "#8b5cf6" },
    { name: "Finance & Operations", count: 18, percentage: 12, color: "#ec4899" },
  ];

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="dashboard-header">
        <div>
          <h2>Dashboard Overview</h2>
          <p className="subtitle">Welcome back! Here's what is happening with your team today.</p>
        </div>
        <div className="header-actions">
          <span className="live-clock" aria-live="polite">
            <span className="live-indicator" />
            Live {currentTime.toLocaleTimeString()}
          </span>
          <button className="primary-btn">+ Add Employee</button>
        </div>
      </div>

      {/* Stats Cards Grid - Demonstrating Props */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            change={stat.change}
            changeType={stat.changeType}
            color={stat.color}
          />
        ))}
      </div>

      {/* Detailed Overview Section */}
      <div className="dashboard-sections-grid">
        {/* Department Distribution */}
        <div className="card department-card">
          <div className="card-header">
            <h3>Department Breakdown</h3>
            <span className="badge">5 Departments</span>
          </div>
          <div className="department-list">
            {departmentOverview.map((dept, index) => (
              <div key={index} className="department-item">
                <div className="department-info">
                  <span className="dept-name">{dept.name}</span>
                  <span className="dept-count">{dept.count} members ({dept.percentage}%)</span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${dept.percentage}%`,
                      backgroundColor: dept.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card activity-card">
          <div className="card-header">
            <h3>Recent Activities</h3>
            <span className="badge badge-light">Real-time</span>
          </div>
          <div className="activity-list">
            {recentActivities.map((act) => (
              <div key={act.id} className="activity-item">
                <div className="activity-dot" />
                <div className="activity-content">
                  <p className="activity-text">{act.text}</p>
                  <span className="activity-time">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

