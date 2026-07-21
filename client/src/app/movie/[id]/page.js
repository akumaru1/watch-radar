"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

import MovieDetail from "./_components/MovieDetail";
import MovieTrailer from "./_components/MovieTrailer";
import MovieCast from "./_components/MovieCast";
import MovieStats from "./_components/MovieStats";
import MovieSkeleton from "./_components/MovieSkeleton";


export default function MovieDetailPage() {
	const params = useParams();
	const { id } = params;

	const [movie, setMovie] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const { isLoaded, isSignedIn, userId } = useAuth();
	const [isWatchlisted, setIsWatchlisted] = useState(false);

	const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

	// Check if this movie is on the watchlist
	useEffect(() => {
		if (!isLoaded || !isSignedIn || !userId || !id) {
			setIsWatchlisted(false);
			return;
		}

		const checkWatchlist = async () => {
			try {
				const res = await fetch(`${API_BASE_URL}/api/watchlist/${userId}`);
				if (res.ok) {
					const data = await res.json();
					const found = data.some((item) => item.tmdbId === Number(id));
					setIsWatchlisted(found);
				}
			} catch (err) {
				console.error("[Check Watchlist Error]:", err.message);
			}
		};

		checkWatchlist();
	}, [isLoaded, isSignedIn, userId, id, API_BASE_URL]);

	useEffect(() => {
		if (!id) return;

		const fetchMovieDetails = async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await fetch(`${API_BASE_URL}/api/movies/${id}`);
				if (!res.ok) {
					if (res.status === 404) {
						throw new Error("Movie not found");
					}
					throw new Error(`Server returned status ${res.status}`);
				}
				const data = await res.json();
				setMovie(data);
			} catch (err) {
				console.error("[Fetch Movie Details Error]:", err.message);
				setError(err.message || "Failed to load movie details.");
			} finally {
				setLoading(false);
			}
		};

		fetchMovieDetails();
	}, [id, API_BASE_URL]);

	if (loading) {
		return <MovieSkeleton />;
	}

	if (error || !movie) {
		return (
			<div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
				<div className="bg-red-900/20 border border-red-800 rounded-lg p-8 max-w-md text-center">
					<h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
					<p className="text-gray-300 mb-6">{error || "Could not retrieve movie details."}</p>
					<Link
						href="/"
						className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition inline-block shadow-lg"
					>
						Return to Discovery
					</Link>
				</div>
			</div>
		);
	}

	return (
		<main className="min-h-screen bg-gray-950 text-gray-100 font-sans pb-16 relative overflow-x-hidden">
			{/* Dynamic SEO Title simulation via useEffect */}
			<title>{`${movie.title} - Watch Radar`}</title>

			{/* Content layer */}
			<div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

				{/* MovieDetail renders the backdrop and hero block (genres, title, timeline, overview, poster) */}
				<MovieDetail 
					movie={movie} 
					isWatchlisted={isWatchlisted} 
					onWatchlistAdded={() => setIsWatchlisted(true)} 
				/>


				{/* Two-Column details layout */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 mt-16">
					{/* Left Column (2/3 width on large screens): Trailer & Cast list */}
					<div className="lg:col-span-2 space-y-12">
						<MovieTrailer movie={movie} />
						<MovieCast movie={movie} />
					</div>

					{/* Right Column (1/3 width on large screens): Sidebar details card */}
					<div className="space-y-8">
						<MovieStats movie={movie} />
					</div>
				</div>
			</div>
		</main>
	);
}
