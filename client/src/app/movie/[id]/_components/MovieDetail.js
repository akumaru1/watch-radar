"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function MovieDetail({ movie, isWatchlisted = false, onWatchlistAdded }) {
	const { isLoaded, isSignedIn, userId } = useAuth();
	const router = useRouter();
	const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

	const [localWatchlisted, setLocalWatchlisted] = useState(isWatchlisted);
	const [localStatus, setLocalStatus] = useState("Plan to Watch");
	const [localWatchlistId, setLocalWatchlistId] = useState(null);

	useEffect(() => {
		setLocalWatchlisted(isWatchlisted);
	}, [isWatchlisted]);

	useEffect(() => {
		if (!isLoaded || !isSignedIn || !userId || !movie?.id) return;
		const fetchStatus = async () => {
			try {
				const res = await fetch(`${API_BASE_URL}/api/watchlist/${userId}`);
				if (res.ok) {
					const data = await res.json();
					const found = data.find(
						(item) => item.tmdbId === Number(movie.id) && item.mediaType !== "tv"
					);
					if (found) {
						setLocalWatchlisted(true);
						setLocalStatus(found.status || (found.watched ? "Completed" : "Plan to Watch"));
						setLocalWatchlistId(found._id);
					}
				}
			} catch (err) {
				console.error("[Fetch Watchlist Detail Status Error]:", err.message);
			}
		};
		fetchStatus();
	}, [isLoaded, isSignedIn, userId, movie?.id, API_BASE_URL]);

	const handleWatchlistAddWithStatus = async (chosenStatus) => {
		if (!isSignedIn) {
			router.push("/sign-in");
			return;
		}

		const statusToSave = chosenStatus || "Plan to Watch";

		try {
			const genres = movie.genres?.map((g) => g.name || g) || [];
			const res = await fetch(`${API_BASE_URL}/api/watchlist`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId,
					tmdbId: movie.id,
					title: movie.title,
					posterPath: movie.poster_path || "",
					genres,
					voteAverage: movie.vote_average,
					mediaType: "movie",
					status: statusToSave,
				}),
			});

			if (!res.ok) {
				const data = await res.json();
				alert(data.error || "Failed to add movie to watchlist");
			} else {
				const savedItem = await res.json();
				setLocalWatchlisted(true);
				setLocalStatus(savedItem.status || statusToSave);
				if (savedItem._id) setLocalWatchlistId(savedItem._id);
				if (onWatchlistAdded) {
					onWatchlistAdded();
				}
			}
		} catch (err) {
			console.error("[Watchlist Add Error]:", err.message);
			alert("Failed to add movie to watchlist.");
		}
	};

	const handleRemoveClick = async () => {
		if (!isSignedIn || !userId) {
			router.push("/sign-in");
			return;
		}

		try {
			const deleteUrl = localWatchlistId
				? `${API_BASE_URL}/api/watchlist/${localWatchlistId}`
				: `${API_BASE_URL}/api/watchlist/user/${userId}/item/${movie.id}?mediaType=movie`;

			const res = await fetch(deleteUrl, { method: "DELETE" });
			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Failed to remove");
			}

			setLocalWatchlisted(false);
			setLocalWatchlistId(null);
		} catch (err) {
			console.error("[Watchlist Remove Error]:", err.message);
			alert("Failed to remove movie from watchlist.");
		}
	};

	const handleStatusChange = async (newStatus) => {
		if (!localWatchlisted || !localWatchlistId) {
			return handleWatchlistAddWithStatus(newStatus);
		}

		try {
			const res = await fetch(`${API_BASE_URL}/api/watchlist/${localWatchlistId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: newStatus }),
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Failed to update status");
			}

			const updated = await res.json();
			setLocalStatus(updated.status);
		} catch (err) {
			console.error("[Watchlist Status Error]:", err.message);
			alert("Failed to update status.");
		}
	};

	const backdropUrl = movie.backdrop_path
		? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
		: null;

	const posterUrl = movie.poster_path
		? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
		: "https://via.placeholder.com/500x750?text=No+Image";

	return (
		<>
			{/* Full-width backdrop header banner with fading overlay */}
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-screen max-w-none h-[60vh] md:h-[70vh] z-0 pointer-events-none">
				{backdropUrl ? (
					<>
						<Image
							src={backdropUrl}
							alt={movie.title}
							fill
							className="object-cover opacity-20 filter blur-xs"
							priority
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent"></div>
					</>
				) : (
					<div className="w-full h-full bg-gradient-to-b from-blue-950/10 via-gray-950 to-gray-950"></div>
				)}
			</div>

			{/* Main Movie Hero Section */}
			<section className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-12">
				{/* Left Column: Poster Card */}
				<div className="flex justify-center md:justify-start">
					<div className="relative w-72 h-[432px] md:w-full md:h-[480px] lg:h-[540px] rounded-2xl overflow-hidden shadow-2xl border border-gray-800 transition hover:scale-[1.02] duration-300">
						<Image
							src={posterUrl}
							alt={movie.title}
							fill
							className="object-cover"
							sizes="(max-width: 768px) 288px, 380px"
						/>
					</div>
				</div>

				{/* Right Columns: Main Info */}
				<div className="md:col-span-2 flex flex-col justify-center">
					<div className="space-y-4">
						{/* Genres Badges */}
						<div className="flex flex-wrap gap-2">
							{movie.genres?.map((genre) => (
								<span
									key={genre.id}
									className="px-3.5 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20"
								>
									{genre.name}
								</span>
							))}
						</div>

						{/* Title & Tagline */}
						<h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
							{movie.title}
						</h1>
						{movie.tagline && (
							<p className="text-xl md:text-2xl text-gray-400 italic font-light">
								&ldquo;{movie.tagline}&rdquo;
							</p>
						)}

						{/* Rating, runtime, release row */}
						<div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-300 pt-2 border-y border-gray-900 py-3">
							<div className="flex items-center gap-1.5">
								<span className="text-yellow-500 font-bold text-base">⭐</span>
								<span className="font-bold text-white text-base">
									{movie.vote_average?.toFixed(1) || "0.0"}
								</span>
								<span className="text-gray-500">
									({movie.vote_count?.toLocaleString() || 0} votes)
								</span>
							</div>

							<div className="h-4 w-px bg-gray-800 hidden sm:block"></div>

							<div className="flex items-center gap-1">
								<span className="text-gray-400">Released:</span>
								<span className="font-medium text-white">
									{movie.release_date
										? new Date(movie.release_date).toLocaleDateString("en-US", {
												year: "numeric",
												month: "long",
												day: "numeric",
											})
										: "Unknown"}
								</span>
							</div>

							<div className="h-4 w-px bg-gray-800 hidden sm:block"></div>

							<div className="flex items-center gap-1">
								<span className="text-gray-400">Runtime:</span>
								<span className="font-medium text-white">{movie.runtime || 0} min</span>
							</div>
						</div>

						{/* Overview */}
						<div className="pt-4 space-y-2">
							<h2 className="text-lg font-semibold text-gray-200">Overview</h2>
							<p className="text-gray-300 leading-relaxed text-base md:text-lg">
								{movie.overview || "No synopsis available for this movie."}
							</p>
						</div>

						{/* Watchlist Quick-Action Button with attached status dropdown */}
						<div className="pt-6">
							{localWatchlisted ? (
								<div className="inline-flex rounded-xl overflow-hidden border border-emerald-500/30 shadow-lg">
									<button 
										onClick={handleRemoveClick}
										className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition cursor-pointer"
										title="Click to remove from Watchlist"
									>
										<span>✓ Watchlist</span>
									</button>
									<select
										value={localStatus}
										onChange={(e) => handleStatusChange(e.target.value)}
										className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-3 border-l border-emerald-500/40 outline-none cursor-pointer appearance-none text-center"
										title="Change status"
									>
										<option value="Plan to Watch" className="bg-gray-900 text-white">Plan to Watch</option>
										<option value="Currently Watching" className="bg-gray-900 text-white">Watching</option>
										<option value="Completed" className="bg-gray-900 text-white">Completed</option>
										<option value="On Hold" className="bg-gray-900 text-white">On Hold</option>
										<option value="Dropped" className="bg-gray-900 text-white">Dropped</option>
									</select>
								</div>
							) : (
								<div className="inline-flex rounded-xl overflow-hidden border border-blue-500/30 shadow-lg">
									<button 
										onClick={() => handleWatchlistAddWithStatus("Plan to Watch")}
										className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition cursor-pointer"
										title="Add to Watchlist"
									>
										<span>+ Watchlist</span>
									</button>
									<select
										value=""
										onChange={(e) => handleWatchlistAddWithStatus(e.target.value)}
										className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-3 py-3 border-l border-blue-500/40 outline-none cursor-pointer appearance-none text-center"
										title="Select status to add to Watchlist"
									>
										<option value="" disabled hidden>▼</option>
										<option value="Plan to Watch" className="bg-gray-900 text-white">Plan to Watch</option>
										<option value="Currently Watching" className="bg-gray-900 text-white">Watching</option>
										<option value="Completed" className="bg-gray-900 text-white">Completed</option>
										<option value="On Hold" className="bg-gray-900 text-white">On Hold</option>
										<option value="Dropped" className="bg-gray-900 text-white">Dropped</option>
									</select>
								</div>
							)}
						</div>
					</div>
				</div>
			</section>
		</>
	);
}

