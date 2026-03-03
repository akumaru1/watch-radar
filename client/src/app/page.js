"use client";
import { useState, useEffect } from "react";
import MovieCard from "@/components/MovieCard"; // Import your new component

export default function Home() {
	const [movies, setMovies] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Use environment variable or fallback to localhost
	const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

	useEffect(() => {
		fetch(`${API_BASE_URL}/api/movies/trending`)
			.then((res) => res.json())
			.then((data) => {
				setMovies(data);
				setLoading(false);
			})
			.catch((err) => {
				console.error(err);
				setError("Failed to load movies.");
				setLoading(false);
			});
	}, []);

	if (loading) {
		return <div className="p-10 text-center text-2xl text-white">Loading...</div>;
	}

	if (error) {
		return <div className="p-10 text-center text-2xl text-red-500">{error}</div>;
	}

	return (
		<main className="p-8 bg-gray-900 min-h-screen text-white">
			<h1 className="text-4xl font-bold mb-8 text-center">Trending Movies</h1>
			
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
				{movies.map((movie) => (
					<MovieCard key={movie.id} movie={movie} />
				))}
			</div>
		</main>
	);
}