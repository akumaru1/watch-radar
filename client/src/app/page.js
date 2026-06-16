"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import Header from "@/components/Header";

export default function Home() {
	// State for list of movies to display
	const [movies, setMovies] = useState([]);
	// State for list of TV shows to display
	const [shows, setShows] = useState([]);
	// State to track if the search/trending fetch is loading
	const [loading, setLoading] = useState(true);
	// State to track error messages
	const [error, setError] = useState(null);
	// State for the user's typed search query
	const [searchQuery, setSearchQuery] = useState("");

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

	// Function to fetch trending movies and TV shows in parallel
	const fetchTrendingContent = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const [moviesRes, showsRes] = await Promise.all([
				fetch(`${API_BASE_URL}/api/movies/trending`),
				fetch(`${API_BASE_URL}/api/shows/trending`)
			]);

			if (!moviesRes.ok || !showsRes.ok) {
				throw new Error("Failed to fetch trending content from server");
			}

			const [moviesData, showsData] = await Promise.all([
				moviesRes.json(),
				showsRes.json()
			]);

			setMovies(moviesData);
			setShows(showsData);
		} catch (err) {
			console.error("[Fetch Trending Error]:", err.message);
			setError("Failed to load trending content.");
		} finally {
			setLoading(false);
		}
	}, [API_BASE_URL]);

	// Function to execute search on both movies and TV shows
	const handleSearch = async (e) => {
		if (e) e.preventDefault();

		// If query is empty, reset back to trending content
		if (!searchQuery.trim()) {
			await fetchTrendingContent();
			return;
		}

		setLoading(true);
		setError(null);
		try {
			const [moviesRes, showsRes] = await Promise.all([
				fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(searchQuery.trim())}`),
				fetch(`${API_BASE_URL}/api/search/shows?q=${encodeURIComponent(searchQuery.trim())}`)
			]);

			if (!moviesRes.ok || !showsRes.ok) {
				throw new Error("Failed to search content from server");
			}

			const [moviesData, showsData] = await Promise.all([
				moviesRes.json(),
				showsRes.json()
			]);

			const searchMoviesResults = moviesData.results || [];
			const searchShowsResults = showsData.results || [];

			console.log(`[Search Results for "${searchQuery}"]:`, {
				movies: searchMoviesResults,
				shows: searchShowsResults,
			});

			setMovies(searchMoviesResults);
			setShows(searchShowsResults);
		} catch (err) {
			console.error("[Search Error]:", err.message);
			setError("Failed to search content. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	// Load trending content on component mount
	useEffect(() => {
		fetchTrendingContent();
	}, [fetchTrendingContent]);

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
						fetchTrendingContent();
					}}
				/>

				{/* Loading indicator */}
				{loading && (
					<div className="p-10 text-center text-2xl text-gray-400">Loading...</div>
				)}

				{/* Error message */}
				{error && (
					<div className="p-10 text-center text-2xl text-red-500">{error}</div>
				)}

				{/* Results layout */}
				{!loading && !error && (
					searchQuery.trim() ? (
						// Search Results View
						<div className="space-y-12">
							{/* Movie Results Section */}
							<section>
								<h2 className="text-2xl font-semibold mb-6 border-b border-gray-800 pb-2 flex items-center gap-2">
									<span>🎬</span> Movie Search Results for "{searchQuery}"
								</h2>
								{movies.length > 0 ? (
									<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
										{movies.slice(0, 18).map((movie) => (
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
									<div className="p-6 text-center text-lg text-gray-500 bg-gray-850/10 border border-gray-800 rounded-xl">
										No movies found matching "{searchQuery}".
									</div>
								)}
							</section>

							{/* TV Show Results Section */}
							<section>
								<h2 className="text-2xl font-semibold mb-6 border-b border-gray-800 pb-2 flex items-center gap-2">
									<span>📺</span> TV Show Search Results for "{searchQuery}"
								</h2>
								{shows.length > 0 ? (
									<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
										{shows.slice(0, 18).map((show) => (
											<MovieCard
												key={show.id}
												movie={show}
												isWatchlisted={watchlistIds.has(show.id)}
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
									<div className="p-6 text-center text-lg text-gray-500 bg-gray-850/10 border border-gray-800 rounded-xl">
										No TV shows found matching "{searchQuery}".
									</div>
								)}
							</section>
						</div>
					) : (
						// Trending View
						<div className="space-y-12">
							{/* Trending Movies Section */}
							<section>
								<h2 className="text-2xl font-semibold mb-6 border-b border-gray-800 pb-2 flex items-center gap-2">
									<span>🎬</span> Trending Movies
								</h2>
								{movies.length > 0 ? (
									<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
										{movies.slice(0, 18).map((movie) => (
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
									<div className="p-6 text-center text-lg text-gray-500">
										No trending movies available.
									</div>
								)}
							</section>

							{/* Trending TV Shows Section */}
							<section>
								<h2 className="text-2xl font-semibold mb-6 border-b border-gray-800 pb-2 flex items-center gap-2">
									<span>📺</span> Trending TV Shows
								</h2>
								{shows.length > 0 ? (
									<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
										{shows.slice(0, 18).map((show) => (
											<MovieCard
												key={show.id}
												movie={show}
												isWatchlisted={watchlistIds.has(show.id)}
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
									<div className="p-6 text-center text-lg text-gray-500">
										No trending TV shows available.
									</div>
								)}
							</section>
						</div>
					)
				)}
			</div>
		</main>
	);
}