import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageSurface from "../Components/PageSurface";
import { getEmployeesFromStorage } from "../utils/employees";

const reviewStorageKey = "employeeManagementDashboardPerformanceReviews";
const emptyReview = {
  employeeId: "",
  score: "3",
  goalsStatus: "On track",
  notes: "",
};

function getSavedReviews() {
  try {
    const savedReviews = JSON.parse(
      window.localStorage.getItem(reviewStorageKey) || "[]"
    );
    return Array.isArray(savedReviews) ? savedReviews : [];
  } catch {
    return [];
  }
}

function getLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatReviewDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Performance() {
  const [employees] = useState(getEmployeesFromStorage);
  const [reviews, setReviews] = useState(getSavedReviews);
  const [showForm, setShowForm] = useState(false);
  const [reviewForm, setReviewForm] = useState(emptyReview);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    try {
      window.localStorage.setItem(reviewStorageKey, JSON.stringify(reviews));
    } catch {
      return;
    }
  }, [reviews]);

  const reviewsOnTrack = reviews.filter((review) => review.goalsStatus === "On track").length;
  const needsAttention = reviews.filter(
    (review) => review.goalsStatus === "Needs attention" || Number(review.score) <= 2
  ).length;
  const averageScore = reviews.length
    ? (reviews.reduce((total, review) => total + Number(review.score), 0) / reviews.length).toFixed(1)
    : "--";
  const latestReviewsByEmployee = [...reviews]
    .sort((first, second) => second.reviewDate.localeCompare(first.reviewDate))
    .reduce((latestReviews, review) => {
      const employeeId = String(review.employeeId);
      if (!latestReviews.has(employeeId)) latestReviews.set(employeeId, review);
      return latestReviews;
    }, new Map());

  const toggleReviewForm = () => {
    setShowForm((current) => !current);
    setReviewForm(emptyReview);
    setFormError("");
  };

  const submitReview = (event) => {
    event.preventDefault();
    const employee = employees.find(
      (currentEmployee) => String(currentEmployee.id) === reviewForm.employeeId
    );
    if (!employee) {
      setFormError("Select an employee from the directory.");
      return;
    }

    const review = {
      ...reviewForm,
      id: `review-${Date.now()}`,
      employeeId: employee.id,
      employeeName: employee.name,
      score: Number(reviewForm.score),
      notes: reviewForm.notes.trim(),
      reviewDate: getLocalDateKey(new Date()),
    };
    setReviews((current) => [review, ...current]);
    setReviewForm(emptyReview);
    setFormError("");
    setShowForm(false);
  };

  return (
    <PageSurface
      title="Performance"
      subtitle="Keep reviews, goals, and team growth moving forward."
      icon="fa-arrow-trend-up"
      actionLabel={showForm ? "Cancel Review" : "Start Review"}
      onAction={toggleReviewForm}
      stats={[
        { label: "Reviews recorded", value: reviews.length, note: "Saved reviews" },
        { label: "Goals on track", value: reviews.length ? `${Math.round((reviewsOnTrack / reviews.length) * 100)}%` : "--", note: `${reviewsOnTrack} of ${reviews.length} reviews` },
        { label: "Needs attention", value: needsAttention, note: "Reviews to follow up", tone: "warning" },
        { label: "Average score", value: averageScore, note: "Out of 5.0" },
      ]}
    >
      <section className="workspace-panel workspace-panel-wide">
        <div className="panel-heading"><h2>Team performance</h2><span>{employees.length} employees</span></div>
        {showForm && <form className="performance-review-form" onSubmit={submitReview}>
          <label><span>Employee</span>
            <select value={reviewForm.employeeId} onChange={(event) => setReviewForm((current) => ({ ...current, employeeId: event.target.value }))} required>
              <option value="">Select employee</option>
              {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name} · {employee.department}</option>)}
            </select>
          </label>
          <label><span>Score</span>
            <select value={reviewForm.score} onChange={(event) => setReviewForm((current) => ({ ...current, score: event.target.value }))}>
              {[1, 2, 3, 4, 5].map((score) => <option key={score} value={score}>{score} / 5</option>)}
            </select>
          </label>
          <label><span>Goals</span>
            <select value={reviewForm.goalsStatus} onChange={(event) => setReviewForm((current) => ({ ...current, goalsStatus: event.target.value }))}>
              <option>On track</option>
              <option>Needs attention</option>
            </select>
          </label>
          <label className="review-notes-field"><span>Notes</span>
            <textarea value={reviewForm.notes} onChange={(event) => setReviewForm((current) => ({ ...current, notes: event.target.value }))} rows="2" />
          </label>
          <button className="panel-button" type="submit">Save review</button>
          {formError && <p className="performance-form-error" role="alert">{formError}</p>}
        </form>}

        {employees.length ? employees.map((employee) => {
          const review = latestReviewsByEmployee.get(String(employee.id));
          return <div className="metric-row" key={employee.id}>
            <div><strong>{employee.name}</strong><span>{review ? `${review.score} / 5` : "Not reviewed"}</span></div>
            <p className="performance-meta">{employee.department} · {employee.designation}</p>
            <div className="wide-progress"><span style={{ width: review ? `${review.score * 20}%` : "0%" }}></span></div>
          </div>;
        }) : <p className="panel-note performance-empty">No employee records yet. <Link to="/Employees">Open the employee directory</Link> to add your team.</p>}
      </section>
      <section className="workspace-panel">
        <div className="panel-heading"><h2>Review history</h2></div>
        <div className="review-list">
          {reviews.slice(0, 8).map((review) => <p key={review.id}>
            <strong>{review.employeeName} · {review.score}/5</strong>
            <span>{formatReviewDate(review.reviewDate)} · {review.goalsStatus}</span>
          </p>)}
          {reviews.length === 0 && <p className="panel-note">No reviews recorded yet.</p>}
        </div>
      </section>
    </PageSurface>
  );
}

export default Performance;