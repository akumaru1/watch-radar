"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import Header from "@/components/Header";
import {
	ResponsiveContainer,
	RadarChart,
	PolarGrid,
	PolarAngleAxis,
	PolarRadiusAxis,
	Radar,
	PieChart,
	Pie,
	Cell,
	Tooltip,
	Legend,
} from "recharts";

const COLORS = [
	"#3b82f6", // Blue
	"#818cf8", // Indigo
	"#ec4899", // Pink
	"#10b981", // Emerald
	"#f59e0b", // Amber
	"#6366f1", // Violet
	"#14b8a6", // Teal
	"#f43f5e", // Rose
	"#06b6d4", // Cyan
	"#8b5cf6", // Purple
];

export default function GenreDnaPage() {
	const { isLoaded, isSignedIn, userId } = useAuth();
	const [stats, setStats] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [chartType, setChartType] = useState("radar"); // "radar" | "pie"
	const [mounted, setMounted] = useState(false);

	const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!isLoaded) return;
		if (!isSignedIn || !userId) {
			setLoading(false);
			return;
		}

		const fetchStats = async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await fetch(`${API_BASE_URL}/api/watchlist/${userId}/stats`);
				if (!res.ok) {
					throw new Error(`Server returned status ${res.status}`);
				}
				const data = await res.json();
				setStats(data);
			} catch (err) {
				console.error("[Fetch Stats Error]:", err.message);
				setError("Failed to load your Genre DNA. Please try again later.");
			} finally {
				setLoading(false);
			}
		};

		fetchStats();
	}, [isLoaded, isSignedIn, userId, API_BASE_URL]);

	if (!isLoaded || loading) {
		return (
			<main className="min-h-screen bg-gray-950 text-gray-100 font-sans pb-16 relative overflow-x-hidden">
				<div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
					<Header />
					<div className="flex flex-col items-center justify-center py-20">
						<div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
						<p className="mt-4 text-gray-400 text-lg">Analyzing your Genre DNA...</p>
					</div>
				</div>
			</main>
		);
	}

	if (error) {
		return (
			<main className="min-h-screen bg-gray-950 text-gray-100 font-sans pb-16 relative overflow-x-hidden">
				<div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
					<Header />
					<div className="flex flex-col items-center justify-center py-20 text-center">
						<div className="text-red-500 text-5xl mb-4">⚠️</div>
						<p className="text-red-400 text-xl font-semibold">{error}</p>
						<button
							onClick={() => window.location.reload()}
							className="mt-6 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 transition rounded-lg font-medium text-sm cursor-pointer"
						>
							Retry
						</button>
					</div>
				</div>
			</main>
		);
	}

	// Empty state check
	const hasWatchlistItems = stats && stats.totalItems > 0;
	const hasGenresData = stats && stats.genres && stats.genres.length > 0;

	if (!hasWatchlistItems) {
		return (
			<main className="min-h-screen bg-gray-950 text-gray-100 font-sans pb-16 relative overflow-x-hidden">
				<div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
					<Header />
					<div className="flex flex-col items-center justify-center py-20 text-center bg-gray-800/10 border border-gray-800 rounded-2xl p-8 max-w-2xl mx-auto">
						<div className="text-blue-500 text-7xl mb-4">🧬</div>
						<h3 className="text-2xl font-bold mb-3 text-white">Your Genre DNA is empty</h3>
						<p className="text-gray-400 mb-8 text-sm max-w-md leading-relaxed">
							Add movies and TV shows to your watchlist to unlock your personal viewing profile. We'll analyze your top genres, watch rates, and formatting habits!
						</p>
						<Link
							href="/"
							className="px-6 py-3 bg-blue-600 hover:bg-blue-700 transition duration-200 text-white font-semibold rounded-lg text-sm shadow-lg shadow-blue-900/30 cursor-pointer"
						>
							Go to Discovery
						</Link>
					</div>
				</div>
			</main>
		);
	}

	const topGenre = hasGenresData ? stats.genres[0].name : "N/A";
	const topGenreCount = hasGenresData ? stats.genres[0].count : 0;
	const watchPercent = stats.totalItems > 0 ? Math.round((stats.watchedCount / stats.totalItems) * 100) : 0;
	const moviePercent = stats.totalItems > 0 ? Math.round((stats.movieCount / stats.totalItems) * 100) : 0;
	const tvPercent = 100 - moviePercent;

	// Custom Tooltip for dark mode aesthetics
	const CustomTooltip = ({ active, payload }) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-gray-900/90 border border-gray-850 px-3 py-2 rounded-lg shadow-xl backdrop-blur-md">
					<p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{payload[0].name}</p>
					<p className="text-lg font-bold text-white mt-1">
						{payload[0].value} {payload[0].value === 1 ? "title" : "titles"}
					</p>
				</div>
			);
		}
		return null;
	};

	return (
		<main className="min-h-screen bg-gray-950 text-gray-100 font-sans pb-16 relative overflow-x-hidden">
			{/* Glowing backgrounds */}
			<div className="absolute top-10 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
			<div className="absolute top-1/2 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

			<div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
				<Header />

				{/* Header Section */}
				<div className="mb-8 pb-4 border-b border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
					<div>
						<h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
							<span className="text-blue-400">🧬</span> Genre DNA
						</h2>
						<p className="text-sm text-gray-400 mt-1">
							A personalized breakdown of your watchlist and viewing preferences.
						</p>
					</div>
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
					{/* Total Titles */}
					<div className="bg-gray-900 border border-gray-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-gray-700/60 transition duration-300">
						<div className="absolute top-4 right-4 text-2xl text-blue-500/30">🎬</div>
						<p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Titles</p>
						<h3 className="text-3xl font-extrabold text-white mt-2">{stats.totalItems}</h3>
						<div className="text-[11px] text-gray-500 mt-1.5">
							{stats.movieCount} Movies / {stats.tvCount} TV Shows
						</div>
					</div>

					{/* Top Genre */}
					<div className="bg-gray-900 border border-gray-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-gray-700/60 transition duration-300">
						<div className="absolute top-4 right-4 text-2xl text-pink-500/30">🔥</div>
						<p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Top Genre</p>
						<h3 className="text-2xl font-extrabold text-white mt-2 truncate max-w-[90%]">{topGenre}</h3>
						<div className="text-[11px] text-gray-500 mt-1.5">
							Contains {topGenreCount} {topGenreCount === 1 ? "item" : "items"} ({Math.round((topGenreCount / stats.totalItems) * 100)}%)
						</div>
					</div>

					{/* Average Rating */}
					<div className="bg-gray-900 border border-gray-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-gray-700/60 transition duration-300">
						<div className="absolute top-4 right-4 text-2xl text-yellow-500/30">⭐</div>
						<p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Avg Rating</p>
						<h3 className="text-3xl font-extrabold text-white mt-2">{stats.averageRating}</h3>
						<div className="text-[11px] text-gray-500 mt-1.5">Across rated titles</div>
					</div>

					{/* Completion Rate */}
					<div className="bg-gray-900 border border-gray-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-gray-700/60 transition duration-300">
						<div className="absolute top-4 right-4 text-2xl text-emerald-500/30">✓</div>
						<p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completion</p>
						<h3 className="text-3xl font-extrabold text-white mt-2">{watchPercent}%</h3>
						<div className="text-[11px] text-gray-500 mt-1.5">
							{stats.watchedCount} watched / {stats.unwatchedCount} left
						</div>
					</div>
				</div>

				{/* Format and Progress bars */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
					{/* Format DNA (Movies vs Shows) */}
					<div className="bg-gray-900 border border-gray-800/80 rounded-2xl p-6 shadow-md">
						<h4 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Format DNA</h4>
						<div className="flex justify-between items-center text-xs font-bold text-white mb-2">
							<span className="text-blue-400">Movies ({moviePercent}%)</span>
							<span className="text-purple-400">TV Shows ({tvPercent}%)</span>
						</div>
						<div className="w-full h-3.5 bg-gray-850 rounded-full overflow-hidden flex">
							<div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${moviePercent}%` }}></div>
							<div className="bg-purple-500 h-full transition-all duration-500" style={{ width: `${tvPercent}%` }}></div>
						</div>
						<p className="text-xs text-gray-500 mt-3 leading-relaxed">
							You prefer <span className="text-gray-300 font-semibold">{moviePercent >= tvPercent ? "Movies" : "TV Shows"}</span>, which make up <span className="text-gray-300 font-semibold">{moviePercent >= tvPercent ? moviePercent : tvPercent}%</span> of your watchlist.
						</p>
					</div>

					{/* Completion breakdown */}
					<div className="bg-gray-900 border border-gray-800/80 rounded-2xl p-6 shadow-md">
						<h4 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Watchlist Progress</h4>
						<div className="flex justify-between items-center text-xs font-bold text-white mb-2">
							<span className="text-emerald-400">Watched ({watchPercent}%)</span>
							<span className="text-yellow-500">Unwatched ({100 - watchPercent}%)</span>
						</div>
						<div className="w-full h-3.5 bg-gray-850 rounded-full overflow-hidden flex">
							<div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${watchPercent}%` }}></div>
							<div className="bg-yellow-500 h-full transition-all duration-500" style={{ width: `${100 - watchPercent}%` }}></div>
						</div>
						<p className="text-xs text-gray-500 mt-3 leading-relaxed">
							You have watched <span className="text-gray-300 font-semibold">{stats.watchedCount}</span> of <span className="text-gray-300 font-semibold">{stats.totalItems}</span> titles. Let the "Surprise Me" decider pick your next unwatched title!
						</p>
					</div>
				</div>

				{/* Charts and Leaderboard Section */}
				<div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
					{/* Main Chart Column (Span 3) */}
					<div className="lg:col-span-3 bg-gray-900 border border-gray-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
							<div>
								<h3 className="font-extrabold text-xl text-white">Your Genre Spectrum</h3>
								<p className="text-xs text-gray-500 mt-0.5">Visual representation of your catalog</p>
							</div>
							
							{/* Tab Switcher */}
							<div className="inline-flex rounded-lg bg-gray-950 p-1 border border-gray-850 self-start sm:self-center">
								<button
									onClick={() => setChartType("radar")}
									className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition ${chartType === "radar" ? "bg-blue-600 text-white shadow-sm" : "text-gray-400 hover:text-gray-200"}`}
								>
									Radar Map
								</button>
								<button
									onClick={() => setChartType("pie")}
									className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition ${chartType === "pie" ? "bg-blue-600 text-white shadow-sm" : "text-gray-400 hover:text-gray-200"}`}
								>
									Pie Breakdown
								</button>
							</div>
						</div>

						{/* Chart Box */}
						<div className="h-80 flex items-center justify-center relative min-h-[320px]">
							{!mounted ? (
								<div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
							) : !hasGenresData ? (
								<p className="text-gray-500 text-sm">No genre statistics available</p>
							) : chartType === "radar" ? (
								<ResponsiveContainer width="100%" height="100%">
									<RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.genres}>
										<PolarGrid stroke="#374151" strokeDasharray="3 3" />
										<PolarAngleAxis 
											dataKey="name" 
											tick={{ fill: "#9ca3af", fontSize: 11, fontWeight: 500 }}
										/>
										<PolarRadiusAxis 
											angle={30} 
											domain={[0, "auto"]} 
											tick={{ fill: "#6b7280", fontSize: 10 }}
											axisLine={false}
										/>
										<Radar
											name="Watchlist"
											dataKey="count"
											stroke="#3b82f6"
											fill="#818cf8"
											fillOpacity={0.3}
										/>
										<Tooltip content={<CustomTooltip />} cursor={false} />
									</RadarChart>
								</ResponsiveContainer>
							) : (
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={stats.genres}
											dataKey="count"
											nameKey="name"
											cx="50%"
											cy="48%"
											outerRadius={95}
											innerRadius={45}
											paddingAngle={3}
											label={({ name, percent }) => percent > 0.05 ? `${name}` : ""}
											labelLine={false}
										>
											{stats.genres.map((entry, index) => (
												<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
											))}
										</Pie>
										<Tooltip content={<CustomTooltip />} />
										<Legend 
											verticalAlign="bottom" 
											height={36} 
											iconType="circle"
											iconSize={8}
											wrapperStyle={{ fontSize: "11px", color: "#9ca3af", paddingTop: "10px" }}
										/>
									</PieChart>
								</ResponsiveContainer>
							)}
						</div>
					</div>

					{/* Leaderboard Column (Span 2) */}
					<div className="lg:col-span-2 bg-gray-900 border border-gray-800/80 rounded-2xl p-6 shadow-xl flex flex-col">
						<h3 className="font-extrabold text-xl text-white mb-1">Genre Leaderboard</h3>
						<p className="text-xs text-gray-500 mb-6">Relative frequencies of saved items</p>

						<div className="space-y-4 flex-grow overflow-y-auto max-h-[320px] pr-1.5 custom-scrollbar">
							{hasGenresData ? (
								stats.genres.map((genre, index) => {
									const percentage = Math.round((genre.count / stats.totalItems) * 100);
									const barColor = COLORS[index % COLORS.length];

									return (
										<div key={genre.name} className="flex flex-col">
											<div className="flex items-center justify-between text-xs mb-1.5">
												<span className="font-semibold text-white flex items-center gap-2">
													<span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: barColor }}></span>
													{genre.name}
												</span>
												<span className="text-gray-400 font-bold">
													{genre.count} {genre.count === 1 ? "title" : "titles"} ({percentage}%)
												</span>
											</div>
											<div className="w-full h-2 bg-gray-850 rounded-full overflow-hidden">
												<div
													className="h-full rounded-full transition-all duration-500"
													style={{
														width: `${percentage}%`,
														backgroundColor: barColor,
													}}
												></div>
											</div>
										</div>
									);
								})
							) : (
								<p className="text-gray-500 text-sm text-center py-10">No genres found</p>
							)}
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
