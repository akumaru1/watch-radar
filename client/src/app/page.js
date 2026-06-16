"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import Header from "@/components/Header";

export default function Home() {
	// State for list of movies to display
	const [movies, setMovies] = useState([]);
	// State to track if the search/trending fetch is loading
	const [loading, setLoading] = useState(true);
	// State to track error messages
	const [error, setError] = useState(null);
	// State for the user's typed search query
	const [searchQuery, setSearchQuery] = useState("");
	// State for the current list heading
	const [displayTitle, setDisplayTitle] = useState("Trending Movies");

	// Backend API base URL fallback
	const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

	const { isLoaded, isSignedIn, userId } = useAuth();
	const [watchlistIds, setWatchlistIds] = useState(new Set());

	// Fetch watchlist IDs to track what is already saved
	useEffect(() => {
		if (!isLoaded || !isSignedIn || !userId) {
			setWatchlistIds(new Set());
			return;
		}

		const fetchWatchlistIds = async () => {
			try {
				const res = await fetch(`${API_BASE_URL}/api/watchlist/${userId}`);
				if (res.ok) {
					const data = await res.json();
					const ids = new Set(data.map((item) => item.tmdbId));
					setWatchlistIds(ids);
				}
			} catch (err) {
				console.error("[Fetch Watchlist IDs Error]:", err.message);
			}
		};

		fetchWatchlistIds();
	}, [isLoaded, isSignedIn, userId, API_BASE_URL]);

	// Function to fetch trending movies using async/await and try/catch
	const fetchTrendingMovies = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(`${API_BASE_URL}/api/movies/trending`);
			if (!res.ok) {
				throw new Error(`Server returned status ${res.status}`);
			}
			const data = await res.json();
			setMovies(data);
			setDisplayTitle("Trending Movies");
		} catch (err) {
			console.error("[Fetch Trending Error]:", err.message);
			setError("Failed to load trending movies.");
		} finally {
			setLoading(false);
		}
	}, [API_BASE_URL]);

	// Function to execute the search via the backend proxy route
	const handleSearch = async (e) => {
		if (e) e.preventDefault();

		// If query is empty, reset back to trending movies
		if (!searchQuery.trim()) {
			await fetchTrendingMovies();
			return;
		}

		setLoading(true);
		setError(null);
		try {
			const res = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(searchQuery.trim())}`);
			if (!res.ok) {
				throw new Error(`Server returned status ${res.status}`);
			}
			const data = await res.json();

			// TMDB Search returns a response object containing a results array
			const searchResults = data.results || [];

			// Log results to console as required by the checklist
			console.log(`[Search Results for "${searchQuery}"]:`, searchResults);

			setMovies(searchResults);
			setDisplayTitle(`Search Results for "${searchQuery}"`);
		} catch (err) {
			console.error("[Search Error]:", err.message);
			setError("Failed to search movies. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	// Load trending movies on component mount
	useEffect(() => {
		fetchTrendingMovies();
	}, [fetchTrendingMovies]);

	return (
		<main className="p-8 bg-gray-900 min-h-screen text-white">
			<div className="max-w-7xl mx-auto">
				<Header />

				{/* Clean, abstracted Search Bar component */}
				<SearchBar
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
					handleSearch={handleSearch}
					clearSearch={() => {
						setSearchQuery("");
						fetchTrendingMovies();
					}}
				/>

				{/* Dynamic list header */}
				<h2 className="text-2xl font-semibold mb-6 border-b border-gray-800 pb-2">{displayTitle}</h2>

				{/* Loading indicator */}
				{loading && (
					<div className="p-10 text-center text-2xl text-gray-400">Loading...</div>
				)}

				{/* Error message */}
				{error && (
					<div className="p-10 text-center text-2xl text-red-500">{error}</div>
				)}

				{/* Results grid */}
				{!loading && !error && (
					movies.length > 0 ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
							{movies.map((movie) => (
								<MovieCard
									key={movie.id}
									movie={movie}
									isWatchlisted={watchlistIds.has(movie.id)}
									onWatchlistAdded={(tmdbId) => {
										setWatchlistIds((prev) => {
											const next = new Set(prev);
											next.add(tmdbId);
											return next;
										});
									}}
								/>
							))}

						</div>
					) : (
						<div className="p-10 text-center text-xl text-gray-500">
							No movies found. Try searching for something else!
						</div>
					)
				)}
			</div>
		</main>
	);
}