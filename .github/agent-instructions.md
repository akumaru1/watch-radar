# 🎬 watch-radar Project Context

This file provides guidance to GitHub Copilot on working with the code in this repository.


1. Before writing any code, describe your approach.

2. If the requirements I give you are ambiguous, ask clarifying questions before writing any code.

3. After you finish writing any code, list the edge cases and suggest test cases to cover them.

4. If a task requires changes to more than 3 files, stop and break it into smaller tasks first.

5. When there’s a bug, suggest to writing a test that reproduces it, then fix it until the test passes.

6. Every time I correct you, reflect on what you did wrong and come up with a plan to never make the same mistake again.



## Project Overview

**watch-radar** is a full-stack movie discovery and watchlist application. Users can search movies via the TMDB API, save them to a personal watchlist, and view "Genre DNA" statistics about their movie preferences. 


---

## Architecture

### Frontend (Next.js)

- **Location:** `/client/`
- **Framework:** Next.js 16 with React 19
- **Styling:** Tailwind CSS
- **Key Features:**
  - Server component (`"use client"` for client-side features)
  - Fetch from backend API at `/api/` endpoints
  - Environment variable: `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:5000`)
  - Components stored in `/client/src/components/`

### Backend (Express.js)

- **Location:** `/server/`
- **Framework:** Node.js with Express
- **Database:** MongoDB (via Mongoose, not yet implemented)
- **External API:** TMDB API (v3 with Bearer token authentication)
- **Port:** 5000

### Database

- **Type:** MongoDB Atlas (free tier)
- **ORM:** Mongoose
- **Future Models:** `Movie` (userId, tmdbId, title, posterPath, genres)

---



## Code Style & Conventions

please include a comment in the code to be helpfull what that part do

### JavaScript Conventions

- **Naming:** camelCase for variables/functions, PascalCase for components/classes
- **Indent:** tabs (enforced via `.editorconfig` and ESLint `indent: ["error", "tab"]`)
- **Imports:** Use `import`/`export` (frontend) and `require()` (backend CommonJS)
- **Async/Await:** Preferred over `.then()` chains
- **Error Handling:** Try-catch blocks with descriptive error messages logged to console

### Frontend (React/Next.js)

- Use functional components with hooks (`useState`, `useEffect`)
- Client components marked with `"use client"` directive
- API calls in `useEffect` with cleanup consideration
- Tailwind classes for styling; avoid inline styles

### Backend (Express)

- Routes use async handlers with error handling
- Use middleware for CORS and JSON parsing
- Sensitive keys stored in `.env` (never committed)
- Keep TMDB calls server-side only (security via proxy pattern)

### File Organization

- **Frontend:** `/client/src/app/` for pages, `/client/src/components/` for reusable components
- **Backend:** `/server/index.js` as main entry point
- Configuration files: ESLint, PostCSS, Next config in client root

---

# Antigravity Artifact Management Rule
After completing any task or command that generates an Implementation Plan or Walkthrough artifact:

1. **Save Files:** 
   - Save the Implementation Plan to `./docs/plans/[task_name_slug]_plan.md`.
   - Save the Walkthrough to `./docs/walkthroughs/[task_name_slug]_walkthrough.md`.

2. **Update Checklist:**
   - Locate the `./checklist.md` file in the workspace root.
   - Find the exact Markdown list item matching the task you just completed (including sub-items like "Create a 'Surprise Me' button...").
   - Append the hotlinks to the end of that specific line in this format: 
     ` | [📋 Plan](docs/plans/[task_name_slug]_plan.md) | [🚶 Walkthrough](docs/walkthroughs/[task_name_slug]_walkthrough.md)`

---



