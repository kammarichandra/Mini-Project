
import { useEffect, useState } from "react";
import Modal from "../Components/Common/Modal";
import PageSurface from "./PageSurface";

const initialEmployees = [
  {
    id: 101,
    name: "Ravi",
    department: "Development",
    status: "Active",
  },
  {
    id: 102,
    name: "Priya",
    department: "Testing",
    status: "Active",
  },
  {
    id: 103,
    name: "Arun",
    department: "HR",
    status: "Inactive",
  },
];

const initialActivities = [
  {
    id: 1,
    text: "Sarah Jenkins requested annual leave for next Monday",
    time: "10 mins ago",
    type: "leave",
  },
  {
    id: 2,
    text: "Alex Rivera joined as Senior Frontend Developer",
    time: "1 hour ago",
    type: "hire",
  },
  {
    id: 3,
    text: "Q3 Performance Reviews submitted for Design Team",
    time: "3 hours ago",
    type: "review",
  },
  {
    id: 4,
    text: "Michael Scott updated personal contact details",
    time: "Yesterday",
    type: "profile",
  },
];

const liveActivityTemplates = [
  "Priya Shah checked in for the day",
  "Jordan Lee updated their emergency contact",
  "The Engineering team completed its daily stand-up",
  "Olivia Martin submitted a remote-work request",
];

function Dashboard() {
  const [recentActivities, setRecentActivities] =
    useState(initialActivities);

  const [employees, setEmployees] =
    useState(initialEmployees);

  const [showModal, setShowModal] = useState(false);

  const [employeeName, setEmployeeName] = useState("");
  const [department, setDepartment] = useState("Development");

  // Live clock and activity feed
  useEffect(() => {
    const activityFeed = setInterval(() => {
      setRecentActivities((activities) => [
        {
          id: Date.now(),
          text:
            liveActivityTemplates[
              Math.floor(
                Math.random() * liveActivityTemplates.length
              )
            ],
          time: "Just now",
          type: "live",
        },
        ...activities,
      ].slice(0, 5));
    }, 10000);

    return () => {
      clearInterval(activityFeed);
    };
  }, []);

  // Add employee
  const handleSave = () => {
    if (!employeeName.trim()) {
      alert("Please enter employee name");
      return;
    }

    const newEmployee = {
      id: 100 + employees.length + 1,
      department: department,
      status: "Active",
    };

    setEmployees((prevEmployees) => [
      ...prevEmployees,
      newEmployee,
    ]);

    setRecentActivities((activities) => [
      {
        id: Date.now(),
        text: `${employeeName} was added as a new employee`,
        time: "Just now",
        type: "hire",
      },
      ...activities,
    ].slice(0, 5));

    setEmployeeName("");
    setDepartment("Development");
    setShowModal(false);
  };

  return (
    <PageSurface
      title="Dashboard"
      subtitle="Welcome back, Chandra. Here is your team at a glance."
      icon="fa-gauge-high"
      actionLabel="View reports"
      stats={[
        { label: "Total employees", value: employees.length, note: "+8.2% vs last month" },
        { label: "Active today", value: employees.filter((employee) => employee.status === "Active").length, note: "+2.1% this week" },
        { label: "On leave", value: "12", note: "6.2% of workforce", tone: "warning" },
        { label: "New hires", value: "8", note: "+15% this month" },
      ]}
    >
      <div className="dashboard-sections-grid">

        <div className="card activity-card">

          <div className="card-header">

            <h3>Recent Activities</h3>

          </div>

          <div className="activity-list">
            {recentActivities.slice(0, 4).map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-dot"></div>
                <div className="activity-content">
                  <p className="activity-text">{activity.text}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card attendance-card">

          <div className="card-header">

            <h3>Employee Attendance</h3>

          </div>

          <div className="attendance-content">
            <div className="attendance-ring"><strong>87%</strong><span>Present</span></div>
            <div className="attendance-legend">
              <span><i className="present-dot"></i>Present <b>112</b></span>
              <span><i className="leave-dot"></i>On Leave <b>8</b></span>
              <span><i className="absent-dot"></i>Absent <b>8</b></span>
            </div>
          </div>

        </div>

      </div>


      <div className="card monthly-card">

        <div className="card-header">

          <div>
            <h3>Monthly Overview</h3>
          </div>

        </div>

        <div className="monthly-chart" aria-label="Monthly employee overview">
          {[32, 48, 40, 70, 56, 80, 62, 92, 74, 90, 82, 94].map((height, index) => (
            <div className="chart-column" key={index}>
              <div className={`chart-bar chart-color-${index % 3}`} style={{ height: `${height}%` }}></div>
              <span>{["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][index]}</span>
            </div>
          ))}
        </div>

      </div>


      <Modal
        show={showModal}
        title="Add Employee"
        onClose={() => setShowModal(false)}
        onSave={handleSave}
      >

        <div className="mb-3">

          <label className="form-label">
            Employee Name
          </label>

          <input
            type="text"
            className="form-control"
            placeholder="Enter employee name"
            value={employeeName}
            onChange={(e) =>
              setEmployeeName(e.target.value)
            }
          />

        </div>


        <div className="mb-3">

          <label className="form-label">
            Department
          </label>

          <select
            className="form-select"
            value={department}
            onChange={(e) =>
              setDepartment(e.target.value)
            }
          >

            <option value="Development">
              Development
            </option>

            <option value="Testing">
              Testing
            </option>

            <option value="HR">
              HR
            </option>

            <option value="Management">
              Management
            </option>

            <option value="Design">
              Design
            </option>

          </select>

        </div>

      </Modal>

    </PageSurface>
  );
}

export default Dashboard;

