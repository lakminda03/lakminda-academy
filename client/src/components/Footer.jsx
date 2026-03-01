import React from "react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div>
          <div className="footer__brand">© LAKMINDA ACADEMY ALL RIGHTS RESERVED.</div>
        </div>
        <div className="footer__social">
          <a className="footer__icon-link" href="https://www.linkedin.com/" aria-label="LinkedIn" target="_blank" rel="noreferrer">
            <svg className="footer__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M4.98 3.5a2.48 2.48 0 1 0 0 4.96 2.48 2.48 0 0 0 0-4.96zM3 8.98h3.96V21H3zM10.98 8.98H14v1.64h.05c.42-.8 1.44-1.64 2.96-1.64 3.16 0 3.74 2.08 3.74 4.78V21h-3.96v-5.6c0-1.34-.03-3.06-1.86-3.06-1.87 0-2.16 1.46-2.16 2.96V21h-3.8z" />
            </svg>
          </a>
          <a className="footer__icon-link" href="https://github.com/" aria-label="GitHub" target="_blank" rel="noreferrer">
            <svg className="footer__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.88 1.5 2.31 1.06 2.88.81.09-.65.35-1.06.63-1.31-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.52 9.52 0 0 1 12 6.84c.85 0 1.7.11 2.5.33 1.9-1.29 2.74-1.02 2.74-1.02.56 1.37.21 2.39.11 2.64.64.7 1.02 1.59 1.02 2.68 0 3.85-2.35 4.69-4.58 4.94.36.31.68.93.68 1.88v2.78c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
            </svg>
          </a>
          <a className="footer__icon-link" href="https://www.facebook.com/" aria-label="Facebook" target="_blank" rel="noreferrer">
            <svg className="footer__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.88 3.78-3.88 1.1 0 2.24.2 2.24.2v2.46H15.2c-1.25 0-1.64.78-1.64 1.57V12h2.79l-.45 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
            </svg>
          </a>
          <a className="footer__icon-link" href="https://www.instagram.com/" aria-label="Instagram" target="_blank" rel="noreferrer">
            <svg className="footer__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5zM12 7.7A4.3 4.3 0 1 1 7.7 12 4.3 4.3 0 0 1 12 7.7zm0 1.8A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5zm4.62-2.03a1.03 1.03 0 1 0 1.03 1.03 1.03 1.03 0 0 0-1.03-1.03z" />
            </svg>
          </a>
          <a className="footer__icon-link" href="https://www.youtube.com/" aria-label="YouTube" target="_blank" rel="noreferrer">
            <svg className="footer__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M23 12s0-3.26-.42-4.83a2.5 2.5 0 0 0-1.77-1.77C19.24 5 12 5 12 5s-7.24 0-8.81.4A2.5 2.5 0 0 0 1.42 7.17C1 8.74 1 12 1 12s0 3.26.42 4.83a2.5 2.5 0 0 0 1.77 1.77C4.76 19 12 19 12 19s7.24 0 8.81-.4a2.5 2.5 0 0 0 1.77-1.77C23 15.26 23 12 23 12zM10 15.5v-7L16 12l-6 3.5z" />
            </svg>
          </a>
          <a className="footer__icon-link" href="https://x.com/" aria-label="X" target="_blank" rel="noreferrer">
            <svg className="footer__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.9 2H22l-6.78 7.75L23 22h-6.1l-4.78-6.25L6.65 22H3.5l7.25-8.3L1 2h6.25l4.32 5.7L18.9 2zm-1.08 18h1.7L6.3 3.9H4.5L17.82 20z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
