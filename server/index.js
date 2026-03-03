const express = require("express");
const axios = require("axios");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

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

// Route to get trending movies
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