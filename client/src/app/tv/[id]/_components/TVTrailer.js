export default function TVTrailer({ show }) {
	const trailer = show?.videos?.results?.find(
		(v) => v.site === "YouTube" && v.type === "Trailer"
	) || show?.videos?.results?.find((v) => v.site === "YouTube");

	if (!trailer) return null;

	return (
		<section className="space-y-4">
			<h2 className="text-2xl font-bold text-white border-b border-gray-900 pb-2 flex items-center gap-2">
				<span>🎬</span> Official Trailer
			</h2>
			<div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-xl border border-gray-900 bg-black">
				<iframe
					src={`https://www.youtube.com/embed/${trailer.key}`}
					title={`${show.name} Trailer`}
					frameBorder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
					className="absolute inset-0 w-full h-full"
				></iframe>
			</div>
		</section>
	);
}
