# Lakminda Academy

Lakminda Academy is a full-stack learning platform built with a React frontend and a Node.js/Express backend. It supports course publishing, paid enrollment (PayHere), lesson progress tracking, assignment submissions, contact management, and secure account workflows (email verification, password reset, and CSRF-protected requests).

This repository is organized as a monorepo with npm workspaces:

- `client`: Vite + React single-page app
- `server`: Express API + MongoDB models and business logic

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=111111)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-Private-informational)

## Video Of The Demo

![Video Of The Demo](client/public/assets/academyVideo.mp4)

## Table of Contents

- [Quick Start](#quick-start)
- [Project Overview](#project-overview)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [How the Platform Works](#how-the-platform-works)
- [Security Design](#security-design)
- [Getting Started (Local Development)](#getting-started-local-development)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Overview](#api-overview)
- [Data Models](#data-models)
- [File Upload Behavior](#file-upload-behavior)
- [Payment Flow (PayHere)](#payment-flow-payhere)
- [Production Notes](#production-notes)
- [Troubleshooting](#troubleshooting)
- [Future Improvements](#future-improvements)

## Quick Start

```bash
# 1) install dependencies
npm install

<<<<<<< HEAD
# 2) create env files
# server/.env -> set MONGO_URI, JWT_SECRET, CLIENT_ORIGIN
=======
# 2) create env files from examples
# PowerShell:
Copy-Item server/.env.example server/.env
# then set your real values in server/.env
#
>>>>>>> 2894c84 (Update README and env template)
# client/.env -> set VITE_API_URL=http://localhost:5000

# 3) run backend + frontend
npm run dev

# 4) seed admin account (optional but recommended)
npm --workspace server run seed:admin
```

Local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Project Overview

Lakminda Academy is designed as an online academy product where users can:

- browse available courses
- enroll in free courses directly
- pay for premium courses via PayHere and unlock access
- watch lesson content and track completion progress
- submit assignment files for exam/project lessons
- view achievements when courses are completed

Administrators can:

- create, edit, and delete courses
- upload course images
- define lessons and assignment type (`none`, `exam`, `project`)
- review users and learning progress statistics
- read contact messages submitted from the public site

The system also includes:

- email verification during registration
- forgot/reset password flow using signed token links
- cookie-based auth with JWT
- CSRF token enforcement for non-GET requests
- in-memory rate limiting on sensitive endpoints

## Core Features

### 1. Public Learning Experience

- Home, About, Contact, Courses pages
- Search, filter, and sort controls for courses
- Course detail page with lesson list and progress sidebar
- Built-in assistant widget (`BotWidget`) for guided navigation

### 2. Authentication and Account Lifecycle

- Register with name/email/password
- Email verification before normal user login
- Resend verification email endpoint
- Forgot password and reset password with token expiry
- Login/logout with secure cookie storage

### 3. Course Enrollment and Progress

- Free courses: immediate enrollment
- Paid courses: payment required (for non-admin users)
- Lesson completion updates percentage progress
- Completion awards an achievement entry
- Users can unenroll (removes enrollment + related achievement)

### 4. Assignment Submissions

- Lesson-level submission support based on assignment type
- Client uploads selected files/folder as Data URLs
- Server writes files to organized per-user/per-course folders
- Size and count constraints are enforced server-side

### 5. Admin Management

- Course CRUD operations from admin dashboard
- Course image upload via Data URL
- User overview with filtering/sorting and progress metrics
- Contact message inbox for submitted inquiries

### 6. Payment Integration

- PayHere checkout initialization endpoint
- Merchant hash generation and verification
- Notification endpoint to mark payment status
- Payment confirm endpoint for frontend post-return validation

## Tech Stack

### Frontend (`client`)

- React 18
- React Router DOM 6
- Vite 5
- Plain CSS (`client/src/styles/main.css`)

### Backend (`server`)

- Node.js + Express 4
- MongoDB + Mongoose 8
- JWT (`jsonwebtoken`) for auth
- `bcryptjs` for password hashing
- `cors` + cookie credentials
- Custom CSRF middleware
- Custom in-memory rate limiter

### Monorepo Tooling

- npm workspaces
- `concurrently` for running client and server in parallel
- `nodemon` for backend development

## Repository Structure

```text
.
|-- client/
|   |-- src/
|   |   |-- components/
|   |   |-- context/
|   |   |-- pages/
|   |   |-- utils/
|   |   `-- App.jsx
|   |-- public/
|   `-- package.json
|-- server/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- scripts/
|   |-- utils/
|   |-- uploads/
|   |-- index.js
|   `-- package.json
|-- package.json
`-- package-lock.json
```

## How the Platform Works

1. The frontend sends API requests to `VITE_API_URL` (default: `http://localhost:5000`).
2. The backend sets a CSRF cookie and validates `X-CSRF-Token` for state-changing requests.
3. Authenticated sessions are represented by a JWT stored in an HTTP-only cookie (`lakminda_token`).
4. Protected routes load user details from `/api/users/me` and enforce role checks in the UI.
5. Paid course access is unlocked when a successful payment is recorded in the `payments` collection.
6. Enrolled users can complete lessons and submit assignment files where enabled.

## Security Design

- Cookie auth: JWT stored in HTTP-only cookie, `sameSite=lax`
- CSRF protection: token cookie + `X-CSRF-Token` header match
- CORS allow-list: based on `CLIENT_ORIGIN` env
- Password hashing: bcrypt with salt rounds
- Tokenized workflows: SHA-256 hashes stored for email verification / password reset tokens
- Endpoint throttling: in-memory rate limiter for login/register/verification/contact/payment init
- Path sanitization: assignment upload paths are sanitized to reduce traversal risks

## Getting Started (Local Development)

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB instance (local or cloud)

### 1. Install dependencies (workspace root)

```bash
npm install
```

### 2. Create environment file for server

<<<<<<< HEAD
Create `server/.env` and configure required values (see full table below):

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/lakminda_academy
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_ORIGIN=http://localhost:5173

# optional but recommended for admin seeding
ADMIN_EMAIL=admin@lakminda.local
ADMIN_PASSWORD=change_me_please
```

=======
Use the tracked template and then configure real values:

```bash
Copy-Item server/.env.example server/.env
```

The template includes all supported backend variables. Keep real secrets only in `server/.env`.

>>>>>>> 2894c84 (Update README and env template)
### 3. Create environment file for client

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000
```

### 4. Run both apps

```bash
npm run dev
```

- Client: `http://localhost:5173`
- Server: `http://localhost:5000`

### 5. Seed the first admin user

```bash
npm --workspace server run seed:admin
```

Then sign in at `/super-admin-login` using `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

## Environment Variables

### Backend (`server/.env`)

<<<<<<< HEAD
=======
Recommended workflow:

- `server/.env.example` is the canonical template committed to git.
- `server/.env` is local-only and ignored by `.gitignore`.
- When onboarding, copy `server/.env.example` to `server/.env` and fill real credentials.

>>>>>>> 2894c84 (Update README and env template)
Required for core app:

- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: secret used for signing auth tokens
- `CLIENT_ORIGIN`: comma-separated allowed frontend origins (example: `http://localhost:5173,http://localhost:5174`)

Common/optional:

- `PORT`: API port (default `5000`)
- `NODE_ENV`: set to `production` in prod for secure cookies

Admin seed script:

- `ADMIN_EMAIL`: admin email for initial seeding (default `admin@lakminda.local`)
- `ADMIN_PASSWORD`: required by seed script, minimum 8 chars

Email delivery (optional, if unset mail is skipped and links are logged):

- `SMTP_HOST` (default `smtp.gmail.com`)
- `SMTP_PORT` (default `465`)
- `SMTP_USER`
- `SMTP_PASS`
- `MAIL_FROM`

PayHere payment integration:

- `PAYHERE_MERCHANT_ID`
- `PAYHERE_MERCHANT_SECRET`
- `PAYHERE_SANDBOX` (`true` by default; set `false` for live)

### Frontend (`client/.env`)

- `VITE_API_URL`: base API URL (default `http://localhost:5000`)

## Available Scripts

### Root

- `npm run dev`: run backend + frontend concurrently
- `npm run build`: build frontend app
- `npm run start`: start backend in production mode

### Server (`server/package.json`)

- `npm --workspace server run dev`: backend with nodemon
- `npm --workspace server run start`: backend with node
- `npm --workspace server run seed:admin`: create first admin user

### Client (`client/package.json`)

- `npm --workspace client run dev`: start Vite dev server
- `npm --workspace client run build`: create production build
- `npm --workspace client run preview`: preview built app

## API Overview

Base URL: `http://localhost:5000`

### Health + CSRF

- `GET /api/health`
- `GET /api/csrf-token`

### Auth

- `POST /api/auth/register`
- `GET /api/auth/verify-email?token=...`
- `POST /api/auth/resend-verification`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/login`
- `POST /api/auth/logout`

### Users

- `GET /api/users/me` (auth)
- `GET /api/users/admin-overview` (admin)

### Courses

- `GET /api/courses` (public; lesson content masked for paid courses if not entitled)
- `GET /api/courses/:id` (same masking behavior)
- `POST /api/courses` (admin)
- `PUT /api/courses/:id` (admin)
- `DELETE /api/courses/:id` (admin)
- `POST /api/courses/:id/enroll` (auth)
- `DELETE /api/courses/:id/enroll` (auth)
- `POST /api/courses/:id/lessons/:lessonIndex/complete` (auth)
- `POST /api/courses/:id/lessons/:lessonIndex/submissions` (auth)

### Contact

- `POST /api/contact` (public)
- `GET /api/contact` (admin)

### Payments

- `POST /api/payments/payhere/checkout` (auth)
- `POST /api/payments/payhere/notify` (PayHere callback; CSRF ignored intentionally)
- `POST /api/payments/payhere/confirm` (auth)

## Data Models

### User

- Basic profile: name, email, role
- Auth fields: `passwordHash`, verification/reset token hashes and expirations
- Learning fields:
  - `enrolledCourses[]`: course ref, completed lesson indexes, progress, completion date
  - `achievements[]`: awarded course badges

### Course

- Metadata: title, description, category, price, image URL
- `lessons[]`: title, content, assignment type (`none`, `exam`, `project`)

### Payment

- Order and gateway data: orderId, provider, providerPaymentId
- User/course refs, amount, currency
- Status lifecycle: `pending`, `success`, `failed`, `canceled`

### ContactMessage

- name, email, message, timestamps

## File Upload Behavior

### Course Images

- Uploaded as base64 Data URL from admin form
- Allowed MIME types: JPG, PNG, WEBP, GIF
- Max size: 5 MB
- Stored under `server/uploads/courses`

### Assignment Submissions

- Uploaded as file list with relative paths
- Stored under `server/uploads/submissions/course-*/user-*/lesson-*/<timestamp>`
- Constraints:
  - max 200 files per submission
  - max 25 MB total payload
  - path sanitization for safety

## Payment Flow (PayHere)

1. User clicks `Pay & Enroll` on a paid course.
2. Frontend calls `/api/payments/payhere/checkout`.
3. Backend creates pending payment and returns checkout payload + hash.
4. Frontend posts form to PayHere checkout URL.
5. PayHere calls `/api/payments/payhere/notify`.
6. Backend validates signature and marks payment status.
7. On success, enrollment is created automatically.
8. Frontend also calls `/api/payments/payhere/confirm` after redirect for user-facing confirmation.

## Production Notes

- Set strict `CLIENT_ORIGIN` values (no wildcards).
- Use secure secrets for `JWT_SECRET` and merchant credentials.
<<<<<<< HEAD
=======
- Never commit real credentials; keep only placeholder values in `*.env.example`.
>>>>>>> 2894c84 (Update README and env template)
- Ensure `NODE_ENV=production` so cookies use `secure=true`.
- Place MongoDB behind proper auth/network rules.
- Serve frontend build via CDN/reverse proxy and proxy API requests to backend.
- Consider replacing in-memory rate limiter with Redis-backed limiter for horizontal scaling.
- Add structured logging and monitoring for payment callbacks and auth flows.

## Troubleshooting

- `Cannot reach server...`: verify backend is running and `VITE_API_URL` is correct.
- `Invalid CSRF token`: ensure cookies are enabled and frontend calls include credentials.
- CORS errors: verify request origin is listed in `CLIENT_ORIGIN`.
- Login works but user not loaded: check `/api/users/me` and cookie domain/path settings.
- Email not sending: if SMTP vars are absent, server logs verification/reset links instead.
- PayHere confirm fails: payment may still be pending; retry after notify callback arrives.

## Future Improvements

- Add automated tests (API integration + frontend component tests).
- Add server-side validation library (zod/joi) for consistent request schemas.
- Move uploads to object storage (S3-compatible) for production durability.
- Add assignment review/grading workflow for admins.
- Add certificates/PDF generation and downloadable completion records.
- Add audit logs for admin actions.

---
