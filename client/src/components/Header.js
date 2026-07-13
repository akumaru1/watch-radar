"use client";
import Link from "next/link";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";

export default function Header() {
	return (
		<header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 border-b border-gray-800 pb-6">
			<div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
				<Link href="/" className="text-4xl font-extrabold text-blue-400 hover:text-blue-300 transition-colors">
					Watch Radar
				</Link>
				<nav className="flex items-center gap-6">
					<Link href="/" className="text-gray-300 hover:text-white font-medium text-sm transition-colors">
						Discovery
					</Link>
					<Link href="/watchlist" className="text-gray-300 hover:text-white font-medium text-sm transition-colors">
						Watchlist
					</Link>
					<Link href="/genre-dna" className="text-gray-300 hover:text-white font-medium text-sm transition-colors">
						Genre DNA
					</Link>
				</nav>
			</div>
			<div className="flex items-center gap-4">
				<Show when="signed-out">
					<SignInButton mode="modal">
						<button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition duration-200 text-white font-medium rounded-lg text-sm shadow-md shadow-blue-900/30 cursor-pointer">
							Sign In
						</button>
					</SignInButton>
					<SignUpButton mode="modal">
						<button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 transition duration-200 text-white font-medium rounded-lg text-sm border border-gray-700 shadow-sm cursor-pointer">
							Sign Up
						</button>
					</SignUpButton>
				</Show>
				<Show when="signed-in">
					<UserButton afterSignOutUrl="/" />
				</Show>
			</div>
		</header>
	);
}
