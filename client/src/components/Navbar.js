"use client";
import Link from "next/link";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import SearchBar from "./SearchBar";

export default function Navbar() {
	return (
		<nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-50 py-4">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
				{/* Left side: Logo + Navigation Links */}
				<div className="flex items-center gap-6">
					<Link href="/" className="text-2xl sm:text-3xl font-extrabold text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap">
						Watch Radar
					</Link>
					<div className="flex items-center gap-6">
						<Link href="/watchlist" className="text-gray-300 hover:text-white font-medium text-sm transition-colors">
							Watchlist
						</Link>
						<Link href="/genre-dna" className="text-gray-300 hover:text-white font-medium text-sm transition-colors">
							Genre DNA
						</Link>
					</div>
				</div>

				{/* Right side: Search input + User logo / Account avatar */}
				<div className="flex items-center gap-4">
					<SearchBar />
					<Show when="signed-out">
						<div className="flex items-center gap-2">
							<SignInButton mode="modal">
								<button className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 transition duration-200 text-white font-medium rounded-lg text-sm shadow-md shadow-blue-900/30 cursor-pointer">
									Sign In
								</button>
							</SignInButton>
							<SignUpButton mode="modal">
								<button className="px-3.5 py-1.5 bg-gray-800 hover:bg-gray-700 transition duration-200 text-white font-medium rounded-lg text-sm border border-gray-700 shadow-sm cursor-pointer">
									Sign Up
								</button>
							</SignUpButton>
						</div>
					</Show>
					<Show when="signed-in">
						<UserButton afterSignOutUrl="/" />
					</Show>
				</div>
			</div>
		</nav>
	);
}
