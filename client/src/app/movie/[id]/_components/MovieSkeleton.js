import Header from "@/components/Header";

export default function MovieSkeleton() {
	return (
		<div className="min-h-screen bg-gray-950 text-gray-100 font-sans pb-16 relative overflow-x-hidden">
			{/* Backdrop banner skeleton */}
			<div className="absolute top-0 left-0 w-full h-[60vh] md:h-[70vh] bg-gray-900/30 z-0">
				<div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/85 to-transparent"></div>
			</div>

			<div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
				<Header />

				{/* Main Movie Hero Section skeleton */}
				<section className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-12">
					{/* Poster Card skeleton */}
					<div className="flex justify-center md:justify-start">
						<div className="w-72 h-[432px] md:w-full md:h-[480px] lg:h-[540px] bg-gray-900 border border-gray-800 rounded-2xl animate-pulse"></div>
					</div>

					{/* Main Info skeleton */}
					<div className="md:col-span-2 flex flex-col justify-center space-y-4">
						{/* Genres badges skeleton */}
						<div className="flex gap-2">
							<div className="w-20 h-6 bg-gray-900 border border-gray-850 rounded-full animate-pulse"></div>
							<div className="w-24 h-6 bg-gray-900 border border-gray-850 rounded-full animate-pulse"></div>
						</div>

						{/* Title skeleton */}
						<div className="w-3/4 h-12 md:h-14 bg-gray-900 border border-gray-800 rounded-xl animate-pulse"></div>
						{/* Tagline skeleton */}
						<div className="w-1/2 h-6 bg-gray-900 border border-gray-800 rounded-lg animate-pulse"></div>

						{/* Rating, runtime, release row skeleton */}
						<div className="w-full h-12 bg-gray-900/50 border border-gray-900 rounded-lg animate-pulse"></div>

						{/* Overview skeleton */}
						<div className="space-y-3 pt-4">
							<div className="w-24 h-6 bg-gray-900 border border-gray-800 rounded-md animate-pulse"></div>
							<div className="w-full h-4 bg-gray-900 border border-gray-800 rounded-md animate-pulse"></div>
							<div className="w-11/12 h-4 bg-gray-900 border border-gray-800 rounded-md animate-pulse"></div>
						</div>
					</div>
				</section>

				{/* Two-Column details layout skeleton */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 mt-16">
					<div className="lg:col-span-2 space-y-12">
						{/* Trailer Section skeleton */}
						<div className="space-y-4">
							<div className="w-48 h-8 bg-gray-900 border border-gray-800 rounded-md animate-pulse"></div>
							<div className="w-full aspect-video bg-gray-900 border border-gray-900 rounded-2xl animate-pulse"></div>
						</div>

						{/* Cast Section skeleton */}
						<div className="space-y-6">
							<div className="w-32 h-8 bg-gray-900 border border-gray-800 rounded-md animate-pulse"></div>
							<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
								{[...Array(6)].map((_, i) => (
									<div
										key={i}
										className="bg-gray-900/40 rounded-xl p-3 border border-gray-900 flex items-center gap-3 animate-pulse"
									>
										<div className="w-12 h-12 rounded-full bg-gray-800 flex-shrink-0"></div>
										<div className="space-y-2 flex-grow">
											<div className="w-20 h-4 bg-gray-800 rounded"></div>
											<div className="w-12 h-3 bg-gray-800 rounded"></div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Sidebar Stats skeleton */}
					<div>
						<div className="w-full h-96 bg-gray-900/60 rounded-2xl border border-gray-900 animate-pulse"></div>
					</div>
				</div>
			</div>
		</div>
	);
}
