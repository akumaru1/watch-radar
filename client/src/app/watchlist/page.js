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

	// Decider State
	const [showDeciderModal, setShowDeciderModal] = useState(false);
	const [deciderState, setDeciderState] = useState("idle");
	const [deciderResult, setDeciderResult] = useState(null);
	const [shuffleIndex, setShuffleIndex] = useState(0);
	const [unwatchedItems, setUnwatchedItems] = useState([]);

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

	const handleToggleWatchedLocal = (id, newWatched) => {
		setWatchlist((prev) =>
			prev.map((movie) =>
				movie._id === id ? { ...movie, watched: newWatched } : movie
			)
		);
	};

	const handleSurpriseMe = () => {
		const unwatched = watchlist.filter((item) => !item.watched);
		if (unwatched.length === 0) {
			alert("All titles in your watchlist are marked as Watched! Mark some as unwatched first to use the Surprise Me selector.");
			return;
		}

		setUnwatchedItems(unwatched);
		setShowDeciderModal(true);
		setDeciderState("shuffling");
		setDeciderResult(null);
	};

	useEffect(() => {
		if (deciderState !== "shuffling" || unwatchedItems.length === 0) return;

		let intervalId;
		let count = 0;
		const totalShuffles = 12;
		const baseDelay = 80;

		const shuffle = () => {
			const randomIndex = Math.floor(Math.random() * unwatchedItems.length);
			setShuffleIndex(randomIndex);
			count++;

			if (count >= totalShuffles) {
				const finalItem = unwatchedItems[Math.floor(Math.random() * unwatchedItems.length)];
				setDeciderResult(finalItem);
				setDeciderState("revealed");
			} else {
				intervalId = setTimeout(shuffle, baseDelay + count * 15);
			}
		};

		intervalId = setTimeout(shuffle, baseDelay);
		return () => clearTimeout(intervalId);
	}, [deciderState, unwatchedItems]);

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
			<main className="min-h-screen bg-gray-950 text-gray-100 font-sans pb-16 relative overflow-x-hidden">
				<div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
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
			<main className="min-h-screen bg-gray-950 text-gray-100 font-sans pb-16 relative overflow-x-hidden">
				<div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
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
		<main className="min-h-screen bg-gray-950 text-gray-100 font-sans pb-16 relative overflow-x-hidden">
			<div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
				<Header />

				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-800">
					<div className="flex items-center gap-3">
						<h2 className="text-2xl font-bold tracking-tight text-white">Your Watchlist</h2>
						<span className="text-xs text-gray-400 font-medium bg-gray-900 border border-gray-850 px-2.5 py-0.5 rounded-full">
							{countText}
						</span>
					</div>
					{watchlist.length > 0 && (
						<button
							onClick={handleSurpriseMe}
							className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition duration-300 text-white font-semibold text-sm rounded-lg shadow-lg shadow-blue-900/30 cursor-pointer group active:scale-95 shrink-0 animate-in fade-in slide-in-from-right-3 duration-200"
						>
							<span className="group-hover:animate-bounce">✨</span> Surprise Me
						</button>
					)}
				</div>

				{watchlist.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
						{watchlist.map((movie) => (
							<MovieCard 
								key={movie._id} 
								movie={movie} 
								isWatchlistPage={true} 
								onRemove={handleRemoveLocal} 
								onToggleWatched={handleToggleWatchedLocal}
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

			{/* Surprise Me Decider Modal */}
			{showDeciderModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-300">
					<div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200">
						
						{/* Decorative glowing gradient backdrops */}
						<div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
						<div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

						{deciderState === "shuffling" ? (
							<div className="flex flex-col items-center justify-center text-center py-8">
								{/* Shuffling image card */}
								<div className="w-48 h-72 bg-gray-800 border border-blue-500/30 rounded-xl overflow-hidden shadow-inner flex items-center justify-center mb-6 relative animate-pulse">
									{unwatchedItems[shuffleIndex] && unwatchedItems[shuffleIndex].posterPath ? (
										<img
											src={`https://image.tmdb.org/t/p/w500${unwatchedItems[shuffleIndex].posterPath}`}
											alt="Shuffling..."
											className="w-full h-full object-cover opacity-60 scale-95 transition-opacity duration-100"
										/>
									) : (
										<span className="text-4xl">🎬</span>
									)}
									<div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent"></div>
									<div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/10 text-center">
										<p className="text-xs font-semibold truncate text-blue-300">
											{unwatchedItems[shuffleIndex]?.title || "Selecting..."}
										</p>
									</div>
								</div>
								
								<h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
									<span className="animate-spin text-lg">✨</span> Shuffling...
								</h3>
								<p className="text-xs text-gray-400 mt-2">
									Finding the perfect title to watch next
								</p>
							</div>
						) : (
							<div className="flex flex-col items-center text-center py-2 w-full">
								<div className="absolute top-4 right-4">
									<button
										onClick={() => setShowDeciderModal(false)}
										className="text-gray-400 hover:text-white transition bg-gray-800/50 hover:bg-gray-800 p-1.5 rounded-full cursor-pointer text-xs"
									>
										✕
									</button>
								</div>

								<div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-4 shadow-sm shadow-blue-500/30">
									🎯 Selected Surprise
								</div>

								{deciderResult && (
									<>
										{/* Final selection card with glowing shadow */}
										<div className="w-48 h-72 rounded-xl overflow-hidden shadow-xl mb-6 relative group border border-gray-700/50 hover:border-blue-500/30 transition duration-300">
											<img
												src={
													deciderResult.posterPath
														? `https://image.tmdb.org/t/p/w500${deciderResult.posterPath}`
														: "https://via.placeholder.com/500x750?text=No+Image"
												}
												alt={deciderResult.title}
												className="w-full h-full object-cover"
											/>
										</div>

										<h3 className="text-xl font-extrabold tracking-tight text-white mb-2 max-w-xs px-2 line-clamp-2">
											{deciderResult.title}
										</h3>

										<div className="flex items-center justify-center gap-2.5 text-[11px] sm:text-xs mb-6 text-gray-300 flex-wrap">
											{deciderResult.voteAverage !== undefined && (
												<span className="bg-yellow-500 text-black px-1.5 py-0.5 rounded font-bold">
													⭐ {deciderResult.voteAverage.toFixed(1)}
												</span>
											)}
											<span className="capitalize bg-gray-800 border border-gray-750 px-2 py-0.5 rounded">
												{deciderResult.mediaType === "tv" ? "TV Show" : "Movie"}
											</span>
											{deciderResult.genres && deciderResult.genres.length > 0 && (
												<span className="text-gray-400 truncate max-w-[120px]">
													{deciderResult.genres[0]}
												</span>
											)}
										</div>

										<div className="flex flex-col gap-2 w-full">
											<Link
												href={`/${deciderResult.mediaType || "movie"}/${deciderResult.tmdbId}`}
												className="w-full py-2 bg-blue-600 hover:bg-blue-500 transition text-white font-semibold rounded-lg text-sm shadow-md shadow-blue-900/30 text-center cursor-pointer"
											>
												Go to Details
											</Link>
											<button
												onClick={() => {
													setDeciderState("shuffling");
													setDeciderResult(null);
												}}
												className="w-full py-2 bg-gray-850 hover:bg-gray-800 transition text-gray-250 border border-gray-750 font-semibold rounded-lg text-sm cursor-pointer"
											>
												Roll Again
											</button>
										</div>
									</>
								)}
							</div>
						)}
					</div>
				</div>
			)}
		</main>
	);
}
