"use client";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { getGenreNames } from "@/utils/genreHelper";

export default function MovieCard({ movie, isWatchlistPage = false, onRemove, onToggleWatched, isWatchlisted = false, onWatchlistAdded, onWatchlistRemoved }) {
	const { isSignedIn, userId } = useAuth();
	const router = useRouter();
	const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

	const id = movie.tmdbId || movie.id;
	const mediaType = movie.mediaType || (movie.first_air_date || movie.name ? "tv" : "movie");
	const title = movie.title || movie.name;
	const posterPath = movie.posterPath !== undefined ? movie.posterPath : movie.poster_path;
	const voteAverage = movie.voteAverage !== undefined ? movie.voteAverage : movie.vote_average;

	const handleWatchlistClick = async (e) => {
		e.preventDefault();
		if (!isSignedIn) {
			router.push("/sign-in");
			return;
		}

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
				}),
			});

			if (!res.ok) {
				const data = await res.json();
				alert(data.error || `Failed to add ${mediaType === "tv" ? "TV show" : "movie"} to watchlist`);
			} else {
				alert(`Successfully added "${title}" to watchlist!`);
				if (onWatchlistAdded) {
					onWatchlistAdded(id);
				}
			}
		} catch (err) {
			console.error("[Watchlist Add Error]:", err.message);
			alert(`Failed to add ${mediaType === "tv" ? "TV show" : "movie"} to watchlist.`);
		}
	};

	const handleRemoveClick = async (e) => {
		e.preventDefault();
		if (!movie._id && (!isSignedIn || !userId)) {
			router.push("/sign-in");
			return;
		}

		try {
			const deleteUrl = movie._id
				? `${API_BASE_URL}/api/watchlist/${movie._id}`
				: `${API_BASE_URL}/api/watchlist/user/${userId}/item/${id}?mediaType=${mediaType}`;

			const res = await fetch(deleteUrl, {
				method: "DELETE",
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Failed to remove");
			}

			alert(`Removed "${title}" from watchlist.`);
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

	const handleToggleWatchedClick = async (e) => {
		e.preventDefault();
		e.stopPropagation();
		try {
			const newWatched = !movie.watched;
			const res = await fetch(`${API_BASE_URL}/api/watchlist/${movie._id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ watched: newWatched }),
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Failed to update watched status");
			}

			if (onToggleWatched) {
				onToggleWatched(movie._id, newWatched);
			}
		} catch (err) {
			console.error("[Watchlist Toggle Watched Error]:", err.message);
			alert("Failed to update watched status.");
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
			{isWatchlistPage && (
				<button
					onClick={handleToggleWatchedClick}
					className={`absolute top-2 right-2 z-20 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-md backdrop-blur-xs border transition duration-200 cursor-pointer flex items-center gap-1 ${movie.watched
						? "bg-emerald-600/90 hover:bg-emerald-500 text-white border-emerald-500/30"
						: "bg-gray-900/80 hover:bg-gray-850 text-gray-250 border-gray-700"
						}`}
					title={movie.watched ? "Mark as Unwatched" : "Mark as Watched"}
				>
					{movie.watched ? "✓ Watched" : "👁️ Watch"}
				</button>
			)}
			<Link href={`/${mediaType}/${id}`} className="block flex-grow">
				<Image
					src={imageUrl}
					alt={title}
					width={500}
					height={750}
					className={`w-full h-auto cursor-pointer transition duration-300 ${isWatchlistPage && movie.watched ? "opacity-50 grayscale-[15%]" : "hover:opacity-90"
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
			<div className="p-4 pt-3 flex items-center justify-between mt-auto gap-1.5">
				{voteAverage !== undefined && (
					<span className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold whitespace-nowrap flex items-center gap-1 shrink-0">
						⭐ {voteAverage?.toFixed(1) || "0.0"}
					</span>
				)}
				{isWatchlistPage ? (
					<button
						onClick={handleRemoveClick}
						className="bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500/20 px-2.5 py-1.5 rounded text-xs font-medium cursor-pointer whitespace-nowrap shrink-0 transition duration-200"
						title="Remove from Watchlist"
					>
						✓ Watchlist
					</button>
				) : isWatchlisted ? (
					<button
						onClick={handleRemoveClick}
						className="bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500/20 px-2.5 py-1.5 rounded text-xs font-medium cursor-pointer whitespace-nowrap shrink-0 transition duration-200"
						title="Remove from Watchlist"
					>
						✓ Watchlist
					</button>
				) : (
					<button
						onClick={handleWatchlistClick}
						className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition cursor-pointer font-medium whitespace-nowrap shrink-0"
					>
						+ Watchlist
					</button>
				)}
			</div>
		</div>
	);
}