import React from "react";

export default function CourseCard({ course, onAction, actionLabel, meta }) {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const imageSrc = course.imageUrl
    ? course.imageUrl.startsWith("http://") || course.imageUrl.startsWith("https://")
      ? course.imageUrl
      : `${apiUrl}${course.imageUrl}`
    : "";

  return (
    <div className="card course-card">
      {imageSrc && <img className="course-card__image" src={imageSrc} alt={`${course.title} cover`} />}
      <div className="card__header">
        <div className="pill">{course.category || "General"}</div>
        <h3 className="course-card__title">{course.title}</h3>
        <p className="course-card__description">{course.description}</p>
      </div>
      <div className="card__meta course-card__meta">
        <span>{course.lessons?.length || 0} lessons</span>
        <span>${course.price || 0}</span>
      </div>
      {meta && <div className="card__meta">{meta}</div>}
      {onAction && (
        <button className="btn btn--primary course-card__action" onClick={onAction} type="button">
          {actionLabel || "View"}
        </button>
      )}
    </div>
  );
}
