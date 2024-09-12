"use client";

import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState(null);
	const router = useRouter();

	const handleSignUp = async (e) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		try {
			await createUserWithEmailAndPassword(auth, email, password);
			router.push("/dashboard"); // Redirect to the dashboard after successful sign-up
		} catch (error) {
			setError(error.message);
		}
	};

	return (
		<div className="flex justify-center items-center min-h-screen bg-gray-100">
			<div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow">
				<h2 className="text-2xl font-bold text-center">Sign Up</h2>
				{error && <p className="text-red-500">{error}</p>}
				<form onSubmit={handleSignUp} className="space-y-4">
					<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium text-gray-700">
							Email address
						</label>
						<input
							id="email"
							name="email"
							type="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
						/>
					</div>
					<div>
						<label
							htmlFor="password"
							className="block text-sm font-medium text-gray-700">
							Password
						</label>
						<input
							id="password"
							name="password"
							type="password"
							required
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
						/>
					</div>
					<div>
						<label
							htmlFor="confirm-password"
							className="block text-sm font-medium text-gray-700">
							Confirm Password
						</label>
						<input
							id="confirm-password"
							name="confirm-password"
							type="password"
							required
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
						/>
					</div>
					<button
						type="submit"
						className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
						Sign Up
					</button>
				</form>
				<p className="mt-4 text-sm text-center">
					Already have an account?{" "}
					<a
						href="/login"
						className="font-medium text-indigo-600 hover:text-indigo-500">
						Log in
					</a>
				</p>
			</div>
		</div>
	);
}
