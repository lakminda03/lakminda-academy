import React from "react";

const teamMembers = [
  {
    name: "Theekshana Lakminda",
    role: "Full-Stack Developer, Quality Assurance Tester & Team Leader",
    image: "/assets/team/man1.jpg",
  },
  {
    name: "Kasun Perera",
    role: "UI/UX Designer",
    image: "/assets/team/man2.jpg",
  },
  {
    name: "Ravindu Silva",
    role: "AI Engineer",
    image: "/assets/team/man3.jpg",
  },
  {
    name: "Sahan Wijesinghe",
    role: "WordPress Developer",
    image: "/assets/team/man4.jpg",
  },
  {
    name: "Ishara Fernando",
    role: "Mobile App Developer",
    image: "/assets/team/man5.jpg",
  },
];

const galleryImages = [
  "/assets/gallery/center-building.jpg",
  "/assets/gallery/img1.jpg",
  "/assets/gallery/img2.jpg",
  "/assets/gallery/img3.jpg",
  "/assets/gallery/img4.jpg",
  "/assets/gallery/img5.jpg",
];

export default function About() {
  return (
    <main className="page">
      <div className="page__header">
        <h2>About Lakminda Academy</h2>
        <p>We teach modern tech skills through real, shippable projects.</p>
      </div>
      <div className="split">
        <div className="card">
          <h3>Our method</h3>
          <p>
            Learn by building. Each course walks you from setup to deployment with practical
            deliverables at every step.
          </p>
        </div>
        <div className="card">
          <h3>Outcomes</h3>
          <p>
            Graduate with a portfolio, confidence, and a clear path to launch your career.
          </p>
        </div>
      </div>
      <section className="section">
        <div className="page__header">
          <h2>About Lakminda Academy</h2>
          <p>Intro video about our mission, programs, and campus culture.</p>
        </div>
        <div className="card about-video-card">
          <video
            className="about-video"
            controls
            preload="metadata"
            poster="/assets/gallery/center-building.jpg"
          >
            <source src="/assets/video/lakminda-academy.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </section>
      <section className="section">
        <div className="page__header">
          <h2>Our Team</h2>
          <p>The people building and delivering Lakminda Academy.</p>
        </div>
        <div className="team-grid">
          {teamMembers.map((member) => (
            <article key={member.name} className="card team-card">
              <img src={member.image} alt={member.name} className="team-card__image" />
              <h3>{member.name}</h3>
              <p className="muted">{member.role}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section">
        <div className="page__header">
          <h2>Gallery</h2>
          <p>A quick look at Lakminda Academy.</p>
        </div>
        <div className="gallery-grid">
          {galleryImages.map((image, index) => (
            <article key={image} className="gallery-item">
              <img src={image} alt={`Lakminda Academy gallery ${index + 1}`} className="gallery-item__image" />
            </article>
          ))}
        </div>
      </section>
      <section className="section">
        <div className="page__header">
          <h2>Academy Location</h2>
          <p>Demo Location of Lakminda Academy.</p>
        </div>
        <div className="card location-card">
          <iframe
            className="location-map"
            title="Lakminda Academy Location (Demo)"
            src="https://www.google.com/maps?q=6.9271,79.8612&z=14&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </section>
    </main>
  );
}
