import Image from "next/image";

export default function MovieCard({ movie }) {
	// Logic for the image URL
	const imageUrl = movie.poster_path 
		? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
		: "https://via.placeholder.com/500x750?text=No+Image";

	return (
		<div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700 transition hover:scale-105">
			<Image 
				src={imageUrl} 
				alt={movie.title}
				width={500}
				height={750}
				className="w-full h-auto"
			/>
			<div className="p-4">
				<h2 className="font-bold text-lg truncate">{movie.title}</h2>
				<p className="text-gray-400 text-sm mt-1 italic">
					Released: {movie.release_date?.split("-")[0]} {/* Just show the year */}
				</p>
				<div className="mt-3 flex items-center justify-between">
					<span className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
						 ⭐ {movie.vote_average?.toFixed(1)}
					</span>
					<button className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition">
						+ Watchlist
					</button>
				</div>
			</div>
		</div>
	);
}