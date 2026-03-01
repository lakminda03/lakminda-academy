import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../utils/api.js";
import { useAuth } from "../context/auth.jsx";

const getYouTubeEmbedUrl = (value) => {
  const text = String(value || "").trim();
  if (!text) return "";
  try {
    const url = new URL(text);
    const host = url.hostname.replace("www.", "");
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = url.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }
    if (host === "youtu.be") {
      const id = url.pathname.replace("/", "").split("/")[0];
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }
    if (host === "youtube.com" && url.pathname.startsWith("/embed/")) {
      return text;
    }
    return "";
  } catch {
    return "";
  }
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsDataURL(file);
  });

export default function LessonPage() {
  const { id, lessonIndex } = useParams();
  const index = Number(lessonIndex);
  const { user, refresh } = useAuth();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const folderInputRef = useRef(null);

  useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute("webkitdirectory", "");
      folderInputRef.current.setAttribute("directory", "");
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiRequest(`/api/courses/${id}`);
        setCourse(data);
      } catch (err) {
        setError(err.message || "Failed to load lesson");
      }
    };
    load();
  }, [id]);

  const lesson = useMemo(() => course?.lessons?.[index] || null, [course, index]);
  const enrolled = useMemo(() => {
    return user?.enrolledCourses?.find((c) => c.course?._id === id) || null;
  }, [id, user]);
  const done = Boolean(enrolled?.completedLessons?.includes(index));
  const embedUrl = getYouTubeEmbedUrl(lesson?.content);
  const assignmentType = lesson?.assignmentType || "none";
  const submissionEnabled = assignmentType !== "none";
  const assignmentLabel = assignmentType === "exam" ? "Exam" : "Project";
  const isAdmin = user?.role === "admin";

  const markComplete = async () => {
    if (!user) {
      setError("Please sign in first.");
      return;
    }
    try {
      setError("");
      await apiRequest(`/api/courses/${id}/lessons/${index}/complete`, { method: "POST" });
      await refresh();
    } catch (err) {
      setError(err.message || "Failed to mark lesson complete");
    }
  };

  const onFolderPick = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    setSubmitMessage("");
    setError("");
  };

  const submitAssignment = async () => {
    if (!user) {
      setError("Please sign in first.");
      return;
    }
    if (!selectedFiles.length) {
      setError("Please select a folder first.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSubmitMessage("");

      const filesPayload = [];
      for (const file of selectedFiles) {
        filesPayload.push({
          name: file.name,
          relativePath: file.webkitRelativePath || file.name,
          dataUrl: await fileToDataUrl(file),
        });
      }

      const data = await apiRequest(`/api/courses/${id}/lessons/${index}/submissions`, {
        method: "POST",
        body: JSON.stringify({ files: filesPayload }),
      });
      setSubmitMessage(data.message || "Assignment submitted");
    } catch (err) {
      setError(err.message || "Failed to submit assignment");
    } finally {
      setSubmitting(false);
    }
  };

  if (!course) {
    return <main className="page">{error || "Loading..."}</main>;
  }
  if (!lesson) {
    return <main className="page error">Lesson not found.</main>;
  }

  return (
    <main className="page">
      <div className="page__header">
        <h2>{course.title}</h2>
        <p>
          Lesson {index + 1}: {lesson.title}
        </p>
      </div>

      <div className="card lesson-page">
        <Link className="auth__link" to={`/courses/${id}`}>
          Back to Course
        </Link>

        {embedUrl ? (
          <div className="lesson-page__video-wrap">
            <iframe
              className="lesson-page__video"
              src={embedUrl}
              title={`${lesson.title} video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        ) : (
          <p>{lesson.content || "Lesson content coming soon."}</p>
        )}

        {submissionEnabled && !isAdmin && (
          <div className="capstone-submit">
            <h4>{assignmentLabel} Submission</h4>
            <p className="muted">Select your answers/project files and submit.</p>
            <input ref={folderInputRef} type="file" multiple onChange={onFolderPick} />
            {selectedFiles.length > 0 && (
              <div className="muted">{selectedFiles.length} file(s) selected for submission.</div>
            )}
            <button className="btn btn--primary" type="button" onClick={submitAssignment} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Files"}
            </button>
          </div>
        )}

        {error && <div className="error">{error}</div>}
        {submitMessage && <div className="success">{submitMessage}</div>}

        {!isAdmin && (
          <button className="btn btn--ghost" onClick={markComplete} disabled={!user || done}>
            {done ? "Completed" : "Mark Lesson Complete"}
          </button>
        )}
      </div>
    </main>
  );
}
