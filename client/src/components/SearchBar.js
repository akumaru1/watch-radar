"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SearchBarInput({ searchQuery: propQuery, setSearchQuery: propSetQuery, handleSearch: propHandleSearch, clearSearch: propClearSearch }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const initialQuery = searchParams ? (searchParams.get("q") || "") : "";
	const [query, setQuery] = useState(propQuery !== undefined ? propQuery : initialQuery);

	useEffect(() => {
		if (propQuery !== undefined) {
			setQuery(propQuery);
		} else if (searchParams) {
			const urlQuery = searchParams.get("q") || "";
			setQuery(urlQuery);
		}
	}, [searchParams, propQuery]);

	const onSubmit = (e) => {
		if (e) e.preventDefault();
		if (propHandleSearch) {
			propHandleSearch(e);
			return;
		}
		if (query.trim()) {
			router.push(`/?q=${encodeURIComponent(query.trim())}`);
		} else {
			router.push("/");
		}
	};

	const onClear = () => {
		setQuery("");
		if (propSetQuery) {
			propSetQuery("");
		}
		if (propClearSearch) {
			propClearSearch();
		} else {
			router.push("/");
		}
	};

	const onChange = (e) => {
		const val = e.target.value;
		setQuery(val);
		if (propSetQuery) {
			propSetQuery(val);
		}
	};

	return (
		<form onSubmit={onSubmit} className="relative flex items-center w-36 sm:w-64 max-w-xs">
			<input
				type="text"
				placeholder="Search movies..."
				value={query}
				onChange={onChange}
				className="w-full pl-9 pr-8 py-1.5 text-sm bg-gray-800/90 text-white placeholder-gray-400 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
			/>
			<div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
			</div>
			{query && (
				<button
					type="button"
					onClick={onClear}
					className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-0.5 rounded-full transition"
					aria-label="Clear search"
				>
					<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			)}
		</form>
	);
}

export default function SearchBar(props) {
	return (
		<Suspense fallback={
			<div className="relative flex items-center w-36 sm:w-64 max-w-xs">
				<input
					type="text"
					placeholder="Search movies..."
					disabled
					className="w-full pl-9 pr-8 py-1.5 text-sm bg-gray-800/90 text-white placeholder-gray-400 rounded-lg border border-gray-700 opacity-50 cursor-not-allowed"
				/>
			</div>
		}>
			<SearchBarInput {...props} />
		</Suspense>
	);
}