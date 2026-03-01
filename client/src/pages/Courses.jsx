import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CourseCard from "../components/CourseCard.jsx";
import { apiRequest } from "../utils/api.js";
import { useAuth } from "../context/auth.jsx";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [paymentMessage, setPaymentMessage] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const loadCourses = async () => {
    try {
      const data = await apiRequest("/api/courses");
      setCourses(data);
    } catch (err) {
      setError(err.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const enrollDirect = async (id) => {
    await apiRequest(`/api/courses/${id}/enroll`, { method: "POST" });
    navigate(`/courses/${id}`);
  };

  const submitPaymentForm = (action, payload) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = action;
    form.style.display = "none";
    Object.entries(payload || {}).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = String(value ?? "");
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
  };

  const handleEnroll = async (course) => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role === "admin") {
      navigate(`/courses/${course._id}`);
      return;
    }

    const alreadyEnrolled = (user.enrolledCourses || []).some((item) => item?.course?._id === course._id);
    if (alreadyEnrolled) {
      navigate(`/courses/${course._id}`);
      return;
    }

    if (Number(course.price || 0) >= 1) {
      const data = await apiRequest("/api/payments/payhere/checkout", {
        method: "POST",
        body: JSON.stringify({ courseId: course._id }),
      });
      submitPaymentForm(data.action, data.payload);
      return;
    }

    await enrollDirect(course._id);
  };

  useEffect(() => {
    const status = searchParams.get("payment");
    const courseId = searchParams.get("courseId");
    const orderId = searchParams.get("orderId");
    if (!status) return;

    if (status === "cancel") {
      setPaymentMessage("Payment was canceled.");
      setSearchParams({});
      return;
    }

    if (status === "success" && courseId && orderId && user) {
      (async () => {
        try {
          await apiRequest("/api/payments/payhere/confirm", {
            method: "POST",
            body: JSON.stringify({ courseId, orderId }),
          });
          await enrollDirect(courseId);
        } catch (err) {
          setPaymentMessage(err.message || "Payment is still processing. Please refresh shortly.");
          setSearchParams({});
        }
      })();
      return;
    }
    setSearchParams({});
  }, [searchParams, user, setSearchParams]);

  const categories = useMemo(() => {
    const set = new Set(courses.map((course) => course.category || "General"));
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const term = search.trim().toLowerCase();
    const max = maxPrice === "" ? null : Number(maxPrice);
    const list = courses.filter((course) => {
      const courseCategory = course.category || "General";
      const matchesCategory = category === "all" || courseCategory === category;
      const matchesPrice = max === null || Number(course.price || 0) <= max;
      const matchesSearch =
        !term ||
        String(course.title || "").toLowerCase().includes(term) ||
        String(course.description || "").toLowerCase().includes(term);
      return matchesCategory && matchesPrice && matchesSearch;
    });

    const sorted = [...list];
    if (sortBy === "price-asc") {
      sorted.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === "price-desc") {
      sorted.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sortBy === "title-asc") {
      sorted.sort((a, b) => String(a.title || "").localeCompare(String(b.title || "")));
    } else if (sortBy === "lessons-desc") {
      sorted.sort((a, b) => Number(b.lessons?.length || 0) - Number(a.lessons?.length || 0));
    } else if (sortBy === "oldest") {
      sorted.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    } else {
      sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    return sorted;
  }, [courses, search, category, maxPrice, sortBy]);

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setMaxPrice("");
    setSortBy("newest");
  };

  const enrolledCourseIds = new Set(
    (user?.enrolledCourses || [])
      .map((item) => item?.course?._id)
      .filter(Boolean)
  );

  return (
    <main className="page">
      <div className="page__header">
        <h2>Courses</h2>
        <p>Practical tracks designed for real-world outcomes.</p>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="error">{error}</div>}
      {paymentMessage && <div className="success">{paymentMessage}</div>}
      <div className="card courses-controls">
        <div className="form__row">
          <input
            placeholder="Search by title or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((value) => (
              <option key={value} value={value}>
                {value === "all" ? "All categories" : value}
              </option>
            ))}
          </select>
          <input
            placeholder="Max price"
            type="number"
            min="0"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="title-asc">Title: A-Z</option>
            <option value="lessons-desc">Most lessons</option>
          </select>
        </div>
        <div className="courses-controls__meta">
          <span className="muted">
            Showing {filteredCourses.length} of {courses.length} course(s)
          </span>
          <button className="btn btn--ghost" type="button" onClick={clearFilters}>
            Clear
          </button>
        </div>
      </div>
      <div className="grid courses-grid">
        {filteredCourses.map((course) => (
          <CourseCard
            key={course._id}
            course={course}
            actionLabel={
              user?.role === "admin" || enrolledCourseIds.has(course._id)
                ? "Open Course"
                : Number(course.price || 0) >= 1
                  ? "Pay & Enroll"
                  : "Enroll"
            }
            onAction={() => handleEnroll(course)}
          />
        ))}
      </div>
      {!loading && !error && filteredCourses.length === 0 && (
        <div className="muted">No courses match the current filters.</div>
      )}
    </main>
  );
}
