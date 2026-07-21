"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { getGenreNames } from "@/utils/genreHelper";

export default function MovieCard({
	movie,
	isWatchlistPage = false,
	onRemove,
	onToggleWatched,
	onUpdateItem,
	isWatchlisted = false,
	onWatchlistAdded,
	onWatchlistRemoved,
}) {
	const { isSignedIn, userId } = useAuth();
	const router = useRouter();
	const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

	const id = movie.tmdbId || movie.id;
	const mediaType = movie.mediaType || (movie.first_air_date || movie.name ? "tv" : "movie");
	const title = movie.title || movie.name;
	const posterPath = movie.posterPath !== undefined ? movie.posterPath : movie.poster_path;
	const voteAverage = movie.voteAverage !== undefined ? movie.voteAverage : movie.vote_average;

	const [localWatchlisted, setLocalWatchlisted] = useState(isWatchlisted || isWatchlistPage);
	const [localStatus, setLocalStatus] = useState(
		movie.status || (movie.watched ? "Completed" : "Plan to Watch")
	);
	const [localWatchlistId, setLocalWatchlistId] = useState(movie._id || null);
	const [seasonData, setSeasonData] = useState([]);

	useEffect(() => {
		if (isWatchlistPage && mediaType === "tv" && (movie.totalEpisodes || 1) > 1) {
			const fetchSeasonData = async () => {
				try {
					const res = await fetch(`${API_BASE_URL}/api/shows/${id}`);
					if (!res.ok) return;
					const data = await res.json();
					const validSeasons = data?.seasons?.filter(s => s.season_number > 0).sort((a, b) => a.season_number - b.season_number) || [];
					let cumulative = 0;
					const sData = validSeasons.map(s => {
						const start = cumulative;
						cumulative += s.episode_count;
						return { ...s, startEp: start, endEp: cumulative };
					});
					setSeasonData(sData);
				} catch (err) {
					console.error("Failed to fetch season data for MovieCard", err);
				}
			};
			fetchSeasonData();
		}
	}, [isWatchlistPage, mediaType, movie.totalEpisodes, id, API_BASE_URL]);

	useEffect(() => {
		setLocalWatchlisted(isWatchlisted || isWatchlistPage);
	}, [isWatchlisted, isWatchlistPage]);

	useEffect(() => {
		if (movie.status) {
			setLocalStatus(movie.status);
		}
		if (movie._id) {
			setLocalWatchlistId(movie._id);
		}
	}, [movie.status, movie._id]);

	const totalEpisodes = movie.totalEpisodes || 1;
	const episodesWatched = movie.episodesWatched !== undefined ? movie.episodesWatched : (movie.watched ? totalEpisodes : 0);

	let displayWatched = episodesWatched;
	let displayTotal = totalEpisodes;

	if (seasonData.length > 0) {
		for (let i = 0; i < seasonData.length; i++) {
			if (episodesWatched >= seasonData[i].startEp && episodesWatched < seasonData[i].endEp) {
				displayWatched = episodesWatched - seasonData[i].startEp;
				displayTotal = seasonData[i].episode_count;
				break;
			} else if (episodesWatched >= seasonData[i].endEp) {
				if (i === seasonData.length - 1) {
					displayWatched = seasonData[i].episode_count;
					displayTotal = seasonData[i].episode_count;
				}
			}
		}
	}

	const handleWatchlistAddWithStatus = async (chosenStatus, e) => {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		if (!isSignedIn) {
			router.push("/sign-in");
			return;
		}

		const statusToSave = chosenStatus || "Plan to Watch";

		try {
			const genres = getGenreNames(movie);
			const res = await fetch(`${API_BASE_URL}/api/watchlist`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId,
					tmdbId: id,
					title,
					posterPath: posterPath || "",
					genres,
					voteAverage: voteAverage || 0,
					mediaType,
					status: statusToSave,
				}),
			});

			if (!res.ok) {
				const data = await res.json();
				alert(data.error || `Failed to add ${mediaType === "tv" ? "TV show" : "movie"} to watchlist`);
			} else {
				const savedItem = await res.json();
				setLocalWatchlisted(true);
				setLocalStatus(savedItem.status || statusToSave);
				if (savedItem._id) setLocalWatchlistId(savedItem._id);
				if (onWatchlistAdded) {
					onWatchlistAdded(id, savedItem);
				}
			}
		} catch (err) {
			console.error("[Watchlist Add Error]:", err.message);
			alert(`Failed to add ${mediaType === "tv" ? "TV show" : "movie"} to watchlist.`);
		}
	};

	const handleRemoveClick = async (e) => {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		const itemId = movie._id || localWatchlistId;

		if (!itemId && (!isSignedIn || !userId)) {
			router.push("/sign-in");
			return;
		}

		try {
			const deleteUrl = itemId
				? `${API_BASE_URL}/api/watchlist/${itemId}`
				: `${API_BASE_URL}/api/watchlist/user/${userId}/item/${id}?mediaType=${mediaType}`;

			const res = await fetch(deleteUrl, {
				method: "DELETE",
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Failed to remove");
			}

			setLocalWatchlisted(false);
			if (movie._id && onRemove) {
				onRemove(movie._id);
			} else if (onWatchlistRemoved) {
				onWatchlistRemoved(id);
			}
		} catch (err) {
			console.error("[Watchlist Remove Error]:", err.message);
			alert(`Failed to remove ${mediaType === "tv" ? "TV show" : "movie"} from watchlist.`);
		}
	};

	const handleStatusChange = async (newStatus, e) => {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		const itemId = movie._id || localWatchlistId;

		if (!localWatchlisted || !itemId) {
			return handleWatchlistAddWithStatus(newStatus, e);
		}

		try {
			const res = await fetch(`${API_BASE_URL}/api/watchlist/${itemId}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ status: newStatus }),
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Failed to update status");
			}

			const updated = await res.json();
			setLocalStatus(updated.status);
			if (onUpdateItem) {
				onUpdateItem(updated);
			} else if (onToggleWatched) {
				onToggleWatched(movie._id, updated.watched, updated);
			}
		} catch (err) {
			console.error("[Watchlist Status Error]:", err.message);
			alert("Failed to update status.");
		}
	};

	const handleEpisodeChange = async (delta, e) => {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		const nextEp = episodesWatched + delta;
		if (nextEp < 0 || nextEp > totalEpisodes) return;
		const itemId = movie._id || localWatchlistId;
		if (!itemId) return;

		try {
			const res = await fetch(`${API_BASE_URL}/api/watchlist/${itemId}`, {
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
			if (onUpdateItem) {
				onUpdateItem(updated);
			} else if (onToggleWatched) {
				onToggleWatched(movie._id, updated.watched, updated);
			}
		} catch (err) {
			console.error("[Watchlist Episode Update Error]:", err.message);
			alert("Failed to update episode progress.");
		}
	};

	// Logic for the image URL
	const imageUrl = posterPath
		? `https://image.tmdb.org/t/p/w500${posterPath}`
		: "https://via.placeholder.com/500x750?text=No+Image";

	// Normalize display release year
	const releaseYear = movie.release_date
		? movie.release_date.split("-")[0]
		: movie.first_air_date
			? movie.first_air_date.split("-")[0]
			: movie.createdAt
				? new Date(movie.createdAt).getFullYear()
				: "N/A";

	const genresList = getGenreNames(movie);

	return (
		<div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700 transition hover:scale-105 flex flex-col justify-between h-full relative">
			<Link href={`/${mediaType}/${id}`} className="block flex-grow">
				<Image
					src={imageUrl}
					alt={title}
					width={500}
					height={750}
					className={`w-full h-auto cursor-pointer transition duration-300 ${isWatchlistPage && localStatus === "Completed" ? "opacity-60 grayscale-[15%]" : "hover:opacity-90"
						}`}
				/>
				<div className="p-4 pb-0">
					<h2 className="font-bold text-lg truncate hover:text-blue-400 transition">{title}</h2>
					{genresList.length > 0 && (
						<p className="text-gray-400 text-xs mt-1 truncate">
							{genresList.slice(0, 2).join(", ")}
						</p>
					)}
					<p className="text-gray-500 text-xs mt-1 italic">
						{mediaType === "tv" ? "First Aired" : "Released"}: {releaseYear}
					</p>
				</div>
			</Link>

			{/* Episode Progress Bar for Watchlist Items (TV or multi-episode) */}
			{isWatchlistPage && (mediaType === "tv" || totalEpisodes > 1) && (
				<div className="px-4 pt-2.5 pb-1 flex items-center justify-between text-xs border-t border-gray-750/70 bg-gray-850/40 mt-3">
					<span className="text-gray-400 font-medium text-[11px]">Progress:</span>
					<div className="flex items-center gap-1.5 font-mono">
						<button
							onClick={(e) => handleEpisodeChange(-1, e)}
							disabled={episodesWatched <= 0}
							className="w-5 h-5 flex items-center justify-center rounded bg-gray-750 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-200 font-bold transition cursor-pointer"
							title="Decrement episode"
						>
							-
						</button>
						<span className="font-bold text-white px-1 text-xs">
							{displayWatched}/{displayTotal}
						</span>
						<button
							onClick={(e) => handleEpisodeChange(1, e)}
							disabled={episodesWatched >= totalEpisodes}
							className="w-5 h-5 flex items-center justify-center rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold transition shadow-xs cursor-pointer"
							title="Increment episode"
						>
							+
						</button>
					</div>
				</div>
			)}

			<div className="p-4 flex items-center justify-between mt-auto gap-2">
				{voteAverage !== undefined && (
					<span className="bg-yellow-500 text-black px-1.5 py-0.5 rounded text-[11px] font-bold whitespace-nowrap flex items-center gap-1 shrink-0">
						⭐ {voteAverage?.toFixed(1) || "0.0"}
					</span>
				)}

				{localWatchlisted ? (
					<div className="inline-flex items-stretch rounded overflow-hidden border border-emerald-500/30 shrink-0 shadow-sm">
						<button
							onClick={handleRemoveClick}
							className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-0.5 text-[11px] font-medium cursor-pointer whitespace-nowrap transition duration-200 flex items-center gap-1"
							title="Click to remove from Watchlist"
						>
							✓ Watchlist
						</button>
						<div className="relative bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold px-1.5 flex items-center justify-center border-l border-emerald-500/40 cursor-pointer">
							<span className="pointer-events-none select-none">⌄</span>
							<select
								value={localStatus}
								onChange={(e) => handleStatusChange(e.target.value, e)}
								onClick={(e) => e.stopPropagation()}
								className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
								title={`Current Status: ${localStatus}. Click to change.`}
							>
								<option value="Plan to Watch" className="bg-gray-900 text-white">Plan to Watch</option>
								<option value="Currently Watching" className="bg-gray-900 text-white">Currently Watching</option>
								<option value="Completed" className="bg-gray-900 text-white">Completed</option>
								<option value="On Hold" className="bg-gray-900 text-white">On Hold</option>
								<option value="Dropped" className="bg-gray-900 text-white">Dropped</option>
							</select>
						</div>
					</div>
				) : (
					<div className="inline-flex items-stretch rounded overflow-hidden border border-blue-500/30 shrink-0 shadow-sm">
						<button
							onClick={(e) => handleWatchlistAddWithStatus("Plan to Watch", e)}
							className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-0.5 text-[11px] font-medium cursor-pointer whitespace-nowrap transition duration-200 flex items-center gap-1"
							title="Add to Watchlist"
						>
							+ Watchlist
						</button>
						<div className="relative bg-blue-700 hover:bg-blue-800 text-white text-[11px] font-bold px-1.5 flex items-center justify-center border-l border-blue-500/40 cursor-pointer">
							<span className="pointer-events-none select-none">⌄</span>
							<select
								value=""
								onChange={(e) => handleWatchlistAddWithStatus(e.target.value, e)}
								onClick={(e) => e.stopPropagation()}
								className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
								title="Select status to add to Watchlist"
							>
								<option value="" disabled hidden>Select Status</option>
								<option value="Plan to Watch" className="bg-gray-900 text-white">Plan to Watch</option>
								<option value="Currently Watching" className="bg-gray-900 text-white">Currently Watching</option>
								<option value="Completed" className="bg-gray-900 text-white">Completed</option>
								<option value="On Hold" className="bg-gray-900 text-white">On Hold</option>
								<option value="Dropped" className="bg-gray-900 text-white">Dropped</option>
							</select>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}