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

// Route to trending TV shows
app.get("/api/shows/trending", async (req, res) => {
	try {
		const response = await axios.get(
			"https://api.themoviedb.org/3/trending/tv/day",
			{
				headers: {
					Authorization: `Bearer ${TMDB_TOKEN}`,
					Accept: "application/json",
				},
			}
		);
		res.json(response.data.results);
	} catch (error) {
		console.error("[TMDB /shows/trending]", error.message);
		res.status(500).json({ error: "Failed to fetch TV shows" });
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

// Route to search TV shows
app.get("/api/search/shows", async (req, res) => {
	const query = req.query.q || req.query.query;
	if (!query) {
		return res.status(400).json({ error: "Query parameter 'q' or 'query' is required" });
	}
	try {
		const response = await axios.get(
			"https://api.themoviedb.org/3/search/tv",
			{
				params: { query },
				headers: {
					Authorization: `Bearer ${TMDB_TOKEN}`,
					Accept: "application/json",
				},
			}
		);
		res.json(response.data);
	} catch (error) {
		console.error("[TMDB /search/shows]", error.message);
		res.status(500).json({ error: "Failed to search TV shows" });
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

// Route to get TV show details by ID
app.get("/api/shows/:id", async (req, res) => {
	const { id } = req.params;
	try {
		const response = await axios.get(
			`https://api.themoviedb.org/3/tv/${id}`,
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
		console.error(`[TMDB /shows/${id}]`, error.message);
		res.status(500).json({ error: "Failed to fetch TV show details" });
	}
});

// Route to save a movie or TV show to the watchlist
app.post("/api/watchlist", async (req, res) => {
	try {
		const { userId, tmdbId, title, posterPath, genres, voteAverage, mediaType, status, episodesWatched, totalEpisodes } = req.body;

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

		const resolvedMediaType = mediaType || "movie";

		// Check if item already exists in watchlist for this user
		const existingMovie = await Movie.findOne({ userId, tmdbId, mediaType: resolvedMediaType });
		if (existingMovie) {
			return res.status(400).json({ error: `${resolvedMediaType === "tv" ? "TV show" : "Movie"} already in watchlist` });
		}

		let resolvedTotalEpisodes = typeof totalEpisodes === "number" && totalEpisodes > 0 ? totalEpisodes : 1;

		// Fetch total episodes from TMDB for TV shows if not provided
		if (resolvedMediaType === "tv" && (!totalEpisodes || totalEpisodes <= 0) && TMDB_TOKEN) {
			try {
				const tmdbRes = await axios.get(`https://api.themoviedb.org/3/tv/${tmdbId}`, {
					headers: {
						Authorization: `Bearer ${TMDB_TOKEN}`,
						Accept: "application/json",
					},
				});
				if (tmdbRes.data && tmdbRes.data.number_of_episodes) {
					resolvedTotalEpisodes = tmdbRes.data.number_of_episodes;
				}
			} catch (tmdbErr) {
				console.warn(`[TMDB fetch episodes for ${tmdbId}]`, tmdbErr.message);
			}
		}

		const initialStatus = status || "Plan to Watch";
		let initialEpisodesWatched = typeof episodesWatched === "number" ? episodesWatched : 0;

		if (initialStatus === "Completed") {
			initialEpisodesWatched = resolvedTotalEpisodes;
		}

		initialEpisodesWatched = Math.max(0, Math.min(initialEpisodesWatched, resolvedTotalEpisodes));
		const isWatched = initialStatus === "Completed";

		// Create and save new watchlist item
		const movie = new Movie({
			userId,
			tmdbId,
			title,
			posterPath: posterPath || "",
			genres: genres || [],
			voteAverage: voteAverage || 0,
			mediaType: resolvedMediaType,
			status: initialStatus,
			episodesWatched: initialEpisodesWatched,
			totalEpisodes: resolvedTotalEpisodes,
			watched: isWatched,
		});

		await movie.save();
		res.status(201).json(movie);
	} catch (error) {
		console.error("[POST /api/watchlist]", error.message);
		res.status(500).json({ error: "Failed to save item to watchlist" });
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

// Route to update a watchlist item (status, episode progress, or legacy watched status)
app.patch("/api/watchlist/:id", async (req, res) => {
	const { id } = req.params;
	const { watched, status, episodesWatched, totalEpisodes } = req.body;

	try {
		const existingItem = await Movie.findById(id);
		if (!existingItem) {
			return res.status(404).json({ error: "Watchlist item not found" });
		}

		let newTotalEpisodes = typeof totalEpisodes === "number" && totalEpisodes > 0 ? totalEpisodes : (existingItem.totalEpisodes || 1);
		let newStatus = status !== undefined ? status : (existingItem.status || (existingItem.watched ? "Completed" : "Plan to Watch"));
		let newEpisodesWatched = episodesWatched !== undefined ? episodesWatched : (existingItem.episodesWatched !== undefined ? existingItem.episodesWatched : (existingItem.watched ? newTotalEpisodes : 0));
		let newWatched = existingItem.watched;

		// Handle legacy `{ watched: boolean }` if status/episodesWatched not explicitly sent
		if (typeof watched === "boolean" && status === undefined && episodesWatched === undefined) {
			if (watched) {
				newStatus = "Completed";
				newEpisodesWatched = newTotalEpisodes;
				newWatched = true;
			} else {
				newStatus = "Plan to Watch";
				newEpisodesWatched = 0;
				newWatched = false;
			}
		} else {
			// If status explicitly updated
			if (status !== undefined) {
				if (status === "Completed") {
					newEpisodesWatched = newTotalEpisodes;
					newWatched = true;
				} else {
					newWatched = false;
					// If user manually changed status to non-completed while episodesWatched was full, decrement by 1 so it doesn't auto-flip back to Completed
					if (newEpisodesWatched >= newTotalEpisodes && newTotalEpisodes > 1) {
						newEpisodesWatched = newTotalEpisodes - 1;
					}
				}
			}

			// If episodesWatched explicitly updated or adjusted
			if (episodesWatched !== undefined) {
				newEpisodesWatched = Math.max(0, Math.min(newEpisodesWatched, newTotalEpisodes));
				if (newEpisodesWatched === newTotalEpisodes && newTotalEpisodes > 0) {
					newStatus = "Completed";
					newWatched = true;
				} else if (newEpisodesWatched < newTotalEpisodes) {
					if (newStatus === "Completed") {
						newStatus = newEpisodesWatched > 0 ? "Currently Watching" : "Plan to Watch";
					}
					newWatched = false;
				}
			}
		}

		existingItem.status = newStatus;
		existingItem.episodesWatched = newEpisodesWatched;
		existingItem.totalEpisodes = newTotalEpisodes;
		existingItem.watched = newWatched;

		const updatedMovie = await existingItem.save();
		res.json(updatedMovie);
	} catch (error) {
		console.error(`[PATCH /api/watchlist/${id}]`, error.message);
		res.status(500).json({ error: "Failed to update watchlist item" });
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

// Route to remove a movie/show from the watchlist by userId and tmdbId
app.delete("/api/watchlist/user/:userId/item/:tmdbId", async (req, res) => {
	const { userId, tmdbId } = req.params;
	const { mediaType } = req.query;

	try {
		const query = { userId, tmdbId: Number(tmdbId) };
		if (mediaType) {
			query.mediaType = mediaType;
		}

		const deletedMovie = await Movie.findOneAndDelete(query);
		if (!deletedMovie) {
			return res.status(404).json({ error: "Watchlist item not found" });
		}
		res.json({ message: "Item removed from watchlist", deletedMovie });
	} catch (error) {
		console.error(`[DELETE /api/watchlist/user/${userId}/item/${tmdbId}]`, error.message);
		res.status(500).json({ error: "Failed to remove item from watchlist" });
	}
});

// Helper to calculate statistics from a watchlist
function calculateWatchlistStats(watchlist) {
	const genreCounts = {};
	let watchedCount = 0;
	let totalRating = 0;
	let ratedCount = 0;
	let movieCount = 0;
	let tvCount = 0;

	watchlist.forEach((item) => {
		// Aggregate genres
		if (item.genres && Array.isArray(item.genres)) {
			item.genres.forEach((genre) => {
				genreCounts[genre] = (genreCounts[genre] || 0) + 1;
			});
		}

		// Count watched
		if (item.watched || item.status === "Completed") {
			watchedCount++;
		}

		// Count media types
		if (item.mediaType === "tv") {
			tvCount++;
		} else {
			movieCount++;
		}

		// Count average rating
		if (typeof item.voteAverage === "number" && item.voteAverage > 0) {
			totalRating += item.voteAverage;
			ratedCount++;
		}
	});

	// Transform genre counts to sorted array for Recharts
	const genres = Object.keys(genreCounts)
		.map((name) => ({
			name,
			count: genreCounts[name],
		}))
		.sort((a, b) => b.count - a.count);

	const totalItems = watchlist.length;
	const unwatchedCount = totalItems - watchedCount;
	const averageRating = ratedCount > 0 ? Number((totalRating / ratedCount).toFixed(1)) : 0;

	return {
		totalItems,
		movieCount,
		tvCount,
		watchedCount,
		unwatchedCount,
		averageRating,
		genres,
	};
}

// Route to fetch watchlist statistics for a user
app.get("/api/watchlist/:userId/stats", async (req, res) => {
	const { userId } = req.params;
	try {
		const watchlist = await Movie.find({ userId });
		const stats = calculateWatchlistStats(watchlist);
		res.json(stats);
	} catch (error) {
		console.error(`[GET /api/watchlist/${userId}/stats]`, error.message);
		res.status(500).json({ error: "Failed to fetch watchlist statistics" });
	}
});

