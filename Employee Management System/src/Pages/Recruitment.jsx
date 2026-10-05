import { useLocation } from "react-router-dom";
import PageSurface from "../Components/PageSurface";

const modules = {
  "/candidates": {
    title: "Candidates",
    subtitle: "Manage candidate profiles and applications.",
  },
  "/interviews": {
    title: "Interviews",
    subtitle: "Coordinate candidate interviews.",
  },
  "/hiring": {
    title: "Hiring",
    subtitle: "Track hiring decisions and progress.",
  },
};

function Recruitment() {
  const { pathname } = useLocation();
  const module = modules[pathname.toLowerCase()] || modules["/candidates"];

  return (
    <PageSurface title={module.title} subtitle={module.subtitle} icon="fa-briefcase" stats={[]}>
      <section className="workspace-panel workspace-panel-wide">
        <div className="panel-heading">
          <h2>{module.title} workspace</h2>
        </div>
        <p className="panel-note">
          Candidate and hiring records are not configured in this workspace yet.
        </p>
      </section>
    </PageSurface>
  );
}

export default Recruitment;
