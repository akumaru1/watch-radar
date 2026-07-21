import Image from "next/image";

export default function MovieCast({ movie }) {
	const topCast = movie?.credits?.cast?.slice(0, 6) || [];

	return (
		<section className="space-y-6">
			<h2 className="text-2xl font-bold text-white border-b border-gray-900 pb-2">
				Top Cast
			</h2>
			{topCast.length > 0 ? (
				<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
					{topCast.map((actor) => {
						const actorPic = actor.profile_path
							? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
							: "https://via.placeholder.com/185x278?text=No+Image";

						return (
							<div
								key={actor.id}
								className="bg-gray-900/40 rounded-xl p-3 border border-gray-900 flex items-center gap-3 transition hover:scale-[1.03] duration-200"
							>
								<div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-gray-800">
									<Image
										src={actorPic}
										alt={actor.name}
										fill
										className="object-cover"
										sizes="48px"
									/>
								</div>
								<div className="min-w-0">
									<p className="font-semibold text-sm text-gray-200 truncate" title={actor.name}>
										{actor.name}
									</p>
									<p className="text-xs text-gray-400 truncate" title={actor.character}>
										{actor.character}
									</p>
								</div>
							</div>
						);
					})}
				</div>
			) : (
				<p className="text-gray-500 italic">No cast information available.</p>
			)}
		</section>
	);
}
