const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
			index: true,
		},
		tmdbId: {
			type: Number,
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		posterPath: {
			type: String,
			default: "",
		},
		genres: {
			type: [String],
			default: [],
		},
		voteAverage: {
			type: Number,
			default: 0,
		},
		mediaType: {
			type: String,
			enum: ["movie", "tv"],
			default: "movie",
		},
		watched: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

const Movie = mongoose.models.Movie || mongoose.model("Movie", movieSchema);

module.exports = Movie;
