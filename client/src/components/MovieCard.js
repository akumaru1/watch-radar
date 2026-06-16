"use client";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { getGenreNames } from "@/utils/genreHelper";

export default function MovieCard({ movie, isWatchlistPage = false, onRemove, isWatchlisted = false, onWatchlistAdded }) {
	const { isSignedIn, userId } = useAuth();
	const router = useRouter();
	const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

	const id = movie.tmdbId || movie.id;
	const title = movie.title;
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
				}),
			});

			if (!res.ok) {
				const data = await res.json();
				alert(data.error || "Failed to add movie to watchlist");
			} else {
				alert(`Successfully added "${title}" to watchlist!`);
				if (onWatchlistAdded) {
					onWatchlistAdded(id);
				}
			}
		} catch (err) {
			console.error("[Watchlist Add Error]:", err.message);
			alert("Failed to add movie to watchlist.");
		}
	};

	const handleRemoveClick = async (e) => {
		e.preventDefault();
		try {
			const res = await fetch(`${API_BASE_URL}/api/watchlist/${movie._id}`, {
				method: "DELETE",
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Failed to delete");
			}

			alert(`Removed "${title}" from watchlist.`);
			if (onRemove) {
				onRemove(movie._id);
			}
		} catch (err) {
			console.error("[Watchlist Remove Error]:", err.message);
			alert("Failed to remove movie from watchlist.");
		}
	};

	// Logic for the image URL
	const imageUrl = posterPath
		? `https://image.tmdb.org/t/p/w500${posterPath}`
		: "https://via.placeholder.com/500x750?text=No+Image";

	// Normalize display release year
	const releaseYear = movie.release_date
		? movie.release_date.split("-")[0]
		: movie.createdAt
			? new Date(movie.createdAt).getFullYear()
			: "N/A";

	const genresList = getGenreNames(movie);

	return (
		<div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700 transition hover:scale-105 flex flex-col justify-between h-full">
			<Link href={`/movie/${id}`} className="block flex-grow">
				<Image
					src={imageUrl}
					alt={title}
					width={500}
					height={750}
					className="w-full h-auto cursor-pointer"
				/>
				<div className="p-4 pb-0">
					<h2 className="font-bold text-lg truncate hover:text-blue-400 transition">{title}</h2>
					{genresList.length > 0 && (
						<p className="text-gray-400 text-xs mt-1 truncate">
							{genresList.slice(0, 2).join(", ")}
						</p>
					)}
					<p className="text-gray-500 text-xs mt-1 italic">
						Released: {releaseYear}
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
						className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition cursor-pointer font-medium whitespace-nowrap shrink-0"
					>
						- Remove
					</button>
				) : isWatchlisted ? (
					<button
						disabled
						className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1.5 rounded text-xs font-medium cursor-not-allowed whitespace-nowrap shrink-0"
					>
						✓ On Wishlist
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