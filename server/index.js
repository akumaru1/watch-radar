const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

const TMDB_TOKEN = process.env.TMDB_TOKEN;

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

app.listen(5000, () => console.log("Server running on port 5000"));