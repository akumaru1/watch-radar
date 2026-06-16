export default function MovieStats({ movie }) {
	const formatCurrency = (amount) => {
		if (!amount) return "N/A";
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			maximumFractionDigits: 0,
		}).format(amount);
	};

	if (!movie) return null;

	return (
		<section className="bg-gray-900/60 backdrop-blur-md rounded-2xl p-6 border border-gray-900 shadow-md space-y-6">
			<h3 className="text-xl font-bold text-white border-b border-gray-800 pb-2">
				Movie Stats
			</h3>

			<div className="grid grid-cols-1 gap-4 text-sm">
				<div>
					<span className="block text-gray-400 font-medium mb-1">Status</span>
					<span className="text-white font-semibold text-base px-2.5 py-0.5 rounded-md bg-gray-800 border border-gray-700 inline-block">
						{movie.status || "Unknown"}
					</span>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<span className="block text-gray-400 font-medium mb-0.5">Budget</span>
						<span className="text-white font-semibold text-base">
							{formatCurrency(movie.budget)}
						</span>
					</div>
					<div>
						<span className="block text-gray-400 font-medium mb-0.5">Revenue</span>
						<span className="text-green-400 font-semibold text-base">
							{formatCurrency(movie.revenue)}
						</span>
					</div>
				</div>

				{movie.original_language && (
					<div>
						<span className="block text-gray-400 font-medium mb-0.5">Original Language</span>
						<span className="text-white font-semibold uppercase">
							{movie.original_language}
						</span>
					</div>
				)}

				{movie.production_companies?.length > 0 && (
					<div>
						<span className="block text-gray-400 font-medium mb-1.5">
							Production Companies
						</span>
						<ul className="space-y-1 text-gray-300">
							{movie.production_companies.slice(0, 3).map((company) => (
								<li key={company.id} className="flex items-center gap-1.5">
									<span className="text-blue-400 text-xs">•</span>
									<span className="font-medium text-xs truncate" title={company.name}>
										{company.name}
									</span>
								</li>
							))}
						</ul>
					</div>
				)}

				{movie.homepage && (
					<div className="pt-2">
						<a
							href={movie.homepage}
							target="_blank"
							rel="noopener noreferrer"
							className="w-full text-center block px-4 py-2 bg-gray-800 hover:bg-gray-700 text-blue-400 font-semibold rounded-lg border border-gray-700 transition"
						>
							Visit Official Website &rarr;
						</a>
					</div>
				)}
			</div>
		</section>
	);
}
