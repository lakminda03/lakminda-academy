import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../utils/api.js";
import { useAuth } from "../context/auth.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const toAssetUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_URL}${url}`;
};

export default function CourseDetail() {
  const { id } = useParams();
  const { user, refresh } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [message, setMessage] = useState("");
  const [removing, setRemoving] = useState(false);

  const load = async () => {
    try {
      const data = await apiRequest(`/api/courses/${id}`);
      setCourse(data);
    } catch (err) {
      setLoadError(err.message || "Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const enrolled = useMemo(() => {
    return user?.enrolledCourses?.find((c) => c.course?._id === id) || null;
  }, [user, id]);
  const isAdmin = user?.role === "admin";

  const unrollCourse = async () => {
    try {
      setRemoving(true);
      setActionError("");
      setMessage("");
      await apiRequest(`/api/courses/${id}/enroll`, { method: "DELETE" });
      await refresh();
      setMessage("You have unenrolled from this course.");
    } catch (err) {
      setActionError(err.message || "Failed to unenroll from this course");
    } finally {
      setRemoving(false);
    }
  };

  if (loading) return <main className="page">Loading...</main>;
  if (loadError) return <main className="page error">{loadError}</main>;

  return (
    <main className="page course-detail-page">
      <div className="course-detail-layout">
        <section className="course-detail-main">
          <div className="page__header">
            <h2>{course.title}</h2>
            <p>{course.description}</p>
          </div>
          {course.imageUrl && (
            <div className="course-detail__hero-wrap">
              <img className="course-detail__hero" src={toAssetUrl(course.imageUrl)} alt={`${course.title} cover`} />
            </div>
          )}
          <div className="course-detail__lessons">
            {course.lessons.length === 0 && <div>No lessons yet. Check back soon.</div>}
            {course.lessons.map((lesson, index) => {
              const done = enrolled?.completedLessons?.includes(index);
              return (
                <div key={index} className={`lesson ${done ? "lesson--done" : ""}`}>
                  <div>
                    <h4>
                      Lesson {index + 1}: {lesson.title}
                    </h4>
                    <p>{done ? "Completed lesson" : "Open lesson to view video and complete it."}</p>
                  </div>
                  <Link className="btn btn--ghost" to={`/courses/${id}/lessons/${index}`}>
                    {user ? "Open Lesson" : "Sign In to Open"}
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
        <aside className="course-detail__sidebar">
          <div className="panel__card">
            <h3>Progress</h3>
            <div className="panel__bar">
              <span style={{ width: `${enrolled?.progress || 0}%` }} />
            </div>
            <div className="panel__meta">{enrolled?.progress || 0}% complete</div>
            {!isAdmin && enrolled && (
              <button className="btn btn--ghost" type="button" onClick={unrollCourse} disabled={removing}>
                {removing ? "Unenrolling..." : "Unenroll"}
              </button>
            )}
            {message && <div className="success">{message}</div>}
            {actionError && <div className="error">{actionError}</div>}
          </div>
          <div className="panel__card">
            <h3>Achievement</h3>
            <p>Complete every lesson to unlock your badge.</p>
            <div className="badge">
              <img src="/assets/award.png" alt="Achievement badge" />
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
