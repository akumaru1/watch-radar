# Watch Radar

> **Watch Radar** is a full-stack media discovery, personal watchlist management, and viewer analytics web application. Built with Next.js, Express.js, MongoDB, and Clerk Authentication, Watch Radar empowers users to search movies and TV shows, manage custom watchlists with watched/unwatched states, resolve viewing indecision via a built-in randomizer ("The Decider"), and explore their media viewing profile via interactive "Genre DNA" charts.

---

## Features

- **Trending & Search Discovery**: Browse trending movies and TV shows or search real-time media details powered by TMDB API.
- **User Authentication**: Secure user login, registration, and session management using Clerk (`@clerk/nextjs`).
- **Personal Watchlist (CRUD)**: Save movies and TV shows to a personal MongoDB watchlist, track watched status, and filter items seamlessly.
- **The Decider (Watchlist Randomizer)**: Solves choice paralysis by picking a random unwatched movie or TV show from your watchlist.
- **Genre DNA Analytics**: Visualizes viewing habits using interactive Recharts (Radar charts & metrics) showing top genres, watched completion rates, and average rating breakdown.
- **Secure Express API Proxy**: All TMDB API interactions are handled securely on the server side to protect secret API keys.

---

## Tech Stack

### Frontend (`/client`)
- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Authentication**: [Clerk](https://clerk.com/) (`@clerk/nextjs`)

### Backend (`/server`)
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js v5](https://expressjs.com/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) with [Mongoose v9](https://mongoosejs.com/)
- **HTTP Client**: Axios

### External API
- [The Movie Database (TMDB) API v3](https://developer.themoviedb.org/docs)

---

## Project Structure

```text
watch-radar/
├── client/                # Next.js Frontend Application
│   ├── src/
│   │   ├── app/           # App Router pages (Home, Watchlist, Genre DNA, Details, Auth)
│   │   ├── components/    # Reusable UI Components (Header, SearchBar, MovieCard)
│   │   ├── utils/         # Helper functions & proxies
│   ├── .env.local         # Frontend Environment Variables
│   └── package.json
│
├── server/                # Express.js Backend API Proxy & Database Service
│   ├── models/            # Mongoose Schemas (Movie.js)
│   ├── index.js           # Server Entry Point & API Endpoints
│   ├── .env               # Backend Environment Variables
│   └── package.json
│
├── docs/                  # Architectural Plans & Feature Walkthroughs
│   ├── plans/             # Step-by-step implementation plans
│   └── walkthroughs/      # Completed feature walkthroughs
│
├── checklist.md           # Project roadmap & progress tracker
└── README.md              # Project documentation
```

---

## Getting Started

### Prerequisites

Ensure you have the following installed / configured:
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB Atlas**: A running cluster & connection string
- **TMDB API**: An API Read Access Token (v4 auth Bearer token)
- **Clerk Account**: Publishable & Secret Keys for Next.js

---

### Installation & Environment Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/your-username/watch-radar.git
cd watch-radar
```

#### 2. Backend Setup (`/server`)

Navigate to the `server` directory and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in the `server/` root:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/watch-radar?retryWrites=true&w=majority
TMDB_TOKEN=your_tmdb_bearer_token_here
```

Start the backend dev server:
```bash
npm run dev
```
*The server will run at `http://localhost:5000`.*

---

#### 3. Frontend Setup (`/client`)

Navigate to the `client` directory and install dependencies:
```bash
cd ../client
npm install
```

Create a `.env.local` file in the `client/` root:
```env
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

Start the Next.js dev server:
```bash
npm run dev
```
*The frontend application will run at `http://localhost:3000`.*

---

## API Reference

The backend exposes the following REST endpoints:

### TMDB Media Routes (Proxy)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/movies/trending` | Fetch today's trending movies |
| `GET` | `/api/shows/trending` | Fetch today's trending TV shows |
| `GET` | `/api/search?q=:query` | Search movies by title |
| `GET` | `/api/search/shows?q=:query` | Search TV shows by title |
| `GET` | `/api/movies/:id` | Get movie details, credits, and videos |
| `GET` | `/api/shows/:id` | Get TV show details, credits, and videos |

### Watchlist Routes (Database)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/watchlist` | Save a movie/show to user's watchlist |
| `GET` | `/api/watchlist/:userId` | Get all watchlist items for a specific user |
| `GET` | `/api/watchlist/:userId/stats` | Get genre counts, watched ratios, and average ratings |
| `PATCH`| `/api/watchlist/:id` | Update watchlist item (e.g. toggle `watched` status) |
| `DELETE`| `/api/watchlist/:id` | Delete watchlist item by database ID |
| `DELETE`| `/api/watchlist/user/:userId/item/:tmdbId` | Delete item by `userId` and `tmdbId` |

---

## Testing & Verification

### Manual End-to-End Testing

1. Start both backend and frontend servers:
   ```bash
   # Terminal 1 - Backend
   cd server && npm run dev

   # Terminal 2 - Frontend
   cd client && npm run dev
   ```
2. Open `http://localhost:3000` in your browser.
3. Test key features:
   - **Authentication**: Sign in / Sign up via Clerk.
   - **Discovery & Search**: Search for movies and TV shows in real-time.
   - **Watchlist Operations**: Add items to watchlist, toggle watched/unwatched status, and delete items.
   - **The Decider**: Click "Surprise Me" on the watchlist page to test randomizer selection.
   - **Genre DNA**: Visit `/genre-dna` to verify analytics charts and statistics.

### Backend API Manual Testing

Manual API testing can be performed using cURL, Postman, or VS Code REST clients:

```bash
# Test trending movies proxy
curl http://localhost:5000/api/movies/trending

# Test search endpoint
curl http://localhost:5000/api/search?q=Inception

# Fetch user watchlist
curl http://localhost:5000/api/watchlist/<userId>

# Fetch watchlist analytics
curl http://localhost:5000/api/watchlist/<userId>/stats
```

### Syntax & Build Verification

- **Server syntax check**:
  ```bash
  cd server && node --check index.js
  ```
- **Client production build check**:
  ```bash
  cd client && npm run build
  ```

---

## Documentation & Plans

Detailed architectural plans and feature completion walkthroughs are located under the [`docs/`](file:///home/akumaru/dev/watch-radar/docs) folder:

- **Authentication**: [Plan](file:///home/akumaru/dev/watch-radar/docs/plans/authentication_plan.md) | [Walkthrough](file:///home/akumaru/dev/watch-radar/docs/walkthroughs/authentication_walkthrough.md)
- **Watchlist**: [Plan](file:///home/akumaru/dev/watch-radar/docs/plans/watchlist_plan.md) | [Walkthrough](file:///home/akumaru/dev/watch-radar/docs/walkthroughs/watchlist_walkthrough.md)
- **TV Show Support**: [Plan](file:///home/akumaru/dev/watch-radar/docs/plans/tv_show_support_plan.md) | [Walkthrough](file:///home/akumaru/dev/watch-radar/docs/walkthroughs/tv_show_support_walkthrough.md)
- **The Decider**: [Plan](file:///home/akumaru/dev/watch-radar/docs/plans/decider_plan.md) | [Walkthrough](file:///home/akumaru/dev/watch-radar/docs/walkthroughs/decider_walkthrough.md)
- **Genre DNA**: [Plan](file:///home/akumaru/dev/watch-radar/docs/plans/genre_dna_plan.md) | [Walkthrough](file:///home/akumaru/dev/watch-radar/docs/walkthroughs/genre_dna_walkthrough.md)

---

## License

This project is licensed under the [ISC License](LICENSE).
