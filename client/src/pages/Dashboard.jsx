import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/auth.jsx";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <main className="page">
      <div className="page__header">
        <h2>Let's start learning, {user?.name}</h2>
        <p>Your learning progress and achievements.</p>
      </div>
      <section className="section">
        <h3>Enrolled Courses</h3>
        <div className="grid">
          {user?.enrolledCourses?.length ? (
            user.enrolledCourses.map((item) => (
              <div key={item.course._id} className="card">
                <h4>{item.course.title}</h4>
                <p>{item.course.description}</p>
                <div className="panel__bar">
                  <span style={{ width: `${item.progress || 0}%` }} />
                </div>
                <div className="panel__meta">{item.progress || 0}% complete</div>
                <Link className="btn btn--ghost" to={`/courses/${item.course._id}`}>
                  Continue
                </Link>
              </div>
            ))
          ) : (
            <div className="card">
              <p>No enrollments yet.</p>
              <Link className="btn btn--primary" to="/courses">
                Browse Courses
              </Link>
            </div>
          )}
        </div>
      </section>
      <section className="section">
        <h3>Achievements</h3>
        <div className="grid">
          {user?.achievements?.length ? (
            user.achievements.map((achievement, idx) => (
              <div key={`${achievement.course._id}-${idx}`} className="card">
                <div className="badge">
                  <img src="/assets/award.png" alt="Achievement badge" />
                </div>
                <h4>{achievement.course.title}</h4>
                <p>Completed on {new Date(achievement.awardedAt).toLocaleDateString()}</p>
              </div>
            ))
          ) : (
            <div className="card">
              <p>No achievements yet. Complete a course to unlock one.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
