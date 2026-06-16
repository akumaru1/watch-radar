"use client";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function MovieCard({ movie }) {
	const { isSignedIn } = useAuth();
	const router = useRouter();

	const handleWatchlistClick = (e) => {
		e.preventDefault();
		if (!isSignedIn) {
			router.push("/sign-in");
		} else {
			alert(`Successfully added "${movie.title}" to watchlist!`);
		}
	};

	// Logic for the image URL
	const imageUrl = movie.poster_path 
		? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
		: "https://via.placeholder.com/500x750?text=No+Image";

	return (
		<div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700 transition hover:scale-105 flex flex-col justify-between h-full">
			<Link href={`/movie/${movie.id}`} className="block flex-grow">
				<Image 
					src={imageUrl} 
					alt={movie.title}
					width={500}
					height={750}
					className="w-full h-auto cursor-pointer"
				/>
				<div className="p-4 pb-0">
					<h2 className="font-bold text-lg truncate hover:text-blue-400 transition">{movie.title}</h2>
					<p className="text-gray-400 text-sm mt-1 italic">
						Released: {movie.release_date?.split("-")[0] || "N/A"}
					</p>
				</div>
			</Link>
			<div className="p-4 pt-3 flex items-center justify-between mt-auto">
				<span className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
					 ⭐ {movie.vote_average?.toFixed(1) || "0.0"}
				</span>
				<button 
					onClick={handleWatchlistClick}
					className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition cursor-pointer"
				>
					+ Watchlist
				</button>
			</div>
		</div>
	);
}