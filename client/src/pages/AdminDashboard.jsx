import React, { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../utils/api.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const emptyForm = {
  title: "",
  description: "",
  category: "",
  price: 0,
  imageUrl: "",
  lessonsText: "Lesson 1|Intro|none\nLesson 2|Exam questions|exam\nLesson 3|Build and submit project|project",
};

const parseLessons = (text) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, content, assignmentTypeRaw] = line.split("|");
      const assignmentType = String(assignmentTypeRaw || "none").trim().toLowerCase();
      const safeType = ["none", "exam", "project"].includes(assignmentType) ? assignmentType : "none";
      return { title: title?.trim() || "Lesson", content: content?.trim() || "", assignmentType: safeType };
    });

const toAssetUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_URL}${url}`;
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString();
};

export default function AdminDashboard() {
  const [courses, setCourses] = useState([]);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedPreview, setSelectedPreview] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [messageError, setMessageError] = useState("");
  const [usersError, setUsersError] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userVerifyFilter, setUserVerifyFilter] = useState("all");
  const [userCourseFilter, setUserCourseFilter] = useState("all");
  const [userSortBy, setUserSortBy] = useState("newest");

  const loadCourses = async () => {
    const data = await apiRequest("/api/courses");
    setCourses(data);
  };

  const loadMessages = async () => {
    try {
      const data = await apiRequest("/api/contact");
      setMessages(data);
      setMessageError("");
    } catch (err) {
      setMessageError(err.message || "Failed to load contact messages");
    }
  };

  const loadUsers = async () => {
    try {
      const data = await apiRequest("/api/users/admin-overview");
      setUsers(data);
      setUsersError("");
    } catch (err) {
      setUsersError(err.message || "Failed to load user overview");
    }
  };

  useEffect(() => {
    loadCourses();
    loadMessages();
    loadUsers();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setSelectedImage(null);
    setSelectedPreview("");
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    setSelectedImage(file || null);
    setSelectedPreview(file ? URL.createObjectURL(file) : "");
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        price: Number(form.price) || 0,
        lessons: parseLessons(form.lessonsText),
      };

      if (selectedImage) {
        payload.imageDataUrl = await fileToDataUrl(selectedImage);
      }

      if (editingId) {
        await apiRequest(`/api/courses/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setSuccess("Course updated");
      } else {
        await apiRequest("/api/courses", { method: "POST", body: JSON.stringify(payload) });
        setSuccess("Course created");
      }

      resetForm();
      await loadCourses();
    } catch (err) {
      setError(err.message || "Failed to save course");
    }
  };

  const startEdit = (course) => {
    setEditingId(course._id);
    setSelectedImage(null);
    setSelectedPreview("");
    setForm({
      title: course.title,
      description: course.description,
      category: course.category,
      price: course.price,
      imageUrl: course.imageUrl || "",
      lessonsText: course.lessons
        .map((lesson) => `${lesson.title}|${lesson.content || ""}|${lesson.assignmentType || "none"}`)
        .join("\n"),
    });
  };

  const remove = async (id) => {
    await apiRequest(`/api/courses/${id}`, { method: "DELETE" });
    await loadCourses();
  };

  const imagePreviewSrc = selectedPreview || toAssetUrl(form.imageUrl);
  const filteredUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    const list = users.filter((item) => {
      const matchesSearch =
        !term ||
        String(item.name || "").toLowerCase().includes(term) ||
        String(item.email || "").toLowerCase().includes(term);
      const matchesRole = userRoleFilter === "all" || item.role === userRoleFilter;
      const matchesVerify =
        userVerifyFilter === "all" ||
        (userVerifyFilter === "verified" && item.emailVerified) ||
        (userVerifyFilter === "unverified" && !item.emailVerified);
      const matchesCourse =
        userCourseFilter === "all" ||
        (userCourseFilter === "none" && Number(item.totalEnrollments || 0) === 0) ||
        (userCourseFilter !== "none" &&
          (item.enrolledCourses || []).some((course) => String(course.courseId || "") === userCourseFilter));
      return matchesSearch && matchesRole && matchesVerify && matchesCourse;
    });

    const sorted = [...list];
    if (userSortBy === "oldest") {
      sorted.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    } else if (userSortBy === "name-asc") {
      sorted.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
    } else if (userSortBy === "enrollments-desc") {
      sorted.sort((a, b) => Number(b.totalEnrollments || 0) - Number(a.totalEnrollments || 0));
    } else if (userSortBy === "completed-desc") {
      sorted.sort((a, b) => Number(b.completedCourses || 0) - Number(a.completedCourses || 0));
    } else if (userSortBy === "achievements-desc") {
      sorted.sort((a, b) => Number(b.totalAchievements || 0) - Number(a.totalAchievements || 0));
    } else {
      sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    return sorted;
  }, [users, userSearch, userRoleFilter, userVerifyFilter, userCourseFilter, userSortBy]);

  const clearUserFilters = () => {
    setUserSearch("");
    setUserRoleFilter("all");
    setUserVerifyFilter("all");
    setUserCourseFilter("all");
    setUserSortBy("newest");
  };

  return (
    <main className="page admin">
      <div className="page__header">
        <h2>Admin Dashboard</h2>
        <p>Create, edit, and manage courses.</p>
      </div>
      <div className="admin__grid">
        <div className="card">
          <h3>{editingId ? "Edit Course" : "Create Course"}</h3>
          <form className="form" onSubmit={submit}>
            <input
              placeholder="Course title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <input
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <textarea
              placeholder="Description"
              rows="3"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
            <input
              placeholder="Price"
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <div className="form__file-field">
              <label htmlFor="course-image" className="muted">
                {editingId ? "Replace course photo" : "Course photo"}
              </label>
              <input id="course-image" type="file" accept="image/*" onChange={onFileChange} />
              {imagePreviewSrc && <img className="admin-course-image" src={imagePreviewSrc} alt="Course preview" />}
            </div>
            <textarea
              placeholder="Lessons (one per line: Title|Content|AssignmentType. Types: none, exam, project)"
              rows="6"
              value={form.lessonsText}
              onChange={(e) => setForm({ ...form, lessonsText: e.target.value })}
            />
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}
            <button className="btn btn--primary" type="submit">
              {editingId ? "Update Course" : "Create Course"}
            </button>
            {editingId && (
              <button
                className="btn btn--ghost"
                type="button"
                onClick={() => {
                  resetForm();
                }}
              >
                Cancel Edit
              </button>
            )}
          </form>
        </div>
        <div className="card">
          <h3>All Courses</h3>
          <div className="stack">
            {courses.map((course) => (
              <div key={course._id} className="stack__item">
                <div className="stack__content">
                  {course.imageUrl && (
                    <img className="admin-course-thumb" src={toAssetUrl(course.imageUrl)} alt={`${course.title} thumbnail`} />
                  )}
                  <strong>{course.title}</strong>
                  <div className="muted">{course.category}</div>
                </div>
                <div className="stack__actions">
                  <button className="btn btn--ghost" onClick={() => startEdit(course)}>
                    Edit
                  </button>
                  <button className="btn btn--ghost" onClick={() => remove(course._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <section className="section">
        <div className="card">
          <div className="admin-section-head">
            <h3>User Overview</h3>
            <button className="btn btn--ghost" type="button" onClick={loadUsers}>
              Refresh
            </button>
          </div>
          <div className="form user-overview-controls">
            <div className="form__row">
              <input
                placeholder="Search by name or email"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              <select value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)}>
                <option value="all">All roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
              <select value={userVerifyFilter} onChange={(e) => setUserVerifyFilter(e.target.value)}>
                <option value="all">All verification</option>
                <option value="verified">Verified only</option>
                <option value="unverified">Unverified only</option>
              </select>
              <select value={userCourseFilter} onChange={(e) => setUserCourseFilter(e.target.value)}>
                <option value="all">All courses</option>
                <option value="none">No courses</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
              <select value={userSortBy} onChange={(e) => setUserSortBy(e.target.value)}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="name-asc">Name A-Z</option>
                <option value="enrollments-desc">Most enrollments</option>
                <option value="completed-desc">Most completed</option>
                <option value="achievements-desc">Most achievements</option>
              </select>
            </div>
            <div className="courses-controls__meta">
              <span className="muted">
                Showing {filteredUsers.length} of {users.length} user(s)
              </span>
              <button className="btn btn--ghost" type="button" onClick={clearUserFilters}>
                Clear
              </button>
            </div>
          </div>
          {usersError && <div className="error">{usersError}</div>}
          <div className="user-overview-list">
            {filteredUsers.length ? (
              filteredUsers.map((item) => (
                <div key={item._id} className="user-overview-item">
                  <div className="user-overview-head">
                    <div>
                      <strong>{item.name}</strong>
                      <div className="muted">{item.email}</div>
                    </div>
                    <div className="user-overview-badges">
                      <span className="gateway-chip">{item.role}</span>
                      <span className="gateway-chip">{item.emailVerified ? "Verified" : "Not Verified"}</span>
                    </div>
                  </div>
                  <div className="user-overview-metrics muted">
                    Joined: {formatDate(item.createdAt)} | Enrolled: {item.totalEnrollments} | Completed: {item.completedCourses} |
                    Achievements: {item.totalAchievements}
                  </div>
                  <div className="user-overview-courses">
                    {item.enrolledCourses.length ? (
                      item.enrolledCourses.map((course) => (
                        <div key={`${item._id}-${course.courseId || course.title}`} className="user-overview-course">
                          <div>
                            <strong>{course.title}</strong>
                            <div className="muted">{course.category}</div>
                          </div>
                          <div className="muted">Progress: {course.progress}%</div>
                        </div>
                      ))
                    ) : (
                      <div className="muted">No enrolled courses yet.</div>
                    )}
                  </div>
                </div>
              ))
            ) : users.length ? (
              <div className="muted">No users match the current filters.</div>
            ) : (
              <div className="muted">No users found.</div>
            )}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="card">
          <h3>Contact Messages</h3>
          {messageError && <div className="error">{messageError}</div>}
          <div className="message-list">
            {messages.length ? (
              messages.map((item) => (
                <div key={item._id} className="message-item">
                  <div className="message-item__head">
                    <strong>{item.name}</strong>
                    <span className="muted">{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="muted">{item.email}</div>
                  <p>{item.message}</p>
                </div>
              ))
            ) : (
              <div className="muted">No contact messages yet.</div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
