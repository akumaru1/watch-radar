const express = require("express");
const axios = require("axios");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const Movie = require("./models/Movie");

const app = express();
app.use(cors());
app.use(express.json());

const TMDB_TOKEN = process.env.TMDB_TOKEN;
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

// Guard: exit early if required env variables are missing
if (!MONGO_URI) {
	console.error("ERROR: MONGO_URI is not defined. Check your server/.env file.");
	process.exit(1);
}

if (!TMDB_TOKEN) {
	console.warn("WARNING: TMDB_TOKEN is not defined. Movie routes will fail.");
}

// Connect to MongoDB, then start the server
async function startServer() {
	try {
		await mongoose.connect(MONGO_URI);
		console.log("Connected to MongoDB");

		app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
	} catch (err) {
		console.error("MongoDB connection error:", err.message);
		process.exit(1);
	}
}

startServer();

// Route to trending movies
app.get("/api/movies/trending", async (req, res) => {
	try {
		// We call TMDB from the server
		const response = await axios.get(
			"https://api.themoviedb.org/3/trending/movie/day",
			{
				headers: {
					Authorization: `Bearer ${TMDB_TOKEN}`,
					Accept: "application/json",
				},
			}
		);

		// Send the data back to the Frontend
		res.json(response.data.results);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Failed to fetch movies" });
	}
});


// Route to search movies
app.get("/api/search", async (req, res) => {
	const query = req.query.q || req.query.query;
	if (!query) {
		return res.status(400).json({ error: "Query parameter 'q' or 'query' is required" });
	}
	try {
		const response = await axios.get(
			"https://api.themoviedb.org/3/search/movie",
			{
				params: { query },
				headers: {
					Authorization: `Bearer ${TMDB_TOKEN}`,
					Accept: "application/json",
				},
			}
		);
		// Send the JSON back to the Frontend
		res.json(response.data);
	} catch (error) {
		console.error("[TMDB /search]", error.message);
		res.status(500).json({ error: "Failed to search movies" });
	}
});

// Route to get movie details by ID
app.get("/api/movies/:id", async (req, res) => {
	const { id } = req.params;
	try {
		const response = await axios.get(
			`https://api.themoviedb.org/3/movie/${id}`,
			{
				params: {
					append_to_response: "credits,videos",
				},
				headers: {
					Authorization: `Bearer ${TMDB_TOKEN}`,
					Accept: "application/json",
				},
			}
		);
		res.json(response.data);
	} catch (error) {
		console.error(`[TMDB /movie/${id}]`, error.message);
		res.status(500).json({ error: "Failed to fetch movie details" });
	}
});

// Route to save a movie to the watchlist
app.post("/api/watchlist", async (req, res) => {
	try {
		const { userId, tmdbId, title, posterPath, genres, voteAverage } = req.body;

		// Validation
		if (!userId) {
			return res.status(400).json({ error: "userId is required" });
		}
		if (!tmdbId) {
			return res.status(400).json({ error: "tmdbId is required" });
		}
		if (!title) {
			return res.status(400).json({ error: "title is required" });
		}

		// Check if movie already exists in watchlist for this user
		const existingMovie = await Movie.findOne({ userId, tmdbId });
		if (existingMovie) {
			return res.status(400).json({ error: "Movie already in watchlist" });
		}

		// Create and save new watchlist item
		const movie = new Movie({
			userId,
			tmdbId,
			title,
			posterPath: posterPath || "",
			genres: genres || [],
			voteAverage: voteAverage || 0,
			watched: false,
		});

		await movie.save();
		res.status(201).json(movie);
	} catch (error) {
		console.error("[POST /api/watchlist]", error.message);
		res.status(500).json({ error: "Failed to save movie to watchlist" });
	}
});

// Route to fetch all watchlist movies for a user
app.get("/api/watchlist/:userId", async (req, res) => {
	const { userId } = req.params;
	try {
		const watchlist = await Movie.find({ userId }).sort({ createdAt: -1 });
		res.json(watchlist);
	} catch (error) {
		console.error(`[GET /api/watchlist/${userId}]`, error.message);
		res.status(500).json({ error: "Failed to fetch watchlist" });
	}
});

// Route to remove a movie from the watchlist
app.delete("/api/watchlist/:id", async (req, res) => {
	const { id } = req.params;
	try {
		const deletedMovie = await Movie.findByIdAndDelete(id);
		if (!deletedMovie) {
			return res.status(404).json({ error: "Watchlist item not found" });
		}
		res.json({ message: "Movie removed from watchlist", deletedMovie });
	} catch (error) {
		console.error(`[DELETE /api/watchlist/${id}]`, error.message);
		res.status(500).json({ error: "Failed to remove movie from watchlist" });
	}
});
