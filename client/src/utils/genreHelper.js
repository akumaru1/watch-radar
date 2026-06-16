export const GENRE_MAP = {
	28: "Action",
	12: "Adventure",
	16: "Animation",
	35: "Comedy",
	80: "Crime",
	99: "Documentary",
	18: "Drama",
	10751: "Family",
	14: "Fantasy",
	36: "History",
	27: "Horror",
	10402: "Music",
	9648: "Mystery",
	10749: "Romance",
	878: "Science Fiction",
	10770: "TV Movie",
	53: "Thriller",
	10752: "War",
	37: "Western",
};

export const getGenreNames = (movie) => {
	if (movie.genres) {
		return movie.genres.map((g) => g.name || g);
	}
	if (movie.genre_ids) {
		return movie.genre_ids.map((id) => GENRE_MAP[id]).filter(Boolean);
	}
	return [];
};
