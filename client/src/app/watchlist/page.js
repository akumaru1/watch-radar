"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import Header from "@/components/Header";
import MovieCard from "@/components/MovieCard";

export default function WatchlistPage() {
	const { isLoaded, isSignedIn, userId } = useAuth();
	const [watchlist, setWatchlist] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

	useEffect(() => {
		if (!isLoaded) return;
		if (!isSignedIn || !userId) {
			setLoading(false);
			return;
		}

		const fetchWatchlist = async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await fetch(`${API_BASE_URL}/api/watchlist/${userId}`);
				if (!res.ok) {
					throw new Error(`Server returned status ${res.status}`);
				}
				const data = await res.json();
				setWatchlist(data);
			} catch (err) {
				console.error("[Fetch Watchlist Error]:", err.message);
				setError("Failed to load watchlist. Please try again later.");
			} finally {
				setLoading(false);
			}
		};

		fetchWatchlist();
	}, [isLoaded, isSignedIn, userId, API_BASE_URL]);

	const handleRemoveLocal = (id) => {
		setWatchlist((prev) => prev.filter((movie) => movie._id !== id));
	};

	const moviesCount = watchlist.filter((item) => item.mediaType === "movie" || !item.mediaType).length;
	const showsCount = watchlist.filter((item) => item.mediaType === "tv").length;

	let countText = "";
	if (moviesCount > 0 && showsCount > 0) {
		countText = `${moviesCount} ${moviesCount === 1 ? "Movie" : "Movies"}, ${showsCount} ${showsCount === 1 ? "Show" : "Shows"}`;
	} else if (showsCount > 0) {
		countText = `${showsCount} ${showsCount === 1 ? "Show" : "Shows"}`;
	} else {
		countText = `${moviesCount} ${moviesCount === 1 ? "Movie" : "Movies"}`;
	}

	if (!isLoaded || loading) {
		return (
			<main className="p-8 bg-gray-900 min-h-screen text-white">
				<div className="max-w-7xl mx-auto">
					<Header />
					<div className="flex flex-col items-center justify-center py-20">
						<div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
						<p className="mt-4 text-gray-400 text-lg">Loading your watchlist...</p>
					</div>
				</div>
			</main>
		);
	}

	if (error) {
		return (
			<main className="p-8 bg-gray-900 min-h-screen text-white">
				<div className="max-w-7xl mx-auto">
					<Header />
					<div className="flex flex-col items-center justify-center py-20 text-center">
						<div className="text-red-500 text-5xl mb-4">⚠️</div>
						<p className="text-red-400 text-xl font-semibold">{error}</p>
						<button 
							onClick={() => window.location.reload()}
							className="mt-6 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 transition rounded-lg font-medium text-sm"
						>
							Retry
						</button>
					</div>
				</div>
			</main>
		);
	}

	return (
		<main className="p-8 bg-gray-900 min-h-screen text-white">
			<div className="max-w-7xl mx-auto">
				<Header />

				<div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-800">
					<h2 className="text-2xl font-semibold">Your Watchlist</h2>
					<span className="text-sm text-gray-400 font-medium bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
						{countText}
					</span>
				</div>

				{watchlist.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
						{watchlist.map((movie) => (
							<MovieCard 
								key={movie._id} 
								movie={movie} 
								isWatchlistPage={true} 
								onRemove={handleRemoveLocal} 
							/>
						))}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center py-20 text-center bg-gray-800/20 border border-gray-800 rounded-2xl p-8">
						<div className="text-gray-600 text-7xl mb-4">🎬</div>
						<h3 className="text-xl font-bold mb-2">Your watchlist is empty</h3>
						<p className="text-gray-400 max-w-md mb-6 text-sm">
							Explore trending titles or search for your favorite movies to add them to your watchlist.
						</p>
						<Link 
							href="/" 
							className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 transition text-white font-medium rounded-lg text-sm shadow-md shadow-blue-900/30"
						>
							Go to Discovery
						</Link>
					</div>
				)}
			</div>
		</main>
	);
}
