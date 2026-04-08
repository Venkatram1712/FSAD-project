# Career Guidance Platform (Frontend)

Role-based career guidance application built with React + Vite.

## Core Features

- Public pages: Landing, Login, Signup
- Role-based routing: student, counselor, admin
- Protected routes with role checks
- Authentication flow with persisted session restore
- Student questionnaire and dashboard
- Counselor session management and chat
- Admin management for users, counselors, resources, and career paths
- API integration with Axios and reusable service utilities

## Tech Stack

- React 19
- Vite 7
- React Router
- Tailwind CSS + Radix-based UI components
- Axios

## Environment

Create a `.env` file in the project root if needed:

```
VITE_API_BASE_URL=http://localhost:8080
VITE_USERS_ENDPOINTS=/api/users,/api/auth/users,/api/admin/users
VITE_STUDENTS_ENDPOINTS=/api/auth/users/students,/api/users/students,/api/students
```

## Run Locally

```
npm install
npm run dev
```

## Build and Lint

```
npm run lint
npm run build
```

## Routing Map

- `/` -> Landing page
- `/login` -> Login
- `/signup` -> Signup
- `/questionnaire` -> Student questionnaire (protected)
- `/student` -> Student dashboard (protected)
- `/counselor` -> Counselor dashboard (protected)
- `/admin` -> Admin dashboard (protected)

## Validation and Error Handling

- Login and signup include field-level inline validation
- Questionnaire and session forms block invalid submission
- API calls return controlled errors for UI display
- Async flows are wrapped with loading states and fail-safe handling

## Git and Team Workflow

The recommended collaboration flow for this project:

1. Create a feature branch from `main`
2. Keep commit messages descriptive (avoid generic "changes")
3. Open a pull request with test/build notes
4. Merge only after review and conflict resolution

See `CONTRIBUTING.md` for detailed branching, commit, and PR conventions.
