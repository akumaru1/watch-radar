"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function TVDetail({ show, isWatchlisted = false, onWatchlistAdded }) {
	const { isLoaded, isSignedIn, userId } = useAuth();
	const router = useRouter();
	const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

	const [localWatchlisted, setLocalWatchlisted] = useState(isWatchlisted);
	const [localStatus, setLocalStatus] = useState("Plan to Watch");
	const [localWatchlistId, setLocalWatchlistId] = useState(null);
	const [episodesWatched, setEpisodesWatched] = useState(0);
	const [totalEpisodes, setTotalEpisodes] = useState(show?.number_of_episodes || 1);

	useEffect(() => {
		setLocalWatchlisted(isWatchlisted);
	}, [isWatchlisted]);

	useEffect(() => {
		if (!isLoaded || !isSignedIn || !userId || !show?.id) return;
		const fetchStatus = async () => {
			try {
				const res = await fetch(`${API_BASE_URL}/api/watchlist/${userId}`);
				if (res.ok) {
					const data = await res.json();
					const found = data.find(
						(item) => item.tmdbId === Number(show.id) && item.mediaType === "tv"
					);
					if (found) {
						setLocalWatchlisted(true);
						setLocalStatus(found.status || (found.watched ? "Completed" : "Plan to Watch"));
						setLocalWatchlistId(found._id);
						setEpisodesWatched(found.episodesWatched || 0);
						if (found.totalEpisodes) setTotalEpisodes(found.totalEpisodes);
					}
				}
			} catch (err) {
				console.error("[Fetch Watchlist TV Detail Status Error]:", err.message);
			}
		};
		fetchStatus();
	}, [isLoaded, isSignedIn, userId, show?.id, API_BASE_URL]);

	const handleWatchlistAddWithStatus = async (chosenStatus) => {
		if (!isSignedIn) {
			router.push("/sign-in");
			return;
		}

		const statusToSave = chosenStatus || "Plan to Watch";

		try {
			const genres = show.genres?.map((g) => g.name || g) || [];
			const res = await fetch(`${API_BASE_URL}/api/watchlist`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId,
					tmdbId: show.id,
					title: show.name,
					posterPath: show.poster_path || "",
					genres,
					voteAverage: show.vote_average,
					mediaType: "tv",
					status: statusToSave,
				}),
			});

			if (!res.ok) {
				const data = await res.json();
				alert(data.error || "Failed to add show to watchlist");
			} else {
				const savedItem = await res.json();
				setLocalWatchlisted(true);
				setLocalStatus(savedItem.status || statusToSave);
				if (savedItem._id) setLocalWatchlistId(savedItem._id);
				setEpisodesWatched(savedItem.episodesWatched || 0);
				if (savedItem.totalEpisodes) setTotalEpisodes(savedItem.totalEpisodes);
				if (onWatchlistAdded) {
					onWatchlistAdded();
				}
			}
		} catch (err) {
			console.error("[Watchlist Add Error]:", err.message);
			alert("Failed to add show to watchlist.");
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
				: `${API_BASE_URL}/api/watchlist/user/${userId}/item/${show.id}?mediaType=tv`;

			const res = await fetch(deleteUrl, { method: "DELETE" });
			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Failed to remove");
			}

			setLocalWatchlisted(false);
			setLocalWatchlistId(null);
		} catch (err) {
			console.error("[Watchlist Remove Error]:", err.message);
			alert("Failed to remove TV show from watchlist.");
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

	const handleEpisodeChange = async (delta) => {
		const nextEp = episodesWatched + delta;
		if (nextEp < 0 || nextEp > totalEpisodes) return;
		if (!localWatchlistId) return;

		try {
			const res = await fetch(`${API_BASE_URL}/api/watchlist/${localWatchlistId}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ episodesWatched: nextEp }),
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Failed to update episode progress");
			}

			const updated = await res.json();
			setLocalStatus(updated.status);
			setEpisodesWatched(updated.episodesWatched);
		} catch (err) {
			console.error("[Watchlist Episode Update Error]:", err.message);
			alert("Failed to update episode progress.");
		}
	};

	const backdropUrl = show.backdrop_path
		? `https://image.tmdb.org/t/p/original${show.backdrop_path}`
		: null;

	const posterUrl = show.poster_path
		? `https://image.tmdb.org/t/p/w500${show.poster_path}`
		: "https://via.placeholder.com/500x750?text=No+Image";

	// Handle runtime (often an array in TV API)
	const episodeRuntime = show.episode_run_time?.length > 0
		? `${show.episode_run_time[0]} min`
		: "N/A";

	// Dynamic Season Mapping Logic
	const validSeasons = show?.seasons?.filter(s => s.season_number > 0).sort((a, b) => a.season_number - b.season_number) || [];
	let cumulative = 0;
	const seasonData = validSeasons.map(s => {
		const start = cumulative;
		cumulative += s.episode_count;
		return { ...s, startEp: start, endEp: cumulative };
	});

	let activeSeasonIndex = 0;
	let activeSeasonWatched = episodesWatched;
	let activeSeasonTotal = totalEpisodes;

	if (seasonData.length > 0) {
		for (let i = 0; i < seasonData.length; i++) {
			if (episodesWatched >= seasonData[i].startEp && episodesWatched < seasonData[i].endEp) {
				activeSeasonIndex = i;
				activeSeasonWatched = episodesWatched - seasonData[i].startEp;
				break;
			} else if (episodesWatched >= seasonData[i].endEp) {
				if (i === seasonData.length - 1) {
					activeSeasonIndex = i;
					activeSeasonWatched = seasonData[i].episode_count;
				}
			}
		}
		activeSeasonTotal = seasonData[activeSeasonIndex].episode_count;
	}

	const handleSeasonJump = (index) => {
		const targetSeason = seasonData[Number(index)];
		if (targetSeason) {
			// Jump to the start of this season by computing the absolute delta
			handleEpisodeChange(targetSeason.startEp - episodesWatched);
		}
	};

	return (
		<>
			{/* Full-width backdrop header banner with fading overlay */}
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-screen max-w-none h-[60vh] md:h-[70vh] z-0 pointer-events-none">
				{backdropUrl ? (
					<>
						<Image
							src={backdropUrl}
							alt={show.name}
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

			{/* Main TV Hero Section */}
			<section className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-12">
				{/* Left Column: Poster Card */}
				<div className="flex justify-center md:justify-start">
					<div className="relative w-72 h-[432px] md:w-full md:h-[480px] lg:h-[540px] rounded-2xl overflow-hidden shadow-2xl border border-gray-800 transition hover:scale-[1.02] duration-300">
						<Image
							src={posterUrl}
							alt={show.name}
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
							{show.genres?.map((genre) => (
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
							{show.name}
						</h1>
						{show.tagline && (
							<p className="text-xl md:text-2xl text-gray-400 italic font-light">
								&ldquo;{show.tagline}&rdquo;
							</p>
						)}

						{/* Rating, episode runtime, first air date row */}
						<div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-300 pt-2 border-y border-gray-900 py-3">
							<div className="flex items-center gap-1.5">
								<span className="text-yellow-500 font-bold text-base">⭐</span>
								<span className="font-bold text-white text-base">
									{show.vote_average?.toFixed(1) || "0.0"}
								</span>
								<span className="text-gray-500">
									({show.vote_count?.toLocaleString() || 0} votes)
								</span>
							</div>

							<div className="h-4 w-px bg-gray-800 hidden sm:block"></div>

							<div className="flex items-center gap-1">
								<span className="text-gray-400">First Aired:</span>
								<span className="font-medium text-white">
									{show.first_air_date
										? new Date(show.first_air_date).toLocaleDateString("en-US", {
												year: "numeric",
												month: "long",
												day: "numeric",
											})
										: "Unknown"}
								</span>
							</div>

							<div className="h-4 w-px bg-gray-800 hidden sm:block"></div>

							<div className="flex items-center gap-1">
								<span className="text-gray-400">Ep. Runtime:</span>
								<span className="font-medium text-white">{episodeRuntime}</span>
							</div>
						</div>

						{/* Overview */}
						<div className="pt-4 space-y-2">
							<h2 className="text-lg font-semibold text-gray-200">Overview</h2>
							<p className="text-gray-300 leading-relaxed text-base md:text-lg">
								{show.overview || "No synopsis available for this TV show."}
							</p>
						</div>

						{/* Watchlist Quick-Action Button with attached status dropdown */}
						<div className="pt-6 flex flex-col gap-4">
							{localWatchlisted ? (
								<div className="inline-flex rounded-xl overflow-hidden border border-emerald-500/30 shadow-lg w-max">
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
								<div className="inline-flex rounded-xl overflow-hidden border border-blue-500/30 shadow-lg w-max">
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

							{/* Episode Progress Bar */}
							{localWatchlisted && (
								<div className="flex items-center gap-3 mt-2 text-gray-300 flex-wrap">
									<span className="font-semibold text-sm">Episodes Progress:</span>
									{seasonData.length > 1 && (
										<div className="relative inline-flex rounded overflow-hidden border border-gray-700 bg-gray-800 shadow-sm">
											<select
												value={activeSeasonIndex}
												onChange={(e) => handleSeasonJump(e.target.value)}
												className="appearance-none bg-transparent outline-none pl-3 pr-8 py-1.5 text-sm font-semibold text-white cursor-pointer"
												title="Select Season"
											>
												{seasonData.map((s, idx) => (
													<option key={s.id} value={idx} className="bg-gray-900 text-white">
														{s.name || `Season ${s.season_number}`}
													</option>
												))}
											</select>
											<div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] text-gray-400">
												▼
											</div>
										</div>
									)}
									
									<span className="font-medium text-sm text-gray-300">Episodes:</span>
									<div className="flex items-center gap-2 font-mono">
										<button
											onClick={() => handleEpisodeChange(-1)}
											disabled={episodesWatched <= 0}
											className="w-7 h-7 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-200 font-bold transition cursor-pointer border border-gray-700"
											title="Decrement episode"
										>
											-
										</button>
										<span className="font-bold text-white px-2 text-base">
											{seasonData.length > 1 ? activeSeasonWatched : episodesWatched} / {seasonData.length > 1 ? activeSeasonTotal : totalEpisodes}
										</span>
										<button
											onClick={() => handleEpisodeChange(1)}
											disabled={episodesWatched >= totalEpisodes}
											className="w-7 h-7 flex items-center justify-center rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold transition shadow-xs cursor-pointer"
											title="Increment episode"
										>
											+
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</section>
		</>
	);
}

