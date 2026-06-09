"use client";

export default function SearchBar({ searchQuery, setSearchQuery, handleSearch, clearSearch }) {
	return (
		<form onSubmit={handleSearch} className="mb-10 max-w-xl mx-auto flex gap-3">
			<input
				type="text"
				placeholder="Search movies..."
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				className="flex-grow px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:border-blue-500 transition"
			/>
			<button
				type="submit"
				className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow transition"
			>
				Search
			</button>
			{searchQuery && (
				<button
					type="button"
					onClick={clearSearch}
					className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
				>
					Clear
				</button>
			)}
		</form>
	);
}